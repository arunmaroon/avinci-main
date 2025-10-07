-- Migration to enhance existing agents table with blueprint fields
-- This adds the missing fields to the existing agents table

-- Add enhanced fields to existing agents table
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS speech_patterns JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS vocabulary_profile JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS emotional_profile JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS cognitive_profile JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS master_system_prompt TEXT,
ADD COLUMN IF NOT EXISTS embedding JSONB, -- Store as JSON array for compatibility
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active', -- active, sleeping, archived
ADD COLUMN IF NOT EXISTS objectives JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS needs JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS fears JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS apprehensions JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS knowledge_bounds JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS real_quotes JSONB DEFAULT '[]';

-- Update existing agents table to support multiple agents per session
ALTER TABLE sessions
ADD COLUMN IF NOT EXISTS agent_ids UUID[] DEFAULT '{}';

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_speech_patterns ON agents USING GIN (speech_patterns);
CREATE INDEX IF NOT EXISTS idx_agents_emotional_profile ON agents USING GIN (emotional_profile);
CREATE INDEX IF NOT EXISTS idx_agents_objectives ON agents USING GIN (objectives);
CREATE INDEX IF NOT EXISTS idx_sessions_agent_ids ON sessions USING GIN (agent_ids);

-- Update existing sessions to use agent_ids array
UPDATE sessions 
SET agent_ids = ARRAY[agent_id] 
WHERE agent_id IS NOT NULL AND array_length(agent_ids, 1) IS NULL;
