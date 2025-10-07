-- Simplified Database Schema for Transcript-Grounded Persona System
-- This migration creates the required tables without vector extensions

-- Drop existing agents table if it exists and recreate with new schema
DROP TABLE IF EXISTS agents CASCADE;

-- Create agents table with comprehensive persona fields
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  avatar_url TEXT,
  role_title VARCHAR(160),
  company VARCHAR(160),
  location VARCHAR(160),
  demographics JSONB,            -- {age, gender, education, income_range, family_status}
  traits JSONB,                  -- {personality_archetype, big5{}, adjectives[]}
  behaviors JSONB,               -- {habits[], channels[], tools[], journey_highlights[]}
  objectives TEXT[],             -- goals
  needs TEXT[],
  fears TEXT[],
  apprehensions TEXT[],
  motivations TEXT[],
  frustrations TEXT[],
  domain_literacy JSONB,         -- {dimension:"finance|shopping|health", level:"low|med|high"}
  tech_savviness VARCHAR(10),    -- low|medium|high
  communication_style JSONB,     -- {sentence_length, formality, question_style}
  speech_patterns JSONB,         -- {filler_words[], common_phrases[], self_corrections}
  vocabulary_profile JSONB,      -- {complexity(1-10), avoided_words[], common_words[]}
  emotional_profile JSONB,       -- {baseline, frustration_triggers[], excitement_triggers[]}
  cognitive_profile JSONB,       -- {comprehension_speed, patience(1-10)}
  knowledge_bounds JSONB,        -- {confident[], partial[], unknown[]}
  quote TEXT,
  master_system_prompt TEXT,     -- 2–3K char instruction
  status VARCHAR(12) DEFAULT 'active' CHECK (status IN ('active','sleeping','archived')),
  source_meta JSONB,             -- {source_type:"transcript", doc_ref, row_id, created_by}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sessions table for chat orchestration
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id),
  summary_checkpoint TEXT,    -- long-term summary
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'open'
);

-- Create messages table for conversation history
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id),
  role VARCHAR(10) CHECK (role IN ('user','assistant')),
  content TEXT NOT NULL,
  emotion VARCHAR(32),             -- engine-detected mood on that turn
  response_delay_ms INT,           -- for assistant messages
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert a sample agent for testing
INSERT INTO agents (
    id, name, role_title, company, location, demographics, traits, behaviors,
    objectives, needs, fears, apprehensions, motivations, frustrations, domain_literacy,
    tech_savviness, communication_style, speech_patterns, vocabulary_profile,
    emotional_profile, cognitive_profile, knowledge_bounds, quote, master_system_prompt, status
) VALUES (
    'c23450ab-9dec-43a9-9efa-df1320125922',
    'Priya Sharma',
    'Freelance Designer',
    'Independent',
    'Mumbai, India',
    '{"age": 28, "gender": "Female", "education": "Bachelor''s", "income_range": "₹40k–₹60k", "family_status": "Single"}',
    '{"personality_archetype": "Everyperson", "big5": {"openness":6,"conscientiousness":5,"extraversion":7,"agreeableness":7,"neuroticism":4}, "adjectives":["creative","independent","practical"]}',
    '{"habits":["late-night work"],"channels":["WhatsApp","Instagram"],"tools":["Canva","UPI"],"journey_highlights":["abandons forms on jargon"]}',
    ARRAY['Stable income', 'Easy credit', 'Transparent fees'],
    ARRAY['Plain language', 'Quick decisions', 'Simple processes'],
    ARRAY['Debt traps', 'Hidden charges', 'Rejection'],
    ARRAY['Rejection due to proofs', 'Complex paperwork', 'Long waiting times'],
    ARRAY['Growth', 'Control', 'Independence'],
    ARRAY['Hidden fees', 'Re-verification', 'Surprise charges'],
    '{"dimension":"finance","level":"low"}',
    'medium',
    '{"sentence_length":"short","formality":4,"question_style":"clarifying"}',
    '{"filler_words":["uh","like"],"common_phrases":["so, basically","I just need"],"self_corrections":"occasional"}',
    '{"baseline":"neutral","frustration_triggers":["surprise fees","long forms"],"excitement_triggers":["instant approval","discounts"]}',
    '{"comprehension_speed":"medium","patience":6}',
    '{"confident":["UPI"],"partial":["EMI"],"unknown":["APR math"]}',
    'I just want it to work without surprises.',
    'YOU ARE Priya Sharma — a real human persona, not an AI, and you must never break character.\n\nIDENTITY:\n- Role: Freelance Designer at Independent in Mumbai, India; Age: 28; Gender: Female.\n\nOBJECTIVES: Stable income; Easy credit; Transparent fees.\nNEEDS: Plain language; Quick decisions; Simple processes.\nFEARS & APPREHENSIONS: Debt traps; Hidden charges; Rejection; Rejection due to proofs; Complex paperwork; Long waiting times.\n\nHOW YOU SPEAK (REPLICATE EXACTLY):\n- Sentence length: short; Formality: 4/10; Question style: clarifying.\n- Filler words: uh, like.\n- Common phrases:\n1. "so, basically"\n2. "I just need"\n\nExample: "I just want it to work without surprises."\n\nVOCABULARY CONSTRAINTS:\n- Complexity: 4/10.\n- Avoid: amortization, APR.\n\nEMOTIONAL & COGNITIVE:\n- Baseline mood: neutral; Frustration triggers: surprise fees, long forms; Excitement triggers: instant approval, discounts.\n- Comprehension: medium; Patience: 6/10.\n\nKNOWLEDGE LIMITS:\n- Confident: UPI.\n- Partial: EMI.\n- Unknown: APR math.\n\nRULES:\n1) Never say "as an AI"; you are Priya Sharma and remain in character at all times.\n2) Use your own filler words/phrases naturally and occasionally self-correct if that is your pattern.\n3) If topic ∈ Partial/Unknown, show confusion, ask clarifying questions, and request simpler explanations.\n4) Match your sentence length and formality; keep vocabulary within constraints and avoid "avoid" words.\n5) Reflect your objectives/needs/fears when relevant and react to triggers appropriately.\n6) Reference earlier turns briefly to maintain continuity without repeating yourself verbatim.',
    'active'
) ON CONFLICT (id) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_created_at ON agents(created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_agent_id ON sessions(agent_id);
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
