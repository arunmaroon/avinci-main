-- Comprehensive Persona Schema v2 - UXPressia 51 Fields
-- This migration creates the definitive persona schema with all required fields

-- Drop existing tables and recreate with comprehensive schema
DROP TABLE IF EXISTS personas CASCADE;
DROP TABLE IF EXISTS persona_sessions CASCADE;
DROP TABLE IF EXISTS persona_embeddings CASCADE;

-- Create comprehensive personas table with 51 UXPressia fields
CREATE TABLE personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- For multi-tenant support
  
  -- Basic Information (5 fields)
  name VARCHAR(120) NOT NULL,
  title VARCHAR(160),
  company VARCHAR(160),
  location VARCHAR(160),
  avatar_url TEXT,
  
  -- Demographics (8 fields)
  age INTEGER,
  gender VARCHAR(20),
  education VARCHAR(50),
  income_range VARCHAR(50),
  family_status VARCHAR(30),
  occupation VARCHAR(100),
  industry VARCHAR(100),
  experience_years INTEGER,
  
  -- Personality & Traits (6 fields)
  personality_archetype VARCHAR(50),
  big_five_traits JSONB, -- {openness, conscientiousness, extraversion, agreeableness, neuroticism}
  personality_adjectives TEXT[],
  values TEXT[],
  beliefs TEXT[],
  attitudes JSONB, -- {risk_tolerance, change_acceptance, etc}
  
  -- Goals & Motivations (8 fields)
  primary_goals TEXT[],
  secondary_goals TEXT[],
  motivations TEXT[],
  aspirations TEXT[],
  fears TEXT[],
  concerns TEXT[],
  pain_points TEXT[],
  frustrations TEXT[],
  
  -- Behavior & Habits (6 fields)
  daily_routine JSONB, -- {morning, afternoon, evening}
  habits TEXT[],
  preferences JSONB, -- {communication, decision_making, etc}
  behaviors JSONB, -- {interaction_patterns, response_style}
  lifestyle TEXT[],
  hobbies TEXT[],
  
  -- Technology & Tools (5 fields)
  tech_savviness VARCHAR(20), -- beginner, intermediate, advanced, expert
  preferred_devices TEXT[],
  apps_used TEXT[],
  tech_comfort_level JSONB, -- {mobile, desktop, web, etc}
  digital_behavior JSONB, -- {usage_patterns, preferences}
  
  -- Communication (4 fields)
  communication_style JSONB, -- {formality, tone, length}
  language_preferences JSONB, -- {primary, secondary, mixing_patterns}
  vocabulary_level VARCHAR(20),
  speech_patterns JSONB, -- {filler_words, phrases, corrections}
  
  -- Emotional & Cognitive (4 fields)
  emotional_profile JSONB, -- {baseline, triggers, responses}
  cognitive_style JSONB, -- {processing_speed, decision_style}
  learning_style VARCHAR(30),
  attention_span VARCHAR(20),
  
  -- Social & Cultural (5 fields)
  social_context JSONB, -- {family, friends, community}
  cultural_background JSONB, -- {heritage, traditions, values}
  social_media_usage JSONB, -- {platforms, frequency, content}
  network_size VARCHAR(20),
  influence_level VARCHAR(20),
  
  -- Life Events & Context (4 fields)
  life_events JSONB, -- {timeline, impact, significance}
  current_situation JSONB, -- {status, challenges, opportunities}
  future_plans TEXT[],
  life_stage VARCHAR(30),
  
  -- Fintech-Specific (6 fields)
  financial_goals TEXT[],
  financial_concerns TEXT[],
  banking_preferences JSONB, -- {channels, features, security}
  investment_style VARCHAR(30),
  risk_tolerance VARCHAR(20),
  financial_literacy VARCHAR(20),
  
  -- System Fields
  persona_json JSONB, -- Complete persona data for easy access
  master_system_prompt TEXT, -- 2-3K character instruction
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'sleeping', 'archived')),
  source_meta JSONB, -- {source_type, file_path, created_by, etc}
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes for performance
  CONSTRAINT personas_user_id_fkey FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_personas_user_id ON personas(user_id);
CREATE INDEX idx_personas_status ON personas(status);
CREATE INDEX idx_personas_created_at ON personas(created_at);
CREATE INDEX idx_personas_name ON personas(name);
CREATE INDEX idx_personas_persona_json ON personas USING GIN (persona_json);

-- Create persona sessions table for chat history
CREATE TABLE persona_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  session_name VARCHAR(200),
  chat_history JSONB DEFAULT '[]',
  ui_context JSONB, -- For fintech UI testing
  usability_results JSONB, -- For UX testing results
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create persona embeddings table for vector search
CREATE TABLE persona_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
  embedding_type VARCHAR(50) NOT NULL, -- 'profile', 'goals', 'pain_points', etc
  embedding_vector VECTOR(1536), -- OpenAI embedding dimension
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for embeddings
CREATE INDEX idx_persona_embeddings_persona_id ON persona_embeddings(persona_id);
CREATE INDEX idx_persona_embeddings_type ON persona_embeddings(embedding_type);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_personas_updated_at BEFORE UPDATE ON personas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_persona_sessions_updated_at BEFORE UPDATE ON persona_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO personas (
  user_id, name, title, company, location, age, gender, education,
  personality_archetype, primary_goals, tech_savviness, financial_goals,
  persona_json, master_system_prompt, status
) VALUES (
  (SELECT id FROM admin_users LIMIT 1),
  'Aditya Singh',
  'Business Analyst',
  'TechCorp',
  'Delhi, NCR',
  33,
  'Male',
  'B.Tech + MBA',
  'Analytical',
  ARRAY['Career advancement', 'Financial planning', 'Skill development'],
  'Advanced',
  ARRAY['Home loan', 'Investment planning', 'Emergency fund'],
  '{"name": "Aditya Singh", "demographics": {"age": 33, "gender": "Male"}, "goals": ["Career advancement"]}',
  'You are Aditya Singh, a 33-year-old Business Analyst from Delhi...',
  'active'
);

-- Grant permissions
GRANT ALL PRIVILEGES ON TABLE personas TO avinci_admin;
GRANT ALL PRIVILEGES ON TABLE persona_sessions TO avinci_admin;
GRANT ALL PRIVILEGES ON TABLE persona_embeddings TO avinci_admin;

