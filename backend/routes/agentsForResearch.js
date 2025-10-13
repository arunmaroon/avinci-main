/**
 * Agents endpoint specifically for User Research
 * Returns all agents in a format compatible with the User Research UI
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../models/database');

/**
 * GET /api/research-agents
 * Returns all active agents formatted for User Research selection
 */
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                id, 
                name, 
                occupation as role,
                age,
                gender,
                location,
                personality,
                goals,
                pain_points,
                motivations,
                sample_quote,
                tone,
                avatar_url,
                background_story,
                created_at
            FROM ai_agents
            WHERE is_active = true
            ORDER BY created_at DESC
        `);

        // Format agents for research UI
        const agents = result.rows.map(agent => {
            // Get initials for avatar
            const nameParts = (agent.name || 'Agent').split(' ');
            const avatar = nameParts.length > 1 
                ? `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase()
                : agent.name.substring(0, 2).toUpperCase();

            return {
                id: agent.id,
                name: agent.name,
                role: agent.role || 'Professional',
                avatar: avatar,
                avatar_url: agent.avatar_url,
                age: agent.age,
                gender: agent.gender,
                location: agent.location,
                // Include full agent data for session creation
                personality: agent.personality,
                goals: agent.goals,
                pain_points: agent.pain_points,
                motivations: agent.motivations,
                sample_quote: agent.sample_quote,
                tone: agent.tone,
                background_story: agent.background_story
            };
        });

        res.json({
            success: true,
            count: agents.length,
            agents: agents
        });

    } catch (error) {
        console.error('Error fetching research agents:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch agents',
            details: error.message
        });
    }
});

/**
 * POST /api/research-agents/by-ids
 * Get multiple agents by their IDs
 */
router.post('/by-ids', async (req, res) => {
    try {
        const { agentIds } = req.body;
        
        if (!agentIds || !Array.isArray(agentIds) || agentIds.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'agentIds array is required'
            });
        }

        const result = await pool.query(`
            SELECT 
                id, 
                name, 
                occupation as role,
                age,
                gender,
                location,
                personality,
                goals,
                pain_points,
                motivations,
                sample_quote,
                tone,
                avatar_url,
                background_story,
                created_at
            FROM ai_agents
            WHERE id = ANY($1) AND is_active = true
            ORDER BY created_at DESC
        `, [agentIds]);

        // Format agents for research UI
        const agents = result.rows.map(agent => {
            // Get initials for avatar
            const nameParts = (agent.name || 'Agent').split(' ');
            const avatar = nameParts.length > 1 
                ? `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase()
                : agent.name.substring(0, 2).toUpperCase();

            return {
                id: agent.id,
                name: agent.name,
                role: agent.role || 'Professional',
                avatar: avatar,
                avatar_url: agent.avatar_url,
                age: agent.age,
                gender: agent.gender,
                location: agent.location,
                // Include full agent data for session creation
                personality: agent.personality,
                goals: agent.goals,
                pain_points: agent.pain_points,
                motivations: agent.motivations,
                sample_quote: agent.sample_quote,
                tone: agent.tone,
                background_story: agent.background_story
            };
        });

        res.json({
            success: true,
            count: agents.length,
            agents: agents
        });

    } catch (error) {
        console.error('Error fetching agents by IDs:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch agents',
            details: error.message
        });
    }
});

/**
 * GET /api/research-agents/:id
 * Get details for a specific agent
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(`
            SELECT * FROM ai_agents WHERE id = $1 AND is_active = true
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'Agent not found'
            });
        }

        res.json({
            success: true,
            agent: result.rows[0]
        });

    } catch (error) {
        console.error('Error fetching agent:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch agent',
            details: error.message
        });
    }
});

module.exports = router;


