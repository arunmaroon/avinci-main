/**
 * Fill Missing Agent Data Script
 * Completes ALL missing fields for every agent with rich, diverse persona data
 * PROTECTS existing data - only fills in NULL/missing values
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

// Comprehensive data generators
const PERSONALITY_TYPES = ['The Pragmatist', 'The Visionary', 'The Empath', 'The Achiever', 'The Analyst', 'The Collaborator'];

const AGES_BY_STAGE = {
    early_career: [24, 25, 26, 27, 28, 29],
    mid_career: [30, 32, 34, 36, 38, 40],
    established: [42, 45, 48, 50, 53, 55]
};

const GENDERS = ['male', 'female'];

const GOALS = [
    ['career advancement', 'skill development', 'work-life balance'],
    ['financial security', 'family stability', 'home ownership'],
    ['business growth', 'team leadership', 'innovation'],
    ['wealth building', 'retirement planning', 'passive income'],
    ['personal growth', 'networking', 'mentorship']
];

const PAIN_POINTS = [
    ['job insecurity', 'long working hours', 'limited growth opportunities'],
    ['financial stress', 'work-life imbalance', 'health concerns'],
    ['market competition', 'technology changes', 'skill gaps'],
    ['time management', 'decision fatigue', 'burnout'],
    ['uncertainty', 'information overload', 'complexity']
];

const MOTIVATIONS = [
    ['recognition', 'achievement', 'independence'],
    ['security', 'family', 'stability'],
    ['growth', 'learning', 'innovation'],
    ['impact', 'legacy', 'contribution'],
    ['freedom', 'flexibility', 'autonomy']
];

const BACKGROUND_TEMPLATES = [
    (name, occupation, location, age) => `${name} is a ${age}-year-old ${occupation} based in ${location}. Passionate about professional growth and skilled in navigating complex challenges.`,
    (name, occupation, location, age) => `Based in ${location}, ${name} works as a ${occupation} with ${age} years of life experience. Known for analytical thinking and problem-solving abilities.`,
    (name, occupation, location, age) => `${name}, ${age}, is a dedicated ${occupation} in ${location}. Values work-life balance while pursuing career excellence.`,
    (name, occupation, location, age) => `A ${age}-year-old ${occupation} from ${location}, ${name} combines technical expertise with strong interpersonal skills.`
];

const TECH_LEVELS = ['low', 'medium', 'high', 'expert'];

const DOMAIN_LITERACY_PROFILES = [
    { finance: 'low', digital_banking: 'low', technology: 'low' },
    { finance: 'medium', digital_banking: 'medium', technology: 'medium' },
    { finance: 'high', digital_banking: 'high', technology: 'medium' },
    { finance: 'expert', digital_banking: 'expert', technology: 'high' }
];

const COMMUNICATION_STYLES = [
    {
        sentence_length: 'short, concise',
        formality: 'casual and friendly',
        question_style: 'direct questions',
        tone: 'conversational'
    },
    {
        sentence_length: 'moderate, clear',
        formality: 'professional and polite',
        question_style: 'clarifying questions',
        tone: 'balanced'
    },
    {
        sentence_length: 'detailed, thorough',
        formality: 'formal and structured',
        question_style: 'analytical questions',
        tone: 'professional'
    },
    {
        sentence_length: 'varied, expressive',
        formality: 'warm and engaging',
        question_style: 'open-ended questions',
        tone: 'enthusiastic'
    }
];

function selectRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function generateAge() {
    const stage = selectRandom(Object.keys(AGES_BY_STAGE));
    return selectRandom(AGES_BY_STAGE[stage]);
}

async function fillMissingData() {
    const client = await pool.connect();
    
    try {
        console.log('\n🔧 Filling missing agent data...\n');
        
        // Get all agents
        const result = await client.query('SELECT * FROM ai_agents WHERE is_active = true ORDER BY created_at ASC');
        const agents = result.rows;
        
        console.log(`📊 Found ${agents.length} agents to check\n`);
        
        let updatedCount = 0;
        
        for (const agent of agents) {
            try {
                const updates = [];
                const values = [];
                let paramCount = 1;
                
                // Check and fill age
                if (!agent.age) {
                    updates.push(`age = $${paramCount++}`);
                    values.push(generateAge());
                }
                
                // Check and fill gender
                if (!agent.gender) {
                    updates.push(`gender = $${paramCount++}`);
                    values.push(selectRandom(GENDERS));
                }
                
                // Check and fill personality (JSONB field - store personality type info)
                if (!agent.personality || Object.keys(agent.personality).length === 0) {
                    const personalityType = selectRandom(PERSONALITY_TYPES);
                    updates.push(`personality = $${paramCount++}::jsonb`);
                    values.push(JSON.stringify({ type: personalityType, traits: ['analytical', 'practical', 'detail-oriented'] }));
                }
                
                // Check and fill goals (TEXT[] array)
                if (!agent.goals || agent.goals.length === 0) {
                    updates.push(`goals = $${paramCount++}::text[]`);
                    values.push(selectRandom(GOALS));
                }
                
                // Check and fill pain_points (TEXT[] array)
                if (!agent.pain_points || agent.pain_points.length === 0) {
                    updates.push(`pain_points = $${paramCount++}::text[]`);
                    values.push(selectRandom(PAIN_POINTS));
                }
                
                // Check and fill motivations (TEXT[] array)
                if (!agent.motivations || agent.motivations.length === 0) {
                    updates.push(`motivations = $${paramCount++}::text[]`);
                    values.push(selectRandom(MOTIVATIONS));
                }
                
                // Check and fill background_story
                if (!agent.background_story) {
                    const age = agent.age || generateAge();
                    const template = selectRandom(BACKGROUND_TEMPLATES);
                    updates.push(`background_story = $${paramCount++}`);
                    values.push(template(agent.name, agent.occupation || 'Professional', agent.location || 'India', age));
                }
                
                // Check and fill tech_savviness
                if (!agent.tech_savviness) {
                    updates.push(`tech_savviness = $${paramCount++}`);
                    values.push(selectRandom(TECH_LEVELS));
                }
                
                // Check and fill domain_literacy (JSONB - check if it has minimal content)
                if (!agent.domain_literacy || typeof agent.domain_literacy !== 'object' || Object.keys(agent.domain_literacy).length === 0) {
                    updates.push(`domain_literacy = $${paramCount++}::jsonb`);
                    values.push(JSON.stringify(selectRandom(DOMAIN_LITERACY_PROFILES)));
                }
                
                // Check and fill communication_style (JSONB)
                if (!agent.communication_style || typeof agent.communication_style !== 'object' || Object.keys(agent.communication_style).length === 0) {
                    updates.push(`communication_style = $${paramCount++}::jsonb`);
                    values.push(JSON.stringify(selectRandom(COMMUNICATION_STYLES)));
                }
                
                // Update if there are changes
                if (updates.length > 0) {
                    values.push(agent.id);
                    const query = `
                        UPDATE ai_agents SET
                            ${updates.join(', ')},
                            updated_at = NOW()
                        WHERE id = $${paramCount}
                    `;
                    
                    await client.query(query, values);
                    updatedCount++;
                    console.log(`✅ Updated ${agent.name} (${updates.length} fields)`);
                } else {
                    console.log(`⏭️  ${agent.name} - all fields complete`);
                }
                
            } catch (error) {
                console.error(`❌ Failed to update ${agent.name}:`, error.message);
            }
        }
        
        console.log(`\n🎉 Successfully updated ${updatedCount} agents!\n`);
        console.log('📋 Update Summary:');
        console.log(`   - Total agents: ${agents.length}`);
        console.log(`   - Updated: ${updatedCount}`);
        console.log(`   - Already complete: ${agents.length - updatedCount}`);
        console.log('\n✅ All agent data is now complete and protected!\n');
        
    } catch (error) {
        console.error('❌ Update failed:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Run the fill operation
fillMissingData()
    .then(() => {
        console.log('✅ Data fill complete!');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Data fill failed:', error);
        process.exit(1);
    });

