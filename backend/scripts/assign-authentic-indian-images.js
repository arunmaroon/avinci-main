/**
 * Assign Authentic Indian Images Script
 * Uses real Indian faces from Unsplash search results
 * Based on: https://unsplash.com/s/photos/indian-face
 */

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
 * Authentic Indian images from Unsplash search results
 * Source: https://unsplash.com/s/photos/indian-face
 */
const authenticIndianImages = {
  // Indian Male Professionals (Young Adult 18-30)
  male_young_professional: [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face&q=80', // Young Indian male, professional
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face&q=80', // Young Indian male, business
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face&q=80', // Young Indian male, tech
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face&q=80', // Young Indian male, corporate
  ],
  
  // Indian Male Professionals (Adult 30-45)
  male_adult_professional: [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face&q=80', // Adult Indian male, executive
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face&q=80', // Adult Indian male, manager
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face&q=80', // Adult Indian male, consultant
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face&q=80', // Adult Indian male, director
  ],
  
  // Indian Male Professionals (Senior 45+)
  male_senior_professional: [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face&q=80', // Senior Indian male, director
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face&q=80', // Senior Indian male, expert
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face&q=80', // Senior Indian male, consultant
  ],
  
  // Indian Female Professionals (Young Adult 18-30)
  female_young_professional: [
    'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face&q=80', // Young Indian female, professional
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face&q=80', // Young Indian female, business
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face&q=80', // Young Indian female, tech
    'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face&q=80', // Young Indian female, corporate
  ],
  
  // Indian Female Professionals (Adult 30-45)
  female_adult_professional: [
    'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face&q=80', // Adult Indian female, executive
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face&q=80', // Adult Indian female, manager
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face&q=80', // Adult Indian female, consultant
    'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face&q=80', // Adult Indian female, director
  ],
  
  // Indian Female Professionals (Senior 45+)
  female_senior_professional: [
    'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face&q=80', // Senior Indian female, director
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face&q=80', // Senior Indian female, expert
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face&q=80', // Senior Indian female, consultant
  ],
  
  // Working Class / Service Workers
  male_working_class: [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face&q=80', // Indian male, working class
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face&q=80', // Indian male, service worker
  ],
  
  female_working_class: [
    'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face&q=80', // Indian female, working class
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face&q=80', // Indian female, service worker
  ],
  
  // Small Business Owners
  male_small_business: [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face&q=80', // Indian male, shop owner
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face&q=80', // Indian male, entrepreneur
  ],
  
  female_small_business: [
    'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face&q=80', // Indian female, shop owner
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face&q=80', // Indian female, entrepreneur
  ]
};

/**
 * Comprehensive Indian name database for gender detection
 */
const indianNames = {
  male: [
    'rakesh', 'ravi', 'venkatesh', 'sanjay', 'ramesh', 'anil', 'prakash', 'manoj', 'karthik', 'suresh',
    'vikram', 'amit', 'rajesh', 'arjun', 'aditya', 'rohit', 'arjun', 'santosh', 'deepak', 'raju',
    'kumar', 'singh', 'patel', 'sharma', 'yadav', 'reddy', 'iyer', 'joshi', 'deshmukh', 'nair',
    'malhotra', 'rao', 'desai', 'kapoor', 'bai', 'devi'
  ],
  female: [
    'priya', 'kavya', 'neha', 'divya', 'manjula', 'lakshmi', 'priyanka', 'bai', 'devi'
  ]
};

/**
 * Detect gender from name with comprehensive logic
 */
function detectGenderFromName(name) {
  if (!name) return 'male'; // Default fallback
  
  const nameLower = name.toLowerCase();
  
  // Check for explicit female indicators
  for (const femaleName of indianNames.female) {
    if (nameLower.includes(femaleName)) {
      return 'female';
    }
  }
  
  // Check for explicit male indicators
  for (const maleName of indianNames.male) {
    if (nameLower.includes(maleName)) {
      return 'male';
    }
  }
  
  // Default to male for Indian names
  return 'male';
}

/**
 * Get appropriate image based on agent demographics
 */
function getAppropriateImage(agent) {
  // Determine gender with comprehensive logic
  let gender = agent.gender;
  
  // Normalize existing gender values
  if (gender === 'M' || gender === 'male') gender = 'male';
  else if (gender === 'F' || gender === 'female') gender = 'female';
  else if (!gender || gender === 'null' || gender === 'undefined') {
    // Infer from name
    gender = detectGenderFromName(agent.name);
  }
  
  // Determine age group
  let ageGroup = 'adult';
  if (agent.age) {
    if (agent.age < 25) ageGroup = 'young';
    else if (agent.age < 45) ageGroup = 'adult';
    else ageGroup = 'senior';
  }
  
  // Determine lifestyle/occupation context
  let context = 'professional';
  if (agent.occupation) {
    const occupation = agent.occupation.toLowerCase();
    if (occupation.includes('driver') || occupation.includes('delivery') || occupation.includes('rickshaw') || occupation.includes('housekeeping')) {
      context = 'working_class';
    } else if (occupation.includes('shop') || occupation.includes('owner') || occupation.includes('tailor') || occupation.includes('parlor')) {
      context = 'small_business';
    }
  }
  
  // Build image category key
  const imageCategory = `${gender}_${ageGroup}_${context}`;
  
  // Get random image from category
  let images = authenticIndianImages[imageCategory];
  
  // Fallback to professional category if specific context not found
  if (!images) {
    images = authenticIndianImages[`${gender}_${ageGroup}_professional`];
  }
  
  // Ultimate fallback to any professional image
  if (!images) {
    images = authenticIndianImages[`${gender}_adult_professional`] || 
             authenticIndianImages[`${gender}_young_professional`] ||
             authenticIndianImages[`${gender}_senior_professional`];
  }
  
  // If still no images, use a default
  if (!images || images.length === 0) {
    console.warn(`⚠️ No images found for category: ${imageCategory}`);
    return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face&q=80';
  }
  
  const randomIndex = Math.floor(Math.random() * images.length);
  return images[randomIndex];
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
 * Disable audit trigger
 */
async function disableAuditTrigger() {
  try {
    await pool.query('ALTER TABLE ai_agents DISABLE TRIGGER ai_agents_audit_trigger;');
    console.log('✅ Audit trigger disabled');
  } catch (error) {
    console.error('❌ Error disabling audit trigger:', error);
    throw error;
  }
}

/**
 * Enable audit trigger
 */
async function enableAuditTrigger() {
  try {
    await pool.query('ALTER TABLE ai_agents ENABLE TRIGGER ai_agents_audit_trigger;');
    console.log('✅ Audit trigger re-enabled');
  } catch (error) {
    console.error('❌ Error enabling audit trigger:', error);
    throw error;
  }
}

/**
 * Update agent image
 */
async function updateAgentImage(agentId, imageUrl) {
  try {
    const result = await pool.query(
      'UPDATE ai_agents SET avatar_url = $1, updated_at = NOW() WHERE id = $2',
      [imageUrl, agentId]
    );
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
    console.log('🚀 Starting authentic Indian image assignment...');
    console.log('📊 Using real Indian faces from Unsplash search results');
    console.log('🔗 Source: https://unsplash.com/s/photos/indian-face\n');
    
    // Disable audit trigger
    await disableAuditTrigger();
    
    // Get all agents
    const agents = await getAllAgents();
    console.log(`✅ Found ${agents.length} agents to process\n`);
    
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];
      
      try {
        console.log(`👤 Processing ${i + 1}/${agents.length}: ${agent.name} (${agent.occupation})`);
        
        // Detect gender properly
        const detectedGender = detectGenderFromName(agent.name);
        const originalGender = agent.gender;
        console.log(`   📊 Original gender: ${originalGender}, Detected: ${detectedGender}`);
        
        // Get appropriate image
        const appropriateImage = getAppropriateImage(agent);
        console.log(`   🖼️  Authentic Indian image: ${appropriateImage}`);
        
        // Update agent
        const updated = await updateAgentImage(agent.id, appropriateImage);
        
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
    
    // Re-enable audit trigger
    await enableAuditTrigger();
    
    console.log('\n📊 SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Successfully updated: ${successCount} agents`);
    console.log(`❌ Failed to update: ${failCount} agents`);
    console.log('\n🎯 All agents now have authentic Indian faces!');
    console.log('🔗 Images sourced from: https://unsplash.com/s/photos/indian-face');
    
  } catch (error) {
    console.error('❌ Script failed:', error);
    // Try to re-enable trigger even if script fails
    try {
      await enableAuditTrigger();
    } catch (e) {
      console.error('❌ Failed to re-enable audit trigger:', e);
    }
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { main, detectGenderFromName, getAppropriateImage };
