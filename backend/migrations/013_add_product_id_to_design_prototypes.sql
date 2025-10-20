-- Add product_id to design_prototypes table to connect prototypes with products
ALTER TABLE design_prototypes 
ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_design_prototypes_product_id ON design_prototypes(product_id);

-- Update existing prototypes to have NULL product_id (they can be assigned later)
UPDATE design_prototypes SET product_id = NULL WHERE product_id IS NULL;
