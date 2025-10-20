/**
 * Update Agent Images Script
 * Assigns varied Indian images to existing agents based on their persona traits
 * Uses Pexels API integration for realistic, diverse images
 */

const axios = require('axios');
const { Pool } = require('pg');
const ImageFetcher = require('../utils/image_fetcher');

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'avinci_admin',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'avinci',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

// Initialize image fetcher
const imageFetcher = new ImageFetcher();

/**
 * Get all agents from database
 */
async function getAllAgents() {
  try {
    const result = await pool.query(`
      SELECT id, name, occupation, location, age, gender, 
             education, tech_savviness, communication_style, 
             personality, demographics, avatar_url, category,
             employment_type, cultural_background, tech_usage
      FROM ai_agents 
      WHERE is_active = true
      ORDER BY created_at DESC
    `);
    return result.rows;
  } catch (error) {
    console.error('❌ Error fetching agents:', error);
    throw error;
  }
}

/**
 * Update agent with new image
 */
async function updateAgentImage(agentId, imageData) {
  try {
    const result = await pool.query(
      'UPDATE ai_agents SET avatar_url = $1, updated_at = NOW() WHERE id = $2',
      [imageData.url, agentId]
    );
    return result.rowCount > 0;
  } catch (error) {
    console.error(`❌ Error updating agent ${agentId}:`, error);
    throw error;
  }
}

/**
 * Build persona data from agent for image fetching
 */
function buildPersonaDataFromAgent(agent) {
  // Extract gender from demographics or infer from name
  let gender = agent.gender;
  if (!gender) {
    // Simple gender inference from common Indian names
    const femaleNames = ['priya', 'kavya', 'neha', 'divya', 'manjula', 'lakshmi'];
    const name = agent.name.toLowerCase();
    gender = femaleNames.some(femaleName => name.includes(femaleName)) ? 'female' : 'male';
  }

  // Extract ethnicity from cultural_background or assume Indian
  let ethnicity = 'Indian';
  if (agent.cultural_background) {
    if (typeof agent.cultural_background === 'string') {
      ethnicity = agent.cultural_background;
    } else if (agent.cultural_background.ethnicity) {
      ethnicity = agent.cultural_background.ethnicity;
    }
  }

  // Build communication style object
  let communicationStyle = {};
  if (agent.communication_style) {
    if (typeof agent.communication_style === 'string') {
      try {
        communicationStyle = JSON.parse(agent.communication_style);
      } catch (e) {
        communicationStyle = { tone: agent.communication_style };
      }
    } else {
      communicationStyle = agent.communication_style;
    }
  }

  // Determine tech savviness level
  let techSavviness = agent.tech_savviness || 'Intermediate';
  if (typeof techSavviness === 'string') {
    techSavviness = techSavviness.toLowerCase();
    if (techSavviness.includes('expert') || techSavviness.includes('high')) {
      techSavviness = 'Expert';
    } else if (techSavviness.includes('advanced')) {
      techSavviness = 'Advanced';
    } else if (techSavviness.includes('beginner') || techSavviness.includes('low')) {
      techSavviness = 'Beginner';
    } else {
      techSavviness = 'Intermediate';
    }
  }

  // Extract personality archetype
  let personalityArchetype = 'Professional';
  if (agent.personality) {
    if (typeof agent.personality === 'string') {
      try {
        const personality = JSON.parse(agent.personality);
        personalityArchetype = personality.archetype || personality.type || 'Professional';
      } catch (e) {
        personalityArchetype = agent.personality;
      }
    } else if (agent.personality.archetype) {
      personalityArchetype = agent.personality.archetype;
    }
  }

  // Determine lifestyle based on occupation and tech usage
  let lifestyle = 'Urban Professional';
  if (agent.occupation) {
    const occupation = agent.occupation.toLowerCase();
    if (occupation.includes('driver') || occupation.includes('delivery') || occupation.includes('rickshaw')) {
      lifestyle = 'Working Class';
    } else if (occupation.includes('shop') || occupation.includes('owner') || occupation.includes('tailor')) {
      lifestyle = 'Small Business';
    } else if (occupation.includes('housekeeping') || occupation.includes('staff')) {
      lifestyle = 'Service Worker';
    } else if (occupation.includes('manager') || occupation.includes('director') || occupation.includes('executive')) {
      lifestyle = 'Corporate Professional';
    }
  }

  return {
    name: agent.name,
    age: agent.age || 30,
    gender: gender,
    ethnicity: ethnicity,
    occupation: agent.occupation || 'Professional',
    location: agent.location || 'India',
    industry: agent.employment_type || 'Technology',
    education: agent.education || 'Graduate',
    tech_savviness: techSavviness,
    communication_style: communicationStyle,
    personality_archetype: personalityArchetype,
    lifestyle: lifestyle
  };
}

/**
 * Process agents in batches
 */
async function processAgentsInBatches(agents, batchSize = 5) {
  const results = [];
  
  for (let i = 0; i < agents.length; i += batchSize) {
    const batch = agents.slice(i, i + batchSize);
    console.log(`\n🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(agents.length / batchSize)}`);
    
    const batchPromises = batch.map(async (agent) => {
      try {
        console.log(`\n👤 Processing: ${agent.name} (${agent.role_title})`);
        
        // Build persona data
        const personaData = buildPersonaDataFromAgent(agent);
        console.log(`   📊 Persona data: ${personaData.gender}, ${personaData.age}, ${personaData.occupation}, ${personaData.location}`);
        
        // Fetch new image
        const imageData = await imageFetcher.fetchPersonaImage(personaData);
        console.log(`   🖼️  New image: ${imageData.url}`);
        console.log(`   📸 Attribution: ${imageData.attribution}`);
        
        // Update agent in database
        const updated = await updateAgentImage(agent.id, imageData);
        
        if (updated) {
          console.log(`   ✅ Updated successfully`);
          return {
            agentId: agent.id,
            agentName: agent.name,
            success: true,
            imageUrl: imageData.url,
            attribution: imageData.attribution
          };
        } else {
          console.log(`   ❌ Failed to update database`);
          return {
            agentId: agent.id,
            agentName: agent.name,
            success: false,
            error: 'Database update failed'
          };
        }
        
      } catch (error) {
        console.error(`   ❌ Error processing ${agent.name}:`, error.message);
        return {
          agentId: agent.id,
          agentName: agent.name,
          success: false,
          error: error.message
        };
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);
    
    // Add delay between batches to respect rate limits
    if (i + batchSize < agents.length) {
      console.log(`   ⏳ Waiting 2 seconds before next batch...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  return results;
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('🚀 Starting agent image update process...');
    console.log('📊 Using Pexels API for varied Indian images based on persona traits\n');
    
    // Get all agents
    console.log('📋 Fetching all agents from database...');
    const agents = await getAllAgents();
    console.log(`✅ Found ${agents.length} agents to process\n`);
    
    // Process agents in batches
    const results = await processAgentsInBatches(agents);
    
    // Summary
    console.log('\n📊 SUMMARY');
    console.log('='.repeat(50));
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    console.log(`✅ Successfully updated: ${successful.length} agents`);
    console.log(`❌ Failed to update: ${failed.length} agents`);
    
    if (successful.length > 0) {
      console.log('\n🎉 Successfully updated agents:');
      successful.forEach(result => {
        console.log(`   • ${result.agentName} - ${result.attribution}`);
      });
    }
    
    if (failed.length > 0) {
      console.log('\n⚠️  Failed agents:');
      failed.forEach(result => {
        console.log(`   • ${result.agentName} - ${result.error}`);
      });
    }
    
    console.log('\n🎯 All agents now have varied Indian images based on their persona traits!');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
    await imageFetcher.close();
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { main, processAgentsInBatches, buildPersonaDataFromAgent };
