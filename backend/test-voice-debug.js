const { ElevenLabsClient } = require('elevenlabs');
require('dotenv').config();

async function testVoiceGeneration() {
    console.log('🔍 Testing ElevenLabs voice generation...');
    
    if (!process.env.ELEVENLABS_API_KEY) {
        console.error('❌ ELEVENLABS_API_KEY not set');
        return;
    }
    
    const client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
    
    // Test the new voice IDs
    const testVoices = [
        { id: 'EaBs7G1VibMrNAuz2Na7', name: 'Female Intermediate+' },
        { id: 'DpnM70iDHNHZ0Mguv6GJ', name: 'Female Below Intermediate' },
        { id: 'rgltZvTfiMmgWweZhh7n', name: 'Male Intermediate+' },
        { id: 'RBxPIvrKOP4ugCK2jVHD', name: 'Male Below Intermediate' }
    ];
    
    for (const voice of testVoices) {
        try {
            console.log(`\n🎙️ Testing voice: ${voice.name} (${voice.id})`);
            
            const audioStream = await client.textToSpeech.convert(voice.id, {
                text: "Hello, this is a test of the voice system. How does this sound?",
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                    stability: 0.6,
                    similarity_boost: 0.8,
                    style: 0.5,
                    use_speaker_boost: true
                }
            });
            
            console.log(`✅ Voice ${voice.name} generated successfully`);
            
            // Check if we get actual audio data
            const chunks = [];
            for await (const chunk of audioStream) {
                chunks.push(chunk);
            }
            const audioBuffer = Buffer.concat(chunks);
            console.log(`📊 Audio buffer size: ${audioBuffer.length} bytes`);
            
        } catch (error) {
            console.error(`❌ Error with voice ${voice.name}:`, error.message);
        }
    }
}

testVoiceGeneration().catch(console.error);
