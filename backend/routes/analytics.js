/**
 * Analytics API - Cluster chat themes and analyze sentiments
 * Uses pandas-like analysis for conversation insights
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../models/database');

/**
 * GET /api/analytics/themes - Get clustered chat themes
 * Query: ?agentId=xxx&sessionId=xxx&limit=50
 */
router.get('/themes', async (req, res) => {
    try {
        const { agentId, sessionId, limit = 50 } = req.query;
        
        // Get conversations for analysis
        const conversations = await getConversationsForAnalysis(agentId, sessionId, limit);
        
        // Analyze themes and sentiments
        const analysis = await analyzeConversations(conversations);
        
        res.json({
            success: true,
            analysis: analysis,
            totalConversations: conversations.length,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({
            error: 'Analytics generation failed',
            details: error.message
        });
    }
});

/**
 * GET /api/analytics/sentiment - Get sentiment analysis
 * Query: ?agentId=xxx&timeRange=7d
 */
router.get('/sentiment', async (req, res) => {
    try {
        const { agentId, timeRange = '7d' } = req.query;
        
        // Get conversations within time range
        const conversations = await getConversationsByTimeRange(agentId, timeRange);
        
        // Analyze sentiment
        const sentimentAnalysis = await analyzeSentiment(conversations);
        
        res.json({
            success: true,
            sentiment: sentimentAnalysis,
            timeRange: timeRange,
            totalConversations: conversations.length
        });
        
    } catch (error) {
        console.error('Sentiment analysis error:', error);
        res.status(500).json({
            error: 'Sentiment analysis failed',
            details: error.message
        });
    }
});

/**
 * GET /api/analytics/insights - Get comprehensive insights
 * Query: ?agentId=xxx&sessionId=xxx
 */
router.get('/insights', async (req, res) => {
    try {
        const { agentId, sessionId } = req.query;
        
        // Get all analytics data
        const [themes, sentiment, engagement] = await Promise.all([
            getThemesAnalysis(agentId, sessionId),
            getSentimentAnalysis(agentId),
            getEngagementMetrics(agentId, sessionId)
        ]);
        
        res.json({
            success: true,
            insights: {
                themes: themes,
                sentiment: sentiment,
                engagement: engagement
            },
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Insights generation error:', error);
        res.status(500).json({
            error: 'Insights generation failed',
            details: error.message
        });
    }
});

/**
 * Get conversations for analysis
 */
async function getConversationsForAnalysis(agentId, sessionId, limit) {
    try {
        let query = 'SELECT * FROM conversations WHERE 1=1';
        const params = [];
        let paramCount = 0;
        
        if (agentId) {
            query += ` AND agent_id = $${++paramCount}`;
            params.push(agentId);
        }
        
        if (sessionId) {
            query += ` AND session_id = $${++paramCount}`;
            params.push(sessionId);
        }
        
        query += ` ORDER BY created_at DESC LIMIT $${++paramCount}`;
        params.push(parseInt(limit));
        
        const result = await pool.query(query, params);
        return result.rows;
    } catch (error) {
        console.error('Error fetching conversations:', error);
        return [];
    }
}

/**
 * Get conversations by time range
 */
async function getConversationsByTimeRange(agentId, timeRange) {
    try {
        let timeCondition = '';
        const params = [agentId];
        
        switch (timeRange) {
            case '1d':
                timeCondition = 'AND created_at >= NOW() - INTERVAL \'1 day\'';
                break;
            case '7d':
                timeCondition = 'AND created_at >= NOW() - INTERVAL \'7 days\'';
                break;
            case '30d':
                timeCondition = 'AND created_at >= NOW() - INTERVAL \'30 days\'';
                break;
            default:
                timeCondition = 'AND created_at >= NOW() - INTERVAL \'7 days\'';
        }
        
        const query = `
            SELECT * FROM conversations 
            WHERE agent_id = $1 ${timeCondition}
            ORDER BY created_at DESC
        `;
        
        const result = await pool.query(query, params);
        return result.rows;
    } catch (error) {
        console.error('Error fetching conversations by time range:', error);
        return [];
    }
}

/**
 * Analyze conversations for themes
 */
async function analyzeConversations(conversations) {
    const themes = {
        fintech: { count: 0, keywords: ['banking', 'payment', 'finance', 'money', 'transaction', 'account', 'card', 'loan', 'credit'] },
        technology: { count: 0, keywords: ['app', 'software', 'technology', 'digital', 'online', 'mobile', 'website', 'platform', 'system'] },
        security: { count: 0, keywords: ['security', 'safe', 'secure', 'password', 'authentication', 'privacy', 'data', 'protection'] },
        ux: { count: 0, keywords: ['interface', 'design', 'user', 'experience', 'usability', 'navigation', 'layout', 'ui'] },
        pain_points: { count: 0, keywords: ['problem', 'issue', 'difficult', 'frustrated', 'confused', 'stuck', 'error', 'bug', 'broken'] },
        goals: { count: 0, keywords: ['want', 'need', 'goal', 'achieve', 'success', 'improve', 'better', 'enhance'] }
    };
    
    const sentimentScores = [];
    const commonPhrases = {};
    
    conversations.forEach(conv => {
        const text = (conv.user_message + ' ' + conv.agent_response).toLowerCase();
        
        // Count themes
        Object.keys(themes).forEach(theme => {
            if (themes[theme].keywords.some(keyword => text.includes(keyword))) {
                themes[theme].count++;
            }
        });
        
        // Simple sentiment analysis
        const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'like', 'happy', 'satisfied'];
        const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'angry', 'frustrated', 'disappointed'];
        
        const positiveCount = positiveWords.filter(word => text.includes(word)).length;
        const negativeCount = negativeWords.filter(word => text.includes(word)).length;
        
        const sentiment = positiveCount > negativeCount ? 1 : negativeCount > positiveCount ? -1 : 0;
        sentimentScores.push(sentiment);
        
        // Extract common phrases (simple approach)
        const phrases = text.split(/[.!?]+/).filter(phrase => phrase.trim().length > 10);
        phrases.forEach(phrase => {
            const cleanPhrase = phrase.trim().toLowerCase();
            commonPhrases[cleanPhrase] = (commonPhrases[cleanPhrase] || 0) + 1;
        });
    });
    
    // Calculate sentiment distribution
    const sentimentDistribution = {
        positive: sentimentScores.filter(s => s > 0).length,
        negative: sentimentScores.filter(s => s < 0).length,
        neutral: sentimentScores.filter(s => s === 0).length
    };
    
    // Get top common phrases
    const topPhrases = Object.entries(commonPhrases)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([phrase, count]) => ({ phrase, count }));
    
    return {
        themes: Object.entries(themes).map(([name, data]) => ({
            name: name.replace('_', ' ').toUpperCase(),
            count: data.count,
            percentage: conversations.length > 0 ? Math.round((data.count / conversations.length) * 100) : 0
        })).filter(theme => theme.count > 0),
        sentiment: {
            distribution: sentimentDistribution,
            average: sentimentScores.length > 0 ? 
                (sentimentScores.reduce((a, b) => a + b, 0) / sentimentScores.length).toFixed(2) : 0
        },
        commonPhrases: topPhrases,
        totalConversations: conversations.length
    };
}

/**
 * Analyze sentiment
 */
async function analyzeSentiment(conversations) {
    const sentimentData = {
        positive: 0,
        negative: 0,
        neutral: 0,
        scores: []
    };
    
    conversations.forEach(conv => {
        const text = (conv.user_message + ' ' + conv.agent_response).toLowerCase();
        
        const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'like', 'happy', 'satisfied', 'perfect', 'wonderful'];
        const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'angry', 'frustrated', 'disappointed', 'horrible', 'worst'];
        
        const positiveCount = positiveWords.filter(word => text.includes(word)).length;
        const negativeCount = negativeWords.filter(word => text.includes(word)).length;
        
        if (positiveCount > negativeCount) {
            sentimentData.positive++;
            sentimentData.scores.push(1);
        } else if (negativeCount > positiveCount) {
            sentimentData.negative++;
            sentimentData.scores.push(-1);
        } else {
            sentimentData.neutral++;
            sentimentData.scores.push(0);
        }
    });
    
    const total = conversations.length;
    return {
        distribution: {
            positive: Math.round((sentimentData.positive / total) * 100),
            negative: Math.round((sentimentData.negative / total) * 100),
            neutral: Math.round((sentimentData.neutral / total) * 100)
        },
        averageScore: sentimentData.scores.length > 0 ? 
            (sentimentData.scores.reduce((a, b) => a + b, 0) / sentimentData.scores.length).toFixed(2) : 0,
        totalConversations: total
    };
}

/**
 * Get themes analysis
 */
async function getThemesAnalysis(agentId, sessionId) {
    const conversations = await getConversationsForAnalysis(agentId, sessionId, 100);
    return await analyzeConversations(conversations);
}

/**
 * Get sentiment analysis
 */
async function getSentimentAnalysis(agentId) {
    const conversations = await getConversationsByTimeRange(agentId, '7d');
    return await analyzeSentiment(conversations);
}

/**
 * Get engagement metrics
 */
async function getEngagementMetrics(agentId, sessionId) {
    try {
        const conversations = await getConversationsForAnalysis(agentId, sessionId, 1000);
        
        const metrics = {
            totalMessages: conversations.length,
            averageMessageLength: 0,
            responseTime: 0,
            activeDays: new Set(),
            peakHours: {}
        };
        
        if (conversations.length > 0) {
            // Calculate average message length
            const totalLength = conversations.reduce((sum, conv) => 
                sum + conv.user_message.length + conv.agent_response.length, 0);
            metrics.averageMessageLength = Math.round(totalLength / conversations.length);
            
            // Track active days and peak hours
            conversations.forEach(conv => {
                const date = new Date(conv.created_at);
                metrics.activeDays.add(date.toDateString());
                
                const hour = date.getHours();
                metrics.peakHours[hour] = (metrics.peakHours[hour] || 0) + 1;
            });
            
            metrics.activeDays = metrics.activeDays.size;
            
            // Find peak hour
            const peakHour = Object.entries(metrics.peakHours)
                .sort(([,a], [,b]) => b - a)[0];
            metrics.peakHour = peakHour ? `${peakHour[0]}:00` : 'Unknown';
        }
        
        return metrics;
    } catch (error) {
        console.error('Error calculating engagement metrics:', error);
        return {
            totalMessages: 0,
            averageMessageLength: 0,
            responseTime: 0,
            activeDays: 0,
            peakHour: 'Unknown'
        };
    }
}

module.exports = router;
