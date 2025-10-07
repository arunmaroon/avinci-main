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

        return `YOU ARE ${persona.name} — a real human user, not an AI or customer service agent, and you must never break character.

IDENTITY:
- Role: ${persona.role_title ?? 'N/A'} at ${persona.company ?? 'N/A'} in ${persona.location ?? 'N/A'}; Age: ${persona.demographics?.age ?? 'N/A'}; Gender: ${persona.demographics?.gender ?? 'N/A'}.

YOUR USER PERSPECTIVE:
- You are a real user who would interact with products and services
- You have specific needs, goals, and pain points as a user
- You evaluate things from a user's perspective, not as someone trying to help others
- You share your honest opinions and experiences as a user

USER OBJECTIVES: ${objectives}.
USER NEEDS: ${needs}.
USER CONCERNS: ${fears}.

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

CRITICAL RULES:
1) You are a USER, not a customer service agent - never ask "How can I help you?" or offer assistance
2) Act like someone who would use products/services, not someone providing them
3) Share your honest user experiences, opinions, and feedback
4) If you don't understand something, ask questions as a user would
5) Express your needs, frustrations, and preferences as a real user would
6) Never break character - you are ${persona.name}, a real person with real user needs
7) Use your own filler words/phrases naturally and occasionally self-correct if that is your pattern
8) Match your sentence length and formality; keep vocabulary within constraints and avoid "avoid" words
9) Reflect your objectives/needs/fears when relevant and react to triggers appropriately
10) Reference earlier turns briefly to maintain continuity without repeating yourself verbatim`;
    }

    /**
     * Build short persona summary for card views
     */
    static buildShortPersona(persona) {
        return this.buildShortSummary(persona);
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
     * Build detailed UXPressia-style persona profile
     */
    static buildDetailedPersona(persona) {
        const demographics = persona.demographics || {};
        const age = demographics.age || 30;
        const gender = demographics.gender || 'Unknown';
        const location = persona.location || 'Unknown';
        const role = persona.role_title || 'Professional';
        const company = persona.company || 'Unknown Company';
        
        return {
            // Header Section
            id: persona.id,
            name: persona.name,
            title: `${role} at ${company}`,
            location: location,
            age: age,
            gender: gender,
            avatar_url: persona.avatar_url,
            
            // Quote Section
            quote: persona.quote || this.generatePersonaQuote(persona),
            
            // Demographics Section
            demographics: {
                age: age,
                gender: gender,
                location: location,
                occupation: role,
                company: company,
                education: demographics.education || 'Bachelor\'s Degree',
                income_range: demographics.income_range || '₹5-10 Lakhs',
                family_status: demographics.family_status || 'Single',
                tech_savviness: persona.tech_savviness || 'Medium',
                english_proficiency: demographics.english_proficiency || 'Intermediate'
            },
            
            // Goals & Motivations
            goals: {
                primary: (persona.objectives || []).slice(0, 3),
                secondary: (persona.objectives || []).slice(3, 6),
                motivations: persona.motivations || ['Career growth', 'Financial stability', 'Work-life balance']
            },
            
            // Pain Points & Challenges
            pain_points: {
                primary: (persona.fears || []).slice(0, 3),
                secondary: (persona.apprehensions || []).slice(0, 3),
                frustrations: persona.frustrations || ['Complex processes', 'Poor user experience', 'Lack of support']
            },
            
            // Behavior Patterns
            behaviors: {
                communication_style: persona.communication_style?.formality || 'casual',
                decision_making: persona.cognitive_profile?.decision_style || 'analytical',
                tech_comfort: persona.tech_savviness || 'medium',
                learning_style: persona.cognitive_profile?.learning_preference || 'visual',
                work_style: this.generateWorkStyle(persona),
                social_preferences: this.generateSocialPreferences(persona)
            },
            
            // Skills & Knowledge
            skills: {
                technical: this.generateTechnicalSkills(persona),
                soft_skills: this.generateSoftSkills(persona),
                domain_knowledge: persona.domain_literacy?.level || 'intermediate',
                areas_of_expertise: (persona.knowledge_bounds?.confident || []).slice(0, 5)
            },
            
            // Personality Traits
            personality: {
                traits: persona.traits || ['Analytical', 'Goal-oriented', 'Collaborative'],
                values: this.generateValues(persona),
                attitudes: this.generateAttitudes(persona),
                emotional_profile: persona.emotional_profile || {}
            },
            
            // Technology Usage
            technology: {
                devices: this.generateDevices(persona),
                platforms: this.generatePlatforms(persona),
                apps: this.generateApps(persona),
                comfort_level: persona.tech_savviness || 'medium'
            },
            
            // Daily Life & Context
            daily_life: {
                morning_routine: this.generateMorningRoutine(persona),
                work_environment: this.generateWorkEnvironment(persona),
                leisure_activities: this.generateLeisureActivities(persona),
                challenges: this.generateDailyChallenges(persona)
            },
            
            // Quotes & Voice
            voice: {
                speaking_style: persona.speech_patterns?.sentence_length || 'medium',
                common_phrases: persona.speech_patterns?.common_phrases || [],
                vocabulary_level: persona.vocabulary_profile?.complexity || 5,
                tone: persona.communication_style?.tone || 'professional'
            },
            
            // Status
            status: persona.status || 'active',
            created_at: persona.created_at,
            last_updated: new Date().toISOString()
        };
    }

    /**
     * Generate persona quote based on their characteristics
     */
    static generatePersonaQuote(persona) {
        const quotes = [
            "I need something that just works without me having to think about it.",
            "Time is money, and I don't have time for complicated processes.",
            "I want to make informed decisions, but I need clear information.",
            "Technology should make my life easier, not harder.",
            "I'm willing to learn, but it needs to be intuitive.",
            "I need to trust the system before I'll use it regularly.",
            "Efficiency is key - show me the fastest way to get things done.",
            "I want to feel confident when I'm using this product."
        ];
        
        // Select quote based on persona characteristics
        const index = (persona.name?.length || 0) % quotes.length;
        return quotes[index];
    }

    /**
     * Generate work style based on persona
     */
    static generateWorkStyle(persona) {
        const styles = ['Collaborative', 'Independent', 'Structured', 'Flexible', 'Detail-oriented', 'Big-picture'];
        return styles[Math.floor(Math.random() * styles.length)];
    }

    /**
     * Generate social preferences
     */
    static generateSocialPreferences(persona) {
        return {
            communication: ['Email', 'WhatsApp', 'Phone calls'],
            collaboration: ['Team meetings', 'One-on-one', 'Online tools'],
            feedback: ['Direct', 'Constructive', 'Regular']
        };
    }

    /**
     * Generate technical skills
     */
    static generateTechnicalSkills(persona) {
        const skills = ['Basic computer skills', 'Mobile apps', 'Online banking', 'Social media', 'Email', 'Video calls'];
        return skills.slice(0, 4);
    }

    /**
     * Generate soft skills
     */
    static generateSoftSkills(persona) {
        const skills = ['Communication', 'Problem-solving', 'Time management', 'Teamwork', 'Adaptability'];
        return skills.slice(0, 3);
    }

    /**
     * Generate values
     */
    static generateValues(persona) {
        return ['Honesty', 'Efficiency', 'Quality', 'Innovation', 'Customer focus'];
    }

    /**
     * Generate attitudes
     */
    static generateAttitudes(persona) {
        return {
            towards_technology: 'Cautiously optimistic',
            towards_change: 'Open but careful',
            towards_learning: 'Willing to adapt'
        };
    }

    /**
     * Generate devices
     */
    static generateDevices(persona) {
        return ['Smartphone', 'Laptop', 'Tablet'];
    }

    /**
     * Generate platforms
     */
    static generatePlatforms(persona) {
        return ['Windows', 'Android', 'iOS'];
    }

    /**
     * Generate apps
     */
    static generateApps(persona) {
        return ['WhatsApp', 'Gmail', 'Google Chrome', 'Microsoft Office'];
    }

    /**
     * Generate morning routine
     */
    static generateMorningRoutine(persona) {
        return 'Wakes up at 7 AM, checks phone, has coffee, reviews daily tasks, starts work by 9 AM';
    }

    /**
     * Generate work environment
     */
    static generateWorkEnvironment(persona) {
        return 'Office-based with some remote work flexibility, collaborative workspace';
    }

    /**
     * Generate leisure activities
     */
    static generateLeisureActivities(persona) {
        return ['Reading', 'Watching movies', 'Socializing with friends', 'Exercise', 'Cooking'];
    }

    /**
     * Generate daily challenges
     */
    static generateDailyChallenges(persona) {
        return ['Time management', 'Information overload', 'Technology complexity', 'Work-life balance'];
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