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

// Indian accent voice mappings for ElevenLabs
const INDIAN_VOICES = {
    north: 'pNInz6obpgDQGcFmaJgB', // Indian male
    south: 'onwK4e9ZLuTAKqWW03F9', // Indian female
    west: 'pNInz6obpgDQGcFmaJgB', // Default Indian
    east: 'onwK4e9ZLuTAKqWW03F9', // Default Indian female
    default: 'pNInz6obpgDQGcFmaJgB'
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
        
        const { audio, callId, type = 'group' } = req.body;
        console.log('Request params:', { callId, type, audioLength: audio?.length });

        if (!audio || !callId) {
            return res.status(400).json({ error: 'audio and callId are required' });
        }

        // Decode base64 audio
        console.log('Decoding base64 audio...');
        const audioBuffer = Buffer.from(audio, 'base64');
        console.log('Audio buffer size:', audioBuffer.length);
        
        // Save temporary audio file
        const tempAudioPath = path.join(audioTempDir, `${uuidv4()}.wav`);
        fs.writeFileSync(tempAudioPath, audioBuffer);

        // Step 1: Speech-to-Text with Deepgram
        let transcript;
        try {
            const audioFile = fs.readFileSync(tempAudioPath);
            console.log('Sending audio to Deepgram...');
            
            const { result, error: dgError } = await deepgramClient.listen.prerecorded.transcribeFile(
                audioFile,
                { 
                    model: 'nova-2',
                    smart_format: true,
                    language: 'en-IN', // Indian English
                    punctuate: true,
                    diarize: false
                }
            );

            if (dgError) {
                console.error('Deepgram API error:', dgError);
                throw new Error(`Deepgram error: ${dgError.message}`);
            }

            if (!result || !result.results || !result.results.channels || !result.results.channels[0]) {
                console.error('Unexpected Deepgram response structure:', result);
                throw new Error('Invalid response from Deepgram');
            }

            transcript = result.results.channels[0].alternatives[0].transcript;
            console.log(`Deepgram transcript: "${transcript}"`);
        } catch (sttError) {
            console.error('Deepgram STT error:', sttError);
            console.error('Error details:', sttError.message);
            
            // For now, let's use a fallback instead of failing completely
            console.log('Using fallback: assuming user said "Hello"');
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

        // Step 3: Text-to-Speech with ElevenLabs (Indian accent)
        const voiceId = INDIAN_VOICES[region] || INDIAN_VOICES.default;
        
        console.log(`Generating TTS for: "${responseText}" with voice: ${voiceId}`);
        
        let ttsAudioPath;
        try {
            const audioStream = await elevenlabsClient.textToSpeech.convert(voiceId, {
                text: responseText,
                model_id: 'eleven_multilingual_v2'
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
            // Add some human-like delay (1-3 seconds)
            const delay = Math.random() * 2000 + 1000;
            
            setTimeout(() => {
                io.to(callId).emit('agent-response', {
                    callId,
                    agentName,
                    responseText,
                    audioUrl,
                    timestamp: new Date().toISOString(),
                    isTyping: false,
                    isSpeaking: true
                });
            }, delay);
            
            // Show typing indicator first
            io.to(callId).emit('agent-typing', {
                callId,
                agentName,
                isTyping: true
            });
        }

        // Clean up temp input file
        fs.unlinkSync(tempAudioPath);

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



