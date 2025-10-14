const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'avinci_admin',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'avinci',
    password: process.env.DB_PASSWORD || 'avinci_password',
    port: process.env.DB_PORT || 5432,
});

// Comprehensive persona data templates
const personaTemplates = {
    // Personality Traits
    personalityTraits: [
        "Analytical", "Creative", "Detail-oriented", "Strategic", "Empathetic", "Pragmatic", 
        "Innovative", "Collaborative", "Independent", "Adaptable", "Persistent", "Curious",
        "Methodical", "Intuitive", "Diplomatic", "Assertive", "Patient", "Energetic",
        "Thoughtful", "Spontaneous", "Organized", "Flexible", "Confident", "Humble"
    ],
    
    // Values
    values: [
        "Honesty", "Integrity", "Excellence", "Innovation", "Collaboration", "Growth",
        "Family", "Community", "Sustainability", "Transparency", "Respect", "Equality",
        "Learning", "Service", "Quality", "Efficiency", "Creativity", "Reliability"
    ],
    
    // Hobbies & Interests
    hobbies: [
        "Reading", "Writing", "Cooking", "Gardening", "Photography", "Music", "Dancing",
        "Sports", "Travel", "Art", "Technology", "Volunteering", "Meditation", "Yoga",
        "Chess", "Gaming", "Fitness", "Movies", "Theater", "Crafting", "Hiking", "Swimming"
    ],
    
    // Goals & Motivations
    primaryGoals: [
        "Career advancement", "Skill development", "Financial stability", "Work-life balance",
        "Leadership growth", "Innovation", "Impact", "Learning", "Mentoring", "Entrepreneurship"
    ],
    
    secondaryGoals: [
        "Health improvement", "Relationship building", "Community service", "Creative expression",
        "Travel", "Education", "Personal growth", "Hobby mastery", "Network expansion"
    ],
    
    motivations: [
        "Making a difference", "Continuous learning", "Financial security", "Recognition",
        "Personal fulfillment", "Family support", "Professional growth", "Innovation",
        "Leadership", "Mentoring others", "Creative expression", "Social impact"
    ],
    
    // Pain Points
    generalFrustrations: [
        "Time management", "Work-life balance", "Technology complexity", "Communication gaps",
        "Resource constraints", "Unclear expectations", "Bureaucracy", "Information overload",
        "Decision paralysis", "Change resistance", "Skill gaps", "Competition"
    ],
    
    uxIssues: [
        "Poor navigation", "Slow loading times", "Complex interfaces", "Mobile responsiveness",
        "Accessibility barriers", "Inconsistent design", "Hidden features", "Error messages",
        "Onboarding complexity", "Search functionality", "Data visualization", "User feedback"
    ],
    
    recurringConcerns: [
        "Technical debt", "Legacy systems", "Scope creep", "Meeting overload", "Context switching",
        "Resource allocation", "Timeline pressure", "Quality vs speed", "Team dynamics",
        "Stakeholder alignment", "Technology updates", "Security concerns", "Performance issues"
    ],
    
    // Daily Rhythm
    habits: [
        "Morning routine", "Exercise", "Meditation", "Planning", "Learning", "Networking",
        "Email management", "Break scheduling", "Evening reflection", "Family time",
        "Skill practice", "Reading", "Journaling", "Goal review", "Health monitoring"
    ],
    
    dailyRoutine: [
        "Early riser (6 AM)", "Morning exercise", "Healthy breakfast", "Commute planning",
        "Work focus blocks", "Lunch break", "Afternoon meetings", "Evening wind-down",
        "Family dinner", "Personal time", "Sleep preparation", "Weekend activities"
    ],
    
    decisionStyle: [
        "Data-driven", "Intuitive", "Collaborative", "Analytical", "Quick", "Deliberate",
        "Risk-averse", "Opportunistic", "Consensus-based", "Authoritative", "Flexible"
    ],
    
    influences: [
        "Industry leaders", "Mentors", "Colleagues", "Family", "Books", "Podcasts",
        "Conferences", "Online communities", "Professional networks", "Success stories",
        "Failure lessons", "Market trends", "Technology updates", "User feedback"
    ],
    
    // Fintech Behavior
    fintechUsage: [
        "Mobile banking", "Digital payments", "Investment apps", "Budget tracking",
        "Credit monitoring", "Insurance apps", "Loan applications", "Tax software",
        "Cryptocurrency", "P2P payments", "Subscription management", "Financial planning"
    ],
    
    // Social & Cultural Context
    family: [
        "Nuclear family", "Extended family", "Single parent", "Joint family", "Empty nesters",
        "Young parents", "Elderly care", "Multi-generational", "Pet owners", "Child-free"
    ],
    
    friends: [
        "College friends", "Work colleagues", "Neighborhood friends", "Online friends",
        "Hobby groups", "Professional network", "Childhood friends", "Travel companions",
        "Gym buddies", "Book club", "Volunteer groups", "Religious community"
    ],
    
    communityValues: [
        "Education", "Healthcare", "Environment", "Safety", "Diversity", "Innovation",
        "Tradition", "Progress", "Equality", "Service", "Creativity", "Sustainability"
    ],
    
    culturalHeritage: [
        "North Indian", "South Indian", "East Indian", "West Indian", "Northeast Indian",
        "Mixed heritage", "Urban", "Rural", "Traditional", "Modern", "International"
    ],
    
    beliefs: [
        "Hard work pays off", "Family first", "Continuous learning", "Service to others",
        "Innovation drives progress", "Balance is key", "Quality over quantity",
        "Collaboration wins", "Respect for all", "Adaptability", "Integrity matters"
    ],
    
    // Life Events
    lifeEvents: [
        "Graduation", "First job", "Marriage", "Children", "Career change", "Relocation",
        "Health challenge", "Loss of loved one", "Major achievement", "Financial milestone",
        "Travel experience", "Skill acquisition", "Leadership role", "Entrepreneurship"
    ],
    
    // Voice & Tone
    communicationStyle: [
        "Professional", "Casual", "Friendly", "Direct", "Diplomatic", "Enthusiastic",
        "Calm", "Assertive", "Collaborative", "Supportive", "Analytical", "Creative"
    ],
    
    keyPhrases: [
        "Let me think about this", "That's interesting", "I understand", "Let's discuss",
        "What do you think?", "I agree", "That makes sense", "Let's try this",
        "Good point", "I see", "Absolutely", "Definitely", "For sure", "Exactly"
    ],
    
    recommendations: [
        "Try this approach", "Consider this option", "I suggest", "You might want to",
        "Have you thought about", "What if we", "Let's explore", "I recommend",
        "This could work", "Worth considering", "Good idea", "Let's do this"
    ]
};

// Generate rich persona data
function generateRichPersonaData(agent) {
    const random = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const randomMultiple = (arr, count) => {
        const shuffled = [...arr].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    };
    
    // Generate personality traits (3-5 traits)
    const personalityTraits = randomMultiple(personaTemplates.personalityTraits, 3 + Math.floor(Math.random() * 3));
    
    // Generate values (4-6 values)
    const values = randomMultiple(personaTemplates.values, 4 + Math.floor(Math.random() * 3));
    
    // Generate hobbies (3-5 hobbies)
    const hobbies = randomMultiple(personaTemplates.hobbies, 3 + Math.floor(Math.random() * 3));
    
    // Generate goals
    const primaryGoals = randomMultiple(personaTemplates.primaryGoals, 2 + Math.floor(Math.random() * 2));
    const secondaryGoals = randomMultiple(personaTemplates.secondaryGoals, 2 + Math.floor(Math.random() * 2));
    const motivations = randomMultiple(personaTemplates.motivations, 3 + Math.floor(Math.random() * 2));
    
    // Generate pain points
    const generalFrustrations = randomMultiple(personaTemplates.generalFrustrations, 3 + Math.floor(Math.random() * 2));
    const uxIssues = randomMultiple(personaTemplates.uxIssues, 2 + Math.floor(Math.random() * 2));
    const recurringConcerns = randomMultiple(personaTemplates.recurringConcerns, 3 + Math.floor(Math.random() * 2));
    
    // Generate daily rhythm
    const habits = randomMultiple(personaTemplates.habits, 4 + Math.floor(Math.random() * 3));
    const dailyRoutine = randomMultiple(personaTemplates.dailyRoutine, 5 + Math.floor(Math.random() * 3));
    const decisionStyle = random(personaTemplates.decisionStyle);
    const influences = randomMultiple(personaTemplates.influences, 4 + Math.floor(Math.random() * 3));
    
    // Generate fintech behavior
    const fintechUsage = randomMultiple(personaTemplates.fintechUsage, 4 + Math.floor(Math.random() * 3));
    
    // Generate social context
    const family = random(personaTemplates.family);
    const friends = randomMultiple(personaTemplates.friends, 3 + Math.floor(Math.random() * 2));
    const communityValues = randomMultiple(personaTemplates.communityValues, 3 + Math.floor(Math.random() * 2));
    const culturalHeritage = random(personaTemplates.culturalHeritage);
    const beliefs = randomMultiple(personaTemplates.beliefs, 3 + Math.floor(Math.random() * 2));
    
    // Generate life events with years
    const lifeEvents = [];
    const events = randomMultiple(personaTemplates.lifeEvents, 3 + Math.floor(Math.random() * 2));
    events.forEach((event, index) => {
        const year = 2020 + Math.floor(Math.random() * 4);
        const impact = random(['High', 'Medium', 'Low']);
        lifeEvents.push({
            milestone: event,
            year: year,
            impact: impact
        });
    });
    
    // Generate voice & tone
    const communicationStyle = random(personaTemplates.communicationStyle);
    const keyPhrases = randomMultiple(personaTemplates.keyPhrases, 4 + Math.floor(Math.random() * 3));
    const recommendations = randomMultiple(personaTemplates.recommendations, 3 + Math.floor(Math.random() * 2));
    
    return {
        personality_traits: personalityTraits.join(', '),
        traits: {
            personality: personalityTraits,
            values: values,
            characteristics: randomMultiple(personaTemplates.personalityTraits, 2)
        },
        hobbies: {
            interests: hobbies,
            activities: randomMultiple(personaTemplates.hobbies, 2)
        },
        goals: primaryGoals,
        objectives: secondaryGoals,
        motivations: motivations,
        pain_points: generalFrustrations,
        frustrations: uxIssues,
        apprehensions: recurringConcerns,
        daily_routine: {
            habits: habits,
            schedule: dailyRoutine,
            preferences: randomMultiple(personaTemplates.dailyRoutine, 2)
        },
        decision_making: {
            style: decisionStyle,
            influences: influences,
            factors: randomMultiple(personaTemplates.influences, 2)
        },
        fintech_preferences: {
            usage: fintechUsage,
            preferences: randomMultiple(personaTemplates.fintechUsage, 2)
        },
        social_context: {
            family: family,
            friends: friends,
            community: communityValues,
            relationships: randomMultiple(personaTemplates.friends, 2)
        },
        cultural_background: {
            heritage: culturalHeritage,
            values: communityValues,
            beliefs: beliefs,
            traditions: randomMultiple(personaTemplates.beliefs, 2)
        },
        life_events: lifeEvents,
        communication_style: {
            tone: communicationStyle,
            phrases: keyPhrases,
            recommendations: recommendations,
            patterns: randomMultiple(personaTemplates.keyPhrases, 2)
        }
    };
}

async function enrichAllPersonas() {
    try {
        console.log('🚀 Starting comprehensive persona enrichment...');
        
        // Get all agents
        const agentsResult = await pool.query('SELECT id, name, gender, location FROM ai_agents ORDER BY name');
        const agents = agentsResult.rows;
        
        console.log(`📊 Found ${agents.length} agents to enrich`);
        
        for (const agent of agents) {
            console.log(`\n🎭 Enriching ${agent.name} (${agent.gender}, ${agent.location})...`);
            
            const richData = generateRichPersonaData(agent);
            
            // Update the agent with rich data
            const updateQuery = `
                UPDATE ai_agents SET
                    personality_traits = $1,
                    traits = $2,
                    hobbies = $3,
                    goals = $4,
                    objectives = $5,
                    motivations = $6,
                    pain_points = $7,
                    frustrations = $8,
                    apprehensions = $9,
                    daily_routine = $10,
                    decision_making = $11,
                    fintech_preferences = $12,
                    social_context = $13,
                    cultural_background = $14,
                    life_events = $15,
                    communication_style = $16,
                    updated_at = NOW()
                WHERE id = $17
            `;
            
            const values = [
                richData.personality_traits,
                JSON.stringify(richData.traits),
                JSON.stringify(richData.hobbies),
                richData.goals,
                richData.objectives,
                richData.motivations,
                richData.pain_points,
                richData.frustrations,
                richData.apprehensions,
                JSON.stringify(richData.daily_routine),
                JSON.stringify(richData.decision_making),
                JSON.stringify(richData.fintech_preferences),
                JSON.stringify(richData.social_context),
                JSON.stringify(richData.cultural_background),
                JSON.stringify(richData.life_events),
                JSON.stringify(richData.communication_style),
                agent.id
            ];
            
            await pool.query(updateQuery, values);
            
            console.log(`✅ Enriched ${agent.name} with comprehensive data`);
            console.log(`   - Personality Traits: ${richData.personality_traits}`);
            console.log(`   - Values: ${richData.values}`);
            console.log(`   - Hobbies: ${richData.hobbies}`);
            console.log(`   - Primary Goals: ${richData.primary_goals}`);
            console.log(`   - Life Events: ${richData.life_events}`);
        }
        
        console.log('\n🎉 All personas enriched successfully!');
        console.log('📊 Summary:');
        console.log(`   - ${agents.length} agents updated`);
        console.log('   - All missing fields filled with rich, detailed information');
        console.log('   - No more "not documented" or "not captured" entries');
        
    } catch (error) {
        console.error('❌ Error enriching personas:', error);
    } finally {
        await pool.end();
    }
}

// Run the enrichment
enrichAllPersonas();
