/**
 * Test script for transcript analysis and persona synthesis
 */

const { analyzeTranscript, synthesizePersona, buildMasterPrompt } = require('./src/transcriptAnalysis');

async function testTranscriptAnalysis() {
  console.log('🧪 Testing Transcript Analysis Pipeline...\n');

  // Sample user research transcript
  const sampleTranscript = `
    Interviewer: Hi, thanks for joining us today. Can you tell me about your experience with online banking?
    
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

  try {
    console.log('📝 Sample Transcript:');
    console.log(sampleTranscript.substring(0, 200) + '...\n');

    console.log('👤 Demographics:');
    console.log(JSON.stringify(demographics, null, 2) + '\n');

    // Stage 1: Analyze transcript
    console.log('🔍 Stage 1: Analyzing transcript...');
    const analysis = await analyzeTranscript(sampleTranscript, demographics);
    console.log('✅ Analysis complete!\n');
    console.log('📊 Analysis Results:');
    console.log(JSON.stringify(analysis, null, 2) + '\n');

    // Stage 2: Synthesize persona
    console.log('🎭 Stage 2: Synthesizing persona...');
    const persona = synthesizePersona(analysis, demographics);
    console.log('✅ Persona synthesis complete!\n');
    console.log('👤 Generated Persona:');
    console.log(JSON.stringify(persona, null, 2) + '\n');

    // Stage 3: Build master prompt
    console.log('📝 Stage 3: Building master system prompt...');
    const masterPrompt = buildMasterPrompt(persona);
    console.log('✅ Master prompt complete!\n');
    console.log('🎯 Master System Prompt:');
    console.log(masterPrompt.substring(0, 500) + '...\n');

    console.log('🎉 Test completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`- Name: ${persona.name}`);
    console.log(`- Role: ${persona.role_title}`);
    console.log(`- Objectives: ${persona.objectives.length} goals identified`);
    console.log(`- Fears: ${persona.fears.length} fears identified`);
    console.log(`- Communication Style: ${persona.communication_style.sentence_length} sentences, formality ${persona.communication_style.formality}/10`);
    console.log(`- Tech Savviness: ${persona.tech_savviness}`);
    console.log(`- Quote: "${persona.quote}"`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Run the test
testTranscriptAnalysis();

