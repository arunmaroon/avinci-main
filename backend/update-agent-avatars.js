const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'avinci_admin',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'avinci',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

// Generate unique Indian avatar based on agent data
const generateIndianAvatar = (agent, index) => {
    const gender = agent.gender?.toLowerCase() || 'male';
    const location = agent.location?.toLowerCase() || '';
    const age = agent.age || 30;
    
    // Indian avatar service URLs with different parameters for uniqueness
    const baseUrl = 'https://api.dicebear.com/7.x/avataaars/svg';
    const seed = `${agent.name}-${agent.id}-${index}`;
    
    // Different styles based on region and gender
    let style = 'circle';
    if (location.includes('tamil') || location.includes('chennai')) {
        style = 'circle'; // South Indian style
    } else if (location.includes('delhi') || location.includes('punjab')) {
        style = 'circle'; // North Indian style
    } else if (location.includes('mumbai') || location.includes('maharashtra')) {
        style = 'circle'; // West Indian style
    } else if (location.includes('kolkata') || location.includes('bengal')) {
        style = 'circle'; // East Indian style
    }
    
    const params = new URLSearchParams({
        seed: seed,
        backgroundColor: gender === 'female' ? 'ffd1dc' : '87ceeb' // Pink for female, light blue for male
    });
    
    return `${baseUrl}?${params.toString()}`;
};

async function updateAgentAvatars() {
    try {
        console.log('🔄 Fetching all agents...');
        
        // Get all agents
        const result = await pool.query('SELECT id, name, gender, location, age FROM ai_agents ORDER BY created_at');
        const agents = result.rows;
        
        console.log(`📊 Found ${agents.length} agents to update`);
        
        // Update each agent's avatar_url
        for (let i = 0; i < agents.length; i++) {
            const agent = agents[i];
            const newAvatarUrl = generateIndianAvatar(agent, i);
            
            await pool.query(
                'UPDATE ai_agents SET avatar_url = $1 WHERE id = $2',
                [newAvatarUrl, agent.id]
            );
            
            console.log(`✅ Updated ${agent.name} (${i + 1}/${agents.length})`);
        }
        
        console.log('🎉 All agent avatars updated successfully!');
        
    } catch (error) {
        console.error('❌ Error updating avatars:', error);
    } finally {
        await pool.end();
    }
}

updateAgentAvatars();
