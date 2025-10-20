/**
 * Accurate Transcript Upload Route
 * Extracts persona EXACTLY from the transcript without random generation
 */

const express = require('express');
const { ChatOpenAI } = require("@langchain/openai");
const { pool } = require('../models/database');

const router = express.Router();

/**
 * @route POST /api/accurate-transcript/upload
 * @desc Extract persona EXACTLY from transcript - no random generation
 * @access Public (for testing)
 */
router.post('/upload', async (req, res) => {
    try {
        const { transcript, requestId } = req.body;
        
        if (!transcript) {
            return res.status(400).json({ error: 'Transcript is required' });
        }
        
        // Socket.IO progress emitter
        const io = req.app.get('io');
        const emit = (step, message, data = {}) => {
            try {
                if (io && requestId) {
                    io.emit(`persona-generation:${requestId}`, {
                        step,
                        message,
                        data,
                        timestamp: new Date().toISOString()
                    });
                }
            } catch (_) {}
        };

        console.log('📝 Processing transcript (accurate extraction)...');
        emit('received', 'Transcript received');
        
        // Use OpenAI to extract persona from transcript EXACTLY
        const llm = new ChatOpenAI({
            modelName: "gpt-4o",
            temperature: 0.0, // Zero temperature for exact extraction
            maxTokens: 4000,
            openAIApiKey: process.env.OPENAI_API_KEY
        });
        
        const prompt = `You are a comprehensive persona extractor. Extract ALL available information from this user research transcript with 50+ detailed fields.

CRITICAL EXTRACTION RULES:
1. Extract ONLY from "Respondent:" answers (IGNORE "Moderator:" questions)
2. Use EXACT information as stated - no inference or generation
3. For missing data, use null or empty arrays []
4. Capture nuanced details, emotions, and context
5. Extract personality traits, values, motivations from their language and tone
6. Identify pain points, goals, and behavioral patterns from their statements

Extract this COMPREHENSIVE persona structure:

{
  "name": string,
  "age": integer,
  "gender": string,
  "location": {
    "city": string,
    "state": string
  },
  "profession": {
    "occupation": string,
    "background": string (their career history, income details if mentioned)
  },
  "personality": {
    "personality_traits": [string] (frank, cautious, optimistic, etc.),
    "values": [string] (transparency, discipline, family, etc.),
    "motivations": [string] (independence, security, success, etc.)
  },
  "hobbies": [string],
  "goals": {
    "short_term": [string],
    "long_term": [string]
  },
  "pain_points": {
    "general": [string] (frustrations, problems they mention),
    "ui_pain_points": [string] (UX issues, app problems)
  },
  "financial_profile": {
    "fintech_preferences": {
      "apps": [string],
      "banks": [string],
      "payment_habits": [string],
      "credit_cards": [string]
    }
  },
  "communication_style": {
    "tone": string (formal, casual, practical, optimistic, etc.),
    "vocabulary_level": string (conversational, technical, simple, etc.)
  },
  "emotional_profile": {
    "triggers": [string] (what frustrates or excites them),
    "responses": [string] (how they react),
    "tone": string (calm, anxious, energetic, etc.)
  },
  "social_context": {
    "family": string (family relationships and dynamics),
    "friends": string (social life description),
    "community_values": [string]
  },
  "cultural_background": {
    "heritage": string,
    "beliefs": [string],
    "traditions": [string]
  },
  "daily_routine": [string] (morning, afternoon, evening activities),
  "decision_making": {
    "style": string (calculated, impulsive, collaborative, etc.),
    "influences": [string] (what affects their decisions)
  },
  "life_events": [
    {
      "event": string,
      "year": integer,
      "impact": string
    }
  ],
  "tech_profile": {
    "tech_savviness": string (high/medium/low, details),
    "english_level": string (fluent, intermediate, basic, Hinglish, etc.),
    "domain_savvy": string (expert/intermediate/beginner in their field/domain)
  },
  "key_quotes": [string] (EXACT quotes from Respondent),
  "behavioral_patterns": {
    "habits": [string],
    "routines_beyond_daily": [string]
  },
  "relational_dynamics": {
    "family_interaction": string,
    "friend_interaction": string,
    "professional_interaction": string
  },
  "cognitive_biases": [string],
  "sensory_preferences": {
    "preferred_modalities": [string],
    "disliked_modalities": [string]
  },
  "humor_style": {
    "humor_type": string,
    "humor_level": string
  },
  "conflict_resolution": {
    "strategies": [string],
    "preferred_outcomes": string
  },
  "learning_style": {
    "style": string,
    "preferred_resources": [string]
  },
  "ethical_stance": {
    "financial_ethics": [string],
    "scam_sensitivity": string
  },
  "interaction_preferences": {
    "preferred_channels": [string],
    "response_time_expectations": string
  },
  "trust_factors": {
    "trust_builders": [string],
    "trust_breakers": [string]
  },
  "motivational_triggers": {
    "positive_triggers": [string],
    "negative_triggers": [string]
  }
}

EXTRACTION TIPS:
- Personality traits: Analyze HOW they speak (frank, cautious, optimistic, etc.)
- Values: What do they care about? (transparency, family, financial literacy)
- Pain points: What frustrates them? Separate general vs UI issues
- Goals: Look for "I want to...", "My goal is...", "I hope to..."
- Behavioral patterns: Daily habits, routines they mention
- Trust factors: What makes them trust or distrust something?
- Emotional profile: How do they express emotions? What triggers them?

Transcript:
${transcript}

Return ONLY valid JSON with ALL fields filled based on available data. Use [] or null for missing information. No markdown, no explanation.`;

        emit('llm_start', 'Analyzing transcript with GPT-4o');
        const response = await llm.invoke(prompt);
        
        // Clean up response
        let jsonContent = response.content.trim();
        if (jsonContent.startsWith('```json')) {
            jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (jsonContent.startsWith('```')) {
            jsonContent = jsonContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        
        let personaData;
        try {
            personaData = JSON.parse(jsonContent);
        } catch (e) {
            emit('llm_parse_error', 'Failed to parse AI response as JSON', { raw: jsonContent?.slice(0, 500) });
            throw e;
        }
        emit('llm_success', 'Persona extracted from transcript', { name: personaData?.name, occupation: personaData?.profession?.occupation || personaData?.occupation });
        
        console.log('✅ Extracted persona:', personaData);
        
        // Build location string from nested structure
        let fullLocation = '';
        if (personaData.location) {
            if (typeof personaData.location === 'string') {
                fullLocation = personaData.location;
            } else {
                fullLocation = personaData.location.city || '';
                if (personaData.location.state) {
                    fullLocation = `${fullLocation}, ${personaData.location.state}`;
                }
            }
        }
        
        // Get image from Unsplash based on ACTUAL persona data
        let imageUrl = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
        
        try {
            const UnsplashImageService = require('../services/unsplashImageService');
            const unsplashService = new UnsplashImageService();
            
            // Build search query from actual data
            const searchTerms = [];
            if (personaData.age) searchTerms.push(`${personaData.age} year old`);
            if (personaData.gender) searchTerms.push(personaData.gender);
            if (personaData.occupation) searchTerms.push(personaData.occupation);
            searchTerms.push('Indian professional');
            
            emit('image_start', 'Fetching profile image');
            const imageResult = await unsplashService.fetchPersonaImage({
                age: personaData.age,
                gender: personaData.gender,
                occupation: personaData.occupation
            });
            
            imageUrl = imageResult.url;
            console.log('✅ Fetched image from Unsplash');
            emit('image_success', 'Image fetched', { url: imageUrl });
        } catch (imgError) {
            console.warn('⚠️  Using fallback image:', imgError.message);
            emit('image_fallback', 'Using fallback image');
        }
        
        // Save to database with comprehensive data
        const insertQuery = `
            INSERT INTO ai_agents (
                name, occupation, location, age, gender, avatar_url, 
                pain_points, goals, motivations, personality, sample_quote,
                hobbies, daily_routine, background_story,
                tech_savviness, english_level, domain_savvy,
                communication_style, emotional_profile, speech_patterns,
                behavioral_patterns, cognitive_profile,
                comprehensive_persona_json,
                source_type, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
            RETURNING id, name, occupation, location, age, gender, avatar_url, created_at;
        `;
        
        // Extract nested fields safely
        const occupation = personaData.profession?.occupation || 'Not specified';
        const background = personaData.profession?.background || '';
        const painPoints = personaData.pain_points?.general || [];
        const uiPainPoints = personaData.pain_points?.ui_pain_points || [];
        const allPainPoints = [...painPoints, ...uiPainPoints];
        const shortTermGoals = personaData.goals?.short_term || [];
        const longTermGoals = personaData.goals?.long_term || [];
        const allGoals = [...shortTermGoals, ...longTermGoals];
        const personalityTraits = personaData.personality?.personality_traits || [];
        const values = personaData.personality?.values || [];
        const motivations = personaData.personality?.motivations || [];
        
        emit('db_start', 'Saving persona to database');
        
        // Safely convert arrays to JSONB (hobbies and daily_routine are JSONB columns, not TEXT[])
        const hobbiesJson = JSON.stringify(Array.isArray(personaData.hobbies) ? personaData.hobbies : []);
        const dailyRoutineJson = JSON.stringify(Array.isArray(personaData.daily_routine) ? personaData.daily_routine : []);
        
        // Debug: Log the values being inserted
        const insertValues = [
            personaData.name || 'Unknown',
            occupation,
            fullLocation || 'Not specified',
            personaData.age,
            personaData.gender,
            imageUrl,
            allPainPoints,
            allGoals,
            motivations,
            JSON.stringify({ 
                traits: personalityTraits,
                values: values,
                full_data: personaData.personality || {}
            }),
            personaData.key_quotes?.[0] || '',
            hobbiesJson, // JSONB column
            dailyRoutineJson, // JSONB column
            background,
            (personaData.tech_profile?.tech_savviness || 'medium').substring(0, 100),
            (personaData.tech_profile?.english_level || 'intermediate').substring(0, 100),
            (personaData.tech_profile?.domain_savvy || 'intermediate').substring(0, 20),
            JSON.stringify(personaData.communication_style || {}),
            JSON.stringify(personaData.emotional_profile || {}),
            JSON.stringify({
                formality: 5,
                vocabulary_level: personaData.communication_style?.vocabulary_level || 'conversational',
                tone: personaData.communication_style?.tone || 'neutral'
            }),
            personaData.behavioral_patterns ? JSON.stringify(personaData.behavioral_patterns) : null,
            JSON.stringify({
                learning_style: personaData.learning_style || {},
                decision_making: personaData.decision_making || {},
                cognitive_biases: personaData.cognitive_biases || []
            }),
            JSON.stringify(personaData), // Store full comprehensive persona
            'transcript',
            new Date()
        ];
        
        console.log('🔍 Debug - Values being inserted:');
        console.log('  name:', insertValues[0]);
        console.log('  occupation:', insertValues[1]);
        console.log('  location:', insertValues[2]);
        console.log('  age:', insertValues[3]);
        console.log('  gender:', insertValues[4]);
        console.log('  hobbies:', insertValues[11], 'Type:', typeof insertValues[11], 'IsArray:', Array.isArray(insertValues[11]));
        console.log('  daily_routine:', insertValues[12], 'Type:', typeof insertValues[12], 'IsArray:', Array.isArray(insertValues[12]));
        console.log('  tech_savviness:', insertValues[14]);
        console.log('  english_level:', insertValues[15]);
        console.log('  domain_savvy:', insertValues[16]);
        console.log('  source_type:', insertValues[23]);
        
        const result = await pool.query(insertQuery, insertValues);
        
        const savedAgent = result.rows[0];
        console.log('💾 Saved accurate agent to database:', savedAgent.id, savedAgent.name);
        emit('db_success', 'Persona saved to database', { id: savedAgent.id });
        
        emit('done', 'Persona generation complete', { id: savedAgent.id });
        res.json({
            success: true,
            agent: savedAgent,
            extracted_data: personaData,
            message: `Persona generated from transcript: ${savedAgent.name}`
        });
        
    } catch (error) {
        console.error('❌ Error processing transcript:', error);
        try {
            const io = req.app.get('io');
            const { requestId } = req.body || {};
            if (io && requestId) {
                io.emit(`persona-generation:${requestId}`, {
                    step: 'error',
                    message: 'Failed to process transcript',
                    data: { error: error.message },
                    timestamp: new Date().toISOString()
                });
            }
        } catch (_) {}
        res.status(500).json({ 
            error: 'Failed to process transcript', 
            details: error.message 
        });
    }
});

module.exports = router;

