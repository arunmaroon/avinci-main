/**
 * Agent Generation API - Create agents from transcripts using PersonaExtractor
 * Integrates with LangGraph for stateful chats and PostgreSQL for storage
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../models/database');
const { v4: uuidv4 } = require('uuid');
const PersonaExtractor = require('../services/personaExtractor');
const promptBuilder = require('../services/promptBuilder');
const IndianDemographicsService = require('../services/indianDemographics');

// PersonaExtractor will be initialized lazily when needed
let personaExtractor = null;

const getPersonaExtractor = () => {
    if (!personaExtractor) {
        personaExtractor = new PersonaExtractor();
    }
    return personaExtractor;
};

/**
 * POST /api/agent/generate - Generate agent from transcript
 * Body: { transcriptText, transcriptId?, demographics? }
 */
router.post('/generate', async (req, res) => {
    try {
        const { transcriptText, transcriptId, demographics = {} } = req.body;
        
        if (!transcriptText) {
            return res.status(400).json({ 
                error: 'Transcript text is required' 
            });
        }

        console.log('Generating agent from transcript...');
        
        // Generate Indian demographics if not provided
        const indianDemographics = IndianDemographicsService.generateIndianDemographics(demographics);
        
        // Extract persona using PersonaExtractor
        const personaData = await getPersonaExtractor().extractPersona(transcriptText, indianDemographics);
        
        // Create agent prompt template
        const agentPrompt = buildAgentPrompt(personaData);
        
        // Generate avatar URL
        const avatarUrl = IndianDemographicsService.generateUnsplashPhoto(personaData);
        
        // Create agent configuration
        const agentConfig = {
            id: uuidv4(),
            name: personaData.name,
            persona: personaData,
            prompt: agentPrompt,
            avatar_url: avatarUrl,
            status: 'active',
            created_at: new Date().toISOString(),
            transcript_id: transcriptId || null,
            demographics: indianDemographics
        };
        
        // Store agent in PostgreSQL
        const agentId = await saveAgent(agentConfig);
        
        console.log(`Agent generated successfully: ${agentId}`);
        
        res.status(201).json({
            success: true,
            agentId: agentId,
            agent: {
                id: agentId,
                name: agentConfig.name,
                occupation: personaData.occupation,
                location: personaData.location,
                avatar_url: avatarUrl,
                status: 'active'
            },
            message: 'Agent generated successfully'
        });
        
    } catch (error) {
        console.error('Agent generation failed:', error);
        
        // Handle specific OpenAI key error
        if (error.message.includes('API key')) {
            return res.status(500).json({
                error: 'OpenAI API key not configured',
                details: 'Please configure OPENAI_API_KEY environment variable'
            });
        }
        
        res.status(500).json({
            error: 'Agent generation failed',
            details: error.message
        });
    }
});

/**
 * GET /api/agent/generate/detailed - Get all agents with detailed personas
 */
router.get('/detailed', async (req, res) => {
    try {
        const query = 'SELECT * FROM agents ORDER BY created_at DESC';
        const result = await pool.query(query);
        
        const detailedAgents = result.rows.map(agent => 
            promptBuilder.buildDetailedPersona(agent)
        );
        
        res.json({
            success: true,
            agents: detailedAgents,
            count: detailedAgents.length
        });
    } catch (error) {
        console.error('Error fetching detailed agents:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch detailed agents' 
        });
    }
});

/**
 * GET /api/agent/generate/detailed/:id - Get detailed persona for specific agent
 */
router.get('/detailed/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const query = 'SELECT * FROM agents WHERE id = $1';
        const result = await pool.query(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                error: 'Agent not found' 
            });
        }
        
        const agent = result.rows[0];
        const detailedPersona = promptBuilder.buildDetailedPersona(agent);
        
        res.json({
            success: true,
            persona: detailedPersona
        });
    } catch (error) {
        console.error('Error fetching detailed persona:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch detailed persona' 
        });
    }
});

/**
 * GET /api/agent/generate/:id - Get agent by ID
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
        res.json({
            success: true,
            agent: {
                id: agent.id,
                name: agent.name,
                persona: agent.persona,
                prompt: agent.prompt,
                avatar_url: agent.avatar_url,
                status: agent.status,
                created_at: agent.created_at
            }
        });
        
    } catch (error) {
        console.error('Agent retrieval failed:', error);
        res.status(500).json({
            error: 'Failed to retrieve agent',
            details: error.message
        });
    }
});

/**
 * GET /api/agent/generate - List all agents
 */
router.get('/', async (req, res) => {
    try {
        const query = 'SELECT id, name, persona, avatar_url, status, created_at FROM agents ORDER BY created_at DESC';
        const result = await pool.query(query);
        
        const agents = result.rows.map(agent => ({
            id: agent.id,
            name: agent.name,
            occupation: agent.persona?.occupation || 'Unknown',
            location: agent.persona?.location || 'Unknown',
            avatar_url: agent.avatar_url,
            status: agent.status,
            created_at: agent.created_at
        }));
        
        res.json({
            success: true,
            agents: agents,
            count: agents.length
        });
        
    } catch (error) {
        console.error('Agent listing failed:', error);
        res.status(500).json({
            error: 'Failed to list agents',
            details: error.message
        });
    }
});

/**
 * Build agent prompt template for stateful chats
 */
function buildAgentPrompt(personaData) {
    const {
        name = 'Unknown',
        occupation = 'Professional',
        company = 'Unknown Company',
        location = 'Unknown Location',
        communication_style = {},
        emotional_profile = {},
        personality_traits = [],
        pain_points = [],
        goals = [],
        key_quotes = []
    } = personaData;
    
    return `You are ${name}, a ${occupation} at ${company} in ${location}.

PERSONALITY & COMMUNICATION:
- Communication style: ${communication_style?.formality || 'casual'} and ${communication_style?.sentence_length || 'medium'} sentences
- Common phrases: ${communication_style?.common_phrases?.join(', ') || 'none'}
- Personality traits: ${personality_traits?.join(', ') || 'friendly, helpful'}
- Baseline mood: ${emotional_profile?.baseline_mood || 'positive'}

GOALS & CHALLENGES:
- Goals: ${goals?.join(', ') || 'helping others, learning new things'}
- Pain points: ${pain_points?.join(', ') || 'technical difficulties, time constraints'}
- Challenges: ${personaData.challenges?.join(', ') || 'keeping up with technology'}

KEY QUOTES (your speaking style):
${key_quotes?.map(quote => `"${quote}"`).join('\n') || 'No specific quotes available'}

INSTRUCTIONS:
1. Respond as ${name} would - use their communication style and personality
2. Be authentic to their background and experiences
3. Reference their goals and pain points naturally in conversation
4. Use their common phrases and speaking patterns
5. Stay in character throughout the conversation
6. If asked about something outside your knowledge, respond as ${name} would: "I'm not sure about that, but I'd be interested to learn more."

Remember: You are ${name}, not an AI assistant. Respond as this person would.`;
}

/**
 * Save agent to database
 */
async function saveAgent(agentConfig) {
    try {
        const query = `
            INSERT INTO agents (
                id, name, persona, prompt, avatar_url, status, 
                created_at, transcript_id, demographics
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id
        `;
        
        const values = [
            agentConfig.id,
            agentConfig.name,
            JSON.stringify(agentConfig.persona),
            agentConfig.prompt,
            agentConfig.avatar_url,
            agentConfig.status,
            agentConfig.created_at,
            agentConfig.transcript_id,
            JSON.stringify(agentConfig.demographics)
        ];
        
        const result = await pool.query(query, values);
        return result.rows[0].id;
        
    } catch (error) {
        console.error('Database save failed:', error);
        throw new Error('Failed to save agent to database: ' + error.message);
    }
}

module.exports = router;
