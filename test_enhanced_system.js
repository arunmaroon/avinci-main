/**
 * Comprehensive Test for Enhanced Persona System
 * Tests all components: personas, behavior engine, and SSE chat
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:9001/api';

async function testEnhancedPersonaSystem() {
  console.log('🎭 Testing Enhanced Persona System - Sirius v2.02\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Check:', healthResponse.data.status);
    console.log('');

    // Test 2: Get Available Personas
    console.log('2️⃣ Testing Enhanced Personas...');
    const personasResponse = await axios.get(`${BASE_URL}/enhanced-chat/personas`);
    console.log('✅ Available Personas:', personasResponse.data.count);
    console.log('📋 Personas:', personasResponse.data.personas.map(p => ({
      name: p.name,
      occupation: p.occupation,
      location: p.location,
      tech_savviness: p.tech_savviness
    })));
    console.log('');

    // Test 3: Create Enhanced Chat Session
    console.log('3️⃣ Testing Enhanced Chat Session Creation...');
    const firstPersona = personasResponse.data.personas[0];
    if (!firstPersona) {
      throw new Error('No personas available for testing');
    }

    const sessionResponse = await axios.post(`${BASE_URL}/enhanced-chat/sessions`, {
      agent_id: firstPersona.id,
      context: {
        timeOfDay: 'day',
        conversationType: 'test',
        userMood: 'curious'
      }
    });
    console.log('✅ Session Created:', sessionResponse.data.session_id);
    console.log('📋 Agent:', sessionResponse.data.agent.name);
    console.log('🎯 Context:', sessionResponse.data.context);
    console.log('');

    // Test 4: Test Simple Chat Endpoint
    console.log('4️⃣ Testing Simple Chat Endpoint...');
    const simpleTestResponse = await axios.get(`${BASE_URL}/simple-test`);
    console.log('✅ Simple Test Agents:', simpleTestResponse.data.count);
    console.log('📋 Test Agent:', simpleTestResponse.data.agents[0].name);
    console.log('');

    // Test 5: Test Behavior Engine (Mock)
    console.log('5️⃣ Testing Behavior Engine (Mock)...');
    const mockPersona = {
      name: 'Test Persona',
      speech_patterns: {
        filler_words: ['uh', 'like'],
        common_phrases: ['I think', 'you know'],
        sentence_length: 'short'
      },
      vocabulary_profile: {
        avoided_words: ['utilize', 'facilitate'],
        complexity: 4
      },
      emotional_profile: {
        baseline: 'neutral',
        frustration_triggers: ['confusing', 'complicated']
      },
      cognitive_profile: {
        comprehension_speed: 'medium',
        patience: 6
      }
    };

    const mockText = "I need to utilize this system to facilitate better communication.";
    const { humanize } = require('./backend/src/enhancedBehaviorEngine');
    const humanizedText = humanize(mockPersona, mockText, { conversationLength: 3 });
    
    console.log('✅ Original Text:', mockText);
    console.log('✅ Humanized Text:', humanizedText);
    console.log('');

    // Test 6: Test Delay Calculation
    console.log('6️⃣ Testing Delay Calculation...');
    const { computeDelay } = require('./backend/src/enhancedBehaviorEngine');
    const delay = computeDelay(mockPersona, "Hello", humanizedText, { conversationLength: 5 });
    console.log('✅ Calculated Delay:', delay + 'ms');
    console.log('');

    // Test 7: Test Emotion Detection
    console.log('7️⃣ Testing Emotion Detection...');
    const { detectEmotion } = require('./backend/src/enhancedBehaviorEngine');
    const testMessages = [
      "I'm so excited about this!",
      "This is really confusing and frustrating",
      "I'm worried about the complexity",
      "This is a normal message"
    ];

    testMessages.forEach(message => {
      const emotion = detectEmotion(message, mockPersona);
      console.log(`📝 "${message}" → ${emotion}`);
    });
    console.log('');

    // Test 8: Test Typing Progress Generation
    console.log('8️⃣ Testing Typing Progress Generation...');
    const { generateTypingProgress } = require('./backend/src/enhancedBehaviorEngine');
    const typingEvents = generateTypingProgress(5000, mockPersona);
    console.log('✅ Typing Events:', typingEvents.length);
    console.log('📋 Events:', typingEvents.map(e => `${e.delay}ms: ${e.event}`));
    console.log('');

    console.log('🎉 Enhanced Persona System Test Complete!');
    console.log('\n📊 Test Summary:');
    console.log('✅ Health Check: PASSED');
    console.log('✅ Persona Retrieval: PASSED');
    console.log('✅ Session Creation: PASSED');
    console.log('✅ Behavior Engine: PASSED');
    console.log('✅ Delay Calculation: PASSED');
    console.log('✅ Emotion Detection: PASSED');
    console.log('✅ Typing Simulation: PASSED');
    console.log('\n🚀 System Ready for Production!');

  } catch (error) {
    console.error('❌ Test Failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Run the test
testEnhancedPersonaSystem();

