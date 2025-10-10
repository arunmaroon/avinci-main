/**
 * Chat V3 API - SSE Streaming with Persona System
 * Implements real-time chat with human-like behavior
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../models/database');
const BehaviorEngine = require('../services/behaviorEngine');
const { v4: uuidv4 } = require('uuid');

// Store active SSE connections
const activeStreams = new Map();

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

        const agent = agentResult.rows[0];
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
            sse_url: `/chat/v3/stream/${sessionId}`,
            agent: {
                id: agent.id,
                name: agent.name,
                role_title: agent.role_title
            }
        });

    } catch (error) {
        console.error('Error creating session:', error);
        res.status(500).json({ error: 'Failed to create session' });
    }
});

/**
 * GET /stream/:sessionId
 * SSE endpoint for real-time chat
 */
router.get('/stream/:sessionId', (req, res) => {
    const { sessionId } = req.params;

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

    // Store the response object for this session
    activeStreams.set(sessionId, res);

    // Send initial ready event
    res.write(`event: ready\ndata: {}\n\n`);

    // Handle client disconnect
    req.on('close', () => {
        console.log(`SSE connection closed for session ${sessionId}`);
        activeStreams.delete(sessionId);
    });

    // Keep connection alive
    const keepAlive = setInterval(() => {
        if (activeStreams.has(sessionId)) {
            res.write(`event: ping\ndata: {}\n\n`);
        } else {
            clearInterval(keepAlive);
        }
    }, 30000);
});

/**
 * POST /messages
 * Send a message and get AI response
 */
router.post('/messages', async (req, res) => {
    try {
        const { session_id, user_text } = req.body;

        if (!session_id || !user_text) {
            return res.status(400).json({ error: 'Session ID and user text are required' });
        }

        // Get session and agent info
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
        const agent = sessionResult.rows[0];

        // Get recent message history
        const historyQuery = `
            SELECT role, content, created_at 
            FROM messages 
            WHERE session_id = $1 
            ORDER BY created_at DESC 
            LIMIT 10
        `;
        const historyResult = await pool.query(historyQuery, [session_id]);
        const messageHistory = historyResult.rows.reverse();

        // Send typing start event
        const stream = activeStreams.get(session_id);
        if (stream) {
            stream.write(`event: typing_start\ndata: {}\n\n`);
        }

        // Generate AI response using Behavior Engine
        const response = await BehaviorEngine.generateHumanLikeResponse(
            agent,
            user_text,
            messageHistory
        );

        // Save user message
        const userMessageQuery = `
            INSERT INTO messages (session_id, role, content) 
            VALUES ($1, $2, $3)
        `;
        await pool.query(userMessageQuery, [session_id, 'user', user_text]);

        // Simulate typing delay
        setTimeout(async () => {
            // Send typing stop event
            if (stream) {
                stream.write(`event: typing_stop\ndata: {}\n\n`);
            }

            // Send AI response
            if (stream) {
                const messageData = {
                    role: 'assistant',
                    content: response.text,
                    delay_ms: response.delay_ms,
                    emotion: response.emotion
                };
                stream.write(`event: message\ndata: ${JSON.stringify(messageData)}\n\n`);
            }

            // Save AI message
            const aiMessageQuery = `
                INSERT INTO messages (session_id, role, content, emotion, response_delay_ms) 
                VALUES ($1, $2, $3, $4, $5)
            `;
            await pool.query(aiMessageQuery, [
                session_id, 
                'assistant', 
                response.text, 
                response.emotion, 
                response.delay_ms
            ]);

            // Update session last activity
            const updateQuery = `
                UPDATE sessions 
                SET last_activity = NOW() 
                WHERE id = $1
            `;
            await pool.query(updateQuery, [session_id]);

        }, Math.min(response.delay_ms, 5000)); // Cap delay at 5 seconds for UX

        res.json({ accepted: true });

    } catch (error) {
        console.error('Error processing message:', error);
        
        // Send error event to client
        const stream = activeStreams.get(req.body.session_id);
        if (stream) {
            stream.write(`event: error\ndata: ${JSON.stringify({ error: 'Failed to process message' })}\n\n`);
        }
        
        res.status(500).json({ error: 'Failed to process message' });
    }
});

/**
 * GET /sessions/:sessionId/messages
 * Get message history for a session
 */
router.get('/sessions/:sessionId/messages', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { limit = 50, offset = 0 } = req.query;

        const query = `
            SELECT id, role, content, emotion, response_delay_ms, created_at 
            FROM messages 
            WHERE session_id = $1 
            ORDER BY created_at ASC 
            LIMIT $2 OFFSET $3
        `;
        const result = await pool.query(query, [sessionId, limit, offset]);

        res.json(result.rows);

    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

/**
 * DELETE /sessions/:sessionId
 * Close a chat session
 */
router.delete('/sessions/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;

        // Close session in database
        const updateQuery = `
            UPDATE sessions 
            SET status = 'closed', last_activity = NOW() 
            WHERE id = $1
        `;
        await pool.query(updateQuery, [sessionId]);

        // Close SSE connection
        const stream = activeStreams.get(sessionId);
        if (stream) {
            stream.write(`event: session_closed\ndata: {}\n\n`);
            stream.end();
            activeStreams.delete(sessionId);
        }

        res.json({ message: 'Session closed successfully' });

    } catch (error) {
        console.error('Error closing session:', error);
        res.status(500).json({ error: 'Failed to close session' });
    }
});

module.exports = router;