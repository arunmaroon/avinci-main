const { pool } = require('./models/database');

async function updateAgentBehaviors() {
    try {
        console.log('🔄 Updating agent behavioral data...');
        
        // Get all agents
        const result = await pool.query('SELECT * FROM ai_agents');
        const agents = result.rows;
        
        console.log(`Found ${agents.length} agents to update`);
        
        for (const agent of agents) {
            const updates = [];
            const values = [];
            let paramCount = 1;
            
            // Determine behavioral attributes based on occupation and demographics
            let techUsage, dailyRoutine, techSavviness, financialHabits, frustrations, communicationStyle;
            
            if (agent.occupation === 'Doctor') {
                techUsage = 'Advanced';
                techSavviness = 'High';
                
                dailyRoutine = [
                    "Wake up at 5:30 AM, check medical journals and patient updates",
                    "Morning exercise and healthy breakfast",
                    "Commute to hospital/clinic, listen to medical podcasts",
                    "Morning rounds and patient consultations",
                    "Review lab reports and diagnostic images",
                    "Lunch break with medical colleagues",
                    "Afternoon patient appointments and procedures",
                    "Evening documentation and case studies",
                    "Family dinner and relaxation",
                    "Bedtime reading of medical literature"
                ];
                
                financialHabits = {
                    "budgeting": "Conservative",
                    "savings_rate": "High",
                    "investment_style": "Safe",
                    "payment_preference": "Digital",
                    "financial_goals": "Long-term",
                    "insurance_coverage": "Comprehensive",
                    "retirement_planning": "Active"
                };
                
                frustrations = [
                    "Complex insurance paperwork and billing systems",
                    "Patients not following treatment recommendations",
                    "Limited time for each patient due to high caseload",
                    "Outdated hospital technology and systems",
                    "Administrative burden taking time away from patient care",
                    "Difficulty accessing patient records across different systems",
                    "Pressure to see more patients in less time"
                ];
                
                communicationStyle = {
                    "formality": "Semi-formal",
                    "tone": "Professional and compassionate",
                    "language_preference": "Medical terminology mixed with simple explanations",
                    "communication_medium": "Face-to-face, phone calls, written reports",
                    "response_time": "Quick for urgent matters, detailed for complex cases",
                    "documentation_style": "Thorough and detailed"
                };
                
            } else if (agent.occupation === 'Sales Agent') {
                techUsage = 'Moderate';
                techSavviness = 'Medium';
                
                dailyRoutine = [
                    "Wake up at 7 AM, check phone for messages and leads",
                    "Quick breakfast and coffee",
                    "Commute to office or start field visits",
                    "Morning team meeting and target review",
                    "Client calls and follow-ups",
                    "Field visits to potential customers",
                    "Lunch break, often with clients or colleagues",
                    "Afternoon sales presentations and demos",
                    "Evening data entry and lead generation",
                    "Family time and relaxation",
                    "Late evening social media and networking"
                ];
                
                financialHabits = {
                    "budgeting": "Moderate",
                    "savings_rate": "Medium",
                    "investment_style": "Moderate",
                    "payment_preference": "Mixed (Cash and Digital)",
                    "financial_goals": "Mixed",
                    "commission_dependency": "High",
                    "expense_tracking": "Basic"
                };
                
                frustrations = [
                    "Difficult customers and rejection",
                    "Unrealistic sales targets and pressure",
                    "Inconsistent income due to commission structure",
                    "Outdated CRM systems and sales tools",
                    "Long working hours and weekend work",
                    "Competition from online sales channels",
                    "Difficulty closing deals in tough economic times",
                    "Lack of proper training and support from management"
                ];
                
                communicationStyle = {
                    "formality": "Informal",
                    "tone": "Friendly and persuasive",
                    "language_preference": "Local language mixed with English",
                    "communication_medium": "Phone calls, face-to-face, WhatsApp",
                    "response_time": "Immediate for hot leads",
                    "documentation_style": "Brief and action-oriented"
                };
            }
            
            // Update tech_usage
            updates.push(`tech_usage = $${paramCount}`);
            values.push(techUsage);
            paramCount++;
            
            // Update daily_routine (as JSON array)
            updates.push(`daily_routine = $${paramCount}`);
            values.push(JSON.stringify(dailyRoutine));
            paramCount++;
            
            // Update tech_savviness
            updates.push(`tech_savviness = $${paramCount}`);
            values.push(techSavviness);
            paramCount++;
            
            // Update financial_habits (as JSON object)
            updates.push(`financial_habits = $${paramCount}`);
            values.push(JSON.stringify(financialHabits));
            paramCount++;
            
            // Update frustrations (as JSON array)
            updates.push(`frustrations = $${paramCount}`);
            values.push(JSON.stringify(frustrations));
            paramCount++;
            
            // Update communication_style (as JSON object)
            updates.push(`communication_style = $${paramCount}`);
            values.push(JSON.stringify(communicationStyle));
            paramCount++;
            
            // Add the agent ID for WHERE clause
            values.push(agent.id);
            
            const updateQuery = `
                UPDATE ai_agents 
                SET ${updates.join(', ')}
                WHERE id = $${paramCount}
            `;
            
            await pool.query(updateQuery, values);
            
            console.log(`✅ Updated ${agent.name}: Tech=${techUsage}, Savvy=${techSavviness}`);
        }
        
        console.log('🎉 All agents updated with behavioral data!');
        
    } catch (error) {
        console.error('❌ Error updating agents:', error);
    } finally {
        await pool.end();
    }
}

// Run the update
updateAgentBehaviors();

