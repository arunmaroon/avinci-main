const { ElevenLabsClient } = require('elevenlabs');
require('dotenv').config();

// Set SSL verification off globally (same as server.js)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function testElevenLabs() {
    console.log('🔍 Testing ElevenLabs with working voice IDs...\n');
    
    const client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
    
    const testVoices = [
        { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah (Female)' },
        { id: 'rgltZvTfiMmgWweZhh7n', name: 'Male Voice' }
    ];
    
    for (const voice of testVoices) {
        try {
            console.log(`🎙️ Testing: ${voice.name} (${voice.id})`);
            
            const audioStream = await client.textToSpeech.convert(voice.id, {
                text: "Hello, this is a test of the ElevenLabs voice system.",
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                    stability: 0.6,
                    similarity_boost: 0.8,
                    style: 0.5,
                    use_speaker_boost: true
                }
            });
            
            const chunks = [];
            for await (const chunk of audioStream) {
                chunks.push(chunk);
            }
            const audioBuffer = Buffer.concat(chunks);
            
            console.log(`✅ SUCCESS! Audio generated: ${audioBuffer.length} bytes\n`);
            
        } catch (error) {
            console.error(`❌ FAILED: ${error.message}\n`);
        }
    }
}

testElevenLabs();
