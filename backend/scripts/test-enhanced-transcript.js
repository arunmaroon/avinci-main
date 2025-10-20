const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = process.env.BACKEND_URL || 'http://localhost:9001';
const DATA_PROCESSING_URL = process.env.DATA_PROCESSING_URL || 'http://localhost:5000';

// Abdul's transcript from the Google Doc
const abdulTranscript = `Interview with Abdul Yasser - Trader

Interviewer: Hi Abdul, thanks for joining us today. Can you tell us about yourself?

Abdul: Hi! I'm Abdul Yasser, I'm 24 years old and I live in Bangalore. I work as a day trader, mostly dealing with stocks and crypto. I've been doing this for about 2 years now.

Interviewer: What financial apps do you use?

Abdul: I use PhonePe for payments, Zerodha for trading, and I have accounts with HDFC and ICICI banks. I also use Slice Pay sometimes, but the hidden charges are a big problem. I've been burned by that before.

Interviewer: What are your main pain points with current financial tools?

Abdul: The biggest issue is hidden charges. You think you're getting a good deal, but then there are all these fees that pop up. Also, the UI is often confusing - too many buttons and options everywhere. I prefer simple, clean interfaces that just work.

Interviewer: How do you handle your daily trading routine?

Abdul: I wake up around 6 AM, check the markets, make my trades, and then I'm done by 2 PM. I like to keep it simple and not overthink things. I also check my portfolio on my phone throughout the day.

Interviewer: What motivates you in your work?

Abdul: I want to be financially independent by 30. My family has always struggled with money, so I'm determined to break that cycle. I also enjoy the challenge of trading - it's like a puzzle every day. The money is good, but I really like the mental challenge.

Interviewer: What about your family background?

Abdul: I'm from a middle-class Muslim family in Bangalore. My father works in IT, my mother is a teacher. They were skeptical about trading at first, but now they see I'm doing well. I want to make them proud.

Interviewer: Any specific financial goals?

Abdul: I want to buy a house in Bangalore within the next 3 years. I'm also saving for my sister's education. She wants to study medicine, and that's expensive. I want to support her dreams.

Interviewer: What frustrates you most about current financial apps?

Abdul: The hidden fees, definitely. And the complexity. Why do I need to click through 5 screens just to make a simple payment? Also, the customer service is terrible - you can never reach a real person when you need help.

Interviewer: How do you prefer to communicate with financial services?

Abdul: I prefer WhatsApp or chat support. I don't like calling customer service - it takes forever and they never understand my problem. A good chat bot would be better than a human who doesn't know what they're talking about.

Interviewer: Any cultural or religious considerations in your financial decisions?

Abdul: Yeah, I try to avoid interest-based products when possible. I prefer Sharia-compliant investments. But sometimes it's hard to find good options that are both profitable and halal. I wish more apps would offer Islamic finance options.

Interviewer: What would your ideal financial app look like?

Abdul: Simple, transparent, and fast. No hidden fees, clear pricing upfront. A clean interface that doesn't confuse me. Good customer support that actually helps. And maybe some Islamic finance options would be nice.`;

// Test functions
async function testDataProcessing() {
  console.log('\n=== Testing Data Processing Service ===\n');
  
  try {
    const response = await axios.post(`${DATA_PROCESSING_URL}/process-transcripts`, {
      transcripts: [abdulTranscript],
      source_files: ['abdul_interview.txt']
    }, {
      timeout: 300000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      console.log('✅ Data processing successful!');
      console.log(`Generated ${response.data.total_personas} personas`);
      
      if (response.data.personas.length > 0) {
        const persona = response.data.personas[0];
        console.log('\n📋 Extracted Persona:');
        console.log(`Name: ${persona.name}`);
        console.log(`Age: ${persona.age}`);
        console.log(`Location: ${persona.location}`);
        console.log(`Occupation: ${persona.occupation}`);
        console.log(`Pain Points: ${persona.pain_points?.join(', ')}`);
        console.log(`Fintech Apps: ${persona.fintech_preferences?.apps?.join(', ')}`);
        console.log(`Confidence Score: ${persona.confidence_score}`);
        console.log(`Key Quotes: ${persona.key_quotes?.slice(0, 2).join('; ')}`);
      }
      
      return response.data.personas;
    } else {
      throw new Error(response.data.error || 'Processing failed');
    }
  } catch (error) {
    console.error('❌ Data processing failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    return null;
  }
}

async function testBackendUpload() {
  console.log('\n=== Testing Backend Upload API ===\n');
  
  try {
    // Create a temporary file
    const tempFile = path.join(__dirname, 'temp_abdul.txt');
    fs.writeFileSync(tempFile, abdulTranscript);
    
    const FormData = require('form-data');
    const form = new FormData();
    form.append('files', fs.createReadStream(tempFile), {
      filename: 'abdul_interview.txt',
      contentType: 'text/plain'
    });
    form.append('context', JSON.stringify({
      source: 'test_upload',
      timestamp: new Date().toISOString()
    }));

    const response = await axios.post(`${BASE_URL}/api/transcript/upload`, form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': 'Bearer test-token'
      },
      timeout: 300000
    });

    if (response.data.success) {
      console.log('✅ Backend upload successful!');
      console.log(`Generated ${response.data.data.total_personas} AI personas`);
      
      if (response.data.data.agents.length > 0) {
        const agent = response.data.data.agents[0];
        console.log('\n🤖 Generated Agent:');
        console.log(`Name: ${agent.name}`);
        console.log(`Occupation: ${agent.occupation}`);
        console.log(`Location: ${agent.location}`);
        console.log(`Image URL: ${agent.avatar_url ? 'Yes' : 'No'}`);
        
        if (agent.persona_json) {
          const persona = JSON.parse(agent.persona_json);
          console.log(`Pain Points: ${persona.pain_points?.join(', ')}`);
          console.log(`Fintech Apps: ${persona.fintech_preferences?.apps?.join(', ')}`);
          console.log(`Cultural Background: ${persona.cultural_background?.heritage}`);
          console.log(`Confidence Score: ${persona.confidence_score}`);
        }
      }
    } else {
      throw new Error(response.data.error || 'Upload failed');
    }
    
    // Clean up temp file
    fs.unlinkSync(tempFile);
    
  } catch (error) {
    console.error('❌ Backend upload failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

async function testGoogleDocsScraping() {
  console.log('\n=== Testing Google Docs Scraping ===\n');
  
  try {
    // Test with a sample Google Docs URL (you'll need to replace with a real one)
    const testUrl = 'https://docs.google.com/document/d/1VQFr1wzY7rZU7Ph_LoAacr1ECPyQelT9-qRk8a_L66Q/edit';
    
    const response = await axios.post(`${BASE_URL}/api/transcript/upload`, {
      urls: JSON.stringify([testUrl]),
      context: JSON.stringify({
        source: 'test_google_docs',
        timestamp: new Date().toISOString()
      })
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      },
      timeout: 300000
    });

    if (response.data.success) {
      console.log('✅ Google Docs scraping successful!');
      console.log(`Generated ${response.data.data.total_personas} AI personas`);
    } else {
      console.log('⚠️ Google Docs scraping failed (expected if URL is not accessible)');
    }
    
  } catch (error) {
    console.log('⚠️ Google Docs scraping failed (expected if URL is not accessible):', error.message);
  }
}

async function testEdgeCases() {
  console.log('\n=== Testing Edge Cases ===\n');
  
  try {
    // Test with empty transcript
    const response1 = await axios.post(`${DATA_PROCESSING_URL}/process-transcripts`, {
      transcripts: [''],
      source_files: ['empty.txt']
    });

    if (response1.data.success) {
      console.log('✅ Empty transcript handled correctly');
    } else {
      console.log('⚠️ Empty transcript handling needs improvement');
    }

    // Test with very short transcript
    const response2 = await axios.post(`${DATA_PROCESSING_URL}/process-transcripts`, {
      transcripts: ['Hi, I am John.'],
      source_files: ['short.txt']
    });

    if (response2.data.success) {
      console.log('✅ Short transcript handled correctly');
      if (response2.data.personas.length > 0) {
        const persona = response2.data.personas[0];
        console.log(`Extracted name: ${persona.name}, confidence: ${persona.confidence_score}`);
      }
    }

    // Test with multiple personas
    const multiPersonaTranscript = `Interview with Sarah and Mike

Interviewer: Hi Sarah, can you introduce yourself?
Sarah: Hi! I'm Sarah Chen, 28, I work as a product manager at TechCorp.

Interviewer: And Mike?
Mike: I'm Mike Johnson, 32, I'm a software engineer at the same company.`;

    const response3 = await axios.post(`${DATA_PROCESSING_URL}/process-transcripts`, {
      transcripts: [multiPersonaTranscript],
      source_files: ['multi_persona.txt']
    });

    if (response3.data.success) {
      console.log(`✅ Multi-persona transcript handled correctly: ${response3.data.total_personas} personas`);
    }

  } catch (error) {
    console.error('❌ Edge case testing failed:', error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Starting Enhanced Transcript Processing Tests\n');
  
  try {
    // Test data processing service
    const personas = await testDataProcessing();
    
    if (personas) {
      // Test backend upload
      await testBackendUpload();
      
      // Test Google Docs scraping
      await testGoogleDocsScraping();
      
      // Test edge cases
      await testEdgeCases();
    }
    
    console.log('\n✅ All tests completed!');
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  testDataProcessing,
  testBackendUpload,
  testGoogleDocsScraping,
  testEdgeCases,
  runAllTests
};
