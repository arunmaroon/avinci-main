-- Migration: Add Figma integration to personas and create figma_imports table
-- Version: 2.02
-- Date: 2024-01-01

-- Create figma_imports table
CREATE TABLE IF NOT EXISTS figma_imports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_key VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    ui_elements JSONB NOT NULL DEFAULT '[]',
    vision_analysis JSONB,
    persona_feedback JSONB,
    imported_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add Figma connection fields to personas table
ALTER TABLE personas 
ADD COLUMN IF NOT EXISTS figma_connections JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS design_feedback JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS ux_score INTEGER DEFAULT 0 CHECK (ux_score >= 0 AND ux_score <= 10);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_figma_imports_file_key ON figma_imports(file_key);
CREATE INDEX IF NOT EXISTS idx_figma_imports_imported_by ON figma_imports(imported_by);
CREATE INDEX IF NOT EXISTS idx_figma_imports_created_at ON figma_imports(created_at);
CREATE INDEX IF NOT EXISTS idx_personas_figma_connections ON personas USING GIN(figma_connections);
CREATE INDEX IF NOT EXISTS idx_personas_ux_score ON personas(ux_score);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for figma_imports table
DROP TRIGGER IF EXISTS update_figma_imports_updated_at ON figma_imports;
CREATE TRIGGER update_figma_imports_updated_at
    BEFORE UPDATE ON figma_imports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for personas table
DROP TRIGGER IF EXISTS update_personas_updated_at ON personas;
CREATE TRIGGER update_personas_updated_at
    BEFORE UPDATE ON personas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample Figma connection data for existing personas
UPDATE personas 
SET figma_connections = '[
    {
        "id": "figma-1",
        "name": "Mobile App Design",
        "feedback": "As a busy parent, this button spacing frustrates quick tasks",
        "score": 6,
        "created_at": "2024-01-01T00:00:00Z"
    }
]'::jsonb,
design_feedback = '{
    "layout": {
        "score": 7,
        "feedback": "Good overall structure, but buttons need more spacing"
    },
    "colors": {
        "score": 8,
        "feedback": "Excellent color palette, good contrast"
    },
    "typography": {
        "score": 9,
        "feedback": "Clear hierarchy, easy to read"
    },
    "accessibility": {
        "score": 6,
        "feedback": "Needs better focus states and ARIA labels"
    }
}'::jsonb,
ux_score = 7
WHERE id IN (SELECT id FROM personas LIMIT 1);

-- Create view for persona-figma relationships
CREATE OR REPLACE VIEW persona_figma_insights AS
SELECT 
    p.id as persona_id,
    p.name as persona_name,
    p.role as persona_role,
    p.ux_score,
    p.design_feedback,
    jsonb_agg(
        jsonb_build_object(
            'figma_id', fi.id,
            'figma_name', fi.file_name,
            'file_key', fi.file_key,
            'feedback', pfc.value,
            'score', pfc.value->>'score',
            'created_at', fi.created_at
        )
    ) as figma_connections
FROM personas p
LEFT JOIN LATERAL jsonb_array_elements(p.figma_connections) as pfc ON true
LEFT JOIN figma_imports fi ON pfc.value->>'id' = fi.id::text
WHERE p.status = 'active'
GROUP BY p.id, p.name, p.role, p.ux_score, p.design_feedback;

-- Create function to calculate persona UX score
CREATE OR REPLACE FUNCTION calculate_persona_ux_score(persona_id UUID)
RETURNS INTEGER AS $$
DECLARE
    avg_score DECIMAL;
BEGIN
    SELECT AVG((pfc.value->>'score')::INTEGER)
    INTO avg_score
    FROM personas p
    CROSS JOIN LATERAL jsonb_array_elements(p.figma_connections) as pfc
    WHERE p.id = persona_id;
    
    RETURN COALESCE(avg_score::INTEGER, 0);
END;
$$ LANGUAGE plpgsql;

-- Create function to get persona-specific design feedback
CREATE OR REPLACE FUNCTION get_persona_design_feedback(persona_id UUID, figma_id UUID)
RETURNS JSONB AS $$
DECLARE
    feedback JSONB;
BEGIN
    SELECT pfc.value
    INTO feedback
    FROM personas p
    CROSS JOIN LATERAL jsonb_array_elements(p.figma_connections) as pfc
    WHERE p.id = persona_id 
    AND pfc.value->>'id' = figma_id::text;
    
    RETURN COALESCE(feedback, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- Create function to add Figma connection to persona
CREATE OR REPLACE FUNCTION add_figma_connection_to_persona(
    persona_id UUID,
    figma_id UUID,
    feedback TEXT,
    score INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    connection JSONB;
BEGIN
    connection := jsonb_build_object(
        'id', figma_id::text,
        'feedback', feedback,
        'score', score,
        'created_at', NOW()::text
    );
    
    UPDATE personas 
    SET figma_connections = figma_connections || jsonb_build_array(connection),
        ux_score = calculate_persona_ux_score(persona_id)
    WHERE id = persona_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Create function to remove Figma connection from persona
CREATE OR REPLACE FUNCTION remove_figma_connection_from_persona(
    persona_id UUID,
    figma_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE personas 
    SET figma_connections = (
        SELECT jsonb_agg(conn)
        FROM jsonb_array_elements(figma_connections) as conn
        WHERE conn->>'id' != figma_id::text
    ),
    ux_score = calculate_persona_ux_score(persona_id)
    WHERE id = persona_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE figma_imports IS 'Stores imported Figma designs with AI analysis and persona feedback';
COMMENT ON COLUMN figma_imports.ui_elements IS 'JSON array of extracted UI elements from Figma';
COMMENT ON COLUMN figma_imports.vision_analysis IS 'GPT-4o vision analysis results';
COMMENT ON COLUMN figma_imports.persona_feedback IS 'Persona-specific feedback for each design';

COMMENT ON COLUMN personas.figma_connections IS 'JSON array of connected Figma designs with feedback';
COMMENT ON COLUMN personas.design_feedback IS 'Aggregated design feedback across all connected designs';
COMMENT ON COLUMN personas.ux_score IS 'Overall UX score (0-10) based on persona feedback';

COMMENT ON VIEW persona_figma_insights IS 'Comprehensive view of persona-Figma relationships with insights';
COMMENT ON FUNCTION calculate_persona_ux_score IS 'Calculates average UX score for a persona based on Figma connections';
COMMENT ON FUNCTION get_persona_design_feedback IS 'Gets specific design feedback for a persona-Figma connection';
COMMENT ON FUNCTION add_figma_connection_to_persona IS 'Adds a new Figma connection to a persona';
COMMENT ON FUNCTION remove_figma_connection_from_persona IS 'Removes a Figma connection from a persona';

