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

// Debug endpoint to check all personas
router.get('/personas', async (req, res) => {
  try {
    const query = 'SELECT id, name, occupation, location, is_active FROM ai_agents ORDER BY created_at DESC';
    const result = await pool.query(query);
    
    res.json({
      success: true,
      count: result.rows.length,
      personas: result.rows.map(p => ({
        id: p.id,
        name: p.name,
        occupation: p.occupation,
        location: p.location,
        is_active: p.is_active
      }))
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: 'Debug failed', details: error.message });
  }
});

// Debug endpoint to check specific persona
router.get('/personas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = 'SELECT * FROM ai_agents WHERE id = $1';
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Persona not found',
        requested_id: id,
        message: 'The requested persona ID does not exist in the database'
      });
    }
    
    res.json({
      success: true,
      persona: result.rows[0]
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ error: 'Debug failed', details: error.message });
  }
});

module.exports = router;







