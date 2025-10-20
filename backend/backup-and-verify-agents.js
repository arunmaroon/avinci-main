/**
 * Agent Data Backup and Verification Script
 * Creates a backup of all agent data and verifies data integrity
 * Helps prevent data loss by maintaining snapshots
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'arun.murugesan',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'avinci',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 5432,
});

async function backupAgents() {
    const client = await pool.connect();
    
    try {
        console.log('\n📦 Creating agent data backup...\n');
        
        // Get all agents
        const result = await client.query('SELECT * FROM ai_agents WHERE is_active = true ORDER BY created_at ASC');
        const agents = result.rows;
        
        console.log(`📊 Found ${agents.length} active agents\n`);
        
        // Create backup directory if it doesn't exist
        const backupDir = path.join(__dirname, 'backups');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        
        // Create backup file with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = path.join(backupDir, `agents-backup-${timestamp}.json`);
        
        // Write backup
        fs.writeFileSync(backupFile, JSON.stringify(agents, null, 2));
        
        console.log(`✅ Backup created: ${backupFile}`);
        console.log(`📁 Backup size: ${(fs.statSync(backupFile).size / 1024).toFixed(2)} KB\n`);
        
        // Verify data integrity
        console.log('🔍 Verifying data integrity...\n');
        
        let completeAgents = 0;
        let incompleteAgents = 0;
        const missingFields = {};
        
        agents.forEach(agent => {
            const requiredFields = [
                'name', 'age', 'gender', 'occupation', 'location',
                'demographics', 'personality', 'goals', 'pain_points',
                'motivations', 'background_story', 'tech_savviness',
                'domain_literacy', 'communication_style'
            ];
            
            let isComplete = true;
            const agentMissing = [];
            
            requiredFields.forEach(field => {
                if (!agent[field] || (typeof agent[field] === 'object' && Object.keys(agent[field]).length === 0)) {
                    isComplete = false;
                    agentMissing.push(field);
                    missingFields[field] = (missingFields[field] || 0) + 1;
                }
            });
            
            if (isComplete) {
                completeAgents++;
            } else {
                incompleteAgents++;
                console.log(`⚠️  ${agent.name}: Missing ${agentMissing.join(', ')}`);
            }
        });
        
        console.log('\n📋 Data Integrity Report:');
        console.log(`   ✅ Complete agents: ${completeAgents}/${agents.length}`);
        console.log(`   ⚠️  Incomplete agents: ${incompleteAgents}/${agents.length}`);
        
        if (Object.keys(missingFields).length > 0) {
            console.log('\n   Missing fields summary:');
            Object.entries(missingFields).forEach(([field, count]) => {
                console.log(`      - ${field}: ${count} agents`);
            });
        }
        
        console.log('\n✅ Backup and verification complete!\n');
        
        return {
            backupFile,
            totalAgents: agents.length,
            completeAgents,
            incompleteAgents
        };
        
    } catch (error) {
        console.error('❌ Backup failed:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Run backup
backupAgents()
    .then(result => {
        console.log('📊 Summary:');
        console.log(`   - Backup file: ${result.backupFile}`);
        console.log(`   - Total agents: ${result.totalAgents}`);
        console.log(`   - Complete: ${result.completeAgents}`);
        console.log(`   - Incomplete: ${result.incompleteAgents}`);
        console.log('\n✅ Backup complete!');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Backup failed:', error);
        process.exit(1);
    });




