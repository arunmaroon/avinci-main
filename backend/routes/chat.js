const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const providerGateway = require('../src/providerGateway');
const { humanize, computeDelay, detectEmotion } = require('../src/behaviorEngine');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/avinci'
});

// Store active SSE streams
const streams = new Map();

/**
 * POST /chat/sessions
 * Create new chat session
 */
router.post('/sessions', async (req, res) => {
  try {
    const { agent_id } = req.body;
    
    if (!agent_id) {
      return res.status(400).json({ error: 'Agent ID is required' });
    }
    
    // Verify agent exists and is active
    const agentQuery = 'SELECT * FROM ai_agents WHERE id = $1 AND is_active = $2';
    const agentResult = await pool.query(agentQuery, [agent_id, true]);
    
    if (agentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Agent not found or not active' });
    }
    
    // Create session
    const sessionQuery = `
      INSERT INTO sessions (agent_id, status) 
      VALUES ($1, $2) 
      RETURNING id, created_at
    `;
    const sessionResult = await pool.query(sessionQuery, [agent_id, 'open']);
    const sessionId = sessionResult.rows[0].id;
    
    res.json({
      success: true,
      session_id: sessionId,
      sse_url: `/api/chat/stream/${sessionId}`,
      agent: agentResult.rows[0]
    });
    
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: 'Failed to create session', details: error.message });
  }
});

/**
 * GET /chat/stream/:session_id
 * SSE endpoint for real-time chat
 */
router.get('/stream/:session_id', (req, res) => {
  const { session_id } = req.params;
  
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');
  
  res.flushHeaders();
  
  // Store stream reference
  streams.set(session_id, res);
  
  // Send ready event
  res.write(`event: ready\ndata: {}\n\n`);
  
  // Handle client disconnect
  req.on('close', () => {
    streams.delete(session_id);
  });
  
  req.on('error', (error) => {
    console.error('SSE stream error:', error);
    streams.delete(session_id);
  });
});

/**
 * POST /chat/messages
 * Send message and get AI response via SSE
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
      JOIN ai_agents a ON s.agent_id = a.id 
      WHERE s.id = $1 AND s.status = $2
    `;
    const sessionResult = await pool.query(sessionQuery, [session_id, 'open']);
    
    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found or closed' });
    }
    
    const session = sessionResult.rows[0];
    const agent = sessionResult.rows[0];
    
    // Get recent message history (last 10 messages for context)
    const historyQuery = `
      SELECT role, content, created_at 
      FROM messages 
      WHERE session_id = $1 
      ORDER BY created_at DESC 
      LIMIT 10
    `;
    const historyResult = await pool.query(historyQuery, [session_id]);
    const messageHistory = historyResult.rows.reverse();
    
    // Store user message
    const insertMessageQuery = `
      INSERT INTO messages (session_id, role, content, emotion) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id
    `;
    const userEmotion = detectEmotion(user_text);
    await pool.query(insertMessageQuery, [session_id, 'user', user_text, userEmotion]);
    
    // Get SSE stream
    const stream = streams.get(session_id);
    if (stream) {
      stream.write(`event: typing_start\ndata: {}\n\n`);
    }
    
    // Prepare messages for AI
    const messages = [
      { role: 'system', content: agent.master_system_prompt },
      ...messageHistory.map(msg => ({ role: msg.role, content: msg.content })),
      { role: 'user', content: user_text }
    ];
    
    // Get AI response
    const rawResponse = await providerGateway.chat(messages, {
      temperature: 0.8,
      max_tokens: 280,
      top_p: 0.9,
      presence_penalty: 0.6,
      frequency_penalty: 0.5
    });
    
    // Humanize the response
    const humanizedResponse = humanize(agent, rawResponse);
    
    // Compute realistic delay
    const delay = computeDelay(agent, user_text, humanizedResponse);
    
    // Store assistant message after delay
    setTimeout(async () => {
      try {
        // Store assistant message
        await pool.query(insertMessageQuery, [session_id, 'assistant', humanizedResponse, 'neutral']);
        
        // Update session last activity
        await pool.query('UPDATE sessions SET last_activity = NOW() WHERE id = $1', [session_id]);
        
        // Send response via SSE
        if (stream) {
          stream.write(`event: typing_stop\ndata: {}\n\n`);
          stream.write(`event: message\ndata: ${JSON.stringify({
            role: 'assistant',
            content: humanizedResponse,
            delay_ms: delay,
            emotion: 'neutral'
          })}\n\n`);
        }
      } catch (error) {
        console.error('Error storing/sending response:', error);
        if (stream) {
          stream.write(`event: error\ndata: ${JSON.stringify({ error: 'Failed to process response' })}\n\n`);
        }
      }
    }, delay);
    
    res.json({ success: true, accepted: true });
    
  } catch (error) {
    console.error('Error processing message:', error);
    res.status(500).json({ error: 'Failed to process message', details: error.message });
  }
});

/**
 * GET /chat/sessions/:session_id/messages
 * Get message history for a session
 */
router.get('/sessions/:session_id/messages', async (req, res) => {
  try {
    const { session_id } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const query = `
      SELECT id, role, content, emotion, response_delay_ms, created_at
      FROM messages 
      WHERE session_id = $1 
      ORDER BY created_at ASC 
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [session_id, limit, offset]);
    
    res.json({
      success: true,
      messages: result.rows,
      count: result.rows.length
    });
    
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages', details: error.message });
  }
});

/**
 * PATCH /chat/sessions/:session_id/close
 * Close a chat session
 */
router.patch('/sessions/:session_id/close', async (req, res) => {
  try {
    const { session_id } = req.params;
    
    const query = 'UPDATE sessions SET status = $1 WHERE id = $2 RETURNING *';
    const result = await pool.query(query, ['closed', session_id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Close SSE stream
    const stream = streams.get(session_id);
    if (stream) {
      stream.write(`event: session_closed\ndata: {}\n\n`);
      stream.end();
      streams.delete(session_id);
    }
    
    res.json({ success: true, message: 'Session closed' });
    
  } catch (error) {
    console.error('Error closing session:', error);
    res.status(500).json({ error: 'Failed to close session', details: error.message });
  }
});

module.exports = router;