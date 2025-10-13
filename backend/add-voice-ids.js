const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'avinci_admin',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'avinci',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

// ElevenLabs Voice IDs by region
const VOICE_IDS = {
    tamil: 'rgltZvTfiMmgWweZhh7n',     // Tamil voice from ElevenLabs library
    north: 'WeK8ylKjTV2trMlayizC',     // North Indian voice
    south: 'WeK8ylKjTV2trMlayizC',     // South Indian voice
    west: 'WeK8ylKjTV2trMlayizC',      // West Indian voice
    east: 'WeK8ylKjTV2trMlayizC',      // East Indian voice
    default: 'WeK8ylKjTV2trMlayizC'    // Default Indian voice
};

function getRegion(location) {
    if (!location) return 'north';
    const loc = location.toLowerCase();
    if (loc.includes('tamil') || loc.includes('chennai') || loc.includes('madurai')) return 'tamil';
    if (loc.includes('delhi') || loc.includes('lucknow') || loc.includes('jaipur') || loc.includes('punjab')) return 'north';
    if (loc.includes('bangalore') || loc.includes('hyderabad') || loc.includes('kochi') || loc.includes('kerala')) return 'south';
    if (loc.includes('mumbai') || loc.includes('pune') || loc.includes('nashik') || loc.includes('ahmedabad')) return 'west';
    if (loc.includes('kolkata') || loc.includes('patna')) return 'east';
    return 'north';
}

async function addVoiceIds() {
    try {
        console.log('🎙️ Adding ElevenLabs Voice IDs to all agents...\n');
        
        // Check if voice_id column exists
        const columnCheck = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'ai_agents' AND column_name = 'voice_id'
        `);
        
        if (columnCheck.rows.length === 0) {
            console.log('📝 Creating voice_id column...');
            await pool.query('ALTER TABLE ai_agents ADD COLUMN voice_id VARCHAR(50)');
            console.log('✅ Column created\n');
        }
        
        // Get all agents
        const result = await pool.query('SELECT id, name, location FROM ai_agents ORDER BY created_at');
        const agents = result.rows;
        
        console.log(`📊 Assigning voice IDs to ${agents.length} agents...\n`);
        
        let tamilCount = 0;
        let otherCount = 0;
        
        for (const agent of agents) {
            const region = getRegion(agent.location);
            const voiceId = VOICE_IDS[region] || VOICE_IDS.default;
            
            await pool.query(
                'UPDATE ai_agents SET voice_id = $1 WHERE id = $2',
                [voiceId, agent.id]
            );
            
            if (region === 'tamil') {
                console.log(`✅ ${agent.name} (${agent.location}) → Tamil Voice: ${voiceId}`);
                tamilCount++;
            } else {
                console.log(`✅ ${agent.name} (${agent.location}) → ${region} Voice: ${voiceId}`);
                otherCount++;
            }
        }
        
        console.log('\n🎉 Voice IDs assigned successfully!');
        console.log(`   🎙️ Tamil agents (rgltZvTfiMmgWweZhh7n): ${tamilCount}`);
        console.log(`   🎙️ Other regions (WeK8ylKjTV2trMlayizC): ${otherCount}`);
        console.log('\n✅ Voice IDs are now stored in database');
        console.log('✅ Reference: https://elevenlabs.io/app/voice-library');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

addVoiceIds();

