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
        elevenlabsClient = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
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

        // Unified voice for all agents - Natural Indian voice from ElevenLabs
        // Using WeK8ylKjTV2trMlayizC for consistent, natural voice across all agents
        const INDIAN_VOICES = {
            north: 'WeK8ylKjTV2trMlayizC', // Natural Indian voice for all regions
            south: 'WeK8ylKjTV2trMlayizC', // Natural Indian voice for all regions
            west: 'WeK8ylKjTV2trMlayizC', // Natural Indian voice for all regions
            east: 'WeK8ylKjTV2trMlayizC', // Natural Indian voice for all regions
            tamil: 'WeK8ylKjTV2trMlayizC', // Natural Indian voice for all regions
            default: 'WeK8ylKjTV2trMlayizC' // Natural Indian voice for all regions
        };
        
        // Optimized voice settings for WeK8ylKjTV2trMlayizC voice
        // Unified settings for consistent, natural speech across all agents
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
                stability: 0.6,        // Balanced for natural variation and speed
                similarity_boost: 0.8, // High for voice quality
                style: 0.5,           // Moderate for natural expressiveness
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
    try {
        console.log('=== Processing speech request ===');
        
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
        let responseText, agentName, region = 'north';
        
        try {
            const aiResponse = await axios.post(
                `${process.env.DATA_PROCESSING_URL || 'http://localhost:8000'}/process-input`,
                { transcript, callId, type },
                { timeout: 10000 }
            );
            
            ({ responseText, agentName, region = 'north' } = aiResponse.data);
        } catch (aiError) {
            console.warn('Data processing service unavailable, using intelligent fallback response:', aiError.message);
            
            // Intelligent fallback: Generate contextual responses based on what user said
            agentName = 'AI Assistant';
            
            // Analyze the transcript and generate appropriate responses
            const lowerTranscript = transcript.toLowerCase();
            
            if (lowerTranscript.includes('hello') || lowerTranscript.includes('hi')) {
                responseText = `Hello! Great to meet you. I'm here to help with your research. What would you like to discuss today?`;
            } else if (lowerTranscript.includes('how are you')) {
                responseText = `I'm doing well, thank you for asking! I'm excited to be part of this discussion. What's on your mind?`;
            } else if (lowerTranscript.includes('what') || lowerTranscript.includes('tell me')) {
                responseText = `That's an interesting question. I'd be happy to share my perspective on that. Could you tell me more about what specifically you'd like to know?`;
            } else if (lowerTranscript.includes('thank you') || lowerTranscript.includes('thanks')) {
                responseText = `You're very welcome! I'm glad I could help. Is there anything else you'd like to explore?`;
            } else if (lowerTranscript.includes('bye') || lowerTranscript.includes('goodbye')) {
                responseText = `It was great talking with you! Feel free to reach out anytime if you have more questions. Take care!`;
            } else {
                responseText = `I understand you said "${transcript}". That's really interesting. Could you elaborate on that? I'd love to hear more about your thoughts on this topic.`;
            }
            
            region = 'north';
        }

        if (!responseText) {
            return res.json({ responseText: '', audioUrl: null, transcript });
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

module.exports = router;



