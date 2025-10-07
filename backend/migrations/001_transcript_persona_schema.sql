-- Enhanced Database Schema for Transcript-Grounded Persona System
-- This migration adds the required tables for the AI Agent Engine blueprint

-- Agent sources table for tracking transcript origins
CREATE TABLE IF NOT EXISTS agent_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    source_type VARCHAR(50) NOT NULL, -- 'transcript', 'manual', 'synthetic'
    file_path VARCHAR(500),
    file_size INTEGER,
    mime_type VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES admin_users(id)
);

-- Enhanced agents table with transcript-grounded persona data
CREATE TABLE IF NOT EXISTS agents_v2 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    persona VARCHAR(100) NOT NULL,
    
    -- Transcript analysis results
    speech_patterns JSONB DEFAULT '{}', -- filler words, sentence length, formality
    vocabulary_profile JSONB DEFAULT '{}', -- complexity, domain-specific terms
    emotional_profile JSONB DEFAULT '{}', -- mood triggers, emotional range
    comprehension_speed INTEGER DEFAULT 1000, -- ms per word
    self_correction_frequency DECIMAL(3,2) DEFAULT 0.1, -- 0.0 to 1.0
    
    -- Behavioral DNA
    knowledge_level VARCHAR(20) NOT NULL,
    language_style VARCHAR(20) NOT NULL,
    emotional_range VARCHAR(20) DEFAULT 'Moderate',
    hesitation_level VARCHAR(20) DEFAULT 'Medium',
    traits JSONB DEFAULT '[]',
    
    -- Master system prompt (2-3K characters)
    master_system_prompt TEXT NOT NULL,
    
    -- Demographics and context
    age INTEGER,
    gender VARCHAR(20),
    occupation VARCHAR(100),
    education VARCHAR(50),
    location VARCHAR(100),
    income_range VARCHAR(50),
    
    -- Visual identity
    avatar_url VARCHAR(500),
    avatar_seed VARCHAR(100),
    
    -- Lifecycle management
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'sleeping', 'archived'
    archived_at TIMESTAMP,
    archived_by UUID REFERENCES admin_users(id),
    
    -- Source tracking
    source_id UUID REFERENCES agent_sources(id),
    
    -- Embeddings for semantic search
    embedding VECTOR(1536), -- OpenAI ada-002 dimensions
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES admin_users(id)
);

-- Sessions table for chat orchestration
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100),
    agent_id UUID REFERENCES agents_v2(id),
    admin_id UUID REFERENCES admin_users(id),
    
    -- Session state
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'paused', 'completed'
    current_mood VARCHAR(50) DEFAULT 'neutral',
    conversation_summary TEXT,
    
    -- SSE streaming
    sse_channel VARCHAR(100) UNIQUE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- Enhanced messages table with emotion and timing data
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    agent_id UUID REFERENCES agents_v2(id),
    
    -- Message content
    role VARCHAR(20) NOT NULL, -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    
    -- Human behavior simulation
    emotion VARCHAR(50),
    delay_ms INTEGER DEFAULT 0,
    typing_duration_ms INTEGER DEFAULT 0,
    
    -- Embedding for semantic search
    embedding VECTOR(1536),
    
    -- Context and metadata
    context JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Design artifacts table for Figma integration
CREATE TABLE IF NOT EXISTS design_artifacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Figma integration
    figma_file_key VARCHAR(100),
    figma_node_id VARCHAR(100),
    figma_url VARCHAR(500),
    
    -- Design data
    image_url VARCHAR(500),
    image_path VARCHAR(500),
    image_metadata JSONB DEFAULT '{}',
    
    -- Node mapping for actionable feedback
    node_mapping JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES admin_users(id)
);

-- Feedback items table for design critique
CREATE TABLE IF NOT EXISTS feedback_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    design_artifact_id UUID REFERENCES design_artifacts(id),
    agent_id UUID REFERENCES agents_v2(id),
    session_id UUID REFERENCES sessions(id),
    
    -- Critique content
    critique_text TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL, -- 'low', 'medium', 'high', 'critical'
    
    -- Heuristics grounding
    heuristic_principle VARCHAR(100) NOT NULL, -- Nielsen heuristic
    heuristic_justification TEXT NOT NULL,
    
    -- Evidence and references
    evidence_elements JSONB DEFAULT '[]', -- References to design elements
    suggested_fix TEXT,
    
    -- Context
    task_context TEXT,
    user_intent TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Heuristics checks table for validation
CREATE TABLE IF NOT EXISTS heuristics_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'usability', 'accessibility', 'content'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Nielsen's 10 Usability Heuristics
INSERT INTO heuristics_checks (name, description, category) VALUES
('Visibility of System Status', 'The system should always keep users informed about what is going on, through appropriate feedback within reasonable time.', 'usability'),
('Match Between System and Real World', 'The system should speak the users language, with words, phrases and concepts familiar to the user.', 'usability'),
('User Control and Freedom', 'Users often choose system functions by mistake and will need a clearly marked emergency exit.', 'usability'),
('Consistency and Standards', 'Users should not have to wonder whether different words, situations, or actions mean the same thing.', 'usability'),
('Error Prevention', 'Even better than good error messages is a careful design which prevents a problem from occurring in the first place.', 'usability'),
('Recognition Rather Than Recall', 'Minimize the user''s memory load by making objects, actions, and options visible.', 'usability'),
('Flexibility and Efficiency of Use', 'Accelerators may be unseen by the novice user, but can speed up the interaction for the expert user.', 'usability'),
('Aesthetic and Minimalist Design', 'Dialogues should not contain information which is irrelevant or rarely needed.', 'usability'),
('Help Users Recognize, Diagnose, and Recover from Errors', 'Error messages should be expressed in plain language, precisely indicate the problem, and constructively suggest a solution.', 'usability'),
('Help and Documentation', 'Even though it is better if the system can be used without documentation, it may be necessary to provide help and documentation.', 'usability');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_agents_v2_status ON agents_v2(status);
CREATE INDEX IF NOT EXISTS idx_agents_v2_source_id ON agents_v2(source_id);
CREATE INDEX IF NOT EXISTS idx_agents_v2_embedding ON agents_v2 USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_sessions_agent_id ON sessions(agent_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_embedding ON messages USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_feedback_items_design_id ON feedback_items(design_artifact_id);
CREATE INDEX IF NOT EXISTS idx_feedback_items_agent_id ON feedback_items(agent_id);
CREATE INDEX IF NOT EXISTS idx_design_artifacts_figma_key ON design_artifacts(figma_file_key);

-- Enable vector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;
