const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'arun.murugesan',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'avinci',
  password: process.env.DB_PASSWORD || '',
  port: process.env.DB_PORT || 5432,
});

function isEmptyText(value) {
  if (value == null) return true;
  const s = String(value).trim().toLowerCase();
  return s.length === 0 || s === 'not documented' || s === 'n/a';
}

function isEmptyJson(json) {
  if (json == null) return true;
  if (Array.isArray(json)) return json.length === 0;
  if (typeof json === 'object') return Object.keys(json).length === 0;
  return true;
}

async function run() {
  const client = await pool.connect();
  try {
    const { rows } = await client.query('SELECT * FROM ai_agents WHERE is_active = true ORDER BY created_at ASC');

    const totals = {
      total: rows.length,
      personality_traits: 0,
      hobbies: 0,
      daily_routine: 0,
      decision_making: 0,
      social_context: 0,
      cultural_background: 0,
      key_quotes: 0,
      goals: 0,
      pain_points: 0,
      tone: 0,
    };

    const missingByAgent = [];

    for (const a of rows) {
      const missing = [];

      if (isEmptyText(a.personality_traits)) { totals.personality_traits++; missing.push('personality_traits'); }
      if (isEmptyJson(a.hobbies)) { totals.hobbies++; missing.push('hobbies'); }
      if (isEmptyJson(a.daily_routine)) { totals.daily_routine++; missing.push('daily_routine'); }
      if (isEmptyJson(a.decision_making)) { totals.decision_making++; missing.push('decision_making'); }
      if (isEmptyJson(a.social_context)) { totals.social_context++; missing.push('social_context'); }
      if (isEmptyJson(a.cultural_background)) { totals.cultural_background++; missing.push('cultural_background'); }
      if (isEmptyJson(a.key_quotes)) { totals.key_quotes++; missing.push('key_quotes'); }
      if (!Array.isArray(a.goals) || a.goals.length === 0) { totals.goals++; missing.push('goals'); }
      if (!Array.isArray(a.pain_points) || a.pain_points.length === 0) { totals.pain_points++; missing.push('pain_points'); }
      if (isEmptyText(a.tone)) { totals.tone++; missing.push('tone'); }

      if (missing.length) missingByAgent.push({ name: a.name, missing });
    }

    console.log('\n📊 Persona Completeness Report');
    console.log('--------------------------------');
    console.log(`Total active agents: ${totals.total}`);
    Object.entries(totals).forEach(([k, v]) => {
      if (k !== 'total') console.log(`${k}: missing ${v}`);
    });

    console.log('\n🔍 Sample missing (up to 10):');
    missingByAgent.slice(0, 10).forEach(a => {
      console.log(`- ${a.name}: ${a.missing.join(', ')}`);
    });

    console.log('\n✅ Report complete');
  } catch (e) {
    console.error('Report failed:', e);
    process.exit(1);
  } finally {
    await client.release();
  }
}

run();



