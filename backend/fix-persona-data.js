const { Pool } = require('pg');

// Database connection (same as backend)
const pool = new Pool({
  user: process.env.DB_USER || 'avinci_admin',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'avinci',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

async function fixPersonaData() {
  try {
    console.log('🔧 Starting persona data fix...');
    
    // Get all agents
    const agentsResult = await pool.query('SELECT id, name FROM ai_agents WHERE status = $1', ['active']);
    console.log(`Found ${agentsResult.rows.length} active agents`);
    
    for (const agent of agentsResult.rows) {
      console.log(`\n📝 Fixing data for ${agent.name}...`);
      
      // Update basic demographics
      await pool.query(`
        UPDATE ai_agents 
        SET 
          gender = CASE 
            WHEN name LIKE '%Singh%' OR name LIKE '%Kumar%' OR name LIKE '%Sharma%' OR name LIKE '%Yadav%' OR name LIKE '%Patel%' THEN 'Male'
            WHEN name LIKE '%Devi%' OR name LIKE '%Bai%' OR name LIKE '%Kapoor%' THEN 'Female'
            ELSE gender
          END,
          demographics = COALESCE(demographics, '{}'::jsonb) || jsonb_build_object(
            'gender', CASE 
              WHEN name LIKE '%Singh%' OR name LIKE '%Kumar%' OR name LIKE '%Sharma%' OR name LIKE '%Yadav%' OR name LIKE '%Patel%' THEN 'Male'
              WHEN name LIKE '%Devi%' OR name LIKE '%Bai%' OR name LIKE '%Kapoor%' THEN 'Female'
              ELSE COALESCE(demographics->>'gender', 'Not specified')
            END,
            'income_range', CASE 
              WHEN occupation LIKE '%Manager%' OR occupation LIKE '%Analyst%' THEN '₹70,000-95,000'
              WHEN occupation LIKE '%Consultant%' THEN '₹60,000-85,000'
              WHEN occupation LIKE '%Driver%' OR occupation LIKE '%Staff%' THEN '₹20,000-35,000'
              WHEN occupation LIKE '%Tailor%' THEN '₹15,000-25,000'
              ELSE '₹40,000-60,000'
            END
          )
        WHERE id = $1
      `, [agent.id]);
      
      // Update personality traits
      await pool.query(`
        UPDATE ai_agents 
        SET personality_traits = COALESCE(personality_traits, '{}'::jsonb) || jsonb_build_object(
          'personality', ARRAY['Adaptable', 'Strategic', 'Analytical', 'Goal-oriented'],
          'values', ARRAY['Growth', 'Honesty', 'Efficiency', 'Transparency', 'Family'],
          'characteristics', ARRAY['Detail-oriented', 'Collaborative', 'Patient']
        )
        WHERE id = $1
      `, [agent.id]);
      
      // Update goals and motivations
      await pool.query(`
        UPDATE ai_agents 
        SET 
          goals = ARRAY['Career growth', 'Personal development', 'Financial security', 'Work-life balance'],
          motivations = ARRAY['Professional recognition', 'Family support', 'Continuous learning', 'Making impact']
        WHERE id = $1
      `, [agent.id]);
      
      // Update pain points
      await pool.query(`
        UPDATE ai_agents 
        SET 
          frustrations = ARRAY['Complex interfaces', 'Slow loading times', 'Hidden features', 'Poor navigation'],
          pain_points = ARRAY['Career stagnation', 'Work-life imbalance', 'Technology challenges', 'Skill gaps']
        WHERE id = $1
      `, [agent.id]);
      
      // Update hobbies and interests
      await pool.query(`
        UPDATE ai_agents 
        SET raw_persona = COALESCE(raw_persona, '{}'::jsonb) || jsonb_build_object(
          'hobbies_interests', jsonb_build_object(
            'primary', ARRAY['Fitness and exercise', 'Reading', 'Cooking', 'Photography', 'Music'],
            'seasonal', ARRAY['Festival celebrations', 'Holiday planning', 'Seasonal activities'],
            'secondary', ARRAY['Learning new skills', 'Social networking', 'Entertainment', 'Travel']
          )
        )
        WHERE id = $1
      `, [agent.id]);
      
      // Update daily routine
      await pool.query(`
        UPDATE ai_agents 
        SET daily_routine = jsonb_build_object(
          'weekday', jsonb_build_object(
            '6:00 AM', 'Wake up and morning routine',
            '7:00 AM', 'Breakfast with family',
            '8:00 AM', 'Commute to work',
            '9:00 AM', 'Start work day',
            '1:00 PM', 'Lunch break',
            '2:00 PM', 'Afternoon work',
            '6:00 PM', 'End work day',
            '7:00 PM', 'Evening family time',
            '8:00 PM', 'Dinner',
            '9:00 PM', 'Personal time',
            '10:30 PM', 'Sleep'
          ),
          'weekend', jsonb_build_object(
            '8:00 AM', 'Relaxed wake up',
            '9:00 AM', 'Family breakfast',
            '10:00 AM', 'Household activities',
            '2:00 PM', 'Lunch',
            '4:00 PM', 'Recreation or shopping',
            '7:00 PM', 'Evening activities',
            '9:00 PM', 'Dinner',
            '11:00 PM', 'Sleep'
          )
        )
        WHERE id = $1
      `, [agent.id]);
      
      // Update decision making
      await pool.query(`
        UPDATE ai_agents 
        SET decision_making = jsonb_build_object(
          'style', 'Analytical and collaborative',
          'process', ARRAY['Gather information', 'Consult stakeholders', 'Analyze options', 'Make informed decision'],
          'influences', ARRAY['Family needs', 'Professional growth', 'Financial security', 'Work-life balance'],
          'risk_tolerance', 'Moderate - prefers calculated risks with gradual growth'
        )
        WHERE id = $1
      `, [agent.id]);
      
      // Update cultural background
      await pool.query(`
        UPDATE ai_agents 
        SET cultural_background = jsonb_build_object(
          'region', 'North India - values family, hard work, and traditional values',
          'values', ARRAY['Family honor', 'Respect for elders', 'Hard work', 'Hospitality', 'Education'],
          'traditions', ARRAY['Diwali', 'Holi', 'Karva Chauth', 'Lohri', 'Raksha Bandhan'],
          'language', 'Hindi/English',
          'lifestyle', 'Urban professional with traditional family values'
        )
        WHERE id = $1
      `, [agent.id]);
      
      // Update technology usage
      await pool.query(`
        UPDATE ai_agents 
        SET raw_persona = COALESCE(raw_persona, '{}'::jsonb) || jsonb_build_object(
          'technology_usage', jsonb_build_object(
            'devices', jsonb_build_object(
              'home', 'Personal laptop',
              'work', 'Company laptop',
              'mobile', 'Smartphone',
              'entertainment', 'Smart TV'
            ),
            'apps_platforms', jsonb_build_object(
              'productivity', ARRAY['Gmail', 'Google Drive', 'Microsoft Office'],
              'communication', ARRAY['WhatsApp', 'Zoom', 'Teams'],
              'finance', ARRAY['Banking apps', 'UPI apps', 'Investment apps'],
              'entertainment', ARRAY['Netflix', 'YouTube', 'Spotify']
            )
          )
        )
        WHERE id = $1
      `, [agent.id]);
      
      console.log(`✅ Updated ${agent.name}`);
    }
    
    console.log('\n🎉 All persona data has been fixed!');
    
  } catch (error) {
    console.error('❌ Error fixing persona data:', error);
  } finally {
    await pool.end();
  }
}

fixPersonaData();
