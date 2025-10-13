const express = require('express');
const router = express.Router();
const axios = require('axios');
const { ElevenLabsClient } = require('elevenlabs');
const fs = require('fs');
const path = require('path');

// Import database pool
const { pool } = require('../models/database');

// Initialize ElevenLabs client
let elevenlabsClient = null;
if (process.env.ELEVENLABS_API_KEY) {
    elevenlabsClient = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });
}

// Create audio temp directory
const audioTempDir = path.join(__dirname, '../uploads/audio/sessions');
if (!fs.existsSync(audioTempDir)) {
    fs.mkdirSync(audioTempDir, { recursive: true });
}

// Regional-specific voices from ElevenLabs Voice Library
// Tamil Nadu agents use specific Tamil voice for authentic regional accent
// Reference: https://elevenlabs.io/app/voice-library?voiceId=rgltZvTfiMmgWweZhh7n
const INDIAN_VOICES = {
    north: 'WeK8ylKjTV2trMlayizC', // Natural North Indian voice
    south: 'WeK8ylKjTV2trMlayizC', // Natural South Indian voice
    west: 'WeK8ylKjTV2trMlayizC', // Natural West Indian voice
    east: 'WeK8ylKjTV2trMlayizC', // Natural East Indian voice
    tamil: 'rgltZvTfiMmgWweZhh7n', // Authentic Tamil voice from ElevenLabs library
    default: 'WeK8ylKjTV2trMlayizC' // Natural Indian voice (default)
};

// Optimized voice settings per region
const VOICE_SETTINGS = {
    north: {
        stability: 0.6,
        similarity_boost: 0.8,
        style: 0.5,
        use_speaker_boost: true
    },
    south: {
        stability: 0.6,
        similarity_boost: 0.8,
        style: 0.5,
        use_speaker_boost: true
    },
    west: {
        stability: 0.6,
        similarity_boost: 0.8,
        style: 0.5,
        use_speaker_boost: true
    },
    east: {
        stability: 0.6,
        similarity_boost: 0.8,
        style: 0.5,
        use_speaker_boost: true
    },
    tamil: {
        stability: 0.65,
        similarity_boost: 0.85,
        style: 0.6,
        use_speaker_boost: true
    },
    default: {
        stability: 0.6,
        similarity_boost: 0.8,
        style: 0.5,
        use_speaker_boost: true
    }
};

function getRegion(location) {
    if (!location) return 'north';
    const loc = location.toLowerCase();
    if (loc.includes('tamil') || loc.includes('chennai') || loc.includes('madurai')) return 'tamil';
    if (loc.includes('delhi') || loc.includes('lucknow') || loc.includes('jaipur') || loc.includes('punjab')) return 'north';
    if (loc.includes('bangalore') || loc.includes('hyderabad') || loc.includes('kochi') || loc.includes('kerala')) return 'south';
    if (loc.includes('mumbai') || loc.includes('pune') || loc.includes('nashik') || loc.includes('ahmedabad')) return 'west';
    if (loc.includes('kolkata') || loc.includes('patna')) return 'east';
    return 'north';
}

// Mock session storage (replace with PostgreSQL)
const sessions = [];

// Helper function to get all agents
async function getAllAgents() {
    try {
        const result = await pool.query(`
            SELECT 
                id, name, occupation as role, age, gender, location,
                personality, goals, pain_points, motivations,
                sample_quote, tone, conversation_style, background_story,
                voice_id, avatar_url
            FROM ai_agents
            WHERE is_active = true
            ORDER BY created_at DESC
        `);
        return result.rows;
    } catch (error) {
        console.error('Error fetching agents from database:', error);
        return [];
    }
}

// Helper function to generate voice audio using ElevenLabs
async function generateVoiceAudio(text, agentLocation, agentVoiceId) {
    if (!elevenlabsClient) {
        console.warn('⚠️ ElevenLabs not configured. Skipping voice generation.');
        return null;
    }

    try {
        const region = getRegion(agentLocation);
        const voiceId = agentVoiceId || INDIAN_VOICES[region] || INDIAN_VOICES.default;
        const voiceSettings = VOICE_SETTINGS[region] || VOICE_SETTINGS.default;

        console.log(`🎙️ Generating voice for region: ${region}, voice: ${voiceId}`);

        const audioStream = await elevenlabsClient.textToSpeech.convert(voiceId, {
            text: text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: voiceSettings
        });

        // Save audio to file
        const filename = `session_${Date.now()}_${Math.random().toString(36).substring(7)}.mp3`;
        const filepath = path.join(audioTempDir, filename);
        const fileStream = fs.createWriteStream(filepath);

        // Write audio stream to file
        for await (const chunk of audioStream) {
            fileStream.write(chunk);
        }
        fileStream.end();

        // Return URL path (must match express.static('/uploads') route)
        return `/uploads/audio/sessions/${filename}`;
    } catch (error) {
        console.error('❌ ElevenLabs TTS error:', error);
        return null;
    }
}

/**
 * POST /api/sessions/create
 * Create a new user research session (group discussion or 1:1 interview)
 * 
 * Body:
 * - type: 'group' | '1on1'
 * - agentIds: array of agent IDs
 * - topic: string
 */
router.post('/create', async (req, res) => {
    try {
        const { type, agentIds, topic } = req.body;

        // Validation
        if (!type || !['group', '1on1'].includes(type)) {
            return res.status(400).json({ 
                error: 'Invalid session type. Must be "group" or "1on1"' 
            });
        }

        if (!agentIds || !Array.isArray(agentIds) || agentIds.length === 0) {
            return res.status(400).json({ 
                error: 'Agent IDs are required and must be a non-empty array' 
            });
        }

        if (type === 'group' && agentIds.length > 5) {
            return res.status(400).json({ 
                error: 'Group sessions limited to 5 agents maximum' 
            });
        }

        if (type === '1on1' && agentIds.length !== 1) {
            return res.status(400).json({ 
                error: '1:1 sessions require exactly one agent' 
            });
        }

        if (!topic || topic.trim().length === 0) {
            return res.status(400).json({ 
                error: 'Topic is required' 
            });
        }

        // Fetch real agent data from Agent Library
        let allAgents = [];
        try {
            allAgents = await getAllAgents();
        } catch (dbError) {
            console.log('Database not available, using localStorage fallback');
        }

        // Map agent IDs to actual agent data from ai_agents table
        const selectedAgents = agentIds.map(id => {
            const agent = allAgents.find(a => a.id === id);
            
            if (agent) {
                // Extract personality traits
                const personality = Array.isArray(agent.personality) 
                    ? agent.personality 
                    : (agent.personality?.traits || ['professional', 'thoughtful']);
                
                // Extract key quotes
                const keyQuotes = [
                    agent.sample_quote || 'I understand',
                    ...(agent.goals || []).slice(0, 1),
                    'That makes sense'
                ];

                return {
                    id: agent.id,
                    name: agent.name,
                    voice_id: agent.voice_id,
                    location: agent.location,
                    avatar_url: agent.avatar_url,
                    persona_json: {
                        name: agent.name,
                        age: agent.age || 30,
                        gender: agent.gender,
                        location: agent.location,
                        role: agent.role,
                        personality: personality,
                        key_quotes: keyQuotes,
                        goals: agent.goals || [],
                        pain_points: agent.pain_points || [],
                        motivations: agent.motivations || [],
                        tone: agent.tone || 'professional',
                        expertise: agent.role || 'General',
                        background_story: agent.background_story,
                        voice_id: agent.voice_id,
                        avatar_url: agent.avatar_url
                    }
                };
            }
            
            // Fallback if agent not found
            console.warn(`Agent with ID ${id} not found in database`);
            return {
                id,
                name: `Agent ${id}`,
                persona_json: {
                    name: `Agent ${id}`,
                    age: 30,
                    personality: ['professional'],
                    key_quotes: ['I see', 'Interesting'],
                    preferences: {},
                    expertise: 'General'
                }
            };
        });

        // Generate real agent responses using data-processing service
        const log = await generateRealSession(type, selectedAgents, topic);

        // Store session
        const session = {
            id: sessions.length + 1,
            type,
            agent_ids: agentIds,
            topic,
            log_json: log,
            status: 'completed',
            duration_minutes: Math.floor(log.length / 2),
            created_at: new Date().toISOString()
        };

        sessions.push(session);

        res.json({ 
            sessionId: session.id,
            status: 'completed',
            message: 'Session created successfully'
        });

    } catch (error) {
        console.error('Session creation error:', error);
        res.status(500).json({ 
            error: 'Failed to create session',
            details: error.message 
        });
    }
});

/**
 * GET /api/sessions/:id
 * Retrieve a session by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const sessionId = parseInt(req.params.id);
        
        // Find session (mock)
        const session = sessions.find(s => s.id === sessionId);
        
        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        res.json(session);

    } catch (error) {
        console.error('Session retrieval error:', error);
        res.status(500).json({ 
            error: 'Failed to retrieve session',
            details: error.message 
        });
    }
});

/**
 * GET /api/sessions
 * List all sessions with optional filtering
 */
router.get('/', async (req, res) => {
    try {
        const { type, limit = 50 } = req.query;
        
        let filteredSessions = [...sessions];
        
        if (type) {
            filteredSessions = filteredSessions.filter(s => s.type === type);
        }
        
        // Sort by created_at descending
        filteredSessions.sort((a, b) => 
            new Date(b.created_at) - new Date(a.created_at)
        );
        
        // Limit results
        filteredSessions = filteredSessions.slice(0, parseInt(limit));

        res.json({
            sessions: filteredSessions,
            total: filteredSessions.length
        });

    } catch (error) {
        console.error('Sessions list error:', error);
        res.status(500).json({ 
            error: 'Failed to retrieve sessions',
            details: error.message 
        });
    }
});

/**
 * DELETE /api/sessions/:id
 * Delete a session
 */
router.delete('/:id', async (req, res) => {
    try {
        const sessionId = parseInt(req.params.id);
        const index = sessions.findIndex(s => s.id === sessionId);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Session not found' });
        }

        sessions.splice(index, 1);

        res.json({ 
            success: true,
            message: 'Session deleted successfully'
        });

    } catch (error) {
        console.error('Session deletion error:', error);
        res.status(500).json({ 
            error: 'Failed to delete session',
            details: error.message 
        });
    }
});

/**
 * Generate real session with authentic agent responses
 * Calls data-processing service for human-like AI agent responses
 */
async function generateRealSession(type, agents, topic) {
    const log = [];
    const DATA_PROCESSING_URL = process.env.DATA_PROCESSING_URL || 'http://localhost:8003';
    
    try {
        if (type === '1on1') {
            // 1:1 Interview with real agent
            const agent = agents[0];
            const agentPersona = agent.persona_json;
            
            log.push({
                speaker: 'Moderator',
                text: `Let's discuss ${topic}. What are your thoughts on this?`,
                timestamp: new Date().toISOString()
            });

            // Get full agent data for rich persona
            const fullAgentData = await pool.query('SELECT * FROM ai_agents WHERE id = $1', [agent.id]);
            const fullAgent = fullAgentData.rows[0];

            for (let i = 0; i < 5; i++) {
                try {
                    // Call data-processing service for authentic response
                    const response = await axios.post(`${DATA_PROCESSING_URL}/call/simulate`, {
                        agent_name: agentPersona.name,
                        location: agentPersona.location || fullAgent.location,
                        demographics: fullAgent.demographics || { age: agentPersona.age, gender: agentPersona.gender },
                        traits: fullAgent.traits || {},
                        communication_style: fullAgent.communication_style || {},
                        speech_patterns: fullAgent.speech_patterns || {},
                        vocabulary_profile: fullAgent.vocabulary_profile || {},
                        emotional_profile: fullAgent.emotional_profile || {},
                        cognitive_profile: fullAgent.cognitive_profile || {},
                        objectives: fullAgent.objectives || agentPersona.goals || [],
                        needs: fullAgent.needs || [],
                        fears: fullAgent.fears || [],
                        apprehensions: fullAgent.apprehensions || [],
                        motivations: fullAgent.motivations || agentPersona.motivations || [],
                        frustrations: fullAgent.frustrations || agentPersona.pain_points || [],
                        domain_literacy: fullAgent.domain_literacy || {},
                        tech_savviness: fullAgent.tech_savviness || 'Intermediate',
                        knowledge_bounds: fullAgent.knowledge_bounds || {},
                        background_story: fullAgent.background_story || agentPersona.background_story || '',
                        system_prompt: fullAgent.master_system_prompt || '',
                        cultural_background: fullAgent.cultural_background || {},
                        social_context: fullAgent.social_context || {},
                        key_quotes: agentPersona.key_quotes || [],
                        conversation_history: log.slice(-3).map(msg => ({
                            role: msg.speaker === agentPersona.name ? 'assistant' : 'user',
                            content: msg.text
                        })),
                        user_input: log[log.length - 1]?.text || `Let's discuss ${topic}`,
                        topic: topic
                    }, { timeout: 15000 });

                    const agentResponse = response.data.response || response.data.text || "I see what you mean.";
                    
                    // Generate voice audio
                    const audioUrl = await generateVoiceAudio(agentResponse, agent.location, agent.voice_id);

                    log.push({
                        speaker: agentPersona.name,
                        text: agentResponse,
                        audioUrl: audioUrl,
                        avatar: agent.avatar_url,
                        timestamp: new Date().toISOString()
                    });

                    // Follow-up question
                    if (i < 4) {
                        const followUps = [
                            `Can you tell me more about that?`,
                            `That's interesting. How does that work in practice?`,
                            `What challenges do you face with this?`,
                            `How would you like to see this improved?`,
                            `Any other thoughts on this?`
                        ];
                        log.push({
                            speaker: 'Moderator',
                            text: followUps[i],
                            timestamp: new Date().toISOString()
                        });
                    }
                } catch (error) {
                    console.error('Error getting agent response:', error.message);
                    // Fallback response
                    log.push({
                        speaker: agentPersona.name,
                        text: `Hmm, ${topic} is interesting. Let me think about this...`,
                        avatar: agent.avatar_url,
                        timestamp: new Date().toISOString()
                    });
                }
            }
        } else {
            // Group discussion with multiple real agents
            log.push({
                speaker: 'Moderator',
                text: `Welcome everyone! Today we're discussing ${topic}. Let's hear everyone's perspectives.`,
                timestamp: new Date().toISOString()
            });

            // Get full agent data for all agents
            const agentIds = agents.map(a => a.id);
            const fullAgentsData = await pool.query('SELECT * FROM ai_agents WHERE id = ANY($1)', [agentIds]);
            const fullAgentsMap = {};
            fullAgentsData.rows.forEach(a => {
                fullAgentsMap[a.id] = a;
            });

            for (let i = 0; i < 10; i++) {
                const agent = agents[Math.floor(Math.random() * agents.length)];
                const agentPersona = agent.persona_json;
                const fullAgent = fullAgentsMap[agent.id];

                try {
                    // Call data-processing service for authentic response
                    const response = await axios.post(`${DATA_PROCESSING_URL}/call/simulate`, {
                        agent_name: agentPersona.name,
                        location: agentPersona.location || fullAgent.location,
                        demographics: fullAgent.demographics || { age: agentPersona.age, gender: agentPersona.gender },
                        traits: fullAgent.traits || {},
                        communication_style: fullAgent.communication_style || {},
                        speech_patterns: fullAgent.speech_patterns || {},
                        vocabulary_profile: fullAgent.vocabulary_profile || {},
                        emotional_profile: fullAgent.emotional_profile || {},
                        cognitive_profile: fullAgent.cognitive_profile || {},
                        objectives: fullAgent.objectives || agentPersona.goals || [],
                        needs: fullAgent.needs || [],
                        fears: fullAgent.fears || [],
                        apprehensions: fullAgent.apprehensions || [],
                        motivations: fullAgent.motivations || agentPersona.motivations || [],
                        frustrations: fullAgent.frustrations || agentPersona.pain_points || [],
                        domain_literacy: fullAgent.domain_literacy || {},
                        tech_savviness: fullAgent.tech_savviness || 'Intermediate',
                        knowledge_bounds: fullAgent.knowledge_bounds || {},
                        background_story: fullAgent.background_story || agentPersona.background_story || '',
                        system_prompt: fullAgent.master_system_prompt || '',
                        cultural_background: fullAgent.cultural_background || {},
                        social_context: fullAgent.social_context || {},
                        key_quotes: agentPersona.key_quotes || [],
                        conversation_history: log.slice(-5).map(msg => ({
                            role: msg.speaker === agentPersona.name ? 'assistant' : 'user',
                            content: msg.text
                        })),
                        user_input: log[log.length - 1]?.text || `What do you think about ${topic}?`,
                        topic: topic
                    }, { timeout: 15000 });

                    const agentResponse = response.data.response || response.data.text || "I have some thoughts on this.";
                    
                    // Generate voice audio
                    const audioUrl = await generateVoiceAudio(agentResponse, agent.location, agent.voice_id);

                    log.push({
                        speaker: agentPersona.name,
                        text: agentResponse,
                        audioUrl: audioUrl,
                        avatar: agent.avatar_url,
                        timestamp: new Date().toISOString()
                    });
                } catch (error) {
                    console.error('Error getting agent response:', error.message);
                    // Fallback response
                    log.push({
                        speaker: agentPersona.name,
                        text: `Interesting point about ${topic}. I agree with what others are saying.`,
                        avatar: agent.avatar_url,
                        timestamp: new Date().toISOString()
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error generating session:', error);
        // Return minimal fallback
        log.push({
            speaker: 'System',
            text: 'Session could not be generated. Please try again.',
            timestamp: new Date().toISOString()
        });
    }

    return log;
}

module.exports = router;

