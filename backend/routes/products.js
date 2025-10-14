const express = require('express');
const router = express.Router();
const { pool } = require('../models/database');
const { v4: uuidv4 } = require('uuid');

// GET /api/products - Get all products
router.get('/', async (req, res) => {
    try {
        const { status = 'active' } = req.query;
        
        const query = `
            SELECT 
                id, name, description, category, status, 
                created_at, updated_at
            FROM products 
            WHERE status = $1
            ORDER BY name ASC
        `;
        
        const result = await pool.query(query, [status]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// GET /api/products/:id - Get single product
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = `
            SELECT 
                id, name, description, category, status, 
                created_at, updated_at
            FROM products 
            WHERE id = $1
        `;
        
        const result = await pool.query(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// POST /api/products - Create new product
router.post('/', async (req, res) => {
    try {
        const { name, description, category, status = 'active' } = req.body;
        
        if (!name) {
            return res.status(400).json({ error: 'Product name is required' });
        }
        
        // Check if product name already exists
        const existingProduct = await pool.query(
            'SELECT id FROM products WHERE name = $1',
            [name]
        );
        
        if (existingProduct.rows.length > 0) {
            return res.status(400).json({ error: 'Product with this name already exists' });
        }
        
        const query = `
            INSERT INTO products (name, description, category, status, created_by)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, name, description, category, status, created_at, updated_at
        `;
        
        // For now, use a default admin user ID (you might want to get this from auth)
        const adminUserId = await pool.query('SELECT id FROM admin_users LIMIT 1');
        const createdBy = adminUserId.rows[0]?.id || uuidv4();
        
        const result = await pool.query(query, [name, description, category, status, createdBy]);
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// PUT /api/products/:id - Update product
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, category, status } = req.body;
        
        if (!name) {
            return res.status(400).json({ error: 'Product name is required' });
        }
        
        // Check if product exists
        const existingProduct = await pool.query(
            'SELECT id FROM products WHERE id = $1',
            [id]
        );
        
        if (existingProduct.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        // Check if new name conflicts with existing products
        const nameConflict = await pool.query(
            'SELECT id FROM products WHERE name = $1 AND id != $2',
            [name, id]
        );
        
        if (nameConflict.rows.length > 0) {
            return res.status(400).json({ error: 'Product with this name already exists' });
        }
        
        const query = `
            UPDATE products 
            SET name = $1, description = $2, category = $3, status = $4, updated_at = NOW()
            WHERE id = $5
            RETURNING id, name, description, category, status, created_at, updated_at
        `;
        
        const result = await pool.query(query, [name, description, category, status, id]);
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// DELETE /api/products/:id - Delete product (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if product exists
        const existingProduct = await pool.query(
            'SELECT id FROM products WHERE id = $1',
            [id]
        );
        
        if (existingProduct.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        // Soft delete by setting status to archived
        const query = `
            UPDATE products 
            SET status = 'archived', updated_at = NOW()
            WHERE id = $1
            RETURNING id, name, status
        `;
        
        const result = await pool.query(query, [id]);
        
        res.json({ message: 'Product archived successfully', product: result.rows[0] });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

module.exports = router;
