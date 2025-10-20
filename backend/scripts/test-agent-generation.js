const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = process.env.BACKEND_URL || 'http://localhost:9001';
const TEST_FILES_DIR = './test-files';

// Create test files directory if it doesn't exist
if (!fs.existsSync(TEST_FILES_DIR)) {
  fs.mkdirSync(TEST_FILES_DIR, { recursive: true });
}

// Sample transcript content for testing
const sampleTranscripts = [
  {
    filename: 'user-interview-1.txt',
    content: `Interview with Sarah Chen - Product Manager

Interviewer: Hi Sarah, thanks for joining us today. Can you tell us about your role?

Sarah: Hi! I'm a product manager at TechCorp, and I've been here for about 3 years. I work primarily on our mobile app and web platform.

Interviewer: What are your main pain points with current tools?

Sarah: Well, the biggest issue is that our current project management tools don't integrate well with our design tools. We're constantly switching between different platforms, and it's really inefficient. Also, the reporting features are quite basic - I need more detailed analytics to make data-driven decisions.

Interviewer: How do you currently handle user feedback?

Sarah: We use a combination of in-app surveys, user interviews, and analytics tools. But it's scattered across different platforms, and it's hard to get a unified view of what users really want.

Interviewer: What would your ideal solution look like?

Sarah: Something that brings everything together - project management, design collaboration, user feedback, and analytics all in one place. And it needs to be mobile-friendly since I'm often on the go.`
  },
  {
    filename: 'focus-group-2.txt',
    content: `Focus Group Discussion - E-commerce Users

Moderator: Welcome everyone. Let's start by introducing yourselves.

Alex: I'm Alex, I'm 28, and I work in marketing. I do a lot of online shopping, probably too much! [laughs]

Maria: Hi, I'm Maria, I'm 35, and I'm a working mom. I shop online for convenience, especially for household items and kids' stuff.

David: I'm David, 42, and I run a small business. I buy a lot of office supplies and equipment online.

Moderator: What's your biggest frustration with online shopping?

Alex: The checkout process is always a pain. So many steps, and then you have to create an account even if you just want to buy one thing.

Maria: I agree! And the shipping costs are always a surprise at the end. I wish they showed the total cost upfront.

David: For me, it's the return process. Sometimes I need to return items for my business, and it's always complicated and takes forever to get my money back.

Moderator: What would make you more likely to complete a purchase?

Alex: Faster checkout, definitely. Maybe one-click purchasing for repeat customers.

Maria: Free shipping, or at least clear shipping costs from the start. And better product photos and reviews.

David: Better customer service, especially for business customers. Sometimes I need to talk to a real person.`
  },
  {
    filename: 'user-research-3.txt',
    content: `User Research Session - Mobile Banking App

Researcher: Thanks for participating. Can you tell me about your banking habits?

Priya: I'm Priya, I'm 31, and I work in finance. I use mobile banking almost exclusively now. I rarely go to a physical branch.

James: I'm James, 45, and I'm more traditional. I still prefer going to the bank, but I do use the mobile app for basic things like checking balances.

Researcher: What do you like about your current mobile banking app?

Priya: It's convenient and fast. I can transfer money, pay bills, and check my account anytime. The interface is pretty intuitive.

James: It's okay, but I find it a bit confusing sometimes. There are too many options, and I'm not sure what some of them do.

Researcher: What would you change about it?

Priya: I'd like better security features, maybe biometric authentication. And it would be great if I could get financial advice or insights about my spending patterns.

James: I'd want it to be simpler. Maybe a basic mode for people like me who just want to do simple transactions. And better customer support - sometimes I need help but can't figure out how to contact anyone.

Researcher: How do you feel about digital-only banking?

Priya: I'm comfortable with it. I think it's the future, and I trust the technology.

James: I'm not sure. I like having the option to go to a physical branch if I need to. I think there should always be a human option available.`
  }
];

// Create test files
function createTestFiles() {
  console.log('Creating test files...');
  
  sampleTranscripts.forEach(transcript => {
    const filePath = path.join(TEST_FILES_DIR, transcript.filename);
    fs.writeFileSync(filePath, transcript.content);
    console.log(`Created: ${transcript.filename}`);
  });
}

// Test file upload and generation
async function testAgentGeneration() {
  try {
    console.log('\n=== Testing Advanced Agent Generation ===\n');
    
    // Create test files
    createTestFiles();
    
    // Prepare form data
    const FormData = require('form-data');
    const form = new FormData();
    
    // Add test files
    sampleTranscripts.forEach(transcript => {
      const filePath = path.join(TEST_FILES_DIR, transcript.filename);
      form.append('files', fs.createReadStream(filePath), {
        filename: transcript.filename,
        contentType: 'text/plain'
      });
    });
    
    // Add context and options
    form.append('context', JSON.stringify({
      source: 'test_generation',
      timestamp: new Date().toISOString(),
      test_run: true
    }));
    form.append('language', 'en');
    form.append('options', JSON.stringify({
      generate_avatars: true,
      include_conversation_examples: true,
      detailed_psychographics: true
    }));
    
    console.log('Sending generation request...');
    
    // Make API call
    const response = await axios.post(`${BASE_URL}/api/advanced-agents/generate`, form, {
      headers: {
        ...form.getHeaders(),
        'Authorization': 'Bearer test-token' // In real app, use proper auth
      },
      timeout: 300000 // 5 minutes
    });
    
    console.log('✅ Generation successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    // Test preview functionality
    console.log('\n=== Testing Preview Functionality ===\n');
    
    const previewForm = new FormData();
    previewForm.append('files', fs.createReadStream(path.join(TEST_FILES_DIR, 'user-interview-1.txt')), {
      filename: 'user-interview-1.txt',
      contentType: 'text/plain'
    });
    previewForm.append('context', JSON.stringify({
      source: 'test_preview',
      preview: true
    }));
    previewForm.append('language', 'en');
    
    const previewResponse = await axios.post(`${BASE_URL}/api/advanced-agents/preview`, previewForm, {
      headers: {
        ...previewForm.getHeaders(),
        'Authorization': 'Bearer test-token'
      }
    });
    
    console.log('✅ Preview successful!');
    console.log('Preview Response:', JSON.stringify(previewResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
  }
}

// Test error handling
async function testErrorHandling() {
  try {
    console.log('\n=== Testing Error Handling ===\n');
    
    // Test with invalid file type
    const FormData = require('form-data');
    const form = new FormData();
    
    // Create a test file with invalid extension
    const invalidFile = path.join(TEST_FILES_DIR, 'test.invalid');
    fs.writeFileSync(invalidFile, 'This is a test file with invalid extension');
    
    form.append('files', fs.createReadStream(invalidFile), {
      filename: 'test.invalid',
      contentType: 'application/octet-stream'
    });
    form.append('context', JSON.stringify({}));
    form.append('language', 'en');
    
    try {
      await axios.post(`${BASE_URL}/api/advanced-agents/generate`, form, {
        headers: {
          ...form.getHeaders(),
          'Authorization': 'Bearer test-token'
        }
      });
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Error handling working correctly - invalid file type rejected');
      } else {
        console.log('❌ Unexpected error response:', error.response?.data);
      }
    }
    
    // Clean up invalid file
    fs.unlinkSync(invalidFile);
    
  } catch (error) {
    console.error('❌ Error handling test failed:', error.message);
  }
}

// Clean up test files
function cleanup() {
  console.log('\n=== Cleaning up test files ===\n');
  
  if (fs.existsSync(TEST_FILES_DIR)) {
    const files = fs.readdirSync(TEST_FILES_DIR);
    files.forEach(file => {
      fs.unlinkSync(path.join(TEST_FILES_DIR, file));
      console.log(`Deleted: ${file}`);
    });
    fs.rmdirSync(TEST_FILES_DIR);
    console.log('Test directory removed');
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Advanced Agent Generation Tests\n');
  
  try {
    await testAgentGeneration();
    await testErrorHandling();
    console.log('\n✅ All tests completed!');
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
  } finally {
    cleanup();
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  testAgentGeneration,
  testErrorHandling,
  createTestFiles,
  cleanup
};
