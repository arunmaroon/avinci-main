require('dotenv').config();
const { ElevenLabsClient } = require('elevenlabs');

// Disable SSL verification for ElevenLabs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Test both API keys
const apiKeys = [
    { key: 'sk_711d80d8e787f5316d771a86152bd524149cbc25679ab546', name: 'Old Key' },
    { key: 'sk_602d4f795313f6cf07528efa36fe7095d46f5a82d6c96c44', name: 'New Key' }
];

async function testAPIKeys() {
    for (const { key, name } of apiKeys) {
        console.log(`\n🔍 Testing ${name}: ${key.substring(0, 20)}...`);
        
        const client = new ElevenLabsClient({ apiKey: key });
        
        try {
            // Test getting user info first
            console.log('📊 Fetching user info...');
            const user = await client.user.get();
            console.log(`✅ User info: ${user.subscription.tier} tier, ${user.subscription.character_count} characters used`);
            
            // Test getting voices
            console.log('🎙️ Fetching voices...');
            const voices = await client.voices.getAll();
            console.log(`✅ Found ${voices.voices.length} voices`);
            
            // Test voice generation
            console.log('🔊 Testing voice generation...');
            const audioStream = await client.textToSpeech.convert('EXAVITQu4vr4xnSDxMaL', {
                text: "Test",
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.5
                }
            });
            console.log('✅ Voice generation successful!');
            
        } catch (error) {
            console.error(`❌ ${name} failed:`, error.message);
            if (error.response) {
                console.error('Status:', error.response.status);
                console.error('Headers:', error.response.headers);
                if (error.response.data) {
                    console.error('Data:', JSON.stringify(error.response.data, null, 2));
                }
            }
        }
    }
}

testAPIKeys();
