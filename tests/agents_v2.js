/**
 * Enhanced Agents API v2
 * Implements transcript-grounded persona system with lifecycle management
 */

const express = require('express');
const multer = require('multer');
const { pool } = require('../models/database');
const { v4: uuidv4 } = require('uuid');
const AgentBuilder = require('../services/agentBuilder');
const { AIProviderFactory } = require('../services/aiProvider');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'text/csv',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only CSV, Excel, and text files are allowed'), false);
        }
    }
});

/**
 * POST /agents - Create agent from transcript source
 * Body: { transcript, demographics, sourceType }
 */
router.post('/', async (req, res) => {
    try {
        const { transcript, demographics, sourceType = 'transcript' } = req.body;
        const createdBy = req.user?.userId; // From auth middleware

        if (!transcript || !demographics) {
            return res.status(400).json({ 
                error: 'Transcript and demographics are required' 
            });
        }

        // Create source record
        const sourceId = await createSourceRecord({
            name: demographics.name || 'Transcript Upload',
            sourceType,
            createdBy
        });

        // Create agent using AgentBuilder
        const agentBuilder = new AgentBuilder();
        const agentData = await agentBuilder.createAgentFromTranscript({
            transcript,
            demographics,
            sourceId,
            createdBy
        });

        res.status(201).json({
            success: true,
            agent: {
                id: agentData.id,
                name: agentData.name,
                persona: agentData.persona,
                status: agentData.status,
                created_at: agentData.created_at
            }
        });
    } catch (error) {
        console.error('Agent creation failed:', error);
        res.status(500).json({ 
            error: 'Failed to create agent',
            details: error.message 
        });
    }
});

/**
 * POST /agents/from-file - Create agents from uploaded file
 */
router.post('/from-file', upload.single('file'), async (req, res) => {
    try {
        const { demographics } = req.body;
        const file = req.file;
        const createdBy = req.user?.userId;

        if (!file) {
            return res.status(400).json({ error: 'File is required' });
        }

        // Parse file content
        const transcriptData = await parseTranscriptFile(file);
        
        // Create source record
        const sourceId = await createSourceRecord({
            name: file.originalname,
            sourceType: 'file',
            filePath: file.path,
            fileSize: file.size,
            mimeType: file.mimetype,
            createdBy
        });

        // Process each transcript entry
        const agentBuilder = new AgentBuilder();
        const agents = [];

        for (const entry of transcriptData) {
            try {
                const agentData = await agentBuilder.createAgentFromTranscript({
                    transcript: entry.transcript,
                    demographics: { ...demographics, ...entry.demographics },
                    sourceId,
                    createdBy
                });
                agents.push(agentData);
            } catch (error) {
                console.error(`Failed to create agent for entry:`, error);
            }
        }

        res.status(201).json({
            success: true,
            agents: agents.map(agent => ({
                id: agent.id,
                name: agent.name,
                persona: agent.persona,
                status: agent.status
            })),
            count: agents.length
        });
    } catch (error) {
        console.error('File processing failed:', error);
        res.status(500).json({ 
            error: 'Failed to process file',
            details: error.message 
        });
    }
});

/**
 * GET /agents - List agents with filtering and search
 */
router.get('/', async (req, res) => {
    try {
        const { 
            status = 'active', 
            search, 
            persona, 
            knowledge_level,
            limit = 20, 
            offset = 0 
        } = req.query;

        let query = `
            SELECT id, name, persona, knowledge_level, language_style, 
                   emotional_range, status, created_at, updated_at
            FROM agents_v2 
            WHERE status = $1
        `;
        const params = [status];
        let paramCount = 1;

        // Add filters
        if (persona) {
            paramCount++;
            query += ` AND persona ILIKE $${paramCount}`;
            params.push(`%${persona}%`);
        }

        if (knowledge_level) {
            paramCount++;
            query += ` AND knowledge_level = $${paramCount}`;
            params.push(knowledge_level);
        }

        if (search) {
            paramCount++;
            query += ` AND (name ILIKE $${paramCount} OR master_system_prompt ILIKE $${paramCount})`;
            params.push(`%${search}%`);
        }

        query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
        params.push(parseInt(limit), parseInt(offset));

        const result = await pool.query(query, params);
        
        res.json({
            agents: result.rows,
            pagination: {
                limit: parseInt(limit),
                offset: parseInt(offset),
                count: result.rows.length
            }
        });
    } catch (error) {
        console.error('Agent listing failed:', error);
        res.status(500).json({ error: 'Failed to list agents' });
    }
});

/**
 * GET /agents/:id - Get agent details
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(`
            SELECT * FROM agents_v2 WHERE id = $1
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Agent not found' });
        }

        const agent = result.rows[0];
        
        // Remove sensitive data
        delete agent.embedding;
        
        res.json({ agent });
    } catch (error) {
        console.error('Agent retrieval failed:', error);
        res.status(500).json({ error: 'Failed to retrieve agent' });
    }
});

/**
 * PATCH /agents/:id/status - Update agent status (sleep/delete/reactivate)
 */
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reason } = req.body;
        const updatedBy = req.user?.userId;

        const validStatuses = ['active', 'sleeping', 'archived'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ 
                error: 'Invalid status. Must be one of: active, sleeping, archived' 
            });
        }

        const updateData = {
            status,
            updated_at: new Date().toISOString(),
            updated_by: updatedBy
        };

        if (status === 'archived') {
            updateData.archived_at = new Date().toISOString();
            updateData.archived_by = updatedBy;
        }

        const result = await pool.query(`
            UPDATE agents_v2 
            SET status = $1, updated_at = $2, archived_at = $3, archived_by = $4
            WHERE id = $5
            RETURNING id, name, status, updated_at
        `, [status, updateData.updated_at, updateData.archived_at, updateData.archived_by, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Agent not found' });
        }

        res.json({
            success: true,
            agent: result.rows[0],
            message: `Agent ${status} successfully`
        });
    } catch (error) {
        console.error('Status update failed:', error);
        res.status(500).json({ error: 'Failed to update agent status' });
    }
});

/**
 * POST /agents/search - Semantic search for similar agents
 */
router.post('/search', async (req, res) => {
    try {
        const { query, limit = 5 } = req.body;

        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        const agentBuilder = new AgentBuilder();
        const similarAgents = await agentBuilder.findSimilarAgents(query, limit);

        res.json({
            query,
            agents: similarAgents,
            count: similarAgents.length
        });
    } catch (error) {
        console.error('Semantic search failed:', error);
        res.status(500).json({ error: 'Failed to search agents' });
    }
});

/**
 * DELETE /agents/:id - Soft delete agent
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedBy = req.user?.userId;

        const result = await pool.query(`
            UPDATE agents_v2 
            SET status = 'archived', archived_at = CURRENT_TIMESTAMP, archived_by = $1
            WHERE id = $2 AND status != 'archived'
            RETURNING id, name
        `, [deletedBy, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Agent not found or already archived' });
        }

        res.json({
            success: true,
            message: 'Agent archived successfully',
            agent: result.rows[0]
        });
    } catch (error) {
        console.error('Agent deletion failed:', error);
        res.status(500).json({ error: 'Failed to delete agent' });
    }
});

// Helper functions

async function createSourceRecord(sourceData) {
    const query = `
        INSERT INTO agent_sources (id, name, source_type, file_path, file_size, mime_type, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
    `;

    const result = await pool.query(query, [
        uuidv4(),
        sourceData.name,
        sourceData.sourceType,
        sourceData.filePath || null,
        sourceData.fileSize || null,
        sourceData.mimeType || null,
        sourceData.createdBy
    ]);

    return result.rows[0].id;
}

async function parseTranscriptFile(file) {
    const content = file.buffer.toString('utf-8');
    const mimeType = file.mimetype;

    if (mimeType === 'text/csv') {
        return parseCSV(content);
    } else if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
        return parseExcel(content);
    } else {
        // Plain text - single transcript
        return [{
            transcript: content,
            demographics: {}
        }];
    }
}

function parseCSV(content) {
    const lines = content.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
            const values = lines[i].split(',').map(v => v.trim());
            const row = {};
            
            headers.forEach((header, index) => {
                row[header.toLowerCase()] = values[index] || '';
            });

            data.push({
                transcript: row.transcript || row.text || '',
                demographics: {
                    name: row.name || row.participant || '',
                    age: row.age ? parseInt(row.age) : null,
                    gender: row.gender || '',
                    occupation: row.occupation || '',
                    education: row.education || ''
                }
            });
        }
    }

    return data;
}

function parseExcel(content) {
    // For Excel files, we'd need a library like xlsx
    // For now, return empty array
    console.warn('Excel parsing not implemented yet');
    return [];
}

module.exports = router;
