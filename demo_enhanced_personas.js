/**
 * Demo Script for Enhanced Persona System
 * This demonstrates the complete workflow from transcript to persona
 */

console.log('🎭 Enhanced Persona System Demo - Sirius v2.02\n');

// Sample user research transcript
const sampleTranscript = `
Interviewer: Hi Sarah, thanks for joining us today. Can you tell me about your experience with online banking?

Sarah: Oh, sure! So I've been using online banking for about two years now. I really like how convenient it is, you know? I can check my balance anytime, transfer money to my friends, pay bills... it's just so much easier than going to the bank.

Interviewer: What about when you need to apply for a loan or credit card?

Sarah: Ugh, that's where it gets frustrating. The forms are so long and confusing. Like, they ask for all this information and I don't even know what half of it means. APR, amortization... I just want to know if I can get the loan and how much I'll pay each month, you know?

Interviewer: Have you ever given up on an application?

Sarah: Yeah, actually I have. Last month I was trying to apply for a credit card and the form was asking about my "debt-to-income ratio" and I had no idea what that meant. I tried to look it up but it was still confusing, so I just closed the tab. I figured if they can't explain it simply, maybe I shouldn't be doing business with them.

Interviewer: What would make the process better for you?

Sarah: I don't know, maybe just explain things in plain English? Like instead of "APR" just say "interest rate" or something. And maybe show me examples of what my monthly payment would be. I just want it to be straightforward, you know?
`;

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

console.log('📝 Sample Transcript:');
console.log(sampleTranscript.substring(0, 200) + '...\n');

console.log('👤 Demographics:');
console.log(JSON.stringify(demographics, null, 2) + '\n');

// Mock analysis results (what the AI would extract)
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

console.log('🔍 Stage 1: Transcript Analysis Results:');
console.log(JSON.stringify(mockAnalysis, null, 2) + '\n');

// Synthesize persona
const persona = {
  name: demographics.name,
  role_title: demographics.role_title,
  company: demographics.company,
  location: demographics.location,
  demographics: demographics,
  traits: {
    personality_archetype: 'Everyperson',
    big5: { openness: 6, conscientiousness: 5, extraversion: 7, agreeableness: 7, neuroticism: 4 },
    adjectives: ['creative', 'independent', 'practical']
  },
  behaviors: {
    habits: ['late-night work'],
    channels: ['WhatsApp', 'Instagram'],
    tools: ['Canva', 'UPI'],
    journey_highlights: ['abandons forms on jargon']
  },
  objectives: mockAnalysis.objectives,
  needs: mockAnalysis.needs,
  fears: mockAnalysis.fears,
  apprehensions: mockAnalysis.apprehensions,
  motivations: ['Growth', 'Control', 'Independence'],
  frustrations: ['Hidden fees', 'Re-verification', 'Jargon'],
  domain_literacy: { dimension: 'finance', level: 'low' },
  tech_savviness: 'medium',
  communication_style: {
    sentence_length: mockAnalysis.speech_patterns.sentence_length,
    formality: mockAnalysis.speech_patterns.formality,
    question_style: mockAnalysis.speech_patterns.question_style
  },
  speech_patterns: mockAnalysis.speech_patterns,
  vocabulary_profile: mockAnalysis.vocabulary_profile,
  emotional_profile: mockAnalysis.emotional_profile,
  cognitive_profile: mockAnalysis.cognitive_profile,
  knowledge_bounds: mockAnalysis.knowledge_bounds,
  quote: mockAnalysis.real_quotes[0]
};

console.log('🎭 Stage 2: Synthesized Persona:');
console.log(JSON.stringify(persona, null, 2) + '\n');

// Generate master system prompt
const masterSystemPrompt = `YOU ARE ${persona.name} — a real human persona, not an AI, and you must never break character.

IDENTITY:
- Role: ${persona.role_title} at ${persona.company} in ${persona.location}; Age: ${persona.demographics.age}; Gender: ${persona.demographics.gender}.

OBJECTIVES: ${persona.objectives.join('; ')}.
NEEDS: ${persona.needs.join('; ')}.
FEARS & APPREHENSIONS: ${[...persona.fears, ...persona.apprehensions].join('; ')}.

HOW YOU SPEAK (REPLICATE EXACTLY):
- Sentence length: ${persona.communication_style.sentence_length}; Formality: ${persona.communication_style.formality}/10; Question style: ${persona.communication_style.question_style}.
- Filler words: ${persona.speech_patterns.filler_words.join(', ')}.
- Common phrases: ${persona.speech_patterns.common_phrases.map((p, i) => `${i+1}. "${p}"`).join('\n')}

VOCABULARY CONSTRAINTS:
- Complexity: ${persona.vocabulary_profile.complexity}/10.
- Avoid: ${persona.vocabulary_profile.avoided_words.join(', ')}.

EMOTIONAL & COGNITIVE:
- Baseline mood: ${persona.emotional_profile.baseline}; Frustration triggers: ${persona.emotional_profile.frustration_triggers.join(', ')}; Excitement triggers: ${persona.emotional_profile.excitement_triggers.join(', ')}.
- Comprehension: ${persona.cognitive_profile.comprehension_speed}; Patience: ${persona.cognitive_profile.patience}/10.

KNOWLEDGE LIMITS:
- Confident: ${persona.knowledge_bounds.confident.join(', ')}.
- Partial: ${persona.knowledge_bounds.partial.join(', ')}.
- Unknown: ${persona.knowledge_bounds.unknown.join(', ')}.

RULES:
1) Never say "as an AI"; you are ${persona.name} and remain in character at all times.
2) Use your own filler words/phrases naturally and occasionally self-correct if that is your pattern.
3) If topic ∈ Partial/Unknown, show confusion, ask clarifying questions, and request simpler explanations.
4) Match your sentence length and formality; keep vocabulary within constraints and avoid "avoid" words.
5) Reflect your objectives/needs/fears when relevant and react to triggers appropriately.
6) Reference earlier turns briefly to maintain continuity without repeating yourself verbatim.`;

console.log('📝 Stage 3: Master System Prompt Generated:');
console.log(masterSystemPrompt.substring(0, 500) + '...\n');

console.log('📱 Short View Format (for UI cards):');
const shortView = {
  id: 'demo-persona-id',
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
console.log(JSON.stringify(shortView, null, 2) + '\n');

console.log('🎉 Enhanced Persona System Demo Complete!');
console.log('\n📊 Summary:');
console.log(`✅ Name: ${persona.name}`);
console.log(`✅ Role: ${persona.role_title} at ${persona.company}`);
console.log(`✅ Location: ${persona.location}`);
console.log(`✅ Objectives: ${persona.objectives.length} goals identified`);
console.log(`✅ Fears: ${persona.fears.length} fears identified`);
console.log(`✅ Communication: ${persona.communication_style.sentence_length} sentences, formality ${persona.communication_style.formality}/10`);
console.log(`✅ Tech Savviness: ${persona.tech_savviness}`);
console.log(`✅ Quote: "${persona.quote}"`);
console.log(`✅ Master Prompt: ${masterSystemPrompt.length} characters`);

console.log('\n🚀 Ready for Production!');
console.log('The enhanced persona system can now:');
console.log('1. Process PDF transcripts automatically');
console.log('2. Extract rich behavioral signals');
console.log('3. Generate comprehensive personas');
console.log('4. Create authentic AI agents');
console.log('5. Enable realistic chat experiences');
console.log('\nUpload your PDF transcript to get started! 🎭');

