-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
    created_by UUID REFERENCES admin_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create PRDs table
CREATE TABLE IF NOT EXISTS prds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    version VARCHAR(20) DEFAULT '1.0',
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'rejected', 'archived')),
    content JSONB,
    metadata JSONB,
    created_by UUID REFERENCES admin_users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_created_by ON products(created_by);
CREATE INDEX IF NOT EXISTS idx_prds_product_id ON prds(product_id);
CREATE INDEX IF NOT EXISTS idx_prds_status ON prds(status);
CREATE INDEX IF NOT EXISTS idx_prds_created_by ON prds(created_by);

-- Insert sample products
INSERT INTO products (name, description, category, created_by) VALUES
('Personal Loan', 'Personal loan products and services', 'Lending', (SELECT id FROM admin_users LIMIT 1)),
('Digi Gold', 'Digital gold investment products', 'Investment', (SELECT id FROM admin_users LIMIT 1)),
('Credit Cards', 'Credit card products and features', 'Cards', (SELECT id FROM admin_users LIMIT 1)),
('Super Home', 'Home loan and mortgage products', 'Lending', (SELECT id FROM admin_users LIMIT 1))
ON CONFLICT (name) DO NOTHING;

-- Create updated_at trigger for products
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_products_updated_at();

-- Create updated_at trigger for prds
CREATE OR REPLACE FUNCTION update_prds_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_prds_updated_at
    BEFORE UPDATE ON prds
    FOR EACH ROW
    EXECUTE FUNCTION update_prds_updated_at();
