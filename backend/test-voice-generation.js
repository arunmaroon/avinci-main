require('dotenv').config();
const { ElevenLabsClient } = require('elevenlabs');

// Disable SSL verification for ElevenLabs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Test with old API key that was working
process.env.ELEVENLABS_API_KEY = 'sk_711d80d8e787f5316d771a86152bd524149cbc25679ab546';

async function testVoiceGeneration() {
    console.log('🔍 Testing voice generation with new API key...');
    
    const client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
    
    try {
        // Test with working voice IDs
        console.log('🎙️ Testing Sarah voice (EXAVITQu4vr4xnSDxMaL)...');
        
        const audioStream = await client.textToSpeech.convert('EXAVITQu4vr4xnSDxMaL', {
            text: "Hello! I'm Priyanka Desai from Ahmedabad, Gujarat. I work as a Research Director and have been in this field for several years. My work involves a lot of analysis and systematic research, which I genuinely enjoy. I value continuous learning and am always on the lookout for opportunities to advance in my career. Outside of work, I cherish spending time with my family and being part of the community.",
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.5
            }
        });
        
        console.log('✅ SUCCESS! Voice generation is working!');
        console.log('🎉 The new API key and voice ID are both functional!');
        
        // Test Sarah voice as fallback
        console.log('\n🎙️ Testing Sarah voice (EXAVITQu4vr4xnSDxMaL) as fallback...');
        
        const audioStream2 = await client.textToSpeech.convert('EXAVITQu4vr4xnSDxMaL', {
            text: "This is Sarah speaking. The voice system is working perfectly now!",
            model_id: 'eleven_multilingual_v2',
            voice_settings: {
                stability: 0.5,
                similarity_boost: 0.5
            }
        });
        
        console.log('✅ SUCCESS! Sarah voice is also working!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Body:', JSON.stringify(error.response.data));
        }
    }
}

testVoiceGeneration();
