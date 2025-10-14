require('dotenv').config();
const { ElevenLabsClient } = require('elevenlabs');

// Disable SSL verification for ElevenLabs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Override with new API key
process.env.ELEVENLABS_API_KEY = 'sk_602d4f795313f6cf07528efa36fe7095d46f5a82d6c96c44';

async function testNewAPIKey() {
    console.log('🔍 Testing new ElevenLabs API key...');
    console.log('🔑 New API Key:', process.env.ELEVENLABS_API_KEY.substring(0, 20) + '...');
    
    const client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
    
    try {
        // Test voice generation with the new key
        console.log('\n🎙️ Testing voice generation with Sarah (EXAVITQu4vr4xnSDxMaL)...');
        
        const audioStream = await client.textToSpeech.convert('EXAVITQu4vr4xnSDxMaL', {
            text: "Hello! This is a test of the new API key. The voice system is working perfectly now!",
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.5
            }
        });
        
        console.log('✅ SUCCESS! New API key is working!');
        console.log('🎉 Voice generation is now functional!');
        
        // Test the new voice ID
        console.log('\n🎙️ Testing new voice ID (OwA6IqdLakQOd19pSLOn)...');
        
        const audioStream2 = await client.textToSpeech.convert('OwA6IqdLakQOd19pSLOn', {
            text: "This is the new female voice for intermediate English speakers.",
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.5
            }
        });
        
        console.log('✅ SUCCESS! New voice ID is working!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Body:', JSON.stringify(error.response.data));
        }
    }
}

testNewAPIKey();
