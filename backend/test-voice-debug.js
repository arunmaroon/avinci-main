require('dotenv').config();
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
    user: process.env.DB_USER || 'avinci_admin',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'avinci',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

async function testVoiceGeneration() {
    try {
        console.log('🔍 Testing voice generation...');
        
        const callId = 'a60071c4-dbd4-4f36-936c-316c8359db80';
        const transcript = 'hello where are you from';
        
        console.log(`🔍 Debug: callId: ${callId}, transcript: ${transcript}`);
        
        // Get agent data from database to generate persona-based response
        console.log(`🔍 Debug: Querying call data for callId: ${callId}`);
        const callData = await pool.query('SELECT agent_ids FROM voice_calls WHERE id = $1', [callId]);
        console.log(`🔍 Debug: Call data result:`, callData.rows);
        const agentIds = callData.rows[0]?.agent_ids || [];
        console.log(`🔍 Debug: Agent IDs:`, agentIds);
        
        if (agentIds.length > 0) {
            console.log(`🔍 Debug: Querying agent data for ID: ${agentIds[0]}`);
            // Get the first agent's data
            const agentResult = await pool.query('SELECT * FROM ai_agents WHERE id = $1', [agentIds[0]]);
            console.log(`🔍 Debug: Agent result:`, agentResult.rows[0] ? 'Found agent' : 'No agent found');
            const agent = agentResult.rows[0];
            
            if (agent) {
                const agentName = agent.name;
                const location = agent.location || 'Unknown';
                const englishLevel = agent.speech_patterns?.english_level || agent.english_savvy || 'Intermediate';
                
                console.log(`🔍 Debug: Agent ${agentName}, English Level: ${englishLevel}, Location: ${location}`);
                
                // Generate persona-based response based on English level
                const lowerTranscript = transcript.toLowerCase();
                let responseText = '';
                
                if (englishLevel === 'Beginner') {
                    if (lowerTranscript.includes('hello') || lowerTranscript.includes('hi')) {
                        responseText = `Namaste! Main ${agent.name} hun. Aap kaise hain? Main yahan research ke liye hun.`;
                    } else {
                        responseText = `Haan, main samajh gaya. Main ${agent.name} hun. Aap kya kehna chahte hain?`;
                    }
                } else if (englishLevel === 'Elementary') {
                    if (lowerTranscript.includes('hello') || lowerTranscript.includes('hi')) {
                        responseText = `Hello! Main ${agent.name} hun. Aap kaise hain? Main yahan research discussion ke liye hun.`;
                    } else {
                        responseText = `Haan, main samajh gaya. Main ${agent.name} hun. Aap kya discuss karna chahte hain?`;
                    }
                } else if (englishLevel === 'Intermediate') {
                    if (lowerTranscript.includes('hello') || lowerTranscript.includes('hi')) {
                        responseText = `Hello! I'm ${agent.name}. How are you? I'm here for the research discussion.`;
                    } else {
                        responseText = `I understand. I'm ${agent.name}. What would you like to discuss?`;
                    }
                } else if (englishLevel === 'Advanced') {
                    if (lowerTranscript.includes('hello') || lowerTranscript.includes('hi')) {
                        responseText = `Hello! I'm ${agent.name}. It's great to be part of this research discussion. How are you doing?`;
                    } else {
                        responseText = `I see. I'm ${agent.name}. I'd be happy to share my perspective on this topic. What specifically would you like to know?`;
                    }
                } else { // Expert
                    if (lowerTranscript.includes('hello') || lowerTranscript.includes('hi')) {
                        responseText = `Hello! I'm ${agent.name}. It's wonderful to be participating in this research discussion. How are you today?`;
                    } else {
                        responseText = `That's an interesting point. I'm ${agent.name}, and I'd be delighted to share my insights on this topic. What aspects would you like to explore further?`;
                    }
                }
                
                console.log(`✅ Generated persona response for ${agentName} (${englishLevel}): ${responseText}`);
                
                // Test ElevenLabs voice generation
                const { ElevenLabsClient } = require('elevenlabs');
                const elevenlabsClient = new ElevenLabsClient({
                    apiKey: process.env.ELEVENLABS_API_KEY
                });
                
                const voiceId = agent.voice_id || 'WeK8ylKjTV2trMlayizC';
                console.log(`🎙️ Testing ElevenLabs voice generation with voice ID: ${voiceId}`);
                
                try {
                    const audioStream = await elevenlabsClient.textToSpeech.convert(voiceId, {
                        text: responseText,
                        model_id: 'eleven_multilingual_v2',
                        voice_settings: {
                            stability: 0.6,
                            similarity_boost: 0.8,
                            style: 0.5,
                            use_speaker_boost: true
                        }
                    });
                    
                    console.log('✅ ElevenLabs voice generation successful!');
                    console.log('🎵 Audio stream received, length:', audioStream);
                    
                } catch (audioError) {
                    console.error('❌ ElevenLabs voice generation failed:', audioError.message);
                }
                
            } else {
                console.warn(`❌ No agent found with ID: ${agentIds[0]}`);
            }
        } else {
            console.warn(`❌ No agent IDs found for call: ${callId}`);
        }
        
    } catch (error) {
        console.error('❌ Error in testVoiceGeneration:', error);
    } finally {
        await pool.end();
    }
}

testVoiceGeneration().catch(console.error);
