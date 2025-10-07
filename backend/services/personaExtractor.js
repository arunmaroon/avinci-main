/**
 * PersonaExtractor - Extract detailed persona data from transcripts using GPT-4o
 * Integrates with Pinecone for vector storage and search
 */

const { OpenAI } = require('openai');
const { Pinecone } = require('@pinecone-database/pinecone');

class PersonaExtractor {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
        
        this.pinecone = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY
        });
        
        this.index = this.pinecone.index(process.env.PINECONE_INDEX_NAME || 'persona-vectors');
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

            const extractedData = JSON.parse(response.choices[0].message.content);
            
            // Generate embedding for vector storage
            const embedding = await this.generateEmbedding(extractedData);
            
            // Store in Pinecone
            await this.storePersonaVector(extractedData, embedding);
            
            console.log('Persona extraction completed:', extractedData);
            return extractedData;
            
        } catch (error) {
            console.error('Persona extraction failed:', error);
            throw new Error(`Persona extraction failed: ${error.message}`);
        }
    }

    /**
     * Build extraction prompt for GPT-4o
     */
    buildExtractionPrompt(transcriptText, demographics) {
        return `
Analyze the following transcript and extract detailed persona information. Return a JSON object with these exact keys:

{
  "name": "Person's name or generate Indian name",
  "age": "Estimated age (number)",
  "occupation": "Job title or profession",
  "company": "Company name or generate Indian company",
  "location": "City, State or generate Indian location",
  "education": "Education level",
  "hobbies": ["hobby1", "hobby2", "hobby3"],
  "pain_points": ["pain1", "pain2", "pain3"],
  "key_quotes": ["quote1", "quote2", "quote3"],
  "communication_style": {
    "formality": "casual|professional|formal",
    "sentence_length": "short|medium|long",
    "filler_words": ["um", "like", "you know"],
    "common_phrases": ["phrase1", "phrase2"]
  },
  "emotional_profile": {
    "baseline_mood": "positive|neutral|negative",
    "frustration_triggers": ["trigger1", "trigger2"],
    "excitement_triggers": ["trigger1", "trigger2"]
  },
  "tech_savviness": "low|medium|high",
  "domain_knowledge": "low|medium|high",
  "personality_traits": ["trait1", "trait2", "trait3"],
  "goals": ["goal1", "goal2", "goal3"],
  "challenges": ["challenge1", "challenge2", "challenge3"]
}

Demographics context: ${JSON.stringify(demographics)}

Transcript:
${transcriptText}

Extract persona data and return valid JSON only:`;
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
}

module.exports = PersonaExtractor;
