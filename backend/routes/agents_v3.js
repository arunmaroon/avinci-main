/**
 * Enhanced Agents API v3 - Transcript-grounded persona system
 * Implements the blueprint's two-stage pipeline for agent creation
 */

const express = require('express');
const { pool } = require('../models/database');
const AgentBuilder = require('../services/agentBuilder');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /agents/v3/from-transcript
 * Create agent from transcript using two-stage pipeline
 */
router.post('/from-transcript', authenticateToken, async (req, res) => {
    try {
        const { transcript, demographics, options = {} } = req.body;
        const adminId = req.user.userId;

        if (!transcript) {
            return res.status(400).json({ 
                error: 'Transcript data is required',
                details: 'Please provide transcript with raw_text or speaker_turns'
            });
        }

        console.log('Creating agent from transcript:', {
            transcriptLength: transcript.raw_text?.length || 0,
            demographics,
            options
        });

        // Clean and validate transcript
        const cleanedTranscript = AgentBuilder.cleanTranscript(transcript);
        AgentBuilder.validateTranscript(cleanedTranscript);

        // Process through two-stage pipeline
        const agentId = await AgentBuilder.processTranscript(
            cleanedTranscript, 
            demographics, 
            adminId
        );

        // Get the created agent
        const agent = await getAgentById(agentId);

        res.status(201).json({
            success: true,
            message: 'Agent created successfully from transcript',
            agent: {
                id: agent.id,
                name: agent.name,
                persona: agent.persona,
                status: agent.status,
                speech_patterns: agent.speech_patterns,
                emotional_profile: agent.emotional_profile,
                objectives: agent.objectives,
                real_quotes: agent.real_quotes,
                created_at: agent.created_at
            },
            pipeline: {
                stage1: 'Behavioral DNA extraction completed',
                stage2: 'Persona synthesis completed',
                embedding: 'Generated for similarity search'
            }
        });

    } catch (error) {
        console.error('Agent creation error:', error);
        res.status(500).json({
            error: 'Failed to create agent from transcript',
            details: error.message,
            stage: error.stage || 'unknown'
        });
    }
});

/**
 * GET /agents/v3
 * Get all agents with enhanced filtering
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { 
            status = 'active', 
            persona_type, 
            limit = 50, 
            offset = 0,
            search 
        } = req.query;

        let query = `
            SELECT 
                id, name, persona, status, speech_patterns, 
                emotional_profile, objectives, real_quotes,
                created_at, updated_at
            FROM agents 
            WHERE 1=1
        `;
        const params = [];
        let paramCount = 0;

        // Filter by status
        if (status && ['active', 'sleeping', 'archived'].includes(status)) {
            paramCount++;
            query += ` AND status = $${paramCount}`;
            params.push(status);
        }

        // Filter by persona type
        if (persona_type) {
            paramCount++;
            query += ` AND persona = $${paramCount}`;
            params.push(persona_type);
        }

        // Search in name, persona, or objectives
        if (search) {
            paramCount++;
            query += ` AND (
                name ILIKE $${paramCount} OR 
                persona ILIKE $${paramCount} OR 
                objectives::text ILIKE $${paramCount}
            )`;
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
                total: result.rows.length
            }
        });

    } catch (error) {
        console.error('Error fetching agents:', error);
        res.status(500).json({
            error: 'Failed to fetch agents',
            details: error.message
        });
    }
});

/**
 * GET /agents/v3/:id
 * Get agent by ID with full details
 */
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const agent = await getAgentById(id);

        if (!agent) {
            return res.status(404).json({ 
                error: 'Agent not found',
                id: id
            });
        }

        res.json({
            agent: {
                id: agent.id,
                name: agent.name,
                persona: agent.persona,
                status: agent.status,
                demographics: {
                    age: agent.age,
                    gender: agent.gender,
                    occupation: agent.occupation,
                    location: agent.location
                },
                behavioral_profile: {
                    speech_patterns: agent.speech_patterns,
                    vocabulary_profile: agent.vocabulary_profile,
                    emotional_profile: agent.emotional_profile,
                    cognitive_profile: agent.cognitive_profile
                },
                goals_and_motivations: {
                    objectives: agent.objectives,
                    needs: agent.needs,
                    fears: agent.fears,
                    apprehensions: agent.apprehensions
                },
                knowledge_and_quotes: {
                    knowledge_bounds: agent.knowledge_bounds,
                    real_quotes: agent.real_quotes
                },
                system_prompt: agent.master_system_prompt,
                created_at: agent.created_at,
                updated_at: agent.updated_at
            }
        });

    } catch (error) {
        console.error('Error fetching agent:', error);
        res.status(500).json({
            error: 'Failed to fetch agent',
            details: error.message
        });
    }
});

/**
 * PATCH /agents/v3/:id/status
 * Update agent status
 */
router.patch('/:id/status', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['active', 'sleeping', 'archived'].includes(status)) {
            return res.status(400).json({ 
                error: 'Invalid status',
                valid_statuses: ['active', 'sleeping', 'archived']
            });
        }

        const result = await pool.query(
            `UPDATE agents 
             SET status = $1, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2 
             RETURNING id, name, status, updated_at`,
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                error: 'Agent not found',
                id: id
            });
        }

        res.json({
            message: `Agent status updated to ${status}`,
            agent: result.rows[0]
        });

    } catch (error) {
        console.error('Error updating agent status:', error);
        res.status(500).json({
            error: 'Failed to update agent status',
            details: error.message
        });
    }
});

/**
 * DELETE /agents/v3/:id
 * Archive agent (soft delete)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `UPDATE agents 
             SET status = 'archived', updated_at = CURRENT_TIMESTAMP 
             WHERE id = $1 AND status != 'archived'
             RETURNING id, name, status`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                error: 'Agent not found or already archived',
                id: id
            });
        }

        res.json({
            message: 'Agent archived successfully',
            agent: result.rows[0]
        });

    } catch (error) {
        console.error('Error archiving agent:', error);
        res.status(500).json({
            error: 'Failed to archive agent',
            details: error.message
        });
    }
});

/**
 * POST /agents/v3/:id/regenerate
 * Regenerate agent from original transcript
 */
router.post('/:id/regenerate', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { options = {} } = req.body;

        // Get original agent data
        const agent = await getAgentById(id);
        if (!agent) {
            return res.status(404).json({ 
                error: 'Agent not found',
                id: id
            });
        }

        // TODO: Implement regeneration logic
        // This would involve re-running the two-stage pipeline
        // with the original transcript data

        res.json({
            message: 'Agent regeneration not yet implemented',
            agent_id: id,
            note: 'This feature will be available in a future update'
        });

    } catch (error) {
        console.error('Error regenerating agent:', error);
        res.status(500).json({
            error: 'Failed to regenerate agent',
            details: error.message
        });
    }
});

// Helper function to get agent by ID
async function getAgentById(id) {
    try {
        const result = await pool.query(
            `SELECT * FROM agents WHERE id = $1`,
            [id]
        );
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error getting agent by ID:', error);
        return null;
    }
}

module.exports = router;