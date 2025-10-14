require('dotenv').config();
const { ElevenLabsClient } = require('elevenlabs');

// Disable SSL verification for ElevenLabs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function testElevenLabsVoices() {
    console.log('🔍 Testing ElevenLabs API access...');
    
    const client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
    
    try {
        // Get available voices
        console.log('\n🎙️ Fetching available voices...');
        const voices = await client.voices.getAll();
        
        console.log(`✅ Found ${voices.voices.length} available voices:`);
        voices.voices.forEach((voice, index) => {
            console.log(`${index + 1}. ${voice.name} (${voice.voice_id}) - ${voice.category}`);
        });
        
        // Test with the first available voice
        if (voices.voices.length > 0) {
            const testVoice = voices.voices[0];
            console.log(`\n🎙️ Testing with first available voice: ${testVoice.name}`);
            
            const audioStream = await client.textToSpeech.convert(testVoice.voice_id, {
                text: "Hello, this is a test of the voice system.",
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.5
                }
            });
            
            console.log(`✅ Voice generation successful with ${testVoice.name}!`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Body:', JSON.stringify(error.response.data));
        }
    }
}

testElevenLabsVoices();
