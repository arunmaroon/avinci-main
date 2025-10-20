-- Simplified Persona Schema - Without Vector Support
-- This migration creates the persona schema without requiring vector extensions

-- Drop existing tables and recreate with comprehensive schema
DROP TABLE IF EXISTS persona_embeddings CASCADE;
DROP TABLE IF EXISTS persona_sessions CASCADE;
DROP TABLE IF EXISTS personas CASCADE;

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
  updated_at TIMESTAMPTZ DEFAULT NOW()
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
  user_id UUID NOT NULL,
  session_name VARCHAR(200),
  chat_history JSONB DEFAULT '[]',
  ui_context JSONB, -- For fintech UI testing
  usability_results JSONB, -- For UX testing results
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- Insert sample personas for testing
INSERT INTO personas (
  user_id, name, title, company, location, age, gender, education,
  personality_archetype, primary_goals, tech_savviness, financial_goals,
  persona_json, master_system_prompt, status, avatar_url
) VALUES 
(
  '00000000-0000-0000-0000-000000000000',
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
  'You are Aditya Singh, a 33-year-old Business Analyst from Delhi. You are analytical, goal-oriented, and focused on career advancement and financial planning. You prefer clear, data-driven interfaces and value efficiency in financial tools.',
  'active',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces&q=80'
),
(
  '00000000-0000-0000-0000-000000000000',
  'Priya Sharma',
  'UX Designer',
  'DesignStudio',
  'Mumbai, Maharashtra',
  28,
  'Female',
  'B.Des + M.Des',
  'Creative',
  ARRAY['Creative growth', 'Work-life balance', 'User advocacy'],
  'Expert',
  ARRAY['Creative projects', 'Travel fund', 'Design tools'],
  '{"name": "Priya Sharma", "demographics": {"age": 28, "gender": "Female"}, "goals": ["Creative growth"]}',
  'You are Priya Sharma, a 28-year-old UX Designer from Mumbai. You are creative, empathetic, and passionate about user-centered design. You value intuitive interfaces and believe in the power of good design to solve problems.',
  'active',
  'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=faces&q=80'
),
(
  '00000000-0000-0000-0000-000000000000',
  'Rajesh Kumar',
  'Software Engineer',
  'StartupXYZ',
  'Bangalore, Karnataka',
  26,
  'Male',
  'B.Tech Computer Science',
  'Technical',
  ARRAY['Technical mastery', 'Startup success', 'Innovation'],
  'Expert',
  ARRAY['Tech investments', 'Learning courses', 'Equipment'],
  '{"name": "Rajesh Kumar", "demographics": {"age": 26, "gender": "Male"}, "goals": ["Technical mastery"]}',
  'You are Rajesh Kumar, a 26-year-old Software Engineer from Bangalore. You are technically skilled, innovative, and always learning. You prefer powerful, feature-rich tools and value efficiency in your workflow.',
  'active',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=faces&q=80'
);

-- Grant permissions
GRANT ALL PRIVILEGES ON TABLE personas TO avinci_admin;
GRANT ALL PRIVILEGES ON TABLE persona_sessions TO avinci_admin;



