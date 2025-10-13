/**
 * Audio Calling Setup Test Script
 * Tests all audio calling services and configurations
 * Run: node scripts/test-audio-setup.js
 */

require('dotenv').config();
const axios = require('axios');

// ANSI color codes for pretty output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

const log = {
    info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
    success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
    warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
    section: (msg) => console.log(`\n${colors.cyan}━━━ ${msg} ━━━${colors.reset}`)
};

// Test results
const results = {
    passed: 0,
    failed: 0,
    warnings: 0
};

// Test functions
async function testEnvironmentVariables() {
    log.section('Testing Environment Variables');
    
    const requiredVars = [
        'TWILIO_ACCOUNT_SID',
        'TWILIO_AUTH_TOKEN',
        'TWILIO_API_KEY',
        'TWILIO_API_SECRET',
        'TWILIO_TWIML_APP_SID',
        'ELEVENLABS_API_KEY',
        'DEEPGRAM_API_KEY',
        'OPENAI_API_KEY'
    ];
    
    for (const varName of requiredVars) {
        if (process.env[varName]) {
            log.success(`${varName} is set`);
            results.passed++;
        } else {
            log.error(`${varName} is missing`);
            results.failed++;
        }
    }
}

async function testTwilioConnection() {
    log.section('Testing Twilio Connection');
    
    try {
        const twilio = require('twilio');
        const client = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );
        
        // Test by fetching account info
        const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
        
        log.success(`Twilio connection successful`);
        log.info(`Account: ${account.friendlyName}`);
        log.info(`Status: ${account.status}`);
        results.passed++;
    } catch (error) {
        log.error(`Twilio connection failed: ${error.message}`);
        results.failed++;
    }
}

async function testElevenLabsConnection() {
    log.section('Testing ElevenLabs Connection');
    
    try {
        const response = await axios.get('https://api.elevenlabs.io/v1/voices', {
            headers: {
                'xi-api-key': process.env.ELEVENLABS_API_KEY
            }
        });
        
        log.success(`ElevenLabs connection successful`);
        log.info(`Available voices: ${response.data.voices.length}`);
        
        // Check for Indian voices
        const indianVoices = response.data.voices.filter(v => 
            v.name.toLowerCase().includes('indian') || 
            v.labels?.accent?.includes('indian')
        );
        
        if (indianVoices.length > 0) {
            log.success(`Found ${indianVoices.length} Indian voices`);
        } else {
            log.warn('No specific Indian voices found, using default voices');
            results.warnings++;
        }
        
        results.passed++;
    } catch (error) {
        log.error(`ElevenLabs connection failed: ${error.response?.data?.detail || error.message}`);
        results.failed++;
    }
}

async function testDeepgramConnection() {
    log.section('Testing Deepgram Connection');
    
    try {
        const response = await axios.get('https://api.deepgram.com/v1/projects', {
            headers: {
                'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`
            }
        });
        
        log.success(`Deepgram connection successful`);
        log.info(`Projects: ${response.data.projects.length}`);
        results.passed++;
    } catch (error) {
        log.error(`Deepgram connection failed: ${error.response?.data?.message || error.message}`);
        results.failed++;
    }
}

async function testOpenAIConnection() {
    log.section('Testing OpenAI Connection');
    
    try {
        const OpenAI = require('openai');
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        
        const response = await openai.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4',
            messages: [{ role: 'user', content: 'Hello' }],
            max_tokens: 5
        });
        
        log.success(`OpenAI connection successful`);
        log.info(`Model: ${response.model}`);
        results.passed++;
    } catch (error) {
        log.error(`OpenAI connection failed: ${error.message}`);
        results.failed++;
    }
}

async function testBackendService() {
    log.section('Testing Backend Service');
    
    try {
        const response = await axios.get('http://localhost:9001/api/health', {
            timeout: 5000
        });
        
        log.success(`Backend service is running`);
        log.info(`Status: ${response.data.status}`);
        log.info(`AI Provider: ${response.data.aiProvider}`);
        results.passed++;
    } catch (error) {
        log.error(`Backend service not accessible: ${error.message}`);
        log.warn('Make sure backend is running on port 9001');
        results.failed++;
    }
}

async function testDataProcessingService() {
    log.section('Testing Data Processing Service');
    
    try {
        const response = await axios.get('http://localhost:8000/', {
            timeout: 5000
        });
        
        log.success(`Data processing service is running`);
        log.info(`Version: ${response.data.version}`);
        results.passed++;
    } catch (error) {
        log.error(`Data processing service not accessible: ${error.message}`);
        log.warn('Make sure data-processing is running on port 8000');
        results.failed++;
    }
}

async function testDatabaseConnection() {
    log.section('Testing Database Connection');
    
    try {
        const { pool } = require('../backend/models/database');
        const result = await pool.query('SELECT NOW()');
        
        log.success(`Database connection successful`);
        log.info(`Current time: ${result.rows[0].now}`);
        
        // Check if voice_calls table exists
        const tableCheck = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'voice_calls'
            );
        `);
        
        if (tableCheck.rows[0].exists) {
            log.success('voice_calls table exists');
        } else {
            log.error('voice_calls table not found');
            log.warn('Run: psql $DATABASE_URL -f backend/migrations/008_voice_calls_schema.sql');
            results.failed++;
        }
        
        results.passed++;
    } catch (error) {
        log.error(`Database connection failed: ${error.message}`);
        results.failed++;
    }
}

async function testAudioDirectory() {
    log.section('Testing Audio Directory');
    
    const fs = require('fs');
    const path = require('path');
    
    const audioDir = path.join(__dirname, '../backend/uploads/audio');
    
    if (fs.existsSync(audioDir)) {
        log.success(`Audio directory exists: ${audioDir}`);
        results.passed++;
    } else {
        log.warn(`Audio directory not found, will be created automatically`);
        results.warnings++;
    }
}

// Main test runner
async function runTests() {
    console.log(`\n${colors.cyan}╔═══════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.cyan}║   Audio Calling Setup Test Suite         ║${colors.reset}`);
    console.log(`${colors.cyan}║   Sirius v0.2                             ║${colors.reset}`);
    console.log(`${colors.cyan}╚═══════════════════════════════════════════╝${colors.reset}\n`);
    
    try {
        await testEnvironmentVariables();
        await testTwilioConnection();
        await testElevenLabsConnection();
        await testDeepgramConnection();
        await testOpenAIConnection();
        await testBackendService();
        await testDataProcessingService();
        await testDatabaseConnection();
        await testAudioDirectory();
    } catch (error) {
        log.error(`Unexpected error: ${error.message}`);
    }
    
    // Print summary
    console.log(`\n${colors.cyan}━━━ Test Summary ━━━${colors.reset}`);
    console.log(`${colors.green}✓ Passed: ${results.passed}${colors.reset}`);
    console.log(`${colors.red}✗ Failed: ${results.failed}${colors.reset}`);
    console.log(`${colors.yellow}⚠ Warnings: ${results.warnings}${colors.reset}`);
    
    if (results.failed === 0) {
        console.log(`\n${colors.green}🎉 All tests passed! Your audio calling setup is ready.${colors.reset}`);
        console.log(`${colors.cyan}Next step: Visit http://localhost:9000/user-research to start a call!${colors.reset}\n`);
        process.exit(0);
    } else {
        console.log(`\n${colors.red}❌ Some tests failed. Please fix the issues above.${colors.reset}`);
        console.log(`${colors.yellow}See AUDIO_CALLING_QUICKSTART.md for setup instructions.${colors.reset}\n`);
        process.exit(1);
    }
}

// Run tests
runTests().catch(error => {
    log.error(`Fatal error: ${error.message}`);
    process.exit(1);
});

