-- Migration 008: Voice Calls Schema
-- Adds tables for audio calling feature (Sirius v0.2)

-- Drop tables if they exist (for clean migration)
DROP TABLE IF EXISTS voice_events CASCADE;
DROP TABLE IF EXISTS voice_calls CASCADE;

-- Voice Calls Table
-- Stores metadata for audio call sessions
CREATE TABLE voice_calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_ids UUID[] NOT NULL,  -- Array of agent IDs participating
    topic VARCHAR(500),          -- Research topic
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'closed', 'error')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,    -- Call duration (calculated on end)
    
    -- Metadata
    session_type VARCHAR(50) DEFAULT 'group' CHECK (session_type IN ('group', '1on1')),
    region VARCHAR(50),          -- Regional accent (north, south, east, west)
    
    -- Indexes
    CONSTRAINT voice_calls_agent_ids_check CHECK (array_length(agent_ids, 1) > 0)
);

-- Voice Events Table
-- Stores individual speech events (user and agent utterances)
CREATE TABLE voice_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    call_id UUID NOT NULL REFERENCES voice_calls(id) ON DELETE CASCADE,
    
    -- Speaker info
    speaker VARCHAR(255) NOT NULL,  -- Agent name or 'User'
    kind VARCHAR(50) NOT NULL CHECK (kind IN ('user-speech', 'agent-response', 'system-event')),
    
    -- Content
    text TEXT,                      -- Transcript text
    audio_url VARCHAR(1000),        -- URL to audio file (TTS output)
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duration_ms INTEGER,            -- Audio duration
    confidence DECIMAL(5,4),        -- STT confidence score (0-1)
    
    -- AI metadata
    model_used VARCHAR(100),        -- AI model for response generation
    voice_id VARCHAR(100),          -- ElevenLabs voice ID used
    region VARCHAR(50)              -- Regional accent
);

-- Indexes for efficient querying
CREATE INDEX idx_voice_calls_status ON voice_calls(status);
CREATE INDEX idx_voice_calls_created_at ON voice_calls(created_at DESC);
CREATE INDEX idx_voice_calls_agent_ids ON voice_calls USING GIN(agent_ids);

CREATE INDEX idx_voice_events_call_id ON voice_events(call_id);
CREATE INDEX idx_voice_events_created_at ON voice_events(created_at DESC);
CREATE INDEX idx_voice_events_speaker ON voice_events(speaker);
CREATE INDEX idx_voice_events_kind ON voice_events(kind);

-- Function to calculate call duration
CREATE OR REPLACE FUNCTION calculate_call_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ended_at IS NOT NULL AND NEW.created_at IS NOT NULL THEN
        NEW.duration_seconds := EXTRACT(EPOCH FROM (NEW.ended_at - NEW.created_at))::INTEGER;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate duration
CREATE TRIGGER trigger_calculate_call_duration
    BEFORE UPDATE OF ended_at ON voice_calls
    FOR EACH ROW
    EXECUTE FUNCTION calculate_call_duration();

-- Sample data for testing (optional, comment out for production)
-- INSERT INTO voice_calls (agent_ids, topic, session_type, region) VALUES
-- (ARRAY['123e4567-e89b-12d3-a456-426614174000'::UUID], 'Mobile banking features', 'group', 'north'),
-- (ARRAY['123e4567-e89b-12d3-a456-426614174001'::UUID], 'User experience interview', '1on1', 'south');

-- Grant permissions (adjust based on your setup)
-- GRANT SELECT, INSERT, UPDATE ON voice_calls TO avinci_user;
-- GRANT SELECT, INSERT ON voice_events TO avinci_user;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Migration 008: Voice Calls Schema completed successfully';
    RAISE NOTICE '   - voice_calls table created';
    RAISE NOTICE '   - voice_events table created';
    RAISE NOTICE '   - Indexes and triggers added';
END $$;

