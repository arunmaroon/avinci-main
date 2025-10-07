-- Create agents table with comprehensive persona fields
DROP TABLE IF EXISTS agents CASCADE;

CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  avatar_url TEXT,
  role_title VARCHAR(160),
  company VARCHAR(160),
  location VARCHAR(160),
  demographics JSONB,
  traits JSONB,
  behaviors JSONB,
  objectives TEXT[],
  needs TEXT[],
  fears TEXT[],
  apprehensions TEXT[],
  motivations TEXT[],
  frustrations TEXT[],
  domain_literacy JSONB,
  tech_savviness VARCHAR(10),
  communication_style JSONB,
  speech_patterns JSONB,
  vocabulary_profile JSONB,
  emotional_profile JSONB,
  cognitive_profile JSONB,
  knowledge_bounds JSONB,
  quote TEXT,
  master_system_prompt TEXT,
  status VARCHAR(12) DEFAULT 'active' CHECK (status IN ('active','sleeping','archived')),
  source_meta JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create sessions table for chat orchestration
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id),
  summary_checkpoint TEXT,
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
  emotion VARCHAR(32),
  response_delay_ms INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_created_at ON agents(created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_agent_id ON sessions(agent_id);
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
