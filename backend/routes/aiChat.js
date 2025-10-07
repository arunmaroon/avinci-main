/**
 * AI Chat API - Handle conversations with generated agents
 * Uses LangGraph for stateful chats and context management
 */

const express = require('express');
const multer = require('multer');
const router = express.Router();
const { pool } = require('../models/database');
const { OpenAI } = require('openai');

// Configure multer for file uploads
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
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
 * POST /api/ai/generate - Chat with an agent
 * Body: { agentId, message }
 */
router.post('/generate', async (req, res) => {
    try {
        const { agentId, message } = req.body;
        
        if (!agentId || !message) {
            return res.status(400).json({ 
                error: 'Agent ID and message are required' 
            });
        }

        // Get agent from database
        const agent = await getAgentById(agentId);
        if (!agent) {
            return res.status(404).json({ error: 'Agent not found' });
        }

        // Get conversation history
        const conversationHistory = await getConversationHistory(agentId);
        
        // Build context for the conversation
        const context = buildConversationContext(agent, conversationHistory, message);
        
        // Generate response using OpenAI
        const response = await generateAgentResponse(context, message);
        
        // Store the conversation
        await storeConversation(agentId, message, response);
        
        res.json({
            success: true,
            response: response,
            agentId: agentId,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('AI chat error:', error);
        
        if (error.message.includes('API key')) {
            return res.status(500).json({
                error: 'OpenAI API key not configured',
                details: 'Please configure OPENAI_API_KEY environment variable'
            });
        }
        
        res.status(500).json({
            error: 'Chat generation failed',
            details: error.message
        });
    }
});

/**
 * POST /api/agent/feedback - Get agent feedback on uploaded image
 * Body: { image, agentId }
 */
router.post('/feedback', upload.single('image'), async (req, res) => {
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
        const query = 'SELECT * FROM agents WHERE id = $1';
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
 * Build conversation context
 */
function buildConversationContext(agent, history, currentMessage) {
    const { persona, prompt, master_system_prompt, name, location, demographics } = agent;
    const agentName = persona?.name || name || 'AI Agent';
    
    // Use master_system_prompt if available, otherwise fall back to basic prompt
    let systemPrompt = master_system_prompt || prompt || 'You are a helpful AI assistant.';
    
    // If we have detailed persona data, enhance the context
    if (demographics && (demographics.age || demographics.location)) {
        const age = demographics.age || 'unknown';
        const location = demographics.location || agent.location || 'unknown';
        const gender = demographics.gender || 'unknown';
        const occupation = demographics.role_title || agent.role_title || 'professional';
        
        // Add specific persona details to the system prompt
        systemPrompt += `\n\nIMPORTANT USER PERSONA DETAILS:
- You are ${agentName}, ${age} years old, ${gender}
- You live in ${location}
- You work as a ${occupation}
- When asked about your location, say "${location}"
- When asked about your age, say "${age}"
- When asked about your profession, say "${occupation}"
- You are a USER testing designs, not a customer service agent
- Share your honest user opinions and experiences
- Never ask "How can I help you?" - you are the one who needs help
- Always stay in character as this specific user, not a generic AI assistant`;
    }
    
    let context = `${systemPrompt}\n\n`;
    
    // Add conversation history
    if (history.length > 0) {
        context += "Previous conversation:\n";
        history.forEach(entry => {
            context += `User: ${entry.user_message}\n`;
            context += `${agentName}: ${entry.agent_response}\n\n`;
        });
    }
    
    context += `Current user message: ${currentMessage}\n\n`;
    context += `Respond as ${agentName} would, staying in character:`;
    
    return context;
}

/**
 * Generate agent response using OpenAI
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

/**
 * Simulate image analysis (placeholder for vision API)
 */
async function simulateImageAnalysis(agent, image) {
    const { persona, name, role_title, demographics, location, objectives, needs, fears } = agent;
    const agentName = persona?.name || name || 'AI Agent';
    const occupation = persona?.occupation || demographics?.role_title || role_title || 'Professional';
    const pain_points = persona?.pain_points || fears || [];
    const personality_traits = persona?.personality_traits || [];
    const agentLocation = demographics?.location || location || 'unknown location';
    const age = demographics?.age || 'unknown age';
    const userNeeds = needs || [];
    const userObjectives = objectives || [];
    
    // Generate user-focused design feedback based on persona
    const userResponses = [
        `Looking at this design, I can see it's trying to be user-friendly. As a ${age}-year-old ${occupation} from ${agentLocation}, I ${userNeeds.includes('simple interfaces') ? 'appreciate the clean look' : 'find it a bit overwhelming'}. ${pain_points?.[0] ? `I'm worried about ${pain_points[0]} - that usually confuses me.` : 'The layout seems straightforward.'}`,
        
        `This reminds me of apps I use daily. ${userObjectives.includes('navigate easily') ? 'I like how easy it seems to navigate' : 'I might struggle to find what I need'}. ${personality_traits?.includes('detail-oriented') ? 'The attention to detail is nice' : 'It looks functional but basic'}. ${pain_points?.[1] ? `However, ${pain_points[1]} is something that usually frustrates me.` : 'Overall, it seems user-friendly.'}`,
        
        `From my perspective as a regular user, this design ${userNeeds.includes('clean designs') ? 'looks clean and modern' : 'seems a bit cluttered'}. ${age} and working in ${agentLocation}, I've used similar apps before. ${pain_points?.[2] ? `I'm concerned about ${pain_points[2]} - that's usually where I get stuck.` : 'The interface seems intuitive enough.'} ${userObjectives.includes('use mobile apps') ? 'I would probably use this on my phone.' : 'I prefer desktop versions.'}`,
        
        `As someone who ${userNeeds.includes('ease of navigation') ? 'values simple navigation' : 'doesn\'t mind complex interfaces'}, this design ${userNeeds.includes('simple interfaces') ? 'looks promising' : 'might be too basic for my needs'}. ${pain_points?.[0] ? `I'm worried about ${pain_points[0]} - that usually causes me problems.` : 'The layout seems clear.'} ${userObjectives.includes('find simple designs') ? 'I appreciate the straightforward approach.' : 'I might need more features.'}`
    ];
    
    const randomResponse = userResponses[Math.floor(Math.random() * userResponses.length)];
    
    return `${agentName}: ${randomResponse}`;
}

module.exports = router;
