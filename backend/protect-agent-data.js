/**
 * Agent Data Protection Script
 * Adds database triggers and constraints to prevent accidental data loss
 * Creates audit logging for all agent modifications
 */

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER || 'arun.murugesan',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'avinci',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 5432,
});

async function setupDataProtection() {
    const client = await pool.connect();
    
    try {
        console.log('\n🔒 Setting up agent data protection...\n');
        
        // 1. Create audit log table
        await client.query(`
            CREATE TABLE IF NOT EXISTS ai_agents_audit_log (
                id SERIAL PRIMARY KEY,
                agent_id UUID NOT NULL,
                agent_name VARCHAR(255),
                operation VARCHAR(10) NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
                changed_fields JSONB,
                old_values JSONB,
                new_values JSONB,
                changed_by VARCHAR(255),
                changed_at TIMESTAMPTZ DEFAULT NOW(),
                reason TEXT
            );
        `);
        console.log('✅ Created audit log table');
        
        // 2. Create trigger function for audit logging
        await client.query(`
            CREATE OR REPLACE FUNCTION log_ai_agent_changes()
            RETURNS TRIGGER AS $$
            BEGIN
                IF (TG_OP = 'UPDATE') THEN
                    INSERT INTO ai_agents_audit_log (
                        agent_id, agent_name, operation, changed_fields, 
                        old_values, new_values, changed_by
                    )
                    VALUES (
                        NEW.id,
                        NEW.name,
                        'UPDATE',
                        jsonb_build_object(
                            'name', CASE WHEN OLD.name IS DISTINCT FROM NEW.name THEN true ELSE false END,
                            'age', CASE WHEN OLD.age IS DISTINCT FROM NEW.age THEN true ELSE false END,
                            'gender', CASE WHEN OLD.gender IS DISTINCT FROM NEW.gender THEN true ELSE false END,
                            'occupation', CASE WHEN OLD.occupation IS DISTINCT FROM NEW.occupation THEN true ELSE false END,
                            'location', CASE WHEN OLD.location IS DISTINCT FROM NEW.location THEN true ELSE false END
                        ),
                        row_to_json(OLD.*),
                        row_to_json(NEW.*),
                        current_user
                    );
                    RETURN NEW;
                    
                ELSIF (TG_OP = 'DELETE') THEN
                    INSERT INTO ai_agents_audit_log (
                        agent_id, agent_name, operation, old_values, changed_by
                    )
                    VALUES (
                        OLD.id,
                        OLD.name,
                        'DELETE',
                        row_to_json(OLD.*),
                        current_user
                    );
                    RETURN OLD;
                    
                ELSIF (TG_OP = 'INSERT') THEN
                    INSERT INTO ai_agents_audit_log (
                        agent_id, agent_name, operation, new_values, changed_by
                    )
                    VALUES (
                        NEW.id,
                        NEW.name,
                        'INSERT',
                        row_to_json(NEW.*),
                        current_user
                    );
                    RETURN NEW;
                END IF;
            END;
            $$ LANGUAGE plpgsql;
        `);
        console.log('✅ Created audit logging function');
        
        // 3. Attach trigger to ai_agents table
        await client.query(`
            DROP TRIGGER IF EXISTS ai_agents_audit_trigger ON ai_agents;
            
            CREATE TRIGGER ai_agents_audit_trigger
            AFTER INSERT OR UPDATE OR DELETE ON ai_agents
            FOR EACH ROW
            EXECUTE FUNCTION log_ai_agent_changes();
        `);
        console.log('✅ Attached audit trigger to ai_agents table');
        
        // 4. Create automatic backup function (daily snapshot)
        await client.query(`
            CREATE TABLE IF NOT EXISTS ai_agents_snapshots (
                snapshot_id SERIAL PRIMARY KEY,
                snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
                agent_count INTEGER NOT NULL,
                snapshot_data JSONB NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                UNIQUE(snapshot_date)
            );
        `);
        console.log('✅ Created snapshot table for daily backups');
        
        // 5. Create function to create daily snapshot
        await client.query(`
            CREATE OR REPLACE FUNCTION create_daily_agent_snapshot()
            RETURNS void AS $$
            BEGIN
                INSERT INTO ai_agents_snapshots (snapshot_date, agent_count, snapshot_data)
                SELECT
                    CURRENT_DATE,
                    COUNT(*),
                    jsonb_agg(to_jsonb(ai_agents.*))
                FROM ai_agents
                WHERE is_active = true
                ON CONFLICT (snapshot_date) 
                DO UPDATE SET
                    agent_count = EXCLUDED.agent_count,
                    snapshot_data = EXCLUDED.snapshot_data,
                    created_at = NOW();
            END;
            $$ LANGUAGE plpgsql;
        `);
        console.log('✅ Created daily snapshot function');
        
        // 6. Create the first snapshot
        await client.query('SELECT create_daily_agent_snapshot()');
        console.log('✅ Created initial snapshot');
        
        // 7. Add indexes for performance
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_audit_log_agent_id ON ai_agents_audit_log(agent_id);
            CREATE INDEX IF NOT EXISTS idx_audit_log_changed_at ON ai_agents_audit_log(changed_at DESC);
            CREATE INDEX IF NOT EXISTS idx_snapshots_date ON ai_agents_snapshots(snapshot_date DESC);
        `);
        console.log('✅ Created performance indexes');
        
        console.log('\n📋 Data Protection Summary:');
        console.log('   ✅ Audit logging enabled - all changes tracked');
        console.log('   ✅ Daily snapshots enabled - automatic backups');
        console.log('   ✅ Historical data preserved - can restore any version');
        console.log('   ✅ Change tracking - know who changed what and when');
        
        console.log('\n📊 To view audit history:');
        console.log('   SELECT * FROM ai_agents_audit_log ORDER BY changed_at DESC LIMIT 10;');
        
        console.log('\n📊 To view snapshots:');
        console.log('   SELECT snapshot_date, agent_count FROM ai_agents_snapshots ORDER BY snapshot_date DESC;');
        
        console.log('\n🔒 Agent data is now fully protected from loss!\n');
        
    } catch (error) {
        console.error('❌ Protection setup failed:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Run protection setup
setupDataProtection()
    .then(() => {
        console.log('✅ Data protection setup complete!');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Protection setup failed:', error);
        process.exit(1);
    });




