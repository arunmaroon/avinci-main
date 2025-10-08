-- Enhanced Persona Schema Migration (Simplified)
-- This migration adds rich persona fields without vector extensions

-- First, let's check what tables exist
-- \dt

-- Add new columns to existing agents table
ALTER TABLE agents ADD COLUMN IF NOT EXISTS demographics JSONB;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS traits JSONB;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS behaviors JSONB;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS objectives TEXT[];
ALTER TABLE agents ADD COLUMN IF NOT EXISTS needs TEXT[];
ALTER TABLE agents ADD COLUMN IF NOT EXISTS fears TEXT[];
ALTER TABLE agents ADD COLUMN IF NOT EXISTS apprehensions TEXT[];
ALTER TABLE agents ADD COLUMN IF NOT EXISTS motivations TEXT[];
ALTER TABLE agents ADD COLUMN IF NOT EXISTS frustrations TEXT[];
ALTER TABLE agents ADD COLUMN IF NOT EXISTS domain_literacy JSONB;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS tech_savviness VARCHAR(10);
ALTER TABLE agents ADD COLUMN IF NOT EXISTS communication_style JSONB;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS speech_patterns JSONB;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS vocabulary_profile JSONB;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS emotional_profile JSONB;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS cognitive_profile JSONB;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS knowledge_bounds JSONB;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS quote TEXT;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS master_system_prompt TEXT;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS source_meta JSONB;
ALTER TABLE agents ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Update existing agents with default values
UPDATE agents SET 
  demographics = '{"age": null, "gender": null, "education": null, "income_range": null, "family_status": null}',
  traits = '{"personality_archetype": "Everyperson", "big5": {"openness": 5, "conscientiousness": 5, "extraversion": 5, "agreeableness": 5, "neuroticism": 5}, "adjectives": []}',
  behaviors = '{"habits": [], "channels": [], "tools": [], "journey_highlights": []}',
  objectives = ARRAY[]::TEXT[],
  needs = ARRAY[]::TEXT[],
  fears = ARRAY[]::TEXT[],
  apprehensions = ARRAY[]::TEXT[],
  motivations = ARRAY[]::TEXT[],
  frustrations = ARRAY[]::TEXT[],
  domain_literacy = '{"dimension": "general", "level": "medium"}',
  tech_savviness = 'medium',
  communication_style = '{"sentence_length": "medium", "formality": 5, "question_style": "direct"}',
  speech_patterns = '{"filler_words": [], "common_phrases": [], "self_corrections": "rare"}',
  vocabulary_profile = '{"complexity": 5, "avoided_words": [], "common_words": []}',
  emotional_profile = '{"baseline": "neutral", "frustration_triggers": [], "excitement_triggers": []}',
  cognitive_profile = '{"comprehension_speed": "medium", "patience": 5}',
  knowledge_bounds = '{"confident": [], "partial": [], "unknown": []}',
  quote = null,
  master_system_prompt = 'You are a helpful AI assistant.',
  source_meta = '{"source_type": "legacy", "created_by": "system"}'
WHERE demographics IS NULL;

-- Create sessions table if it doesn't exist
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  summary_checkpoint TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open','closed','archived'))
);

-- Create messages table if it doesn't exist
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  role VARCHAR(10) CHECK (role IN ('user','assistant')),
  content TEXT NOT NULL,
  emotion VARCHAR(32),
  response_delay_ms INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_source_meta ON agents USING GIN(source_meta);
CREATE INDEX IF NOT EXISTS idx_sessions_agent_id ON sessions(agent_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_agents_updated_at ON agents;
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample enhanced persona for testing
INSERT INTO agents (
  name, role_title, company, location, demographics, traits, behaviors,
  objectives, needs, fears, apprehensions, motivations, frustrations,
  domain_literacy, tech_savviness, communication_style, speech_patterns,
  vocabulary_profile, emotional_profile, cognitive_profile, knowledge_bounds,
  quote, master_system_prompt, status, source_meta
) VALUES (
  'Priya Sharma Enhanced',
  'Freelance Designer',
  'Independent',
  'Mumbai, India',
  '{"age": 28, "gender": "Female", "education": "Bachelor''s", "income_range": "₹40k–₹60k", "family_status": "Single"}',
  '{"personality_archetype": "Everyperson", "big5": {"openness": 6, "conscientiousness": 5, "extraversion": 7, "agreeableness": 7, "neuroticism": 4}, "adjectives": ["creative", "independent", "practical"]}',
  '{"habits": ["late-night work"], "channels": ["WhatsApp", "Instagram"], "tools": ["Canva", "UPI"], "journey_highlights": ["abandons forms on jargon"]}',
  ARRAY['Stable income', 'Easy credit', 'Transparent fees'],
  ARRAY['Plain language', 'Quick decisions', 'Simple processes'],
  ARRAY['Debt traps', 'Hidden charges'],
  ARRAY['Rejection due to proofs', 'Complex paperwork'],
  ARRAY['Growth', 'Control', 'Independence'],
  ARRAY['Hidden fees', 'Re-verification', 'Jargon'],
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
FEARS & APPREHENSIONS: Debt traps; Hidden charges; Rejection due to proofs; Complex paperwork.

HOW YOU SPEAK (REPLICATE EXACTLY):
- Sentence length: short; Formality: 4/10; Question style: clarifying.
- Filler words: uh, like.
- Common phrases:
1. "so, basically"
2. "I just need"

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
  '{"source_type": "enhanced_sample", "created_by": "system"}'
) ON CONFLICT (name) DO NOTHING;

-- Create a sample session and message for testing
INSERT INTO sessions (agent_id, status) 
SELECT id, 'open' FROM agents WHERE name = 'Priya Sharma Enhanced' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO messages (session_id, role, content, emotion, response_delay_ms)
SELECT s.id, 'user', 'Hello, I need help with a loan application', 'neutral', NULL
FROM sessions s
JOIN agents a ON s.agent_id = a.id
WHERE a.name = 'Priya Sharma Enhanced' AND s.status = 'open'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO messages (session_id, role, content, emotion, response_delay_ms)
SELECT s.id, 'assistant', 'Hi there! So, are you looking at personal loans or something else? I really struggle with all the paperwork myself, so I get it.', 'neutral', 1200
FROM sessions s
JOIN agents a ON s.agent_id = a.id
WHERE a.name = 'Priya Sharma Enhanced' AND s.status = 'open'
LIMIT 1
ON CONFLICT DO NOTHING;

