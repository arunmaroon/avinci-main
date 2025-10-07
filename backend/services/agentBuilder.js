/**
 * Agent Builder - Two-stage pipeline for transcript-grounded persona creation
 * Implements the blueprint's analysis and synthesis pipeline
 */

const { pool } = require('../models/database');
const providerGateway = require('./providerGateway');
const PromptBuilder = require('./promptBuilder');
const { v4: uuidv4 } = require('uuid');

class AgentBuilder {
    /**
     * Main entry point: Process transcript through two-stage pipeline
     */
    static async processTranscript(transcriptData, demographics = {}, adminId) {
        try {
            console.log('Starting two-stage agent creation pipeline...');
            
            // Stage 1: Extract behavioral DNA (low-temperature analysis)
            console.log('Stage 1: Extracting behavioral DNA...');
            const analysis = await this.extractBehavioralDNA(transcriptData, demographics);
            
            // Stage 2: Synthesize persona and master system prompt
            console.log('Stage 2: Synthesizing persona...');
            const synthesis = this.synthesizePersona(analysis, demographics);
            
            // Generate avatar URL
            const avatarUrl = PromptBuilder.generateAvatarUrl(synthesis.persona);
            
            // Prepare comprehensive agent data
            const agentData = {
                ...synthesis.persona,
                avatar_url: avatarUrl,
                master_system_prompt: synthesis.master_system_prompt,
                status: 'active',
                source_meta: {
                    source_type: 'transcript',
                    doc_ref: transcriptData.file_name || 'uploaded_file',
                    row_id: transcriptData.row_id || null,
                    created_by: adminId
                }
            };
            
            // Generate embedding for similarity search
            const embedding = await this.generateEmbedding(agentData);
            
            // Save agent to database
            console.log('Saving agent to database...');
            const agentId = await this.saveAgent(agentData, embedding, adminId);
            
            console.log(`Agent created successfully: ${agentId}`);
            return agentId;
            
        } catch (error) {
            console.error('Agent Builder Error:', error);
            throw new Error('Failed to create agent from transcript: ' + error.message);
        }
    }

    /**
     * Stage 1: Extract behavioral DNA using low-temperature analysis
     */
    static async extractBehavioralDNA(transcriptData, demographics) {
        try {
            console.log('Extracting behavioral signals from transcript...');
            
            const systemPrompt = `You extract behavioral and persona signals as JSON only with the exact keys requested.`;
            const userPrompt = `
TRANSCRIPT:
${transcriptData.raw_text || transcriptData}

DEMOGRAPHICS:
${JSON.stringify(demographics)}

OUTPUT STRICT JSON:
{
 "speech_patterns":{"sentence_length":"short|medium|long","formality":1-10,"filler_words":[],"common_phrases":[],"self_corrections":"never|rare|occasional|frequent","question_style":"direct|indirect|clarifying"},
 "vocabulary_profile":{"complexity":1-10,"avoided_words":[],"common_words":[]},
 "emotional_profile":{"baseline":"positive|neutral|negative|anxious|enthusiastic","frustration_triggers":[],"excitement_triggers":[]},
 "cognitive_profile":{"comprehension_speed":"slow|medium|fast","patience":1-10},
 "objectives":[],"needs":[],"fears":[],"apprehensions":[],
 "knowledge_bounds":{"confident":[],"partial":[],"unknown":[]},
 "real_quotes":[]
}
Return JSON only with no extra text.`;

            const messages = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ];

            const response = await providerGateway.chat(messages, {
                temperature: 0.2,
                max_tokens: 1500
            });

            const analysis = JSON.parse(response);
            
            console.log('Behavioral analysis completed:', {
                speech_patterns: analysis.speech_patterns,
                emotional_profile: analysis.emotional_profile,
                real_quotes_count: analysis.real_quotes?.length || 0
            });
            
            return analysis;
        } catch (error) {
            console.error('Behavioral DNA extraction failed:', error);
            throw new Error('Failed to extract behavioral DNA: ' + error.message);
        }
    }

    /**
     * Stage 2: Synthesize persona and master system prompt
     */
    static synthesizePersona(analysis, demographics) {
        try {
            console.log('Synthesizing persona and master system prompt...');
            
            const persona = {
                name: demographics.name,
                age: demographics.age,
                gender: demographics.gender,
                role_title: demographics.role_title,
                company: demographics.company,
                location: demographics.location,
                demographics: { ...demographics },
                traits: { 
                    personality_archetype: demographics.archetype, 
                    big5: demographics.big5, 
                    adjectives: analysis?.traits ?? [] 
                },
                behaviors: { 
                    habits: [], 
                    channels: [], 
                    tools: [], 
                    journey_highlights: [] 
                },
                objectives: analysis.objectives || [],
                needs: analysis.needs || [],
                fears: analysis.fears || [],
                apprehensions: analysis.apprehensions || [],
                motivations: [], 
                frustrations: [],
                domain_literacy: { 
                    dimension: demographics.domain ?? "finance", 
                    level: "medium" 
                },
                tech_savviness: demographics.tech ?? "medium",
                communication_style: {
                    sentence_length: analysis.speech_patterns?.sentence_length || "medium",
                    formality: analysis.speech_patterns?.formality || 5,
                    question_style: analysis.speech_patterns?.question_style || "direct"
                },
                speech_patterns: analysis.speech_patterns || {},
                vocabulary_profile: analysis.vocabulary_profile || {},
                emotional_profile: analysis.emotional_profile || {},
                cognitive_profile: analysis.cognitive_profile || {},
                knowledge_bounds: analysis.knowledge_bounds || {},
                quote: analysis.real_quotes?.[0]
            };
            
            const masterSystemPrompt = PromptBuilder.buildMasterPrompt(persona);
            
            console.log('Persona synthesis completed');
            return { persona, master_system_prompt: masterSystemPrompt };
        } catch (error) {
            console.error('Persona synthesis failed:', error);
            throw new Error('Failed to synthesize persona: ' + error.message);
        }
    }

    /**
     * Parse synthesis result and create comprehensive persona data
     */
    static parseSynthesisResult(synthesis, analysis, demographics) {
        try {
            // Try to parse as JSON first
            let parsedSynthesis;
            try {
                parsedSynthesis = JSON.parse(synthesis);
            } catch (e) {
                // If not JSON, create a structured response
                parsedSynthesis = {
                    persona: {
                        name: demographics.name || 'Generated Agent',
                        background: synthesis,
                        personality_traits: analysis.objectives || [],
                        communication_style: analysis.speech_patterns || {}
                    },
                    master_system_prompt: synthesis
                };
            }

            // Extract persona data
            const persona = parsedSynthesis.persona || {};
            const masterSystemPrompt = parsedSynthesis.master_system_prompt || synthesis;

            // Create comprehensive persona data
            const personaData = {
                // Basic info
                name: persona.name || demographics.name || 'Generated Agent',
                persona_type: persona.persona_type || 'transcript_generated',
                
                // Demographics
                age: demographics.age || null,
                gender: demographics.gender || null,
                occupation: demographics.occupation || null,
                location: demographics.location || null,
                
                // Behavioral analysis
                speech_patterns: analysis.speech_patterns || {},
                vocabulary_profile: analysis.vocabulary_profile || {},
                emotional_profile: analysis.emotional_profile || {},
                cognitive_profile: analysis.cognitive_profile || {},
                
                // Goals and motivations
                objectives: analysis.objectives || [],
                needs: analysis.needs || [],
                fears: analysis.fears || [],
                apprehensions: analysis.apprehensions || [],
                
                // Knowledge and capabilities
                knowledge_bounds: analysis.knowledge_bounds || {},
                real_quotes: analysis.real_quotes || [],
                
                // System prompt
                master_system_prompt: masterSystemPrompt,
                
                // Additional persona data
                background_story: persona.background || '',
                personality_traits: persona.personality_traits || [],
                communication_style: persona.communication_style || {},
                
                // Status
                status: 'active'
            };

            console.log('Persona data parsed successfully:', {
                name: personaData.name,
                objectives_count: personaData.objectives.length,
                real_quotes_count: personaData.real_quotes.length,
                master_prompt_length: personaData.master_system_prompt.length
            });

            return personaData;
        } catch (error) {
            console.error('Synthesis parsing failed:', error);
            throw new Error('Failed to parse synthesis result: ' + error.message);
        }
    }

    /**
     * Generate embedding for similarity search
     */
    static async generateEmbedding(personaData) {
        try {
            // Create a comprehensive text representation for embedding
            const embeddingText = [
                personaData.name || '',
                personaData.role_title || '',
                personaData.company || '',
                personaData.location || '',
                (personaData.objectives || []).join(' '),
                (personaData.needs || []).join(' '),
                (personaData.real_quotes || []).join(' '),
                JSON.stringify(personaData.speech_patterns || {}),
                JSON.stringify(personaData.emotional_profile || {}),
                JSON.stringify(personaData.traits || {}),
                JSON.stringify(personaData.behaviors || {})
            ].join(' ');

            // For now, create a dummy embedding (in production, use actual embedding service)
            const embedding = Array(1536).fill(0).map(() => Math.random() - 0.5);
            
            console.log('Embedding generated for persona');
            return embedding;
        } catch (error) {
            console.error('Embedding generation failed:', error);
            // Return dummy embedding as fallback
            return Array(1536).fill(0.1);
        }
    }

    /**
     * Save agent to database with all enhanced fields
     */
    static async saveAgent(personaData, embedding, adminId) {
        try {
            const agentId = uuidv4();
            
            const query = `
                INSERT INTO agents (
                    name, role_title, company, location, demographics, traits, behaviors,
                    objectives, needs, fears, apprehensions, motivations, frustrations,
                    domain_literacy, tech_savviness, communication_style, speech_patterns,
                    vocabulary_profile, emotional_profile, cognitive_profile, knowledge_bounds,
                    quote, master_system_prompt, status, source_meta
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25
                ) RETURNING id
            `;

            const values = [
                personaData.name,
                personaData.role_title || 'AI Persona',
                personaData.company || 'Unknown',
                personaData.location || 'Unknown',
                JSON.stringify(personaData.demographics || {}),
                JSON.stringify(personaData.traits || {}),
                JSON.stringify(personaData.behaviors || {}),
                personaData.objectives || [],
                personaData.needs || [],
                personaData.fears || [],
                personaData.apprehensions || [],
                personaData.motivations || [],
                personaData.frustrations || [],
                JSON.stringify(personaData.domain_literacy || {}),
                personaData.tech_savviness || 'medium',
                JSON.stringify(personaData.communication_style || {}),
                JSON.stringify(personaData.speech_patterns || {}),
                JSON.stringify(personaData.vocabulary_profile || {}),
                JSON.stringify(personaData.emotional_profile || {}),
                JSON.stringify(personaData.cognitive_profile || {}),
                JSON.stringify(personaData.knowledge_bounds || {}),
                personaData.quote || '',
                personaData.master_system_prompt || '',
                personaData.status || 'active',
                JSON.stringify(personaData.source_meta || {})
            ];

            const result = await pool.query(query, values);
            
            console.log(`Agent saved successfully: ${result.rows[0].id}`);
            return result.rows[0].id;
        } catch (error) {
            console.error('Database save failed:', error);
            throw new Error('Failed to save agent to database: ' + error.message);
        }
    }

    /**
     * Clean and normalize transcript data
     */
    static cleanTranscript(transcriptData) {
        if (typeof transcriptData === 'string') {
            return {
                raw_text: transcriptData,
                speaker_turns: [],
                metadata: { format: 'text' }
            };
        }

        // Normalize whitespace
        if (transcriptData.raw_text) {
            transcriptData.raw_text = transcriptData.raw_text
                .replace(/\n\s*\n/g, '\n') // Remove duplicate blank lines
                .replace(/\s+/g, ' ') // Normalize whitespace
                .trim();
        }

        return transcriptData;
    }

    /**
     * Validate transcript data
     */
    static validateTranscript(transcriptData) {
        if (!transcriptData) {
            throw new Error('Transcript data is required');
        }

        if (!transcriptData.raw_text && !transcriptData.speaker_turns) {
            throw new Error('Transcript must contain either raw_text or speaker_turns');
        }

        if (transcriptData.raw_text && transcriptData.raw_text.length < 50) {
            throw new Error('Transcript is too short (minimum 50 characters)');
        }

        return true;
    }
}

module.exports = AgentBuilder;