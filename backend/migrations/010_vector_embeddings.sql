-- Migration: Create vector embeddings table for Pinecone integration
-- Version: 2.02
-- Date: 2024-01-01

-- Create vector_embeddings table
CREATE TABLE IF NOT EXISTS vector_embeddings (
    id VARCHAR(255) PRIMARY KEY,
    element_type VARCHAR(100) NOT NULL,
    element_content TEXT NOT NULL,
    figma_id UUID REFERENCES figma_imports(id) ON DELETE CASCADE,
    persona_id UUID REFERENCES personas(id) ON DELETE CASCADE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vector_embeddings_figma_id ON vector_embeddings(figma_id);
CREATE INDEX IF NOT EXISTS idx_vector_embeddings_persona_id ON vector_embeddings(persona_id);
CREATE INDEX IF NOT EXISTS idx_vector_embeddings_element_type ON vector_embeddings(element_type);
CREATE INDEX IF NOT EXISTS idx_vector_embeddings_created_at ON vector_embeddings(created_at);
CREATE INDEX IF NOT EXISTS idx_vector_embeddings_metadata ON vector_embeddings USING GIN(metadata);

-- Create trigger for updated_at timestamp
DROP TRIGGER IF EXISTS update_vector_embeddings_updated_at ON vector_embeddings;
CREATE TRIGGER update_vector_embeddings_updated_at
    BEFORE UPDATE ON vector_embeddings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to index Figma elements for search
CREATE OR REPLACE FUNCTION index_figma_elements_for_persona(
    p_figma_id UUID,
    p_persona_id UUID,
    p_elements JSONB
)
RETURNS INTEGER AS $$
DECLARE
    element JSONB;
    element_id VARCHAR(255);
    indexed_count INTEGER := 0;
BEGIN
    -- Loop through elements and create vector embeddings
    FOR element IN SELECT * FROM jsonb_array_elements(p_elements)
    LOOP
        element_id := p_figma_id::text || '-' || (element->>'id')::text || '-' || p_persona_id::text;
        
        INSERT INTO vector_embeddings (
            id,
            element_type,
            element_content,
            figma_id,
            persona_id,
            metadata
        ) VALUES (
            element_id,
            COALESCE(element->>'type', 'unknown'),
            COALESCE(element->>'content', ''),
            p_figma_id,
            p_persona_id,
            COALESCE(element->'metadata', '{}'::jsonb)
        ) ON CONFLICT (id) DO UPDATE SET
            element_content = EXCLUDED.element_content,
            metadata = EXCLUDED.metadata,
            updated_at = NOW();
            
        indexed_count := indexed_count + 1;
    END LOOP;
    
    RETURN indexed_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to search similar elements
CREATE OR REPLACE FUNCTION search_similar_elements(
    p_query TEXT,
    p_persona_id UUID DEFAULT NULL,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    element_id VARCHAR(255),
    element_type VARCHAR(100),
    element_content TEXT,
    figma_id UUID,
    persona_id UUID,
    metadata JSONB,
    similarity_score FLOAT
) AS $$
BEGIN
    -- This function would typically interface with Pinecone
    -- For now, return a simple text search result
    RETURN QUERY
    SELECT 
        ve.id,
        ve.element_type,
        ve.element_content,
        ve.figma_id,
        ve.persona_id,
        ve.metadata,
        ts_rank(to_tsvector('english', ve.element_content), plainto_tsquery('english', p_query)) as similarity_score
    FROM vector_embeddings ve
    WHERE 
        (p_persona_id IS NULL OR ve.persona_id = p_persona_id)
        AND to_tsvector('english', ve.element_content) @@ plainto_tsquery('english', p_query)
    ORDER BY similarity_score DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Create function to get persona-specific design recommendations
CREATE OR REPLACE FUNCTION get_persona_design_recommendations(
    p_persona_id UUID,
    p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
    figma_id UUID,
    figma_name VARCHAR(255),
    element_type VARCHAR(100),
    element_content TEXT,
    recommendation TEXT,
    confidence_score FLOAT
) AS $$
DECLARE
    persona_record RECORD;
BEGIN
    -- Get persona details
    SELECT name, role, goals, pain_points, behaviors, traits
    INTO persona_record
    FROM personas
    WHERE id = p_persona_id;
    
    IF NOT FOUND THEN
        RETURN;
    END IF;
    
    -- Generate recommendations based on persona characteristics
    RETURN QUERY
    SELECT 
        fi.id as figma_id,
        fi.file_name as figma_name,
        ve.element_type,
        ve.element_content,
        CASE 
            WHEN ve.element_type = 'button' THEN 
                'As ' || persona_record.name || ', this button should be more prominent to support my goal of ' || persona_record.goals
            WHEN ve.element_type = 'text' THEN 
                'This text should be clearer for ' || persona_record.role || ' users who ' || persona_record.behaviors
            WHEN ve.element_type = 'container' THEN 
                'This layout could better address ' || persona_record.pain_points
            ELSE 
                'This element could be improved for ' || persona_record.name
        END as recommendation,
        CASE 
            WHEN ve.element_type = 'button' THEN 0.9
            WHEN ve.element_type = 'text' THEN 0.8
            WHEN ve.element_type = 'container' THEN 0.7
            ELSE 0.5
        END as confidence_score
    FROM vector_embeddings ve
    JOIN figma_imports fi ON ve.figma_id = fi.id
    WHERE ve.persona_id = p_persona_id
    ORDER BY confidence_score DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Create function to clean up old embeddings
CREATE OR REPLACE FUNCTION cleanup_old_embeddings(
    p_days_old INTEGER DEFAULT 30
)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM vector_embeddings
    WHERE created_at < NOW() - INTERVAL '1 day' * p_days_old;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE vector_embeddings IS 'Stores vector embeddings for Figma elements to enable semantic search';
COMMENT ON COLUMN vector_embeddings.element_type IS 'Type of UI element (button, text, container, etc.)';
COMMENT ON COLUMN vector_embeddings.element_content IS 'Text content or description of the element';
COMMENT ON COLUMN vector_embeddings.metadata IS 'Additional metadata about the element';

COMMENT ON FUNCTION index_figma_elements_for_persona IS 'Indexes Figma elements for a specific persona to enable semantic search';
COMMENT ON FUNCTION search_similar_elements IS 'Searches for similar elements based on text query and persona';
COMMENT ON FUNCTION get_persona_design_recommendations IS 'Generates design recommendations for a persona based on their characteristics';
COMMENT ON FUNCTION cleanup_old_embeddings IS 'Removes old embeddings to maintain database performance';

