const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'avinci_admin',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'avinci',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

// Comprehensive data templates based on profession and demographics
const PERSONALITY_TRAITS_BY_PROFESSION = {
    'Software Engineer': ['Analytical', 'Detail-oriented', 'Problem-solver', 'Curious', 'Introverted'],
    'Data Analyst': ['Logical', 'Methodical', 'Patient', 'Precise', 'Inquisitive'],
    'Product Manager': ['Strategic', 'Collaborative', 'Organized', 'Decisive', 'Empathetic'],
    'UX Designer': ['Creative', 'Empathetic', 'Visual thinker', 'User-focused', 'Innovative'],
    'DevOps Engineer': ['Systematic', 'Resilient', 'Proactive', 'Technical', 'Efficient'],
    'Sales Executive': ['Persuasive', 'Outgoing', 'Competitive', 'Resilient', 'Optimistic'],
    'Marketing Manager': ['Creative', 'Strategic', 'Communicative', 'Trendy', 'Analytical'],
    'Doctor': ['Compassionate', 'Knowledgeable', 'Calm', 'Dedicated', 'Ethical'],
    'Teacher': ['Patient', 'Nurturing', 'Organized', 'Communicative', 'Passionate'],
    'Business Owner': ['Entrepreneurial', 'Risk-taker', 'Determined', 'Visionary', 'Hardworking'],
    'Engineer': ['Technical', 'Precise', 'Systematic', 'Innovative', 'Practical'],
    'Manager': ['Leadership-oriented', 'Organized', 'Decisive', 'Diplomatic', 'Results-driven'],
    'default': ['Hardworking', 'Reliable', 'Friendly', 'Adaptable', 'Honest']
};

const HOBBIES_BY_PERSONALITY = {
    'Analytical': ['Reading tech blogs', 'Solving puzzles', 'Playing chess', 'Coding side projects'],
    'Creative': ['Painting', 'Photography', 'Writing', 'Playing music', 'Crafts'],
    'Outgoing': ['Team sports', 'Socializing with friends', 'Attending events', 'Traveling'],
    'Introverted': ['Reading books', 'Watching movies', 'Gardening', 'Meditation'],
    'Active': ['Cricket', 'Badminton', 'Running', 'Cycling', 'Yoga'],
    'Cultural': ['Cooking traditional food', 'Attending festivals', 'Temple visits', 'Classical music']
};

const SECONDARY_GOALS_BY_PROFESSION = {
    'Software Engineer': ['Learn new programming languages', 'Contribute to open source', 'Mentor junior developers', 'Start a tech blog'],
    'Data Analyst': ['Master machine learning', 'Get certified in data science', 'Improve visualization skills', 'Learn Python advanced'],
    'Product Manager': ['Launch successful product', 'Build strong team', 'Learn Agile methodology', 'Network with industry leaders'],
    'UX Designer': ['Build design portfolio', 'Learn new design tools', 'Understand user psychology', 'Win design awards'],
    'Sales Executive': ['Exceed sales targets', 'Build client relationships', 'Learn negotiation skills', 'Expand territory'],
    'Doctor': ['Pursue specialization', 'Publish research papers', 'Serve underprivileged', 'Open own clinic'],
    'Teacher': ['Improve teaching methods', 'Pursue higher education', 'Help struggling students', 'Create educational content'],
    'Business Owner': ['Expand business', 'Increase revenue', 'Hire more staff', 'Open new branch'],
    'default': ['Career advancement', 'Skill development', 'Financial stability', 'Work-life balance']
};

const LIFE_EVENTS_BY_AGE = {
    '20-30': [
        { milestone: 'Graduated from college', year: -3, impact: 'Started professional career', description: 'Completed degree and entered workforce' },
        { milestone: 'First job', year: -2, impact: 'Gained financial independence', description: 'Started earning and supporting family' },
        { milestone: 'Moved to city', year: -1, impact: 'New opportunities and challenges', description: 'Relocated for better career prospects' }
    ],
    '30-40': [
        { milestone: 'Got married', year: -5, impact: 'Started family life', description: 'Major life change with new responsibilities' },
        { milestone: 'First child born', year: -3, impact: 'Became a parent', description: 'Life priorities shifted to family' },
        { milestone: 'Promotion at work', year: -2, impact: 'Career growth and recognition', description: 'Moved to senior position' },
        { milestone: 'Bought own house', year: -1, impact: 'Financial milestone achieved', description: 'Invested in property' }
    ],
    '40-50': [
        { milestone: 'Children started school', year: -7, impact: 'Education expenses began', description: 'Focus on children education' },
        { milestone: 'Promotion to management', year: -4, impact: 'Leadership responsibilities', description: 'Started managing teams' },
        { milestone: 'Health scare', year: -2, impact: 'Became health conscious', description: 'Started prioritizing wellness' },
        { milestone: 'Parents aging care', year: -1, impact: 'Took on elder care duties', description: 'Supporting aging parents' }
    ],
    '50+': [
        { milestone: 'Children completed education', year: -8, impact: 'Major expense completed', description: 'Kids became independent' },
        { milestone: 'Senior leadership role', year: -5, impact: 'Peak of career', description: 'Achieved senior position' },
        { milestone: 'Started planning retirement', year: -2, impact: 'Future planning', description: 'Thinking about post-retirement life' },
        { milestone: 'Became grandparent', year: -1, impact: 'New joy in life', description: 'Next generation arrived' }
    ]
};

const BELIEFS_BY_REGION = {
    north: [
        'Family is everything, honor is important',
        'Hard work leads to success',
        'Respect elders and tradition',
        'Education is key to better life',
        'Unity in diversity makes us strong'
    ],
    south: [
        'Education and knowledge are sacred',
        'Discipline and dedication matter',
        'Family values are foundation',
        'Traditional wisdom guides modern life',
        'Humility and respect for all'
    ],
    tamil: [
        'Tamil culture and language pride',
        'Education is the greatest wealth',
        'Family bonds are unbreakable',
        'Self-respect and dignity matter',
        'Hard work never goes waste'
    ],
    west: [
        'Business and entrepreneurship spirit',
        'Celebration of life and festivals',
        'Family business legacy',
        'Community support is strength',
        'Innovation with tradition'
    ],
    east: [
        'Intellectual and cultural pursuits',
        'Arts and literature appreciation',
        'Family meals bring togetherness',
        'Education and debate culture',
        'Progressive yet traditional'
    ]
};

// Tech levels: Beginner to Expert (5 levels)
const TECH_LEVEL_MAP = {
    'Very Low': 'Beginner',
    'Low': 'Elementary',
    'Medium': 'Intermediate',
    'High': 'Advanced',
    'Very High': 'Expert'
};

const RECOMMENDATIONS_BY_TECH_LEVEL = {
    'Beginner': [
        'Make apps simpler with bigger buttons',
        'Add voice commands in regional languages',
        'Provide step-by-step tutorials',
        'Reduce technical jargon',
        'Add customer support in native language'
    ],
    'Elementary': [
        'Simplify navigation and menus',
        'Add helpful tooltips and hints',
        'Provide video tutorials',
        'Make interface more visual',
        'Add WhatsApp-style familiarity'
    ],
    'Intermediate': [
        'Balance features with simplicity',
        'Add shortcuts for power users',
        'Improve search functionality',
        'Add customization options',
        'Better notifications'
    ],
    'Advanced': [
        'Add advanced features and settings',
        'Provide API access',
        'Add keyboard shortcuts',
        'Improve performance',
        'Add integration options'
    ],
    'Expert': [
        'Add developer tools',
        'Provide detailed analytics',
        'Add automation features',
        'Improve API documentation',
        'Add beta features access'
    ]
};

// English levels: Beginner to Expert (5 levels)
const ENGLISH_LEVEL_MAP = {
    'Very Low': 'Beginner',
    'Low': 'Elementary',
    'Medium': 'Intermediate',
    'High': 'Advanced',
    'Very High': 'Expert'
};

const KEY_PHRASES_BY_ENGLISH_LEVEL = {
    'Beginner': {
        north: ['Hindi mein bolo', 'Samajh nahi aaya', 'Ek baar aur batao', 'Theek hai ji'],
        south: ['Telugu lo cheppu', 'Ardam kavatledu', 'Slow ga cheppu', 'Sare sare'],
        tamil: ['Tamil la sollu', 'Puriyala da', 'Konjam slow ah', 'Seri pa'],
        west: ['Marathi madhe bola', 'Samajat nahi', 'Halu halu bola', 'Thik hai'],
        east: ['Bangla te bolo', 'Bujhina', 'Aste bolo', 'Achha achha']
    },
    'Elementary': {
        north: ['Yaar', 'Achha theek hai', 'Samjha', 'Bilkul', 'Haan ji'],
        south: ['Kada ra', 'Sare aitey', 'Bagundi', 'Em chestham', 'Chala nice'],
        tamil: ['Da pa', 'Seri seri', 'Nalla irukku', 'Puriyuthu', 'Romba thanks'],
        west: ['Mhanje kay', 'Mast hai', 'Chalu re', 'Thik hai na', 'Ho na'],
        east: ['Bhalo', 'Darun to', 'Ektu wait', 'Bujhecho', 'Thik ache']
    },
    'Intermediate': {
        north: ['Yaar', 'I think so', 'Makes sense', 'Achha okay'],
        south: ['Correct kada', 'Yes yes', 'I understand', 'Good point'],
        tamil: ['Exactly da', 'Right right', 'I got it', 'Nice one'],
        west: ['True that', 'Fair enough', 'I see', 'Makes sense na'],
        east: ['Absolutely', 'I agree', 'Good point', 'Fair enough']
    },
    'Advanced': {
        north: ['I understand', 'That makes sense', 'Good point', 'Agreed'],
        south: ['Certainly', 'I see your point', 'Valid concern', 'Fair enough'],
        tamil: ['Absolutely', 'I comprehend', 'Well said', 'Indeed'],
        west: ['Precisely', 'Certainly', 'I concur', 'Agreed'],
        east: ['Certainly', 'I understand', 'Valid point', 'Quite right']
    },
    'Expert': {
        north: ['Certainly', 'I comprehend', 'Precisely', 'Indeed', 'Absolutely'],
        south: ['Undoubtedly', 'I concur', 'Precisely', 'Certainly', 'Indeed'],
        tamil: ['Absolutely', 'Certainly', 'Precisely', 'Indeed', 'Correct'],
        west: ['Certainly', 'Precisely', 'Indeed', 'Absolutely', 'Correct'],
        east: ['Undoubtedly', 'Certainly', 'Precisely', 'Indeed', 'Absolutely']
    }
};

const EMOTIONAL_TRIGGERS_AND_RESPONSES = {
    'Analytical': {
        triggers: ['Unclear requirements', 'Lack of data', 'Rushed decisions', 'Incomplete information'],
        responses: ['Asks clarifying questions', 'Seeks more details', 'Analyzes systematically', 'Stays calm and logical']
    },
    'Creative': {
        triggers: ['Rigid constraints', 'Lack of freedom', 'Criticism of ideas', 'Monotonous work'],
        responses: ['Proposes alternatives', 'Seeks creative solutions', 'Expresses frustration artistically', 'Needs space to think']
    },
    'Outgoing': {
        triggers: ['Being ignored', 'Lack of recognition', 'Isolation', 'Poor communication'],
        responses: ['Speaks up proactively', 'Seeks feedback', 'Initiates conversations', 'Expresses emotions openly']
    },
    'Patient': {
        triggers: ['Constant interruptions', 'Aggressive behavior', 'Disrespect', 'Chaos'],
        responses: ['Takes deep breaths', 'Addresses calmly', 'Sets boundaries politely', 'Seeks resolution']
    },
    'default': {
        triggers: ['Unfair treatment', 'Lack of clarity', 'Time pressure', 'Technical issues'],
        responses: ['Expresses concern', 'Seeks help', 'Tries to resolve', 'Communicates needs']
    }
};

function getRegion(location) {
    if (!location) return 'north';
    const loc = location.toLowerCase();
    if (loc.includes('tamil') || loc.includes('chennai')) return 'tamil';
    if (loc.includes('delhi') || loc.includes('punjab') || loc.includes('haryana')) return 'north';
    if (loc.includes('bangalore') || loc.includes('hyderabad') || loc.includes('kerala')) return 'south';
    if (loc.includes('mumbai') || loc.includes('maharashtra') || loc.includes('gujarat')) return 'west';
    if (loc.includes('kolkata') || loc.includes('bengal')) return 'east';
    return 'north';
}

function getAgeGroup(age) {
    if (age < 30) return '20-30';
    if (age < 40) return '30-40';
    if (age < 50) return '40-50';
    return '50+';
}

function getPersonalityTraits(occupation) {
    for (const [key, traits] of Object.entries(PERSONALITY_TRAITS_BY_PROFESSION)) {
        if (occupation.includes(key)) return traits;
    }
    return PERSONALITY_TRAITS_BY_PROFESSION.default;
}

function getHobbies(traits) {
    const hobbies = [];
    traits.forEach(trait => {
        const traitHobbies = HOBBIES_BY_PERSONALITY[trait] || [];
        if (traitHobbies.length > 0) {
            hobbies.push(traitHobbies[Math.floor(Math.random() * traitHobbies.length)]);
        }
    });
    
    // Add some Indian-specific hobbies
    const indianHobbies = ['Watching cricket', 'Cooking traditional food', 'Temple visits', 'Family gatherings', 'Bollywood movies'];
    hobbies.push(...indianHobbies.slice(0, 2));
    
    return [...new Set(hobbies)].slice(0, 5); // Remove duplicates, max 5
}

function getSecondaryGoals(occupation) {
    for (const [key, goals] of Object.entries(SECONDARY_GOALS_BY_PROFESSION)) {
        if (occupation.includes(key)) return goals;
    }
    return SECONDARY_GOALS_BY_PROFESSION.default;
}

async function completeAllAgentData() {
    try {
        console.log('🔄 Fetching all agents...\n');
        
        const result = await pool.query(`
            SELECT id, name, location, age, gender, occupation, 
                   english_savvy, tech_savviness, speech_patterns
            FROM ai_agents 
            ORDER BY created_at
        `);
        
        const agents = result.rows;
        console.log(`📊 Found ${agents.length} agents to complete\n`);
        
        let completedCount = 0;
        
        for (let i = 0; i < agents.length; i++) {
            const agent = agents[i];
            
            try {
                const region = getRegion(agent.location);
                const ageGroup = getAgeGroup(agent.age);
                const traits = getPersonalityTraits(agent.occupation);
                const mainTrait = traits[0];
                
                // Get comprehensive data
                const hobbies = getHobbies(traits);
                const secondaryGoals = getSecondaryGoals(agent.occupation);
                const lifeEvents = LIFE_EVENTS_BY_AGE[ageGroup] || LIFE_EVENTS_BY_AGE['30-40'];
                const beliefs = BELIEFS_BY_REGION[region] || BELIEFS_BY_REGION.north;
                
                // Get emotional profile
                const emotionalData = EMOTIONAL_TRIGGERS_AND_RESPONSES[mainTrait] || EMOTIONAL_TRIGGERS_AND_RESPONSES.default;
                
                // Convert old levels to new Beginner-Expert scale
                const newEnglishLevel = ENGLISH_LEVEL_MAP[agent.english_savvy] || agent.english_savvy || 'Intermediate';
                const newTechLevel = TECH_LEVEL_MAP[agent.tech_savviness] || agent.tech_savviness || 'Intermediate';
                
                // Get key phrases based on English level
                const keyPhrasesData = KEY_PHRASES_BY_ENGLISH_LEVEL[newEnglishLevel] || KEY_PHRASES_BY_ENGLISH_LEVEL.Intermediate;
                const keyPhrases = keyPhrasesData[region] || keyPhrasesData.north || [];
                
                // Get recommendations based on Tech level
                const recommendations = RECOMMENDATIONS_BY_TECH_LEVEL[newTechLevel] || RECOMMENDATIONS_BY_TECH_LEVEL.Intermediate;
                
                // Build comprehensive update using actual database columns
                const updates = {
                    personality_traits: traits.join(', '), // text field
                    personality: { // jsonb field
                        traits: traits,
                        communication_style: agent.speech_patterns?.style || 'Professional',
                        emotional_baseline: emotionalData.responses[0]
                    },
                    traits: { // jsonb field
                        primary: traits,
                        communication: agent.speech_patterns?.style || 'Professional'
                    },
                    hobbies: { // jsonb field
                        list: hobbies,
                        primary: hobbies.slice(0, 3)
                    },
                    goals: [...secondaryGoals.slice(0, 2), 'Support family', 'Achieve financial stability'], // array
                    life_events: lifeEvents.map(event => ({ // jsonb field
                        milestone: event.milestone,
                        year: new Date().getFullYear() + event.year,
                        impact: event.impact,
                        description: event.description
                    })),
                    emotional_profile: { // jsonb field
                        triggers: emotionalData.triggers,
                        responses: emotionalData.responses,
                        baseline: 'Neutral',
                        frustration_triggers: emotionalData.triggers,
                        excitement_triggers: ['Success', 'Recognition', 'Achievement']
                    }
                };
                
                // Update database with ALL fields including new english/tech levels
                await pool.query(`
                    UPDATE ai_agents SET
                        personality_traits = $1,
                        personality = $2,
                        traits = $3,
                        hobbies = $4,
                        goals = $5,
                        life_events = $6,
                        emotional_profile = $7,
                        english_savvy = $8,
                        tech_savviness = $9
                    WHERE id = $10
                `, [
                    updates.personality_traits,
                    JSON.stringify(updates.personality),
                    JSON.stringify(updates.traits),
                    JSON.stringify(updates.hobbies),
                    updates.goals,
                    JSON.stringify(updates.life_events),
                    JSON.stringify(updates.emotional_profile),
                    newEnglishLevel,
                    newTechLevel,
                    agent.id
                ]);
                
                completedCount++;
                console.log(`✅ ${completedCount}/${agents.length}: ${agent.name}`);
                console.log(`   🗣️  English: ${agent.english_savvy} → ${newEnglishLevel}`);
                console.log(`   💻 Tech: ${agent.tech_savviness} → ${newTechLevel}`);
                console.log(`   🎭 Traits: ${traits.slice(0, 3).join(', ')}`);
                console.log(`   🎯 Hobbies: ${hobbies.slice(0, 3).join(', ')}`);
                console.log(`   📍 Events: ${lifeEvents.length} life milestones`);
                console.log(`   💡 Recommendations: ${recommendations.length} provided`);
                console.log('');
                
            } catch (error) {
                console.error(`❌ Error completing ${agent.name}:`, error.message);
            }
        }
        
        console.log('\n🎉 Complete data population finished!');
        console.log(`   ✅ Completed: ${completedCount} agents`);
        console.log(`   📊 Fields filled: Personality, Hobbies, Goals, Life Events, Beliefs, Recommendations, Key Phrases, Emotional Triggers`);
        
    } catch (error) {
        console.error('❌ Fatal error:', error);
    } finally {
        await pool.end();
    }
}

completeAllAgentData();

