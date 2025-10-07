/**
 * PersonaExtractor - Extract detailed persona data from transcripts using GPT-4o
 * Integrates with Pinecone for vector storage and search
 */

const { OpenAI } = require('openai');
const { Pinecone } = require('@pinecone-database/pinecone');
const EnhancedPersonaTemplate = require('./enhancedPersonaTemplate');

class PersonaExtractor {
    constructor() {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY environment variable is required');
        }
        
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        
        if (process.env.PINECONE_API_KEY) {
            this.pinecone = new Pinecone({
                apiKey: process.env.PINECONE_API_KEY
            });
            
            this.index = this.pinecone.index(process.env.PINECONE_INDEX_NAME || 'persona-vectors');
        } else {
            console.warn('PINECONE_API_KEY not provided, vector storage will be disabled');
            this.pinecone = null;
            this.index = null;
        }
    }

    /**
     * Extract persona data from transcript text
     * @param {string} transcriptText - Raw transcript text
     * @param {Object} demographics - Basic demographics (optional)
     * @returns {Object} Extracted persona data
     */
    async extractPersona(transcriptText, demographics = {}) {
        try {
            console.log('Starting persona extraction...');
            
            const prompt = this.buildExtractionPrompt(transcriptText, demographics);
            
            const response = await this.openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert persona analyst. Extract detailed persona information from transcript text. Return valid JSON only."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 2000
            });

            let content = response.choices[0].message.content;
            
            // Remove markdown code blocks if present
            if (content.includes('```json')) {
                content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            } else if (content.includes('```')) {
                content = content.replace(/```\n?/g, '');
            }
            
            const extractedData = JSON.parse(content);
            
            // Validate extracted data
            const validation = EnhancedPersonaTemplate.validatePersonaData(extractedData);
            if (!validation.isValid) {
                console.warn('Persona validation failed, missing sections:', validation.missingSections);
            }
            
            // Enhance persona data with calculated fields
            const enhancedData = EnhancedPersonaTemplate.enhancePersonaData(extractedData);
            
            // Generate embedding for vector storage (optional)
            let embedding = null;
            try {
                embedding = await this.generateEmbedding(enhancedData);
            } catch (error) {
                console.warn('Embedding generation failed, continuing without vector storage:', error.message);
            }
            
            // Store in Pinecone if available
            if (this.index && embedding) {
                try {
                    await this.storePersonaVector(enhancedData, embedding);
                } catch (error) {
                    console.warn('Vector storage failed, continuing without storage:', error.message);
                }
            }
            
            console.log('Persona extraction completed:', enhancedData);
            return enhancedData;
            
        } catch (error) {
            console.error('Persona extraction failed:', error);
            throw new Error(`Persona extraction failed: ${error.message}`);
        }
    }

    /**
     * Build extraction prompt for GPT-4o using enhanced template
     */
    buildExtractionPrompt(transcriptText, demographics) {
        return EnhancedPersonaTemplate.buildExtractionPrompt(transcriptText, demographics);
    }

    /**
     * Generate embedding for persona data
     */
    async generateEmbedding(personaData) {
        try {
            const textToEmbed = JSON.stringify(personaData);
            
            const response = await this.openai.embeddings.create({
                model: "text-embedding-3-small",
                input: textToEmbed
            });
            
            return response.data[0].embedding;
        } catch (error) {
            console.error('Embedding generation failed:', error);
            throw new Error(`Embedding generation failed: ${error.message}`);
        }
    }

    /**
     * Store persona vector in Pinecone
     */
    async storePersonaVector(personaData, embedding) {
        try {
            const vectorId = `persona_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            await this.index.upsert([{
                id: vectorId,
                values: embedding,
                metadata: {
                    name: personaData.name,
                    occupation: personaData.occupation,
                    location: personaData.location,
                    extracted_at: new Date().toISOString(),
                    ...personaData
                }
            }]);
            
            console.log('Persona vector stored:', vectorId);
            return vectorId;
        } catch (error) {
            console.error('Vector storage failed:', error);
            throw new Error(`Vector storage failed: ${error.message}`);
        }
    }

    /**
     * Search similar personas
     */
    async searchSimilarPersonas(query, topK = 5) {
        try {
            const queryEmbedding = await this.generateEmbedding({ query });
            
            const searchResponse = await this.index.query({
                vector: queryEmbedding,
                topK: topK,
                includeMetadata: true
            });
            
            return searchResponse.matches.map(match => ({
                id: match.id,
                score: match.score,
                metadata: match.metadata
            }));
        } catch (error) {
            console.error('Persona search failed:', error);
            throw new Error(`Persona search failed: ${error.message}`);
        }
    }

    /**
     * Get persona by ID
     */
    async getPersonaById(personaId) {
        try {
            const response = await this.index.fetch([personaId]);
            return response.vectors[personaId];
        } catch (error) {
            console.error('Persona retrieval failed:', error);
            throw new Error(`Persona retrieval failed: ${error.message}`);
        }
    }

    /**
     * Generate conversation starters for a persona
     */
    generateConversationStarters(personaData) {
        return EnhancedPersonaTemplate.generateConversationStarters(personaData);
    }

    /**
     * Generate design testing scenarios for a persona
     */
    generateDesignTestingScenarios(personaData) {
        return EnhancedPersonaTemplate.generateDesignTestingScenarios(personaData);
    }

    /**
     * Generate persona summary
     */
    generatePersonaSummary(personaData) {
        return EnhancedPersonaTemplate.generatePersonaSummary(personaData);
    }

    /**
     * Extract key behavioral patterns from transcript
     */
    extractBehavioralPatterns(transcriptText) {
        const patterns = {
            hesitation_indicators: [],
            emphasis_patterns: [],
            question_patterns: [],
            agreement_patterns: [],
            disagreement_patterns: [],
            emotional_indicators: []
        };

        // Simple pattern extraction (can be enhanced with NLP)
        const text = transcriptText.toLowerCase();
        
        // Hesitation indicators
        patterns.hesitation_indicators = [
            'um', 'uh', 'er', 'like', 'you know', 'actually', 'basically'
        ].filter(word => text.includes(word));

        // Question patterns
        patterns.question_patterns = [
            'how', 'what', 'why', 'when', 'where', 'can you', 'could you', 'would you'
        ].filter(word => text.includes(word));

        // Emotional indicators
        patterns.emotional_indicators = [
            'frustrated', 'excited', 'worried', 'confused', 'happy', 'sad', 'angry'
        ].filter(word => text.includes(word));

        return patterns;
    }
}

module.exports = PersonaExtractor;
