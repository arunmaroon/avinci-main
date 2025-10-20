/**
 * Consolidated Agent Builder for Transcript-to-Persona Pipeline
 * 
 * This service provides a complete pipeline for creating AI agents from user research
 * transcripts, including analysis, synthesis, validation, and database storage.
 * 
 * Features:
 * - Two-stage pipeline (extract + synthesize)
 * - Comprehensive validation and error handling
 * - Database storage with proper schema mapping
 * - Embedding generation for similarity search
 * - Agent management (CRUD operations)
 * 
 * @author Avinci Development Team
 * @version 2.0.0
 */

const { pool } = require('../../models/database');
const { v4: uuidv4 } = require('uuid');
const transcriptAnalyzer = require('../data/transcriptAnalyzer');
const promptBuilder = require('../ai/promptBuilder');

class AgentBuilder {
  /**
   * Main entry point: Process transcript through complete pipeline
   * 
   * @param {Object} transcriptData - Transcript data with raw_text and metadata
   * @param {Object} demographics - Demographics data for context
   * @param {string} adminId - ID of the admin creating the agent
   * @returns {Object} Created agent data with ID and metadata
   */
  static async processTranscript(transcriptData, demographics = {}, adminId) {
    try {
      // Validate input data
      this.validateInputs(transcriptData, demographics, adminId);
      
      // Clean and normalize transcript data
      const cleanedTranscript = this.cleanTranscript(transcriptData);
      
      // Stage 1: Extract behavioral signals from transcript
      const analysis = await transcriptAnalyzer.analyzeTranscript(
        cleanedTranscript.raw_text, 
        demographics
      );
      
      // Stage 2: Synthesize comprehensive persona
      const persona = transcriptAnalyzer.synthesizePersona(analysis, demographics);
      
      // Stage 3: Build master system prompt
      const masterSystemPrompt = transcriptAnalyzer.buildMasterPrompt(persona);
      
      // Stage 4: Generate avatar URL
      const avatarUrl = promptBuilder.generateAvatarUrl(persona);
      
      // Stage 5: Prepare comprehensive agent data
      const agentData = {
        ...persona,
        avatar_url: avatarUrl,
        master_system_prompt: masterSystemPrompt,
        status: 'active',
        source_meta: {
          source_type: 'transcript',
          doc_ref: transcriptData.file_name || 'uploaded_file',
          row_id: transcriptData.row_id || null,
          created_by: adminId,
          created_at: new Date().toISOString()
        }
      };
      
      // Stage 6: Generate embedding for similarity search
      const embedding = await this.generateEmbedding(agentData);
      
      // Stage 7: Save agent to database
      const agentId = await this.saveAgent(agentData, embedding, adminId);
      
      return {
        id: agentId,
        name: agentData.name,
        persona: agentData,
        master_system_prompt: masterSystemPrompt,
        created_at: agentData.source_meta.created_at
      };
      
    } catch (error) {
      console.error('Agent Builder Error:', error);
      throw new Error(`Failed to create agent from transcript: ${error.message}`);
    }
  }

  /**
   * Validates input parameters for agent creation
   * 
   * @param {Object} transcriptData - Transcript data to validate
   * @param {Object} demographics - Demographics data to validate
   * @param {string} adminId - Admin ID to validate
   * @throws {Error} If validation fails
   */
  static validateInputs(transcriptData, demographics, adminId) {
    if (!transcriptData) {
      throw new Error('Transcript data is required');
    }

    if (!transcriptData.raw_text && !transcriptData.speaker_turns) {
      throw new Error('Transcript must contain either raw_text or speaker_turns');
    }

    if (transcriptData.raw_text && transcriptData.raw_text.length < 50) {
      throw new Error('Transcript is too short (minimum 50 characters)');
    }

    if (!demographics || typeof demographics !== 'object') {
      throw new Error('Demographics data is required');
    }

    if (!adminId || typeof adminId !== 'string') {
      throw new Error('Admin ID is required');
    }
  }

  /**
   * Cleans and normalizes transcript data
   * 
   * @param {Object|string} transcriptData - Raw transcript data
   * @returns {Object} Cleaned transcript data
   */
  static cleanTranscript(transcriptData) {
    if (typeof transcriptData === 'string') {
      return {
        raw_text: transcriptData.trim(),
        speaker_turns: [],
        metadata: { format: 'text' }
      };
    }

    // Normalize whitespace in raw text
    if (transcriptData.raw_text) {
      transcriptData.raw_text = transcriptData.raw_text
        .replace(/\n\s*\n/g, '\n') // Remove duplicate blank lines
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
    }

    return transcriptData;
  }

  /**
   * Generates embedding vector for similarity search
   * 
   * @param {Object} agentData - Complete agent data
   * @returns {Array} Embedding vector
   */
  static async generateEmbedding(agentData) {
    try {
      // Create comprehensive text representation for embedding
      const embeddingText = [
        agentData.name || '',
        agentData.role_title || '',
        agentData.company || '',
        agentData.location || '',
        (agentData.objectives || []).join(' '),
        (agentData.needs || []).join(' '),
        (agentData.real_quotes || []).join(' '),
        JSON.stringify(agentData.speech_patterns || {}),
        JSON.stringify(agentData.emotional_profile || {}),
        JSON.stringify(agentData.traits || {}),
        JSON.stringify(agentData.behaviors || {})
      ].join(' ');

      // TODO: Replace with actual embedding service (OpenAI, Cohere, etc.)
      // For now, create a deterministic placeholder embedding
      const embedding = this.generatePlaceholderEmbedding(embeddingText);
      
      return embedding;
    } catch (error) {
      console.error('Embedding generation failed:', error);
      // Return dummy embedding as fallback
      return Array(1536).fill(0.1);
    }
  }

  /**
   * Generates a placeholder embedding for development/testing
   * 
   * @param {string} text - Text to generate embedding for
   * @returns {Array} Placeholder embedding vector
   */
  static generatePlaceholderEmbedding(text) {
    const vectorSize = 1536; // OpenAI text-embedding-ada-002 dimension
    const embedding = new Array(vectorSize).fill(0);
    
    // Create deterministic variation based on text content
    const seed = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    for (let i = 0; i < vectorSize; i++) {
      embedding[i] = Math.sin(seed + i) * 0.1;
    }
    
    return embedding;
  }

  /**
   * Saves agent to database with all enhanced fields
   * 
   * @param {Object} agentData - Complete agent data
   * @param {Array} embedding - Embedding vector
   * @param {string} adminId - Admin ID
   * @returns {string} Created agent ID
   */
  static async saveAgent(agentData, embedding, adminId) {
    try {
      const agentId = uuidv4();
      const now = new Date().toISOString();
      
      const query = `
        INSERT INTO agents (
          id, name, role_title, company, location, demographics, traits, behaviors,
          objectives, needs, fears, apprehensions, motivations, frustrations,
          domain_literacy, tech_savviness, communication_style, speech_patterns,
          vocabulary_profile, emotional_profile, cognitive_profile, knowledge_bounds,
          quote, master_system_prompt, avatar_url, status, source_meta, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30
        ) RETURNING id
      `;

      const values = [
        agentId,
        agentData.name,
        agentData.role_title || 'AI Persona',
        agentData.company || 'Unknown',
        agentData.location || 'Unknown',
        JSON.stringify(agentData.demographics || {}),
        JSON.stringify(agentData.traits || {}),
        JSON.stringify(agentData.behaviors || {}),
        agentData.objectives || [],
        agentData.needs || [],
        agentData.fears || [],
        agentData.apprehensions || [],
        agentData.motivations || [],
        agentData.frustrations || [],
        JSON.stringify(agentData.domain_literacy || {}),
        agentData.tech_savviness || 'medium',
        JSON.stringify(agentData.communication_style || {}),
        JSON.stringify(agentData.speech_patterns || {}),
        JSON.stringify(agentData.vocabulary_profile || {}),
        JSON.stringify(agentData.emotional_profile || {}),
        JSON.stringify(agentData.cognitive_profile || {}),
        JSON.stringify(agentData.knowledge_bounds || {}),
        agentData.quote || '',
        agentData.master_system_prompt || '',
        agentData.avatar_url || '',
        agentData.status || 'active',
        JSON.stringify(agentData.source_meta || {}),
        now,
        now
      ];

      const result = await pool.query(query, values);
      
      return result.rows[0].id;
    } catch (error) {
      console.error('Database save failed:', error);
      throw new Error(`Failed to save agent to database: ${error.message}`);
    }
  }

  /**
   * Retrieves an agent by ID
   * 
   * @param {string} agentId - Agent ID to retrieve
   * @returns {Object} Agent data
   */
  static async getAgentById(agentId) {
    try {
      const result = await pool.query(
        'SELECT * FROM agents WHERE id = $1',
        [agentId]
      );
      
      if (result.rows.length === 0) {
        throw new Error('Agent not found');
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error retrieving agent:', error);
      throw new Error(`Failed to retrieve agent: ${error.message}`);
    }
  }

  /**
   * Lists agents with optional filtering
   * 
   * @param {Object} filters - Filter options
   * @returns {Array} List of agents
   */
  static async listAgents(filters = {}) {
    try {
      const { 
        status = 'active', 
        search, 
        limit = 20, 
        offset = 0,
        createdBy 
      } = filters;
      
      let query = 'SELECT * FROM agents WHERE status = $1';
      const params = [status];
      let paramCount = 1;
      
      if (search) {
        paramCount++;
        query += ` AND (name ILIKE $${paramCount} OR role_title ILIKE $${paramCount} OR company ILIKE $${paramCount})`;
        params.push(`%${search}%`);
      }
      
      if (createdBy) {
        paramCount++;
        query += ` AND source_meta->>'created_by' = $${paramCount}`;
        params.push(createdBy);
      }
      
      query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, offset);
      
      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error listing agents:', error);
      throw new Error(`Failed to list agents: ${error.message}`);
    }
  }

  /**
   * Updates agent status
   * 
   * @param {string} agentId - Agent ID to update
   * @param {string} status - New status
   * @param {string} updatedBy - User updating the agent
   * @returns {Object} Updated agent data
   */
  static async updateAgentStatus(agentId, status, updatedBy) {
    try {
      const validStatuses = ['active', 'sleeping', 'archived'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid status. Must be one of: active, sleeping, archived');
      }
      
      const now = new Date().toISOString();
      const result = await pool.query(
        'UPDATE agents SET status = $1, updated_at = $2, updated_by = $3 WHERE id = $4 RETURNING id, name, status',
        [status, now, updatedBy, agentId]
      );
      
      if (result.rows.length === 0) {
        throw new Error('Agent not found');
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error updating agent status:', error);
      throw new Error(`Failed to update agent status: ${error.message}`);
    }
  }

  /**
   * Finds similar agents using text search
   * 
   * @param {string} query - Search query
   * @param {number} limit - Maximum number of results
   * @returns {Array} Similar agents
   */
  static async findSimilarAgents(query, limit = 5) {
    try {
      const result = await pool.query(
        `SELECT id, name, role_title, company, master_system_prompt, 
                ts_rank(to_tsvector('english', name || ' ' || role_title || ' ' || company), plainto_tsquery('english', $1)) as rank
         FROM agents 
         WHERE status = 'active' 
         AND to_tsvector('english', name || ' ' || role_title || ' ' || company) @@ plainto_tsquery('english', $1)
         ORDER BY rank DESC 
         LIMIT $2`,
        [query, limit]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Similar agents search failed:', error);
      return [];
    }
  }

  /**
   * Deletes an agent (soft delete by setting status to archived)
   * 
   * @param {string} agentId - Agent ID to delete
   * @param {string} deletedBy - User deleting the agent
   * @returns {boolean} Success status
   */
  static async deleteAgent(agentId, deletedBy) {
    try {
      const result = await this.updateAgentStatus(agentId, 'archived', deletedBy);
      return !!result;
    } catch (error) {
      console.error('Error deleting agent:', error);
      throw new Error(`Failed to delete agent: ${error.message}`);
    }
  }
}

module.exports = AgentBuilder;
