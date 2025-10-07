/**
 * Multi-Agent Feedback System
 * Parallel, non-generic feedback from multiple agents on design artifacts
 */

const providerGateway = require('./providerGateway');
const personaSynthesizer = require('./personaSynthesizer');

class MultiAgentFeedback {
    async runParallelFeedback(agents, feedbackSpec) {
        const provider = providerGateway.getProvider();
        if (!provider) {
            throw new Error('No AI provider available for feedback');
        }

        // Run feedback in parallel for all agents
        const feedbackPromises = agents.map(agent => 
            this.getAgentFeedback(provider, agent, feedbackSpec)
        );

        const results = await Promise.all(feedbackPromises);
        
        // Process and cluster results
        return this.processFeedbackResults(results);
    }

    async getAgentFeedback(provider, agent, spec) {
        try {
            const systemPrompt = personaSynthesizer.buildMasterPrompt({
                name: agent.name,
                age: 30,
                speech_patterns: agent.speech_patterns || {},
                vocabulary_profile: agent.vocabulary_profile || {},
                emotional_profile: agent.emotional_profile || {},
                cognitive_profile: agent.cognitive_profile || {},
                knowledge_bounds: agent.knowledge_bounds || {},
                real_quotes: agent.real_quotes || [],
                objectives: agent.objectives || [],
                needs: agent.needs || [],
                fears: agent.fears || [],
                apprehensions: agent.apprehensions || []
            });

            const userPrompt = `ARTIFACT: ${spec.artifact_ref.type} -> ${spec.artifact_ref.value}
TASK: ${spec.task}
INSTRUCTIONS:
- Give concrete, non-generic feedback anchored in the artifact.
- Cite specific elements and copy; state confusion moments explicitly.
- Propose one specific microcopy or layout change where relevant.
${spec.rubric?.length ? `- Rubric: ${spec.rubric.join('; ')}` : ''}

Return JSON: { 
  "summary": "...", 
  "positives": ["..."], 
  "problems": [{"issue": "...","evidence":"...","severity":"minor|major|critical","fix":"..."}], 
  "confidence": 0-1 
}`;

            const messages = [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ];

            const rawResponse = await provider.chat(messages, {
                temperature: 0.7,
                max_tokens: 600
            });

            return {
                agent_id: agent.id,
                agent_name: agent.name,
                findings: this.safeParseJSON(rawResponse)
            };

        } catch (error) {
            console.error(`Feedback failed for agent ${agent.id}:`, error);
            return {
                agent_id: agent.id,
                agent_name: agent.name,
                findings: { summary: 'Feedback generation failed', confidence: 0 }
            };
        }
    }

    processFeedbackResults(results) {
        // Extract all problems across agents
        const allProblems = [];
        const allPositives = [];
        const agentSummaries = [];

        results.forEach(result => {
            if (result.findings.problems) {
                allProblems.push(...result.findings.problems.map(p => ({
                    ...p,
                    agent_id: result.agent_id,
                    agent_name: result.agent_name
                })));
            }
            if (result.findings.positives) {
                allPositives.push(...result.findings.positives);
            }
            agentSummaries.push({
                agent_id: result.agent_id,
                agent_name: result.agent_name,
                summary: result.findings.summary,
                confidence: result.findings.confidence
            });
        });

        // Cluster similar problems
        const clusteredProblems = this.clusterProblems(allProblems);
        
        // Identify disagreements
        const disagreements = this.findDisagreements(results);

        return {
            agent_summaries: agentSummaries,
            clustered_problems: clusteredProblems,
            all_positives: [...new Set(allPositives)],
            disagreements: disagreements,
            total_agents: results.length,
            consensus_score: this.calculateConsensusScore(results)
        };
    }

    clusterProblems(problems) {
        const clusters = [];
        const processed = new Set();

        problems.forEach(problem => {
            if (processed.has(problem.issue)) return;

            const similarProblems = problems.filter(p => 
                this.isSimilarProblem(problem.issue, p.issue) && 
                !processed.has(p.issue)
            );

            if (similarProblems.length > 0) {
                clusters.push({
                    issue: problem.issue,
                    severity: this.getMostSevere(similarProblems),
                    evidence: similarProblems.map(p => p.evidence).join('; '),
                    suggested_fixes: similarProblems.map(p => p.fix).filter(f => f),
                    mentioned_by: similarProblems.map(p => p.agent_name),
                    count: similarProblems.length
                });

                similarProblems.forEach(p => processed.add(p.issue));
            }
        });

        return clusters;
    }

    isSimilarProblem(issue1, issue2) {
        // Simple similarity check - in production, use more sophisticated NLP
        const words1 = issue1.toLowerCase().split(/\s+/);
        const words2 = issue2.toLowerCase().split(/\s+/);
        const commonWords = words1.filter(word => words2.includes(word));
        return commonWords.length / Math.max(words1.length, words2.length) > 0.5;
    }

    getMostSevere(problems) {
        const severityOrder = { 'critical': 3, 'major': 2, 'minor': 1 };
        return problems.reduce((max, current) => 
            severityOrder[current.severity] > severityOrder[max.severity] ? current : max
        ).severity;
    }

    findDisagreements(results) {
        const disagreements = [];
        
        // Look for conflicting feedback on the same topic
        const topics = new Map();
        
        results.forEach(result => {
            if (result.findings.problems) {
                result.findings.problems.forEach(problem => {
                    const topic = this.extractTopic(problem.issue);
                    if (!topics.has(topic)) {
                        topics.set(topic, []);
                    }
                    topics.get(topic).push({
                        agent: result.agent_name,
                        issue: problem.issue,
                        severity: problem.severity
                    });
                });
            }
        });

        // Find topics with conflicting views
        topics.forEach((views, topic) => {
            if (views.length > 1) {
                const severities = views.map(v => v.severity);
                const uniqueSeverities = [...new Set(severities)];
                
                if (uniqueSeverities.length > 1) {
                    disagreements.push({
                        topic,
                        views,
                        conflict_type: 'severity_disagreement'
                    });
                }
            }
        });

        return disagreements;
    }

    extractTopic(issue) {
        // Extract main topic from issue description
        const words = issue.toLowerCase().split(/\s+/);
        const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
        return words.filter(word => !stopWords.includes(word)).slice(0, 3).join(' ');
    }

    calculateConsensusScore(results) {
        if (results.length <= 1) return 1.0;
        
        const confidences = results.map(r => r.findings.confidence || 0);
        const avgConfidence = confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
        
        return Math.round(avgConfidence * 100) / 100;
    }

    safeParseJSON(str) {
        try {
            return JSON.parse(str);
        } catch (error) {
            return {
                summary: str,
                positives: [],
                problems: [],
                confidence: 0.5
            };
        }
    }
}

module.exports = new MultiAgentFeedback();
