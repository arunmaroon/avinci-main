const express = require('express');
const router = express.Router();
const { pool } = require('../models/database');
const { v4: uuidv4 } = require('uuid');
const twilio = require('twilio');
const { createClient } = require('@deepgram/sdk');
const { ElevenLabsClient } = require('elevenlabs');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const https = require('https');
const OpenAI = require('openai');

// Helper function to determine region from location
function getRegion(location) {
    if (!location) return 'north';
    
    const locationLower = location.toLowerCase();
    if (locationLower.includes('tamil') || locationLower.includes('chennai') || locationLower.includes('madras')) {
        return 'tamil';
    } else if (locationLower.includes('mumbai') || locationLower.includes('pune') || locationLower.includes('maharashtra')) {
        return 'west';
    } else if (locationLower.includes('kolkata') || locationLower.includes('bengal') || locationLower.includes('odisha')) {
        return 'east';
    } else if (locationLower.includes('bangalore') || locationLower.includes('karnataka') || locationLower.includes('kerala')) {
        return 'south';
    } else {
        return 'north';
    }
}

// Initialize services lazily (only when audio features are used)
let twilioClient = null;
let deepgramClient = null;
let elevenlabsClient = null;

function initializeAudioServices() {
    if (!twilioClient && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
        // Check if we have an API Key (starts with SK) or Account SID (starts with AC)
        if (process.env.TWILIO_ACCOUNT_SID.startsWith('SK')) {
            // This is an API Key, we need to find the Account SID
            console.warn('⚠️  Twilio Account SID appears to be an API Key. Attempting to use API Key directly...');
            // For now, we'll skip Twilio initialization until we have the Account SID
            // The Twilio Voice SDK requires the Account SID for token generation
        } else if (process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
            twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        }
    }
        if (!deepgramClient && process.env.DEEPGRAM_API_KEY) {
            deepgramClient = createClient(process.env.DEEPGRAM_API_KEY, {
                global: {
                    url: 'https://api.deepgram.com',
                    headers: {
                        'User-Agent': 'avinci-voice/1.0'
                    }
                }
            });
        }
    if (!elevenlabsClient && process.env.ELEVENLABS_API_KEY) {
        elevenlabsClient = new ElevenLabsClient({ 
            apiKey: process.env.ELEVENLABS_API_KEY,
            // Disable SSL verification for development (not recommended for production)
            httpsAgent: new https.Agent({
                rejectUnauthorized: false
            })
        });
    }
    
    // Check if all required services are available
    const missingServices = [];
    if (!twilioClient) missingServices.push('Twilio');
    if (!deepgramClient) missingServices.push('Deepgram');
    if (!elevenlabsClient) missingServices.push('ElevenLabs');
    
    if (missingServices.length > 0) {
        console.warn(`⚠️  Audio services not configured. Missing: ${missingServices.join(', ')}. Audio calling will be disabled.`);
        console.warn(`   To enable audio calling, see: AUDIO_CALLING_QUICKSTART.md`);
        return false; // Return false instead of throwing error
    }
    return true;
}

// Create audio temp directory
const audioTempDir = path.join(__dirname, '../uploads/audio');
if (!fs.existsSync(audioTempDir)) {
    fs.mkdirSync(audioTempDir, { recursive: true });
}

// Regional-specific voices from ElevenLabs Voice Library
// Authentic Indian voices for different regions and genders
const INDIAN_VOICES = {
    north: 'EXAVITQu4vr4xnSDxMaL', // Sarah - Female, supports Hindi
    south: 'EXAVITQu4vr4xnSDxMaL', // Sarah - Female, supports Hindi
    west: 'EXAVITQu4vr4xnSDxMaL', // Sarah - Female, supports Hindi
    east: 'EXAVITQu4vr4xnSDxMaL', // Sarah - Female, supports Hindi
    tamil: 'EXAVITQu4vr4xnSDxMaL', // Sarah - Female, supports Hindi
    default: 'EXAVITQu4vr4xnSDxMaL' // Sarah - Female, supports Hindi
};

        // Gender-specific voice selection with authentic Indian voices
        function getVoiceId(agent, region) {
            // Always use regional voices instead of database voice_id for consistency
            console.log(`🎙️ Assigning voice for ${agent.name} (${agent.gender}, ${region})`);
            
            // Use different voices for male and female with authentic Indian voices
            if (agent.gender === 'F') {
                // Female voices - Sarah supports Hindi and sounds natural
                const femaleVoices = {
                    north: 'EXAVITQu4vr4xnSDxMaL', // Sarah - Female, supports Hindi
                    south: 'EXAVITQu4vr4xnSDxMaL', // Sarah - Female, supports Hindi
                    west: 'EXAVITQu4vr4xnSDxMaL', // Sarah - Female, supports Hindi
                    east: 'EXAVITQu4vr4xnSDxMaL', // Sarah - Female, supports Hindi
                    tamil: 'EXAVITQu4vr4xnSDxMaL', // Sarah - Female, supports Hindi
                    default: 'EXAVITQu4vr4xnSDxMaL'
                };
                const voiceId = femaleVoices[region] || femaleVoices.default;
                console.log(`🎙️ Selected female voice: ${voiceId} for region: ${region}`);
                return voiceId;
            } else {
                // Male voices - Use Chris for natural male voice
                const maleVoices = {
                    north: 'iP95p4xoKVk53GoZ742B', // Chris - Male, natural voice
                    south: 'iP95p4xoKVk53GoZ742B', // Chris - Male, natural voice
                    west: 'iP95p4xoKVk53GoZ742B', // Chris - Male, natural voice
                    east: 'iP95p4xoKVk53GoZ742B', // Chris - Male, natural voice
                    tamil: 'iP95p4xoKVk53GoZ742B', // Chris - Male, natural voice
                    default: 'iP95p4xoKVk53GoZ742B'
                };
                const voiceId = maleVoices[region] || maleVoices.default;
                console.log(`🎙️ Selected male voice: ${voiceId} for region: ${region}`);
                return voiceId;
            }
        }
        
        // Optimized voice settings per region
        // Tamil voice (rgltZvTfiMmgWweZhh7n) uses tuned settings for natural Tamil accent
        const VOICE_SETTINGS = {
            north: {
                stability: 0.6,        // Balanced for natural variation and speed
                similarity_boost: 0.8, // High for voice quality
                style: 0.5,           // Moderate for natural expressiveness
                use_speaker_boost: true
            },
            south: {
                stability: 0.6,        // Balanced for natural variation and speed
                similarity_boost: 0.8, // High for voice quality
                style: 0.5,           // Moderate for natural expressiveness
                use_speaker_boost: true
            },
            west: {
                stability: 0.6,        // Balanced for natural variation and speed
                similarity_boost: 0.8, // High for voice quality
                style: 0.5,           // Moderate for natural expressiveness
                use_speaker_boost: true
            },
            east: {
                stability: 0.6,        // Balanced for natural variation and speed
                similarity_boost: 0.8, // High for voice quality
                style: 0.5,           // Moderate for natural expressiveness
                use_speaker_boost: true
            },
            tamil: {
                stability: 0.65,       // Slightly higher stability for clear Tamil pronunciation
                similarity_boost: 0.85, // Higher for authentic Tamil voice
                style: 0.6,            // Enhanced expressiveness for Tamil intonation
                use_speaker_boost: true
            },
            default: {
                stability: 0.6,        // Balanced for natural variation and speed
                similarity_boost: 0.8, // High for voice quality
                style: 0.5,           // Moderate for natural expressiveness
                use_speaker_boost: true
            }
        };

// Check audio services status
router.get('/status', (req, res) => {
    const audioServicesAvailable = initializeAudioServices();
    
    res.json({
        audioEnabled: audioServicesAvailable,
        services: {
            twilio: !!twilioClient,
            deepgram: !!deepgramClient,
            elevenlabs: !!elevenlabsClient
        },
        message: audioServicesAvailable 
            ? 'Audio calling is available' 
            : 'Audio services not configured. See AUDIO_CALLING_QUICKSTART.md'
    });
});

router.get('/test-debug', (req, res) => {
    console.log('🔍 DEBUG: test-debug route hit!');
    res.json({ message: 'Debug route working!' });
});

// Create a new User Interview call session with Twilio token
// Body: { agentIds: UUID[], topic: string, type: 'group' | '1on1', region?: string }
router.post('/create', async (req, res) => {
    try {
        // Initialize audio services
        const audioServicesAvailable = initializeAudioServices();
        
        const { agentIds = [], topic = '', type = 'group', region = 'north' } = req.body || {};
        if (!Array.isArray(agentIds) || agentIds.length === 0) {
            return res.status(400).json({ error: 'agentIds (non-empty array) is required' });
        }

        // If audio services not available, return error with helpful message
        if (!audioServicesAvailable) {
            return res.status(400).json({ 
                error: 'Audio calling not available',
                message: 'Audio services (Twilio, Deepgram, ElevenLabs) are not configured. Please see AUDIO_CALLING_QUICKSTART.md for setup instructions.',
                audioEnabled: false
            });
        }

        // Create call in database
        const result = await pool.query(
            'INSERT INTO voice_calls (agent_ids, topic, status) VALUES ($1, $2, $3) RETURNING id, created_at',
            [agentIds, topic, 'open']
        );

        const callId = result.rows[0].id;
        const roomName = `call-${callId}`;

        // Generate Twilio access token for voice calling
        const AccessToken = twilio.jwt.AccessToken;
        const VoiceGrant = AccessToken.VoiceGrant;

        const token = new AccessToken(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_API_KEY,
            process.env.TWILIO_API_SECRET,
            { identity: `user-${uuidv4()}` }
        );

        const voiceGrant = new VoiceGrant({
            outgoingApplicationSid: process.env.TWILIO_TWIML_APP_SID,
            incomingAllow: true
        });

        token.addGrant(voiceGrant);

        res.json({ 
            callId, 
            token: token.toJwt(), 
            roomName,
            type,
            region,
            created_at: result.rows[0].created_at 
        });
    } catch (error) {
        console.error('Create call error:', error);
        res.status(500).json({ error: 'Failed to create call', details: error.message });
    }
});

// Process speech input (STT → AI → TTS)
// Body: { audio: base64, callId: UUID, type: 'group' | '1on1' }
router.post('/process-speech', async (req, res) => {
    console.log('🔍 DEBUG: process-speech route hit!');
    try {
        console.log('=== Processing speech request ===');
        console.log('🔍 DEBUG: Updated calls.js is being used!');
        
        // Initialize audio services
        const audioServicesAvailable = initializeAudioServices();
        console.log('Audio services available:', audioServicesAvailable);
        
        if (!audioServicesAvailable) {
            return res.status(400).json({ 
                error: 'Audio services not configured',
                message: 'Please configure Twilio, Deepgram, and ElevenLabs API keys'
            });
        }
        
        const { audio, callId, type = 'group', transcript: providedTranscript } = req.body;
        console.log('Request params:', { callId, type, audioLength: audio?.length, hasTranscript: !!providedTranscript });
        console.log('🔍 DEBUG: Full request body:', JSON.stringify(req.body, null, 2));

        if (!callId) {
            return res.status(400).json({ error: 'callId is required' });
        }

        let tempAudioPath = null;
        if (audio) {
            // Decode base64 audio
            console.log('Decoding base64 audio...');
            const audioBuffer = Buffer.from(audio, 'base64');
            console.log('Audio buffer size:', audioBuffer.length);
            
            // Check if audio buffer is too small (likely not real audio)
            if (audioBuffer.length >= 1000) {
                // Save temporary audio file (use webm format since that's what frontend sends)
                tempAudioPath = path.join(audioTempDir, `${uuidv4()}.webm`);
                fs.writeFileSync(tempAudioPath, audioBuffer);
            } else {
                console.log('⚠️ Audio buffer too small, skipping STT from audio');
            }
        }

        // Step 1: Speech-to-Text with Deepgram (skip if client provided transcript)
        let transcript = (providedTranscript && providedTranscript.trim()) ? providedTranscript.trim() : undefined;
        if (transcript) {
            console.log(`📝 Using client-provided transcript: "${transcript}"`);
        } else if (tempAudioPath) {
            try {
                const audioFile = fs.readFileSync(tempAudioPath);
                console.log('🎤 Sending audio to Deepgram...', {
                    fileSize: audioFile.length,
                    filePath: tempAudioPath
                });
                
                const { result, error: dgError } = await deepgramClient.listen.prerecorded.transcribeFile(
                    audioFile,
                    { 
                        model: 'nova-2',
                        smart_format: true,
                        language: 'en-IN', // Indian English
                        punctuate: true,
                        diarize: false,
                        mimetype: 'audio/webm'
                    }
                );

                if (dgError) {
                    console.error('❌ Deepgram API error:', dgError);
                    throw new Error(`Deepgram error: ${dgError.message}`);
                }

                if (!result || !result.results || !result.results.channels || !result.results.channels[0]) {
                    console.error('❌ Unexpected Deepgram response structure:', result);
                    throw new Error('Invalid response from Deepgram');
                }

                transcript = result.results.channels[0].alternatives[0].transcript;
                console.log(`✅ Deepgram transcript: "${transcript}"`);
            } catch (sttError) {
                console.error('❌ Deepgram STT error:', sttError);
                console.error('❌ Error details:', sttError.message);
            }
        }

        if (!transcript) {
            // As a last resort, fallback to a simple prompt to keep the flow alive
            console.log('⚠️ No transcript available; falling back to generic greeting');
            transcript = 'Hello';
        }
        
        if (!transcript || transcript.trim() === '') {
            console.log('No speech detected, returning empty response');
            return res.json({ responseText: '', audioUrl: null, transcript: '' });
        }

        console.log(`Transcript: ${transcript}`);

        // Step 2: Get AI response from data-processing service or use fallback
        let responseText = '', agentName = '', region = 'north';
        
        // For group calls, prioritize group response
        if (type === 'group') {
            try {
                console.log('🎭 Processing group call with multiple agents...');
                // Load agent_ids for the call so DP can choose unique agents
                const callRow = await pool.query('SELECT agent_ids FROM voice_calls WHERE id = $1', [callId]);
                const agentIds = (callRow.rows[0]?.agent_ids || []).filter(Boolean);
                const groupResponse = await axios.post(
                    `${process.env.DATA_PROCESSING_URL || 'http://localhost:8000'}/process-group-overlap`,
                    { transcript, callId, type, agentIds },
                    { timeout: 6000 }
                );
                
                if (groupResponse.data && Array.isArray(groupResponse.data) && groupResponse.data.length > 0) {
                    console.log(`🎭 Group call: Generated ${groupResponse.data.length} raw agent responses`);
                    // Ensure unique agents and sequence them with short staggered delays
                    const seen = new Set();
                    const deduped = groupResponse.data.filter(r => {
                        const k = (r.agentName || '').trim().toLowerCase();
                        if (!k || seen.has(k)) return false;
                        seen.add(k);
                        return true;
                    });
                    const emitList = deduped.slice(0, Math.max(2, Math.min(4, agentIds.length || 3)));
                    const ioLocal = req.app.get('io');
                    const roomName = `call-${callId}`;
                    const baseGap = 400 + Math.floor(Math.random() * 300); // 400-700ms between speakers
                    console.log(`🎭 Emitting ${emitList.length} unique agents sequentially (gap ~${baseGap}ms)`);
                    emitList.forEach((resp, index) => {
                        const startDelay = index * baseGap;
                        setTimeout(() => {
                            ioLocal && ioLocal.to(roomName).emit('agent-typing', {
                                callId,
                                agentName: resp.agentName,
                                isTyping: true
                            });
                            const speakDelay = 200 + Math.floor(Math.random() * 200); // 200-400ms
                            setTimeout(async () => {
                                // Generate audio for this agent response
                                let audioUrl = null;
                                try {
                                    // Get agent data to find voice_id
                                    const agentResult = await pool.query(
                                        'SELECT voice_id, location FROM ai_agents WHERE name = $1',
                                        [resp.agentName]
                                    );
                                    
                                    if (agentResult.rows.length > 0) {
                                        const agent = agentResult.rows[0];
                                        const region = resp.region || getRegion(agent.location);
                                        const voiceId = agent.voice_id || INDIAN_VOICES[region] || INDIAN_VOICES.default;
                                        const voiceSettings = VOICE_SETTINGS[region] || VOICE_SETTINGS.default;
                                        
                                        console.log(`🎙️ Generating voice for ${resp.agentName} (${region}): ${voiceId}`);
                                        
                                        const audioStream = await elevenlabsClient.textToSpeech.convert(voiceId, {
                                            text: resp.responseText,
                                            model_id: 'eleven_multilingual_v2',
                                            voice_settings: voiceSettings
                                        });
                                        
                                        const filename = `call_${callId}_${Date.now()}_${Math.random().toString(36).substring(7)}.mp3`;
                                        const filepath = path.join(audioTempDir, filename);
                                        
                                        const chunks = [];
                                        for await (const chunk of audioStream) {
                                            chunks.push(chunk);
                                        }
                                        const audioBuffer = Buffer.concat(chunks);
                                        fs.writeFileSync(filepath, audioBuffer);
                                        
                                        audioUrl = `/uploads/audio/${filename}`;
                                        console.log(`✅ Audio generated: ${audioUrl}`);
                                    }
                                } catch (audioError) {
                                    console.warn('⚠️ Audio generation failed:', audioError.message);
                                }
                                
                                ioLocal && ioLocal.to(roomName).emit('agent-response', {
                                    callId,
                                    agentName: resp.agentName,
                                    responseText: resp.responseText,
                                    audioUrl: audioUrl,
                                    timestamp: new Date().toISOString(),
                                    region: resp.region || 'north'
                                });
                                console.log(`✅ Agent responded: ${resp.agentName}`);
                            }, speakDelay);
                        }, startDelay);
                    });
                    
                    // Return the first response for the main response
                    ({ responseText, agentName, region = 'north' } = groupResponse.data[0]);
                } else {
                    console.warn('Group overlap service returned empty response, falling back to persona generation');
                    // Don't fall through to single response logic for group calls
                    // The persona generation logic below will handle group calls
                }
            } catch (groupError) {
                console.warn('Group overlap service unavailable, falling back to multiple single responses:', groupError.message);
                
                // Fallback: Generate multiple responses by calling single response multiple times
                try {
                    const fallbackResponses = [];
                    // Fetch call data to get agent_ids
                    const callDataResponse = await pool.query('SELECT agent_ids FROM voice_calls WHERE id = $1', [callId]);
                    const callData = callDataResponse.rows[0] || {};
                    const agentIds = callData.agent_ids || [];
                    
                    // Get 2-3 agents to respond
                    const numResponders = Math.min(2, agentIds.length);
                    const respondingAgents = agentIds.slice(0, numResponders);
                    
                    console.log(`🎭 Fallback: Generating ${respondingAgents.length} single responses`);
                    
                    // Generate responses from multiple agents
                    for (let i = 0; i < respondingAgents.length; i++) {
                        try {
                            const singleResponse = await axios.post(
                                `${process.env.DATA_PROCESSING_URL || 'http://localhost:8000'}/process-input`,
                                { transcript, callId, type: '1on1' },
                                { timeout: 5000 }
                            );
                            
                            if (singleResponse.data && singleResponse.data.responseText) {
                                fallbackResponses.push({
                                    agentName: singleResponse.data.agentName || `Agent ${i + 1}`,
                                    responseText: singleResponse.data.responseText,
                                    region: singleResponse.data.region || 'north'
                                });
                            }
                        } catch (singleError) {
                            console.warn(`Single response ${i + 1} failed:`, singleError.message);
                        }
                    }
                    
                    if (fallbackResponses.length > 0) {
                        console.log(`🎭 Fallback: Generated ${fallbackResponses.length} responses`);
                        const ioLocal = req.app.get('io');
                        const roomName = `call-${callId}`;
                        const baseGap = 400 + Math.floor(Math.random() * 300);
                        fallbackResponses.forEach((response, index) => {
                            const startDelay = index * baseGap;
                            setTimeout(() => {
                                ioLocal && ioLocal.to(roomName).emit('agent-typing', {
                                    callId,
                                    agentName: response.agentName,
                                    isTyping: true
                                });
                                const speakDelay = 200 + Math.floor(Math.random() * 200);
                                setTimeout(() => {
                                    ioLocal && ioLocal.to(roomName).emit('agent-response', {
                                        callId,
                                        agentName: response.agentName,
                                        responseText: response.responseText,
                                        audioUrl: null,
                                        timestamp: new Date().toISOString(),
                                        region: response.region || 'north'
                                    });
                                    console.log(`✅ Fallback response sent:`, response.agentName);
                                }, speakDelay);
                            }, startDelay);
                        });
                        
                        // Use first response for main response
                        ({ responseText, agentName, region = 'north' } = fallbackResponses[0]);
                    }
                } catch (fallbackError) {
                    console.warn('Fallback multiple responses failed:', fallbackError.message);
                    // Fall through to single response logic
                }
            }
        }
        
        // If no group response or single call, get single response
        if (!responseText) {
            try {
                const aiResponse = await axios.post(
                    `${process.env.DATA_PROCESSING_URL || 'http://localhost:8000'}/process-input`,
                    { transcript, callId, type },
                    { timeout: 5000 }
                );
                
                const { responseText: aiResponseText, agentName: aiAgentName, region: aiRegion } = aiResponse.data;
                
                // Only use the response if it's not empty
                if (aiResponseText && aiResponseText.trim() !== '') {
                    responseText = aiResponseText;
                    agentName = aiAgentName;
                    region = aiRegion || 'north';
                    console.log(`✅ Using data-processing response: ${agentName} - ${responseText}`);
                } else {
                    console.warn('Data-processing service returned empty response, falling back to persona generation');
                    // Explicitly set responseText to empty to trigger persona generation
                    responseText = '';
                }
            } catch (aiError) {
                console.warn('Single AI service unavailable, using fallback:', aiError.message);
                // Fall through to fallback logic
            }
        }
        
        // If still no response, generate persona-based response directly
        console.log(`🔍 Debug: Before persona check - responseText: "${responseText}", type: ${typeof responseText}, empty: ${!responseText}, trim empty: ${responseText && responseText.trim() === ''}`);
        console.log(`🔍 Debug: About to check persona generation - responseText: "${responseText}", type: ${type}`);
        if (!responseText || responseText.trim() === '') {
            console.warn('Data processing service unavailable, generating persona response directly');
            console.log(`🔍 Debug: responseText is empty, callId: ${callId}, transcript: ${transcript}`);
            console.log(`🔍 Debug: responseText value: "${responseText}", type: ${typeof responseText}`);
            
            // Get agent data from database to generate persona-based response
            try {
                console.log(`🔍 Debug: Querying call data for callId: ${callId}`);
                const callData = await pool.query('SELECT agent_ids FROM voice_calls WHERE id = $1', [callId]);
                console.log(`🔍 Debug: Call data result:`, callData.rows);
                const agentIds = callData.rows[0]?.agent_ids || [];
                console.log(`🔍 Debug: Agent IDs:`, agentIds);
                
                if (agentIds.length > 0) {
                    // For group calls, generate responses for multiple agents
                    if (type === 'group') {
                        console.log(`🎭 Generating persona responses for ${agentIds.length} agents in group call`);
                        const ioLocal = req.app.get('io');
                        const roomName = `call-${callId}`;
                        const baseGap = 400 + Math.floor(Math.random() * 300);
                        
                        console.log(`🔍 Socket.IO available:`, !!ioLocal);
                        console.log(`🔍 Room name:`, roomName);
                        
                        // Generate responses for all agents
                        console.log(`🎭 Scheduling ${agentIds.length} agents with ${baseGap}ms gap`);
                
                for (let i = 0; i < agentIds.length; i++) {
                    const agentResult = await pool.query('SELECT * FROM ai_agents WHERE id = $1', [agentIds[i]]);
                    const agent = agentResult.rows[0];
                    
                    if (agent) {
                        const currentAgentName = agent.name;
                        const currentRegion = getRegion(agent.location);
                        const englishLevel = agent.speech_patterns?.english_level || agent.english_savvy || 'Intermediate';
                        
                        console.log(`🔍 Debug: Agent ${currentAgentName}, English Level: ${englishLevel}, Location: ${agent.location}`);
                        
                        // Get uploaded image path from call data
                        let imagePath = null;
                        try {
                            const callDataResult = await pool.query('SELECT ui_path FROM calls WHERE id = $1', [callId]);
                            if (callDataResult.rows.length > 0 && callDataResult.rows[0].ui_path) {
                                imagePath = callDataResult.rows[0].ui_path;
                                console.log(`🖼️ Found uploaded image for call: ${imagePath}`);
                            }
                        } catch (imageError) {
                            console.warn('⚠️ Could not fetch image path:', imageError.message);
                        }
                        
                        // Use enhanced response generation (Group Strategy Conversation logic)
                        let agentResponseText = '';
                        try {
                            agentResponseText = await generateEnhancedVoiceResponse(agent, transcript, callId, imagePath);
                            console.log(`✅ Generated enhanced persona response for ${currentAgentName}: ${agentResponseText}`);
                        } catch (enhancedError) {
                            console.warn(`⚠️ Enhanced response generation failed for ${currentAgentName}, using fallback:`, enhancedError.message);
                            
                            // Fallback to simple persona response
                            const lowerTranscript = transcript.toLowerCase();
                            if (lowerTranscript.includes('hello') || lowerTranscript.includes('hi')) {
                                agentResponseText = `Hello! I'm ${agent.name}. It's wonderful to be participating in this research discussion. How are you today?`;
                            } else {
                                agentResponseText = `That's an interesting point. I'm ${agent.name}, and I'd be delighted to share my insights on this topic. What aspects would you like to explore further?`;
                            }
                            console.log(`✅ Generated fallback response for ${currentAgentName}: ${agentResponseText}`);
                        }
                        
                        // Generate audio for this agent response
                        let audioUrl = null;
                        try {
                            const voiceId = getVoiceId(agent, currentRegion);
                            const voiceSettings = VOICE_SETTINGS[currentRegion] || VOICE_SETTINGS.default;
                            
                            console.log(`🎙️ Generating voice for ${currentAgentName} (${currentRegion}): ${voiceId}`);
                            
                            // Use axios directly to bypass SSL issues
                            const response = await axios.post(
                                `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
                                {
                                    text: agentResponseText,
                                    model_id: 'eleven_multilingual_v2',
                                    voice_settings: voiceSettings
                                },
                                {
                                    headers: {
                                        'Accept': 'audio/mpeg',
                                        'Content-Type': 'application/json',
                                        'xi-api-key': process.env.ELEVENLABS_API_KEY
                                    },
                                    responseType: 'arraybuffer',
                                    httpsAgent: new https.Agent({
                                        rejectUnauthorized: false
                                    })
                                }
                            );
                            
                            const filename = `call_${callId}_${Date.now()}_${Math.random().toString(36).substring(7)}.mp3`;
                            const filepath = path.join(audioTempDir, filename);
                            
                            fs.writeFileSync(filepath, response.data);
                            
                            audioUrl = `/uploads/audio/${filename}`;
                            console.log(`✅ Audio generated: ${audioUrl}`);
                        } catch (audioError) {
                            console.warn('⚠️ Audio generation failed:', audioError.message);
                        }
                        
                        // Emit agent response with delay
                        const startDelay = i * baseGap;
                        console.log(`🔍 Scheduling response for ${currentAgentName} with delay: ${startDelay}ms`);
                        setTimeout(() => {
                            console.log(`🔍 Emitting typing for ${currentAgentName}`);
                            ioLocal && ioLocal.to(roomName).emit('agent-typing', {
                                callId,
                                agentName: currentAgentName,
                                isTyping: true
                            });
                            const speakDelay = 200 + Math.floor(Math.random() * 200);
                            setTimeout(() => {
                                console.log(`🔍 Emitting response for ${currentAgentName}: ${agentResponseText}`);
                                ioLocal && ioLocal.to(roomName).emit('agent-response', {
                                    callId,
                                    agentName: currentAgentName,
                                    responseText: agentResponseText,
                                    audioUrl: audioUrl,
                                    timestamp: new Date().toISOString(),
                                    region: currentRegion
                                });
                                console.log(`✅ Agent responded: ${currentAgentName}`);
                            }, speakDelay);
                        }, startDelay);
                        
                        // Use first agent's response for the main response
                        if (i === 0) {
                            responseText = agentResponseText;
                            agentName = currentAgentName;
                            region = currentRegion;
                        }
                    } else {
                        console.warn(`❌ No agent found with ID: ${agentIds[i]}`);
                    }
                }
                    } else {
                        // Single call - generate response for first agent only
                        console.log(`🔍 Debug: Querying agent data for ID: ${agentIds[0]}`);
                        const agentResult = await pool.query('SELECT * FROM ai_agents WHERE id = $1', [agentIds[0]]);
                        console.log(`🔍 Debug: Agent result:`, agentResult.rows[0] ? 'Found agent' : 'No agent found');
                        const agent = agentResult.rows[0];
                        
                        if (agent) {
                            agentName = agent.name;
                            region = getRegion(agent.location);
                            
                    // Get uploaded image path from call data
                    let imagePath = null;
                    try {
                        const callDataResult = await pool.query('SELECT ui_path FROM calls WHERE id = $1', [callId]);
                        if (callDataResult.rows.length > 0 && callDataResult.rows[0].ui_path) {
                            imagePath = callDataResult.rows[0].ui_path;
                            console.log(`🖼️ Found uploaded image for call: ${imagePath}`);
                        }
                    } catch (imageError) {
                        console.warn('⚠️ Could not fetch image path:', imageError.message);
                    }
                    
                    // Use enhanced response generation (Group Strategy Conversation logic)
                    try {
                        responseText = await generateEnhancedVoiceResponse(agent, transcript, callId, imagePath);
                        console.log(`✅ Generated enhanced persona response for ${agentName}: ${responseText}`);
                    } catch (enhancedError) {
                                console.warn(`⚠️ Enhanced response generation failed, using fallback:`, enhancedError.message);
                                
                                // Fallback to simple response
                                const lowerTranscript = transcript.toLowerCase();
                                if (lowerTranscript.includes('hello') || lowerTranscript.includes('hi')) {
                                    responseText = `Hello! I'm ${agent.name}. It's wonderful to be participating in this research discussion. How are you today?`;
                                } else {
                                    responseText = `That's an interesting point. I'm ${agent.name}, and I'd be delighted to share my insights on this topic. What aspects would you like to explore further?`;
                                }
                                console.log(`✅ Generated fallback response for ${agentName}: ${responseText}`);
                            }
                        } else {
                            console.warn(`❌ No agent found with ID: ${agentIds[0]}`);
                        }
                    }
                } else {
                    console.warn(`❌ No agent IDs found for call: ${callId}`);
                }
            } catch (dbError) {
                console.error('❌ Error generating persona response:', dbError);
            }
            
            // If still no response, return empty (no AI Assistant)
            if (!responseText) {
                console.warn('❌ Could not generate persona response, returning empty');
                return res.json({ responseText: '', audioUrl: null, transcript });
            }
        }

        if (!responseText) {
            return res.json({ responseText: '', audioUrl: null, transcript });
        }

        // For group calls, we already emitted Socket.IO events and the frontend does TTS.
        // Return immediately to reduce latency.
        if (type === 'group') {
            // For group calls, return empty response since agents respond via Socket.IO
            return res.json({ 
                responseText: '',
                audioUrl: null,
                transcript,
                agentName: '',
                region: 'north'
            });
        }

        // Step 3: Text-to-Speech with ElevenLabs (Enhanced Indian accent)
        const voiceId = INDIAN_VOICES[region] || INDIAN_VOICES.default;
        const voiceSettings = VOICE_SETTINGS[region] || VOICE_SETTINGS.default;
        
        console.log(`Generating TTS for: "${responseText}" with unified voice: ${voiceId} (${region} accent)`);
        
        let ttsAudioPath;
        try {
            const audioStream = await elevenlabsClient.textToSpeech.convert(voiceId, {
                text: responseText,
                model_id: 'eleven_multilingual_v2',
                voice_settings: voiceSettings
            });

            // Save TTS audio
            ttsAudioPath = path.join(audioTempDir, `${uuidv4()}.mp3`);
            const writeStream = fs.createWriteStream(ttsAudioPath);
            
            for await (const chunk of audioStream) {
                writeStream.write(chunk);
            }
            
            await new Promise((resolve, reject) => {
                writeStream.on('finish', resolve);
                writeStream.on('error', reject);
                writeStream.end();
            });
            
            console.log(`TTS audio saved to: ${ttsAudioPath}`);
        } catch (ttsError) {
            console.error('ElevenLabs TTS error:', ttsError);
            console.log('TTS failed, returning response without audio');
            ttsAudioPath = null;
        }

        // Generate public URL for audio
        const audioUrl = ttsAudioPath ? `/uploads/audio/${path.basename(ttsAudioPath)}` : null;

        // Log event to database
        await pool.query(
            'INSERT INTO voice_events (call_id, speaker, kind, text, audio_url) VALUES ($1, $2, $3, $4, $5)',
            [callId, agentName || 'Agent', 'agent-response', responseText, audioUrl]
        );

        // Emit agent response to all clients in the call with human-like behavior
        const io = req.app.get('io');
        if (io) {
            const roomName = `call-${callId}`;
            console.log(`🔌 Emitting to room: ${roomName}, agent: ${agentName}`);
            console.log(`🔌 Socket.IO connected clients:`, io.sockets.sockets.size);
            
            // Show typing indicator first
            io.to(roomName).emit('agent-typing', {
                callId,
                agentName,
                isTyping: true
            });
            console.log(`⌨️ Sent agent-typing to room ${roomName}`);
            
            // Add some human-like delay (1-3 seconds)
            const delay = Math.random() * 2000 + 1000;
            
            setTimeout(() => {
                console.log(`🤖 Sending agent response to room ${roomName}: "${responseText.substring(0, 50)}..."`);
                io.to(roomName).emit('agent-response', {
                    callId,
                    agentName,
                    responseText,
                    audioUrl,
                    timestamp: new Date().toISOString(),
                    isTyping: false,
                    isSpeaking: true
                });
                console.log(`✅ Agent response sent to room ${roomName}`);
            }, delay);
        } else {
            console.warn('❌ Socket.IO not available, cannot emit agent response');
        }

        // Clean up temp input file if it exists
        if (tempAudioPath && fs.existsSync(tempAudioPath)) {
            fs.unlinkSync(tempAudioPath);
        }

        res.json({ 
            responseText, 
            audioUrl,
            transcript,
            agentName,
            region
        });

    } catch (error) {
        console.error('Process speech error:', error);
        console.error('Error stack:', error.stack);
        
        // Provide more specific error information
        let errorMessage = error.message;
        if (error.response) {
            errorMessage = `External service error: ${error.response.status} - ${error.response.statusText}`;
        }
        
        res.status(500).json({ 
            error: 'Failed to process speech', 
            details: errorMessage,
            step: error.step || 'unknown'
        });
    }
});

// Get call status and last 100 events
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const call = await pool.query('SELECT * FROM voice_calls WHERE id = $1', [id]);
        if (call.rows.length === 0) {
            return res.status(404).json({ error: 'Call not found' });
        }

        const events = await pool.query(
            'SELECT speaker, kind, text, audio_url, created_at FROM voice_events WHERE call_id = $1 ORDER BY created_at DESC LIMIT 100',
            [id]
        );

        res.json({ call: call.rows[0], events: events.rows });
    } catch (error) {
        console.error('Get call error:', error);
        res.status(500).json({ error: 'Failed to fetch call', details: error.message });
    }
});

// End call
router.post('/:id/end', async (req, res) => {
    try {
        const { id } = req.params;
        
        try {
            await pool.query(
                'UPDATE voice_calls SET status = $1, ended_at = NOW() WHERE id = $2',
                ['closed', id]
            );
        } catch (dbError) {
            // If ended_at column doesn't exist, just update status
            if (dbError.code === '42703') {
                await pool.query(
                    'UPDATE voice_calls SET status = $1 WHERE id = $2',
                    ['closed', id]
                );
            } else {
                throw dbError;
            }
        }

        res.json({ success: true, message: 'Call ended' });
    } catch (error) {
        console.error('End call error:', error);
        res.status(500).json({ error: 'Failed to end call', details: error.message });
    }
});

// Use the exact same response generation as GroupChat
async function generateEnhancedVoiceResponse(agent, transcript, callId, imagePath = null) {
    try {
        // Import the same functions from aiChat.js
        const { buildEnhancedContext, generateEnhancedResponse } = require('./aiChat');
        
        // Use the same logic as GroupChat, but pass the image path
        const context = buildEnhancedContext(agent, [], transcript, imagePath);
        const response = await generateEnhancedResponse(context, transcript, imagePath);
        
        return response;
        
    } catch (error) {
        console.error('Enhanced voice response generation failed:', error);
        throw error;
    }
}

module.exports = router;



