-- Add missing ended_at column to voice_calls table
ALTER TABLE voice_calls ADD COLUMN IF NOT EXISTS ended_at TIMESTAMP WITH TIME ZONE;
