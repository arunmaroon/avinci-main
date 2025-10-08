/**
 * Test script for persona synthesis only (without provider gateway)
 */

// Copy the synthesis functions directly to avoid provider gateway import
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

function testPersonaSynthesis() {
  console.log('🧪 Testing Enhanced Persona System...\n');

  // Mock analysis data (what would come from transcript analysis)
  const mockAnalysis = {
    speech_patterns: {
      sentence_length: "short",
      formality: 4,
      filler_words: ["uh", "like", "you know"],
      common_phrases: ["I just want", "you know", "it's so confusing"],
      self_corrections: "occasional",
      question_style: "clarifying"
    },
    vocabulary_profile: {
      complexity: 4,
      avoided_words: ["APR", "amortization", "debt-to-income ratio"],
      common_words: ["convenient", "frustrating", "confusing", "straightforward"]
    },
    emotional_profile: {
      baseline: "neutral",
      frustration_triggers: ["confusing forms", "jargon", "long applications"],
      excitement_triggers: ["convenience", "easy transfers", "quick access"]
    },
    cognitive_profile: {
      comprehension_speed: "medium",
      patience: 6
    },
    objectives: [
      "Easy online banking",
      "Simple loan applications", 
      "Clear explanations"
    ],
    needs: [
      "Plain language explanations",
      "Example calculations",
      "Step-by-step guidance"
    ],
    fears: [
      "Hidden fees",
      "Making mistakes on applications"
    ],
    apprehensions: [
      "Complex financial terms",
      "Long application processes"
    ],
    knowledge_bounds: {
      confident: ["basic banking", "online transfers"],
      partial: ["credit scores", "interest rates"],
      unknown: ["APR calculations", "debt-to-income ratios"]
    },
    real_quotes: [
      "I just want to know if I can get the loan and how much I'll pay each month",
      "I figured if they can't explain it simply, maybe I shouldn't be doing business with them"
    ]
  };

  const demographics = {
    name: 'Sarah Johnson',
    age: 28,
    gender: 'Female',
    education: 'Bachelor\'s',
    income_range: '$40k-$60k',
    family_status: 'Single',
    role_title: 'Marketing Coordinator',
    company: 'Tech Startup',
    location: 'Austin, Texas'
  };

  try {
    console.log('📊 Mock Analysis Data:');
    console.log(JSON.stringify(mockAnalysis, null, 2) + '\n');

    console.log('👤 Demographics:');
    console.log(JSON.stringify(demographics, null, 2) + '\n');

    // Stage 2: Synthesize persona
    console.log('🎭 Synthesizing persona...');
    const persona = synthesizePersona(mockAnalysis, demographics);
    console.log('✅ Persona synthesis complete!\n');

    console.log('👤 Generated Persona:');
    console.log(JSON.stringify(persona, null, 2) + '\n');

    // Stage 3: Build master prompt
    console.log('📝 Building master system prompt...');
    const masterPrompt = buildMasterPrompt(persona);
    console.log('✅ Master prompt complete!\n');

    console.log('🎯 Master System Prompt:');
    console.log(masterPrompt + '\n');

    console.log('🎉 Test completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`- Name: ${persona.name}`);
    console.log(`- Role: ${persona.role_title}`);
    console.log(`- Location: ${persona.location}`);
    console.log(`- Objectives: ${persona.objectives.length} goals identified`);
    console.log(`- Fears: ${persona.fears.length} fears identified`);
    console.log(`- Communication Style: ${persona.communication_style.sentence_length} sentences, formality ${persona.communication_style.formality}/10`);
    console.log(`- Tech Savviness: ${persona.tech_savviness}`);
    console.log(`- Quote: "${persona.quote}"`);
    console.log(`- Master Prompt Length: ${masterPrompt.length} characters`);

    // Test short view format
    console.log('\n📱 Short View Format:');
    const shortView = {
      id: 'test-id',
      name: persona.name,
      avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(persona.name)}&background=random&color=fff&size=200`,
      role_title: persona.role_title,
      company: persona.company,
      location: persona.location,
      quote: persona.quote,
      goals_preview: persona.objectives.slice(0, 3),
      challenges_preview: persona.apprehensions.slice(0, 3),
      gauges: {
        tech: persona.tech_savviness,
        domain: persona.domain_literacy.level,
        comms: persona.communication_style.sentence_length
      },
      status: 'active'
    };
    console.log(JSON.stringify(shortView, null, 2));

    console.log('\n🚀 Ready for transcript upload!');
    console.log('You can now upload a PDF transcript and create rich personas with this system.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Run the test
testPersonaSynthesis();

