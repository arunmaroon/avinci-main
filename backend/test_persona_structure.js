/**
 * Test script for persona structure and synthesis (without API calls)
 */

const { synthesizePersona, buildMasterPrompt } = require('./src/transcriptAnalysis');

function testPersonaSynthesis() {
  console.log('🧪 Testing Persona Synthesis (Structure Only)...\n');

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

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Run the test
testPersonaSynthesis();

