const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const EnhancedPersonaExtractor = require('../services/enhancedPersonaExtractor');
const IndianDemographicsService = require('../services/indianDemographics');

// Database connection
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'avinci',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
});

// Initialize persona extractor
let personaExtractor;
try {
    personaExtractor = new EnhancedPersonaExtractor();
} catch (error) {
    console.warn('Enhanced Persona Extractor not available:', error.message);
}

// Create agents table if it doesn't exist
const createAgentsTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS enhanced_agents (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                persona_json JSONB NOT NULL,
                prompt TEXT NOT NULL,
                transcript_hash VARCHAR(255) UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(50) DEFAULT 'active',
                fintech_focus BOOLEAN DEFAULT true
            )
        `);
        console.log('Enhanced agents table created/verified');
    } catch (error) {
        console.error('Error creating enhanced agents table:', error);
    }
};

// Initialize table
createAgentsTable();

// POST /api/enhanced-agent/generate - Generate agent from transcript
router.post('/generate', async (req, res) => {
    try {
        const { transcript, demographics } = req.body;
        
        if (!transcript || transcript.trim().length === 0) {
            return res.status(400).json({ 
                error: 'Transcript text is required' 
            });
        }

        if (!personaExtractor) {
            return res.status(500).json({ 
                error: 'Persona extraction service not available' 
            });
        }

        console.log('Generating enhanced agent from transcript...');
        
        // Extract persona using enhanced extractor
        const personaData = await personaExtractor.extractPersonaFromTranscript(transcript, demographics);
        
        // Generate transcript hash for uniqueness
        const transcriptHash = require('crypto')
            .createHash('md5')
            .update(transcript)
            .digest('hex');

        // Build agent prompt using LangGraph-style template
        const agentPrompt = buildAgentPrompt(personaData);
        
        // Generate Indian demographics if not provided
        const indianDemographics = demographics || IndianDemographicsService.generateIndianDemographics();
        
        // Generate avatar
        const avatarUrl = IndianDemographicsService.generateIndianFacePhoto(indianDemographics, transcriptHash);
        
        // Save agent to database
        const agentId = await saveEnhancedAgent({
            name: personaData.name,
            persona_json: personaData,
            prompt: agentPrompt,
            transcript_hash: transcriptHash,
            avatar_url: avatarUrl
        });

        console.log(`Enhanced agent created successfully: ${agentId}`);

        res.status(201).json({
            success: true,
            agentId: agentId,
            agent: {
                id: agentId,
                name: personaData.name,
                persona: personaData,
                avatar_url: avatarUrl,
                created_at: new Date().toISOString()
            },
            message: 'Enhanced agent created successfully'
        });

    } catch (error) {
        console.error('Error generating enhanced agent:', error);
        res.status(500).json({ 
            error: 'Failed to generate enhanced agent: ' + error.message 
        });
    }
});

// GET /api/enhanced-agent/agents - Get all enhanced agents
router.get('/agents', async (req, res) => {
    try {
        const query = 'SELECT * FROM enhanced_agents WHERE status != \'archived\' ORDER BY created_at DESC';
        const result = await pool.query(query);
        
        const agents = result.rows.map(agent => ({
            id: agent.id,
            name: agent.name,
            persona: agent.persona_json,
            avatar_url: agent.avatar_url,
            status: agent.status,
            created_at: agent.created_at,
            fintech_focus: agent.fintech_focus
        }));

        res.json({
            success: true,
            agents: agents,
            count: agents.length
        });

    } catch (error) {
        console.error('Error fetching enhanced agents:', error);
        res.status(500).json({ 
            error: 'Failed to fetch enhanced agents: ' + error.message 
        });
    }
});

// GET /api/enhanced-agent/:id - Get specific enhanced agent
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = 'SELECT * FROM enhanced_agents WHERE id = $1';
        const result = await pool.query(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ 
                error: 'Enhanced agent not found' 
            });
        }

        const agent = result.rows[0];
        
        res.json({
            success: true,
            agent: {
                id: agent.id,
                name: agent.name,
                persona: agent.persona_json,
                prompt: agent.prompt,
                avatar_url: agent.avatar_url,
                status: agent.status,
                created_at: agent.created_at,
                fintech_focus: agent.fintech_focus
            }
        });

    } catch (error) {
        console.error('Error fetching enhanced agent:', error);
        res.status(500).json({ 
            error: 'Failed to fetch enhanced agent: ' + error.message 
        });
    }
});

// POST /api/enhanced-agent/usability - Run usability test
router.post('/usability', async (req, res) => {
    try {
        const { agentId, uiPath, task, uiType = 'image' } = req.body;
        
        if (!agentId || !uiPath || !task) {
            return res.status(400).json({ 
                error: 'Agent ID, UI path, and task are required' 
            });
        }

        // Get agent details
        const agentQuery = 'SELECT * FROM enhanced_agents WHERE id = $1';
        const agentResult = await pool.query(agentQuery, [agentId]);
        
        if (agentResult.rows.length === 0) {
            return res.status(404).json({ 
                error: 'Agent not found' 
            });
        }

        const agent = agentResult.rows[0];
        const persona = agent.persona_json;

        // Run usability test
        const usabilityResults = await runUsabilityTest(persona, uiPath, task, uiType);

        res.json({
            success: true,
            results: usabilityResults,
            agent: {
                name: agent.name,
                persona: persona
            }
        });

    } catch (error) {
        console.error('Error running usability test:', error);
        res.status(500).json({ 
            error: 'Failed to run usability test: ' + error.message 
        });
    }
});

// Helper function to build agent prompt
function buildAgentPrompt(personaData) {
    return `You are ${personaData.name}, a ${personaData.age}-year-old ${personaData.occupation}.

BACKGROUND:
${personaData.background}

PERSONALITY TRAITS:
${personaData.personality?.join(', ') || 'Practical, straightforward'}

COMMUNICATION STYLE:
- ${personaData.communication_style || 'casual'} and ${personaData.decision_making || 'practical'}
- Use these key phrases when appropriate: ${personaData.key_quotes?.join(', ') || 'Keep it simple'}
- Tech comfort level: ${personaData.tech_savviness || 'medium'}

FINANCIAL PREFERENCES:
- Banking style: ${personaData.fintech_preferences?.banking_style || 'mixed'}
- Payment preferences: ${personaData.fintech_preferences?.payment_preferences?.join(', ') || 'UPI, cards'}
- Risk profile: ${personaData.fintech_preferences?.investment_approach || 'moderate'}

PAIN POINTS TO ADDRESS:
${personaData.pain_points?.map(point => `- ${point}`).join('\n') || '- General usability issues'}

UI/UX PAIN POINTS:
${personaData.ui_pain_points?.map(point => `- ${point}`).join('\n') || '- Complex forms, slow loading'}

FINANCIAL GOALS:
${personaData.financial_goals?.map(goal => `- ${goal}`).join('\n') || '- Financial stability'}

CRITICAL RULES:
1. Respond EXACTLY as ${personaData.name} would - use their communication style
2. Reference their specific pain points when relevant
3. For financial queries, tie responses to their background and preferences
4. When discussing UI/UX, focus on their specific pain points
5. Use their key quotes and phrases naturally in conversation
6. Be authentic to their personality and background
7. For off-topic queries, extrapolate based on their personality and background
8. Always provide practical, relatable responses

When someone shares a UI design with you:
1. Describe what you see from your perspective
2. Identify issues based on your pain points
3. Suggest specific improvements
4. Rate the usability (1-10) and explain why
5. Focus on practical, real-world usage scenarios

Remember: You're a real person, not an AI assistant. Respond as ${personaData.name} would.`;
}

// Helper function to save enhanced agent
async function saveEnhancedAgent(agentData) {
    const query = `
        INSERT INTO enhanced_agents (name, persona_json, prompt, transcript_hash, avatar_url)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
    `;
    
    const values = [
        agentData.name,
        JSON.stringify(agentData.persona_json),
        agentData.prompt,
        agentData.transcript_hash,
        agentData.avatar_url
    ];
    
    const result = await pool.query(query, values);
    return result.rows[0].id;
}

// Helper function to run usability test
async function runUsabilityTest(persona, uiPath, task, uiType) {
    // This would integrate with your existing AI chat system
    // For now, return a simulated result
    const testResults = {
        task: task,
        agent_name: persona.name,
        step_by_step: [
            {
                step: 1,
                action: "Look at the interface",
                feedback: `As ${persona.name}, I can see this is a ${task} interface. ${persona.ui_pain_points?.[0] || 'The layout looks complex.'}`,
                rating: 6,
                suggestion: "Make the main action more prominent"
            },
            {
                step: 2,
                action: "Navigate to the form",
                feedback: `I'm looking for where to start. ${persona.personality?.includes('practical') ? 'I need clear instructions.' : 'This seems confusing.'}`,
                rating: 5,
                suggestion: "Add clear step indicators"
            },
            {
                step: 3,
                action: "Fill out required fields",
                feedback: `${persona.ui_pain_points?.[1] || 'Too many fields at once.'} ${persona.key_quotes?.[0] || 'This is overwhelming.'}`,
                rating: 4,
                suggestion: "Break into smaller steps"
            }
        ],
        overall_rating: 5,
        key_issues: persona.ui_pain_points || ['Complex navigation', 'Too many fields'],
        recommendations: [
            "Simplify the form layout",
            "Add progress indicators", 
            "Provide clear error messages"
        ],
        persona_insights: {
            communication_style: persona.communication_style,
            pain_points: persona.ui_pain_points,
            tech_comfort: persona.tech_savviness
        }
    };

    return testResults;
}

module.exports = router;
