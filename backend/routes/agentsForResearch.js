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
                voice_id,
                created_at
            FROM ai_agents
            WHERE is_active = true
            ORDER BY created_at DESC
        `);

        // Format agents for research UI with unique Indian avatars
        const agents = result.rows.map((agent, index) => {
            // Get initials for avatar
            const nameParts = (agent.name || 'Agent').split(' ');
            const avatar = nameParts.length > 1 
                ? `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase()
                : agent.name.substring(0, 2).toUpperCase();

            // Generate unique Indian avatar based on persona
            const generateIndianAvatar = (agent) => {
                const gender = agent.gender?.toLowerCase() || 'male';
                const location = agent.location?.toLowerCase() || '';
                const age = agent.age || 30;
                
                // Indian avatar service URLs with different parameters for uniqueness
                const baseUrl = 'https://api.dicebear.com/7.x/avataaars/svg';
                const seed = `${agent.name}-${agent.id}-${index}`;
                
                // Different styles based on region and gender
                let style = 'circle';
                if (location.includes('tamil') || location.includes('chennai')) {
                    style = 'circle'; // South Indian style
                } else if (location.includes('delhi') || location.includes('punjab')) {
                    style = 'circle'; // North Indian style
                } else if (location.includes('mumbai') || location.includes('maharashtra')) {
                    style = 'circle'; // West Indian style
                } else if (location.includes('kolkata') || location.includes('bengal')) {
                    style = 'circle'; // East Indian style
                }
                
                const params = new URLSearchParams({
                    seed: seed,
                    backgroundColor: gender === 'female' ? 'ffd1dc' : '87ceeb', // Pink for female, light blue for male
                    hairColor: ['black', 'brown', 'auburn', 'blonde'][index % 4],
                    skinColor: ['fdbcb4', 'fd9841', 'c68642', '8d5524'][index % 4], // Different Indian skin tones
                    eyeColor: ['brown', 'black', 'hazel'][index % 3],
                    mouthType: ['smile', 'grin', 'smirk'][index % 3],
                    eyebrowType: gender === 'female' ? 'raised' : 'default',
                    accessoriesType: age > 40 ? 'prescription01' : 'blank',
                    clotheType: ['shirtCrewNeck', 'blazerShirt', 'hoodie'][index % 3],
                    clotheColor: ['262e33', '65c9ff', '5199e4'][index % 3]
                });
                
                return `${baseUrl}?${params.toString()}`;
            };

            return {
                id: agent.id,
                name: agent.name,
                role: agent.role || 'Professional',
                avatar: avatar,
                avatar_url: agent.avatar_url || generateIndianAvatar(agent),
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

        // Format agents for research UI with unique Indian avatars
        const agents = result.rows.map((agent, index) => {
            // Get initials for avatar
            const nameParts = (agent.name || 'Agent').split(' ');
            const avatar = nameParts.length > 1 
                ? `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase()
                : agent.name.substring(0, 2).toUpperCase();

            // Generate unique Indian avatar based on persona
            const generateIndianAvatar = (agent) => {
                const gender = agent.gender?.toLowerCase() || 'male';
                const location = agent.location?.toLowerCase() || '';
                const age = agent.age || 30;
                
                // Indian avatar service URLs with different parameters for uniqueness
                const baseUrl = 'https://api.dicebear.com/7.x/avataaars/svg';
                const seed = `${agent.name}-${agent.id}-${index}`;
                
                // Different styles based on region and gender
                let style = 'circle';
                if (location.includes('tamil') || location.includes('chennai')) {
                    style = 'circle'; // South Indian style
                } else if (location.includes('delhi') || location.includes('punjab')) {
                    style = 'circle'; // North Indian style
                } else if (location.includes('mumbai') || location.includes('maharashtra')) {
                    style = 'circle'; // West Indian style
                } else if (location.includes('kolkata') || location.includes('bengal')) {
                    style = 'circle'; // East Indian style
                }
                
                const params = new URLSearchParams({
                    seed: seed,
                    backgroundColor: gender === 'female' ? 'ffd1dc' : '87ceeb', // Pink for female, light blue for male
                    hairColor: ['black', 'brown', 'auburn', 'blonde'][index % 4],
                    skinColor: ['fdbcb4', 'fd9841', 'c68642', '8d5524'][index % 4], // Different Indian skin tones
                    eyeColor: ['brown', 'black', 'hazel'][index % 3],
                    mouthType: ['smile', 'grin', 'smirk'][index % 3],
                    eyebrowType: gender === 'female' ? 'raised' : 'default',
                    accessoriesType: age > 40 ? 'prescription01' : 'blank',
                    clotheType: ['shirtCrewNeck', 'blazerShirt', 'hoodie'][index % 3],
                    clotheColor: ['262e33', '65c9ff', '5199e4'][index % 3]
                });
                
                return `${baseUrl}?${params.toString()}`;
            };

            return {
                id: agent.id,
                name: agent.name,
                role: agent.role || 'Professional',
                avatar: avatar,
                avatar_url: agent.avatar_url || generateIndianAvatar(agent),
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


