const providerGateway = require('./providerGateway');

/**
 * Two-stage LLM pipeline for transcript analysis and persona synthesis
 * Stage 1: Analysis - Extract behavioral signals from transcript
 * Stage 2: Synthesis - Build comprehensive persona from analysis + demographics
 */

/**
 * Stage 1: Analyze transcript to extract behavioral and persona signals
 * Uses low temperature for consistent JSON extraction
 */
async function analyzeTranscript(transcript, demographics = {}) {
  const systemPrompt = `You are an expert behavioral analyst. Extract persona signals from user research transcripts as JSON only with the exact keys requested. Be precise and objective in your analysis.`;

  const userPrompt = `
TRANSCRIPT:
${transcript}

DEMOGRAPHICS:
${JSON.stringify(demographics)}

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
    
    // Validate required fields
    if (!analysis.speech_patterns || !analysis.vocabulary_profile || !analysis.emotional_profile) {
      throw new Error('Invalid analysis structure - missing required fields');
    }

    return analysis;
  } catch (error) {
    console.error('Transcript analysis error:', error);
    throw new Error(`Analysis failed: ${error.message}`);
  }
}

/**
 * Stage 2: Synthesize comprehensive persona from analysis + demographics
 */
function synthesizePersona(analysis, demographics) {
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
 * Build master system prompt for in-character chat
 */
function buildMasterPrompt(persona) {
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

module.exports = {
  analyzeTranscript,
  synthesizePersona,
  buildMasterPrompt
};

