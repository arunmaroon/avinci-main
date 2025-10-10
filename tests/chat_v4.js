/**
 * Chat API v4 - SSE Streaming with Human-like Behavior
 * Implements real-time chat with typing indicators and persona-based responses
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../models/database');
const { v4: uuidv4 } = require('uuid');
const providerGateway = require('../services/providerGateway');
const behaviorEngine = require('../services/behaviorEngine');
const promptBuilder = require('../services/promptBuilder');

// Store active SSE streams
const streams = new Map();

/**
 * POST /sessions
 * Create a new chat session
 */
router.post('/sessions', async (req, res) => {
    try {
        const { agent_id } = req.body;
        
        if (!agent_id) {
            return res.status(400).json({ error: 'Agent ID is required' });
        }
        
        // Verify agent exists
        const agentQuery = 'SELECT * FROM agents WHERE id = $1 AND status = $2';
        const agentResult = await pool.query(agentQuery, [agent_id, 'active']);
        
        if (agentResult.rows.length === 0) {
            return res.status(404).json({ error: 'Agent not found or not active' });
        }
        
        const sessionId = uuidv4();
        
        // Create session in database
        const sessionQuery = `
            INSERT INTO sessions (id, agent_id, status) 
            VALUES ($1, $2, $3) 
            RETURNING *
        `;
        await pool.query(sessionQuery, [sessionId, agent_id, 'open']);
        
        res.json({ 
            session_id: sessionId, 
            sse_url: `/api/chat/v4/stream/${sessionId}`,
            agent: promptBuilder.buildFullProfile(agentResult.rows[0])
        });
    } catch (error) {
        console.error('Error creating session:', error);
        res.status(500).json({ error: 'Failed to create session' });
    }
});

/**
 * GET /stream/:session_id
 * SSE endpoint for real-time chat streaming
 */
router.get('/stream/:session_id', (req, res) => {
    const { session_id } = req.params;
    
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');
    
    // Send initial connection event
    res.write(`event: ready\ndata: {}\n\n`);
    
    // Store the response stream
    streams.set(session_id, res);
    
    // Handle client disconnect
    req.on('close', () => {
        console.log(`Client disconnected from session ${session_id}`);
        streams.delete(session_id);
    });
    
    // Send keep-alive every 30 seconds
    const keepAlive = setInterval(() => {
        if (streams.has(session_id)) {
            res.write(`event: ping\ndata: {}\n\n`);
        } else {
            clearInterval(keepAlive);
        }
    }, 30000);
});

/**
 * POST /messages
 * Send a message and get AI response with SSE streaming
 */
router.post('/messages', async (req, res) => {
    try {
        const { session_id, user_text } = req.body;
        
        if (!session_id || !user_text) {
            return res.status(400).json({ error: 'Session ID and user text are required' });
        }
        
        // Get session and agent data
        const sessionQuery = `
            SELECT s.*, a.* 
            FROM sessions s 
            JOIN agents a ON s.agent_id = a.id 
            WHERE s.id = $1 AND s.status = 'open'
        `;
        const sessionResult = await pool.query(sessionQuery, [session_id]);
        
        if (sessionResult.rows.length === 0) {
            return res.status(404).json({ error: 'Session not found or closed' });
        }
        
        const session = sessionResult.rows[0];
        const agent = promptBuilder.buildFullProfile(session);
        
        // Get conversation history
        const historyQuery = `
            SELECT role, content, created_at 
            FROM messages 
            WHERE session_id = $1 
            ORDER BY created_at DESC 
            LIMIT 10
        `;
        const historyResult = await pool.query(historyQuery, [session_id]);
        const history = historyResult.rows.reverse();
        
        // Save user message
        const userMessageId = uuidv4();
        const saveUserMessageQuery = `
            INSERT INTO messages (id, session_id, role, content) 
            VALUES ($1, $2, $3, $4)
        `;
        await pool.query(saveUserMessageQuery, [userMessageId, session_id, 'user', user_text]);
        
        // Get SSE stream
        const stream = streams.get(session_id);
        if (stream) {
            stream.write(`event: typing_start\ndata: {}\n\n`);
        }
        
        // Generate AI response
        const systemInstruction = behaviorEngine.buildSystemInstruction(agent);
        const messages = behaviorEngine.prepareMessages(systemInstruction, history, user_text);
        
        const rawResponse = await providerGateway.chat(messages, {
            temperature: behaviorEngine.tuneTemperature(agent),
            max_tokens: 300,
            top_p: 0.9,
            presence_penalty: 0.6,
            frequency_penalty: 0.5
        });
        
        // Humanize the response
        const humanizedResponse = behaviorEngine.humanize(agent, rawResponse);
        
        // Compute realistic delay
        const delay = behaviorEngine.computeDelay(agent, user_text, humanizedResponse);
        
        // Generate emotion
        const emotion = behaviorEngine.generateEmotion(agent, user_text, humanizedResponse);
        
        // Simulate typing delay
        setTimeout(async () => {
            if (stream) {
                stream.write(`event: typing_stop\ndata: {}\n\n`);
                stream.write(`event: message\ndata: ${JSON.stringify({
                    role: 'assistant',
                    content: humanizedResponse,
                    delay_ms: delay,
                    emotion: emotion
                })}\n\n`);
            }
            
            // Save assistant message
            const assistantMessageId = uuidv4();
            const saveAssistantMessageQuery = `
                INSERT INTO messages (id, session_id, role, content, emotion, response_delay_ms) 
                VALUES ($1, $2, $3, $4, $5, $6)
            `;
            await pool.query(saveAssistantMessageQuery, [
                assistantMessageId, 
                session_id, 
                'assistant', 
                humanizedResponse, 
                emotion, 
                delay
            ]);
            
            // Update session last activity
            const updateSessionQuery = `
                UPDATE sessions 
                SET last_activity = NOW() 
                WHERE id = $1
            `;
            await pool.query(updateSessionQuery, [session_id]);
            
        }, delay);
        
        res.json({ accepted: true, delay_ms: delay });
        
    } catch (error) {
        console.error('Error processing message:', error);
        
        // Send error via SSE if stream exists
        const stream = streams.get(req.body.session_id);
        if (stream) {
            stream.write(`event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`);
        }
        
        res.status(500).json({ error: 'Failed to process message: ' + error.message });
    }
});

/**
 * GET /sessions/:session_id/messages
 * Get conversation history for a session
 */
router.get('/sessions/:session_id/messages', async (req, res) => {
    try {
        const { session_id } = req.params;
        const { limit = 50 } = req.query;
        
        const query = `
            SELECT id, role, content, emotion, response_delay_ms, created_at 
            FROM messages 
            WHERE session_id = $1 
            ORDER BY created_at ASC 
            LIMIT $2
        `;
        
        const result = await pool.query(query, [session_id, limit]);
        res.json(result.rows);
        
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

/**
 * PATCH /sessions/:session_id
 * Update session status (close, pause, etc.)
 */
router.patch('/sessions/:session_id', async (req, res) => {
    try {
        const { session_id } = req.params;
        const { status } = req.body;
        
        if (!['open', 'paused', 'closed'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        
        const query = 'UPDATE sessions SET status = $1, last_activity = NOW() WHERE id = $2 RETURNING *';
        const result = await pool.query(query, [status, session_id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Session not found' });
        }
        
        // Close SSE stream if session is closed
        if (status === 'closed') {
            const stream = streams.get(session_id);
            if (stream) {
                stream.write(`event: session_closed\ndata: {}\n\n`);
                stream.end();
                streams.delete(session_id);
            }
        }
        
        res.json(result.rows[0]);
        
    } catch (error) {
        console.error('Error updating session:', error);
        res.status(500).json({ error: 'Failed to update session' });
    }
});

/**
 * DELETE /sessions/:session_id
 * Close and archive a session
 */
router.delete('/sessions/:session_id', async (req, res) => {
    try {
        const { session_id } = req.params;
        
        // Close session
        const query = 'UPDATE sessions SET status = $1, last_activity = NOW() WHERE id = $2';
        await pool.query(query, ['closed', session_id]);
        
        // Close SSE stream
        const stream = streams.get(session_id);
        if (stream) {
            stream.write(`event: session_closed\ndata: {}\n\n`);
            stream.end();
            streams.delete(session_id);
        }
        
        res.json({ message: 'Session closed successfully' });
        
    } catch (error) {
        console.error('Error closing session:', error);
        res.status(500).json({ error: 'Failed to close session' });
    }
});

module.exports = router;
