/**
 * AI Chat API - Handle conversations with generated agents
 * Uses LangGraph for stateful chats and context management
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../models/database');
const { OpenAI } = require('openai');

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

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
    const { persona, prompt } = agent;
    
    let context = `${prompt}\n\n`;
    
    // Add conversation history
    if (history.length > 0) {
        context += "Previous conversation:\n";
        history.forEach(entry => {
            context += `User: ${entry.user_message}\n`;
            context += `${persona.name}: ${entry.agent_response}\n\n`;
        });
    }
    
    context += `Current user message: ${currentMessage}\n\n`;
    context += `Respond as ${persona.name} would, staying in character:`;
    
    return context;
}

/**
 * Generate agent response using OpenAI
 */
async function generateAgentResponse(context, userMessage) {
    try {
        const response = await openai.chat.completions.create({
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
    const { persona } = agent;
    const { name, occupation, pain_points, personality_traits } = persona;
    
    // Simulate different responses based on agent personality
    const responses = [
        `Looking at this image, I can see some interesting design elements. As someone who works in ${occupation}, I notice ${pain_points?.[0] || 'some potential usability issues'} that could affect user experience.`,
        `This reminds me of the challenges we face in ${occupation}. The interface looks ${personality_traits?.includes('detail-oriented') ? 'well thought out' : 'functional'}, but I'm concerned about ${pain_points?.[1] || 'the overall user flow'}.`,
        `From my perspective in ${occupation}, this design has potential but needs work on ${pain_points?.[2] || 'accessibility and security'}. I've seen similar issues in my work that caused problems for users.`
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return `${name}: ${randomResponse}`;
}

module.exports = router;
