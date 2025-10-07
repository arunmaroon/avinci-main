/**
 * Chat Orchestrator - SSE streaming chat with human-like behavior
 * Implements the blueprint's chat orchestration and SSE streaming
 */

const { pool, redis } = require('../models/database');
const behaviorEngine = require('./behaviorEngine');
const { v4: uuidv4 } = require('uuid');

class ChatOrchestrator {
    /**
     * Start a new chat session
     */
    static async startSession(agentIds, adminId, sessionName = 'New Session') {
        try {
            const sessionId = uuidv4();
            
            // Create session in database
            const result = await pool.query(
                `INSERT INTO sessions (id, session_name, agent_ids, admin_id, status, created_at, last_activity)
                 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, created_at`,
                [sessionId, sessionName, agentIds, adminId, 'active', new Date(), new Date()]
            );

            // Initialize session data in Redis
            const sessionData = {
                id: sessionId,
                agentIds,
                adminId,
                sessionName,
                status: 'active',
                lastActivity: new Date().toISOString(),
                conversationSummary: '',
                messageCount: 0
            };

            await redis.setex(`session:${sessionId}`, 3600, JSON.stringify(sessionData));
            await redis.setex(`conversation:${sessionId}`, 3600, JSON.stringify([]));

            console.log(`Session started: ${sessionId} with agents: ${agentIds.join(', ')}`);
            return { sessionId, createdAt: result.rows[0].created_at };
        } catch (error) {
            console.error('Session creation failed:', error);
            throw new Error('Failed to create chat session: ' + error.message);
        }
    }

    /**
     * Handle user message with SSE streaming
     */
    static async handleUserMessage(sessionId, userId, userMessageContent, res) {
        try {
            // Set SSE headers
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Cache-Control'
            });

            const sendEvent = (event, data) => {
                res.write(`event: ${event}\n`);
                res.write(`data: ${JSON.stringify(data)}\n\n`);
            };

            // Immediate acknowledgment
            sendEvent('ack', { message: 'Message received', timestamp: new Date().toISOString() });

            // Get session data
            const sessionData = await redis.get(`session:${sessionId}`);
            if (!sessionData) {
                sendEvent('error', { message: 'Session not found' });
                res.end();
                return;
            }

            const session = JSON.parse(sessionData);
            const conversationHistory = await this.getConversationHistory(sessionId);

            // Store user message
            const userMessage = {
                id: uuidv4(),
                session_id: sessionId,
                role: 'user',
                content: userMessageContent,
                created_at: new Date().toISOString()
            };

            await this.saveMessage(userMessage);
            conversationHistory.push(userMessage);

            // Process with each agent
            const agentPromises = session.agentIds.map(async (agentId) => {
                try {
                    // Get agent data
                    const agent = await this.getAgent(agentId);
                    if (!agent) {
                        sendEvent('error', { agentId, message: `Agent ${agentId} not found` });
                        return;
                    }

                    // Send typing start event
                    sendEvent('typing_start', { agentId, message: 'Agent is thinking...' });

                    // Generate response using behavior engine
                    const response = await behaviorEngine.generateHumanLikeResponse(
                        agent,
                        userMessageContent,
                        conversationHistory
                    );

                    // Simulate typing delay
                    await this.simulateTypingDelay(response.delay_ms, sendEvent, agentId);

                    // Send typing end event
                    sendEvent('typing_end', { agentId });

                    // Create agent message
                    const agentMessage = {
                        id: uuidv4(),
                        session_id: sessionId,
                        agent_id: agentId,
                        role: 'assistant',
                        content: response.text,
                        emotion: response.emotion,
                        delay_ms: response.delay_ms,
                        mood_state: response.mood_state,
                        created_at: new Date().toISOString()
                    };

                    // Save agent message
                    await this.saveMessage(agentMessage);
                    conversationHistory.push(agentMessage);

                    // Send final response
                    sendEvent('message', { 
                        agentId, 
                        message: agentMessage,
                        mood: response.mood_state
                    });

                } catch (error) {
                    console.error(`Agent ${agentId} processing error:`, error);
                    sendEvent('error', { 
                        agentId, 
                        message: `Agent processing failed: ${error.message}` 
                    });
                }
            });

            // Wait for all agents to respond
            await Promise.all(agentPromises);

            // Update conversation history and session
            await this.updateConversationHistory(sessionId, conversationHistory);
            await this.updateSessionActivity(sessionId);

            // Send completion event
            sendEvent('complete', { 
                message: 'All agents have responded',
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Chat orchestration error:', error);
            sendEvent('error', { message: 'Failed to process message: ' + error.message });
        } finally {
            res.end();
        }
    }

    /**
     * Get conversation history from Redis
     */
    static async getConversationHistory(sessionId) {
        try {
            const historyData = await redis.get(`conversation:${sessionId}`);
            return historyData ? JSON.parse(historyData) : [];
        } catch (error) {
            console.error('Failed to get conversation history:', error);
            return [];
        }
    }

    /**
     * Update conversation history in Redis
     */
    static async updateConversationHistory(sessionId, conversationHistory) {
        try {
            // Keep only last 50 messages to prevent memory issues
            const recentHistory = conversationHistory.slice(-50);
            await redis.setex(`conversation:${sessionId}`, 3600, JSON.stringify(recentHistory));
        } catch (error) {
            console.error('Failed to update conversation history:', error);
        }
    }

    /**
     * Update session activity timestamp
     */
    static async updateSessionActivity(sessionId) {
        try {
            const sessionData = await redis.get(`session:${sessionId}`);
            if (sessionData) {
                const session = JSON.parse(sessionData);
                session.lastActivity = new Date().toISOString();
                session.messageCount = (session.messageCount || 0) + 1;
                await redis.setex(`session:${sessionId}`, 3600, JSON.stringify(session));
            }
        } catch (error) {
            console.error('Failed to update session activity:', error);
        }
    }

    /**
     * Get agent data from database
     */
    static async getAgent(agentId) {
        try {
            const result = await pool.query(
                `SELECT * FROM agents WHERE id = $1 AND status = 'active'`,
                [agentId]
            );
            return result.rows[0] || null;
        } catch (error) {
            console.error('Failed to get agent:', error);
            return null;
        }
    }

    /**
     * Save message to database
     */
    static async saveMessage(message) {
        try {
            const query = `
                INSERT INTO messages (id, session_id, agent_id, role, content, emotion, delay_ms, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `;
            
            await pool.query(query, [
                message.id,
                message.session_id,
                message.agent_id,
                message.role,
                message.content,
                JSON.stringify(message.emotion || {}),
                message.delay_ms,
                message.created_at
            ]);
        } catch (error) {
            console.error('Failed to save message:', error);
        }
    }

    /**
     * Simulate typing delay with progress updates
     */
    static async simulateTypingDelay(totalDelayMs, sendEvent, agentId) {
        const steps = 5;
        const stepDelay = totalDelayMs / steps;
        
        for (let i = 1; i <= steps; i++) {
            await new Promise(resolve => setTimeout(resolve, stepDelay));
            sendEvent('typing_progress', { 
                agentId, 
                progress: i / steps,
                message: `Typing... ${Math.round((i / steps) * 100)}%`
            });
        }
    }

    /**
     * Get session by ID
     */
    static async getSession(sessionId) {
        try {
            const result = await pool.query(
                `SELECT * FROM sessions WHERE id = $1`,
                [sessionId]
            );
            return result.rows[0] || null;
        } catch (error) {
            console.error('Failed to get session:', error);
            return null;
        }
    }

    /**
     * Get session messages
     */
    static async getSessionMessages(sessionId, limit = 50) {
        try {
            const result = await pool.query(
                `SELECT * FROM messages 
                 WHERE session_id = $1 
                 ORDER BY created_at ASC 
                 LIMIT $2`,
                [sessionId, limit]
            );
            return result.rows;
        } catch (error) {
            console.error('Failed to get session messages:', error);
            return [];
        }
    }

    /**
     * End session
     */
    static async endSession(sessionId) {
        try {
            // Update session status in database
            await pool.query(
                `UPDATE sessions SET status = 'completed', last_activity = $1 WHERE id = $2`,
                [new Date(), sessionId]
            );

            // Update session in Redis
            const sessionData = await redis.get(`session:${sessionId}`);
            if (sessionData) {
                const session = JSON.parse(sessionData);
                session.status = 'completed';
                session.lastActivity = new Date().toISOString();
                await redis.setex(`session:${sessionId}`, 3600, JSON.stringify(session));
            }

            console.log(`Session ended: ${sessionId}`);
        } catch (error) {
            console.error('Failed to end session:', error);
        }
    }

    /**
     * Generate conversation summary
     */
    static async generateConversationSummary(sessionId) {
        try {
            const messages = await this.getSessionMessages(sessionId);
            if (messages.length === 0) return '';

            // Simple summary generation (in production, use AI)
            const userMessages = messages.filter(m => m.role === 'user');
            const agentMessages = messages.filter(m => m.role === 'assistant');
            
            return `Conversation with ${agentMessages.length} agent responses to ${userMessages.length} user messages.`;
        } catch (error) {
            console.error('Failed to generate conversation summary:', error);
            return '';
        }
    }
}

module.exports = ChatOrchestrator;