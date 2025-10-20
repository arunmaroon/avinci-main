/**
 * Optimized Personas API Routes
 * Features: Caching, pagination, filtering, optimized queries
 */

const express = require('express');
const router = express.Router();
const { db, cache, CACHE_TTL } = require('../models/database-optimized');
const { auth, optionalAuth } = require('../middleware/auth');

// Cache keys
const CACHE_KEYS = {
    ALL_PERSONAS: 'personas:all',
    PERSONA_BY_ID: (id) => `persona:${id}`,
    PERSONAS_BY_FILTER: (filter) => `personas:filter:${JSON.stringify(filter)}`
};

/**
 * GET /api/personas
 * Get all personas with pagination, filtering, and caching
 */
router.get('/', optionalAuth, async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            status = 'active',
            search,
            company,
            occupation,
            tech_savviness,
            personality_archetype,
            sort_by = 'created_at',
            sort_order = 'desc'
        } = req.query;

        const offset = (page - 1) * limit;
        const cacheKey = CACHE_KEYS.PERSONAS_BY_FILTER({
            page, limit, status, search, company, occupation, tech_savviness, personality_archetype, sort_by, sort_order
        });

        // Try cache first
        const cached = await cache.get(cacheKey);
        if (cached) {
            return res.json({
                success: true,
                ...cached,
                cached: true
            });
        }

        // Build dynamic query
        let whereConditions = ['status = $1'];
        let queryParams = [status];
        let paramCount = 1;

        if (search) {
            paramCount++;
            whereConditions.push(`(name ILIKE $${paramCount} OR title ILIKE $${paramCount} OR company ILIKE $${paramCount})`);
            queryParams.push(`%${search}%`);
        }

        if (company) {
            paramCount++;
            whereConditions.push(`company = $${paramCount}`);
            queryParams.push(company);
        }

        if (occupation) {
            paramCount++;
            whereConditions.push(`occupation = $${paramCount}`);
            queryParams.push(occupation);
        }

        if (tech_savviness) {
            paramCount++;
            whereConditions.push(`tech_savviness = $${paramCount}`);
            queryParams.push(tech_savviness);
        }

        if (personality_archetype) {
            paramCount++;
            whereConditions.push(`personality_archetype = $${paramCount}`);
            queryParams.push(personality_archetype);
        }

        const whereClause = whereConditions.join(' AND ');
        const orderClause = `ORDER BY ${sort_by} ${sort_order.toUpperCase()}`;

        // Get total count
        const countQuery = `SELECT COUNT(*) FROM personas WHERE ${whereClause}`;
        const countResult = await db.query(countQuery, queryParams);
        const total = parseInt(countResult.rows[0].count);

        // Get personas with pagination
        paramCount++;
        const limitParam = `$${paramCount}`;
        paramCount++;
        const offsetParam = `$${paramCount}`;
        
        queryParams.push(limit, offset);

        const personasQuery = `
            SELECT 
                id, name, title, company, location, avatar_url, age, gender, education,
                income_range, family_status, occupation, industry, experience_years,
                personality_archetype, primary_goals, tech_savviness, financial_goals,
                created_at, updated_at
            FROM personas 
            WHERE ${whereClause} 
            ${orderClause}
            LIMIT ${limitParam} OFFSET ${offsetParam}
        `;

        const personas = await db.getMany(personasQuery, queryParams);

        // Transform data for frontend
        const transformedPersonas = personas.map(persona => ({
            id: persona.id,
            name: persona.name,
            title: persona.title,
            company: persona.company,
            location: persona.location,
            avatar_url: persona.avatar_url,
            age: persona.age,
            gender: persona.gender,
            education: persona.education,
            income_range: persona.income_range,
            family_status: persona.family_status,
            occupation: persona.occupation,
            industry: persona.industry,
            experience_years: persona.experience_years,
            personality_archetype: persona.personality_archetype,
            primary_goals: persona.primary_goals || [],
            tech_savviness: persona.tech_savviness,
            financial_goals: persona.financial_goals || [],
            created_at: persona.created_at,
            updated_at: persona.updated_at,
            // Add computed fields for frontend compatibility
            goals: persona.primary_goals || [],
            motivations: [],
            traits: [],
            values: ['Honesty', 'Efficiency', 'Quality', 'Innovation', 'Customer focus'],
            background: 'No background information available yet.',
            hobbies: [],
            life_events: {},
            pain_points: [],
            frustrations: [],
            communication_style: {},
            cultural_background: {},
            social_context: {},
            daily_routine: {},
            raw_persona: persona
        }));

        const result = {
            personas: transformedPersonas,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit),
                hasNext: page * limit < total,
                hasPrev: page > 1
            },
            filters: {
                status,
                search,
                company,
                occupation,
                tech_savviness,
                personality_archetype
            }
        };

        // Cache the result
        await cache.set(cacheKey, result, CACHE_TTL.MEDIUM);

        res.json({
            success: true,
            ...result
        });

    } catch (error) {
        console.error('Error fetching personas:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch personas',
            details: error.message
        });
    }
});

/**
 * GET /api/personas/:id
 * Get a single persona by ID with caching
 */
router.get('/:id', optionalAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const cacheKey = CACHE_KEYS.PERSONA_BY_ID(id);

        // Try cache first
        const cached = await cache.get(cacheKey);
        if (cached) {
            return res.json({
                success: true,
                persona: cached,
                cached: true
            });
        }

        const persona = await db.getOne(
            'SELECT * FROM personas WHERE id = $1 AND status = $2',
            [id, 'active'],
            cacheKey,
            CACHE_TTL.MEDIUM
        );

        if (!persona) {
            return res.status(404).json({
                success: false,
                error: 'Persona not found'
            });
        }

        // Transform for frontend compatibility
        const transformedPersona = {
            ...persona,
            goals: persona.primary_goals || [],
            motivations: [],
            traits: [],
            values: ['Honesty', 'Efficiency', 'Quality', 'Innovation', 'Customer focus'],
            background: 'No background information available yet.',
            hobbies: [],
            life_events: {},
            pain_points: [],
            frustrations: [],
            communication_style: {},
            cultural_background: {},
            social_context: {},
            daily_routine: {},
            raw_persona: persona
        };

        res.json({
            success: true,
            persona: transformedPersona
        });

    } catch (error) {
        console.error('Error fetching persona:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch persona',
            details: error.message
        });
    }
});

/**
 * POST /api/personas
 * Create a new persona
 */
router.post('/', auth, async (req, res) => {
    try {
        const personaData = req.body;
        
        // Generate avatar URL if not provided
        if (!personaData.avatar_url) {
            const seed = encodeURIComponent(personaData.name || 'Unknown');
            personaData.avatar_url = `https://ui-avatars.com/api/?name=${seed}&background=4f46e5&color=fff&size=200`;
        }

        // Generate master system prompt if not provided
        if (!personaData.master_system_prompt) {
            personaData.master_system_prompt = `You are ${personaData.name}, a ${personaData.age}-year-old ${personaData.occupation} from ${personaData.location}. You are ${personaData.personality_archetype} and focused on ${personaData.primary_goals?.join(' and ') || 'your goals'}.`;
        }

        const newPersona = await db.insert(`
            INSERT INTO personas (
                user_id, name, title, company, location, avatar_url, age, gender, education,
                income_range, family_status, occupation, industry, experience_years,
                personality_archetype, primary_goals, tech_savviness, financial_goals,
                master_system_prompt, status, source_meta
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
            ) RETURNING *
        `, [
            req.user.id,
            personaData.name,
            personaData.title,
            personaData.company,
            personaData.location,
            personaData.avatar_url,
            personaData.age,
            personaData.gender,
            personaData.education,
            personaData.income_range,
            personaData.family_status,
            personaData.occupation,
            personaData.industry,
            personaData.experience_years,
            personaData.personality_archetype,
            personaData.primary_goals,
            personaData.tech_savviness,
            personaData.financial_goals,
            personaData.master_system_prompt,
            'active',
            { source_type: 'manual', timestamp: new Date().toISOString() }
        ]);

        // Clear related caches
        await cache.delPattern('personas:*');

        res.status(201).json({
            success: true,
            persona: newPersona
        });

    } catch (error) {
        console.error('Error creating persona:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create persona',
            details: error.message
        });
    }
});

/**
 * PUT /api/personas/:id
 * Update a persona
 */
router.put('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Build dynamic update query
        const fields = Object.keys(updates).map((key, index) => `"${key}" = $${index + 2}`).join(', ');
        const values = [id, ...Object.values(updates)];

        const updatedPersona = await db.update(`
            UPDATE personas 
            SET ${fields}, updated_at = NOW() 
            WHERE id = $1 AND status = 'active' 
            RETURNING *
        `, values);

        if (!updatedPersona) {
            return res.status(404).json({
                success: false,
                error: 'Persona not found'
            });
        }

        // Clear caches
        await cache.del(CACHE_KEYS.PERSONA_BY_ID(id));
        await cache.delPattern('personas:*');

        res.json({
            success: true,
            persona: updatedPersona
        });

    } catch (error) {
        console.error('Error updating persona:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update persona',
            details: error.message
        });
    }
});

/**
 * DELETE /api/personas/:id
 * Soft delete a persona
 */
router.delete('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;

        const deletedPersona = await db.update(`
            UPDATE personas 
            SET status = 'archived', updated_at = NOW() 
            WHERE id = $1 AND status = 'active' 
            RETURNING *
        `, [id]);

        if (!deletedPersona) {
            return res.status(404).json({
                success: false,
                error: 'Persona not found'
            });
        }

        // Clear caches
        await cache.del(CACHE_KEYS.PERSONA_BY_ID(id));
        await cache.delPattern('personas:*');

        res.json({
            success: true,
            message: 'Persona archived successfully'
        });

    } catch (error) {
        console.error('Error deleting persona:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete persona',
            details: error.message
        });
    }
});

/**
 * GET /api/personas/stats/summary
 * Get persona statistics
 */
router.get('/stats/summary', optionalAuth, async (req, res) => {
    try {
        const cacheKey = 'personas:stats:summary';
        
        // Try cache first
        const cached = await cache.get(cacheKey);
        if (cached) {
            return res.json({
                success: true,
                ...cached,
                cached: true
            });
        }

        const stats = await db.getOne(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
                COUNT(CASE WHEN status = 'archived' THEN 1 END) as archived,
                COUNT(CASE WHEN tech_savviness = 'Expert' THEN 1 END) as expert_tech,
                COUNT(CASE WHEN tech_savviness = 'Advanced' THEN 1 END) as advanced_tech,
                COUNT(CASE WHEN personality_archetype = 'Analytical' THEN 1 END) as analytical,
                COUNT(CASE WHEN personality_archetype = 'Creative' THEN 1 END) as creative,
                COUNT(CASE WHEN personality_archetype = 'Technical' THEN 1 END) as technical
            FROM personas
        `);

        const result = {
            total: parseInt(stats.total),
            active: parseInt(stats.active),
            archived: parseInt(stats.archived),
            tech_distribution: {
                expert: parseInt(stats.expert_tech),
                advanced: parseInt(stats.advanced_tech)
            },
            personality_distribution: {
                analytical: parseInt(stats.analytical),
                creative: parseInt(stats.creative),
                technical: parseInt(stats.technical)
            }
        };

        // Cache for 1 hour
        await cache.set(cacheKey, result, CACHE_TTL.LONG);

        res.json({
            success: true,
            ...result
        });

    } catch (error) {
        console.error('Error fetching persona stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch persona statistics',
            details: error.message
        });
    }
});

module.exports = router;



