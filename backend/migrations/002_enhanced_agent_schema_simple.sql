-- Enhanced Agent Schema for Transcript-Grounded Personas (Simplified)
-- This migration adds the new fields required for the enhanced agent system

-- Add new columns to existing agents table
ALTER TABLE agents 
ADD COLUMN IF NOT EXISTS speech_patterns JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS vocabulary_profile JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS emotional_profile JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS cognitive_profile JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS master_system_prompt TEXT,
ADD COLUMN IF NOT EXISTS embedding TEXT, -- Store as text instead of vector
ADD COLUMN IF NOT EXISTS objectives JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS needs JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS apprehensions JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS real_quotes JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS knowledge_bounds JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS updated_by UUID,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS archived_by UUID;

-- Create agent_sources table for tracking transcript sources
CREATE TABLE IF NOT EXISTS agent_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    source_type VARCHAR(50) NOT NULL, -- 'transcript', 'file', 'manual'
    file_path VARCHAR(500),
    file_size INTEGER,
    mime_type VARCHAR(100),
    created_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sessions table for chat sessions
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_name VARCHAR(255),
    agent_ids UUID[] NOT NULL,
    admin_id UUID,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    summary TEXT,
    metadata JSONB DEFAULT '{}'
);

-- Create messages table for chat messages
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(id),
    role VARCHAR(20) NOT NULL, -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    emotion JSONB DEFAULT '{}',
    delay_ms INTEGER,
    embedding TEXT, -- Store as text instead of vector
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create feedback_items table for multi-agent feedback
CREATE TABLE IF NOT EXISTS feedback_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(id),
    design_id UUID,
    heuristic_id VARCHAR(50),
    severity VARCHAR(20),
    evidence TEXT,
    suggestion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create heuristics_checks table for predefined heuristics
CREATE TABLE IF NOT EXISTS heuristics_checks (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_agent_sources_created_by ON agent_sources(created_by);
CREATE INDEX IF NOT EXISTS idx_sessions_admin_id ON sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_agent_id ON messages(agent_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_session_id ON feedback_items(session_id);
CREATE INDEX IF NOT EXISTS idx_feedback_agent_id ON feedback_items(agent_id);
CREATE INDEX IF NOT EXISTS idx_feedback_heuristic_id ON feedback_items(heuristic_id);

-- Add full-text search index for agents
CREATE INDEX IF NOT EXISTS idx_agents_search ON agents USING gin(to_tsvector('english', name || ' ' || COALESCE(persona, '') || ' ' || COALESCE(master_system_prompt, '')));

-- Insert some sample heuristics
INSERT INTO heuristics_checks (id, name, description, category) VALUES
('visibility_of_system_status', 'Visibility of System Status', 'The system should always keep users informed about what is going on, through appropriate feedback within reasonable time.', 'Usability'),
('match_real_world', 'Match Between System and Real World', 'The system should speak the users language, with words, phrases and concepts familiar to the user.', 'Usability'),
('user_control', 'User Control and Freedom', 'Users often choose system functions by mistake and will need a clearly marked emergency exit.', 'Usability'),
('consistency', 'Consistency and Standards', 'Users should not have to wonder whether different words, situations, or actions mean the same thing.', 'Usability'),
('error_prevention', 'Error Prevention', 'Even better than good error messages is a careful design which prevents a problem from occurring in the first place.', 'Usability'),
('recognition', 'Recognition Rather Than Recall', 'Make objects, actions, and options visible. The user should not have to remember information from one part of the dialogue to another.', 'Usability'),
('flexibility', 'Flexibility and Efficiency of Use', 'Accelerators may be unseen by the novice user, but often speed up the interaction for the expert user.', 'Usability'),
('aesthetic_design', 'Aesthetic and Minimalist Design', 'Dialogues should not contain information which is irrelevant or rarely needed.', 'Usability'),
('error_recovery', 'Help Users Recognize, Diagnose, and Recover from Errors', 'Error messages should be expressed in plain language, precisely indicate the problem, and constructively suggest a solution.', 'Usability'),
('help_documentation', 'Help and Documentation', 'Even though it is better if the system can be used without documentation, it may be necessary to provide help and documentation.', 'Usability')
ON CONFLICT (id) DO NOTHING;
