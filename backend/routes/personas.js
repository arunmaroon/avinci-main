const express = require('express');
const router = express.Router();
const { auth, optionalAuth } = require('../middleware/auth');
const { analyzeTranscript, synthesizePersona, buildMasterPrompt } = require('../src/transcriptAnalysis');
const { pool } = require('../models/database');
const avatarService = require('../services/avatarService');
const promptBuilder = require('../services/promptBuilder');

/**
 * GET /personas?view=short
 * Returns AgentShort for grid/list rendering
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { view = 'full' } = req.query;
    
    if (view === 'short') {
      // Return minimal fields for card views
      const query = `
        SELECT 
          id, name, avatar_url, occupation as role_title, employment_type as company, location, quote,
          objectives, apprehensions,
          tech_savviness, domain_literacy, communication_style,
          is_active as status, created_at
        FROM ai_agents 
        WHERE is_active = true
        ORDER BY created_at DESC
      `;
      
      const result = await pool.query(query);
      const agentsWithAvatars = await avatarService.ensureAvatarsForAgents(result.rows);
      
      const agents = agentsWithAvatars.map(agent => ({
        id: agent.id,
        name: agent.name,
        avatar_url: agent.avatar_url,
        role_title: agent.role_title,
        company: agent.company,
        location: agent.location,
        quote: agent.quote,
        goals_preview: (agent.objectives || []).slice(0, 3),
        challenges_preview: (agent.apprehensions || []).slice(0, 3),
        gauges: {
          tech: agent.tech_savviness || 'medium',
          domain: agent.domain_literacy?.level || 'medium',
          comms: agent.communication_style?.sentence_length || 'medium'
        },
        status: agent.status,
        created_at: agent.created_at
      }));
      
      res.json({ success: true, agents });
    } else {
      // Return full agent data
      const query = 'SELECT * FROM ai_agents WHERE is_active = true ORDER BY created_at DESC';
      const result = await pool.query(query);
      const agentsWithAvatars = await avatarService.ensureAvatarsForAgents(result.rows);
      const personas = agentsWithAvatars.map(agent => promptBuilder.buildDetailedPersona(agent));
      res.json({ success: true, personas });
    }
  } catch (error) {
    console.error('Error fetching personas:', error);
    res.status(500).json({ error: 'Failed to fetch personas', details: error.message });
  }
});

/**
 * GET /personas/:id
 * Returns AgentFull with complete persona data
 */
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'SELECT * FROM ai_agents WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Persona not found' });
    }
    
    const agentRow = result.rows[0];
    const agentWithAvatar = await avatarService.ensureAgentAvatar(agentRow);
    const persona = promptBuilder.buildDetailedPersona(agentWithAvatar);
    res.json({ success: true, agent: persona });
  } catch (error) {
    console.error('Error fetching persona:', error);
    res.status(500).json({ error: 'Failed to fetch persona', details: error.message });
  }
});

/**
 * POST /personas
 * Create new persona from transcript and demographics
 */
// Protect persona creation
router.post('/', auth, async (req, res) => {
  try {
    const { transcript, demographics = {} } = req.body;
    
    if (!transcript) {
      return res.status(400).json({ error: 'Transcript is required' });
    }

    // Stage 1: Analyze transcript
    console.log('Analyzing transcript...');
    const analysis = await analyzeTranscript(transcript, demographics);
    
    // Stage 2: Synthesize persona
    console.log('Synthesizing persona...');
    const persona = synthesizePersona(analysis, demographics);
    
    // Build master system prompt
    const masterSystemPrompt = buildMasterPrompt(persona);
    
    // Generate avatar URL (placeholder for now)
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(persona.name)}&background=random&color=fff&size=200`;
    
    // Insert into database
    const insertQuery = `
      INSERT INTO ai_agents (
        name, avatar_url, occupation, employment_type, location, age, gender, education, income_range,
        demographics, traits, behaviors, objectives, needs, fears, apprehensions,
        motivations, frustrations, domain_literacy, tech_savviness,
        communication_style, speech_patterns, vocabulary_profile,
        emotional_profile, cognitive_profile, knowledge_bounds,
        quote, master_system_prompt, is_active, source_meta
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30
      ) RETURNING id
    `;
    
    const values = [
      persona.name,                    // 1
      avatarUrl,                      // 2
      persona.role_title,             // 3
      persona.company,                // 4
      persona.location,               // 5
      persona.demographics.age,       // 6
      persona.demographics.gender,    // 7
      persona.demographics.education, // 8
      persona.demographics.income_range, // 9
      JSON.stringify(persona.demographics), // 10
      JSON.stringify(persona.traits), // 11
      JSON.stringify(persona.behaviors), // 12
      persona.objectives,             // 13
      persona.needs,                  // 14
      persona.fears,                  // 15
      persona.apprehensions,          // 16
      persona.motivations,            // 17
      persona.frustrations,           // 18
      JSON.stringify(persona.domain_literacy), // 19
      persona.tech_savviness,         // 20
      JSON.stringify(persona.communication_style), // 21
      JSON.stringify(persona.speech_patterns), // 22
      JSON.stringify(persona.vocabulary_profile), // 23
      JSON.stringify(persona.emotional_profile), // 24
      JSON.stringify(persona.cognitive_profile), // 25
      JSON.stringify(persona.knowledge_bounds), // 26
      persona.quote,                  // 27
      masterSystemPrompt,             // 28
      true,                           // 29
      JSON.stringify({                // 30
        source_type: 'transcript',
        created_by: 'system',
        created_at: new Date().toISOString()
      })
    ];
    
    const result = await pool.query(insertQuery, values);
    const agentId = result.rows[0].id;
    
    // Return the created agent
    const getAgentQuery = 'SELECT * FROM ai_agents WHERE id = $1';
    const agentResult = await pool.query(getAgentQuery, [agentId]);
    
    res.status(201).json({
      success: true,
      agent: agentResult.rows[0],
      message: 'Persona created successfully from transcript'
    });
    
  } catch (error) {
    console.error('Error creating persona:', error);
    res.status(500).json({ 
      error: 'Failed to create persona from transcript', 
      details: error.message 
    });
  }
});

/**
 * PATCH /personas/:id/status
 * Update persona lifecycle status
 */
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!['active', 'sleeping', 'archived'].includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status. Must be active, sleeping, or archived' 
      });
    }
    
    const isActive = status === 'active';
    const query = 'UPDATE ai_agents SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING *';
    const result = await pool.query(query, [isActive, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Persona not found' });
    }
    
    res.json({ 
      success: true, 
      agent: result.rows[0],
      message: `Persona status updated to ${status}` 
    });
    
  } catch (error) {
    console.error('Error updating persona status:', error);
    res.status(500).json({ 
      error: 'Failed to update persona status', 
      details: error.message 
    });
  }
});

/**
 * DELETE /personas/:id
 * Soft delete persona (set to archived)
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = 'UPDATE ai_agents SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING *';
    const result = await pool.query(query, [false, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Persona not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'Persona archived successfully' 
    });
    
  } catch (error) {
    console.error('Error archiving persona:', error);
    res.status(500).json({ 
      error: 'Failed to archive persona', 
      details: error.message 
    });
  }
});

module.exports = router;
