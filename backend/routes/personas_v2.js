/**
 * Personas API v2 - Comprehensive persona management
 * Handles CRUD operations for personas with 51 UXPressia fields
 */

const express = require('express');
const router = express.Router();
const PersonaManager = require('../agents/personaManager');
const AgentGeneration = require('../agents/generation');
const { auth } = require('../middleware/auth');

const personaManager = new PersonaManager();
const agentGeneration = new AgentGeneration();

/**
 * POST /api/personas/v2
 * Create a new persona from transcript or manual input
 */
router.post('/', auth, async (req, res) => {
  try {
    const { transcript, demographics, personaData, sourceType = 'manual' } = req.body;
    const userId = req.user.id;

    let finalPersonaData;

    if (transcript) {
      // Generate persona from transcript
      const analysis = await agentGeneration.analyzeTranscript(transcript, demographics);
      const synthesizedPersona = await agentGeneration.synthesizePersona(analysis, demographics);
      const masterPrompt = await agentGeneration.generateMasterPrompt(synthesizedPersona);
      const avatarUrl = agentGeneration.generateAvatarUrl(synthesizedPersona);
      
      finalPersonaData = {
        ...synthesizedPersona,
        master_system_prompt: masterPrompt,
        avatar_url: avatarUrl
      };
    } else if (personaData) {
      // Use provided persona data
      finalPersonaData = personaData;
    } else {
      return res.status(400).json({
        error: 'Either transcript or personaData is required'
      });
    }

    const sourceMeta = {
      source_type: sourceType,
      created_by: userId,
      created_at: new Date().toISOString()
    };

    const result = await personaManager.createPersona(userId, finalPersonaData, sourceMeta);

    res.status(201).json({
      success: true,
      data: result,
      message: 'Persona created successfully'
    });

  } catch (error) {
    console.error('Error creating persona:', error);
    res.status(500).json({
      error: 'Failed to create persona',
      details: error.message
    });
  }
});

/**
 * GET /api/personas/v2
 * Get all personas for the authenticated user
 */
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      page = 1,
      limit = 20,
      status = 'active',
      search = '',
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      search,
      sortBy,
      sortOrder
    };

    const result = await personaManager.getPersonas(userId, options);

    res.json({
      success: true,
      data: result.personas,
      pagination: result.pagination
    });

  } catch (error) {
    console.error('Error fetching personas:', error);
    res.status(500).json({
      error: 'Failed to fetch personas',
      details: error.message
    });
  }
});

/**
 * GET /api/personas/v2/:id
 * Get a specific persona by ID
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const persona = await personaManager.getPersona(id, userId);

    res.json({
      success: true,
      data: persona
    });

  } catch (error) {
    console.error('Error fetching persona:', error);
    if (error.message === 'Persona not found') {
      res.status(404).json({
        error: 'Persona not found'
      });
    } else {
      res.status(500).json({
        error: 'Failed to fetch persona',
        details: error.message
      });
    }
  }
});

/**
 * PUT /api/personas/v2/:id
 * Update a persona
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    // Remove fields that shouldn't be updated
    delete updateData.id;
    delete updateData.user_id;
    delete updateData.created_at;

    const updatedPersona = await personaManager.updatePersona(id, userId, updateData);

    res.json({
      success: true,
      data: updatedPersona,
      message: 'Persona updated successfully'
    });

  } catch (error) {
    console.error('Error updating persona:', error);
    if (error.message === 'Persona not found or access denied') {
      res.status(404).json({
        error: 'Persona not found or access denied'
      });
    } else {
      res.status(500).json({
        error: 'Failed to update persona',
        details: error.message
      });
    }
  }
});

/**
 * DELETE /api/personas/v2/:id
 * Delete a persona (soft delete)
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await personaManager.deletePersona(id, userId);

    res.json({
      success: true,
      data: result,
      message: 'Persona deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting persona:', error);
    if (error.message === 'Persona not found or access denied') {
      res.status(404).json({
        error: 'Persona not found or access denied'
      });
    } else {
      res.status(500).json({
        error: 'Failed to delete persona',
        details: error.message
      });
    }
  }
});

/**
 * POST /api/personas/v2/search
 * Search personas by semantic similarity
 */
router.post('/search', auth, async (req, res) => {
  try {
    const { query, limit = 10 } = req.body;
    const userId = req.user.id;

    if (!query) {
      return res.status(400).json({
        error: 'Search query is required'
      });
    }

    const results = await personaManager.searchPersonas(userId, query, limit);

    res.json({
      success: true,
      data: results,
      query
    });

  } catch (error) {
    console.error('Error searching personas:', error);
    res.status(500).json({
      error: 'Failed to search personas',
      details: error.message
    });
  }
});

/**
 * POST /api/personas/v2/batch
 * Create multiple personas from batch upload
 */
router.post('/batch', auth, async (req, res) => {
  try {
    const { transcripts, demographics = {} } = req.body;
    const userId = req.user.id;

    if (!transcripts || !Array.isArray(transcripts)) {
      return res.status(400).json({
        error: 'Transcripts array is required'
      });
    }

    const results = await agentGeneration.batchProcessTranscripts(transcripts, demographics);
    const createdPersonas = [];

    for (const result of results) {
      if (result.persona) {
        try {
          const sourceMeta = {
            source_type: 'batch_transcript',
            created_by: userId,
            created_at: new Date().toISOString()
          };

          const created = await personaManager.createPersona(userId, result.persona, sourceMeta);
          createdPersonas.push(created);
        } catch (error) {
          console.error('Error creating persona from batch:', error);
        }
      }
    }

    res.status(201).json({
      success: true,
      data: {
        total_processed: results.length,
        successful: createdPersonas.length,
        failed: results.length - createdPersonas.length,
        personas: createdPersonas
      },
      message: 'Batch processing completed'
    });

  } catch (error) {
    console.error('Error in batch processing:', error);
    res.status(500).json({
      error: 'Failed to process batch',
      details: error.message
    });
  }
});

/**
 * GET /api/personas/v2/analytics/insights
 * Get persona analytics and insights
 */
router.get('/analytics/insights', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { status = 'active' } = req.query;

    // Get all personas for analytics
    const result = await personaManager.getPersonas(userId, { 
      page: 1, 
      limit: 1000, 
      status 
    });

    const insights = await agentGeneration.generatePersonaInsights(result.personas);

    res.json({
      success: true,
      data: insights
    });

  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({
      error: 'Failed to generate insights',
      details: error.message
    });
  }
});

/**
 * POST /api/personas/v2/cluster
 * Cluster personas by similarity
 */
router.post('/cluster', auth, async (req, res) => {
  try {
    const { numClusters = 3 } = req.body;
    const userId = req.user.id;

    // Get all personas
    const result = await personaManager.getPersonas(userId, { 
      page: 1, 
      limit: 1000, 
      status: 'active' 
    });

    const clusters = await agentGeneration.clusterPersonas(result.personas, numClusters);

    res.json({
      success: true,
      data: clusters
    });

  } catch (error) {
    console.error('Error clustering personas:', error);
    res.status(500).json({
      error: 'Failed to cluster personas',
      details: error.message
    });
  }
});

/**
 * PUT /api/personas/v2/:id/regenerate-image
 * Regenerate image for a specific persona
 */
router.put('/:id/regenerate-image', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify persona belongs to user
    const persona = await personaManager.getPersonaById(id);
    if (!persona || persona.user_id !== userId) {
      return res.status(404).json({
        error: 'Persona not found or access denied'
      });
    }

    // Regenerate image
    const result = await personaManager.regeneratePersonaImage(id);

    res.json({
      success: true,
      data: result,
      message: 'Persona image regenerated successfully'
    });

  } catch (error) {
    console.error('Error regenerating persona image:', error);
    res.status(500).json({
      error: 'Failed to regenerate persona image',
      details: error.message
    });
  }
});

module.exports = router;
