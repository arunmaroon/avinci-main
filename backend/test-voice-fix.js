const { ElevenLabsClient } = require('elevenlabs');
require('dotenv').config();

async function testVoiceGeneration() {
    console.log('🔍 Testing ElevenLabs voice generation after certificate fix...');
    
    if (!process.env.ELEVENLABS_API_KEY) {
        console.error('❌ ELEVENLABS_API_KEY not set');
        return;
    }
    
    // Temporarily disable SSL verification
    const originalRejectUnauthorized = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    
    const client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
    
    // Test all the voice IDs including new ones
    const testVoices = [
        { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah (Female Intermediate+)' },
        { id: '8FsOrsZSELg9otqX9nPu', name: 'Female Below Intermediate - NEW' },
        { id: 'rgltZvTfiMmgWweZhh7n', name: 'Male Intermediate+' },
        { id: 'zT03pEAEi0VHKciJODfn', name: 'Male Below Intermediate - NEW' }
    ];
    
    for (const testVoice of testVoices) {
        try {
            console.log(`\n🎙️ Testing voice: ${testVoice.name} (${testVoice.id})`);
            
            const audioStream = await client.textToSpeech.convert(testVoice.id, {
                text: "Hello, this is a test of the voice system. How does this sound?",
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                    stability: 0.6,
                    similarity_boost: 0.8,
                    style: 0.5,
                    use_speaker_boost: true
                }
            });
            
            console.log(`✅ Voice ${testVoice.name} generated successfully`);
            
            // Check if we get actual audio data
            const chunks = [];
            for await (const chunk of audioStream) {
                chunks.push(chunk);
            }
            const audioBuffer = Buffer.concat(chunks);
            console.log(`📊 Audio buffer size: ${audioBuffer.length} bytes`);
            
            if (audioBuffer.length > 0) {
                console.log('🎉 SUCCESS: Voice is working!');
            } else {
                console.log('⚠️ WARNING: Audio buffer is empty');
            }
            
        } catch (error) {
            console.error(`❌ Error with voice ${testVoice.name}:`, error.message);
        }
    }
    
    // Restore original setting
    if (originalRejectUnauthorized !== undefined) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = originalRejectUnauthorized;
    } else {
        delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
    }
}

testVoiceGeneration().catch(console.error);
