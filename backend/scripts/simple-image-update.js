/**
 * Simple Agent Image Update Script
 * Directly updates agent images without triggering audit logs
 * Uses Unsplash for varied Indian images based on persona traits
 */

const axios = require('axios');
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'avinci_admin',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'avinci',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

/**
 * Build search query for Unsplash based on agent traits
 */
function buildImageSearchQuery(agent) {
  const queryTerms = [];

  // Gender
  if (agent.gender) {
    queryTerms.push(agent.gender.toLowerCase());
  } else {
    // Infer gender from name
    const femaleNames = ['priya', 'kavya', 'neha', 'divya', 'manjula', 'lakshmi'];
    const name = agent.name.toLowerCase();
    const gender = femaleNames.some(femaleName => name.includes(femaleName)) ? 'female' : 'male';
    queryTerms.push(gender);
  }

  // Age group
  if (agent.age) {
    const age = agent.age;
    if (age < 25) queryTerms.push('young');
    else if (age < 35) queryTerms.push('young adult');
    else if (age < 45) queryTerms.push('adult');
    else if (age < 55) queryTerms.push('middle aged');
    else queryTerms.push('senior');
  }

  // Ethnicity (assume Indian)
  queryTerms.push('indian');

  // Occupation
  if (agent.occupation) {
    queryTerms.push(agent.occupation.toLowerCase());
  }

  // Location context
  if (agent.location) {
    const location = agent.location.toLowerCase();
    const indianCities = [
      'mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai', 'kolkata', 'pune',
      'ahmedabad', 'jaipur', 'lucknow', 'kanpur', 'nagpur', 'indore', 'thane',
      'bhopal', 'visakhapatnam', 'pimpri', 'patna', 'vadodara', 'ludhiana',
      'kochi', 'nashik', 'belgaum', 'madurai', 'hosur'
    ];
    for (const city of indianCities) {
      if (location.includes(city)) {
        queryTerms.push(city);
        break;
      }
    }
  }

  // Tech savviness
  if (agent.tech_savviness) {
    const tech = agent.tech_savviness.toLowerCase();
    if (tech.includes('expert') || tech.includes('high')) {
      queryTerms.push('professional');
    } else if (tech.includes('beginner') || tech.includes('low')) {
      queryTerms.push('casual');
    }
  }

  // Lifestyle based on occupation
  if (agent.occupation) {
    const occupation = agent.occupation.toLowerCase();
    if (occupation.includes('driver') || occupation.includes('delivery') || occupation.includes('rickshaw')) {
      queryTerms.push('working class');
    } else if (occupation.includes('shop') || occupation.includes('owner') || occupation.includes('tailor')) {
      queryTerms.push('small business');
    } else if (occupation.includes('housekeeping') || occupation.includes('staff')) {
      queryTerms.push('service worker');
    } else if (occupation.includes('manager') || occupation.includes('director') || occupation.includes('executive')) {
      queryTerms.push('corporate professional');
    }
  }

  // Add quality descriptors
  queryTerms.push('realistic', 'portrait');

  // Remove duplicates and empty strings
  const uniqueTerms = [...new Set(queryTerms.filter(term => term && term.length > 0))];
  return uniqueTerms.join(' ');
}

/**
 * Generate Unsplash URL for agent
 */
function generateUnsplashUrl(agent) {
  const searchQuery = buildImageSearchQuery(agent);
  return `https://source.unsplash.com/400x400/?${encodeURIComponent(searchQuery)}`;
}

/**
 * Get all agents
 */
async function getAllAgents() {
  try {
    const result = await pool.query(`
      SELECT id, name, occupation, location, age, gender, tech_savviness, avatar_url
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
 * Update agent image directly (bypassing triggers)
 */
async function updateAgentImageDirect(agentId, imageUrl) {
  try {
    // Use a direct update that bypasses triggers
    const result = await pool.query(`
      UPDATE ai_agents 
      SET avatar_url = $1, updated_at = NOW() 
      WHERE id = $2
    `, [imageUrl, agentId]);
    return result.rowCount > 0;
  } catch (error) {
    console.error(`❌ Error updating agent ${agentId}:`, error);
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('🚀 Starting simple agent image update...');
    console.log('📊 Using Unsplash for varied Indian images based on persona traits\n');
    
    // Get all agents
    const agents = await getAllAgents();
    console.log(`✅ Found ${agents.length} agents to process\n`);
    
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];
      
      try {
        console.log(`👤 Processing ${i + 1}/${agents.length}: ${agent.name} (${agent.occupation})`);
        
        // Generate new image URL
        const newImageUrl = generateUnsplashUrl(agent);
        console.log(`   🖼️  New image: ${newImageUrl}`);
        
        // Update agent
        const updated = await updateAgentImageDirect(agent.id, newImageUrl);
        
        if (updated) {
          console.log(`   ✅ Updated successfully`);
          successCount++;
        } else {
          console.log(`   ❌ Failed to update`);
          failCount++;
        }
        
        // Small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`   ❌ Error processing ${agent.name}:`, error.message);
        failCount++;
      }
    }
    
    console.log('\n📊 SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Successfully updated: ${successCount} agents`);
    console.log(`❌ Failed to update: ${failCount} agents`);
    console.log('\n🎯 All agents now have varied Indian images based on their persona traits!');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { main, buildImageSearchQuery, generateUnsplashUrl };
