-- Feedback System Tables
-- Multi-agent feedback and critique system

-- Feedback sessions table
CREATE TABLE IF NOT EXISTS feedback_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artifact TEXT NOT NULL,
    task TEXT NOT NULL,
    total_agents INTEGER NOT NULL,
    successful_feedback INTEGER NOT NULL,
    errors INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feedback items table
CREATE TABLE IF NOT EXISTS feedback_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES feedback_sessions(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents(id),
    issue TEXT NOT NULL,
    evidence TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    suggested_fix TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_feedback_sessions_created_at ON feedback_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_items_session_id ON feedback_items(session_id);
CREATE INDEX IF NOT EXISTS idx_feedback_items_agent_id ON feedback_items(agent_id);
CREATE INDEX IF NOT EXISTS idx_feedback_items_severity ON feedback_items(severity);
