const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  user: 'arun.murugesan',
  host: 'localhost',
  database: 'avinci',
  port: 5432,
});

/**
 * Simple test endpoint to create a basic persona
 * POST /api/simple-test
 */
router.post('/', async (req, res) => {
  try {
    // Simple insert with just required fields
    const insertQuery = `
      INSERT INTO ai_agents (
        name, occupation, location, age, gender, education, income_range,
        tech_savviness, is_active, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
      ) RETURNING id, name, occupation, location
    `;

    const values = [
      'Sarah Johnson Test',
      'Marketing Coordinator',
      'Austin, Texas',
      28,
      'Female',
      'Bachelor\'s',
      '$40k-$60k',
      'medium',
      true,
      new Date()
    ];

    const result = await pool.query(insertQuery, values);
    const agent = result.rows[0];

    res.json({
      success: true,
      message: 'Simple test persona created successfully!',
      agent: {
        id: agent.id,
        name: agent.name,
        occupation: agent.occupation,
        location: agent.location
      }
    });

  } catch (error) {
    console.error('Error creating simple test persona:', error);
    res.status(500).json({ 
      error: 'Failed to create simple test persona', 
      details: error.message 
    });
  }
});

/**
 * GET /api/simple-test
 * Get all test personas
 */
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT id, name, occupation, location, age, gender, tech_savviness, is_active, created_at
      FROM ai_agents 
      WHERE name LIKE '%Test%'
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query);
    
    res.json({ 
      success: true, 
      count: result.rows.length,
      agents: result.rows 
    });
  } catch (error) {
    console.error('Error fetching test personas:', error);
    res.status(500).json({ error: 'Failed to fetch test personas', details: error.message });
  }
});

module.exports = router;

