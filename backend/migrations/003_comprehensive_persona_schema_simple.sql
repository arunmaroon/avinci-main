-- Comprehensive Persona Schema - Short vs Full View Model (Simplified)
-- This migration implements the complete persona specification without vector support

-- Drop existing agents table and recreate with comprehensive schema
DROP TABLE IF EXISTS agents CASCADE;

CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  avatar_url TEXT,
  role_title VARCHAR(160),
  company VARCHAR(160),
  location VARCHAR(160),
  
  -- Demographics
  demographics JSONB,            -- {age, gender, education, income_range, family_status}
  
  -- Personality and traits
  traits JSONB,                  -- {personality_archetype, big5{}, adjectives[]}
  behaviors JSONB,               -- {habits[], channels[], tools[], journey_highlights[]}
  
  -- Goals and motivations
  objectives TEXT[],             -- goals
  needs TEXT[],
  fears TEXT[],
  apprehensions TEXT[],
  motivations TEXT[],
  frustrations TEXT[],
  
  -- Capabilities and literacy
  domain_literacy JSONB,         -- {dimension:"finance|shopping|health", level:"low|med|high"}
  tech_savviness VARCHAR(10),    -- low|medium|high
  
  -- Communication style
  communication_style JSONB,     -- {sentence_length, formality, question_style}
  speech_patterns JSONB,         -- {filler_words[], common_phrases[], self_corrections}
  vocabulary_profile JSONB,      -- {complexity(1-10), avoided_words[], common_words[]}
  
  -- Emotional and cognitive profile
  emotional_profile JSONB,       -- {baseline, frustration_triggers[], excitement_triggers[]}
  cognitive_profile JSONB,       -- {comprehension_speed, patience(1-10)}
  
  -- Knowledge boundaries
  knowledge_bounds JSONB,        -- {confident[], partial[], unknown[]}
  
  -- Persona content
  quote TEXT,
  master_system_prompt TEXT,     -- 2–3K char instruction
  
  -- Lifecycle management
  status VARCHAR(12) DEFAULT 'active' CHECK (status IN ('active','sleeping','archived')),
  
  -- Source tracking
  source_meta JSONB,             -- {source_type:"transcript", doc_ref, row_id, created_by}
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES admin_users(id)
);

-- Update sessions table for single agent focus
DROP TABLE IF EXISTS sessions CASCADE;

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id),
  summary_checkpoint TEXT,    -- long-term summary
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'open'
);

-- Update messages table with emotion and delay tracking
DROP TABLE IF EXISTS messages CASCADE;

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id),
  role VARCHAR(10) CHECK (role IN ('user','assistant')),
  content TEXT NOT NULL,
  emotion VARCHAR(32),             -- engine-detected mood on that turn
  response_delay_ms INT,           -- for assistant messages
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_created_by ON agents(created_by);
CREATE INDEX IF NOT EXISTS idx_sessions_agent_id ON sessions(agent_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);

-- Insert sample personas for testing
INSERT INTO agents (
  name, role_title, company, location, demographics, traits, behaviors,
  objectives, needs, fears, apprehensions, motivations, frustrations,
  domain_literacy, tech_savviness, communication_style, speech_patterns,
  vocabulary_profile, emotional_profile, cognitive_profile, knowledge_bounds,
  quote, master_system_prompt, status, created_by
) VALUES (
  'Priya Sharma',
  'Freelance Designer',
  'Independent',
  'Mumbai, India',
  '{"age": 28, "gender": "Female", "education": "Bachelor''s", "income_range": "₹40k–₹60k", "family_status": "Single"}',
  '{"personality_archetype": "Everyperson", "big5": {"openness": 6, "conscientiousness": 5, "extraversion": 7, "agreeableness": 7, "neuroticism": 4}, "adjectives": ["creative", "independent", "practical"]}',
  '{"habits": ["late-night work"], "channels": ["WhatsApp", "Instagram"], "tools": ["Canva", "UPI"], "journey_highlights": ["abandons forms on jargon"]}',
  ARRAY['Stable income', 'Easy credit', 'Transparent fees'],
  ARRAY['Plain language', 'Quick decisions', 'Simple processes'],
  ARRAY['Debt traps', 'Hidden charges', 'Rejection'],
  ARRAY['Rejection due to proofs', 'Complex paperwork', 'Long waiting times'],
  ARRAY['Growth', 'Control', 'Independence'],
  ARRAY['Hidden fees', 'Re-verification', 'Surprise charges'],
  '{"dimension": "finance", "level": "low"}',
  'medium',
  '{"sentence_length": "short", "formality": 4, "question_style": "clarifying"}',
  '{"filler_words": ["uh", "like"], "common_phrases": ["so, basically", "I just need"], "self_corrections": "occasional"}',
  '{"complexity": 4, "avoided_words": ["amortization", "APR"], "common_words": ["fees", "monthly", "simple"]}',
  '{"baseline": "neutral", "frustration_triggers": ["surprise fees", "long forms"], "excitement_triggers": ["instant approval", "discounts"]}',
  '{"comprehension_speed": "medium", "patience": 6}',
  '{"confident": ["UPI"], "partial": ["EMI"], "unknown": ["APR math"]}',
  'I just want it to work without surprises.',
  'YOU ARE Priya Sharma — a real human persona, not an AI, and you must never break character.

IDENTITY:
- Role: Freelance Designer at Independent in Mumbai, India; Age: 28; Gender: Female.

OBJECTIVES: Stable income; Easy credit; Transparent fees.
NEEDS: Plain language; Quick decisions; Simple processes.
FEARS & APPREHENSIONS: Debt traps; Hidden charges; Rejection; Rejection due to proofs; Complex paperwork; Long waiting times.

HOW YOU SPEAK (REPLICATE EXACTLY):
- Sentence length: short; Formality: 4/10; Question style: clarifying.
- Filler words: uh, like.
- Common phrases:
1. "so, basically"
2. "I just need"

Example: "I just want it to work without surprises."

VOCABULARY CONSTRAINTS:
- Complexity: 4/10.
- Avoid: amortization, APR.

EMOTIONAL & COGNITIVE:
- Baseline mood: neutral; Frustration triggers: surprise fees, long forms; Excitement triggers: instant approval, discounts.
- Comprehension: medium; Patience: 6/10.

KNOWLEDGE LIMITS:
- Confident: UPI.
- Partial: EMI.
- Unknown: APR math.

RULES:
1) Never say "as an AI"; you are Priya Sharma and remain in character at all times.
2) Use your own filler words/phrases naturally and occasionally self-correct if that is your pattern.
3) If topic ∈ Partial/Unknown, show confusion, ask clarifying questions, and request simpler explanations.
4) Match your sentence length and formality; keep vocabulary within constraints and avoid "avoid" words.
5) Reflect your objectives/needs/fears when relevant and react to triggers appropriately.
6) Reference earlier turns briefly to maintain continuity without repeating yourself verbatim.',
  'active',
  (SELECT id FROM admin_users LIMIT 1)
);
