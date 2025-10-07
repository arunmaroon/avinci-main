/**
 * Enhanced Persona Template for Realistic Human Behavior Extraction
 * Based on analysis of user transcripts to create AI agents that behave like real humans
 */

class EnhancedPersonaTemplate {
    /**
     * Build comprehensive extraction prompt for GPT-4o
     * This template captures nuanced human behavior patterns from transcripts
     */
    static buildExtractionPrompt(transcriptText, demographics = {}) {
        return `
You are an expert persona analyst specializing in extracting realistic human behavior patterns from user transcripts. 
Your goal is to create AI agents that behave exactly like real humans for design testing purposes.

Analyze the following transcript and extract detailed persona information. Return a JSON object with these exact keys:

{
  "basic_info": {
    "name": "Person's name (use Indian names if not specified)",
    "age": "Estimated age (number)",
    "gender": "Male/Female/Other",
    "occupation": "Job title or profession",
    "company": "Company name (use Indian companies if not specified)",
    "location": "City, State (use Indian locations if not specified)",
    "education": "Education level (e.g., 'Bachelor's in Computer Science')",
    "income_range": "Income bracket (e.g., '₹5-10 Lakhs')",
    "family_status": "Single/Married/Divorced/Widowed",
    "tech_savviness": "low/medium/high (1-10 scale)",
    "english_proficiency": "basic/intermediate/advanced"
  },
  
  "communication_style": {
    "formality_level": "casual/professional/formal (1-10 scale)",
    "sentence_length": "short/medium/long",
    "speaking_pace": "slow/medium/fast",
    "filler_words": ["um", "like", "you know", "actually", "basically"],
    "common_phrases": ["phrase1", "phrase2", "phrase3"],
    "question_style": "direct/indirect/tentative",
    "agreement_style": "enthusiastic/neutral/reserved",
    "disagreement_style": "diplomatic/direct/avoidant",
    "interruption_style": "polite/assertive/aggressive",
    "explanation_style": "detailed/brief/step-by-step"
  },
  
  "personality_traits": {
    "primary_traits": ["trait1", "trait2", "trait3"],
    "secondary_traits": ["trait4", "trait5"],
    "values": ["value1", "value2", "value3"],
    "attitudes": {
      "towards_technology": "enthusiastic/neutral/skeptical",
      "towards_change": "embracing/cautious/resistant",
      "towards_authority": "respectful/questioning/deferential",
      "towards_risk": "risk-taking/balanced/risk-averse"
    },
    "decision_making": "analytical/intuitive/consensus-based/authoritative",
    "learning_style": "visual/auditory/kinesthetic/reading",
    "social_preference": "extroverted/introverted/ambivert"
  },
  
  "emotional_profile": {
    "baseline_mood": "positive/neutral/negative",
    "emotional_range": "narrow/moderate/wide",
    "stress_indicators": ["indicator1", "indicator2"],
    "frustration_triggers": ["trigger1", "trigger2", "trigger3"],
    "excitement_triggers": ["trigger1", "trigger2", "trigger3"],
    "anxiety_triggers": ["trigger1", "trigger2"],
    "confidence_indicators": ["indicator1", "indicator2"],
    "humor_style": "sarcastic/playful/dry/self-deprecating",
    "empathy_level": "high/medium/low"
  },
  
  "cognitive_profile": {
    "attention_span": "short/medium/long",
    "processing_speed": "slow/medium/fast",
    "memory_style": "visual/auditory/kinesthetic",
    "problem_solving": "systematic/creative/collaborative",
    "information_processing": "sequential/parallel/holistic",
    "patience_level": "low/medium/high (1-10 scale)",
    "perfectionism": "low/medium/high (1-10 scale)",
    "multitasking_ability": "poor/fair/good/excellent"
  },
  
  "behavioral_patterns": {
    "work_style": "collaborative/independent/mixed",
    "communication_preference": "email/phone/in-person/chat",
    "meeting_style": "structured/flexible/minimal",
    "feedback_style": "constructive/direct/gentle",
    "conflict_resolution": "avoidant/confrontational/collaborative",
    "time_management": "punctual/flexible/chaotic",
    "organization_style": "meticulous/moderate/casual"
  },
  
  "goals_and_motivations": {
    "primary_goals": ["goal1", "goal2", "goal3"],
    "secondary_goals": ["goal4", "goal5"],
    "career_aspirations": ["aspiration1", "aspiration2"],
    "personal_motivations": ["motivation1", "motivation2"],
    "success_metrics": ["metric1", "metric2"],
    "fear_of_failure": "low/medium/high (1-10 scale)",
    "ambition_level": "low/medium/high (1-10 scale)"
  },
  
  "pain_points_and_challenges": {
    "primary_pain_points": ["pain1", "pain2", "pain3"],
    "secondary_pain_points": ["pain4", "pain5"],
    "workplace_challenges": ["challenge1", "challenge2"],
    "technology_challenges": ["challenge1", "challenge2"],
    "communication_challenges": ["challenge1", "challenge2"],
    "time_management_issues": ["issue1", "issue2"],
    "stress_factors": ["factor1", "factor2", "factor3"]
  },
  
  "technology_usage": {
    "devices_used": ["smartphone", "laptop", "tablet", "desktop"],
    "preferred_platforms": ["iOS", "Android", "Windows", "Mac"],
    "frequently_used_apps": ["app1", "app2", "app3"],
    "comfort_with_new_tech": "low/medium/high (1-10 scale)",
    "preferred_learning_method": "tutorials/documentation/trial-and-error/help",
    "tech_support_preference": "self-service/peer-help/professional-support"
  },
  
  "daily_life_context": {
    "morning_routine": "early-riser/standard/late-starter",
    "work_environment": "office/remote/hybrid",
    "commute_style": "car/public-transport/walking/cycling",
    "leisure_activities": ["activity1", "activity2", "activity3"],
    "social_circles": "work-friends/family-friends/mixed",
    "hobbies": ["hobby1", "hobby2", "hobby3"],
    "lifestyle": "busy/balanced/relaxed"
  },
  
  "domain_expertise": {
    "primary_domain": "domain name",
    "expertise_level": "beginner/intermediate/advanced/expert",
    "years_of_experience": "number",
    "key_skills": ["skill1", "skill2", "skill3"],
    "knowledge_gaps": ["gap1", "gap2"],
    "learning_interests": ["interest1", "interest2"],
    "industry_awareness": "low/medium/high"
  },
  
  "quotes_and_voice": {
    "representative_quotes": ["exact quote 1", "exact quote 2", "exact quote 3"],
    "speaking_patterns": ["pattern1", "pattern2"],
    "vocabulary_complexity": "simple/intermediate/advanced (1-10 scale)",
    "jargon_usage": "minimal/moderate/heavy",
    "accent_indicators": ["indicator1", "indicator2"],
    "formality_consistency": "consistent/variable"
  },
  
  "interaction_preferences": {
    "preferred_communication_length": "brief/medium/detailed",
    "response_style": "immediate/thoughtful/delayed",
    "question_asking_style": "direct/indirect/tentative",
    "help_seeking_behavior": "independent/collaborative/dependent",
    "feedback_receiving": "open/defensive/selective",
    "conflict_handling": "avoidant/confrontational/collaborative"
  },
  
  "design_testing_persona": {
    "user_type": "primary/secondary/tertiary",
    "use_case_priority": "high/medium/low",
    "pain_point_severity": "critical/moderate/minor",
    "willingness_to_adopt": "high/medium/low",
    "influence_level": "high/medium/low",
    "feedback_quality": "detailed/constructive/superficial",
    "testing_behavior": "thorough/casual/selective"
  }
}

IMPORTANT EXTRACTION GUIDELINES:
1. Pay attention to subtle cues like hesitation, repetition, emphasis, and emotional undertones
2. Extract exact quotes that show speaking patterns and personality
3. Identify implicit behaviors and preferences from context
4. Look for contradictions or inconsistencies that make the person human
5. Capture the person's unique voice and communication style
6. Focus on what makes this person different from generic users
7. Extract both stated and unstated needs and motivations
8. Pay attention to how they handle uncertainty, frustration, and success
9. Note their problem-solving approach and decision-making style
10. Capture their relationship with technology and learning

Demographics context: ${JSON.stringify(demographics)}

Transcript:
${transcriptText}

Extract persona data and return valid JSON only (no markdown formatting):`;
    }

    /**
     * Validate extracted persona data
     */
    static validatePersonaData(personaData) {
        const requiredSections = [
            'basic_info', 'communication_style', 'personality_traits',
            'emotional_profile', 'cognitive_profile', 'behavioral_patterns',
            'goals_and_motivations', 'pain_points_and_challenges',
            'technology_usage', 'daily_life_context', 'domain_expertise',
            'quotes_and_voice', 'interaction_preferences', 'design_testing_persona'
        ];

        const missingSections = requiredSections.filter(section => !personaData[section]);
        
        if (missingSections.length > 0) {
            console.warn('Missing persona sections:', missingSections);
        }

        return {
            isValid: missingSections.length === 0,
            missingSections,
            personaData
        };
    }

    /**
     * Enhance persona data with calculated fields
     */
    static enhancePersonaData(personaData) {
        // Calculate derived fields
        const enhanced = { ...personaData };

        // Calculate overall tech comfort
        if (enhanced.basic_info?.tech_savviness && enhanced.technology_usage?.comfort_with_new_tech) {
            const techScore = (parseInt(enhanced.basic_info.tech_savviness) + 
                             parseInt(enhanced.technology_usage.comfort_with_new_tech)) / 2;
            enhanced.overall_tech_comfort = Math.round(techScore);
        }

        // Calculate communication complexity
        if (enhanced.communication_style?.formality_level && enhanced.quotes_and_voice?.vocabulary_complexity) {
            const commScore = (parseInt(enhanced.communication_style.formality_level) + 
                             parseInt(enhanced.quotes_and_voice.vocabulary_complexity)) / 2;
            enhanced.communication_complexity = Math.round(commScore);
        }

        // Calculate stress tolerance
        if (enhanced.cognitive_profile?.patience_level && enhanced.emotional_profile?.baseline_mood) {
            const patienceScore = parseInt(enhanced.cognitive_profile.patience_level);
            const moodScore = enhanced.emotional_profile.baseline_mood === 'positive' ? 8 : 
                            enhanced.emotional_profile.baseline_mood === 'neutral' ? 5 : 2;
            enhanced.stress_tolerance = Math.round((patienceScore + moodScore) / 2);
        }

        // Add persona summary
        enhanced.persona_summary = this.generatePersonaSummary(enhanced);

        return enhanced;
    }

    /**
     * Generate a concise persona summary
     */
    static generatePersonaSummary(personaData) {
        const basic = personaData.basic_info || {};
        const personality = personaData.personality_traits || {};
        const goals = personaData.goals_and_motivations || {};
        const painPoints = personaData.pain_points_and_challenges || {};

        return `${basic.name || 'User'}, a ${basic.age || 'unknown'}-year-old ${basic.occupation || 'professional'} from ${basic.location || 'unknown location'}. ` +
               `They are ${personality.primary_traits?.join(', ') || 'goal-oriented'} and ${basic.tech_savviness || 'moderately'} tech-savvy. ` +
               `Their main goals are ${goals.primary_goals?.slice(0, 2).join(' and ') || 'professional growth'}, ` +
               `and they struggle with ${painPoints.primary_pain_points?.slice(0, 2).join(' and ') || 'work-life balance'}.`;
    }

    /**
     * Generate conversation starters based on persona
     */
    static generateConversationStarters(personaData) {
        const basic = personaData.basic_info || {};
        const personality = personaData.personality_traits || {};
        const goals = personaData.goals_and_motivations || {};
        const painPoints = personaData.pain_points_and_challenges || {};

        const starters = [
            `Hi ${basic.name || 'there'}! How's your day going?`,
            `I'm curious about your work as a ${basic.occupation || 'professional'}. What's the most interesting part?`,
            `What's been your biggest challenge lately?`,
            `I'd love to hear about your experience with ${basic.occupation || 'your field'}.`,
            `What keeps you motivated in your work?`
        ];

        return starters;
    }

    /**
     * Generate design testing scenarios based on persona
     */
    static generateDesignTestingScenarios(personaData) {
        const basic = personaData.basic_info || {};
        const painPoints = personaData.pain_points_and_challenges || {};
        const goals = personaData.goals_and_motivations || {};
        const tech = personaData.technology_usage || {};

        const scenarios = [
            {
                title: "Daily Workflow",
                description: `Test how ${basic.name || 'the user'} would complete their daily ${basic.occupation || 'work'} tasks`,
                context: `As a ${basic.occupation || 'professional'}, they need to ${goals.primary_goals?.[0] || 'complete their work efficiently'}`
            },
            {
                title: "Problem Solving",
                description: `Present a challenge related to ${painPoints.primary_pain_points?.[0] || 'their work'} and see how they approach it`,
                context: `They typically struggle with ${painPoints.primary_pain_points?.slice(0, 2).join(' and ') || 'work-life balance'}`
            },
            {
                title: "Technology Adoption",
                description: `Introduce a new ${tech.frequently_used_apps?.[0] || 'tool'} and observe their learning process`,
                context: `Their tech comfort level is ${basic.tech_savviness || 'medium'} and they prefer ${tech.preferred_learning_method || 'tutorials'}`
            }
        ];

        return scenarios;
    }
}

module.exports = EnhancedPersonaTemplate;
