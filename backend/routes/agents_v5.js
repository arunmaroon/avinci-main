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
const avatarService = require('../services/avatarService');

// Prevent client/proxy caching to ensure fresh agents list
router.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});

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
                    id,
                    name,
                    avatar_url,
                    occupation AS role_title,
                    employment_type AS company,
                    location,
                    sample_quote AS quote,
                    objectives,
                    fears,
                    apprehensions,
                    tech_savviness,
                    domain_literacy,
                    communication_style,
                    is_active AS status,
                    demographics,
                    created_at
                FROM ai_agents 
                WHERE is_active = true
                ORDER BY created_at DESC
            `;
            
            let result = await pool.query(query);
            // Fallback: if no ai_agents found, derive short view from legacy agents table
            if (result.rows.length === 0) {
                const legacy = await pool.query('SELECT id, name, persona, avatar_url, created_at FROM agents WHERE status = $1 ORDER BY created_at DESC', ['active']);
                if (legacy.rows.length > 0) {
                    const mapped = legacy.rows.map(row => {
                        const p = row.persona || {};
                        const comm = p.communication_style || {};
                        return {
                            id: row.id,
                            name: row.name,
                            avatar_url: row.avatar_url || '',
                            role_title: p.occupation || 'Professional',
                            occupation: p.occupation || 'Professional',
                            company: p.employment_type || 'Unknown',
                            location: p.location || 'Unknown',
                            quote: Array.isArray(p.key_quotes) && p.key_quotes[0] ? String(p.key_quotes[0]).replace(/"/g, '') : (p.quote || ''),
                            age: p.demographics?.age || null,
                            education: p.demographics?.education || null,
                            goals_preview: (p.objectives || []).slice(0, 3),
                            challenges_preview: (p.fears || []).slice(0, 3),
                            tech_savviness: p.tech_savviness || 'medium',
                            domain_literacy: p.domain_literacy?.level || 'medium',
                            english_savvy: comm.english_proficiency || 'intermediate',
                            communication_style: comm,
                            status: 'active',
                            created_at: row.created_at
                        };
                    });
                    return res.json(mapped);
                }
            }

            const agentsWithAvatars = await avatarService.ensureAvatarsForAgents(result.rows);
            const shortAgents = agentsWithAvatars.map(agent => {
                const goals = agent.objectives || [];
                const challenges = [...(agent.fears || []), ...(agent.apprehensions || [])];
                const demographics = agent.demographics || {};
                const communicationStyle = agent.communication_style || {};

                // Normalize commonly used fields for the frontend cards
                const englishSavvy = communicationStyle.english_proficiency
                    || communicationStyle.english_level
                    || agent.english_savvy
                    || calculateEnglishLiteracy(agent);

                const domainLevel = typeof agent.domain_literacy === 'string'
                    ? agent.domain_literacy
                    : (agent.domain_literacy?.level || 'medium');
                
                return {
                    id: agent.id,
                    name: agent.name,
                    avatar_url: agent.avatar_url,
                    // expose both occupation and role_title for compatibility
                    occupation: agent.role_title || agent.occupation || 'Professional',
                    role_title: agent.role_title || agent.occupation || 'Professional',
                    company: agent.company,
                    location: agent.location,
                    quote: agent.quote,
                    age: demographics.age || null,
                    education: demographics.education || null,
                    goals_preview: goals.slice(0, 3),
                    challenges_preview: challenges.slice(0, 3),
                    // top-level normalized badges used by UI
                    tech_savviness: agent.tech_savviness || 'medium',
                    domain_literacy: domainLevel,
                    english_savvy: englishSavvy,
                    gauges: {
                        tech: agent.tech_savviness || 'medium',
                        domain: domainLevel,
                        comms: communicationStyle.sentence_length || 'medium',
                        english_literacy: englishSavvy
                    },
                    // Keep full style for advanced UI
                    communication_style: communicationStyle,
                    status: agent.status,
                    created_at: agent.created_at
                };
            });
            
            res.json(shortAgents);
        } else {
            // Return full view (default) - query from agents table with proper persona data
            const query = 'SELECT * FROM agents WHERE status = $1 ORDER BY created_at DESC';
            const result = await pool.query(query, ['active']);
            const agentsWithAvatars = await avatarService.ensureAvatarsForAgents(result.rows);
            
            // Flatten the persona data for frontend compatibility
            const fullAgents = agentsWithAvatars.map(agent => {
                const persona = agent.persona || {};
                const demographics = agent.demographics || {};
                
                return {
                    id: agent.id,
                    name: agent.name,
                    avatar_url: agent.avatar_url,
                    
                    // Flatten persona data for frontend
                    occupation: persona.occupation || 'Professional',
                    title: persona.occupation || 'Professional',
                    location: persona.location || 'Unknown',
                    company: persona.employment_type || 'Unknown Company',
                    
                    // Demographics
                    age: demographics.age || null,
                    gender: demographics.gender || null,
                    education: demographics.education || null,
                    
                    // English Proficiency
                    english_proficiency: persona.communication_style?.english_proficiency || 'Unknown',
                    
        // Quote - Extract from key_quotes or use quote directly
        quote: (Array.isArray(persona.key_quotes) && persona.key_quotes.length > 0) ? 
          persona.key_quotes[0].replace(/"/g, '') : 
          (persona.quote || ''),
        
        // Goals & Motivations
        goals: persona.objectives || [],
        motivations: persona.motivations || [],
        
        // Pain Points
        pain_points: persona.fears || [],
        frustrations: persona.frustrations || [],
        
        // Personality - Extract from nested structure properly
        traits: persona.personality_traits?.adjectives || persona.personality_traits?.personality || persona.traits || [],
        values: persona.personality_traits?.values || persona.values || ['Honesty', 'Efficiency', 'Quality', 'Innovation', 'Customer focus'],
        
        // Background - Create rich background from available data
        background: (Array.isArray(persona.life_events) && persona.life_events.length > 0) ? 
          persona.life_events.map(event => event.event || event).join(', ') : 
          (persona.cultural_background || persona.background || 'No background information available yet.'),
        
        // Hobbies & Interests
        hobbies: persona.hobbies || persona.interests || [],
        
        // Life Events
        life_events: Array.isArray(persona.life_events) ? persona.life_events : [],
                    
                    // Voice & Communication
                    voice: {
                        speaking_style: persona.speech_patterns?.sentence_length || 'medium',
                        common_phrases: persona.speech_patterns?.common_phrases || [],
                        tone: persona.communication_style?.tone || 'professional'
                    },
                    
                    // Technology
                    technology: {
                        devices: persona.technology?.devices || ['Smartphone', 'Laptop', 'Tablet'],
                        apps: persona.technology?.apps || ['WhatsApp', 'Gmail', 'Google Chrome', 'Microsoft Office']
                    },
                    
                    // Daily Life
                    daily_routine: persona.daily_routine || [],
                    behaviors: persona.behaviors || {},
                    
                    // Cultural Background
                    cultural_background: persona.cultural_background || {},
                    
                    // Decision Making
                    decision_making: persona.decision_making || { style: 'Pragmatic' },
                    
                    // Status
                    status: agent.status,
                    created_at: agent.created_at,
                    updated_at: agent.updated_at,
                    
                    // Raw data for advanced features
                    raw_persona: persona,
                    demographics: demographics
                };
            });
            
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
        
        const query = 'SELECT * FROM ai_agents WHERE id = $1';
        const result = await pool.query(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Agent not found' });
        }
        
        const agentRow = result.rows[0];
        const agentWithAvatar = await avatarService.ensureAgentAvatar(agentRow);
        const fullAgent = promptBuilder.buildFullProfile(agentWithAvatar);
        
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
        const query = 'SELECT * FROM ai_agents WHERE id = $1';
        const result = await pool.query(query, [agentId]);
        const agentRow = result.rows[0];
        const agentWithAvatar = await avatarService.ensureAgentAvatar(agentRow);
        const fullAgent = promptBuilder.buildFullProfile(agentWithAvatar);
        
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
        
        const query = 'UPDATE ai_agents SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *';
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
 * Delete agent permanently
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log('🗑️ Attempting to delete agent with ID:', id);
        
        const query = 'DELETE FROM ai_agents WHERE id = $1 RETURNING *';
        const result = await pool.query(query, [id]);
        
        if (result.rows.length === 0) {
            console.log('❌ Agent not found with ID:', id);
            return res.status(404).json({ error: 'Agent not found' });
        }
        
        console.log('✅ Agent deleted successfully:', result.rows[0].name);
        res.json({ message: 'Agent deleted successfully', agent: result.rows[0] });
    } catch (error) {
        console.error('❌ Error deleting agent:', error);
        res.status(500).json({ error: 'Failed to delete agent', details: error.message });
    }
});

/**
 * Save agent to database
 */
async function saveAgent(personaData) {
    try {
        const agentId = uuidv4();
        
        const query = `
            INSERT INTO ai_agents (
                name, occupation, employment_type, location, demographics, traits, behaviors,
                objectives, needs, fears, apprehensions, motivations, frustrations,
                domain_literacy, tech_savviness, communication_style, speech_patterns,
                vocabulary_profile, emotional_profile, cognitive_profile, knowledge_bounds,
                quote, master_system_prompt, is_active, source_meta, avatar_url
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26
            ) RETURNING id
        `;

        const values = [
            personaData.name,                                    // 1
            personaData.role_title || 'AI Persona',             // 2
            personaData.company || 'Unknown',                   // 3
            personaData.location || 'Unknown',                  // 4
            JSON.stringify(personaData.demographics || {}),     // 5
            JSON.stringify(personaData.traits || {}),           // 6
            JSON.stringify(personaData.behaviors || {}),        // 7
            personaData.objectives || [],                       // 8
            personaData.needs || [],                            // 9
            personaData.fears || [],                            // 10
            personaData.apprehensions || [],                    // 11
            personaData.motivations || [],                      // 12
            personaData.frustrations || [],                     // 13
            JSON.stringify(personaData.domain_literacy || {}),  // 14
            personaData.tech_savviness || 'medium',             // 15
            JSON.stringify(personaData.communication_style || {}), // 16
            JSON.stringify(personaData.speech_patterns || {}),  // 17
            JSON.stringify(personaData.vocabulary_profile || {}), // 18
            JSON.stringify(personaData.emotional_profile || {}), // 19
            JSON.stringify(personaData.cognitive_profile || {}), // 20
            JSON.stringify(personaData.knowledge_bounds || {}), // 21
            personaData.quote || '',                            // 22
            personaData.master_system_prompt || '',             // 23
            (personaData.status === 'active'),                  // 24 - convert to boolean
            JSON.stringify(personaData.source_meta || {}),      // 25
            personaData.avatar_url || ''                        // 26
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
            console.log('Synthesis result is not JSON, using fallback:', e.message);
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
        const query = 'SELECT * FROM ai_agents WHERE id = $1';
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
