const express = require('express');
const { Pinecone } = require('@pinecone-database/pinecone');
const { OpenAI } = require('openai');
const { pool } = require('../models/database');
const router = express.Router();

// Initialize Pinecone
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY
});

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Get Pinecone index
const getIndex = async () => {
  const indexName = process.env.PINECONE_INDEX_NAME || 'avinci-figma-personas';
  return pinecone.index(indexName);
};

// Generate embeddings for text
const generateEmbedding = async (text) => {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
};

// Search for similar Figma elements
router.post('/search', async (req, res) => {
  try {
    const { query, personaId, limit = 10, threshold = 0.7 } = req.body;

    if (!query) {
      return res.status(400).json({ 
        error: 'Query is required' 
      });
    }

    // Generate embedding for query
    const queryEmbedding = await generateEmbedding(query);

    // Get Pinecone index
    const index = await getIndex();

    // Build filter for persona-specific search
    let filter = {};
    if (personaId) {
      filter.persona_id = { $eq: personaId };
    }

    // Search Pinecone
    const searchResponse = await index.query({
      vector: queryEmbedding,
      topK: limit,
      includeMetadata: true,
      filter: Object.keys(filter).length > 0 ? filter : undefined
    });

    // Filter results by threshold
    const results = searchResponse.matches
      .filter(match => match.score >= threshold)
      .map(match => ({
        id: match.id,
        score: match.score,
        metadata: match.metadata,
        element: match.metadata.element,
        persona: match.metadata.persona,
        figma: match.metadata.figma
      }));

    res.json({
      success: true,
      results,
      total: results.length
    });

  } catch (error) {
    console.error('Vector search error:', error);
    res.status(500).json({ 
      error: 'Vector search failed',
      details: error.message 
    });
  }
});

// Index Figma element for search
router.post('/index', async (req, res) => {
  try {
    const { 
      elementId, 
      elementType, 
      elementContent, 
      figmaId, 
      personaId, 
      metadata = {} 
    } = req.body;

    if (!elementId || !elementType || !elementContent) {
      return res.status(400).json({ 
        error: 'Element ID, type, and content are required' 
      });
    }

    // Generate embedding for element content
    const embedding = await generateEmbedding(elementContent);

    // Get Pinecone index
    const index = await getIndex();

    // Prepare metadata
    const vectorMetadata = {
      element_id: elementId,
      element_type: elementType,
      element_content: elementContent,
      figma_id: figmaId,
      persona_id: personaId,
      created_at: new Date().toISOString(),
      ...metadata
    };

    // Upsert to Pinecone
    await index.upsert([{
      id: elementId,
      values: embedding,
      metadata: vectorMetadata
    }]);

    // Store in database for reference
    await pool.query(`
      INSERT INTO vector_embeddings (id, element_type, element_content, figma_id, persona_id, metadata, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      ON CONFLICT (id) DO UPDATE SET
        element_content = EXCLUDED.element_content,
        metadata = EXCLUDED.metadata,
        updated_at = NOW()
    `, [
      elementId,
      elementType,
      elementContent,
      figmaId,
      personaId,
      JSON.stringify(metadata)
    ]);

    res.json({
      success: true,
      id: elementId,
      message: 'Element indexed successfully'
    });

  } catch (error) {
    console.error('Indexing error:', error);
    res.status(500).json({ 
      error: 'Indexing failed',
      details: error.message 
    });
  }
});

// Index multiple Figma elements
router.post('/index-batch', async (req, res) => {
  try {
    const { elements } = req.body;

    if (!Array.isArray(elements) || elements.length === 0) {
      return res.status(400).json({ 
        error: 'Elements array is required' 
      });
    }

    // Generate embeddings for all elements
    const embeddings = await Promise.all(
      elements.map(async (element) => {
        const embedding = await generateEmbedding(element.elementContent);
        return {
          id: element.elementId,
          values: embedding,
          metadata: {
            element_id: element.elementId,
            element_type: element.elementType,
            element_content: element.elementContent,
            figma_id: element.figmaId,
            persona_id: element.personaId,
            created_at: new Date().toISOString(),
            ...element.metadata
          }
        };
      })
    );

    // Get Pinecone index
    const index = await getIndex();

    // Upsert all embeddings
    await index.upsert(embeddings);

    // Store in database
    const values = elements.map((element, index) => 
      `($${index * 6 + 1}, $${index * 6 + 2}, $${index * 6 + 3}, $${index * 6 + 4}, $${index * 6 + 5}, $${index * 6 + 6}, NOW())`
    ).join(', ');

    const params = elements.flatMap(element => [
      element.elementId,
      element.elementType,
      element.elementContent,
      element.figmaId,
      element.personaId,
      JSON.stringify(element.metadata || {})
    ]);

    await pool.query(`
      INSERT INTO vector_embeddings (id, element_type, element_content, figma_id, persona_id, metadata, created_at)
      VALUES ${values}
      ON CONFLICT (id) DO UPDATE SET
        element_content = EXCLUDED.element_content,
        metadata = EXCLUDED.metadata,
        updated_at = NOW()
    `, params);

    res.json({
      success: true,
      indexed: elements.length,
      message: 'Elements indexed successfully'
    });

  } catch (error) {
    console.error('Batch indexing error:', error);
    res.status(500).json({ 
      error: 'Batch indexing failed',
      details: error.message 
    });
  }
});

// Get similar elements for a persona
router.get('/persona/:personaId/similar', async (req, res) => {
  try {
    const { personaId } = req.params;
    const { limit = 10, threshold = 0.7 } = req.query;

    // Get persona details
    const personaResult = await pool.query(`
      SELECT name, role, goals, pain_points, behaviors, traits
      FROM personas
      WHERE id = $1
    `, [personaId]);

    if (personaResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Persona not found' 
      });
    }

    const persona = personaResult.rows[0];

    // Create search query from persona characteristics
    const searchQuery = `${persona.name} ${persona.role} ${persona.goals} ${persona.pain_points} ${persona.behaviors} ${persona.traits}`;

    // Generate embedding for persona
    const queryEmbedding = await generateEmbedding(searchQuery);

    // Get Pinecone index
    const index = await getIndex();

    // Search for similar elements
    const searchResponse = await index.query({
      vector: queryEmbedding,
      topK: parseInt(limit),
      includeMetadata: true,
      filter: {
        persona_id: { $eq: personaId }
      }
    });

    // Filter results by threshold
    const results = searchResponse.matches
      .filter(match => match.score >= threshold)
      .map(match => ({
        id: match.id,
        score: match.score,
        metadata: match.metadata,
        element: match.metadata.element,
        figma: match.metadata.figma
      }));

    res.json({
      success: true,
      persona: {
        id: personaId,
        name: persona.name,
        role: persona.role
      },
      results,
      total: results.length
    });

  } catch (error) {
    console.error('Persona similar search error:', error);
    res.status(500).json({ 
      error: 'Persona similar search failed',
      details: error.message 
    });
  }
});

// Delete indexed element
router.delete('/:elementId', async (req, res) => {
  try {
    const { elementId } = req.params;

    // Delete from Pinecone
    const index = await getIndex();
    await index.deleteOne(elementId);

    // Delete from database
    await pool.query(`
      DELETE FROM vector_embeddings
      WHERE id = $1
    `, [elementId]);

    res.json({
      success: true,
      message: 'Element deleted successfully'
    });

  } catch (error) {
    console.error('Delete element error:', error);
    res.status(500).json({ 
      error: 'Delete element failed',
      details: error.message 
    });
  }
});

// Get index statistics
router.get('/stats', async (req, res) => {
  try {
    const index = await getIndex();
    const stats = await index.describeIndexStats();

    // Get database counts
    const dbStats = await pool.query(`
      SELECT 
        COUNT(*) as total_elements,
        COUNT(DISTINCT figma_id) as unique_figma_designs,
        COUNT(DISTINCT persona_id) as unique_personas
      FROM vector_embeddings
    `);

    res.json({
      success: true,
      pinecone: {
        totalVectors: stats.totalVectorCount,
        dimension: stats.dimension,
        indexFullness: stats.indexFullness
      },
      database: dbStats.rows[0]
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ 
      error: 'Failed to get stats',
      details: error.message 
    });
  }
});

module.exports = router;

