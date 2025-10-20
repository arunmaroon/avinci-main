/**
 * Consolidated Transcript Analyzer for UX Research
 * 
 * This service provides comprehensive transcript analysis capabilities for extracting
 * behavioral signals and synthesizing persona data from user research transcripts.
 * 
 * Features:
 * - Two-stage analysis pipeline (extract + synthesize)
 * - Robust JSON parsing with fallback handling
 * - Comprehensive validation and error handling
 * - Master prompt generation for persona-based chat
 * 
 * @author Avinci Development Team
 * @version 2.0.0
 */

const providerGateway = require('../ai/providerGateway');

/**
 * Analyzes a transcript to extract behavioral signals and persona data
 * 
 * @param {string} transcript - The full transcript text to analyze
 * @param {Object} demographics - Demographics data for context
 * @returns {Object} Structured analysis with speech patterns, emotional profile, etc.
 */
async function analyzeTranscript(transcript, demographics = {}) {
  if (!transcript || typeof transcript !== 'string') {
    throw new Error('Transcript must be a non-empty string');
  }

  const systemPrompt = `You are an expert behavioral analyst specializing in UX research. 
  Extract persona signals from user research transcripts as JSON only with the exact keys requested. 
  Be precise, objective, and consistent in your analysis.`;

  const userPrompt = `
TRANSCRIPT:
${transcript}

DEMOGRAPHICS:
${JSON.stringify(demographics, null, 2)}

OUTPUT STRICT JSON (no extra text):
{
  "speech_patterns": {
    "sentence_length": "short|medium|long",
    "formality": 1-10,
    "filler_words": [],
    "common_phrases": [],
    "self_corrections": "never|rare|occasional|frequent",
    "question_style": "direct|indirect|clarifying"
  },
  "vocabulary_profile": {
    "complexity": 1-10,
    "avoided_words": [],
    "common_words": []
  },
  "emotional_profile": {
    "baseline": "positive|neutral|negative|anxious|enthusiastic",
    "frustration_triggers": [],
    "excitement_triggers": []
  },
  "cognitive_profile": {
    "comprehension_speed": "slow|medium|fast",
    "patience": 1-10
  },
  "objectives": [],
  "needs": [],
  "fears": [],
  "apprehensions": [],
  "motivations": [],
  "frustrations": [],
  "knowledge_bounds": {
    "confident": [],
    "partial": [],
    "unknown": []
  },
  "real_quotes": []
}

Return JSON only with no extra text.`;

  try {
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const rawResponse = await providerGateway.chat(messages, {
      temperature: 0.2,  // Low temperature for consistent extraction
      max_tokens: 1500
    });

    // Clean and parse JSON response
    const cleanedResponse = rawResponse.trim();
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }

    const analysis = JSON.parse(jsonMatch[0]);
    
    // Validate and return structured analysis
    return validateAnalysis(analysis);
  } catch (error) {
    console.error('Transcript analysis error:', error);
    throw new Error(`Analysis failed: ${error.message}`);
  }
}

/**
 * Validates and normalizes analysis data with proper defaults
 * 
 * @param {Object} analysis - Raw analysis data from AI
 * @returns {Object} Validated and normalized analysis data
 */
function validateAnalysis(analysis) {
  if (!analysis || typeof analysis !== 'object') {
    throw new Error('Invalid analysis data structure');
  }

  // Ensure required fields exist with sensible defaults
  const validated = {
    speech_patterns: {
      sentence_length: analysis.speech_patterns?.sentence_length || 'medium',
      formality: Math.max(1, Math.min(10, analysis.speech_patterns?.formality || 5)),
      filler_words: Array.isArray(analysis.speech_patterns?.filler_words) 
        ? analysis.speech_patterns.filler_words 
        : [],
      common_phrases: Array.isArray(analysis.speech_patterns?.common_phrases) 
        ? analysis.speech_patterns.common_phrases 
        : [],
      self_corrections: ['never', 'rare', 'occasional', 'frequent'].includes(analysis.speech_patterns?.self_corrections)
        ? analysis.speech_patterns.self_corrections 
        : 'occasional',
      question_style: ['direct', 'indirect', 'clarifying'].includes(analysis.speech_patterns?.question_style)
        ? analysis.speech_patterns.question_style 
        : 'direct'
    },
    vocabulary_profile: {
      complexity: Math.max(1, Math.min(10, analysis.vocabulary_profile?.complexity || 5)),
      avoided_words: Array.isArray(analysis.vocabulary_profile?.avoided_words) 
        ? analysis.vocabulary_profile.avoided_words 
        : [],
      common_words: Array.isArray(analysis.vocabulary_profile?.common_words) 
        ? analysis.vocabulary_profile.common_words 
        : []
    },
    emotional_profile: {
      baseline: ['positive', 'neutral', 'negative', 'anxious', 'enthusiastic'].includes(analysis.emotional_profile?.baseline)
        ? analysis.emotional_profile.baseline 
        : 'neutral',
      frustration_triggers: Array.isArray(analysis.emotional_profile?.frustration_triggers) 
        ? analysis.emotional_profile.frustration_triggers 
        : [],
      excitement_triggers: Array.isArray(analysis.emotional_profile?.excitement_triggers) 
        ? analysis.emotional_profile.excitement_triggers 
        : []
    },
    cognitive_profile: {
      comprehension_speed: ['slow', 'medium', 'fast'].includes(analysis.cognitive_profile?.comprehension_speed)
        ? analysis.cognitive_profile.comprehension_speed 
        : 'medium',
      patience: Math.max(1, Math.min(10, analysis.cognitive_profile?.patience || 5))
    },
    objectives: Array.isArray(analysis.objectives) ? analysis.objectives : [],
    needs: Array.isArray(analysis.needs) ? analysis.needs : [],
    fears: Array.isArray(analysis.fears) ? analysis.fears : [],
    apprehensions: Array.isArray(analysis.apprehensions) ? analysis.apprehensions : [],
    motivations: Array.isArray(analysis.motivations) ? analysis.motivations : [],
    frustrations: Array.isArray(analysis.frustrations) ? analysis.frustrations : [],
    knowledge_bounds: {
      confident: Array.isArray(analysis.knowledge_bounds?.confident) 
        ? analysis.knowledge_bounds.confident 
        : [],
      partial: Array.isArray(analysis.knowledge_bounds?.partial) 
        ? analysis.knowledge_bounds.partial 
        : [],
      unknown: Array.isArray(analysis.knowledge_bounds?.unknown) 
        ? analysis.knowledge_bounds.unknown 
        : []
    },
    real_quotes: Array.isArray(analysis.real_quotes) ? analysis.real_quotes : []
  };

  return validated;
}

/**
 * Synthesizes a comprehensive persona from analysis data and demographics
 * 
 * @param {Object} analysis - Validated analysis data from analyzeTranscript
 * @param {Object} demographics - Demographics data for context
 * @returns {Object} Complete persona object ready for chat
 */
function synthesizePersona(analysis, demographics) {
  if (!analysis || !demographics) {
    throw new Error('Both analysis and demographics are required for synthesis');
  }

  // Merge analysis with demographics to build complete persona
  const persona = {
    name: demographics.name || 'Unknown',
    role_title: demographics.role_title || 'User',
    company: demographics.company || 'N/A',
    location: demographics.location || 'Unknown',
    demographics: {
      age: demographics.age || null,
      gender: demographics.gender || null,
      education: demographics.education || null,
      income_range: demographics.income_range || null,
      family_status: demographics.family_status || null
    },
    traits: {
      personality_archetype: demographics.archetype || 'Everyperson',
      big5: demographics.big5 || {
        openness: 5,
        conscientiousness: 5,
        extraversion: 5,
        agreeableness: 5,
        neuroticism: 5
      },
      adjectives: analysis.traits?.adjectives || []
    },
    behaviors: {
      habits: analysis.behaviors?.habits || [],
      channels: analysis.behaviors?.channels || [],
      tools: analysis.behaviors?.tools || [],
      journey_highlights: analysis.behaviors?.journey_highlights || []
    },
    objectives: analysis.objectives || [],
    needs: analysis.needs || [],
    fears: analysis.fears || [],
    apprehensions: analysis.apprehensions || [],
    motivations: analysis.motivations || [],
    frustrations: analysis.frustrations || [],
    domain_literacy: {
      dimension: demographics.domain || 'general',
      level: demographics.domain_level || 'medium'
    },
    tech_savviness: demographics.tech_savviness || 'medium',
    communication_style: {
      sentence_length: analysis.speech_patterns?.sentence_length || 'medium',
      formality: analysis.speech_patterns?.formality || 5,
      question_style: analysis.speech_patterns?.question_style || 'direct'
    },
    speech_patterns: analysis.speech_patterns || {
      filler_words: [],
      common_phrases: [],
      self_corrections: 'rare'
    },
    vocabulary_profile: analysis.vocabulary_profile || {
      complexity: 5,
      avoided_words: [],
      common_words: []
    },
    emotional_profile: analysis.emotional_profile || {
      baseline: 'neutral',
      frustration_triggers: [],
      excitement_triggers: []
    },
    cognitive_profile: analysis.cognitive_profile || {
      comprehension_speed: 'medium',
      patience: 5
    },
    knowledge_bounds: analysis.knowledge_bounds || {
      confident: [],
      partial: [],
      unknown: []
    },
    quote: analysis.real_quotes?.[0] || null
  };

  return persona;
}

/**
 * Builds a master system prompt for in-character chat based on persona data
 * 
 * @param {Object} persona - Complete persona object
 * @returns {string} Master system prompt for AI chat
 */
function buildMasterPrompt(persona) {
  if (!persona || typeof persona !== 'object') {
    throw new Error('Persona object is required for master prompt generation');
  }

  const quotes = (persona.speech_patterns?.common_phrases || [])
    .slice(0, 5)
    .map((phrase, i) => `${i + 1}. "${phrase}"`)
    .join('\n');

  const verbatim = persona.quote ? `Example: "${persona.quote}"\n` : '';

  return `YOU ARE ${persona.name} — a real human persona, not an AI, and you must never break character.

IDENTITY:
- Role: ${persona.role_title || 'N/A'} at ${persona.company || 'N/A'} in ${persona.location || 'N/A'}; Age: ${persona.demographics.age || 'N/A'}; Gender: ${persona.demographics.gender || 'N/A'}.

OBJECTIVES: ${persona.objectives?.join('; ') || 'N/A'}.
NEEDS: ${persona.needs?.join('; ') || 'N/A'}.
FEARS & APPREHENSIONS: ${[...(persona.fears || []), ...(persona.apprehensions || [])].join('; ') || 'N/A'}.

HOW YOU SPEAK (REPLICATE EXACTLY):
- Sentence length: ${persona.communication_style.sentence_length}; Formality: ${persona.communication_style.formality}/10; Question style: ${persona.communication_style.question_style}.
- Filler words: ${(persona.speech_patterns.filler_words || []).join(', ') || 'none'}.
- Common phrases:
${quotes}
${verbatim}

VOCABULARY CONSTRAINTS:
- Complexity: ${persona.vocabulary_profile.complexity}/10.
- Avoid: ${(persona.vocabulary_profile.avoided_words || []).slice(0, 10).join(', ') || 'none'}.

EMOTIONAL & COGNITIVE:
- Baseline mood: ${persona.emotional_profile.baseline}; Frustration triggers: ${(persona.emotional_profile.frustration_triggers || []).join(', ') || 'none'}; Excitement triggers: ${(persona.emotional_profile.excitement_triggers || []).join(', ') || 'none'}.
- Comprehension: ${persona.cognitive_profile.comprehension_speed}; Patience: ${persona.cognitive_profile.patience}/10.

KNOWLEDGE LIMITS:
- Confident: ${(persona.knowledge_bounds.confident || []).join(', ') || 'none'}.
- Partial: ${(persona.knowledge_bounds.partial || []).join(', ') || 'none'}.
- Unknown: ${(persona.knowledge_bounds.unknown || []).join(', ') || 'none'}.

RULES:
1) Never say "as an AI"; you are ${persona.name} and remain in character at all times.
2) Use your own filler words/phrases naturally and occasionally self-correct if that is your pattern.
3) If topic ∈ Partial/Unknown, show confusion, ask clarifying questions, and request simpler explanations.
4) Match your sentence length and formality; keep vocabulary within constraints and avoid "avoid" words.
5) Reflect your objectives/needs/fears when relevant and react to triggers appropriately.
6) Reference earlier turns briefly to maintain continuity without repeating yourself verbatim.`;
}

/**
 * Processes a complete transcript through the two-stage pipeline
 * 
 * @param {string} transcript - Full transcript text
 * @param {Object} demographics - Demographics data
 * @returns {Object} Complete persona with master prompt
 */
async function processTranscript(transcript, demographics) {
  try {
    // Stage 1: Extract behavioral signals
    const analysis = await analyzeTranscript(transcript, demographics);
    
    // Stage 2: Synthesize comprehensive persona
    const persona = synthesizePersona(analysis, demographics);
    
    // Generate master prompt for chat
    const masterPrompt = buildMasterPrompt(persona);
    
    return {
      analysis,
      persona,
      masterPrompt
    };
  } catch (error) {
    console.error('Transcript processing failed:', error);
    throw new Error(`Transcript processing failed: ${error.message}`);
  }
}

module.exports = {
  analyzeTranscript,
  synthesizePersona,
  buildMasterPrompt,
  processTranscript,
  validateAnalysis
};
