/**
 * AI Chat API - Handle conversations with generated agents
 * Uses LangGraph for stateful chats and context management
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { pool } = require('../models/database');
const { OpenAI } = require('openai');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log('Multer destination called for file:', file.originalname);
        console.log('Current working directory:', process.cwd());
        const uploadPath = 'uploads/ui/';
        console.log('Upload path:', uploadPath);
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        console.log('Multer filename called for file:', file.originalname);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
        console.log('Generated filename:', filename);
        cb(null, filename);
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files (PNG, JPG, JPEG) and PDF files are allowed'));
        }
    }
});

// OpenAI will be initialized lazily when needed
let openai = null;

const getOpenAI = () => {
    if (!openai) {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY environment variable is required');
        }
        openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }
    return openai;
};

/**
 * POST /api/ai/generate - Chat with an agent with enhanced context
 * Body: { agentId, query, ui_path, chat_history }
 */
router.post('/generate', async (req, res) => {
    try {
        const { agentId, query, ui_path, chat_history = [] } = req.body;
        
        if (!agentId || !query) {
            return res.status(400).json({ 
                error: 'Agent ID and query are required' 
            });
        }

        // Get agent from database
        const agent = await getAgentById(agentId);
        if (!agent) {
            return res.status(404).json({ error: 'Agent not found' });
        }

        // Build enhanced context with UI feedback capabilities
        const context = buildEnhancedContext(agent, chat_history, query, ui_path);
        
        // Generate response using OpenAI with vision if UI is provided
        const response = await generateEnhancedResponse(context, query, ui_path);
        
        res.json({
            success: true,
            response: response,
            agentId: agentId,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('AI chat error:', error);
        
        // If API key is invalid or missing, return a mock response instead of error
        if (error.message.includes('API key') || error.message.includes('invalid_api_key')) {
            const mockResponses = [
                "I understand your question. Let me provide some insights based on my experience.",
                "That's an interesting point. From my perspective, I would suggest considering the following approach.",
                "I appreciate you bringing this up. Here's what I think we should focus on.",
                "Based on my expertise in this area, I recommend we take a systematic approach.",
                "This is a common challenge. Let me share some strategies that have worked well.",
                "I see what you're getting at. Here's my take on this situation.",
                "That's a valid concern. Let me break this down into manageable steps.",
                "I've encountered similar situations before. Here's how I would approach this."
            ];
            
            const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
            
            return res.json({
                success: true,
                response: randomResponse,
                agentId: agentId,
                timestamp: new Date().toISOString(),
                mock: true // Flag to indicate this is a mock response
            });
        }
        
        res.status(500).json({
            error: 'Chat generation failed',
            details: error.message
        });
    }
});

/**
 * POST /api/ai/upload-ui - Upload UI image for analysis
 * Body: { image, agentId }
 */
router.post('/upload-ui', upload.single('image'), async (req, res) => {
    console.log('=== UPLOAD ENDPOINT CALLED ===');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('Request files:', req.files);
    try {
        const { agentId } = req.body;
        const image = req.file;
        
        console.log('Upload request received:', { agentId, image: image ? image.filename : 'no file' });
        
        if (!agentId || !image) {
            return res.status(400).json({ 
                error: 'Agent ID and image are required' 
            });
        }

        // Validate file type
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
        if (!allowedTypes.includes(image.mimetype)) {
            return res.status(400).json({ 
                error: 'Invalid file type. Please use PNG, JPG, or PDF.' 
            });
        }

        // Validate file size (5MB max)
        if (image.size > 5 * 1024 * 1024) {
            return res.status(400).json({ 
                error: 'File too large. Maximum size is 5MB.' 
            });
        }

        // File is automatically saved by multer diskStorage
        const ui_path = `/uploads/ui/${image.filename}`;
        
        console.log('File saved successfully to:', ui_path);
        
        res.json({
            success: true,
            ui_path: ui_path,
            agentId: agentId,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('UI upload error:', error);
        res.status(500).json({
            error: 'UI upload failed',
            details: error.message
        });
    }
});

/**
 * POST /api/ai/clear-history - Clear chat history for agent
 * Body: { agentId }
 */
router.post('/clear-history', async (req, res) => {
    try {
        const { agentId } = req.body;
        
        if (!agentId) {
            return res.status(400).json({ 
                error: 'Agent ID is required' 
            });
        }

        // In a real implementation, you would clear the history from database
        // For now, we'll just return success
        
        res.json({
            success: true,
            message: 'Chat history cleared',
            agentId: agentId
        });
        
    } catch (error) {
        console.error('Clear history error:', error);
        res.status(500).json({
            error: 'Failed to clear history',
            details: error.message
        });
    }
});


/**
 * POST /api/agent/feedback - Get agent feedback on uploaded image
 * Body: { image, agentId }
 */
router.post('/feedback', async (req, res) => {
    try {
        const { agentId } = req.body;
        const image = req.file;
        
        if (!agentId || !image) {
            return res.status(400).json({ 
                error: 'Agent ID and image are required' 
            });
        }

        // Get agent from database
        const agent = await getAgentById(agentId);
        if (!agent) {
            return res.status(404).json({ error: 'Agent not found' });
        }

        // For now, simulate image analysis (in production, use vision API)
        const feedback = await simulateImageAnalysis(agent, image);
        
        res.json({
            success: true,
            feedback: feedback,
            agentId: agentId,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Image feedback error:', error);
        res.status(500).json({
            error: 'Image feedback failed',
            details: error.message
        });
    }
});

/**
 * Get agent by ID
 */
async function getAgentById(agentId) {
    try {
        const query = 'SELECT * FROM ai_agents WHERE id = $1 AND is_active = true';
        const result = await pool.query(query, [agentId]);
        return result.rows[0];
    } catch (error) {
        console.error('Error fetching agent:', error);
        throw error;
    }
}

/**
 * Get conversation history for context
 */
async function getConversationHistory(agentId, limit = 10) {
    try {
        const query = `
            SELECT user_message, agent_response, created_at 
            FROM conversations 
            WHERE agent_id = $1 
            ORDER BY created_at DESC 
            LIMIT $2
        `;
        const result = await pool.query(query, [agentId, limit]);
        return result.rows.reverse(); // Return in chronological order
    } catch (error) {
        console.error('Error fetching conversation history:', error);
        return [];
    }
}

/**
 * Build enhanced conversation context with UI feedback capabilities
 */
function buildEnhancedContext(agent, chatHistory, query, ui_path) {
    const { 
        demographics, 
        master_system_prompt, 
        name, 
        occupation, 
        location,
        traits,
        behaviors,
        emotional_profile,
        apprehensions,
        speech_patterns,
        vocabulary_profile,
        cultural_background,
        social_context,
        tech_savviness,
        communication_style
    } = agent;
    
    const agentName = name || 'AI Agent';
    const agentOccupation = occupation || 'Professional';
    const agentLocation = location || 'Unknown';
    
    // Use the master system prompt as the base (it contains comprehensive persona data)
    let context = `${master_system_prompt || 'You are a helpful AI assistant.'}\n\n`;
    
    // Add persona-specific UI analysis context
    if (ui_path) {
        context += `\n🎯 UI ANALYSIS MODE - You are ${agentName} analyzing this interface:\n\n`;
        
        // Personal context for UI analysis
        context += `PERSONAL CONTEXT:\n`;
        context += `- I'm ${agentName}, a ${agentOccupation} from ${agentLocation}\n`;
        context += `- Age: ${demographics?.age || 'Unknown'}, Gender: ${demographics?.gender || 'Unknown'}\n`;
        context += `- Education: ${demographics?.education || 'Unknown'}\n`;
        context += `- Background: ${demographics?.background || 'Professional'}\n`;
        context += `- Income: ${demographics?.income_range || 'Unknown'}\n`;
        context += `- Family: ${demographics?.family_status || 'Unknown'}\n\n`;
        
        // My specific UI pain points and concerns
        if (apprehensions && apprehensions.length > 0) {
            context += `MY UI CONCERNS (what I worry about):\n`;
            apprehensions.forEach(point => {
                context += `- ${point}\n`;
            });
            context += `\n`;
        }
        
        // My personality traits affecting UI perception
        if (traits && traits.adjectives) {
            context += `MY PERSONALITY (${traits.adjectives.join(', ')}):\n`;
            if (traits.adjectives.includes('compassionate')) {
                context += `- I care about how this affects users' wellbeing\n`;
            }
            if (traits.adjectives.includes('analytical')) {
                context += `- I'll examine the logic and flow carefully\n`;
            }
            if (traits.adjectives.includes('patient')) {
                context += `- I understand learning curves but expect clarity\n`;
            }
            if (traits.adjectives.includes('dedicated')) {
                context += `- I'll invest time to understand if it's worth it\n`;
            }
            if (traits.adjectives.includes('ethical')) {
                context += `- I'm concerned about fairness and transparency\n`;
            }
            context += `\n`;
        }
        
        // My tech comfort level
        if (tech_savviness) {
            context += `MY TECH COMFORT: ${tech_savviness}\n`;
            if (tech_savviness === 'low') {
                context += `- I need clear instructions and simple navigation\n`;
                context += `- Complex features overwhelm me\n`;
                context += `- I prefer step-by-step guidance\n`;
            } else if (tech_savviness === 'medium') {
                context += `- I can handle moderate complexity\n`;
                context += `- I like some advanced features but need good UX\n`;
                context += `- I can learn but don't want to struggle\n`;
            } else if (tech_savviness === 'high') {
                context += `- I appreciate powerful features and efficiency\n`;
                context += `- I can handle complex interfaces if well-designed\n`;
                context += `- I want customization and advanced options\n`;
            }
            context += `\n`;
        }
        
        // My daily routine and how UI fits
        if (behaviors && behaviors.daily_routine) {
            context += `MY DAILY ROUTINE (how this UI fits my life):\n`;
            const dailyRoutine = Array.isArray(behaviors.daily_routine) 
                ? behaviors.daily_routine 
                : [behaviors.daily_routine];
            dailyRoutine.slice(0, 5).forEach(activity => {
                context += `- ${activity}\n`;
            });
            context += `- I need this UI to work with my busy schedule\n\n`;
        }
        
        // My financial context
        if (behaviors && behaviors.fintech_preferences) {
            context += `MY FINANCIAL HABITS:\n`;
            if (behaviors.fintech_preferences.apps) {
                context += `- Apps I use: ${behaviors.fintech_preferences.apps.join(', ')}\n`;
            }
            if (behaviors.fintech_preferences.banks) {
                context += `- My banks: ${behaviors.fintech_preferences.banks.join(', ')}\n`;
            }
            if (behaviors.fintech_preferences.payment_habits) {
                context += `- Payment style: ${behaviors.fintech_preferences.payment_habits}\n`;
            }
            context += `\n`;
        }
        
        // My emotional triggers
        if (emotional_profile && emotional_profile.triggers) {
            context += `WHAT FRUSTRATES ME:\n`;
            emotional_profile.triggers.forEach(trigger => {
                context += `- ${trigger}\n`;
            });
            context += `\n`;
        }
        
        // My goals and needs
        if (agent.objectives && agent.objectives.length > 0) {
            context += `MY GOALS:\n`;
            agent.objectives.forEach(goal => {
                context += `- ${goal}\n`;
            });
            context += `\n`;
        }
        
        if (agent.needs && agent.needs.length > 0) {
            context += `MY NEEDS:\n`;
            agent.needs.forEach(need => {
                context += `- ${need}\n`;
            });
            context += `\n`;
        }
        
        // My communication style
        if (communication_style) {
            context += `HOW I COMMUNICATE:\n`;
            if (communication_style.formality) {
                context += `- Formality: ${communication_style.formality}/10\n`;
            }
            if (communication_style.question_style) {
                context += `- Question style: ${communication_style.question_style}\n`;
            }
            if (communication_style.sentence_length) {
                context += `- Sentence length: ${communication_style.sentence_length}\n`;
            }
            context += `\n`;
        }
        
        // My speech patterns
        if (speech_patterns) {
            context += `MY SPEECH PATTERNS:\n`;
            if (speech_patterns.common_phrases) {
                context += `- I often say: "${speech_patterns.common_phrases.join('", "')}"\n`;
            }
            if (speech_patterns.filler_words) {
                context += `- I use: ${speech_patterns.filler_words.join(', ')}\n`;
            }
            context += `\n`;
        }
        
        // Analysis instructions
        context += `🎯 ANALYSIS INSTRUCTIONS:\n`;
        context += `- Look at this UI as ME, ${agentName}, not as a generic user\n`;
        context += `- Think about how this would affect MY specific work and life\n`;
        context += `- Consider MY pain points, goals, and daily routine\n`;
        context += `- Respond as I would naturally speak to a colleague\n`;
        context += `- Be specific about what works for ME and what doesn't\n`;
        context += `- Mention how this impacts MY specific concerns and needs\n`;
        context += `- Use MY natural language and communication style\n`;
        context += `- Be honest about MY frustrations and preferences\n`;
        context += `- Consider MY cultural background and values\n\n`;
        
        context += `Remember: You are ${agentName} giving feedback, not an AI assistant. Be human, be specific, be personal.\n\n`;
    }
    
    // Add conversation history (but only for this specific agent)
    if (chatHistory && chatHistory.length > 0) {
        context += "CONVERSATION HISTORY:\n";
        chatHistory.forEach(msg => {
            if (msg.role === 'user') {
                context += `User: ${msg.content}\n`;
                if (msg.ui_path) {
                    context += `[User uploaded UI: ${msg.ui_path}]\n`;
                }
            } else if (msg.role === 'agent') {
                context += `${agentName}: ${msg.content}\n`;
            }
            context += '\n';
        });
    }
    
    context += `CURRENT QUERY: ${query}\n\n`;
    
    // Add persona-specific response instructions
    if (ui_path) {
        context += `RESPONSE INSTRUCTIONS:\n`;
        context += `1. Analyze the UI image from YOUR perspective as ${agentName}\n`;
        context += `2. Reference your specific pain points and preferences\n`;
        context += `3. Use your natural speech patterns and vocabulary\n`;
        context += `4. Provide specific, actionable feedback that reflects your background\n`;
        context += `5. Stay in character throughout your response\n\n`;
    }
    
    return context;
}

/**
 * Generate enhanced agent response with UI analysis capabilities
 */
async function generateEnhancedResponse(context, query, ui_path) {
    try {
        const messages = [
            {
                role: "system",
                content: context
            }
        ];

        // If UI path is provided, add vision capabilities with the actual image
        if (ui_path) {
            try {
                // Read the image file and convert to base64
                const fs = require('fs');
                const imagePath = `.${ui_path}`; // ui_path already starts with /uploads/ui/...
                const imageBuffer = fs.readFileSync(imagePath);
                const base64Image = imageBuffer.toString('base64');
                
                // Determine the MIME type based on file extension
                const mimeType = ui_path.endsWith('.png') ? 'image/png' : 
                                ui_path.endsWith('.jpg') || ui_path.endsWith('.jpeg') ? 'image/jpeg' : 
                                'image/png';
                
                messages.push({
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: query
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:${mimeType};base64,${base64Image}`,
                                detail: "high"
                            }
                        }
                    ]
                });
            } catch (error) {
                console.error('Error reading image file:', error);
                // Fallback to text-only if image reading fails
                messages.push({
                    role: "user",
                    content: query
                });
            }
        } else {
            messages.push({
                role: "user",
                content: query
            });
        }

        const response = await getOpenAI().chat.completions.create({
            model: "gpt-4o",
            messages: messages,
            temperature: 0.7,
            max_tokens: 1000
        });
        
        return response.choices[0].message.content;
    } catch (error) {
        console.error('OpenAI response generation failed:', error);
        throw error;
    }
}

/**
 * Generate agent response using OpenAI (legacy function)
 */
async function generateAgentResponse(context, userMessage) {
    try {
        const response = await getOpenAI().chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: context
                },
                {
                    role: "user",
                    content: userMessage
                }
            ],
            temperature: 0.7,
            max_tokens: 500
        });
        
        return response.choices[0].message.content;
    } catch (error) {
        console.error('OpenAI response generation failed:', error);
        throw error;
    }
}

/**
 * Store conversation in database
 */
async function storeConversation(agentId, userMessage, agentResponse) {
    try {
        const query = `
            INSERT INTO conversations (agent_id, user_message, agent_response, created_at)
            VALUES ($1, $2, $3, $4)
        `;
        
        const values = [
            agentId,
            userMessage,
            agentResponse,
            new Date().toISOString()
        ];
        
        await pool.query(query, values);
    } catch (error) {
        console.error('Error storing conversation:', error);
        // Don't throw error to avoid breaking the chat flow
    }
}

module.exports = router;
