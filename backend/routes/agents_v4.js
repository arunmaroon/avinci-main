/**
 * Enhanced Agents API - Short vs Full View Model
 * Implements the comprehensive persona specification
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../models/database');
const AgentBuilder = require('../services/agentBuilder');
const PromptBuilder = require('../services/promptBuilder');

/**
 * GET /agents?view=short
 * Returns AgentShort for grid/list rendering
 */
router.get('/', async (req, res) => {
    try {
        const { view = 'full', limit = 50, offset = 0 } = req.query;
        
        let query, params;
        
        if (view === 'short') {
            // Short view - minimal fields for card rendering
            query = `
                SELECT 
                    id, name, avatar_url, occupation as role_title, employment_type as company, location, quote,
                    objectives, apprehensions, tech_savviness, domain_literacy,
                    communication_style, is_active as status, created_at
                FROM ai_agents 
                WHERE is_active = true
                ORDER BY created_at DESC
                LIMIT $1 OFFSET $2
            `;
            params = [limit, offset];
        } else {
            // Full view - all fields
            query = `
                SELECT * FROM ai_agents 
                WHERE is_active = true
                ORDER BY created_at DESC
                LIMIT $1 OFFSET $2
            `;
            params = [limit, offset];
        }
        
        const result = await pool.query(query, params);
        
        if (view === 'short') {
            // Transform to AgentShort format
            const shortAgents = result.rows.map(agent => PromptBuilder.buildShortPersona(agent));
            res.json(shortAgents);
        } else {
            // Transform to AgentFull format
            const fullAgents = result.rows.map(agent => PromptBuilder.buildFullPersona(agent));
            res.json(fullAgents);
        }
        
    } catch (error) {
        console.error('Error fetching agents:', error);
        res.status(500).json({ error: 'Failed to fetch agents' });
    }
});

/**
 * GET /agents/:id
 * Returns AgentFull for detail view
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = 'SELECT * FROM agents WHERE id = $1';
        const result = await pool.query(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Agent not found' });
        }
        
        const agent = result.rows[0];
        const fullAgent = PromptBuilder.buildFullPersona(agent);
        
        res.json(fullAgent);
        
    } catch (error) {
        console.error('Error fetching agent:', error);
        res.status(500).json({ error: 'Failed to fetch agent' });
    }
});

/**
 * POST /agents
 * Create agent from transcript and demographics
 */
router.post('/', async (req, res) => {
    try {
        const { transcript, demographics = {} } = req.body;
        const adminId = req.user?.id || 'system'; // No auth required for testing
        
        if (!transcript) {
            return res.status(400).json({ error: 'Transcript is required' });
        }
        
        // Process transcript through two-stage pipeline
        const agentId = await AgentBuilder.processTranscript(transcript, demographics, adminId);
        
        // Fetch the created agent
        const query = 'SELECT * FROM agents WHERE id = $1';
        const result = await pool.query(query, [agentId]);
        const agent = result.rows[0];
        
        const fullAgent = PromptBuilder.buildFullPersona(agent);
        
        res.status(201).json(fullAgent);
        
    } catch (error) {
        console.error('Error creating agent:', error);
        res.status(500).json({ error: 'Failed to create agent: ' + error.message });
    }
});

/**
 * PATCH /agents/:id/status
 * Update agent lifecycle status
 */
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!['active', 'sleeping', 'archived'].includes(status)) {
            return res.status(400).json({ 
                error: 'Invalid status. Must be active, sleeping, or archived' 
            });
        }
        
        const query = `
            UPDATE agents 
            SET status = $1, updated_at = NOW() 
            WHERE id = $2 
            RETURNING *
        `;
        const result = await pool.query(query, [status, id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Agent not found' });
        }
        
        const agent = result.rows[0];
        const fullAgent = PromptBuilder.buildFullPersona(agent);
        
        res.json(fullAgent);
        
    } catch (error) {
        console.error('Error updating agent status:', error);
        res.status(500).json({ error: 'Failed to update agent status' });
    }
});

/**
 * DELETE /agents/:id
 * Soft delete agent (set to archived)
 */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = `
            UPDATE agents 
            SET status = 'archived', updated_at = NOW() 
            WHERE id = $1 
            RETURNING *
        `;
        const result = await pool.query(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Agent not found' });
        }
        
        res.json({ message: 'Agent archived successfully' });
        
    } catch (error) {
        console.error('Error archiving agent:', error);
        res.status(500).json({ error: 'Failed to archive agent' });
    }
});

/**
 * GET /agents/:id/avatar
 * Refresh avatar for agent
 */
router.get('/:id/avatar', async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = 'SELECT * FROM agents WHERE id = $1';
        const result = await pool.query(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Agent not found' });
        }
        
        const agent = result.rows[0];
        const newAvatarUrl = PromptBuilder.generateAvatarUrl(agent);
        
        // Update avatar in database
        const updateQuery = 'UPDATE agents SET avatar_url = $1 WHERE id = $2';
        await pool.query(updateQuery, [newAvatarUrl, id]);
        
        res.json({ avatar_url: newAvatarUrl });
        
    } catch (error) {
        console.error('Error refreshing avatar:', error);
        res.status(500).json({ error: 'Failed to refresh avatar' });
    }
});

module.exports = router;
