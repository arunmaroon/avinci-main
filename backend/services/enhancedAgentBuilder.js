/**
 * Enhanced Agent Builder - Complete transcript-to-persona pipeline
 * Integrates transcript analysis, persona synthesis, and database storage
 */

const { pool } = require('../models/database');
const { v4: uuidv4 } = require('uuid');
const transcriptAnalyzer = require('./transcriptAnalyzer');
const personaSynthesizer = require('./personaSynthesizer');

class EnhancedAgentBuilder {
    async createAgentFromTranscript(transcriptData, demographics, createdBy) {
        try {
            console.log('Starting agent creation from transcript...');
            
            // Step 1: Analyze transcript
            console.log('Analyzing transcript...');
            const analysis = await transcriptAnalyzer.analyzeTranscript(transcriptData, demographics);
            
            // Step 2: Synthesize persona
            console.log('Synthesizing persona...');
            const persona = personaSynthesizer.synthesizePersona(analysis, demographics);
            
            // Step 3: Build master system prompt
            console.log('Building master system prompt...');
            const masterSystemPrompt = personaSynthesizer.buildMasterPrompt(persona);
            
            // Step 4: Generate embedding (placeholder - would use OpenAI embeddings in production)
            const embedding = this.generatePlaceholderEmbedding(persona);
            
            // Step 5: Save to database
            console.log('Saving agent to database...');
            const agentId = await this.saveAgentToDatabase({
                ...persona,
                master_system_prompt: masterSystemPrompt,
                embedding: embedding,
                created_by: createdBy
            });
            
            console.log(`Agent created successfully: ${agentId}`);
            return {
                id: agentId,
                name: persona.name,
                persona: persona,
                master_system_prompt: masterSystemPrompt,
                created_at: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('Agent creation failed:', error);
            throw new Error('Failed to create agent from transcript: ' + error.message);
        }
    }

    async saveAgentToDatabase(agentData) {
        const agentId = uuidv4();
        const now = new Date().toISOString();
        
        const query = `
            INSERT INTO agents (
                id, name, persona, knowledge_level, language_style, emotional_range,
                hesitation_level, traits, prompt, objectives, needs,
                apprehensions, speech_patterns, vocabulary_profile, emotional_profile,
                cognitive_profile, master_system_prompt, embedding, status, created_at, updated_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
            ) RETURNING id
        `;
        
        const values = [
            agentId,
            agentData.name,
            agentData.persona || 'Generated Persona',
            agentData.knowledge_level || 'Intermediate',
            agentData.language_style || 'Conversational',
            agentData.emotional_range || 'Moderate',
            agentData.hesitation_level || 'Medium',
            JSON.stringify(agentData.traits || []),
            agentData.prompt || '',
            JSON.stringify(agentData.objectives || []),
            JSON.stringify(agentData.needs || []),
            JSON.stringify(agentData.apprehensions || []),
            JSON.stringify(agentData.speech_patterns || {}),
            JSON.stringify(agentData.vocabulary_profile || {}),
            JSON.stringify(agentData.emotional_profile || {}),
            JSON.stringify(agentData.cognitive_profile || {}),
            agentData.master_system_prompt,
            agentData.embedding,
            'active',
            now,
            now
        ];
        
        const result = await pool.query(query, values);
        return result.rows[0].id;
    }

    generatePlaceholderEmbedding(persona) {
        // In production, this would call OpenAI's embedding API
        // For now, generate a placeholder vector
        const vectorSize = 1536; // OpenAI text-embedding-ada-002 dimension
        const embedding = new Array(vectorSize).fill(0);
        
        // Add some variation based on persona characteristics
        const seed = persona.name.charCodeAt(0) + persona.age;
        for (let i = 0; i < vectorSize; i++) {
            embedding[i] = Math.sin(seed + i) * 0.1;
        }
        
        return `[${embedding.join(',')}]`;
    }

    async findSimilarAgents(query, limit = 5) {
        // In production, this would use vector similarity search
        // For now, do a simple text search
        try {
            const result = await pool.query(
                `SELECT id, name, persona, master_system_prompt, 
                        ts_rank(to_tsvector('english', name || ' ' || persona), plainto_tsquery('english', $1)) as rank
                 FROM agents 
                 WHERE status = 'active' 
                 AND to_tsvector('english', name || ' ' || persona) @@ plainto_tsquery('english', $1)
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

    async updateAgentStatus(agentId, status, updatedBy) {
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
    }

    async getAgentById(agentId) {
        const result = await pool.query(
            'SELECT * FROM agents WHERE id = $1',
            [agentId]
        );
        
        if (result.rows.length === 0) {
            throw new Error('Agent not found');
        }
        
        return result.rows[0];
    }

    async listAgents(filters = {}) {
        const { status = 'active', search, limit = 20, offset = 0 } = filters;
        
        let query = 'SELECT * FROM agents WHERE status = $1';
        const params = [status];
        let paramCount = 1;
        
        if (search) {
            paramCount++;
            query += ` AND (name ILIKE $${paramCount} OR persona ILIKE $${paramCount})`;
            params.push(`%${search}%`);
        }
        
        query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
        params.push(limit, offset);
        
        const result = await pool.query(query, params);
        return result.rows;
    }
}

module.exports = new EnhancedAgentBuilder();
