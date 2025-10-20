/**
 * Comprehensive Agent Enrichment Script v2
 * Populates ALL agents in ai_agents table with rich, diverse, human-like persona data
 * Ensures maximum diversity with all permutations of demographics, personalities, and backgrounds
 * 
 * DO NOT MODIFY THIS SCRIPT UNLESS EXPLICITLY REQUESTED
 * This script protects against data loss by only updating NULL fields
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'arun.murugesan',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'avinci',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 5432,
});

// Diverse Indian names, locations, and backgrounds
const INDIAN_DEMOGRAPHICS = {
    male_names: ['Aditya', 'Amit', 'Arjun', 'Deepak', 'Karthik', 'Manoj', 'Nikhil', 'Pranav', 'Rahul', 'Rohit', 'Sanjay', 'Varun', 'Vijay', 'Vivek'],
    female_names: ['Ananya', 'Divya', 'Kavya', 'Meera', 'Neha', 'Priya', 'Rashmi', 'Riya', 'Shreya', 'Simran', 'Sneha', 'Tanvi'],
    cities: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Chandigarh', 'Indore'],
    regions: ['Maharashtra', 'Karnataka', 'Tamil Nadu', 'Telangana', 'Gujarat', 'Rajasthan', 'West Bengal', 'Uttar Pradesh', 'Punjab', 'Madhya Pradesh'],
    occupations: [
        'Software Engineer', 'Product Manager', 'Data Analyst', 'UX Designer', 'Marketing Manager',
        'Financial Analyst', 'Business Consultant', 'Sales Executive', 'Operations Manager', 'HR Manager',
        'Content Writer', 'Digital Marketer', 'Startup Founder', 'Research Scientist', 'Teacher',
        'Graphic Designer', 'Mobile Developer', 'DevOps Engineer', 'Accountant', 'Real Estate Agent'
    ],
    companies: [
        'Infosys', 'TCS', 'Wipro', 'Tech Mahindra', 'HCL', 'Flipkart', 'Amazon India', 'Google India',
        'Microsoft India', 'Accenture', 'Cognizant', 'Paytm', 'Zomato', 'Swiggy', 'ICICI Bank',
        'HDFC Bank', 'Reliance', 'Tata Consultancy', 'Myntra', 'PhonePe'
    ],
    education: ['B.Tech', 'MBA', 'M.Tech', 'BCA', 'MCA', 'B.Com', 'M.Com', 'BA', 'MA', 'PhD'],
    income_ranges: ['₹3-6 LPA', '₹6-12 LPA', '₹12-20 LPA', '₹20-35 LPA', '₹35-50 LPA', '₹50+ LPA']
};

// Personality archetypes with detailed traits
const PERSONALITY_ARCHETYPES = {
    'The Pragmatist': {
        traits: ['practical', 'logical', 'detail-oriented', 'efficient', 'results-driven'],
        communication: 'direct and to-the-point',
        decision_style: 'data-driven and analytical',
        stress_response: 'focuses on problem-solving'
    },
    'The Visionary': {
        traits: ['creative', 'innovative', 'big-picture thinker', 'optimistic', 'inspiring'],
        communication: 'enthusiastic and expressive',
        decision_style: 'intuitive with long-term focus',
        stress_response: 'seeks new perspectives'
    },
    'The Empath': {
        traits: ['compassionate', 'understanding', 'collaborative', 'patient', 'supportive'],
        communication: 'warm and encouraging',
        decision_style: 'considers impact on people',
        stress_response: 'seeks emotional support'
    },
    'The Achiever': {
        traits: ['ambitious', 'competitive', 'goal-oriented', 'persistent', 'confident'],
        communication: 'assertive and clear',
        decision_style: 'outcome-focused',
        stress_response: 'pushes harder'
    },
    'The Analyst': {
        traits: ['methodical', 'thorough', 'cautious', 'precise', 'systematic'],
        communication: 'formal and structured',
        decision_style: 'carefully evaluates all options',
        stress_response: 'seeks more information'
    },
    'The Collaborator': {
        traits: ['team-oriented', 'diplomatic', 'flexible', 'communicative', 'inclusive'],
        communication: 'open and consultative',
        decision_style: 'seeks consensus',
        stress_response: 'relies on team support'
    }
};

// Tech savviness levels with detailed profiles
const TECH_PROFILES = {
    'expert': {
        level: 'expert',
        comfortable_with: ['APIs', 'cloud platforms', 'databases', 'automation', 'DevOps', 'AI/ML'],
        learns: 'quickly adopts new tech',
        troubleshoots: 'independently solves complex issues',
        vocabulary: 'uses technical jargon naturally'
    },
    'high': {
        level: 'high',
        comfortable_with: ['SaaS tools', 'productivity apps', 'basic coding', 'digital workflows'],
        learns: 'eager to try new tools',
        troubleshoots: 'can solve most issues with documentation',
        vocabulary: 'understands tech concepts'
    },
    'medium': {
        level: 'medium',
        comfortable_with: ['common apps', 'email', 'social media', 'basic office tools'],
        learns: 'needs guidance for new tools',
        troubleshoots: 'requires support for technical issues',
        vocabulary: 'uses basic tech terms'
    },
    'low': {
        level: 'low',
        comfortable_with: ['WhatsApp', 'basic phone apps', 'familiar interfaces only'],
        learns: 'resistant to new technology',
        troubleshoots: 'struggles with technical problems',
        vocabulary: 'avoids technical terminology'
    }
};

// Communication styles with speech patterns
const COMMUNICATION_STYLES = {
    'formal': {
        sentence_length: 'long, complex sentences',
        formality: 'uses formal language, proper grammar',
        filler_words: ['actually', 'specifically', 'essentially', 'fundamentally'],
        common_phrases: ['In my opinion', 'Based on my experience', 'Let me clarify'],
        question_style: 'asks detailed, specific questions',
        self_corrections: 'rare, speaks carefully'
    },
    'casual': {
        sentence_length: 'short, conversational',
        formality: 'relaxed, uses contractions',
        filler_words: ['like', 'you know', 'basically', 'kind of'],
        common_phrases: ['I mean', 'Right?', 'Got it'],
        question_style: 'asks simple, direct questions',
        self_corrections: 'frequent, thinks out loud'
    },
    'enthusiastic': {
        sentence_length: 'medium, expressive',
        formality: 'energetic, uses exclamations',
        filler_words: ['absolutely', 'definitely', 'totally', 'really'],
        common_phrases: ['That\'s amazing!', 'Love it!', 'Can\'t wait to'],
        question_style: 'asks excited, curious questions',
        self_corrections: 'interrupts self with new ideas'
    },
    'reserved': {
        sentence_length: 'short, measured',
        formality: 'polite but minimal',
        filler_words: ['perhaps', 'maybe', 'possibly', 'I think'],
        common_phrases: ['If I may', 'Excuse me', 'Thank you'],
        question_style: 'asks cautious, clarifying questions',
        self_corrections: 'pauses before speaking'
    }
};

// Financial domain expertise levels
const FINANCIAL_LITERACY_LEVELS = {
    'expert': {
        confident: ['equity markets', 'derivatives', 'portfolio management', 'tax optimization', 'financial planning', 'investment strategies'],
        partial: ['cryptocurrency', 'international markets', 'alternative investments'],
        unknown: []
    },
    'high': {
        confident: ['stocks', 'mutual funds', 'SIPs', 'fixed deposits', 'basic tax planning'],
        partial: ['derivatives', 'portfolio rebalancing', 'advanced tax strategies'],
        unknown: ['cryptocurrency', 'alternative investments', 'complex derivatives']
    },
    'medium': {
        confident: ['savings accounts', 'fixed deposits', 'basic loans'],
        partial: ['stocks', 'mutual funds', 'insurance', 'credit cards'],
        unknown: ['derivatives', 'portfolio management', 'tax optimization', 'investment strategies']
    },
    'low': {
        confident: ['savings', 'ATM usage', 'basic transactions'],
        partial: ['loans', 'insurance', 'credit cards'],
        unknown: ['stocks', 'mutual funds', 'tax planning', 'investment strategies', 'portfolio management']
    }
};

// Life stages with unique motivations and concerns
const LIFE_STAGES = {
    'early_career': {
        age_range: [22, 28],
        family_status: ['single', 'single', 'single', 'newly married'],
        objectives: ['building career', 'skill development', 'work-life balance', 'saving for future'],
        needs: ['career growth', 'learning opportunities', 'financial stability', 'social connections'],
        fears: ['job insecurity', 'falling behind peers', 'missing opportunities', 'making wrong choices'],
        motivations: ['growth', 'recognition', 'independence', 'experiences']
    },
    'mid_career': {
        age_range: [29, 40],
        family_status: ['married', 'married with 1 child', 'married with 2 children', 'single'],
        objectives: ['career advancement', 'wealth building', 'family security', 'work-life balance'],
        needs: ['higher income', 'stability', 'good benefits', 'flexibility'],
        fears: ['career stagnation', 'financial burden', 'missing family time', 'health issues'],
        motivations: ['security', 'providing for family', 'status', 'legacy']
    },
    'established': {
        age_range: [41, 55],
        family_status: ['married with children', 'married with grown children', 'divorced', 'single'],
        objectives: ['wealth preservation', 'retirement planning', 'children\'s education', 'maintaining lifestyle'],
        needs: ['financial security', 'respect', 'purpose', 'health'],
        fears: ['retirement inadequacy', 'health problems', 'losing relevance', 'children\'s future'],
        motivations: ['legacy', 'stability', 'mentorship', 'giving back']
    }
};

// Generate comprehensive persona data
function generateComprehensivePersona(baseData = {}) {
    const gender = baseData.gender || (Math.random() > 0.5 ? 'male' : 'female');
    const nameList = gender === 'male' ? INDIAN_DEMOGRAPHICS.male_names : INDIAN_DEMOGRAPHICS.female_names;
    const name = baseData.name || nameList[Math.floor(Math.random() * nameList.length)];
    
    // Select life stage
    const lifeStage = Object.values(LIFE_STAGES)[Math.floor(Math.random() * Object.values(LIFE_STAGES).length)];
    const age = baseData.age || (lifeStage.age_range[0] + Math.floor(Math.random() * (lifeStage.age_range[1] - lifeStage.age_range[0])));
    
    // Select personality
    const personalityTypes = Object.keys(PERSONALITY_ARCHETYPES);
    const personalityType = personalityTypes[Math.floor(Math.random() * personalityTypes.length)];
    const personality = PERSONALITY_ARCHETYPES[personalityType];
    
    // Select tech level
    const techLevels = ['expert', 'high', 'medium', 'low'];
    const techLevel = techLevels[Math.floor(Math.random() * techLevels.length)];
    const techProfile = TECH_PROFILES[techLevel];
    
    // Select communication style
    const commStyles = Object.keys(COMMUNICATION_STYLES);
    const commStyle = commStyles[Math.floor(Math.random() * commStyles.length)];
    const communication = COMMUNICATION_STYLES[commStyle];
    
    // Select financial literacy
    const finLevels = ['expert', 'high', 'medium', 'low'];
    const finLevel = finLevels[Math.floor(Math.random() * finLevels.length)];
    const finLiteracy = FINANCIAL_LITERACY_LEVELS[finLevel];
    
    // Build complete persona
    const city = INDIAN_DEMOGRAPHICS.cities[Math.floor(Math.random() * INDIAN_DEMOGRAPHICS.cities.length)];
    const region = INDIAN_DEMOGRAPHICS.regions[Math.floor(Math.random() * INDIAN_DEMOGRAPHICS.regions.length)];
    const occupation = INDIAN_DEMOGRAPHICS.occupations[Math.floor(Math.random() * INDIAN_DEMOGRAPHICS.occupations.length)];
    const company = INDIAN_DEMOGRAPHICS.companies[Math.floor(Math.random() * INDIAN_DEMOGRAPHICS.companies.length)];
    const education = INDIAN_DEMOGRAPHICS.education[Math.floor(Math.random() * INDIAN_DEMOGRAPHICS.education.length)];
    const income = INDIAN_DEMOGRAPHICS.income_ranges[Math.floor(Math.random() * INDIAN_DEMOGRAPHICS.income_ranges.length)];
    const familyStatus = lifeStage.family_status[Math.floor(Math.random() * lifeStage.family_status.length)];
    
    // Generate unique avatar from diverse sources
    const avatarSources = [
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}-${age}`,
        `https://i.pravatar.cc/300?u=${name}-${occupation}`,
        `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=300`
    ];
    const avatar_url = avatarSources[Math.floor(Math.random() * avatarSources.length)];
    
    // Generate quote
    const quotes = [
        `"${personality.decision_style} has always guided my career choices."`,
        `"In ${city}, I've learned that ${personality.traits[0]} and ${personality.traits[1]} are key to success."`,
        `"My goal is to ${lifeStage.objectives[0]} while staying ${personality.traits[0]}."`,
        `"I believe in ${personality.communication} approach to problem-solving."`
    ];
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    
    return {
        name,
        age,
        gender,
        occupation,
        employment_type: company,
        location: `${city}, ${region}`,
        avatar_url,
        demographics: {
            age,
            gender,
            education,
            income_range: income,
            family_status: familyStatus,
            city,
            region
        },
        personality: personalityType,
        goals: lifeStage.objectives,
        pain_points: lifeStage.fears,
        motivations: lifeStage.motivations,
        background_story: `${name} is a ${age}-year-old ${occupation} working at ${company} in ${city}. ${gender === 'male' ? 'He' : 'She'} is ${personality.traits[0]} and ${personality.traits[1]}, with a ${commStyle} communication style. ${gender === 'male' ? 'His' : 'Her'} main focus is on ${lifeStage.objectives[0]}.`,
        tone: personality.communication,
        conversation_style: communication.formality,
        sample_quote: quote,
        tech_savviness: techLevel,
        domain_literacy: {
            finance: finLevel,
            digital_banking: techLevel === 'expert' || techLevel === 'high' ? 'high' : 'medium'
        },
        communication_style: {
            sentence_length: communication.sentence_length,
            formality: communication.formality,
            question_style: communication.question_style
        },
        speech_patterns: {
            filler_words: communication.filler_words,
            common_phrases: communication.common_phrases,
            self_corrections: communication.self_corrections
        },
        vocabulary_profile: {
            complexity: techLevel === 'expert' ? 8 : techLevel === 'high' ? 6 : techLevel === 'medium' ? 4 : 2,
            technical_comfort: techProfile.vocabulary,
            common_words: communication.common_phrases
        },
        emotional_profile: {
            baseline: personality.traits[0],
            stress_response: personality.stress_response,
            frustration_triggers: lifeStage.fears,
            excitement_triggers: lifeStage.motivations
        },
        cognitive_profile: {
            comprehension_speed: techLevel === 'expert' ? 'fast' : techLevel === 'high' ? 'above_average' : techLevel === 'medium' ? 'average' : 'slow',
            patience: Math.floor(Math.random() * 5) + 5,
            learning_style: personality.decision_style
        },
        knowledge_bounds: {
            confident: finLiteracy.confident,
            partial: finLiteracy.partial,
            unknown: finLiteracy.unknown
        }
    };
}

// Main enrichment function
async function enrichAllAgents() {
    const client = await pool.connect();
    
    try {
        console.log('\n🚀 Starting Comprehensive Agent Enrichment...\n');
        
        // Get all agents from ai_agents table
        const result = await client.query('SELECT * FROM ai_agents WHERE is_active = true ORDER BY created_at ASC');
        const agents = result.rows;
        
        console.log(`📊 Found ${agents.length} agents to enrich\n`);
        
        if (agents.length === 0) {
            console.log('⚠️  No agents found in ai_agents table. Creating sample diverse agents...\n');
            
            // Create 30 diverse sample agents
            for (let i = 0; i < 30; i++) {
                const persona = generateComprehensivePersona();
                
                await client.query(`
                    INSERT INTO ai_agents (
                        name, age, gender, occupation, employment_type, location,
                        avatar_url, demographics, personality, goals, pain_points,
                        motivations, background_story, tone, conversation_style,
                        sample_quote, tech_savviness, domain_literacy,
                        communication_style, speech_patterns, vocabulary_profile,
                        emotional_profile, cognitive_profile, knowledge_bounds,
                        is_active
                    ) VALUES (
                        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
                        $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25
                    )
                `, [
                    persona.name, persona.age, persona.gender, persona.occupation,
                    persona.employment_type, persona.location, persona.avatar_url,
                    JSON.stringify(persona.demographics), persona.personality,
                    persona.goals, persona.pain_points, persona.motivations,
                    persona.background_story, persona.tone, persona.conversation_style,
                    persona.sample_quote, persona.tech_savviness,
                    JSON.stringify(persona.domain_literacy),
                    JSON.stringify(persona.communication_style),
                    JSON.stringify(persona.speech_patterns),
                    JSON.stringify(persona.vocabulary_profile),
                    JSON.stringify(persona.emotional_profile),
                    JSON.stringify(persona.cognitive_profile),
                    JSON.stringify(persona.knowledge_bounds),
                    true
                ]);
                
                console.log(`✅ Created agent ${i + 1}/30: ${persona.name} - ${persona.occupation}`);
            }
            
            console.log('\n🎉 Successfully created 30 diverse agents!\n');
            return;
        }
        
        // Enrich existing agents
        let enrichedCount = 0;
        
        for (const agent of agents) {
            try {
                // Only enrich if persona data is missing or incomplete
                const needsEnrichment = !agent.demographics || !agent.background_story || 
                                       !agent.communication_style || !agent.tech_savviness;
                
                if (!needsEnrichment) {
                    console.log(`⏭️  Skipping ${agent.name} - already enriched`);
                    continue;
                }
                
                // Generate comprehensive persona while preserving existing data
                const baseData = {
                    name: agent.name,
                    age: agent.age,
                    gender: agent.gender
                };
                
                const persona = generateComprehensivePersona(baseData);
                
                // Update agent with rich persona data (only update NULL/empty fields)
                await client.query(`
                    UPDATE ai_agents SET
                        occupation = COALESCE(occupation, $1),
                        employment_type = COALESCE(employment_type, $2),
                        location = COALESCE(location, $3),
                        avatar_url = COALESCE(avatar_url, $4),
                        demographics = COALESCE(demographics, $5),
                        personality = COALESCE(personality, $6),
                        goals = COALESCE(goals, $7),
                        pain_points = COALESCE(pain_points, $8),
                        motivations = COALESCE(motivations, $9),
                        background_story = COALESCE(background_story, $10),
                        tone = COALESCE(tone, $11),
                        conversation_style = COALESCE(conversation_style, $12),
                        sample_quote = COALESCE(sample_quote, $13),
                        tech_savviness = COALESCE(tech_savviness, $14),
                        domain_literacy = COALESCE(domain_literacy, $15),
                        communication_style = COALESCE(communication_style, $16),
                        speech_patterns = COALESCE(speech_patterns, $17),
                        vocabulary_profile = COALESCE(vocabulary_profile, $18),
                        emotional_profile = COALESCE(emotional_profile, $19),
                        cognitive_profile = COALESCE(cognitive_profile, $20),
                        knowledge_bounds = COALESCE(knowledge_bounds, $21),
                        updated_at = NOW()
                    WHERE id = $22
                `, [
                    persona.occupation, persona.employment_type, persona.location,
                    persona.avatar_url, JSON.stringify(persona.demographics),
                    persona.personality, persona.goals, persona.pain_points,
                    persona.motivations, persona.background_story, persona.tone,
                    persona.conversation_style, persona.sample_quote,
                    persona.tech_savviness, JSON.stringify(persona.domain_literacy),
                    JSON.stringify(persona.communication_style),
                    JSON.stringify(persona.speech_patterns),
                    JSON.stringify(persona.vocabulary_profile),
                    JSON.stringify(persona.emotional_profile),
                    JSON.stringify(persona.cognitive_profile),
                    JSON.stringify(persona.knowledge_bounds),
                    agent.id
                ]);
                
                enrichedCount++;
                console.log(`✅ Enriched ${enrichedCount}/${agents.length}: ${persona.name} - ${persona.occupation} (${persona.personality})`);
                
            } catch (error) {
                console.error(`❌ Failed to enrich agent ${agent.name}:`, error.message);
            }
        }
        
        console.log(`\n🎉 Successfully enriched ${enrichedCount} agents with comprehensive persona data!\n`);
        console.log('📋 Enrichment Summary:');
        console.log(`   - Total agents: ${agents.length}`);
        console.log(`   - Enriched: ${enrichedCount}`);
        console.log(`   - Skipped: ${agents.length - enrichedCount}`);
        console.log('\n✅ All agent data is now persistent and protected from loss.');
        console.log('⚠️  DO NOT modify agent data unless explicitly requested.\n');
        
    } catch (error) {
        console.error('❌ Enrichment failed:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Run enrichment
enrichAllAgents()
    .then(() => {
        console.log('✅ Enrichment complete!');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Enrichment failed:', error);
        process.exit(1);
    });




