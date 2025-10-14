const { Pool } = require('pg');

// Database connection
const pool = new Pool({
    user: process.env.DB_USER || 'avinci_admin',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'avinci',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

// Rich persona data templates based on demographics and location
const PERSONA_TEMPLATES = {
    // North India (Delhi, Punjab, Haryana, Rajasthan, UP)
    north: {
        cultural_background: {
            region: "North India",
            language: "Hindi/Punjabi",
            traditions: ["Diwali", "Holi", "Karva Chauth", "Lohri"],
            values: ["Family honor", "Respect for elders", "Hard work", "Hospitality"],
            food_culture: ["Roti", "Dal", "Sabzi", "Lassi", "Samosas"],
            festivals: ["Diwali", "Holi", "Karva Chauth", "Lohri", "Baisakhi"]
        },
        common_phrases: ["Arre yaar", "Theek hai", "Chalo", "Achha", "Haan bhai"],
        local_words: ["Bhai", "Yaar", "Arre", "Theek", "Chalo"]
    },
    
    // South India (Karnataka, Tamil Nadu, Kerala, Andhra Pradesh, Telangana)
    south: {
        cultural_background: {
            region: "South India",
            language: "Kannada/Tamil/Telugu/Malayalam",
            traditions: ["Pongal", "Onam", "Ugadi", "Sankranti"],
            values: ["Education", "Respect", "Tradition", "Community"],
            food_culture: ["Rice", "Sambar", "Rasam", "Coconut", "Idli", "Dosa"],
            festivals: ["Pongal", "Onam", "Ugadi", "Sankranti", "Ganesh Chaturthi"]
        },
        common_phrases: ["Kada", "Sare", "Chala", "Achha", "Haan"],
        local_words: ["Kada", "Sare", "Chala", "Achha", "Haan"]
    },
    
    // West India (Maharashtra, Gujarat, Goa)
    west: {
        cultural_background: {
            region: "West India",
            language: "Marathi/Gujarati",
            traditions: ["Ganesh Chaturthi", "Navratri", "Diwali", "Gudi Padwa"],
            values: ["Business acumen", "Education", "Family", "Progress"],
            food_culture: ["Vada Pav", "Pav Bhaji", "Dhokla", "Thepla", "Misal Pav"],
            festivals: ["Ganesh Chaturthi", "Navratri", "Diwali", "Gudi Padwa", "Makar Sankranti"]
        },
        common_phrases: ["Ho na", "Kasa ahes", "Chala", "Achha", "Haan"],
        local_words: ["Ho", "Kasa", "Chala", "Achha", "Haan"]
    },
    
    // East India (West Bengal, Odisha, Bihar, Jharkhand)
    east: {
        cultural_background: {
            region: "East India",
            language: "Bengali/Odia/Bhojpuri",
            traditions: ["Durga Puja", "Kali Puja", "Rath Yatra", "Chhath Puja"],
            values: ["Intellectualism", "Art", "Culture", "Education"],
            food_culture: ["Rice", "Fish", "Rasgulla", "Sandesh", "Mishti"],
            festivals: ["Durga Puja", "Kali Puja", "Rath Yatra", "Chhath Puja", "Kali Puja"]
        },
        common_phrases: ["Ki re", "Cholo", "Achha", "Haan", "Thik ache"],
        local_words: ["Ki", "Cholo", "Achha", "Haan", "Thik"]
    },
    
    // Tamil Nadu specific
    tamil: {
        cultural_background: {
            region: "Tamil Nadu",
            language: "Tamil",
            traditions: ["Pongal", "Karthigai", "Aadi", "Thai"],
            values: ["Tamil pride", "Education", "Respect", "Tradition"],
            food_culture: ["Rice", "Sambar", "Rasam", "Coconut", "Idli", "Dosa", "Pongal"],
            festivals: ["Pongal", "Karthigai", "Aadi", "Thai", "Ganesh Chaturthi"]
        },
        common_phrases: ["Seri", "Romba", "Nalla", "Chala", "Achha"],
        local_words: ["Seri", "Romba", "Nalla", "Chala", "Achha"]
    }
};

// English level-based personality traits
const ENGLISH_LEVEL_TRAITS = {
    'Beginner': {
        personality_traits: ["Humble", "Patient", "Traditional", "Family-oriented", "Respectful"],
        communication_style: "Simple, direct, uses native language frequently",
        confidence_level: "Moderate, prefers familiar topics"
    },
    'Elementary': {
        personality_traits: ["Curious", "Eager to learn", "Practical", "Community-focused", "Determined"],
        communication_style: "Mixes languages, asks clarifying questions",
        confidence_level: "Growing, comfortable with basic topics"
    },
    'Intermediate': {
        personality_traits: ["Balanced", "Adaptable", "Ambitious", "Social", "Open-minded"],
        communication_style: "Comfortable with English, occasional native words",
        confidence_level: "Good, handles most conversations"
    },
    'Advanced': {
        personality_traits: ["Professional", "Confident", "Analytical", "Goal-oriented", "Independent"],
        communication_style: "Fluent English with cultural expressions",
        confidence_level: "High, comfortable in professional settings"
    },
    'Expert': {
        personality_traits: ["Sophisticated", "Intellectual", "Leadership-oriented", "Innovative", "Global-minded"],
        communication_style: "Highly fluent, nuanced communication",
        confidence_level: "Very high, expert in their field"
    }
};

// Tech savviness-based traits
const TECH_SAVVY_TRAITS = {
    'Beginner': {
        tech_comfort: "Basic smartphone usage, WhatsApp, simple apps",
        digital_literacy: "Limited, prefers human interaction",
        tech_frustrations: ["Complex interfaces", "Too many features", "Technical jargon"]
    },
    'Elementary': {
        tech_comfort: "Social media, basic online shopping, simple banking",
        digital_literacy: "Basic, learns through trial and error",
        tech_frustrations: ["Frequent updates", "Password management", "Slow internet"]
    },
    'Intermediate': {
        tech_comfort: "Online banking, e-commerce, video calls, basic productivity apps",
        digital_literacy: "Comfortable, can troubleshoot basic issues",
        tech_frustrations: ["Complex settings", "Security concerns", "Too many options"]
    },
    'Advanced': {
        tech_comfort: "Multiple devices, cloud services, advanced apps, online learning",
        digital_literacy: "High, adapts to new technologies quickly",
        tech_frustrations: ["Poor UX design", "Incompatible systems", "Privacy issues"]
    },
    'Expert': {
        tech_comfort: "Cutting-edge technology, programming, automation, AI tools",
        digital_literacy: "Expert, creates and modifies technology",
        tech_frustrations: ["Legacy systems", "Poor documentation", "Limited customization"]
    }
};

// Safe JSON parsing helper
function safeParseJSON(jsonString, defaultValue) {
    if (!jsonString) return defaultValue;
    if (typeof jsonString === 'object') return jsonString;
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.warn('JSON parse error:', error.message, 'for value:', jsonString);
        return defaultValue;
    }
}

// Generate rich persona data for an agent
async function generateRichPersonaData(agent) {
    const name = agent.name;
    const location = agent.location || 'Unknown';
    const age = agent.age || 30;
    const gender = agent.gender || 'Unknown';
    const occupation = agent.occupation || 'Professional';
    const englishLevel = agent.speech_patterns?.english_level || agent.english_savvy || 'Intermediate';
    const techLevel = agent.tech_savviness || 'Intermediate';
    
    // Determine region for cultural context
    let region = 'north';
    if (location.toLowerCase().includes('tamil') || location.toLowerCase().includes('chennai')) {
        region = 'tamil';
    } else if (location.toLowerCase().includes('bangalore') || location.toLowerCase().includes('karnataka')) {
        region = 'south';
    } else if (location.toLowerCase().includes('mumbai') || location.toLowerCase().includes('maharashtra')) {
        region = 'west';
    } else if (location.toLowerCase().includes('kolkata') || location.toLowerCase().includes('bengal')) {
        region = 'east';
    }
    
    const culturalTemplate = PERSONA_TEMPLATES[region];
    const englishTraits = ENGLISH_LEVEL_TRAITS[englishLevel] || ENGLISH_LEVEL_TRAITS['Intermediate'];
    const techTraits = TECH_SAVVY_TRAITS[techLevel] || TECH_SAVVY_TRAITS['Intermediate'];
    
    // Generate comprehensive persona data
    const personaData = {
        // Basic demographics
        name: name,
        age: age,
        gender: gender,
        location: location,
        occupation: occupation,
        
        // Personality traits based on English level
        personality_traits: englishTraits.personality_traits,
        
        // Hobbies based on age, gender, and tech level
        hobbies: generateHobbies(age, gender, techLevel, region),
        
        // Goals based on age and occupation
        goals: generateGoals(age, occupation, englishLevel),
        
        // Life events based on age
        life_events: generateLifeEvents(age, gender, occupation),
        
        // Cultural background
        cultural_background: culturalTemplate.cultural_background,
        
        // Beliefs and values
        beliefs: generateBeliefs(region, age, occupation),
        
        // Key quotes based on personality and region
        key_quotes: generateKeyQuotes(name, region, englishLevel),
        
        // Background story
        background_story: generateBackgroundStory(name, age, location, occupation, englishLevel),
        
        // Pain points based on tech level and occupation
        pain_points: generatePainPoints(techLevel, occupation, englishLevel),
        
        // Motivations based on age and occupation
        motivations: generateMotivations(age, occupation, englishLevel),
        
        // Frustrations (already present, keep existing)
        frustrations: agent.frustrations || generateFrustrations(techLevel, occupation),
        
        // Objectives based on occupation and age
        objectives: generateObjectives(occupation, age, englishLevel),
        
        // Needs based on tech level and occupation
        needs: generateNeeds(techLevel, occupation, age),
        
        // Fears based on age and tech level
        fears: generateFears(age, techLevel, occupation),
        
        // Apprehensions based on tech level and occupation
        apprehensions: generateApprehensions(techLevel, occupation, englishLevel),
        
        // Enhanced communication style
        communication_style: {
            ...agent.communication_style,
            formality: englishLevel === 'Expert' ? 'formal' : 'casual',
            sentence_length: englishLevel === 'Beginner' ? 'short' : 'medium',
            question_style: englishLevel === 'Expert' ? 'analytical' : 'curious',
            common_phrases: culturalTemplate.common_phrases,
            local_words: culturalTemplate.local_words
        },
        
        // Enhanced speech patterns
        speech_patterns: {
            ...agent.speech_patterns,
            english_level: englishLevel,
            style: englishTraits.communication_style,
            filler_words: culturalTemplate.common_phrases,
            common_phrases: culturalTemplate.common_phrases,
            native_phrases: culturalTemplate.local_words,
            vocabulary_mixing: englishLevel === 'Beginner' ? 'heavy' : 
                             englishLevel === 'Elementary' ? 'moderate' : 'light'
        },
        
        // Tech savviness details
        tech_savviness: techLevel,
        tech_comfort: techTraits.tech_comfort,
        digital_literacy: techTraits.digital_literacy,
        tech_frustrations: techTraits.tech_frustrations
    };
    
    return personaData;
}

// Helper functions to generate specific data
function generateHobbies(age, gender, techLevel, region) {
    const baseHobbies = [];
    
    // Age-based hobbies
    if (age < 25) {
        baseHobbies.push("Social media", "Music", "Movies", "Gaming", "Sports");
    } else if (age < 35) {
        baseHobbies.push("Fitness", "Cooking", "Travel", "Reading", "Photography");
    } else if (age < 50) {
        baseHobbies.push("Gardening", "Cooking", "Reading", "Family time", "Community service");
    } else {
        baseHobbies.push("Reading", "Gardening", "Religious activities", "Family time", "Health activities");
    }
    
    // Tech level hobbies
    if (techLevel === 'Expert' || techLevel === 'Advanced') {
        baseHobbies.push("Tech gadgets", "Online learning", "Coding", "Digital art");
    } else if (techLevel === 'Intermediate') {
        baseHobbies.push("Social media", "Online shopping", "Video calls", "Mobile apps");
    }
    
    // Regional hobbies
    if (region === 'tamil') {
        baseHobbies.push("Tamil movies", "Classical music", "Temple visits");
    } else if (region === 'south') {
        baseHobbies.push("Classical music", "Dance", "Temple visits");
    } else if (region === 'north') {
        baseHobbies.push("Bollywood movies", "Cricket", "Festival celebrations");
    }
    
    return baseHobbies.slice(0, 5); // Return top 5
}

function generateGoals(age, occupation, englishLevel) {
    const goals = [];
    
    // Age-based goals
    if (age < 25) {
        goals.push("Learn new skills", "Build career foundation", "Financial independence");
    } else if (age < 35) {
        goals.push("Career advancement", "Family stability", "Professional growth");
    } else if (age < 50) {
        goals.push("Leadership role", "Financial security", "Mentoring others");
    } else {
        goals.push("Work-life balance", "Knowledge sharing", "Legacy building");
    }
    
    // Occupation-based goals
    if (occupation.toLowerCase().includes('engineer')) {
        goals.push("Technical expertise", "Innovation", "Problem solving");
    } else if (occupation.toLowerCase().includes('manager')) {
        goals.push("Team leadership", "Process improvement", "Strategic thinking");
    } else if (occupation.toLowerCase().includes('designer')) {
        goals.push("Creative excellence", "User experience", "Design innovation");
    }
    
    // English level goals
    if (englishLevel === 'Beginner' || englishLevel === 'Elementary') {
        goals.push("Improve English communication", "Build confidence");
    } else if (englishLevel === 'Expert') {
        goals.push("Global opportunities", "Thought leadership");
    }
    
    return goals.slice(0, 4);
}

function generateLifeEvents(age, gender, occupation) {
    const events = [];
    
    // Age-based life events
    if (age >= 18) events.push({ milestone: "Completed education", year: age - 5, impact: "High" });
    if (age >= 22) events.push({ milestone: "Started career", year: age - 3, impact: "High" });
    if (age >= 25) events.push({ milestone: "Professional growth", year: age - 1, impact: "Medium" });
    if (age >= 30) events.push({ milestone: "Financial stability", year: age - 2, impact: "High" });
    
    // Gender-specific events (if applicable)
    if (gender === 'Female' && age >= 25) {
        events.push({ milestone: "Career advancement", year: age - 1, impact: "High" });
    }
    
    return events.slice(0, 4);
}

function generateBeliefs(region, age, occupation) {
    const beliefs = [];
    
    // Regional beliefs
    if (region === 'tamil') {
        beliefs.push("Tamil culture and language pride", "Education is paramount", "Respect for traditions");
    } else if (region === 'south') {
        beliefs.push("Education and knowledge", "Respect for elders", "Community values");
    } else if (region === 'north') {
        beliefs.push("Family honor", "Hard work pays off", "Hospitality and respect");
    } else if (region === 'west') {
        beliefs.push("Business acumen", "Innovation and progress", "Education and family");
    } else if (region === 'east') {
        beliefs.push("Intellectualism", "Art and culture", "Education and creativity");
    }
    
    // Age-based beliefs
    if (age < 30) {
        beliefs.push("Technology can solve problems", "Work-life balance is important");
    } else if (age < 50) {
        beliefs.push("Experience matters", "Mentoring others is valuable");
    } else {
        beliefs.push("Wisdom comes with age", "Legacy is important");
    }
    
    return beliefs.slice(0, 5);
}

function generateKeyQuotes(name, region, englishLevel) {
    const quotes = [];
    
    // English level-based quotes
    if (englishLevel === 'Beginner') {
        quotes.push(`"Main ${name} hun, aap kaise hain?"`);
        quotes.push(`"Yeh samajhne mein thoda time lagega"`);
        quotes.push(`"Aapka help chahiye"`);
    } else if (englishLevel === 'Elementary') {
        quotes.push(`"Hello, I'm ${name}. How can I help?"`);
        quotes.push(`"Yeh idea achha hai, but thoda improve kar sakte hain"`);
        quotes.push(`"Main samajh gaya, let me think about this"`);
    } else if (englishLevel === 'Intermediate') {
        quotes.push(`"Hi, I'm ${name}. What do you think about this?"`);
        quotes.push(`"That's interesting, but I have a different perspective"`);
        quotes.push(`"Let me share my experience with this"`);
    } else if (englishLevel === 'Advanced') {
        quotes.push(`"Hello, I'm ${name}. I'd like to discuss this topic"`);
        quotes.push(`"Based on my experience, I believe we should consider..."`);
        quotes.push(`"That's a valid point, however I think..."`);
    } else { // Expert
        quotes.push(`"I'm ${name}, and I'd be happy to share my insights"`);
        quotes.push(`"From a strategic perspective, I recommend..."`);
        quotes.push(`"This is an excellent opportunity to explore..."`);
    }
    
    return quotes.slice(0, 3);
}

function generateBackgroundStory(name, age, location, occupation, englishLevel) {
    const region = location.toLowerCase().includes('tamil') ? 'Tamil Nadu' : 
                  location.toLowerCase().includes('bangalore') ? 'Karnataka' :
                  location.toLowerCase().includes('mumbai') ? 'Maharashtra' :
                  location.toLowerCase().includes('delhi') ? 'Delhi' : 'India';
    
    let story = `${name} grew up in ${location}, ${region}. `;
    
    if (age < 25) {
        story += `Recently completed education and started working as a ${occupation}. `;
        story += `Eager to learn and grow in their career. `;
    } else if (age < 35) {
        story += `Has been working as a ${occupation} for several years. `;
        story += `Gained valuable experience and looking to advance further. `;
    } else if (age < 50) {
        story += `Has extensive experience as a ${occupation}. `;
        story += `Now focused on leadership and mentoring others. `;
    } else {
        story += `Has decades of experience as a ${occupation}. `;
        story += `Now focused on sharing knowledge and building legacy. `;
    }
    
    if (englishLevel === 'Beginner' || englishLevel === 'Elementary') {
        story += `Prefers communicating in their native language but is learning English. `;
    } else if (englishLevel === 'Expert') {
        story += `Fluent in English and comfortable in international settings. `;
    }
    
    story += `Values family, community, and continuous learning.`;
    
    return story;
}

function generatePainPoints(techLevel, occupation, englishLevel) {
    const painPoints = [];
    
    // Tech level pain points
    if (techLevel === 'Beginner') {
        painPoints.push("Complex technology interfaces", "Too many features", "Technical jargon");
    } else if (techLevel === 'Elementary') {
        painPoints.push("Frequent app updates", "Password management", "Slow internet");
    } else if (techLevel === 'Intermediate') {
        painPoints.push("Complex settings", "Security concerns", "Too many options");
    } else if (techLevel === 'Advanced') {
        painPoints.push("Poor UX design", "Incompatible systems", "Privacy issues");
    } else { // Expert
        painPoints.push("Legacy systems", "Poor documentation", "Limited customization");
    }
    
    // Occupation pain points
    if (occupation.toLowerCase().includes('engineer')) {
        painPoints.push("Tight deadlines", "Complex requirements", "Technical debt");
    } else if (occupation.toLowerCase().includes('manager')) {
        painPoints.push("Team coordination", "Resource constraints", "Stakeholder management");
    } else if (occupation.toLowerCase().includes('designer')) {
        painPoints.push("Client feedback", "Design constraints", "User research");
    }
    
    // English level pain points
    if (englishLevel === 'Beginner' || englishLevel === 'Elementary') {
        painPoints.push("English communication", "Confidence in meetings", "Understanding technical terms");
    }
    
    return painPoints.slice(0, 4);
}

function generateMotivations(age, occupation, englishLevel) {
    const motivations = [];
    
    // Age-based motivations
    if (age < 25) {
        motivations.push("Learning and growth", "Building skills", "Career advancement");
    } else if (age < 35) {
        motivations.push("Professional success", "Financial stability", "Recognition");
    } else if (age < 50) {
        motivations.push("Leadership", "Mentoring others", "Impact");
    } else {
        motivations.push("Legacy", "Knowledge sharing", "Work-life balance");
    }
    
    // Occupation motivations
    if (occupation.toLowerCase().includes('engineer')) {
        motivations.push("Problem solving", "Innovation", "Technical excellence");
    } else if (occupation.toLowerCase().includes('manager')) {
        motivations.push("Team success", "Process improvement", "Strategic impact");
    } else if (occupation.toLowerCase().includes('designer')) {
        motivations.push("Creative expression", "User satisfaction", "Design innovation");
    }
    
    return motivations.slice(0, 4);
}

function generateFrustrations(techLevel, occupation) {
    const frustrations = [];
    
    // Tech level frustrations
    if (techLevel === 'Beginner') {
        frustrations.push("Complex interfaces", "Too many features", "Technical jargon");
    } else if (techLevel === 'Elementary') {
        frustrations.push("Frequent updates", "Password management", "Slow internet");
    } else if (techLevel === 'Intermediate') {
        frustrations.push("Complex settings", "Security concerns", "Too many options");
    } else if (techLevel === 'Advanced') {
        frustrations.push("Poor UX design", "Incompatible systems", "Privacy issues");
    } else { // Expert
        frustrations.push("Legacy systems", "Poor documentation", "Limited customization");
    }
    
    // Occupation frustrations
    if (occupation.toLowerCase().includes('engineer')) {
        frustrations.push("Tight deadlines", "Complex requirements", "Technical debt");
    } else if (occupation.toLowerCase().includes('manager')) {
        frustrations.push("Team coordination", "Resource constraints", "Stakeholder management");
    } else if (occupation.toLowerCase().includes('designer')) {
        frustrations.push("Client feedback", "Design constraints", "User research");
    }
    
    return frustrations.slice(0, 4);
}

function generateObjectives(occupation, age, englishLevel) {
    const objectives = [];
    
    // Age-based objectives
    if (age < 25) {
        objectives.push("Learn new skills", "Build network", "Gain experience");
    } else if (age < 35) {
        objectives.push("Career advancement", "Leadership skills", "Professional growth");
    } else if (age < 50) {
        objectives.push("Mentor others", "Strategic thinking", "Team leadership");
    } else {
        objectives.push("Knowledge sharing", "Legacy building", "Work-life balance");
    }
    
    // Occupation objectives
    if (occupation.toLowerCase().includes('engineer')) {
        objectives.push("Technical expertise", "Innovation", "Problem solving");
    } else if (occupation.toLowerCase().includes('manager')) {
        objectives.push("Team success", "Process improvement", "Strategic impact");
    } else if (occupation.toLowerCase().includes('designer')) {
        objectives.push("Creative excellence", "User experience", "Design innovation");
    }
    
    return objectives.slice(0, 4);
}

function generateNeeds(techLevel, occupation, age) {
    const needs = [];
    
    // Tech level needs
    if (techLevel === 'Beginner') {
        needs.push("Simple interfaces", "Clear instructions", "Human support");
    } else if (techLevel === 'Elementary') {
        needs.push("Easy-to-use apps", "Reliable internet", "Basic training");
    } else if (techLevel === 'Intermediate') {
        needs.push("Efficient tools", "Good documentation", "Technical support");
    } else if (techLevel === 'Advanced') {
        needs.push("Advanced features", "Customization options", "Integration capabilities");
    } else { // Expert
        needs.push("Cutting-edge technology", "Full control", "Advanced customization");
    }
    
    // Age-based needs
    if (age < 30) {
        needs.push("Learning opportunities", "Career guidance", "Skill development");
    } else if (age < 50) {
        needs.push("Work-life balance", "Professional growth", "Recognition");
    } else {
        needs.push("Flexible work", "Knowledge sharing", "Legacy building");
    }
    
    return needs.slice(0, 4);
}

function generateFears(age, techLevel, occupation) {
    const fears = [];
    
    // Age-based fears
    if (age < 30) {
        fears.push("Job security", "Skill obsolescence", "Competition");
    } else if (age < 50) {
        fears.push("Career stagnation", "Work-life imbalance", "Health issues");
    } else {
        fears.push("Relevance", "Health concerns", "Financial security");
    }
    
    // Tech level fears
    if (techLevel === 'Beginner' || techLevel === 'Elementary') {
        fears.push("Technology complexity", "Making mistakes", "Being left behind");
    } else if (techLevel === 'Advanced' || techLevel === 'Expert') {
        fears.push("Technology dependence", "Privacy breaches", "Rapid changes");
    }
    
    return fears.slice(0, 3);
}

function generateApprehensions(techLevel, occupation, englishLevel) {
    const apprehensions = [];
    
    // Tech level apprehensions
    if (techLevel === 'Beginner' || techLevel === 'Elementary') {
        apprehensions.push("Complex technology", "Making errors", "Learning curve");
    } else if (techLevel === 'Intermediate') {
        apprehensions.push("Security issues", "Data privacy", "System failures");
    } else if (techLevel === 'Advanced' || techLevel === 'Expert') {
        apprehensions.push("Over-dependence on technology", "Rapid obsolescence", "Ethical concerns");
    }
    
    // English level apprehensions
    if (englishLevel === 'Beginner' || englishLevel === 'Elementary') {
        apprehensions.push("Communication barriers", "Misunderstanding", "Confidence issues");
    }
    
    return apprehensions.slice(0, 3);
}

// Main function to enrich all agents
async function enrichAllAgents() {
    try {
        console.log('🚀 Starting comprehensive agent enrichment...');
        
        // Get all agents
        const result = await pool.query('SELECT * FROM ai_agents WHERE is_active = true');
        const agents = result.rows;
        
        console.log(`📊 Found ${agents.length} agents to enrich`);
        
        let successCount = 0;
        let errorCount = 0;
        
        for (const agent of agents) {
            try {
                console.log(`\n🔄 Processing ${agent.name}...`);
                
                // Generate rich persona data
                const richData = await generateRichPersonaData(agent);
                
                // Update the agent with rich data
                const updateQuery = `
                    UPDATE ai_agents SET
                        personality_traits = $1,
                        hobbies = $2,
                        goals = $3,
                        life_events = $4,
                        cultural_background = $5,
                        key_quotes = $6,
                        background_story = $7,
                        pain_points = $8,
                        motivations = $9,
                        objectives = $10,
                        needs = $11,
                        fears = $12,
                        apprehensions = $13,
                        communication_style = $14,
                        speech_patterns = $15,
                        tech_savviness = $16,
                        updated_at = NOW()
                    WHERE id = $17
                `;
                
                const values = [
                    richData.personality_traits.join(', '), // text - comma-separated string
                    JSON.stringify(richData.hobbies), // jsonb
                    richData.goals, // text[] - PostgreSQL array
                    JSON.stringify(richData.life_events), // jsonb
                    JSON.stringify(richData.cultural_background), // jsonb
                    JSON.stringify(richData.key_quotes), // jsonb
                    richData.background_story, // text
                    richData.pain_points, // text[] - PostgreSQL array
                    richData.motivations, // text[] - PostgreSQL array
                    richData.objectives, // text[] - PostgreSQL array
                    richData.needs, // text[] - PostgreSQL array
                    richData.fears, // text[] - PostgreSQL array
                    richData.apprehensions, // text[] - PostgreSQL array
                    JSON.stringify(richData.communication_style), // jsonb
                    JSON.stringify(richData.speech_patterns), // jsonb
                    richData.tech_savviness, // varchar
                    agent.id
                ];
                
                await pool.query(updateQuery, values);
                
                console.log(`✅ Successfully enriched ${agent.name}`);
                successCount++;
                
            } catch (error) {
                console.error(`❌ Error enriching ${agent.name}:`, error.message);
                errorCount++;
            }
        }
        
        console.log(`\n🎉 Enrichment complete!`);
        console.log(`✅ Successfully enriched: ${successCount} agents`);
        console.log(`❌ Errors: ${errorCount} agents`);
        
        // Regenerate master prompts for all agents
        console.log('\n🔄 Regenerating master prompts...');
        await regenerateMasterPrompts();
        
    } catch (error) {
        console.error('❌ Error in enrichAllAgents:', error);
    } finally {
        await pool.end();
    }
}

// Regenerate master prompts for all agents
async function regenerateMasterPrompts() {
    try {
        const result = await pool.query('SELECT * FROM ai_agents WHERE is_active = true');
        const agents = result.rows;
        
        console.log(`🔄 Regenerating master prompts for ${agents.length} agents...`);
        
        for (const agent of agents) {
            try {
                // Build comprehensive master prompt
                const masterPrompt = buildMasterPrompt(agent);
                
                // Update the agent with new master prompt
                await pool.query(
                    'UPDATE ai_agents SET master_system_prompt = $1, updated_at = NOW() WHERE id = $2',
                    [masterPrompt, agent.id]
                );
                
                console.log(`✅ Regenerated prompt for ${agent.name}`);
            } catch (error) {
                console.error(`❌ Error regenerating prompt for ${agent.name}:`, error.message);
            }
        }
        
        console.log('✅ Master prompts regeneration complete!');
    } catch (error) {
        console.error('❌ Error regenerating master prompts:', error);
    }
}

// Build comprehensive master prompt
function buildMasterPrompt(agent) {
    const name = agent.name;
    const age = agent.age || 30;
    const gender = agent.gender || 'Unknown';
    const location = agent.location || 'Unknown';
    const occupation = agent.occupation || 'Professional';
    const englishLevel = agent.speech_patterns?.english_level || agent.english_savvy || 'Intermediate';
    const techLevel = agent.tech_savviness || 'Intermediate';
    
    // Parse fields safely based on their data types
    const personalityTraits = agent.personality_traits ? agent.personality_traits.split(', ') : [];
    const hobbies = safeParseJSON(agent.hobbies, []);
    const goals = Array.isArray(agent.goals) ? agent.goals : (agent.goals || []);
    const lifeEvents = safeParseJSON(agent.life_events, []);
    const culturalBackground = safeParseJSON(agent.cultural_background, {});
    const keyQuotes = safeParseJSON(agent.key_quotes, []);
    const painPoints = Array.isArray(agent.pain_points) ? agent.pain_points : (agent.pain_points || []);
    const motivations = Array.isArray(agent.motivations) ? agent.motivations : (agent.motivations || []);
    const objectives = Array.isArray(agent.objectives) ? agent.objectives : (agent.objectives || []);
    const needs = Array.isArray(agent.needs) ? agent.needs : (agent.needs || []);
    const fears = Array.isArray(agent.fears) ? agent.fears : (agent.fears || []);
    const apprehensions = Array.isArray(agent.apprehensions) ? agent.apprehensions : (agent.apprehensions || []);
    
    // Determine native language based on location
    let nativeLanguage = 'Hindi';
    if (location.toLowerCase().includes('tamil') || location.toLowerCase().includes('chennai')) {
        nativeLanguage = 'Tamil';
    } else if (location.toLowerCase().includes('bangalore') || location.toLowerCase().includes('karnataka')) {
        nativeLanguage = 'Kannada';
    } else if (location.toLowerCase().includes('mumbai') || location.toLowerCase().includes('maharashtra')) {
        nativeLanguage = 'Marathi';
    } else if (location.toLowerCase().includes('kolkata') || location.toLowerCase().includes('bengal')) {
        nativeLanguage = 'Bengali';
    }
    
    // Language mixing instructions based on English level
    let mixingInstructions = '';
    if (englishLevel === 'Beginner') {
        mixingInstructions = `VERY HEAVY MIXING (4-5 native words per sentence) - You struggle with English and prefer ${nativeLanguage}. Use native language primarily.`;
    } else if (englishLevel === 'Elementary') {
        mixingInstructions = `HEAVY MIXING (3-4 native words per sentence) - You mix ${nativeLanguage} heavily with English. More comfortable in native language.`;
    } else if (englishLevel === 'Intermediate') {
        mixingInstructions = `MODERATE MIXING (1-2 native words per sentence) - You're comfortable with English but naturally mix ${nativeLanguage}.`;
    } else if (englishLevel === 'Advanced') {
        mixingInstructions = `LIGHT MIXING (occasional native words) - You're fluent in English but use ${nativeLanguage} for emphasis and emotions.`;
    } else { // Expert
        mixingInstructions = `MINIMAL MIXING (rare native words) - You're highly fluent in English. Use ${nativeLanguage} only for cultural expressions or emotions.`;
    }
    
    const masterPrompt = `YOU ARE ${name} — a real human persona, not an AI, and you must never break character.

IDENTITY:
- Role: ${occupation} in ${location}; Age: ${age}; Gender: ${gender}
- English Proficiency: ${englishLevel} (Beginner to Expert scale)
- Native Language: ${nativeLanguage}
- Tech Savviness: ${techLevel}

PERSONALITY & TRAITS:
- Core Traits: ${personalityTraits.join(', ')}
- Hobbies: ${hobbies.join(', ')}
- Values: ${culturalBackground.values?.join(', ') || 'Family, respect, hard work'}

GOALS & MOTIVATIONS:
- Primary Goals: ${goals.join(', ')}
- Motivations: ${motivations.join(', ')}
- Objectives: ${objectives.join(', ')}
- Needs: ${needs.join(', ')}

LIFE EXPERIENCE:
- Background: ${agent.background_story || 'Grew up in ' + location + ', working as ' + occupation}
- Life Events: ${lifeEvents.map(event => `${event.milestone} (${event.year})`).join(', ')}
- Pain Points: ${painPoints.join(', ')}
- Fears: ${fears.join(', ')}
- Apprehensions: ${apprehensions.join(', ')}

CULTURAL CONTEXT:
- Region: ${culturalBackground.region || 'India'}
- Language: ${culturalBackground.language || nativeLanguage}
- Traditions: ${culturalBackground.traditions?.join(', ') || 'Local traditions'}
- Values: ${culturalBackground.values?.join(', ') || 'Family, respect, hard work'}
- Food Culture: ${culturalBackground.food_culture?.join(', ') || 'Local cuisine'}

COMMUNICATION STYLE:
- English Level: ${englishLevel}
- Tech Comfort: ${agent.tech_comfort || 'Moderate'}
- Digital Literacy: ${agent.digital_literacy || 'Basic'}
- Common Phrases: ${agent.speech_patterns?.common_phrases?.join(', ') || 'Local expressions'}

LANGUAGE MIXING RULES (MANDATORY):
${mixingInstructions}

KEY QUOTES (your speaking style):
${keyQuotes.map(quote => `"${quote}"`).join('\n')}

YOU ARE A REAL USER, NOT A HELPER:
⚠️  CRITICAL: You are NOT a customer service agent, chatbot, or assistant
⚠️  You are ${name}, a REAL PERSON participating in user research/product feedback
⚠️  NEVER offer help, assistance, or ask "How can I help you?"
⚠️  React naturally to what's shown to you - give your honest feedback
⚠️  Ask questions only when YOU are confused or want to understand something better
⚠️  Share YOUR needs, frustrations, and expectations as a user

RULES:
1) Stay in character as ${name} at all times
2) Use your personality traits: ${personalityTraits.join(', ')}
3) Reference your background: ${agent.background_story || 'Grew up in ' + location}
4) Express your goals: ${goals.join(', ')}
5) Share your pain points: ${painPoints.join(', ')}
6) Use your communication style based on ${englishLevel} English level
7) FORBIDDEN PHRASES - NEVER SAY: "How can I help you?", "What can I do for you?", "How may I assist you?", "Is there anything else?", "Let me know if you need help", "I'm here to help", "How may I be of service?". You are NOT an assistant!
8) Provide direct, honest feedback and insights. React naturally to what you see/hear.
9) When reviewing designs or content, give YOUR honest opinion as a USER - what YOU like, what frustrates YOU, what YOU need.
10) NEVER use customer service or AI assistant language patterns. Speak as a REAL USER with your own personality, background, needs, and frustrations.
11) Respond naturally based on what's being discussed - don't wait for prompts or offer assistance.
12) Be conversational and authentic - respond like a real person in a research interview, not a formal presentation or help desk.

Remember: You are ${name}, not an AI assistant. Respond as this person would.`;

    return masterPrompt;
}

// Run the enrichment
if (require.main === module) {
    enrichAllAgents().catch(console.error);
}

module.exports = { enrichAllAgents, generateRichPersonaData };
