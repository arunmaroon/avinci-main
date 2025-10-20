const express = require('express');
const router = express.Router();
const { pool } = require('../models/database');
const promptBuilder = require('../services/promptBuilder');
const avatarService = require('../services/avatarService');
const OpenAI = require('openai');

// Initialize OpenAI client
let openai = null;
const getOpenAI = () => {
    if (!openai) {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY environment variable is required');
        }
        openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
    return openai;
};

/**
 * POST /api/ai/parallel-chat - Send message to multiple agents simultaneously
 * Body: { agentIds: string[], message: string, chatHistory: object[] }
 */
router.post('/parallel-chat', async (req, res) => {
    try {
        const { agentIds, message, chatHistory = [] } = req.body;
        
        if (!agentIds || !Array.isArray(agentIds) || agentIds.length === 0) {
            return res.status(400).json({ 
                error: 'Agent IDs array is required' 
            });
        }
        
        if (!message || message.trim().length === 0) {
            return res.status(400).json({ 
                error: 'Message is required' 
            });
        }

        console.log(`🚀 Starting parallel chat with ${agentIds.length} agents`);
        const startTime = Date.now();

        // Fetch all agents in parallel
        const agentPromises = agentIds.map(async (agentId) => {
            try {
                const agent = await getAgentById(agentId);
                if (!agent) {
                    throw new Error(`Agent ${agentId} not found`);
                }
                return { agentId, agent, error: null };
            } catch (error) {
                console.error(`Error fetching agent ${agentId}:`, error);
                return { agentId, agent: null, error: error.message };
            }
        });

        const agentResults = await Promise.all(agentPromises);
        const validAgents = agentResults.filter(result => result.agent && !result.error);
        const invalidAgents = agentResults.filter(result => result.error);

        if (validAgents.length === 0) {
            return res.status(404).json({ 
                error: 'No valid agents found',
                invalidAgents: invalidAgents.map(a => ({ agentId: a.agentId, error: a.error }))
            });
        }

        console.log(`✅ Found ${validAgents.length} valid agents, ${invalidAgents.length} invalid`);

        // Generate responses from all agents in parallel
        const responsePromises = validAgents.map(async ({ agentId, agent }) => {
            try {
                const response = await generateAgentResponse(agent, message, chatHistory);
                return {
                    agentId,
                    agentName: agent.name,
                    response: response,
                    success: true,
                    timestamp: new Date().toISOString()
                };
            } catch (error) {
                console.error(`Error generating response for agent ${agentId}:`, error);
                return {
                    agentId,
                    agentName: agent.name,
                    response: `Sorry, I'm having trouble responding right now. ${error.message}`,
                    success: false,
                    error: error.message,
                    timestamp: new Date().toISOString()
                };
            }
        });

        // Wait for all responses with timeout
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Parallel chat timeout after 30 seconds')), 30000);
        });

        const responses = await Promise.race([
            Promise.all(responsePromises),
            timeoutPromise
        ]);

        const endTime = Date.now();
        const duration = endTime - startTime;

        console.log(`✅ Parallel chat completed in ${duration}ms`);

        res.json({
            success: true,
            responses: responses,
            invalidAgents: invalidAgents.map(a => ({ agentId: a.agentId, error: a.error })),
            metadata: {
                totalAgents: agentIds.length,
                successfulResponses: responses.filter(r => r.success).length,
                failedResponses: responses.filter(r => !r.success).length,
                duration: duration,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Parallel chat error:', error);
        res.status(500).json({
            error: 'Parallel chat failed',
            details: error.message
        });
    }
});

/**
 * POST /api/ai/streaming-parallel-chat - Stream responses from multiple agents
 * Body: { agentIds: string[], message: string, chatHistory: object[] }
 */
router.post('/streaming-parallel-chat', async (req, res) => {
    try {
        const { agentIds, message, chatHistory = [] } = req.body;
        
        if (!agentIds || !Array.isArray(agentIds) || agentIds.length === 0) {
            return res.status(400).json({ 
                error: 'Agent IDs array is required' 
            });
        }
        
        if (!message || message.trim().length === 0) {
            return res.status(400).json({ 
                error: 'Message is required' 
            });
        }

        // Set up Server-Sent Events
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control'
        });

        console.log(`🚀 Starting streaming parallel chat with ${agentIds.length} agents`);

        // Send initial event
        res.write(`data: ${JSON.stringify({
            type: 'start',
            message: `Starting conversation with ${agentIds.length} agents`,
            timestamp: new Date().toISOString()
        })}\n\n`);

        // Fetch all agents in parallel
        const agentPromises = agentIds.map(async (agentId) => {
            try {
                const agent = await getAgentById(agentId);
                if (!agent) {
                    throw new Error(`Agent ${agentId} not found`);
                }
                return { agentId, agent, error: null };
            } catch (error) {
                return { agentId, agent: null, error: error.message };
            }
        });

        const agentResults = await Promise.all(agentPromises);
        const validAgents = agentResults.filter(result => result.agent && !result.error);

        // Send agent status
        res.write(`data: ${JSON.stringify({
            type: 'agents_loaded',
            validAgents: validAgents.length,
            totalAgents: agentIds.length,
            timestamp: new Date().toISOString()
        })}\n\n`);

        if (validAgents.length === 0) {
            res.write(`data: ${JSON.stringify({
                type: 'error',
                message: 'No valid agents found',
                timestamp: new Date().toISOString()
            })}\n\n`);
            res.end();
            return;
        }

        // Generate responses from all agents in parallel
        const responsePromises = validAgents.map(async ({ agentId, agent }) => {
            try {
                const response = await generateAgentResponse(agent, message, chatHistory);
                
                // Send individual response as it completes
                res.write(`data: ${JSON.stringify({
                    type: 'response',
                    agentId,
                    agentName: agent.name,
                    response: response,
                    success: true,
                    timestamp: new Date().toISOString()
                })}\n\n`);
                
                return {
                    agentId,
                    agentName: agent.name,
                    response: response,
                    success: true
                };
            } catch (error) {
                console.error(`Error generating response for agent ${agentId}:`, error);
                
                // Send error response
                res.write(`data: ${JSON.stringify({
                    type: 'response',
                    agentId,
                    agentName: agent.name,
                    response: `Sorry, I'm having trouble responding right now. ${error.message}`,
                    success: false,
                    error: error.message,
                    timestamp: new Date().toISOString()
                })}\n\n`);
                
                return {
                    agentId,
                    agentName: agent.name,
                    response: `Sorry, I'm having trouble responding right now. ${error.message}`,
                    success: false,
                    error: error.message
                };
            }
        });

        // Wait for all responses
        const responses = await Promise.all(responsePromises);

        // Send completion event
        res.write(`data: ${JSON.stringify({
            type: 'complete',
            responses: responses,
            successfulResponses: responses.filter(r => r.success).length,
            failedResponses: responses.filter(r => !r.success).length,
            timestamp: new Date().toISOString()
        })}\n\n`);

        res.end();

    } catch (error) {
        console.error('Streaming parallel chat error:', error);
        res.write(`data: ${JSON.stringify({
            type: 'error',
            message: error.message,
            timestamp: new Date().toISOString()
        })}\n\n`);
        res.end();
    }
});

/**
 * Get agent by ID with full profile
 */
async function getAgentById(agentId) {
    try {
        // Try ai_agents
        let q = 'SELECT * FROM ai_agents WHERE id = $1';
        let r = await pool.query(q, [agentId]);
        let row = r.rows[0];
        if (!row) {
            // Fallback to legacy agents table
            q = 'SELECT * FROM agents WHERE id = $1';
            r = await pool.query(q, [agentId]);
            row = r.rows[0];
            if (!row) return null;
        }
        const agentWithAvatar = await avatarService.ensureAgentAvatar(row);
        const full = promptBuilder.buildFullProfile(agentWithAvatar);
        // Ensure master_system_prompt exists
        if (!full.master_system_prompt) {
            const name = full.name || 'Assistant';
            const occ = full.occupation || 'professional';
            const loc = full.location || 'India';
            full.master_system_prompt = `You are ${name}, a ${occ} from ${loc}. Be helpful, precise, and conversational. Answer based on your persona, domain literacy and tech savviness.`;
        }
        return full;
    } catch (error) {
        console.error('Error fetching agent:', error);
        return null;
    }
}
async function generateAgentResponse(agent, message, chatHistory) {
    const { master_system_prompt } = agent;
    
    if (!master_system_prompt) {
        throw new Error('Agent missing system prompt');
    }

    // Build context with chat history
    let context = master_system_prompt;
    
    if (chatHistory && chatHistory.length > 0) {
        const historyContext = chatHistory
            .slice(-10) // Last 10 messages for context
            .map(msg => {
                if (msg.type === 'user') {
                    return `User: ${msg.content}`;
                } else if (msg.type === 'agent') {
                    return `${agent.name}: ${msg.content}`;
                }
                return `System: ${msg.content}`;
            })
            .join('\n');
        
        context += `\n\nRECENT CONVERSATION CONTEXT:\n${historyContext}`;
    }

    // Add conversation style guidance
    context += `\n\nCONVERSATION STYLE GUIDELINES:
    - Be natural and conversational, like talking to a friend
    - Use casual language and expressions
    - Show genuine interest in the topic
    - Only ask questions if you genuinely need clarification or have a specific doubt
    - Do NOT end every response with questions like "What about you?" or "Where are you from?"
    - Share personal experiences or opinions
    - Be helpful and supportive
    - Use "you know", "I think", "actually", "really" naturally
    - Respond as if you're having a real conversation, not giving formal answers
    - Keep responses focused on the topic being discussed`;

    const messages = [
        {
            role: "system",
            content: context
        },
        {
            role: "user",
            content: message
        }
    ];

    const response = await getOpenAI().chat.completions.create({
        model: "gpt-4o",
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
    });

    return response.choices[0].message.content;
}

/**
 * POST /api/ai/batch-chat - Send different messages to different agents
 * Body: { conversations: [{ agentId: string, message: string, chatHistory: object[] }] }
 */
router.post('/batch-chat', async (req, res) => {
    try {
        const { conversations } = req.body;
        
        if (!conversations || !Array.isArray(conversations) || conversations.length === 0) {
            return res.status(400).json({ 
                error: 'Conversations array is required' 
            });
        }

        console.log(`🚀 Starting batch chat with ${conversations.length} conversations`);
        const startTime = Date.now();

        // Process all conversations in parallel
        const conversationPromises = conversations.map(async (conv, index) => {
            try {
                const { agentId, message, chatHistory = [] } = conv;
                
                if (!agentId || !message) {
                    throw new Error(`Conversation ${index}: Missing agentId or message`);
                }

                const agent = await getAgentById(agentId);
                if (!agent) {
                    throw new Error(`Conversation ${index}: Agent ${agentId} not found`);
                }

                const response = await generateAgentResponse(agent, message, chatHistory);
                
                return {
                    conversationIndex: index,
                    agentId,
                    agentName: agent.name,
                    message,
                    response: response,
                    success: true,
                    timestamp: new Date().toISOString()
                };
            } catch (error) {
                console.error(`Error in conversation ${index}:`, error);
                return {
                    conversationIndex: index,
                    agentId: conv.agentId || 'unknown',
                    agentName: 'Unknown',
                    message: conv.message || '',
                    response: `Error: ${error.message}`,
                    success: false,
                    error: error.message,
                    timestamp: new Date().toISOString()
                };
            }
        });

        // Wait for all conversations to complete
        const results = await Promise.all(conversationPromises);

        const endTime = Date.now();
        const duration = endTime - startTime;

        console.log(`✅ Batch chat completed in ${duration}ms`);

        res.json({
            success: true,
            conversations: results,
            metadata: {
                totalConversations: conversations.length,
                successfulConversations: results.filter(r => r.success).length,
                failedConversations: results.filter(r => !r.success).length,
                duration: duration,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Batch chat error:', error);
        res.status(500).json({
            error: 'Batch chat failed',
            details: error.message
        });
    }
});

module.exports = router;
