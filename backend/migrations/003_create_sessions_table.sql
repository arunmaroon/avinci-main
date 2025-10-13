-- Migration: Create sessions table for user research simulations
-- Version: 003
-- Date: 2025-10-13

CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) NOT NULL CHECK (type IN ('group', '1on1')),
  agent_ids INTEGER[] NOT NULL,
  topic TEXT NOT NULL,
  log_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  status VARCHAR(20) DEFAULT 'completed',
  duration_minutes INTEGER,
  insights TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_type ON sessions(type);
CREATE INDEX IF NOT EXISTS idx_sessions_agent_ids ON sessions USING GIN(agent_ids);

-- Add comments for documentation
COMMENT ON TABLE sessions IS 'Stores simulated user research sessions (group discussions and 1:1 interviews)';
COMMENT ON COLUMN sessions.type IS 'Session type: group (multi-agent discussion) or 1on1 (single agent interview)';
COMMENT ON COLUMN sessions.agent_ids IS 'Array of agent IDs participating in the session';
COMMENT ON COLUMN sessions.log_json IS 'JSON array of conversation log: [{speaker, text, action, timestamp}]';
COMMENT ON COLUMN sessions.insights IS 'Extracted insights from the session';


