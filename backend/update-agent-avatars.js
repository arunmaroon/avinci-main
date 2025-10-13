const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'avinci_admin',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'avinci',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

// Generate unique Indian avatar based on agent data with realistic demographics
const generateIndianAvatar = (agent, index) => {
    const gender = agent.gender?.toLowerCase() || 'male';
    const location = agent.location?.toLowerCase() || '';
    const age = agent.age || 30;
    const role = ''; // Role not available in current schema
    
    const baseUrl = 'https://api.dicebear.com/7.x/avataaars/svg';
    const seed = `${agent.name}-${agent.id}-${index}`;
    
    // Determine age-appropriate features
    const isYoung = age < 30;
    const isMiddleAged = age >= 30 && age < 50;
    const isSenior = age >= 50;
    
    // Indian skin tones based on region and demographics
    const indianSkinTones = [
        'fdbcb4', // Light Indian
        'fd9841', // Medium Indian
        'c68642', // Tan Indian
        '8d5524', // Dark Indian
        'd08b5b', // Golden Indian
        'f4c2a1'  // Fair Indian
    ];
    
    // Hair colors common in India
    const indianHairColors = [
        'black',    // Most common
        'brown',    // Common
        'auburn',   // Less common
        'blonde'    // Rare but exists
    ];
    
    // Eye colors common in India
    const indianEyeColors = [
        'brown',    // Most common
        'black',    // Very common
        'hazel',    // Less common
        'blue'      // Rare but exists
    ];
    
    // Professional clothing based on role
    const getClothingForRole = (role) => {
        if (role.includes('doctor') || role.includes('medical')) {
            return 'blazerShirt'; // Professional medical look
        } else if (role.includes('manager') || role.includes('director') || role.includes('executive')) {
            return 'blazerShirt'; // Business professional
        } else if (role.includes('engineer') || role.includes('developer') || role.includes('analyst')) {
            return 'hoodie'; // Tech casual
        } else if (role.includes('sales') || role.includes('agent')) {
            return 'shirtCrewNeck'; // Sales professional
        } else if (role.includes('owner') || role.includes('business')) {
            return 'blazerShirt'; // Business owner
        } else {
            return 'shirtCrewNeck'; // Default professional
        }
    };
    
    // Accessories based on age and role
    const getAccessories = (age, role) => {
        if (age >= 40) {
            return 'prescription01'; // Reading glasses for older professionals
        } else if (role.includes('doctor') || role.includes('medical')) {
            return 'blank'; // Medical professionals typically don't wear accessories
        } else {
            return 'blank'; // Young professionals
        }
    };
    
    // Facial hair for male agents based on age and region
    const getFacialHair = (gender, age, location) => {
        if (gender !== 'male') return 'blank';
        
        if (age < 25) return 'blank'; // Young, clean-shaven
        if (age >= 25 && age < 35) {
            // Some young professionals have light facial hair
            return Math.random() > 0.7 ? 'beardLight' : 'blank';
        }
        if (age >= 35) {
            // Older professionals more likely to have facial hair
            const options = ['blank', 'beardLight', 'beardMedium'];
            return options[Math.floor(Math.random() * options.length)];
        }
        return 'blank';
    };
    
    // Hair style based on age and gender
    const getHairStyle = (gender, age) => {
        if (gender === 'female') {
            if (age < 30) return 'longHair'; // Young women - long hair
            if (age >= 30 && age < 50) return 'longHair'; // Middle-aged women
            return 'longHair'; // Senior women
        } else {
            if (age < 30) return 'shortHair'; // Young men - short hair
            if (age >= 30 && age < 50) return 'shortHair'; // Middle-aged men
            return 'shortHair'; // Senior men
        }
    };
    
    // Select appropriate features
    const skinTone = indianSkinTones[index % indianSkinTones.length];
    const hairColor = indianHairColors[index % indianHairColors.length];
    const eyeColor = indianEyeColors[index % indianEyeColors.length];
    const clothing = getClothingForRole(role);
    const accessories = getAccessories(age, role);
    const facialHair = getFacialHair(gender, age, location);
    const hairStyle = getHairStyle(gender, age);
    
    // Background color based on gender and age
    let backgroundColor;
    if (gender === 'female') {
        backgroundColor = isYoung ? 'ffd1dc' : 'f0e6ff'; // Pink for young, purple for mature
    } else {
        backgroundColor = isYoung ? '87ceeb' : 'e6f3ff'; // Light blue for young, darker blue for mature
    }
    
    const params = new URLSearchParams({
        seed: seed,
        backgroundColor: backgroundColor,
        skinColor: skinTone,
        hairColor: hairColor,
        eyeColor: eyeColor,
        clotheType: clothing,
        clotheColor: ['262e33', '65c9ff', '5199e4', '2c3e50', '34495e'][index % 5],
        mouthType: isSenior ? 'smile' : 'grin', // Older people more likely to smile
        eyebrowType: gender === 'female' ? 'raised' : 'default',
        accessoriesType: accessories,
        facialHairType: facialHair,
        topType: hairStyle
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
