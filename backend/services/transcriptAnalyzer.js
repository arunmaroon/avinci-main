/**
 * Transcript Analyzer - Extract behavioral signals from UX research transcripts
 * Low-temperature analysis to extract structured persona data
 */

const providerGateway = require('./providerGateway');

class TranscriptAnalyzer {
    async analyzeTranscript(fullTranscript, demographics) {
        const provider = providerGateway.getProvider();
        if (!provider) {
            throw new Error('No AI provider available for transcript analysis');
        }

        const systemPrompt = `You are an expert UX researcher extracting behavioral signals from real user research transcripts. 
        Analyze the transcript and extract structured data as JSON only. Be precise and objective in your analysis.`;

        const userPrompt = `
TRANSCRIPT:
${fullTranscript}

DEMOGRAPHICS:
${JSON.stringify(demographics, null, 2)}

Extract the following behavioral signals as structured JSON:

{
  "speech_patterns": {
    "sentence_length": "short|medium|long",
    "formality": 1-10,
    "filler_words": ["word1", "word2"],
    "common_phrases": ["phrase1", "phrase2"],
    "self_corrections": "never|rare|occasional|frequent",
    "question_style": "direct|indirect|clarifying"
  },
  "vocabulary_profile": {
    "complexity": 1-10,
    "avoided_words": ["word1", "word2"],
    "common_words": ["word1", "word2"]
  },
  "emotional_profile": {
    "baseline": "positive|neutral|negative|anxious|enthusiastic",
    "frustration_triggers": ["trigger1", "trigger2"],
    "excitement_triggers": ["trigger1", "trigger2"]
  },
  "cognitive_profile": {
    "comprehension_speed": "slow|medium|fast",
    "patience": 1-10
  },
  "objectives": ["objective1", "objective2"],
  "needs": ["need1", "need2"],
  "apprehensions": ["apprehension1", "apprehension2"],
  "real_quotes": ["quote1", "quote2", "quote3"],
  "knowledge_bounds": {
    "confident": ["topic1", "topic2"],
    "partial": ["topic1", "topic2"],
    "unknown": ["topic1", "topic2"]
  }
}

Return only valid JSON, no additional text.`;

        const messages = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
        ];

        try {
            const rawResponse = await provider.chat(messages, {
                temperature: 0.2,
                max_tokens: 1200
            });

            // Parse and validate the JSON response
            const analysis = JSON.parse(rawResponse);
            return this.validateAnalysis(analysis);
        } catch (error) {
            console.error('Transcript analysis failed:', error);
            throw new Error('Failed to analyze transcript: ' + error.message);
        }
    }

    validateAnalysis(analysis) {
        // Ensure required fields exist with defaults
        const validated = {
            speech_patterns: {
                sentence_length: analysis.speech_patterns?.sentence_length || 'medium',
                formality: analysis.speech_patterns?.formality || 5,
                filler_words: analysis.speech_patterns?.filler_words || [],
                common_phrases: analysis.speech_patterns?.common_phrases || [],
                self_corrections: analysis.speech_patterns?.self_corrections || 'occasional',
                question_style: analysis.speech_patterns?.question_style || 'direct'
            },
            vocabulary_profile: {
                complexity: analysis.vocabulary_profile?.complexity || 5,
                avoided_words: analysis.vocabulary_profile?.avoided_words || [],
                common_words: analysis.vocabulary_profile?.common_words || []
            },
            emotional_profile: {
                baseline: analysis.emotional_profile?.baseline || 'neutral',
                frustration_triggers: analysis.emotional_profile?.frustration_triggers || [],
                excitement_triggers: analysis.emotional_profile?.excitement_triggers || []
            },
            cognitive_profile: {
                comprehension_speed: analysis.cognitive_profile?.comprehension_speed || 'medium',
                patience: analysis.cognitive_profile?.patience || 5
            },
            objectives: analysis.objectives || [],
            needs: analysis.needs || [],
            apprehensions: analysis.apprehensions || [],
            real_quotes: analysis.real_quotes || [],
            knowledge_bounds: {
                confident: analysis.knowledge_bounds?.confident || [],
                partial: analysis.knowledge_bounds?.partial || [],
                unknown: analysis.knowledge_bounds?.unknown || []
            }
        };

        return validated;
    }
}

module.exports = new TranscriptAnalyzer();
