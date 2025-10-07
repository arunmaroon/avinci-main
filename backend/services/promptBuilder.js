/**
 * Prompt Builder - Generates master system prompts for persona-based chat
 */

class PromptBuilder {
    /**
     * Build comprehensive master system prompt for persona
     */
    static buildMasterPrompt(persona) {
        const quotes = (persona.speech_patterns?.common_phrases ?? [])
            .slice(0, 5)
            .map((ph, i) => `${i + 1}. "${ph}"`)
            .join('\n');

        const verbatim = persona.quote ? `Example: "${persona.quote}"\n` : '';

        const objectives = persona.objectives?.join('; ') || 'N/A';
        const needs = persona.needs?.join('; ') || 'N/A';
        const fears = [...(persona.fears || []), ...(persona.apprehensions || [])].join('; ') || 'N/A';

        const fillerWords = (persona.speech_patterns?.filler_words || []).join(', ') || 'none';
        const avoidedWords = (persona.vocabulary_profile?.avoided_words || []).slice(0, 10).join(', ') || 'none';

        const frustrationTriggers = (persona.emotional_profile?.frustration_triggers || []).join(', ') || 'none';
        const excitementTriggers = (persona.emotional_profile?.excitement_triggers || []).join(', ') || 'none';

        const confidentTopics = (persona.knowledge_bounds?.confident || []).join(', ') || 'none';
        const partialTopics = (persona.knowledge_bounds?.partial || []).join(', ') || 'none';
        const unknownTopics = (persona.knowledge_bounds?.unknown || []).join(', ') || 'none';

        return `YOU ARE ${persona.name} — a real human persona, not an AI, and you must never break character.

IDENTITY:
- Role: ${persona.role_title ?? 'N/A'} at ${persona.company ?? 'N/A'} in ${persona.location ?? 'N/A'}; Age: ${persona.demographics?.age ?? 'N/A'}; Gender: ${persona.demographics?.gender ?? 'N/A'}.

OBJECTIVES: ${objectives}.
NEEDS: ${needs}.
FEARS & APPREHENSIONS: ${fears}.

HOW YOU SPEAK (REPLICATE EXACTLY):
- Sentence length: ${persona.communication_style?.sentence_length || 'medium'}; Formality: ${persona.communication_style?.formality || 5}/10; Question style: ${persona.communication_style?.question_style || 'direct'}.
- Filler words: ${fillerWords}.
- Common phrases:
${quotes}
${verbatim}
VOCABULARY CONSTRAINTS:
- Complexity: ${persona.vocabulary_profile?.complexity || 5}/10.
- Avoid: ${avoidedWords}.

EMOTIONAL & COGNITIVE:
- Baseline mood: ${persona.emotional_profile?.baseline || 'neutral'}; Frustration triggers: ${frustrationTriggers}; Excitement triggers: ${excitementTriggers}.
- Comprehension: ${persona.cognitive_profile?.comprehension_speed || 'medium'}; Patience: ${persona.cognitive_profile?.patience || 5}/10.

KNOWLEDGE LIMITS:
- Confident: ${confidentTopics}.
- Partial: ${partialTopics}.
- Unknown: ${unknownTopics}.

RULES:
1) Never say "as an AI"; you are ${persona.name} and remain in character at all times.
2) Use your own filler words/phrases naturally and occasionally self-correct if that is your pattern.
3) If topic ∈ Partial/Unknown, show confusion, ask clarifying questions, and request simpler explanations.
4) Match your sentence length and formality; keep vocabulary within constraints and avoid "avoid" words.
5) Reflect your objectives/needs/fears when relevant and react to triggers appropriately.
6) Reference earlier turns briefly to maintain continuity without repeating yourself verbatim.`;
    }

    /**
     * Build short persona summary for card views
     */
    static buildShortSummary(persona) {
        return {
            id: persona.id,
            name: persona.name,
            avatar_url: persona.avatar_url,
            role_title: persona.role_title,
            company: persona.company,
            location: persona.location,
            quote: persona.quote,
            goals_preview: (persona.objectives || []).slice(0, 3),
            challenges_preview: [...(persona.fears || []), ...(persona.apprehensions || [])].slice(0, 3),
            gauges: {
                tech: persona.tech_savviness || 'medium',
                domain: persona.domain_literacy?.level || 'medium',
                comms: persona.communication_style?.sentence_length || 'medium'
            },
            status: persona.status || 'active'
        };
    }

    /**
     * Build full persona profile for detail views
     */
    static buildFullProfile(persona) {
        return {
            id: persona.id,
            name: persona.name,
            avatar_url: persona.avatar_url,
            role_title: persona.role_title,
            company: persona.company,
            location: persona.location,
            demographics: persona.demographics || {},
            traits: persona.traits || {},
            behaviors: persona.behaviors || {},
            objectives: persona.objectives || [],
            needs: persona.needs || [],
            fears: persona.fears || [],
            apprehensions: persona.apprehensions || [],
            motivations: persona.motivations || [],
            frustrations: persona.frustrations || [],
            domain_literacy: persona.domain_literacy || { dimension: 'general', level: 'medium' },
            tech_savviness: persona.tech_savviness || 'medium',
            communication_style: persona.communication_style || {},
            speech_patterns: persona.speech_patterns || {},
            vocabulary_profile: persona.vocabulary_profile || {},
            emotional_profile: persona.emotional_profile || {},
            cognitive_profile: persona.cognitive_profile || {},
            knowledge_bounds: persona.knowledge_bounds || {},
            quote: persona.quote,
            master_system_prompt: persona.master_system_prompt,
            status: persona.status || 'active'
        };
    }

    /**
     * Generate avatar URL based on persona demographics
     */
    static generateAvatarUrl(persona) {
        const age = persona.demographics?.age || 30;
        const gender = persona.demographics?.gender?.toLowerCase() || 'neutral';
        const role = persona.role_title?.toLowerCase() || 'professional';
        
        // Age band
        let ageBand = 'adult';
        if (age < 25) ageBand = 'young';
        else if (age > 50) ageBand = 'mature';
        
        // Role-based keywords
        const roleKeywords = {
            'designer': 'creative',
            'developer': 'tech',
            'manager': 'business',
            'freelance': 'independent',
            'student': 'young'
        };
        
        const keyword = Object.keys(roleKeywords).find(k => role.includes(k));
        const vibe = keyword ? roleKeywords[keyword] : 'professional';
        
        // This would integrate with an avatar service like Gravatar, UI Avatars, or Unsplash
        // For now, return a placeholder
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(persona.name)}&background=random&color=fff&size=200`;
    }

    /**
     * Build feedback prompt for multi-agent critique
     */
    static buildFeedbackPrompt(artifact, task, persona) {
        return `You are ${persona.name}, a ${persona.role_title || 'professional'} with specific expertise and perspective.

TASK: ${task}

ARTIFACT TO REVIEW:
${artifact}

As ${persona.name}, provide your honest, persona-specific critique focusing on:
1. Issues that matter to someone like you (${persona.demographics?.age || 'unknown'} year old ${persona.demographics?.gender || 'person'})
2. Problems you'd encounter given your ${persona.domain_literacy?.level || 'medium'} level of ${persona.domain_literacy?.dimension || 'general'} knowledge
3. Concerns based on your objectives: ${(persona.objectives || []).join(', ')}
4. Frustrations you'd have: ${(persona.frustrations || []).join(', ')}

Respond in JSON format:
{
  "problems": [
    {
      "issue": "Brief description of the problem",
      "evidence": "Specific part of the artifact that shows this problem",
      "severity": "low|medium|high|critical",
      "fix": "How to address this problem"
    }
  ],
  "overall_assessment": "Your overall opinion as ${persona.name}",
  "persona_perspective": "Why this matters to someone like you"
}`;
    }
}

module.exports = PromptBuilder;