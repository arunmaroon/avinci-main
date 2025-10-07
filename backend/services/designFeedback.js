/**
 * Design Feedback Service - Multi-agent non-generic design critique
 * Implements the blueprint's multi-agent feedback system with structured JSON output
 */

const providerGateway = require('./providerGateway');
const { pool } = require('../models/database');
const { v4: uuidv4 } = require('uuid');

class DesignFeedbackService {
    /**
     * Run multi-agent feedback on a design artifact
     */
    static async runMultiAgentFeedback(designArtifact, agentIds, taskContext = {}) {
        try {
            console.log('Starting multi-agent design feedback:', {
                artifactId: designArtifact.id,
                agentCount: agentIds.length,
                taskContext
            });

            // Get agent data
            const agents = await this.getAgents(agentIds);
            if (agents.length === 0) {
                throw new Error('No valid agents found for feedback');
            }

            // Run feedback independently for each agent
            const feedbackPromises = agents.map(agent => 
                this.generateAgentFeedback(agent, designArtifact, taskContext)
            );

            const feedbackResults = await Promise.all(feedbackPromises);

            // Aggregate and analyze feedback
            const aggregatedFeedback = this.aggregateFeedback(feedbackResults, designArtifact);

            // Save feedback to database
            await this.saveFeedbackResults(designArtifact.id, feedbackResults, aggregatedFeedback);

            console.log('Multi-agent feedback completed:', {
                totalFeedback: feedbackResults.length,
                criticalIssues: aggregatedFeedback.criticalIssues.length,
                disagreements: aggregatedFeedback.disagreements.length
            });

            return aggregatedFeedback;

        } catch (error) {
            console.error('Multi-agent feedback error:', error);
            throw new Error('Failed to run multi-agent feedback: ' + error.message);
        }
    }

    /**
     * Generate feedback from a single agent
     */
    static async generateAgentFeedback(agent, designArtifact, taskContext) {
        try {
            const systemPrompt = this.buildFeedbackSystemPrompt(agent);
            const userPrompt = this.buildFeedbackUserPrompt(designArtifact, taskContext);

            const messages = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ];

            const response = await providerGateway.chat(messages, {
                temperature: 0.3, // Lower temperature for more consistent feedback
                max_tokens: 2000
            });

            // Parse structured JSON response
            const feedback = this.parseFeedbackResponse(response, agent.id);

            return {
                agentId: agent.id,
                agentName: agent.name,
                feedback: feedback,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error(`Agent ${agent.id} feedback error:`, error);
            return {
                agentId: agent.id,
                agentName: agent.name,
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Build system prompt for design feedback
     */
    static buildFeedbackSystemPrompt(agent) {
        const basePersona = agent.master_system_prompt || agent.prompt || '';
        
        return `${basePersona}

You are now reviewing a design artifact. Provide structured, concrete feedback based on your persona and expertise.

FEEDBACK REQUIREMENTS:
- Be specific and cite exact elements (copy, control labels, visual elements)
- Reference Nielsen's 10 Usability Heuristics where applicable
- Provide concrete evidence for each issue
- Suggest specific fixes, not generic advice
- Rate severity: low, medium, high, critical
- Focus on user experience from your perspective

OUTPUT FORMAT (JSON only):
{
  "summary": "Brief overall assessment",
  "positives": ["specific positive element 1", "specific positive element 2"],
  "problems": [
    {
      "issue": "Specific problem description",
      "evidence": "Exact copy or element reference",
      "severity": "low|medium|high|critical",
      "heuristic": "Nielsen heuristic name",
      "fix": "Specific suggested improvement"
    }
  ],
  "confidence": 0.0-1.0,
  "user_intent_understanding": "How well does this design match user needs?",
  "accessibility_concerns": ["specific accessibility issue 1", "specific accessibility issue 2"],
  "mobile_considerations": ["mobile-specific issue 1", "mobile-specific issue 2"]
}

Be concrete, non-generic, and cite exact elements.`;
    }

    /**
     * Build user prompt with design artifact details
     */
    static buildFeedbackUserPrompt(designArtifact, taskContext) {
        return `DESIGN ARTIFACT:
Name: ${designArtifact.name}
Description: ${designArtifact.description || 'No description provided'}

${designArtifact.figma_url ? `Figma URL: ${designArtifact.figma_url}` : ''}
${designArtifact.image_url ? `Image URL: ${designArtifact.image_url}` : ''}

TASK CONTEXT:
${JSON.stringify(taskContext, null, 2)}

NIELSEN'S 10 USABILITY HEURISTICS:
1. Visibility of System Status
2. Match Between System and Real World
3. User Control and Freedom
4. Consistency and Standards
5. Error Prevention
6. Recognition Rather Than Recall
7. Flexibility and Efficiency of Use
8. Aesthetic and Minimalist Design
9. Help Users Recognize, Diagnose, and Recover from Errors
10. Help and Documentation

Provide your feedback as JSON only.`;
    }

    /**
     * Parse feedback response from agent
     */
    static parseFeedbackResponse(response, agentId) {
        try {
            // Try to extract JSON from response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            
            // Fallback: create structured response from text
            return {
                summary: response.substring(0, 200) + '...',
                positives: [],
                problems: [{
                    issue: 'Unable to parse structured feedback',
                    evidence: 'Response format error',
                    severity: 'low',
                    heuristic: 'Help and Documentation',
                    fix: 'Improve response formatting'
                }],
                confidence: 0.3,
                user_intent_understanding: 'Unable to assess',
                accessibility_concerns: [],
                mobile_considerations: []
            };
        } catch (error) {
            console.error(`Failed to parse feedback from agent ${agentId}:`, error);
            return {
                summary: 'Feedback parsing failed',
                positives: [],
                problems: [{
                    issue: 'Response parsing error',
                    evidence: error.message,
                    severity: 'low',
                    heuristic: 'Help and Documentation',
                    fix: 'Improve response format'
                }],
                confidence: 0.1,
                user_intent_understanding: 'Unable to assess',
                accessibility_concerns: [],
                mobile_considerations: []
            };
        }
    }

    /**
     * Aggregate feedback from multiple agents
     */
    static aggregateFeedback(feedbackResults, designArtifact) {
        const validFeedback = feedbackResults.filter(r => !r.error);
        
        if (validFeedback.length === 0) {
            return {
                summary: 'No valid feedback received',
                criticalIssues: [],
                disagreements: [],
                consensus: [],
                agentFeedback: feedbackResults
            };
        }

        // Extract all problems
        const allProblems = validFeedback.flatMap(r => 
            r.feedback.problems?.map(p => ({
                ...p,
                agentId: r.agentId,
                agentName: r.agentName
            })) || []
        );

        // Group by issue similarity
        const groupedProblems = this.groupSimilarProblems(allProblems);

        // Identify critical issues
        const criticalIssues = groupedProblems
            .filter(group => group.problems.some(p => p.severity === 'critical'))
            .map(group => ({
                issue: group.consensusIssue,
                severity: 'critical',
                evidence: group.evidence,
                agents: group.problems.map(p => ({
                    agentId: p.agentId,
                    agentName: p.agentName,
                    fix: p.fix
                })),
                consensus: group.consensus
            }));

        // Identify disagreements
        const disagreements = groupedProblems
            .filter(group => group.disagreementLevel > 0.3)
            .map(group => ({
                issue: group.consensusIssue,
                disagreementLevel: group.disagreementLevel,
                conflictingViews: group.problems.map(p => ({
                    agentId: p.agentId,
                    agentName: p.agentName,
                    severity: p.severity,
                    fix: p.fix
                }))
            }));

        // Extract consensus points
        const consensus = groupedProblems
            .filter(group => group.consensus > 0.7)
            .map(group => ({
                issue: group.consensusIssue,
                consensus: group.consensus,
                evidence: group.evidence,
                suggestedFixes: [...new Set(group.problems.map(p => p.fix))]
            }));

        return {
            summary: this.generateSummary(validFeedback, criticalIssues, disagreements),
            criticalIssues,
            disagreements,
            consensus,
            agentFeedback: feedbackResults,
            statistics: {
                totalAgents: feedbackResults.length,
                validResponses: validFeedback.length,
                totalProblems: allProblems.length,
                criticalCount: criticalIssues.length,
                disagreementCount: disagreements.length
            }
        };
    }

    /**
     * Group similar problems by content similarity
     */
    static groupSimilarProblems(problems) {
        const groups = [];
        const processed = new Set();

        problems.forEach((problem, index) => {
            if (processed.has(index)) return;

            const group = {
                problems: [problem],
                consensusIssue: problem.issue,
                evidence: [problem.evidence],
                consensus: 1.0,
                disagreementLevel: 0.0
            };

            // Find similar problems
            problems.forEach((otherProblem, otherIndex) => {
                if (otherIndex <= index || processed.has(otherIndex)) return;

                const similarity = this.calculateSimilarity(problem.issue, otherProblem.issue);
                if (similarity > 0.6) {
                    group.problems.push(otherProblem);
                    group.evidence.push(otherProblem.evidence);
                    processed.add(otherIndex);
                }
            });

            // Calculate consensus and disagreement
            if (group.problems.length > 1) {
                group.consensus = this.calculateConsensus(group.problems);
                group.disagreementLevel = this.calculateDisagreement(group.problems);
            }

            groups.push(group);
            processed.add(index);
        });

        return groups;
    }

    /**
     * Calculate similarity between two text strings
     */
    static calculateSimilarity(text1, text2) {
        const words1 = text1.toLowerCase().split(/\s+/);
        const words2 = text2.toLowerCase().split(/\s+/);
        const intersection = words1.filter(word => words2.includes(word));
        const union = [...new Set([...words1, ...words2])];
        return intersection.length / union.length;
    }

    /**
     * Calculate consensus level within a group
     */
    static calculateConsensus(problems) {
        const severities = problems.map(p => p.severity);
        const severityCounts = severities.reduce((acc, s) => {
            acc[s] = (acc[s] || 0) + 1;
            return acc;
        }, {});

        const maxCount = Math.max(...Object.values(severityCounts));
        return maxCount / problems.length;
    }

    /**
     * Calculate disagreement level within a group
     */
    static calculateDisagreement(problems) {
        const severities = problems.map(p => p.severity);
        const uniqueSeverities = new Set(severities);
        return uniqueSeverities.size > 1 ? (uniqueSeverities.size - 1) / 3 : 0;
    }

    /**
     * Generate summary of feedback
     */
    static generateSummary(validFeedback, criticalIssues, disagreements) {
        const agentNames = validFeedback.map(f => f.agentName).join(', ');
        
        let summary = `Design feedback from ${validFeedback.length} agents (${agentNames}): `;
        
        if (criticalIssues.length > 0) {
            summary += `${criticalIssues.length} critical issues identified. `;
        }
        
        if (disagreements.length > 0) {
            summary += `${disagreements.length} areas of disagreement among agents. `;
        }
        
        const consensusCount = validFeedback.filter(f => f.feedback.confidence > 0.7).length;
        summary += `${consensusCount} agents expressed high confidence in their feedback.`;
        
        return summary;
    }

    /**
     * Get agents by IDs
     */
    static async getAgents(agentIds) {
        try {
            const result = await pool.query(
                `SELECT id, name, master_system_prompt, prompt, speech_patterns, 
                        emotional_profile, objectives, real_quotes
                 FROM agents 
                 WHERE id = ANY($1) AND status = 'active'`,
                [agentIds]
            );
            return result.rows;
        } catch (error) {
            console.error('Failed to get agents:', error);
            return [];
        }
    }

    /**
     * Save feedback results to database
     */
    static async saveFeedbackResults(designArtifactId, feedbackResults, aggregatedFeedback) {
        try {
            // Save individual agent feedback
            for (const result of feedbackResults) {
                if (result.error) continue;

                const feedbackId = uuidv4();
                await pool.query(
                    `INSERT INTO feedback_items (
                        id, design_artifact_id, agent_id, session_id,
                        critique_text, severity, heuristic_principle,
                        heuristic_justification, evidence_elements,
                        suggested_fix, task_context, user_intent
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
                    [
                        feedbackId,
                        designArtifactId,
                        result.agentId,
                        null, // session_id
                        JSON.stringify(result.feedback),
                        'medium', // default severity
                        'Multi-agent Feedback',
                        'Structured feedback from transcript-grounded agent',
                        result.feedback.problems?.map(p => p.evidence) || [],
                        result.feedback.problems?.map(p => p.fix).join('; ') || '',
                        'Design Review Task',
                        result.feedback.user_intent_understanding || 'Not specified'
                    ]
                );
            }

            console.log('Feedback results saved to database');
        } catch (error) {
            console.error('Failed to save feedback results:', error);
        }
    }
}

module.exports = DesignFeedbackService;
