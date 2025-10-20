/**
 * Persona Manager - Centralized persona CRUD operations
 * Handles creation, retrieval, updating, and deletion of personas
 */

const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
const redis = require('redis');
const { OpenAI } = require('openai');
const ImageFetcher = require('../utils/image_fetcher');

class PersonaManager {
  constructor() {
    this.pool = new Pool({
      user: process.env.DB_USER || 'avinci_admin',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'avinci',
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 5432,
    });

    // Redis client for caching
    this.redis = redis.createClient({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
    });

    // OpenAI client for embeddings
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Image fetcher for persona images
    this.imageFetcher = new ImageFetcher();

    this.redis.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });
  }

  /**
   * Create a new persona from transcript or manual input
   */
  async createPersona(userId, personaData, sourceMeta = {}) {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const personaId = uuidv4();
      
      // Fetch persona image from Pexels API
      console.log('🖼️ Fetching persona image...');
      const { imageData, updatedPersonaJson } = await this.fetchPersonaImage(personaData);
      
      // Build comprehensive persona JSON with image data
      const personaJson = updatedPersonaJson;
      
      // Generate master system prompt
      const masterSystemPrompt = await this.generateMasterPrompt(personaData);
      
      // Insert persona into database
      const insertQuery = `
        INSERT INTO personas (
          id, user_id, name, title, company, location, age, gender, education,
          income_range, family_status, occupation, industry, experience_years,
          personality_archetype, big_five_traits, personality_adjectives, values,
          beliefs, attitudes, primary_goals, secondary_goals, motivations,
          aspirations, fears, concerns, pain_points, frustrations, daily_routine,
          habits, preferences, behaviors, lifestyle, hobbies, tech_savviness,
          preferred_devices, apps_used, tech_comfort_level, digital_behavior,
          communication_style, language_preferences, vocabulary_level,
          speech_patterns, emotional_profile, cognitive_style, learning_style,
          attention_span, social_context, cultural_background, social_media_usage,
          network_size, influence_level, life_events, current_situation,
          future_plans, life_stage, financial_goals, financial_concerns,
          banking_preferences, investment_style, risk_tolerance, financial_literacy,
          persona_json, master_system_prompt, status, source_meta
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
          $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
          $31, $32, $33, $34, $35, $36, $37, $38, $39, $40, $41, $42, $43, $44,
          $45, $46, $47, $48, $49, $50, $51, $52, $53, $54, $55, $56, $57, $58,
          $59, $60, $61, $62, $63, $64, $65, $66, $67, $68, $69, $70, $71, $72
        ) RETURNING id, name, created_at
      `;

      const values = [
        personaId, userId, personaData.name, personaData.title, personaData.company,
        personaData.location, personaData.age, personaData.gender, personaData.education,
        personaData.income_range, personaData.family_status, personaData.occupation,
        personaData.industry, personaData.experience_years, personaData.personality_archetype,
        personaData.big_five_traits, personaData.personality_adjectives, personaData.values,
        personaData.beliefs, personaData.attitudes, personaData.primary_goals,
        personaData.secondary_goals, personaData.motivations, personaData.aspirations,
        personaData.fears, personaData.concerns, personaData.pain_points,
        personaData.frustrations, personaData.daily_routine, personaData.habits,
        personaData.preferences, personaData.behaviors, personaData.lifestyle,
        personaData.hobbies, personaData.tech_savviness, personaData.preferred_devices,
        personaData.apps_used, personaData.tech_comfort_level, personaData.digital_behavior,
        personaData.communication_style, personaData.language_preferences,
        personaData.vocabulary_level, personaData.speech_patterns, personaData.emotional_profile,
        personaData.cognitive_style, personaData.learning_style, personaData.attention_span,
        personaData.social_context, personaData.cultural_background, personaData.social_media_usage,
        personaData.network_size, personaData.influence_level, personaData.life_events,
        personaData.current_situation, personaData.future_plans, personaData.life_stage,
        personaData.financial_goals, personaData.financial_concerns, personaData.banking_preferences,
        personaData.investment_style, personaData.risk_tolerance, personaData.financial_literacy,
        personaJson, masterSystemPrompt, 'active', sourceMeta
      ];

      const result = await client.query(insertQuery, values);
      
      // Generate and store embeddings
      await this.generatePersonaEmbeddings(personaId, personaData);
      
      // Cache the persona
      await this.cachePersona(personaId, result.rows[0]);
      
      await client.query('COMMIT');
      
      return {
        id: result.rows[0].id,
        name: result.rows[0].name,
        created_at: result.rows[0].created_at
      };
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get persona by ID with caching
   */
  async getPersona(personaId, userId) {
    // Try cache first
    const cached = await this.getCachedPersona(personaId);
    if (cached) {
      return cached;
    }

    // Fetch from database
    const query = `
      SELECT * FROM personas 
      WHERE id = $1 AND user_id = $2 AND status = 'active'
    `;
    
    const result = await this.pool.query(query, [personaId, userId]);
    
    if (result.rows.length === 0) {
      throw new Error('Persona not found');
    }

    const persona = result.rows[0];
    
    // Cache the persona
    await this.cachePersona(personaId, persona);
    
    return persona;
  }

  /**
   * Get all personas for a user with pagination
   */
  async getPersonas(userId, options = {}) {
    const {
      page = 1,
      limit = 20,
      status = 'active',
      search = '',
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = options;

    const offset = (page - 1) * limit;
    
    let query = `
      SELECT id, name, title, company, location, age, gender, 
             avatar_url, status, created_at, updated_at
      FROM personas 
      WHERE user_id = $1 AND status = $2
    `;
    
    const params = [userId, status];
    
    if (search) {
      query += ` AND (name ILIKE $3 OR title ILIKE $3 OR company ILIKE $3)`;
      params.push(`%${search}%`);
    }
    
    query += ` ORDER BY ${sortBy} ${sortOrder} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    const result = await this.pool.query(query, params);
    
    // Get total count
    const countQuery = `
      SELECT COUNT(*) FROM personas 
      WHERE user_id = $1 AND status = $2
      ${search ? 'AND (name ILIKE $3 OR title ILIKE $3 OR company ILIKE $3)' : ''}
    `;
    
    const countResult = await this.pool.query(countQuery, params.slice(0, search ? 3 : 2));
    const total = parseInt(countResult.rows[0].count);
    
    return {
      personas: result.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Update persona
   */
  async updatePersona(personaId, userId, updateData) {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Build update query dynamically
      const fields = Object.keys(updateData).filter(key => key !== 'id');
      const setClause = fields.map((field, index) => `${field} = $${index + 3}`).join(', ');
      
      const query = `
        UPDATE personas 
        SET ${setClause}, updated_at = NOW()
        WHERE id = $1 AND user_id = $2 AND status = 'active'
        RETURNING *
      `;
      
      const values = [personaId, userId, ...fields.map(field => updateData[field])];
      
      const result = await client.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('Persona not found or access denied');
      }
      
      // Update cache
      await this.cachePersona(personaId, result.rows[0]);
      
      await client.query('COMMIT');
      
      return result.rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Delete persona (soft delete)
   */
  async deletePersona(personaId, userId) {
    const query = `
      UPDATE personas 
      SET status = 'archived', updated_at = NOW()
      WHERE id = $1 AND user_id = $2
      RETURNING id, name
    `;
    
    const result = await this.pool.query(query, [personaId, userId]);
    
    if (result.rows.length === 0) {
      throw new Error('Persona not found or access denied');
    }
    
    // Remove from cache
    await this.redis.del(`persona:${personaId}`);
    
    return result.rows[0];
  }

  /**
   * Search personas by semantic similarity
   */
  async searchPersonas(userId, query, limit = 10) {
    // Generate query embedding
    const queryEmbedding = await this.generateEmbedding(query);
    
    // Search in embeddings table
    const searchQuery = `
      SELECT p.*, 
             (pe.embedding_vector <=> $1) as distance
      FROM personas p
      JOIN persona_embeddings pe ON p.id = pe.persona_id
      WHERE p.user_id = $2 AND p.status = 'active'
      ORDER BY pe.embedding_vector <=> $1
      LIMIT $3
    `;
    
    const result = await this.pool.query(searchQuery, [queryEmbedding, userId, limit]);
    
    return result.rows;
  }

  /**
   * Generate persona embeddings for vector search
   */
  async generatePersonaEmbeddings(personaId, personaData) {
    const embeddings = [
      { type: 'profile', text: this.buildProfileText(personaData) },
      { type: 'goals', text: (personaData.primary_goals || []).join(' ') },
      { type: 'pain_points', text: (personaData.pain_points || []).join(' ') },
      { type: 'behaviors', text: this.buildBehaviorText(personaData) }
    ];

    for (const embedding of embeddings) {
      const vector = await this.generateEmbedding(embedding.text);
      
      await this.pool.query(
        'INSERT INTO persona_embeddings (persona_id, embedding_type, embedding_vector, metadata) VALUES ($1, $2, $3, $4)',
        [personaId, embedding.type, vector, { text: embedding.text }]
      );
    }
  }

  /**
   * Generate OpenAI embedding
   */
  async generateEmbedding(text) {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    
    return response.data[0].embedding;
  }

  /**
   * Cache persona data
   */
  async cachePersona(personaId, persona) {
    await this.redis.setex(`persona:${personaId}`, 3600, JSON.stringify(persona));
  }

  /**
   * Get cached persona
   */
  async getCachedPersona(personaId) {
    const cached = await this.redis.get(`persona:${personaId}`);
    return cached ? JSON.parse(cached) : null;
  }

  /**
   * Build comprehensive persona JSON
   */
  buildPersonaJson(personaData) {
    return {
      ...personaData,
      created_at: new Date().toISOString(),
      version: '2.0'
    };
  }

  /**
   * Generate master system prompt
   */
  async generateMasterPrompt(personaData) {
    // This would use AI to generate a comprehensive system prompt
    // For now, return a template
    return `You are ${personaData.name}, a ${personaData.age}-year-old ${personaData.occupation} from ${personaData.location}. 
    
    Your key characteristics:
    - Goals: ${(personaData.primary_goals || []).join(', ')}
    - Pain points: ${(personaData.pain_points || []).join(', ')}
    - Communication style: ${JSON.stringify(personaData.communication_style || {})}
    - Tech savviness: ${personaData.tech_savviness}
    
    Respond naturally as this persona would, maintaining consistency with their background and motivations.`;
  }

  /**
   * Build profile text for embeddings
   */
  buildProfileText(personaData) {
    return `${personaData.name} is a ${personaData.age}-year-old ${personaData.occupation} from ${personaData.location}. 
    They work in ${personaData.industry} and have ${personaData.experience_years} years of experience.
    Their education includes ${personaData.education} and they identify as ${personaData.gender}.
    Their personality is ${personaData.personality_archetype} with values including ${(personaData.values || []).join(', ')}.`;
  }

  /**
   * Build behavior text for embeddings
   */
  buildBehaviorText(personaData) {
    return `Daily routine: ${JSON.stringify(personaData.daily_routine || {})}.
    Habits: ${(personaData.habits || []).join(', ')}.
    Technology usage: ${personaData.tech_savviness} level with devices ${(personaData.preferred_devices || []).join(', ')}.
    Communication: ${JSON.stringify(personaData.communication_style || {})}.`;
  }

  /**
   * Fetch persona image from Pexels API based on 51 UXPressia fields
   * @param {Object} personaData - Persona data with all fields
   * @returns {Object} Image data with URL and metadata
   */
  async fetchPersonaImage(personaData) {
    try {
      console.log(`🖼️ Fetching image for persona: ${personaData.name}`);
      const imageData = await this.imageFetcher.fetchPersonaImage(personaData);
      
      // Add image data to persona JSON
      const updatedPersonaJson = {
        ...this.buildPersonaJson(personaData),
        profile_image_url: imageData.url,
        image_metadata: {
          photographer: imageData.photographer,
          photographer_url: imageData.photographer_url,
          attribution: imageData.attribution,
          source: imageData.source,
          cached_at: imageData.cached_at
        }
      };
      
      return {
        imageData,
        updatedPersonaJson
      };
    } catch (error) {
      console.error('❌ Error fetching persona image:', error.message);
      
      // Return fallback image data
      const fallbackImageData = {
        url: `https://ui-avatars.com/api/?name=${encodeURIComponent(personaData.name || 'Persona')}&background=random&color=fff&size=400`,
        photographer: 'UI Avatars',
        photographer_url: 'https://ui-avatars.com',
        attribution: 'Generated Avatar',
        source: 'ui-avatars',
        cached_at: new Date().toISOString()
      };
      
      const updatedPersonaJson = {
        ...this.buildPersonaJson(personaData),
        profile_image_url: fallbackImageData.url,
        image_metadata: {
          photographer: fallbackImageData.photographer,
          photographer_url: fallbackImageData.photographer_url,
          attribution: fallbackImageData.attribution,
          source: fallbackImageData.source,
          cached_at: fallbackImageData.cached_at
        }
      };
      
      return {
        imageData: fallbackImageData,
        updatedPersonaJson
      };
    }
  }

  /**
   * Regenerate image for existing persona
   * @param {string} personaId - Persona ID
   * @returns {Object} Updated image data
   */
  async regeneratePersonaImage(personaId) {
    const client = await this.pool.connect();
    
    try {
      // Get current persona data
      const personaResult = await client.query(
        'SELECT * FROM personas WHERE id = $1',
        [personaId]
      );
      
      if (personaResult.rows.length === 0) {
        throw new Error('Persona not found');
      }
      
      const personaData = personaResult.rows[0];
      
      // Fetch new image
      const { imageData, updatedPersonaJson } = await this.fetchPersonaImage(personaData);
      
      // Update persona with new image
      await client.query(
        'UPDATE personas SET persona_json = $1, updated_at = NOW() WHERE id = $2',
        [JSON.stringify(updatedPersonaJson), personaId]
      );
      
      // Clear cache
      await this.redis.del(`persona:${personaId}`);
      
      return {
        success: true,
        imageData,
        personaId
      };
      
    } catch (error) {
      console.error('❌ Error regenerating persona image:', error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Close connections
   */
  async close() {
    await this.pool.end();
    await this.redis.quit();
    await this.imageFetcher.close();
  }
}

module.exports = PersonaManager;

