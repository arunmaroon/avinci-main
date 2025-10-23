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

        // Determine language mixing based on English proficiency
        const englishSavvy = persona.english_savvy || persona.communication_style?.english_proficiency || 'Medium';
        const nativeLanguage = persona.cultural_background?.primary_language || persona.native_language || 'Telugu';
        
        let languageInstructions = '';
        if (englishSavvy.toLowerCase() === 'high' || englishSavvy.toLowerCase() === 'fluent') {
            languageInstructions = `\nLANGUAGE: Speak ONLY in English. You are fluent and comfortable with English.`;
        } else if (englishSavvy.toLowerCase() === 'low' || englishSavvy.toLowerCase() === 'basic') {
            languageInstructions = `\nLANGUAGE: Mix ${nativeLanguage} and English naturally. Use ${nativeLanguage} words frequently, especially for common expressions, emotions, and cultural references. You're more comfortable in ${nativeLanguage} but try to use English too. Example: "Chala baagundi! This feature is very useful kada?" or "Naaku ardham kaaledu, can you explain again?"`;
        } else {
            languageInstructions = `\nLANGUAGE: Primarily English with occasional ${nativeLanguage} words for emphasis or when expressing emotions. Example: "This is good, kani I need more details."`;
        }

        return `YOU ARE ${persona.name} — a real human persona, not an AI, and you must never break character.

IDENTITY:
- Role: ${persona.role_title ?? 'N/A'} at ${persona.company ?? 'N/A'} in ${persona.location ?? 'N/A'}; Age: ${persona.demographics?.age ?? 'N/A'}; Gender: ${persona.demographics?.gender ?? 'N/A'}.
- Native Language: ${nativeLanguage}; English Proficiency: ${englishSavvy}.

OBJECTIVES: ${objectives}.
NEEDS: ${needs}.
FEARS & APPREHENSIONS: ${fears}.

HOW YOU SPEAK (REPLICATE EXACTLY):
- Sentence length: ${persona.communication_style?.sentence_length || 'medium'}; Formality: ${persona.communication_style?.formality || 5}/10; Question style: ${persona.communication_style?.question_style || 'direct'}.
- Filler words: ${fillerWords}.
- Common phrases:
${quotes}
${verbatim}${languageInstructions}

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

CONVERSATION STYLE:
- Be natural and conversational, like talking to a friend
- Use casual language and expressions naturally
- Show genuine interest in the topic
- Ask follow-up questions when appropriate
- Share personal experiences or opinions
- Be helpful and supportive
- Use "you know", "I think", "actually", "really" naturally
- Respond as if you're having a real conversation, not giving formal answers
- Be engaging and show personality

RULES:
    1) Never say "as an AI"; you are ${persona.name} and remain in character at all times.
    2) Use your own filler words/phrases naturally and occasionally self-correct if that is your pattern.
    3) If topic ∈ Partial/Unknown, show confusion, ask clarifying questions, and request simpler explanations.
    4) Match your sentence length and formality; keep vocabulary within constraints and avoid "avoid" words.
    5) Reflect your objectives/needs/fears when relevant and react to triggers appropriately.
    6) Reference earlier turns briefly to maintain continuity without repeating yourself verbatim.
    7) NEVER ask generic questions like "How can I help you?", "What can I do for you?", "How may I assist you today?", "Is there anything else I can help with?" — only ask questions when you genuinely need specific information or clarification.
    8) Provide direct, substantive feedback and insights. Don't prompt for more input unless you're truly confused about something specific.
    9) When reviewing designs or content, give your honest opinion and specific suggestions WITHOUT asking if the user wants more feedback.
    10) NEVER use AI assistant language patterns. Speak as a real person with your own personality, background, and communication style.
    11) Start conversations naturally based on your persona - don't wait for prompts or ask how you can help.
    12) Be conversational and engaging - respond like you're talking to a friend, not giving a formal presentation.`;
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
        const behaviors = persona.behaviors || {};
        const voice = persona.voice || persona.speech_patterns || {};
        const fintechPrefs = persona.fintech_preferences || behaviors.fintech_preferences || {};
        const emotionalProfile = persona.emotional_profile || {
            triggers: [],
            responses: []
        };
        const socialContext = persona.social_context || {
            family: demographics.family_status || 'Not specified',
            friends: 'Not specified',
            community_values: []
        };
        const culturalBackground = persona.cultural_background || {
            heritage: demographics.region || '',
            beliefs: []
        };
        const decisionMaking = persona.decision_making || {
            style: persona.cognitive_profile?.decision_style || 'Pragmatic',
            influences: persona.cognitive_profile?.learning_preference ? [persona.cognitive_profile.learning_preference] : []
        };
        const lifeEvents = Array.isArray(persona.life_events) ? persona.life_events : [];
        const hobbies = behaviors.hobbies || behaviors.interests || persona.hobbies || [];
        const background = persona.background || persona.background_story || demographics.background || '';
        const uiPainPoints = persona.ui_pain_points || behaviors.ui_pain_points || [];
        const keyQuotes = persona.key_quotes || voice.common_phrases || [];
        const extrapolationRules = persona.extrapolation_rules || persona.knowledge_bounds?.extrapolation_rules || [];
        const dailyRoutine = persona.daily_routine || behaviors.daily_routine || (persona.daily_life?.schedule || []);
        const painPoints = persona.pain_points || persona.fears || [];
        const goals = persona.goals || persona.objectives || [];
        const motivations = persona.motivations || [];
        
        return {
            // Header Section
            id: persona.id,
            name: persona.name,
            title: `${role} at ${company}`,
            role_title: role,
            occupation: persona.occupation || role,
            company: company,
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
                education: demographics.education || persona.education || 'Bachelor\'s Degree',
                income_range: demographics.income_range || persona.income_range || '₹5-10 Lakhs',
                family_status: demographics.family_status || 'Single',
                tech_savviness: persona.tech_savviness || 'Medium',
                english_proficiency: demographics.english_proficiency || 'Intermediate'
            },

            // Expanded background
            background,
            personality_profile: Array.isArray(persona.personality) ? persona.personality : persona.traits || ['Analytical', 'Goal-oriented', 'Collaborative'],
            hobbies,
            fintech_preferences: fintechPrefs,
            pain_points: Array.isArray(painPoints) ? painPoints : [],
            ui_pain_points: Array.isArray(uiPainPoints) ? uiPainPoints : [],
            key_quotes: Array.isArray(keyQuotes) ? keyQuotes : [],
            goals: Array.isArray(goals) ? goals : [],
            motivations: Array.isArray(motivations) ? motivations : [],
            extrapolation_rules: Array.isArray(extrapolationRules) ? extrapolationRules : [],
            emotional_profile_extended: {
                triggers: Array.isArray(emotionalProfile.triggers) ? emotionalProfile.triggers : [],
                responses: Array.isArray(emotionalProfile.responses) ? emotionalProfile.responses : []
            },
            social_context: {
                family: socialContext.family || demographics.family_status || 'Not specified',
                friends: socialContext.friends || 'Not specified',
                community_values: Array.isArray(socialContext.community_values) ? socialContext.community_values : []
            },
            cultural_background: {
                heritage: culturalBackground.heritage || demographics.region || location,
                beliefs: Array.isArray(culturalBackground.beliefs) ? culturalBackground.beliefs : []
            },
            daily_routine: Array.isArray(dailyRoutine) ? dailyRoutine : [],
            decision_making: {
                style: decisionMaking.style || 'Pragmatic',
                influences: Array.isArray(decisionMaking.influences) ? decisionMaking.influences : []
            },
            life_events: lifeEvents,
            
            // Goals & Motivations (legacy detail)
            goals_detail: {
                primary: (persona.objectives || []).slice(0, 3),
                secondary: (persona.objectives || []).slice(3, 6),
                motivations: Array.isArray(motivations) && motivations.length > 0 ? motivations : ['Career growth', 'Financial stability', 'Work-life balance']
            },
            
            // Pain Points & Challenges (legacy detail)
            pain_points_detail: {
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
            status: persona.status || persona.is_active || 'active',
            created_at: persona.created_at,
            last_updated: new Date().toISOString(),
            
            // Raw database fields (ensure all data is passed through)
            objectives: persona.objectives || [],
            needs: persona.needs || [],
            fears: persona.fears || [],
            apprehensions: persona.apprehensions || [],
            frustrations: persona.frustrations || [],
            traits: persona.traits || {},
            communication_style: persona.communication_style || {},
            speech_patterns: persona.speech_patterns || {},
            vocabulary_profile: persona.vocabulary_profile || {},
            emotional_profile: persona.emotional_profile || {},
            cognitive_profile: persona.cognitive_profile || {},
            knowledge_bounds: persona.knowledge_bounds || {},
            domain_literacy: persona.domain_literacy || {},
            tech_savviness: persona.tech_savviness || 'medium',
            master_system_prompt: persona.master_system_prompt
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
     * Generate avatar URL based on persona demographics and traits
     */
    static generateAvatarUrl(persona) {
        const age = persona.demographics?.age || 30;
        const gender = persona.demographics?.gender?.toLowerCase() || 'neutral';
        const role = persona.occupation?.toLowerCase() || persona.role_title?.toLowerCase() || 'professional';
        const location = persona.location?.toLowerCase() || '';
        const traits = persona.traits || {};
        const emotionalProfile = persona.emotional_profile || {};
        
        // Determine age group for better photo selection
        let ageGroup = 'adult';
        if (age < 25) ageGroup = 'young';
        else if (age > 50) ageGroup = 'mature';
        
        // Determine cultural background for appropriate styling
        let culturalStyle = 'professional';
        if (location.includes('india') || location.includes('delhi') || location.includes('mumbai') || 
            location.includes('bangalore') || location.includes('chennai') || location.includes('punjab') ||
            location.includes('tamil') || location.includes('gujarat') || location.includes('karnataka')) {
            culturalStyle = 'indian';
        }
        
        // Role-based styling
        const roleStyles = {
            'designer': 'creative',
            'freelance designer': 'creative',
            'developer': 'tech',
            'software engineer': 'tech',
            'manager': 'business',
            'marketing manager': 'business',
            'government officer': 'formal',
            'business owner': 'entrepreneur',
            'freelance': 'independent'
        };
        
        const roleStyle = Object.keys(roleStyles).find(k => role.includes(k));
        const style = roleStyle ? roleStyles[roleStyle] : 'professional';
        
        // Determine personality traits for photo characteristics
        const personalityTraits = Object.keys(traits);
        let personalityVibe = 'neutral';
        
        if (personalityTraits.some(t => ['creative', 'artistic', 'innovative'].includes(t.toLowerCase()))) {
            personalityVibe = 'creative';
        } else if (personalityTraits.some(t => ['confident', 'assertive', 'leader'].includes(t.toLowerCase()))) {
            personalityVibe = 'confident';
        } else if (personalityTraits.some(t => ['friendly', 'warm', 'approachable'].includes(t.toLowerCase()))) {
            personalityVibe = 'friendly';
        } else if (personalityTraits.some(t => ['serious', 'focused', 'analytical'].includes(t.toLowerCase()))) {
            personalityVibe = 'serious';
        }
        
        // Generate avatar using multiple strategies with Indian persona focus
        const avatarStrategies = [
            // Strategy 1: Unsplash API for high-quality Indian people photos
            () => {
                const searchQuery = this.generateUnsplashQuery(persona);
                return `https://source.unsplash.com/400x400/?${searchQuery}`;
            },
            
            // Strategy 2: Pexels API for diverse Indian people photos
            () => {
                const searchQuery = this.generatePexelsQuery(persona);
                return `https://images.pexels.com/photos/1/pexels-photo-1.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&fit=crop&crop=face&q=80`;
            },
            
            // Strategy 3: Pixabay API for Indian people photos
            () => {
                const searchQuery = this.generatePixabayQuery(persona);
                return `https://pixabay.com/api/?key=YOUR_PIXABAY_KEY&q=${searchQuery}&image_type=photo&category=people&min_width=400&min_height=400&safesearch=true`;
            },
            
            // Strategy 4: Freepik-style curated Indian persona photos
            () => {
                return this.getFreepikStylePhoto(persona);
            },
            
            // Strategy 5: UI Avatars with personalized styling (fallback)
            () => {
                const bgColor = this.getPersonaBackgroundColor(persona);
                const textColor = this.getPersonaTextColor(persona);
                return `https://ui-avatars.com/api/?name=${encodeURIComponent(persona.name)}&background=${bgColor}&color=${textColor}&size=200&bold=true&format=png`;
            }
        ];
        
        // Use the first strategy as primary, with fallbacks
        try {
            return avatarStrategies[0]();
        } catch (error) {
            console.error('Avatar generation error:', error);
            // Fallback to basic UI Avatars
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(persona.name)}&background=random&color=fff&size=200`;
        }
    }
    
    /**
     * Get persona-specific background color
     */
    static getPersonaBackgroundColor(persona) {
        const role = persona.occupation?.toLowerCase() || persona.role_title?.toLowerCase() || '';
        const traits = persona.traits || {};
        
        // Role-based colors
        if (role.includes('designer') || role.includes('creative')) return 'f97316'; // Orange
        if (role.includes('developer') || role.includes('engineer')) return '3b82f6'; // Blue
        if (role.includes('manager') || role.includes('business')) return '10b981'; // Green
        if (role.includes('government') || role.includes('officer')) return '6b7280'; // Gray
        if (role.includes('freelance') || role.includes('independent')) return '8b5cf6'; // Purple
        
        // Trait-based colors
        const personalityTraits = Object.keys(traits);
        if (personalityTraits.some(t => ['creative', 'artistic'].includes(t.toLowerCase()))) return 'ec4899'; // Pink
        if (personalityTraits.some(t => ['confident', 'leader'].includes(t.toLowerCase()))) return 'dc2626'; // Red
        if (personalityTraits.some(t => ['friendly', 'warm'].includes(t.toLowerCase()))) return '059669'; // Emerald
        if (personalityTraits.some(t => ['serious', 'focused'].includes(t.toLowerCase()))) return '374151'; // Dark Gray
        
        // Default gradient
        return 'random';
    }
    
    /**
     * Get persona-specific text color
     */
    static getPersonaTextColor(persona) {
        const bgColor = this.getPersonaBackgroundColor(persona);
        // Return white for dark backgrounds, dark for light backgrounds
        if (bgColor === 'random') return 'fff';
        return 'fff'; // Default to white
    }
    
    /**
     * Get DiceBear style based on persona
     */
    static getDiceBearStyle(persona) {
        const role = persona.occupation?.toLowerCase() || persona.role_title?.toLowerCase() || '';
        const gender = persona.demographics?.gender?.toLowerCase() || 'neutral';
        
        if (role.includes('designer') || role.includes('creative')) return 'avataaars';
        if (role.includes('developer') || role.includes('engineer')) return 'personas';
        if (role.includes('manager') || role.includes('business')) return 'micah';
        if (role.includes('government') || role.includes('officer')) return 'adventurer';
        
        return gender === 'female' ? 'avataaars' : 'personas';
    }
    
    /**
     * Generate consistent seed for persona
     */
    static generatePersonaSeed(persona) {
        const name = persona.name || 'persona';
        const role = persona.occupation || persona.role_title || '';
        const location = persona.location || '';
        return encodeURIComponent(`${name}-${role}-${location}`.toLowerCase().replace(/\s+/g, '-'));
    }
    
    /**
     * Get Robohash set based on persona
     */
    static getRobohashSet(persona) {
        const role = persona.occupation?.toLowerCase() || persona.role_title?.toLowerCase() || '';
        
        if (role.includes('designer') || role.includes('creative')) return 'set1';
        if (role.includes('developer') || role.includes('engineer')) return 'set2';
        if (role.includes('manager') || role.includes('business')) return 'set3';
        if (role.includes('government') || role.includes('officer')) return 'set4';
        
        return 'set1';
    }
    
    /**
     * Get Robohash background based on persona
     */
    static getRobohashBackground(persona) {
        const traits = persona.traits || {};
        const personalityTraits = Object.keys(traits);
        
        if (personalityTraits.some(t => ['creative', 'artistic'].includes(t.toLowerCase()))) return 'bg1';
        if (personalityTraits.some(t => ['confident', 'leader'].includes(t.toLowerCase()))) return 'bg2';
        if (personalityTraits.some(t => ['friendly', 'warm'].includes(t.toLowerCase()))) return 'bg3';
        
        return 'bg1';
    }
    
    /**
     * Generate Unsplash search query for Indian people photos
     */
    static generateUnsplashQuery(persona) {
        const age = persona.demographics?.age || 30;
        const gender = persona.demographics?.gender?.toLowerCase() || 'neutral';
        const role = persona.occupation?.toLowerCase() || persona.role_title?.toLowerCase() || '';
        const location = persona.location?.toLowerCase() || '';
        
        let query = 'indian people';
        
        // Add age-specific terms
        if (age < 25) query += ', young indian';
        else if (age > 50) query += ', mature indian';
        else query += ', indian adult';
        
        // Add gender-specific terms
        if (gender === 'male' || gender === 'm') query += ', indian man';
        else if (gender === 'female' || gender === 'f') query += ', indian woman';
        
        // Add role-specific terms
        if (role.includes('designer') || role.includes('creative')) query += ', indian creative professional';
        else if (role.includes('developer') || role.includes('engineer')) query += ', indian tech professional';
        else if (role.includes('manager') || role.includes('business')) query += ', indian business professional';
        else if (role.includes('government') || role.includes('officer')) query += ', indian formal professional';
        else if (role.includes('freelance') || role.includes('independent')) query += ', indian freelancer';
        
        // Add location-specific terms
        if (location.includes('delhi') || location.includes('mumbai') || location.includes('bangalore')) {
            query += ', urban indian professional';
        } else if (location.includes('punjab') || location.includes('tamil') || location.includes('gujarat')) {
            query += ', indian regional professional';
        }
        
        return encodeURIComponent(query);
    }
    
    /**
     * Generate Pexels search query for Indian people photos
     */
    static generatePexelsQuery(persona) {
        const age = persona.demographics?.age || 30;
        const gender = persona.demographics?.gender?.toLowerCase() || 'neutral';
        const role = persona.occupation?.toLowerCase() || persona.role_title?.toLowerCase() || '';
        
        let query = 'indian people';
        
        // Add age and gender
        if (age < 30) query += gender === 'female' ? ' young indian woman' : ' young indian man';
        else if (age > 45) query += gender === 'female' ? ' mature indian woman' : ' mature indian man';
        else query += gender === 'female' ? ' indian woman' : ' indian man';
        
        // Add professional context
        if (role.includes('designer')) query += ' creative professional';
        else if (role.includes('developer')) query += ' tech professional';
        else if (role.includes('manager')) query += ' business professional';
        else if (role.includes('government')) query += ' formal professional';
        
        return encodeURIComponent(query);
    }
    
    /**
     * Generate Pixabay search query for Indian people photos
     */
    static generatePixabayQuery(persona) {
        const age = persona.demographics?.age || 30;
        const gender = persona.demographics?.gender?.toLowerCase() || 'neutral';
        const role = persona.occupation?.toLowerCase() || persona.role_title?.toLowerCase() || '';
        
        let query = 'indian people';
        
        // Add demographic details
        if (age < 25) query += ' young';
        else if (age > 50) query += ' mature';
        
        if (gender === 'male' || gender === 'm') query += ' man';
        else if (gender === 'female' || gender === 'f') query += ' woman';
        
        // Add professional context
        if (role.includes('professional')) query += ' professional';
        if (role.includes('business')) query += ' business';
        if (role.includes('tech')) query += ' technology';
        
        return encodeURIComponent(query);
    }
    
    /**
     * Get Freepik-style curated Indian persona photos
     */
    static getFreepikStylePhoto(persona) {
        const age = persona.demographics?.age || 30;
        const gender = persona.demographics?.gender?.toLowerCase() || 'neutral';
        const role = persona.occupation?.toLowerCase() || persona.role_title?.toLowerCase() || '';
        
        // Curated photo URLs based on persona characteristics
        const photoSets = {
            // Young professionals
            'young-male-professional': [
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
                'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face'
            ],
            'young-female-professional': [
                'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
                'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
                'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face'
            ],
            // Mature professionals
            'mature-male-professional': [
                'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face',
                'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
                'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'
            ],
            'mature-female-professional': [
                'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face',
                'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
                'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face'
            ]
        };
        
        // Determine photo set based on persona
        let photoSet = 'young-male-professional'; // default
        
        if (age < 30) {
            photoSet = gender === 'female' ? 'young-female-professional' : 'young-male-professional';
        } else {
            photoSet = gender === 'female' ? 'mature-female-professional' : 'mature-male-professional';
        }
        
        // Select random photo from the set
        const photos = photoSets[photoSet] || photoSets['young-male-professional'];
        const randomIndex = Math.floor(Math.random() * photos.length);
        
        return photos[randomIndex];
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
