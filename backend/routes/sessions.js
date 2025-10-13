const express = require('express');
const router = express.Router();
const axios = require('axios');

// Import database pool
const { pool } = require('../models/database');

// Mock session storage (replace with PostgreSQL)
const sessions = [];

// Helper function to get all agents
async function getAllAgents() {
    try {
        const result = await pool.query(`
            SELECT 
                id, name, occupation as role, age, gender, location,
                personality, goals, pain_points, motivations,
                sample_quote, tone, conversation_style, background_story
            FROM ai_agents
            WHERE is_active = true
            ORDER BY created_at DESC
        `);
        return result.rows;
    } catch (error) {
        console.error('Error fetching agents from database:', error);
        return [];
    }
}

/**
 * POST /api/sessions/create
 * Create a new user research session (group discussion or 1:1 interview)
 * 
 * Body:
 * - type: 'group' | '1on1'
 * - agentIds: array of agent IDs
 * - topic: string
 */
router.post('/create', async (req, res) => {
    try {
        const { type, agentIds, topic } = req.body;

        // Validation
        if (!type || !['group', '1on1'].includes(type)) {
            return res.status(400).json({ 
                error: 'Invalid session type. Must be "group" or "1on1"' 
            });
        }

        if (!agentIds || !Array.isArray(agentIds) || agentIds.length === 0) {
            return res.status(400).json({ 
                error: 'Agent IDs are required and must be a non-empty array' 
            });
        }

        if (type === 'group' && agentIds.length > 5) {
            return res.status(400).json({ 
                error: 'Group sessions limited to 5 agents maximum' 
            });
        }

        if (type === '1on1' && agentIds.length !== 1) {
            return res.status(400).json({ 
                error: '1:1 sessions require exactly one agent' 
            });
        }

        if (!topic || topic.trim().length === 0) {
            return res.status(400).json({ 
                error: 'Topic is required' 
            });
        }

        // Fetch real agent data from Agent Library
        let allAgents = [];
        try {
            allAgents = await getAllAgents();
        } catch (dbError) {
            console.log('Database not available, using localStorage fallback');
        }

        // Map agent IDs to actual agent data from ai_agents table
        const selectedAgents = agentIds.map(id => {
            const agent = allAgents.find(a => a.id === id);
            
            if (agent) {
                // Extract personality traits
                const personality = Array.isArray(agent.personality) 
                    ? agent.personality 
                    : (agent.personality?.traits || ['professional', 'thoughtful']);
                
                // Extract key quotes
                const keyQuotes = [
                    agent.sample_quote || 'I understand',
                    ...(agent.goals || []).slice(0, 1),
                    'That makes sense'
                ];

                return {
                    id: agent.id,
                    name: agent.name,
                    persona_json: {
                        name: agent.name,
                        age: agent.age || 30,
                        gender: agent.gender,
                        location: agent.location,
                        role: agent.role,
                        personality: personality,
                        key_quotes: keyQuotes,
                        goals: agent.goals || [],
                        pain_points: agent.pain_points || [],
                        motivations: agent.motivations || [],
                        tone: agent.tone || 'professional',
                        expertise: agent.role || 'General',
                        background_story: agent.background_story
                    }
                };
            }
            
            // Fallback if agent not found
            console.warn(`Agent with ID ${id} not found in database`);
            return {
                id,
                name: `Agent ${id}`,
                persona_json: {
                    name: `Agent ${id}`,
                    age: 30,
                    personality: ['professional'],
                    key_quotes: ['I see', 'Interesting'],
                    preferences: {},
                    expertise: 'General'
                }
            };
        });

        // Simulate session (mock for now - will call Python service)
        const log = await simulateSession(type, selectedAgents, topic);

        // Store session
        const session = {
            id: sessions.length + 1,
            type,
            agent_ids: agentIds,
            topic,
            log_json: log,
            status: 'completed',
            duration_minutes: Math.floor(log.length / 2),
            created_at: new Date().toISOString()
        };

        sessions.push(session);

        res.json({ 
            sessionId: session.id,
            status: 'completed',
            message: 'Session created successfully'
        });

    } catch (error) {
        console.error('Session creation error:', error);
        res.status(500).json({ 
            error: 'Failed to create session',
            details: error.message 
        });
    }
});

/**
 * GET /api/sessions/:id
 * Retrieve a session by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const sessionId = parseInt(req.params.id);
        
        // Find session (mock)
        const session = sessions.find(s => s.id === sessionId);
        
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        res.json(session);

    } catch (error) {
        console.error('Session retrieval error:', error);
        res.status(500).json({ 
            error: 'Failed to retrieve session',
            details: error.message 
        });
    }
});

/**
 * GET /api/sessions
 * List all sessions with optional filtering
 */
router.get('/', async (req, res) => {
    try {
        const { type, limit = 50 } = req.query;
        
        let filteredSessions = [...sessions];
        
        if (type) {
            filteredSessions = filteredSessions.filter(s => s.type === type);
        }
        
        // Sort by created_at descending
        filteredSessions.sort((a, b) => 
            new Date(b.created_at) - new Date(a.created_at)
        );
        
        // Limit results
        filteredSessions = filteredSessions.slice(0, parseInt(limit));

        res.json({
            sessions: filteredSessions,
            total: filteredSessions.length
        });

    } catch (error) {
        console.error('Sessions list error:', error);
        res.status(500).json({ 
            error: 'Failed to retrieve sessions',
            details: error.message 
        });
    }
});

/**
 * DELETE /api/sessions/:id
 * Delete a session
 */
router.delete('/:id', async (req, res) => {
    try {
        const sessionId = parseInt(req.params.id);
        const index = sessions.findIndex(s => s.id === sessionId);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Session not found' });
        }

        sessions.splice(index, 1);

        res.json({ 
            success: true,
            message: 'Session deleted successfully'
        });

    } catch (error) {
        console.error('Session deletion error:', error);
        res.status(500).json({ 
            error: 'Failed to delete session',
            details: error.message 
        });
    }
});

/**
 * Mock session simulator
 * TODO: Replace with Python service call
 */
async function simulateSession(type, agents, topic) {
    const log = [];
    const actions = ['*nods*', '*pauses*', '*laughs*', '*interrupts*', ''];
    
    if (type === '1on1') {
        // 1:1 Interview simulation
        const agent = agents[0].persona_json;
        
        log.push({
            speaker: 'Moderator',
            text: `Let's discuss ${topic}. What are your thoughts on this?`,
            timestamp: new Date().toISOString()
        });

        for (let i = 0; i < 5; i++) {
            // Agent response
            log.push({
                speaker: agent.name,
                text: generateResponse(agent, topic, i),
                action: actions[Math.floor(Math.random() * actions.length)],
                timestamp: new Date().toISOString()
            });

            // Follow-up question
            if (i < 4) {
                log.push({
                    speaker: 'Moderator',
                    text: generateFollowUp(topic, i),
                    timestamp: new Date().toISOString()
                });
            }
        }
    } else {
        // Group discussion simulation
        log.push({
            speaker: 'Moderator',
            text: `Welcome everyone! Today we're discussing ${topic}. Let's hear everyone's perspectives.`,
            timestamp: new Date().toISOString()
        });

        for (let i = 0; i < 10; i++) {
            const agent = agents[Math.floor(Math.random() * agents.length)].persona_json;
            
            log.push({
                speaker: agent.name,
                text: generateResponse(agent, topic, i),
                action: actions[Math.floor(Math.random() * actions.length)],
                timestamp: new Date().toISOString()
            });
        }
    }

    return log;
}

function generateResponse(agent, topic, turn) {
    const personality = agent.personality || [];
    const quotes = agent.key_quotes || [];
    const expertise = agent.expertise || 'general';
    
    const quote0 = quotes[0] || 'let me share my perspective';
    const quote1 = quotes[1] || 'What do others think?';
    const quote2 = quotes[0] || "Here's what I've learned";
    const personalityTrait = personality[0] || 'practical';
    
    const responses = [
        `I think ${topic} is really interesting. As someone with ${expertise} expertise, ${quote0}.`,
        `From my ${personalityTrait} perspective on ${topic}, I would say it depends on the context. ${quote1}`,
        `${quotes[0] || 'That makes sense'}. When it comes to ${topic}, my experience has shown that we need to consider multiple angles.`,
        `I appreciate this discussion about ${topic}. Given my background in ${expertise}, I've noticed some interesting patterns.`,
        `${quotes[1] || 'I agree'}. The key thing about ${topic} is how it impacts our daily work. We should focus on practical solutions.`,
        `Let me add to that - ${topic} is particularly important because it affects ${expertise} directly. ${quote2}.`,
        `That's a great point about ${topic}. I've been thinking about this from a ${personalityTrait} standpoint.`
    ];
    
    return responses[turn % responses.length];
}

function generateFollowUp(topic, turn) {
    const questions = [
        `Can you elaborate more on that aspect of ${topic}?`,
        `That's interesting. How do you think this applies in practice?`,
        `What challenges have you faced related to ${topic}?`,
        `How would you improve the current situation?`,
        `Any final thoughts on ${topic}?`
    ];
    
    return questions[turn % questions.length];
}

module.exports = router;

