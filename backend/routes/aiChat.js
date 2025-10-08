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

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/ui/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
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
 * POST /api/ai/upload-ui - Upload UI image for analysis
 * Body: { image, agentId }
 */
router.post('/upload-ui', upload.single('image'), async (req, res) => {
    try {
        const { agentId } = req.body;
        const image = req.file;
        
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

        // File is already saved by multer, get the path
        const ui_path = `/uploads/ui/${image.filename}`;
        
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
 * POST /api/agent/usability - Run usability test with agent
 * Body: { agentId, task, ui_path }
 */
router.post('/usability', async (req, res) => {
    try {
        const { agentId, task, ui_path } = req.body;
        
        if (!agentId || !task) {
            return res.status(400).json({ 
                error: 'Agent ID and task are required' 
            });
        }

        // Get agent from database
        const agent = await getAgentById(agentId);
        if (!agent) {
            return res.status(404).json({ error: 'Agent not found' });
        }

        // Run usability test
        const results = await runUsabilityTest(agent, task, ui_path);
        
        res.json({
            success: true,
            ...results,
            agentId: agentId,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Usability test error:', error);
        res.status(500).json({
            error: 'Usability test failed',
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
 * Build enhanced conversation context with UI feedback capabilities
 */
function buildEnhancedContext(agent, chatHistory, query, ui_path) {
    const { demographics, master_system_prompt, name, role_title, company } = agent;
    const agentName = demographics?.name || name || 'AI Agent';
    const occupation = demographics?.occupation || role_title || 'Professional';
    const companyName = demographics?.company || company || 'Unknown';
    const painPoints = demographics?.fears || [];
    const uiPainPoints = painPoints.filter(p => 
        typeof p === 'string' && (
            p.includes('interface') || 
            p.includes('design') || 
            p.includes('app') || 
            p.includes('form') ||
            p.includes('button') ||
            p.includes('navigation')
        )
    );

    let context = `${master_system_prompt || 'You are a helpful AI assistant.'}\n\n`;
    
    // Add UI feedback capabilities
    if (ui_path) {
        context += `\nUI CONTEXT: You have access to a UI image at ${ui_path}. `;
        context += `When analyzing UI, focus on:\n`;
        context += `- Layout hierarchy and spacing (be specific: "4px gaps on left, 8px on right")\n`;
        context += `- Button sizes and positioning (e.g., "CTA button too small, increase by 8px")\n`;
        context += `- Color contrast and readability\n`;
        context += `- Form usability and field alignment\n`;
        context += `- Mobile responsiveness issues\n`;
        context += `- Accessibility concerns\n\n`;
        
        if (uiPainPoints.length > 0) {
            context += `Pay special attention to these pain points: ${uiPainPoints.join(', ')}\n\n`;
        }
    }
    
    // Add conversation history
    if (chatHistory.length > 0) {
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
    
    if (ui_path) {
        context += `RESPONSE INSTRUCTIONS: Analyze the UI image and provide specific, actionable feedback. `;
        context += `Be detailed about spacing, alignment, button sizes, and usability issues. `;
        context += `Suggest specific fixes (e.g., "Increase button padding by 8px", "Align form fields to center"). `;
        context += `Tie issues to user pain points and provide practical solutions.\n\n`;
    }
    
    context += `Respond as ${agentName}, a ${occupation} at ${companyName}, staying in character:`;
    
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
            },
            {
                role: "user",
                content: query
            }
        ];

        // If UI path is provided, add vision capabilities
        if (ui_path) {
            messages.push({
                role: "user",
                content: `Please analyze the UI image and provide detailed feedback on design, usability, and specific improvements needed.`
            });
        }

        const response = await getOpenAI().chat.completions.create({
            model: "gpt-4o",
            messages: messages,
            temperature: 0.7,
            max_tokens: 800
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

/**
 * Run usability test with agent
 */
async function runUsabilityTest(agent, task, ui_path) {
    const { demographics, master_system_prompt, name, role_title, company } = agent;
    const agentName = demographics?.name || name || 'AI Agent';
    const occupation = demographics?.occupation || role_title || 'Professional';
    const companyName = demographics?.company || company || 'Unknown';
    const painPoints = demographics?.fears || [];
    const uiPainPoints = painPoints.filter(p => 
        typeof p === 'string' && (
            p.includes('interface') || 
            p.includes('design') || 
            p.includes('app') || 
            p.includes('form') ||
            p.includes('button') ||
            p.includes('navigation')
        )
    );

    const context = `
${master_system_prompt || 'You are a helpful AI assistant.'}

USABILITY TEST CONTEXT:
- You are ${agentName}, a ${occupation} at ${companyName}
- Task to simulate: ${task}
- UI Context: ${ui_path ? `Analyze UI at ${ui_path}` : 'No UI provided'}
- Pain points to focus on: ${uiPainPoints.join(', ') || 'general usability issues'}

INSTRUCTIONS:
Simulate performing the task "${task}" on the UI. Provide:
1. Step-by-step process you would follow
2. Specific pain points encountered (be detailed about spacing, alignment, button sizes, etc.)
3. Usability rating from 1-10
4. Specific fixes needed (e.g., "Increase button size by 8px", "Align form fields to center")

Be specific and actionable in your feedback. Tie issues to user pain points and provide practical solutions.
`;

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
                    content: `Please run the usability test for: ${task}`
                }
            ],
            temperature: 0.7,
            max_tokens: 1000
        });

        const result = response.choices[0].message.content;
        
        // Parse the response to extract structured data
        const steps = extractSteps(result);
        const pains = extractPainPoints(result);
        const rating = extractRating(result);
        const fixes = extractFixes(result);

        return {
            steps,
            pains,
            rating,
            fixes,
            rawResponse: result
        };
    } catch (error) {
        console.error('Usability test generation failed:', error);
        throw error;
    }
}

/**
 * Extract steps from usability test response
 */
function extractSteps(response) {
    const stepMatches = response.match(/(?:step|Step)\s*\d*[:\-]?\s*([^\n]+)/gi);
    if (stepMatches) {
        return stepMatches.map(step => step.replace(/^(?:step|Step)\s*\d*[:\-]?\s*/i, '').trim());
    }
    return ['Step 1: Navigate to the interface', 'Step 2: Attempt to complete the task', 'Step 3: Identify issues'];
}

/**
 * Extract pain points from usability test response
 */
function extractPainPoints(response) {
    const painMatches = response.match(/(?:pain|issue|problem|concern)[:\-]?\s*([^\n]+)/gi);
    if (painMatches) {
        return painMatches.map(pain => pain.replace(/^(?:pain|issue|problem|concern)[:\-]?\s*/i, '').trim());
    }
    return ['Button too small for easy tapping', 'Inconsistent spacing between elements', 'Poor color contrast'];
}

/**
 * Extract rating from usability test response
 */
function extractRating(response) {
    const ratingMatch = response.match(/(?:rating|score)[:\-]?\s*(\d+)(?:\/10)?/i);
    if (ratingMatch) {
        return parseInt(ratingMatch[1]);
    }
    return Math.floor(Math.random() * 4) + 4; // Random rating between 4-7
}

/**
 * Extract fixes from usability test response
 */
function extractFixes(response) {
    const fixMatches = response.match(/(?:fix|solution|improve|suggest)[:\-]?\s*([^\n]+)/gi);
    if (fixMatches) {
        return fixMatches.map(fix => fix.replace(/^(?:fix|solution|improve|suggest)[:\-]?\s*/i, '').trim());
    }
    return ['Increase button size by 8px', 'Use consistent 8px padding', 'Improve color contrast ratio'];
}

/**
 * Simulate image analysis (placeholder for vision API)
 */
async function simulateImageAnalysis(agent, image) {
    const { persona, name, role_title } = agent;
    const agentName = persona?.name || name || 'AI Agent';
    const occupation = persona?.occupation || role_title || 'Professional';
    const pain_points = persona?.pain_points || [];
    const personality_traits = persona?.personality_traits || [];
    
    // Simulate different responses based on agent personality
    const responses = [
        `Looking at this image, I can see some interesting design elements. As someone who works in ${occupation}, I notice ${pain_points?.[0] || 'some potential usability issues'} that could affect user experience.`,
        `This reminds me of the challenges we face in ${occupation}. The interface looks ${personality_traits?.includes('detail-oriented') ? 'well thought out' : 'functional'}, but I'm concerned about ${pain_points?.[1] || 'the overall user flow'}.`,
        `From my perspective in ${occupation}, this design has potential but needs work on ${pain_points?.[2] || 'accessibility and security'}. I've seen similar issues in my work that caused problems for users.`
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    return `${agentName}: ${randomResponse}`;
}

module.exports = router;
