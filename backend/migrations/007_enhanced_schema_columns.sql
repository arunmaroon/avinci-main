-- Add enhanced schema columns to ai_agents table
ALTER TABLE ai_agents ADD COLUMN IF NOT EXISTS background TEXT;
ALTER TABLE ai_agents ADD COLUMN IF NOT EXISTS hobbies JSONB;
ALTER TABLE ai_agents ADD COLUMN IF NOT EXISTS fintech_preferences JSONB;
ALTER TABLE ai_agents ADD COLUMN IF NOT EXISTS pain_points JSONB;
ALTER TABLE ai_agents ADD COLUMN IF NOT EXISTS ui_pain_points JSONB;
ALTER TABLE ai_agents ADD COLUMN IF NOT EXISTS key_quotes JSONB;
ALTER TABLE ai_agents ADD COLUMN IF NOT EXISTS goals JSONB;
ALTER TABLE ai_agents ADD COLUMN IF NOT EXISTS extrapolation_rules JSONB;
ALTER TABLE ai_agents ADD COLUMN IF NOT EXISTS social_context JSONB;
ALTER TABLE ai_agents ADD COLUMN IF NOT EXISTS cultural_background JSONB;
ALTER TABLE ai_agents ADD COLUMN IF NOT EXISTS daily_routine JSONB;
ALTER TABLE ai_agents ADD COLUMN IF NOT EXISTS decision_making JSONB;
ALTER TABLE ai_agents ADD COLUMN IF NOT EXISTS life_events JSONB;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_agents_background ON ai_agents USING gin(to_tsvector('english', background));
CREATE INDEX IF NOT EXISTS idx_ai_agents_hobbies ON ai_agents USING gin(hobbies);
CREATE INDEX IF NOT EXISTS idx_ai_agents_pain_points ON ai_agents USING gin(pain_points);
CREATE INDEX IF NOT EXISTS idx_ai_agents_goals ON ai_agents USING gin(goals);
CREATE INDEX IF NOT EXISTS idx_ai_agents_life_events ON ai_agents USING gin(life_events);

