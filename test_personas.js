const axios = require('axios');

async function testPersonas() {
  try {
    console.log('🧪 Testing Persona System...\n');

    // Test 1: Get all personas
    console.log('1. Testing GET /api/enhanced-chat/personas');
    const allPersonasResponse = await axios.get('http://localhost:9001/api/enhanced-chat/personas');
    console.log(`✅ Found ${allPersonasResponse.data.personas.length} personas`);
    
    if (allPersonasResponse.data.personas.length > 0) {
      const firstPersona = allPersonasResponse.data.personas[0];
      console.log(`   First persona: ${firstPersona.name} (${firstPersona.occupation})`);
      console.log(`   ID: ${firstPersona.id}`);
      
      // Test 2: Get specific persona
      console.log('\n2. Testing GET /api/personas/{id}');
      const specificPersonaResponse = await axios.get(`http://localhost:9001/api/personas/${firstPersona.id}`);
      console.log(`✅ Retrieved ${specificPersonaResponse.data.agent.name} details`);
      console.log(`   Background: ${specificPersonaResponse.data.agent.background?.substring(0, 50)}...`);
      console.log(`   Hobbies: ${JSON.stringify(specificPersonaResponse.data.agent.hobbies)?.substring(0, 50)}...`);
      
      // Test 3: Test chat session creation
      console.log('\n3. Testing POST /api/enhanced-chat/sessions');
      const sessionResponse = await axios.post('http://localhost:9001/api/enhanced-chat/sessions', {
        agent_id: firstPersona.id
      });
      console.log(`✅ Created chat session: ${sessionResponse.data.session_id}`);
      
      console.log('\n🎉 All tests passed! Personas are working correctly.');
      console.log('\n📋 Available Personas:');
      allPersonasResponse.data.personas.forEach((persona, index) => {
        console.log(`   ${index + 1}. ${persona.name} - ${persona.occupation} (${persona.location})`);
        console.log(`      ID: ${persona.id}`);
        console.log(`      Quote: "${persona.quote}"`);
        console.log('');
      });
      
    } else {
      console.log('❌ No personas found!');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testPersonas();

