/**
 * Chat Routes v2 - SSE streaming with transcript-grounded personas
 * Real-time chat with human-like behavior and timing
 */

const express = require('express');
const { pool } = require('../models/database');
const { v4: uuidv4 } = require('uuid');
const providerGateway = require('../services/providerGateway');
const personaSynthesizer = require('../services/personaSynthesizer');
const behaviorEngine = require('../services/behaviorEngine');

const router = express.Router();

// Store active SSE connections
const activeConnections = new Map();

// Create a new chat session
router.post('/sessions', async (req, res) => {
    try {
        const { agent_id } = req.body;
        
        if (!agent_id) {
            return res.status(400).json({ error: 'Agent ID is required' });
        }

        // Get agent data
        const agentResult = await pool.query(
            'SELECT * FROM agents WHERE id = $1 AND status = $2',
            [agent_id, 'active']
        );

        if (agentResult.rows.length === 0) {
            return res.status(404).json({ error: 'Agent not found or inactive' });
        }

        const agent = agentResult.rows[0];
        const sessionId = uuidv4();

        // Create session in database
        await pool.query(
            'INSERT INTO sessions (id, agent_ids, status, created_at) VALUES ($1, $2, $3, $4)',
            [sessionId, [agent_id], 'active', new Date().toISOString()]
        );

        res.json({
            session_id: sessionId,
            sse_url: `/api/chat/stream/${sessionId}`,
            agent: {
                id: agent.id,
                name: agent.name,
                persona: agent.persona
            }
        });
    } catch (error) {
        console.error('Session creation failed:', error);
        res.status(500).json({ error: 'Failed to create session' });
    }
});

// SSE stream endpoint
router.get('/stream/:sessionId', async (req, res) => {
    const { sessionId } = req.params;
    
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');
    res.flushHeaders();

    // Store connection
    activeConnections.set(sessionId, res);

    // Send initial ready event
    res.write(`event: ready\ndata: ${JSON.stringify({ ok: true })}\n\n`);

    // Handle client disconnect
    req.on('close', () => {
        activeConnections.delete(sessionId);
    });

    // Keep connection alive
    const keepAlive = setInterval(() => {
        if (activeConnections.has(sessionId)) {
            res.write(`event: ping\ndata: ${JSON.stringify({ timestamp: Date.now() })}\n\n`);
        } else {
            clearInterval(keepAlive);
        }
    }, 30000);
});

// Send message and get AI response
router.post('/messages', async (req, res) => {
    try {
        const { session_id, user_text } = req.body;
        
        if (!session_id || !user_text) {
            return res.status(400).json({ error: 'Session ID and user text are required' });
        }

        // Get session and agent data
        const sessionResult = await pool.query(
            'SELECT * FROM sessions WHERE id = $1',
            [session_id]
        );

        if (sessionResult.rows.length === 0) {
            return res.status(404).json({ error: 'Session not found' });
        }

        const session = sessionResult.rows[0];
        const agentId = session.agent_ids[0];

        const agentResult = await pool.query(
            'SELECT * FROM agents WHERE id = $1',
            [agentId]
        );

        if (agentResult.rows.length === 0) {
            return res.status(404).json({ error: 'Agent not found' });
        }

        const agent = agentResult.rows[0];

        // Store user message
        const userMessageId = uuidv4();
        await pool.query(
            'INSERT INTO messages (id, session_id, role, content, created_at) VALUES ($1, $2, $3, $4, $5)',
            [userMessageId, session_id, 'user', user_text, new Date().toISOString()]
        );

        // Get conversation history (last 10 messages)
        const historyResult = await pool.query(
            'SELECT role, content FROM messages WHERE session_id = $1 ORDER BY created_at DESC LIMIT 10',
            [session_id]
        );

        const history = historyResult.rows.reverse();

        // Build master system prompt
        const masterPrompt = personaSynthesizer.buildMasterPrompt({
            name: agent.name,
            age: 30, // Default age if not available
            speech_patterns: agent.speech_patterns || {},
            vocabulary_profile: agent.vocabulary_profile || {},
            emotional_profile: agent.emotional_profile || {},
            cognitive_profile: agent.cognitive_profile || {},
            knowledge_bounds: agent.knowledge_bounds || {},
            real_quotes: agent.real_quotes || [],
            objectives: agent.objectives || [],
            needs: agent.needs || [],
            fears: agent.fears || [],
            apprehensions: agent.apprehensions || []
        });

        // Prepare messages for AI provider
        const messages = [
            { role: 'system', content: masterPrompt },
            ...history.map(msg => ({ role: msg.role, content: msg.content })),
            { role: 'user', content: user_text }
        ];

        // Get AI response
        const provider = providerGateway.getProvider();
        if (!provider) {
            return res.status(503).json({ error: 'No AI provider available' });
        }

        const rawResponse = await provider.chat(messages, {
            temperature: 0.8,
            max_tokens: 300,
            top_p: 0.9,
            presence_penalty: 0.6,
            frequency_penalty: 0.5
        });

        // Post-process response with behavior engine
        const processedResponse = behaviorEngine.postProcess({
            speech_patterns: agent.speech_patterns || {},
            vocabulary_profile: agent.vocabulary_profile || {},
            cognitive_profile: agent.cognitive_profile || {}
        }, rawResponse);

        // Compute realistic delay
        const delayMs = behaviorEngine.computeDelay({
            cognitive_profile: agent.cognitive_profile || {},
            vocabulary_profile: agent.vocabulary_profile || {}
        }, user_text, processedResponse);

        // Store AI response
        const aiMessageId = uuidv4();
        await pool.query(
            'INSERT INTO messages (id, session_id, agent_id, role, content, emotion, delay_ms, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [
                aiMessageId, 
                session_id, 
                agentId, 
                'assistant', 
                processedResponse, 
                JSON.stringify({ baseline: 'neutral' }), 
                delayMs, 
                new Date().toISOString()
            ]
        );

        // Send typing events via SSE
        const connection = activeConnections.get(session_id);
        if (connection) {
            const typingEvents = behaviorEngine.generateTypingEvents(delayMs);
            
            for (const event of typingEvents) {
                setTimeout(() => {
                    if (activeConnections.has(session_id)) {
                        connection.write(`event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`);
                    }
                }, event.delay);
            }

            // Send final message after delay
            setTimeout(() => {
                if (activeConnections.has(session_id)) {
                    connection.write(`event: message\ndata: ${JSON.stringify({
                        id: aiMessageId,
                        role: 'assistant',
                        content: processedResponse,
                        delay_ms: delayMs,
                        timestamp: new Date().toISOString()
                    })}\n\n`);
                }
            }, delayMs);
        }

        res.json({
            success: true,
            message_id: aiMessageId,
            delay_ms: delayMs
        });

    } catch (error) {
        console.error('Message processing failed:', error);
        res.status(500).json({ error: 'Failed to process message' });
    }
});

// Get session history
router.get('/sessions/:sessionId/history', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { limit = 50 } = req.query;

        const result = await pool.query(
            'SELECT id, role, content, emotion, delay_ms, created_at FROM messages WHERE session_id = $1 ORDER BY created_at ASC LIMIT $2',
            [sessionId, limit]
        );

        res.json({
            messages: result.rows,
            count: result.rows.length
        });
    } catch (error) {
        console.error('Failed to get session history:', error);
        res.status(500).json({ error: 'Failed to get session history' });
    }
});

module.exports = router;
