const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const { generatePersonaResponse } = require('../src/enhancedBehaviorEngine');
const avatarService = require('../services/avatarService');

// Database connection
const pool = new Pool({
  user: 'arun.murugesan',
  host: 'localhost',
  database: 'avinci',
  port: 5432,
});

// Store active SSE streams with enhanced metadata
const streams = new Map();

/**
 * POST /enhanced-chat/sessions
 * Create new enhanced chat session with persona context
 */
router.post('/sessions', async (req, res) => {
  try {
    const { agent_id, context = {} } = req.body;
    
    if (!agent_id) {
      return res.status(400).json({ error: 'Agent ID is required' });
    }
    
    // Verify agent exists and is active
    const agentQuery = 'SELECT * FROM ai_agents WHERE id = $1 AND is_active = $2';
    const agentResult = await pool.query(agentQuery, [agent_id, true]);
    
    if (agentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Agent not found or not active' });
    }
    
    const agent = agentResult.rows[0];
    
    // Create session with enhanced metadata
    const sessionQuery = `
      INSERT INTO sessions (agent_id, status, summary_checkpoint) 
      VALUES ($1, $2, $3) 
      RETURNING id, created_at
    `;
    const sessionResult = await pool.query(sessionQuery, [
      agent_id, 
      'open', 
      JSON.stringify({
        persona_name: agent.name,
        persona_role: agent.occupation,
        context: context,
        created_at: new Date().toISOString()
      })
    ]);
    const sessionId = sessionResult.rows[0].id;
    
    res.json({
      success: true,
      session_id: sessionId,
      sse_url: `/api/enhanced-chat/stream/${sessionId}`,
      agent: {
        id: agent.id,
        name: agent.name,
        occupation: agent.occupation,
        location: agent.location,
        communication_style: agent.communication_style,
        emotional_profile: agent.emotional_profile
      },
      context: context
    });
    
  } catch (error) {
    console.error('Error creating enhanced session:', error);
    res.status(500).json({ error: 'Failed to create session', details: error.message });
  }
});

/**
 * GET /enhanced-chat/stream/:session_id
 * Enhanced SSE endpoint with persona-aware streaming
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
  
  // Store stream reference with metadata
  streams.set(session_id, {
    response: res,
    created_at: new Date(),
    message_count: 0
  });
  
  // Send ready event with persona info
  res.write(`event: ready\ndata: ${JSON.stringify({
    session_id: session_id,
    status: 'connected',
    timestamp: new Date().toISOString()
  })}\n\n`);
  
  // Handle client disconnect
  req.on('close', () => {
    const streamData = streams.get(session_id);
    if (streamData) {
      console.log(`Enhanced session ${session_id} closed after ${streamData.message_count} messages`);
    }
    streams.delete(session_id);
  });
  
  req.on('error', (error) => {
    console.error('Enhanced SSE stream error:', error);
    streams.delete(session_id);
  });
});

/**
 * POST /enhanced-chat/messages
 * Send message and get enhanced AI response via SSE
 */
router.post('/messages', async (req, res) => {
  try {
    const { session_id, user_text, context = {} } = req.body;
    
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
    
    // Get recent message history (last 15 messages for better context)
    const historyQuery = `
      SELECT role, content, emotion, created_at 
      FROM messages 
      WHERE session_id = $1 
      ORDER BY created_at DESC 
      LIMIT 15
    `;
    const historyResult = await pool.query(historyQuery, [session_id]);
    const messageHistory = historyResult.rows.reverse();
    
    // Store user message
    const insertMessageQuery = `
      INSERT INTO messages (session_id, role, content, emotion) 
      VALUES ($1, $2, $3, $4) 
      RETURNING id
    `;
    const userEmotion = detectEmotion(user_text, agent);
    await pool.query(insertMessageQuery, [session_id, 'user', user_text, userEmotion]);
    
    // Get SSE stream
    const streamData = streams.get(session_id);
    if (streamData) {
      streamData.message_count++;
      streamData.response.write(`event: typing_start\ndata: ${JSON.stringify({
        persona: agent.name,
        emotion: userEmotion,
        timestamp: new Date().toISOString()
      })}\n\n`);
    }
    
    // Enhanced context for persona response
    const enhancedContext = {
      conversationLength: messageHistory.length,
      timeOfDay: new Date().getHours() < 18 ? 'day' : 'night',
      previousMessage: messageHistory[messageHistory.length - 1]?.content,
      isConfused: user_text.toLowerCase().includes('?') || user_text.toLowerCase().includes('confused'),
      ...context
    };
    
    // Generate enhanced persona response
    const responseData = await generatePersonaResponse(agent, user_text, messageHistory, enhancedContext);
    
    // Store assistant message after delay
    setTimeout(async () => {
      try {
        // Store assistant message
        await pool.query(insertMessageQuery, [session_id, 'assistant', responseData.content, responseData.emotion]);
        
        // Update session last activity
        await pool.query('UPDATE sessions SET last_activity = NOW() WHERE id = $1', [session_id]);
        
        // Send enhanced response via SSE
        if (streamData) {
          // Send typing stop
          streamData.response.write(`event: typing_stop\ndata: ${JSON.stringify({
            persona: agent.name,
            timestamp: new Date().toISOString()
          })}\n\n`);
          
          // Send message with enhanced metadata
          streamData.response.write(`event: message\ndata: ${JSON.stringify({
            role: 'assistant',
            content: responseData.content,
            delay_ms: responseData.delay,
            emotion: responseData.emotion,
            persona: {
              name: agent.name,
              occupation: agent.occupation,
              communication_style: agent.communication_style
            },
            timestamp: new Date().toISOString()
          })}\n\n`);
        }
      } catch (error) {
        console.error('Error storing/sending enhanced response:', error);
        if (streamData) {
          streamData.response.write(`event: error\ndata: ${JSON.stringify({ 
            error: 'Failed to process response',
            persona: agent.name 
          })}\n\n`);
        }
      }
    }, responseData.delay);
    
    res.json({ 
      success: true, 
      accepted: true,
      estimated_delay: responseData.delay,
      persona: agent.name
    });
    
  } catch (error) {
    console.error('Error processing enhanced message:', error);
    res.status(500).json({ error: 'Failed to process message', details: error.message });
  }
});

/**
 * GET /enhanced-chat/sessions/:session_id/messages
 * Get enhanced message history for a session
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
      count: result.rows.length,
      session_id: session_id
    });
    
  } catch (error) {
    console.error('Error fetching enhanced messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages', details: error.message });
  }
});

/**
 * PATCH /enhanced-chat/sessions/:session_id/close
 * Close an enhanced chat session
 */
router.patch('/sessions/:session_id/close', async (req, res) => {
  try {
    const { session_id } = req.params;
    
    const query = 'UPDATE sessions SET status = $1 WHERE id = $2 RETURNING *';
    const result = await pool.query(query, ['closed', session_id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Close SSE stream with enhanced metadata
    const streamData = streams.get(session_id);
    if (streamData) {
      streamData.response.write(`event: session_closed\ndata: ${JSON.stringify({
        session_id: session_id,
        total_messages: streamData.message_count,
        duration: Date.now() - streamData.created_at.getTime(),
        timestamp: new Date().toISOString()
      })}\n\n`);
      streamData.response.end();
      streams.delete(session_id);
    }
    
    res.json({ 
      success: true, 
      message: 'Enhanced session closed',
      session_id: session_id
    });
    
  } catch (error) {
    console.error('Error closing enhanced session:', error);
    res.status(500).json({ error: 'Failed to close session', details: error.message });
  }
});

/**
 * GET /enhanced-chat/personas
 * Get available personas for enhanced chat with rich data
 */
router.get('/personas', async (req, res) => {
  try {
    // Query from personas table to get rich persona data
    const query = 'SELECT * FROM personas WHERE status = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, ['active']);
    
    // Map personas data for frontend compatibility
    const personas = result.rows.map(persona => {
      return {
        id: persona.id,
        name: persona.name,
        avatar_url: persona.avatar_url,
        
        // Basic Info
        occupation: persona.occupation || 'Professional',
        title: persona.title || persona.occupation || 'Professional',
        location: persona.location || 'Unknown Location',
        company: persona.company || 'Unknown Company',
        
        // Demographics
        age: persona.age || 'Unknown',
        gender: persona.gender || 'Unknown',
        education: persona.education || 'Unknown',
        
        // Quote
        quote: persona.quote || '',
        
        // Goals & Motivations
        goals: persona.primary_goals || [],
        motivations: persona.motivations || [],
        
        // Personality
        traits: persona.personality_adjectives || [],
        values: persona.values || ['Honesty', 'Efficiency', 'Quality', 'Innovation', 'Customer focus'],
        
        // Background
        background: persona.persona_json?.background || 'No background information available yet.',
        
        // Hobbies & Interests
        hobbies: persona.hobbies || [],
        
        // Life Events
        life_events: persona.life_events || {},
        
        // Pain Points
        pain_points: persona.pain_points || [],
        frustrations: persona.frustrations || [],
        
        // Communication
        communication_style: persona.communication_style || {},
        
        // Tech & Domain
        tech_savviness: persona.tech_savviness || 'Medium',
        
        // Cultural & Social
        cultural_background: persona.cultural_background || {},
        social_context: persona.social_context || {},
        
        // Additional fields for compatibility
        personality_archetype: persona.personality_archetype,
        financial_goals: persona.financial_goals || [],
        daily_routine: persona.daily_routine || {},
        
        // Raw persona data for debugging
        raw_persona: persona
      };
    });
    
    res.json({
      success: true,
      personas: personas,
      count: personas.length
    });
    
  } catch (error) {
    console.error('Error fetching personas:', error);
    res.status(500).json({ error: 'Failed to fetch personas', details: error.message });
  }
});

/**
 * GET /enhanced-chat/personas/:id
 * Get individual persona by ID
 */
router.get('/personas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT * FROM personas 
      WHERE id = $1 AND status = 'active'
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Persona not found' });
    }
    
    const persona = result.rows[0];
    
    res.json({
      success: true,
      agent: {
        id: persona.id,
        name: persona.name,
        occupation: persona.occupation,
        title: persona.title,
        location: persona.location,
        company: persona.company,
        age: persona.age,
        gender: persona.gender,
        education: persona.education,
        quote: persona.quote,
        avatar_url: persona.avatar_url,
        communication_style: persona.communication_style,
        emotional_profile: persona.emotional_profile,
        tech_savviness: persona.tech_savviness,
        personality_archetype: persona.personality_archetype,
        traits: persona.personality_adjectives,
        values: persona.values,
        primary_goals: persona.primary_goals,
        motivations: persona.motivations,
        pain_points: persona.pain_points,
        frustrations: persona.frustrations,
        hobbies: persona.hobbies,
        daily_routine: persona.daily_routine,
        cultural_background: persona.cultural_background,
        social_context: persona.social_context,
        financial_goals: persona.financial_goals,
        master_system_prompt: persona.master_system_prompt
      }
    });
  } catch (error) {
    console.error('Error fetching persona:', error);
    res.status(500).json({ error: 'Failed to fetch persona' });
  }
});

// Helper function for emotion detection
function detectEmotion(message, persona = null) {
  const emotions = {
    'frustrated': ['frustrated', 'annoying', 'hate', 'terrible', 'awful', 'stupid', 'confusing'],
    'excited': ['excited', 'amazing', 'love', 'great', 'awesome', 'fantastic', 'perfect'],
    'confused': ['confused', 'don\'t understand', 'unclear', 'lost', 'help', 'explain'],
    'worried': ['worried', 'concerned', 'scared', 'nervous', 'anxious', 'afraid'],
    'happy': ['happy', 'good', 'nice', 'pleased', 'satisfied', 'glad']
  };

  const lowerMessage = message.toLowerCase();
  
  for (const [emotion, keywords] of Object.entries(emotions)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      return emotion;
    }
  }

  return 'neutral';
}

module.exports = router;
