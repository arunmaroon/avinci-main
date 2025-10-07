/**
 * Enhanced Agents API v5 - Short and Full Persona Views
 * Implements detailed persona system with transcript-grounded AI agents
 */

const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const router = express.Router();
const { pool } = require('../models/database');
const { v4: uuidv4 } = require('uuid');
const providerGateway = require('../services/providerGateway');
const behaviorEngine = require('../services/behaviorEngine');
const promptBuilder = require('../services/promptBuilder');
const IndianDemographicsService = require('../services/indianDemographics');

// Configure multer for PDF uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'), false);
        }
    }
});

/**
 * Calculate English literacy based on education and communication style
 */
function calculateEnglishLiteracy(agent) {
    const education = agent.demographics?.education || '';
    const commStyle = agent.communication_style?.formality || 'medium';
    
    // Higher education = better English literacy
    if (education.includes('PhD') || education.includes('Master') || education.includes('MBA')) {
        return 'high';
    } else if (education.includes('Bachelor') || education.includes('B.Tech') || education.includes('BBA')) {
        return 'medium';
    } else if (education.includes('Diploma') || education.includes('12th')) {
        return 'low';
    } else {
        return 'basic';
    }
}

/**
 * GET /agents?view=short
 * Returns AgentShort for grid/list rendering
 */
router.get('/', async (req, res) => {
    try {
        const { view = 'full' } = req.query;
        
        if (view === 'short') {
            // Return short view for card rendering
            const query = `
                SELECT 
                    id, name, avatar_url, role_title, company, location, quote,
                    objectives, fears, apprehensions, tech_savviness, 
                    domain_literacy, communication_style, status, demographics,
                    created_at
                FROM agents 
                WHERE status != 'archived'
                ORDER BY created_at DESC
            `;
            
            const result = await pool.query(query);
            const shortAgents = result.rows.map(agent => {
                const goals = agent.objectives || [];
                const challenges = [...(agent.fears || []), ...(agent.apprehensions || [])];
                const demographics = agent.demographics || {};
                
                return {
                    id: agent.id,
                    name: agent.name,
                    avatar_url: agent.avatar_url,
                    role_title: agent.role_title,
                    company: agent.company,
                    location: agent.location,
                    quote: agent.quote,
                    age: demographics.age || null,
                    education: demographics.education || null,
                    goals_preview: goals.slice(0, 3),
                    challenges_preview: challenges.slice(0, 3),
                    gauges: {
                        tech: agent.tech_savviness || 'medium',
                        domain: agent.domain_literacy?.level || 'medium',
                        comms: agent.communication_style?.sentence_length || 'medium',
                        english_literacy: calculateEnglishLiteracy(agent)
                    },
                    status: agent.status,
                    created_at: agent.created_at
                };
            });
            
            res.json(shortAgents);
        } else {
            // Return full view (default)
            const query = 'SELECT * FROM agents WHERE status != "archived" ORDER BY created_at DESC';
            const result = await pool.query(query);
            const fullAgents = result.rows.map(agent => promptBuilder.buildFullProfile(agent));
            res.json(fullAgents);
        }
    } catch (error) {
        console.error('Error fetching agents:', error);
        res.status(500).json({ error: 'Failed to fetch agents' });
    }
});

/**
 * GET /agents/:id
 * Returns AgentFull for detail view
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = 'SELECT * FROM agents WHERE id = $1';
        const result = await pool.query(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Agent not found' });
        }
        
        const agent = result.rows[0];
        const fullAgent = promptBuilder.buildFullProfile(agent);
        
        res.json(fullAgent);
    } catch (error) {
        console.error('Error fetching agent:', error);
        res.status(500).json({ error: 'Failed to fetch agent' });
    }
});

/**
 * POST /agents
 * Create agent from transcript and demographics
 */
router.post('/', async (req, res) => {
    try {
        const { transcript, demographics = {} } = req.body;
        const adminId = 'system'; // No auth required for testing
        
        if (!transcript) {
            return res.status(400).json({ error: 'Transcript is required' });
        }
        
        console.log('Starting two-stage agent creation pipeline...');
        
        // Generate Indian demographics if not provided
        const indianDemographics = IndianDemographicsService.generateIndianDemographics(demographics);
        console.log('Generated Indian demographics:', indianDemographics);
        
        // Stage 1: Analyze transcript for behavioral signals
        console.log('Stage 1: Extracting behavioral DNA...');
        const analysis = await providerGateway.analyzeTranscript(transcript, indianDemographics);
        console.log('Behavioral analysis completed:', analysis);
        
        // Stage 2: Synthesize persona and master system prompt
        console.log('Stage 2: Synthesizing persona...');
        const synthesisResult = await providerGateway.synthesizePersona(analysis, indianDemographics);
        console.log('Persona synthesis completed');
        
        // Parse synthesis result
        let personaData, masterSystemPrompt;
        try {
            const parsed = JSON.parse(synthesisResult);
            personaData = parsed.persona;
            masterSystemPrompt = parsed.master_system_prompt;
        } catch (e) {
            // Fallback if synthesis doesn't return JSON
            personaData = {
                name: indianDemographics.name || 'Generated Persona',
                role_title: indianDemographics.role_title || 'Professional',
                company: indianDemographics.company || 'Unknown',
                location: indianDemographics.location || 'Unknown',
                demographics: indianDemographics,
                ...analysis
            };
            masterSystemPrompt = promptBuilder.buildMasterPrompt(personaData);
        }
        
        // Generate Unsplash photo URL based on demographics
        const avatarUrl = IndianDemographicsService.generateUnsplashPhoto(indianDemographics);
        
        // Save to database
        const agentId = await saveAgent({
            ...personaData,
            master_system_prompt: masterSystemPrompt,
            avatar_url: avatarUrl,
            status: 'active'
        });
        
        console.log(`Agent created successfully: ${agentId}`);
        
        // Return full agent data
        const query = 'SELECT * FROM agents WHERE id = $1';
        const result = await pool.query(query, [agentId]);
        const agent = result.rows[0];
        const fullAgent = promptBuilder.buildFullProfile(agent);
        
        res.status(201).json(fullAgent);
        
    } catch (error) {
        console.error('Error creating agent:', error);
        res.status(500).json({ error: 'Failed to create agent: ' + error.message });
    }
});

/**
 * PATCH /agents/:id/status
 * Update agent lifecycle status
 */
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!['active', 'sleeping', 'archived'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status. Must be active, sleeping, or archived' });
        }
        
        const query = 'UPDATE agents SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *';
        const result = await pool.query(query, [status, id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Agent not found' });
        }
        
        const agent = result.rows[0];
        const fullAgent = promptBuilder.buildFullProfile(agent);
        
        res.json(fullAgent);
    } catch (error) {
        console.error('Error updating agent status:', error);
        res.status(500).json({ error: 'Failed to update agent status' });
    }
});

/**
 * DELETE /agents/:id
 * Soft delete agent (set status to archived)
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = 'UPDATE agents SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *';
        const result = await pool.query(query, ['archived', id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Agent not found' });
        }
        
        res.json({ message: 'Agent archived successfully' });
    } catch (error) {
        console.error('Error archiving agent:', error);
        res.status(500).json({ error: 'Failed to archive agent' });
    }
});

/**
 * Save agent to database
 */
async function saveAgent(personaData) {
    try {
        const agentId = uuidv4();
        
        const query = `
            INSERT INTO agents (
                name, role_title, company, location, demographics, traits, behaviors,
                objectives, needs, fears, apprehensions, motivations, frustrations,
                domain_literacy, tech_savviness, communication_style, speech_patterns,
                vocabulary_profile, emotional_profile, cognitive_profile, knowledge_bounds,
                quote, master_system_prompt, status, source_meta, avatar_url
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26
            ) RETURNING id
        `;

        const values = [
            personaData.name,
            personaData.role_title || 'AI Persona',
            personaData.company || 'Unknown',
            personaData.location || 'Unknown',
            JSON.stringify(personaData.demographics || {}),
            JSON.stringify(personaData.traits || {}),
            JSON.stringify(personaData.behaviors || {}),
            personaData.objectives || [],
            personaData.needs || [],
            personaData.fears || [],
            personaData.apprehensions || [],
            personaData.motivations || [],
            personaData.frustrations || [],
            JSON.stringify(personaData.domain_literacy || {}),
            personaData.tech_savviness || 'medium',
            JSON.stringify(personaData.communication_style || {}),
            JSON.stringify(personaData.speech_patterns || {}),
            JSON.stringify(personaData.vocabulary_profile || {}),
            JSON.stringify(personaData.emotional_profile || {}),
            JSON.stringify(personaData.cognitive_profile || {}),
            JSON.stringify(personaData.knowledge_bounds || {}),
            personaData.quote || '',
            personaData.master_system_prompt || '',
            personaData.status || 'active',
            JSON.stringify(personaData.source_meta || {}),
            personaData.avatar_url || ''
        ];

        const result = await pool.query(query, values);
        
        console.log(`Agent saved successfully: ${result.rows[0].id}`);
        return result.rows[0].id;
    } catch (error) {
        console.error('Database save failed:', error);
        throw new Error('Failed to save agent to database: ' + error.message);
    }
}

/**
 * POST /pdf-upload - Create agents from PDF file
 */
router.post('/pdf-upload', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        const adminId = 'system'; // No auth required for testing
        
        if (!file) {
            return res.status(400).json({ error: 'PDF file is required' });
        }

        console.log('Processing PDF file:', file.originalname);
        
        // Parse PDF content
        const pdfData = await pdfParse(file.buffer);
        const pdfText = pdfData.text;
        
        if (!pdfText || pdfText.trim().length === 0) {
            return res.status(400).json({ error: 'No text content found in PDF' });
        }

        console.log('PDF text extracted, length:', pdfText.length);
        
        // Generate Indian demographics for the PDF content
        const indianDemographics = IndianDemographicsService.generateIndianDemographics();
        
        // Stage 1: Analyze transcript for behavioral signals
        console.log('Stage 1: Extracting behavioral DNA from PDF...');
        const analysis = await providerGateway.analyzeTranscript({
            raw_text: pdfText,
            file_name: file.originalname
        }, indianDemographics);
        console.log('Behavioral analysis completed');
        
        // Stage 2: Synthesize persona and master system prompt
        console.log('Stage 2: Synthesizing persona...');
        const synthesisResult = await providerGateway.synthesizePersona(analysis, indianDemographics);
        console.log('Persona synthesis completed');
        
        // Parse synthesis result
        let personaData, masterSystemPrompt;
        try {
            const parsed = JSON.parse(synthesisResult);
            personaData = parsed.persona;
            masterSystemPrompt = parsed.master_system_prompt;
        } catch (e) {
            // Fallback if synthesis doesn't return JSON
            personaData = {
                name: indianDemographics.name || 'PDF Generated Persona',
                role_title: indianDemographics.role_title || 'Professional',
                company: indianDemographics.company || 'Unknown',
                location: indianDemographics.location || 'Unknown',
                demographics: indianDemographics,
                ...analysis
            };
            masterSystemPrompt = promptBuilder.buildMasterPrompt(personaData);
        }
        
        // Generate Unsplash photo URL based on demographics
        const avatarUrl = IndianDemographicsService.generateUnsplashPhoto(indianDemographics);
        
        // Save to database
        const agentId = await saveAgent({
            ...personaData,
            master_system_prompt: masterSystemPrompt,
            avatar_url: avatarUrl,
            status: 'active'
        });
        
        console.log(`Agent created successfully from PDF: ${agentId}`);
        
        // Return agent data
        const query = 'SELECT * FROM agents WHERE id = $1';
        const result = await pool.query(query, [agentId]);
        const agent = result.rows[0];
        const fullAgent = promptBuilder.buildFullProfile(agent);
        
        res.status(201).json({
            success: true,
            agents: [fullAgent],
            count: 1,
            message: 'Agent created successfully from PDF'
        });
        
    } catch (error) {
        console.error('Error processing PDF:', error);
        res.status(500).json({ 
            error: 'Failed to process PDF: ' + error.message 
        });
    }
});

module.exports = router;
