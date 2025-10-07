/**
 * Multi-Agent Feedback API v2
 * Independent, non-generic critique from multiple persona perspectives
 */

const express = require('express');
const router = express.Router();
const { pool } = require('../models/database');
const { v4: uuidv4 } = require('uuid');
const providerGateway = require('../services/providerGateway');
const promptBuilder = require('../services/promptBuilder');

/**
 * POST /feedback/run
 * Run multi-agent feedback on an artifact
 */
router.post('/run', async (req, res) => {
    try {
        const { artifact, task, agent_ids } = req.body;
        
        if (!artifact || !task) {
            return res.status(400).json({ error: 'Artifact and task are required' });
        }
        
        // Get agents for feedback
        let agents;
        if (agent_ids && agent_ids.length > 0) {
            const agentQuery = `
                SELECT * FROM agents 
                WHERE id = ANY($1) AND status = 'active'
            `;
            const agentResult = await pool.query(agentQuery, [agent_ids]);
            agents = agentResult.rows;
        } else {
            // Get all active agents
            const agentQuery = 'SELECT * FROM agents WHERE status = $1 LIMIT 5';
            const agentResult = await pool.query(agentQuery, ['active']);
            agents = agentResult.rows;
        }
        
        if (agents.length === 0) {
            return res.status(404).json({ error: 'No active agents found for feedback' });
        }
        
        console.log(`Running feedback with ${agents.length} agents`);
        
        // Run feedback in parallel for each agent
        const feedbackPromises = agents.map(agent => runAgentFeedback(agent, artifact, task));
        const feedbackResults = await Promise.allSettled(feedbackPromises);
        
        // Process results
        const results = [];
        const errors = [];
        
        feedbackResults.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                results.push({
                    agent_id: agents[index].id,
                    agent_name: agents[index].name,
                    feedback: result.value
                });
            } else {
                errors.push({
                    agent_id: agents[index].id,
                    agent_name: agents[index].name,
                    error: result.reason.message
                });
            }
        });
        
        // Cluster similar feedback
        const clusteredFeedback = clusterFeedback(results);
        
        // Save feedback session
        const sessionId = await saveFeedbackSession(artifact, task, results, errors);
        
        res.json({
            session_id: sessionId,
            total_agents: agents.length,
            successful_feedback: results.length,
            errors: errors.length,
            feedback: clusteredFeedback,
            raw_results: results,
            errors: errors
        });
        
    } catch (error) {
        console.error('Error running feedback:', error);
        res.status(500).json({ error: 'Failed to run feedback: ' + error.message });
    }
});

/**
 * GET /feedback/sessions
 * Get feedback session history
 */
router.get('/sessions', async (req, res) => {
    try {
        const { limit = 20, offset = 0 } = req.query;
        
        const query = `
            SELECT fs.*, COUNT(fi.id) as feedback_count
            FROM feedback_sessions fs
            LEFT JOIN feedback_items fi ON fs.id = fi.session_id
            GROUP BY fs.id
            ORDER BY fs.created_at DESC
            LIMIT $1 OFFSET $2
        `;
        
        const result = await pool.query(query, [limit, offset]);
        res.json(result.rows);
        
    } catch (error) {
        console.error('Error fetching feedback sessions:', error);
        res.status(500).json({ error: 'Failed to fetch feedback sessions' });
    }
});

/**
 * GET /feedback/sessions/:session_id
 * Get detailed feedback for a specific session
 */
router.get('/sessions/:session_id', async (req, res) => {
    try {
        const { session_id } = req.params;
        
        // Get session info
        const sessionQuery = 'SELECT * FROM feedback_sessions WHERE id = $1';
        const sessionResult = await pool.query(sessionQuery, [session_id]);
        
        if (sessionResult.rows.length === 0) {
            return res.status(404).json({ error: 'Feedback session not found' });
        }
        
        // Get feedback items
        const feedbackQuery = `
            SELECT fi.*, a.name as agent_name, a.role_title
            FROM feedback_items fi
            JOIN agents a ON fi.agent_id = a.id
            WHERE fi.session_id = $1
            ORDER BY fi.severity DESC, fi.created_at ASC
        `;
        
        const feedbackResult = await pool.query(feedbackQuery, [session_id]);
        
        res.json({
            session: sessionResult.rows[0],
            feedback: feedbackResult.rows
        });
        
    } catch (error) {
        console.error('Error fetching feedback details:', error);
        res.status(500).json({ error: 'Failed to fetch feedback details' });
    }
});

/**
 * Run feedback for a single agent
 */
async function runAgentFeedback(agent, artifact, task) {
    try {
        const prompt = promptBuilder.buildFeedbackPrompt(artifact, task, agent);
        
        const messages = [
            { role: 'system', content: 'You are a design critique expert. Provide honest, specific feedback in JSON format.' },
            { role: 'user', content: prompt }
        ];
        
        const response = await providerGateway.chat(messages, {
            temperature: 0.7,
            max_tokens: 1000
        });
        
        // Parse JSON response
        const feedback = JSON.parse(response);
        
        // Validate feedback structure
        if (!feedback.problems || !Array.isArray(feedback.problems)) {
            throw new Error('Invalid feedback format');
        }
        
        return feedback;
        
    } catch (error) {
        console.error(`Error getting feedback from agent ${agent.name}:`, error);
        throw error;
    }
}

/**
 * Cluster similar feedback to identify common issues
 */
function clusterFeedback(results) {
    const allProblems = [];
    
    // Collect all problems from all agents
    results.forEach(result => {
        if (result.feedback.problems) {
            result.feedback.problems.forEach(problem => {
                allProblems.push({
                    ...problem,
                    agent_id: result.agent_id,
                    agent_name: result.agent_name
                });
            });
        }
    });
    
    // Simple clustering by issue similarity
    const clusters = [];
    const processed = new Set();
    
    allProblems.forEach((problem, index) => {
        if (processed.has(index)) return;
        
        const cluster = [problem];
        processed.add(index);
        
        // Find similar problems
        allProblems.forEach((otherProblem, otherIndex) => {
            if (processed.has(otherIndex)) return;
            
            if (isSimilarProblem(problem, otherProblem)) {
                cluster.push(otherProblem);
                processed.add(otherIndex);
            }
        });
        
        clusters.push({
            issue: problem.issue,
            evidence: cluster.map(p => p.evidence).join('; '),
            severity: getMaxSeverity(cluster),
            agents_concerned: cluster.map(p => p.agent_name),
            suggested_fixes: cluster.map(p => p.fix).filter(f => f),
            count: cluster.length
        });
    });
    
    return {
        total_problems: allProblems.length,
        unique_issues: clusters.length,
        clusters: clusters.sort((a, b) => getSeverityWeight(b.severity) - getSeverityWeight(a.severity))
    };
}

/**
 * Check if two problems are similar
 */
function isSimilarProblem(problem1, problem2) {
    const similarity = calculateSimilarity(problem1.issue, problem2.issue);
    return similarity > 0.7; // 70% similarity threshold
}

/**
 * Calculate string similarity (simple Jaccard similarity)
 */
function calculateSimilarity(str1, str2) {
    const words1 = new Set(str1.toLowerCase().split(/\s+/));
    const words2 = new Set(str2.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
}

/**
 * Get maximum severity from a cluster
 */
function getMaxSeverity(problems) {
    const severityOrder = { 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };
    return problems.reduce((max, problem) => 
        severityOrder[problem.severity] > severityOrder[max] ? problem.severity : max, 'low'
    );
}

/**
 * Get severity weight for sorting
 */
function getSeverityWeight(severity) {
    const weights = { 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };
    return weights[severity] || 0;
}

/**
 * Save feedback session to database
 */
async function saveFeedbackSession(artifact, task, results, errors) {
    try {
        const sessionId = uuidv4();
        
        // Create feedback session
        const sessionQuery = `
            INSERT INTO feedback_sessions (id, artifact, task, total_agents, successful_feedback, errors, created_at)
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
            RETURNING id
        `;
        
        await pool.query(sessionQuery, [
            sessionId,
            artifact,
            task,
            results.length + errors.length,
            results.length,
            errors.length
        ]);
        
        // Save individual feedback items
        for (const result of results) {
            if (result.feedback.problems) {
                for (const problem of result.feedback.problems) {
                    const itemId = uuidv4();
                    const itemQuery = `
                        INSERT INTO feedback_items (id, session_id, agent_id, issue, evidence, severity, suggested_fix, created_at)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
                    `;
                    
                    await pool.query(itemQuery, [
                        itemId,
                        sessionId,
                        result.agent_id,
                        problem.issue,
                        problem.evidence,
                        problem.severity,
                        problem.fix
                    ]);
                }
            }
        }
        
        return sessionId;
        
    } catch (error) {
        console.error('Error saving feedback session:', error);
        throw error;
    }
}

module.exports = router;
