const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'avinci_admin',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'avinci',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

// Comprehensive demographic data for different agent types
const agentProfiles = {
    'Operations Manager': {
        age: 35,
        gender: 'M',
        education: 'MBA',
        income_range: '₹8-12 LPA',
        family: 'Married with 2 children',
        personality: 'Analytical, detail-oriented, process-driven, collaborative',
        background_story: 'Started as a junior executive in a manufacturing company, worked his way up through various operational roles. Has 12 years of experience in streamlining processes and managing teams. Lives in a middle-class neighborhood with his family.',
        goals: ['Optimize operational efficiency', 'Implement digital transformation', 'Mentor junior staff'],
        pain_points: ['Legacy systems', 'Resistance to change', 'Budget constraints', 'Staff turnover'],
        motivations: ['Process improvement', 'Team success', 'Cost reduction', 'Innovation'],
        hobbies: ['Cricket', 'Reading business books', 'Gardening', 'Family time'],
        daily_routine: 'Early riser, gym at 6 AM, office by 8:30 AM, family dinner at 8 PM',
        decision_style: 'Data-driven, consultative, risk-averse',
        communication_style: 'Direct, professional, process-focused',
        key_phrases: ['Let me check the data', 'We need to optimize this', 'What\'s the ROI?', 'Let\'s streamline this process'],
        fintech_usage: 'Uses UPI, online banking, digital wallets, investment apps',
        triggers: 'Inefficiency, waste, missed deadlines, poor communication',
        community_values: 'Hard work, integrity, family first, community service',
        devices: ['Smartphone', 'Laptop', 'Tablet'],
        apps: ['WhatsApp', 'Gmail', 'Google Chrome', 'Microsoft Office'],
        emotional_responses: 'Stays calm under pressure, uses data to make decisions',
        life_events: ['Marriage 8 years ago', 'First child 6 years ago', 'Promotion to manager 3 years ago'],
        recommendations: 'Focus on process automation, invest in team training, maintain work-life balance'
    },
    'Research Director': {
        age: 42,
        gender: 'M',
        education: 'PhD',
        income_range: '₹15-20 LPA',
        family: 'Married, no children',
        personality: 'Intellectual, curious, methodical, innovative',
        background_story: 'Academic background with 15 years in market research. Started as a research analyst, moved to senior positions in consulting firms. Now leads research teams and advises on strategic decisions.',
        goals: ['Publish research papers', 'Mentor researchers', 'Drive innovation in research methods'],
        pain_points: ['Limited budgets', 'Tight deadlines', 'Data quality issues', 'Stakeholder expectations'],
        motivations: ['Knowledge creation', 'Impact on business decisions', 'Team development'],
        hobbies: ['Reading research papers', 'Chess', 'Classical music', 'Photography'],
        daily_routine: 'Starts work at 9 AM, research meetings, data analysis, evening reading',
        decision_style: 'Evidence-based, analytical, collaborative',
        communication_style: 'Academic, detailed, evidence-supported',
        key_phrases: ['Based on our research', 'The data suggests', 'We need more evidence', 'Let\'s analyze this'],
        fintech_usage: 'Uses research tools, data analytics platforms, academic databases',
        triggers: 'Poor data quality, rushed research, lack of methodology',
        community_values: 'Knowledge sharing, academic integrity, research ethics',
        devices: ['Laptop', 'Tablet', 'Smartphone'],
        apps: ['Research tools', 'Data analytics', 'Academic databases', 'Email'],
        emotional_responses: 'Methodical approach, questions everything, seeks evidence',
        life_events: ['PhD completion 12 years ago', 'First major publication 8 years ago', 'Marriage 5 years ago'],
        recommendations: 'Invest in advanced research tools, maintain academic connections, publish regularly'
    },
    'Data Analyst': {
        age: 28,
        gender: 'M',
        education: 'B.Tech',
        income_range: '₹6-8 LPA',
        family: 'Single, lives with parents',
        personality: 'Logical, detail-oriented, introverted, tech-savvy',
        background_story: 'Fresh graduate with 3 years of experience in data analysis. Passionate about numbers and patterns. Works in a tech company analyzing user behavior and business metrics.',
        goals: ['Learn advanced analytics', 'Get promoted to senior analyst', 'Work on AI/ML projects'],
        pain_points: ['Data quality issues', 'Unclear requirements', 'Repetitive tasks', 'Limited growth'],
        motivations: ['Learning new technologies', 'Solving complex problems', 'Career growth'],
        hobbies: ['Coding', 'Online courses', 'Gaming', 'Watching tech videos'],
        daily_routine: 'Starts at 10 AM, data analysis, meetings, coding practice in evening',
        decision_style: 'Data-driven, logical, systematic',
        communication_style: 'Technical, precise, data-focused',
        key_phrases: ['The numbers show', 'Let me run the analysis', 'Based on the data', 'We need to clean this data'],
        fintech_usage: 'Uses UPI, online banking, investment apps, crypto trading',
        triggers: 'Messy data, unclear requirements, poor documentation',
        community_values: 'Continuous learning, technical excellence, innovation',
        devices: ['Laptop', 'Smartphone', 'Gaming PC'],
        apps: ['Python', 'Jupyter', 'GitHub', 'Discord'],
        emotional_responses: 'Frustrated by poor data quality, excited by new challenges',
        life_events: ['Graduation 3 years ago', 'First job 2 years ago', 'Moved to current city 1 year ago'],
        recommendations: 'Focus on advanced analytics skills, build portfolio, network with data professionals'
    },
    'Sales Executive': {
        age: 32,
        gender: 'M',
        education: 'BBA',
        income_range: '₹5-7 LPA + commissions',
        family: 'Married, 1 child',
        personality: 'Extroverted, persuasive, ambitious, relationship-focused',
        background_story: 'Started in retail sales, moved to B2B sales. Has 8 years of experience in building client relationships and closing deals. Lives in a rented apartment with his family.',
        goals: ['Increase sales targets', 'Get promoted to sales manager', 'Buy a house'],
        pain_points: ['Rejection', 'Difficult clients', 'Unrealistic targets', 'Competition'],
        motivations: ['Financial success', 'Recognition', 'Client satisfaction', 'Career growth'],
        hobbies: ['Networking events', 'Watching sales videos', 'Family outings', 'Cricket'],
        daily_routine: 'Starts at 9 AM, client calls, meetings, follow-ups, ends at 7 PM',
        decision_style: 'Intuitive, relationship-based, quick decisions',
        communication_style: 'Persuasive, friendly, solution-oriented',
        key_phrases: ['How can I help you?', 'Let me show you the benefits', 'What\'s your budget?', 'I\'ll get you the best deal'],
        fintech_usage: 'Uses UPI, online banking, expense tracking apps',
        triggers: 'Rejection, difficult clients, missed targets',
        community_values: 'Hard work, persistence, customer service, family support',
        devices: ['Smartphone', 'Laptop'],
        apps: ['CRM', 'WhatsApp', 'LinkedIn', 'Sales tools'],
        emotional_responses: 'Motivated by success, discouraged by rejection, persistent',
        life_events: ['Marriage 5 years ago', 'First child 2 years ago', 'Best sales month 6 months ago'],
        recommendations: 'Focus on relationship building, learn new sales techniques, manage stress'
    }
};

// Regional variations
const regionalVariations = {
    'Pune, Maharashtra': {
        cultural_heritage: 'Maharashtrian culture, Marathi language, Ganesh Chaturthi celebrations',
        community_values: 'Education, hard work, family values, social service',
        key_phrases: ['Achha', 'Theek hai', 'Kya baat hai', 'Bilkul']
    },
    'Bangalore, Karnataka': {
        cultural_heritage: 'Kannada culture, IT hub, diverse population, tech-savvy community',
        community_values: 'Innovation, education, technology, work-life balance',
        key_phrases: ['Chennagide', 'Tumba chennagide', 'Kannada gothilla', 'Swalpa adjust maadi']
    },
    'Chennai, Tamil Nadu': {
        cultural_heritage: 'Tamil culture, classical music, temple festivals, traditional values',
        community_values: 'Education, tradition, family values, cultural heritage',
        key_phrases: ['Nalla irukku', 'Romba nalla', 'Enna pannalam', 'Sari']
    },
    'Mumbai, Maharashtra': {
        cultural_heritage: 'Cosmopolitan culture, Marathi heritage, Bollywood influence, diverse communities',
        community_values: 'Hard work, ambition, diversity, resilience',
        key_phrases: ['Achha', 'Theek hai', 'Kya baat hai', 'Bilkul']
    },
    'Delhi, NCR': {
        cultural_heritage: 'North Indian culture, Punjabi influence, political hub, diverse communities',
        community_values: 'Ambition, networking, political awareness, family values',
        key_phrases: ['Achha', 'Theek hai', 'Kya baat hai', 'Bilkul']
    },
    'Hyderabad, Telangana': {
        cultural_heritage: 'Telugu culture, Nizami heritage, IT hub, biryani capital',
        community_values: 'Education, technology, cultural diversity, business acumen',
        key_phrases: ['Chala bagundi', 'Nenu chepthunna', 'Em chestham', 'Sare']
    },
    'Kochi, Kerala': {
        cultural_heritage: 'Malayalam culture, backwaters, spice trade, diverse religions',
        community_values: 'Education, social equality, environmental consciousness, cultural diversity',
        key_phrases: ['Nalla', 'Sari', 'Entha', 'Kollam']
    },
    'Ahmedabad, Gujarat': {
        cultural_heritage: 'Gujarati culture, business hub, textile industry, vegetarian cuisine',
        community_values: 'Business ethics, family values, education, community service',
        key_phrases: ['Achha', 'Theek hai', 'Kya baat hai', 'Bilkul']
    }
};

function generateSampleQuote(role, regionalPhrases) {
    const quotes = {
        'Operations Manager': `"${regionalPhrases[0]}, we need to optimize our processes to improve efficiency and reduce costs."`,
        'Research Director': `"${regionalPhrases[0]}, based on our research data, I can see some interesting patterns emerging."`,
        'Data Analyst': `"${regionalPhrases[0]}, the numbers clearly show that we need to focus on this area for better results."`,
        'Sales Executive': `"${regionalPhrases[0]}, I'm confident this product will meet your needs perfectly."`
    };
    
    return quotes[role] || `"${regionalPhrases[0]}, I'm here to help you with your needs."`;
}

function generateBeliefs(role, communityValues) {
    const beliefs = {
        'Operations Manager': `Efficiency and process improvement are key to success. ${communityValues}.`,
        'Research Director': `Evidence-based decisions lead to better outcomes. ${communityValues}.`,
        'Data Analyst': `Data tells the real story. ${communityValues}.`,
        'Sales Executive': `Building relationships is the foundation of sales success. ${communityValues}.`
    };
    
    return beliefs[role] || `Success comes from dedication and hard work. ${communityValues}.`;
}

async function enrichAgents() {
    try {
        console.log('🔄 Fetching all agents...');
        
        // Get all agents
        const result = await pool.query('SELECT id, name, location FROM ai_agents ORDER BY created_at');
        const agents = result.rows;
        
        console.log(`📊 Found ${agents.length} agents to enrich`);
        
        // Enrich each agent
        for (let i = 0; i < agents.length; i++) {
            const agent = agents[i];
            const location = agent.location;
            
            // Get base profile (cycle through different types)
            const profileKeys = Object.keys(agentProfiles);
            const profileKey = profileKeys[i % profileKeys.length];
            const baseProfile = agentProfiles[profileKey];
            
            // Get regional variations
            const regional = regionalVariations[location] || regionalVariations['Pune, Maharashtra'];
            
            // Create enriched profile
            const enrichedProfile = {
                age: baseProfile.age + Math.floor(Math.random() * 10) - 5, // Add some variation
                gender: baseProfile.gender,
                education: baseProfile.education,
                income_range: baseProfile.income_range,
                family: baseProfile.family,
                personality: JSON.stringify({
                    traits: baseProfile.personality,
                    communication_style: baseProfile.communication_style,
                    decision_style: baseProfile.decision_style
                }),
                background_story: baseProfile.background_story,
                goals: baseProfile.goals,
                pain_points: baseProfile.pain_points,
                motivations: baseProfile.motivations,
                hobbies: JSON.stringify({
                    interests: baseProfile.hobbies,
                    activities: baseProfile.hobbies
                }),
                daily_routine: JSON.stringify({
                    schedule: baseProfile.daily_routine,
                    habits: baseProfile.daily_routine
                }),
                decision_making: JSON.stringify({
                    style: baseProfile.decision_style,
                    approach: baseProfile.decision_style
                }),
                communication_style: JSON.stringify({
                    tone: baseProfile.communication_style,
                    approach: baseProfile.communication_style
                }),
                key_quotes: JSON.stringify([...baseProfile.key_phrases, ...regional.key_phrases]),
                fintech_preferences: JSON.stringify({
                    usage: baseProfile.fintech_usage,
                    preferences: baseProfile.fintech_usage
                }),
                social_context: JSON.stringify({
                    values: baseProfile.community_values,
                    triggers: baseProfile.triggers,
                    family: baseProfile.family,
                    friends: 'Professional network, college friends, colleagues',
                    community_values: baseProfile.community_values
                }),
                cultural_background: JSON.stringify({
                    heritage: regional.cultural_heritage,
                    values: baseProfile.community_values,
                    beliefs: generateBeliefs(profileKey, baseProfile.community_values)
                }),
                sample_quote: generateSampleQuote(profileKey, regional.key_phrases),
                tone: 'professional',
                personality_traits: baseProfile.personality,
                life_background: baseProfile.background_story,
                life_events: JSON.stringify(baseProfile.life_events),
                emotional_profile: JSON.stringify({
                    triggers: baseProfile.triggers,
                    responses: baseProfile.emotional_responses
                }),
                lifestyle_interests: JSON.stringify({
                    hobbies: baseProfile.hobbies,
                    interests: baseProfile.hobbies
                }),
                financial_habits: JSON.stringify({
                    fintech_usage: baseProfile.fintech_usage,
                    preferences: baseProfile.fintech_usage
                }),
                tech_usage: 'High',
                domain_savvy: 'Expert',
                english_savvy: 'Fluent',
                risk_tolerance: 'Medium',
                vocabulary_level: 'Advanced',
                english_level: 'Fluent',
                tech_savviness: 'High',
                financial_savviness: 'Medium',
                product_familiarity: 'High',
                employment_type: 'Full-time',
                vocabulary_profile: JSON.stringify({
                    level: 'Advanced',
                    style: baseProfile.communication_style
                }),
                emotional_landscape: JSON.stringify({
                    triggers: baseProfile.triggers,
                    responses: baseProfile.emotional_responses
                }),
                cognitive_profile: JSON.stringify({
                    decision_style: baseProfile.decision_style,
                    thinking_pattern: baseProfile.personality
                }),
                knowledge_bounds: JSON.stringify({
                    expertise: profileKey,
                    areas: baseProfile.hobbies
                }),
                extrapolation_rules: JSON.stringify({
                    approach: baseProfile.decision_style,
                    methodology: baseProfile.communication_style
                }),
                source_meta: JSON.stringify({
                    type: 'enriched',
                    version: '2.0',
                    timestamp: new Date().toISOString()
                }),
                background: baseProfile.background_story,
                quote: generateSampleQuote(profileKey, regional.key_phrases),
                master_system_prompt: `You are ${agent.name}, a ${profileKey} with ${baseProfile.personality}. ${baseProfile.background_story}. You communicate in a ${baseProfile.communication_style} style and make decisions using a ${baseProfile.decision_style} approach.`,
                domain_literacy: JSON.stringify({
                    level: 'Expert',
                    areas: [profileKey, 'Business', 'Technology']
                }),
                cognitive_characteristics: JSON.stringify({
                    thinking_style: baseProfile.personality,
                    decision_making: baseProfile.decision_style
                }),
                knowledge_areas: JSON.stringify({
                    primary: profileKey,
                    secondary: baseProfile.hobbies
                }),
                ui_pain_points: JSON.stringify({
                    general: baseProfile.pain_points,
                    specific: ['Complex interfaces', 'Slow loading', 'Poor navigation']
                }),
                financial_preferences: JSON.stringify({
                    usage: baseProfile.fintech_usage,
                    habits: baseProfile.fintech_usage
                }),
                domain_knowledge: JSON.stringify({
                    expertise: profileKey,
                    experience: '10+ years'
                })
            };
            
            // Update the agent with comprehensive data
            await pool.query(`
                UPDATE ai_agents SET 
                    age = $1,
                    gender = $2,
                    education = $3,
                    income_range = $4,
                    personality = $5,
                    background_story = $6,
                    goals = $7,
                    pain_points = $8,
                    motivations = $9,
                    hobbies = $10,
                    daily_routine = $11,
                    decision_making = $12,
                    communication_style = $13,
                    key_quotes = $14,
                    fintech_preferences = $15,
                    social_context = $16,
                    cultural_background = $17,
                    sample_quote = $18,
                    tone = $19,
                    personality_traits = $20,
                    life_background = $21,
                    life_events = $22,
                    emotional_profile = $23,
                    lifestyle_interests = $24,
                    financial_habits = $25,
                    tech_usage = $26,
                    domain_savvy = $27,
                    english_savvy = $28,
                    risk_tolerance = $29,
                    vocabulary_level = $30,
                    english_level = $31,
                    tech_savviness = $32,
                    financial_savviness = $33,
                    product_familiarity = $34,
                    employment_type = $35,
                    vocabulary_profile = $36,
                    emotional_landscape = $37,
                    cognitive_profile = $38,
                    knowledge_bounds = $39,
                    extrapolation_rules = $40,
                    source_meta = $41,
                    background = $42,
                    quote = $43,
                    master_system_prompt = $44,
                    domain_literacy = $45,
                    cognitive_characteristics = $46,
                    knowledge_areas = $47,
                    ui_pain_points = $48,
                    financial_preferences = $49,
                    domain_knowledge = $50
                WHERE id = $51
            `, [
                enrichedProfile.age,
                enrichedProfile.gender,
                enrichedProfile.education,
                enrichedProfile.income_range,
                enrichedProfile.personality,
                enrichedProfile.background_story,
                enrichedProfile.goals,
                enrichedProfile.pain_points,
                enrichedProfile.motivations,
                enrichedProfile.hobbies,
                enrichedProfile.daily_routine,
                enrichedProfile.decision_making,
                enrichedProfile.communication_style,
                enrichedProfile.key_quotes,
                enrichedProfile.fintech_preferences,
                enrichedProfile.social_context,
                enrichedProfile.cultural_background,
                enrichedProfile.sample_quote,
                enrichedProfile.tone,
                enrichedProfile.personality_traits,
                enrichedProfile.life_background,
                enrichedProfile.life_events,
                enrichedProfile.emotional_profile,
                enrichedProfile.lifestyle_interests,
                enrichedProfile.financial_habits,
                enrichedProfile.tech_usage,
                enrichedProfile.domain_savvy,
                enrichedProfile.english_savvy,
                enrichedProfile.risk_tolerance,
                enrichedProfile.vocabulary_level,
                enrichedProfile.english_level,
                enrichedProfile.tech_savviness,
                enrichedProfile.financial_savviness,
                enrichedProfile.product_familiarity,
                enrichedProfile.employment_type,
                enrichedProfile.vocabulary_profile,
                enrichedProfile.emotional_landscape,
                enrichedProfile.cognitive_profile,
                enrichedProfile.knowledge_bounds,
                enrichedProfile.extrapolation_rules,
                enrichedProfile.source_meta,
                enrichedProfile.background,
                enrichedProfile.quote,
                enrichedProfile.master_system_prompt,
                enrichedProfile.domain_literacy,
                enrichedProfile.cognitive_characteristics,
                enrichedProfile.knowledge_areas,
                enrichedProfile.ui_pain_points,
                enrichedProfile.financial_preferences,
                enrichedProfile.domain_knowledge,
                agent.id
            ]);
            
            console.log(`✅ Enriched ${agent.name} (${profileKey}) - ${location} (${i + 1}/${agents.length})`);
        }
        
        console.log('🎉 All agents enriched with comprehensive data!');
        
    } catch (error) {
        console.error('❌ Error enriching agents:', error);
    } finally {
        await pool.end();
    }
}

enrichAgents();
