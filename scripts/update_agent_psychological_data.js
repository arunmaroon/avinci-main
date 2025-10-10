const { pool } = require('./models/database');

async function updateAgentPsychologicalData() {
    try {
        console.log('🔄 Updating agent psychological and background data...');
        
        // Get all agents
        const result = await pool.query('SELECT * FROM ai_agents');
        const agents = result.rows;
        
        console.log(`Found ${agents.length} agents to update`);
        
        for (const agent of agents) {
            const updates = [];
            const values = [];
            let paramCount = 1;
            
            // Determine psychological attributes based on occupation and demographics
            let riskTolerance, decisionMaking, personalityTraits, lifeBackground;
            
            if (agent.occupation === 'Doctor') {
                riskTolerance = 'Conservative';
                decisionMaking = 'Analytical';
                personalityTraits = 'High Conscientiousness, High Agreeableness, Low Neuroticism, Moderate Openness, Moderate Extraversion';
                
                // Generate life background based on location and demographics
                const location = agent.location || '';
                const age = agent.demographics?.age || 35;
                const education = agent.demographics?.education_level || 'MBBS, MD';
                
                if (location.includes('Mumbai') || location.includes('Delhi')) {
                    lifeBackground = `Born and raised in ${location}, Dr. ${agent.name.split(' ')[1]} comes from a middle-class family. His parents, both government employees, emphasized education and service to society. He excelled in science throughout school and was inspired by his family doctor to pursue medicine. After completing ${education} from a prestigious medical college, he specialized in internal medicine. He has been practicing for over ${age - 25} years, treating patients from diverse backgrounds. He believes in evidence-based medicine and takes a conservative approach to patient care, always prioritizing safety over experimental treatments.`;
                } else if (location.includes('Chennai') || location.includes('Coimbatore')) {
                    lifeBackground = `Hailing from ${location}, Dr. ${agent.name.split(' ')[1]} grew up in a traditional Tamil family where education was highly valued. His father was a school teacher and his mother a homemaker. He was always fascinated by the human body and decided to become a doctor after witnessing his grandmother's struggle with diabetes. He completed ${education} and has been serving the community for ${age - 25} years. He is known for his compassionate approach and often spends extra time explaining medical conditions to patients in their local language.`;
                } else if (location.includes('Bangalore') || location.includes('Mysore')) {
                    lifeBackground = `Dr. ${agent.name.split(' ')[1]} was born in ${location} to a family of engineers. Despite the family's technical background, he was drawn to medicine after a childhood accident that required extensive medical care. He completed ${education} and has been practicing for ${age - 25} years. He combines his analytical mindset with medical expertise, often using technology to improve patient care. He is respected in the medical community for his systematic approach to diagnosis and treatment.`;
                } else if (location.includes('Hyderabad') || location.includes('Vijayawada')) {
                    lifeBackground = `Coming from ${location}, Dr. ${agent.name.split(' ')[1]} was raised in a joint family where his grandfather was a traditional healer. This early exposure to healthcare inspired him to pursue modern medicine. He completed ${education} and has been practicing for ${age - 25} years. He bridges traditional and modern medicine, often incorporating family values and cultural sensitivity into his practice. He is known for his patient-centered approach and ability to communicate complex medical concepts in simple terms.`;
                } else {
                    lifeBackground = `Dr. ${agent.name.split(' ')[1]} was born in ${location} and comes from a family that values education and service. He was inspired to pursue medicine after seeing the impact of healthcare in his community. He completed ${education} and has been practicing for ${age - 25} years. He is known for his dedication to patient care and his ability to work with limited resources while maintaining high medical standards.`;
                }
            } else if (agent.occupation === 'Sales Agent') {
                riskTolerance = 'Moderate';
                decisionMaking = 'Intuitive';
                personalityTraits = 'High Extraversion, High Agreeableness, Moderate Conscientiousness, Moderate Openness, Low Neuroticism';
                
                // Generate life background for sales agents
                const location = agent.location || '';
                const age = agent.demographics?.age || 30;
                const education = agent.demographics?.education_level || 'High school graduate';
                
                if (location.includes('Mumbai') || location.includes('Delhi')) {
                    lifeBackground = `Born in ${location}, ${agent.name} comes from a working-class family. His father worked in a factory and his mother was a homemaker. He completed ${education} and started working in sales to support his family. He has been in sales for over ${age - 20} years, starting as a door-to-door salesman and working his way up. He learned to communicate with people from all walks of life and developed a keen understanding of customer needs. He speaks multiple languages including Hindi, English, and his local language, which helps him connect with diverse customers.`;
                } else if (location.includes('Chennai') || location.includes('Coimbatore')) {
                    lifeBackground = `Hailing from ${location}, ${agent.name} grew up in a traditional Tamil family. His father was a small business owner and his mother helped with the family business. He completed ${education} and entered sales to help support his family. He has been in sales for ${age - 20} years, learning the art of persuasion and relationship building. He understands the local market well and often uses cultural references and local language to connect with customers. He is known for his persistence and ability to close deals through trust-building.`;
                } else if (location.includes('Bangalore') || location.includes('Mysore')) {
                    lifeBackground = `Coming from ${location}, ${agent.name} was raised in a middle-class family. His parents worked in the IT sector, but he chose a different path in sales. He completed ${education} and has been in sales for ${age - 20} years. He learned to adapt to the fast-paced environment of Bangalore and developed skills in both traditional and digital sales. He is tech-savvy and often uses digital tools to reach customers. He speaks Kannada, English, and Hindi, which helps him serve diverse customers in the cosmopolitan city.`;
                } else if (location.includes('Hyderabad') || location.includes('Vijayawada')) {
                    lifeBackground = `Born in ${location}, ${agent.name} comes from a family with a business background. His father ran a small shop and his mother helped with the business. He completed ${education} and naturally gravitated towards sales. He has been in sales for ${age - 20} years, learning the importance of relationships and trust in business. He speaks Telugu, Hindi, and English, which helps him communicate with customers across different communities. He is known for his friendly approach and ability to understand customer pain points.`;
                } else {
                    lifeBackground = `${agent.name} was born in ${location} and comes from a family that values hard work and determination. He completed ${education} and entered sales to build a better future for his family. He has been in sales for ${age - 20} years, learning to adapt to different market conditions and customer needs. He is known for his resilience and ability to work with limited resources while achieving sales targets.`;
                }
            }
            
            // Update risk_tolerance
            updates.push(`risk_tolerance = $${paramCount}`);
            values.push(riskTolerance);
            paramCount++;
            
            // Update decision_making
            updates.push(`decision_making = $${paramCount}`);
            values.push(decisionMaking);
            paramCount++;
            
            // Update personality_traits
            updates.push(`personality_traits = $${paramCount}`);
            values.push(personalityTraits);
            paramCount++;
            
            // Update life_background
            updates.push(`life_background = $${paramCount}`);
            values.push(lifeBackground);
            paramCount++;
            
            // Add the agent ID for WHERE clause
            values.push(agent.id);
            
            const updateQuery = `
                UPDATE ai_agents 
                SET ${updates.join(', ')}
                WHERE id = $${paramCount}
            `;
            
            await pool.query(updateQuery, values);
            
            console.log(`✅ Updated ${agent.name}: Risk=${riskTolerance}, Decision=${decisionMaking}`);
        }
        
        console.log('🎉 All agents updated with psychological and background data!');
        
    } catch (error) {
        console.error('❌ Error updating agents:', error);
    } finally {
        await pool.end();
    }
}

// Run the update
updateAgentPsychologicalData();

