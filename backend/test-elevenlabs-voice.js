require('dotenv').config();
const { ElevenLabsClient } = require('elevenlabs');

// Disable SSL verification for ElevenLabs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function testElevenLabsVoice() {
    console.log('🔍 Testing ElevenLabs voice generation...');
    
    // Test the working voice IDs
    const voiceIds = [
        { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah (Female)' },
        { id: 'rgltZvTfiMmgWweZhh7n', name: 'Male Voice' },
        { id: 'OwA6IqdLakQOd19pSLOn', name: 'Female Intermediate+ (NEW)' },
        { id: 'wGnf3uthTBwNQDmywjXE', name: 'Female Below Intermediate' },
        { id: 'JNaMjd7t4u3EhgkVknn3', name: 'Male Below Intermediate' }
    ];
    
    const client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
    
    for (const voice of voiceIds) {
        try {
            console.log(`\n🎙️ Testing voice: ${voice.name} (${voice.id})`);
            
            const audioStream = await client.textToSpeech.convert(voice.id, {
                text: "Hello, this is a test of the voice system.",
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.5
                }
            });
            
            console.log(`✅ ${voice.name} - SUCCESS`);
            
        } catch (error) {
            console.log(`❌ ${voice.name} - FAILED: ${error.message}`);
            if (error.response) {
                console.log(`   Status: ${error.response.status}`);
                console.log(`   Body: ${JSON.stringify(error.response.data)}`);
            }
        }
    }
}

testElevenLabsVoice();
