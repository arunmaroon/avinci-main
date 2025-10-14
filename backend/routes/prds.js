const express = require('express');
const router = express.Router();
const { pool } = require('../models/database');
const { v4: uuidv4 } = require('uuid');

// GET /api/prds - Get all PRDs with optional product filter
router.get('/', async (req, res) => {
    try {
        const { product_id, status = 'draft' } = req.query;
        
        let query = `
            SELECT 
                p.id, p.title, p.description, p.version, p.status, 
                p.content, p.metadata, p.created_at, p.updated_at,
                pr.name as product_name, pr.category as product_category
            FROM prds p
            JOIN products pr ON p.product_id = pr.id
            WHERE p.status = $1
        `;
        
        const params = [status];
        
        if (product_id) {
            query += ' AND p.product_id = $2';
            params.push(product_id);
        }
        
        query += ' ORDER BY p.updated_at DESC';
        
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching PRDs:', error);
        res.status(500).json({ error: 'Failed to fetch PRDs' });
    }
});

// GET /api/prds/:id - Get single PRD
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const query = `
            SELECT 
                p.id, p.title, p.description, p.version, p.status, 
                p.content, p.metadata, p.created_at, p.updated_at,
                pr.name as product_name, pr.category as product_category,
                pr.id as product_id
            FROM prds p
            JOIN products pr ON p.product_id = pr.id
            WHERE p.id = $1
        `;
        
        const result = await pool.query(query, [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'PRD not found' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching PRD:', error);
        res.status(500).json({ error: 'Failed to fetch PRD' });
    }
});

// POST /api/prds - Create new PRD
router.post('/', async (req, res) => {
    try {
        const { 
            title, 
            description, 
            product_id, 
            version = '1.0', 
            status = 'draft',
            content = {},
            metadata = {}
        } = req.body;
        
        if (!title || !product_id) {
            return res.status(400).json({ error: 'Title and product_id are required' });
        }
        
        // Check if product exists
        const product = await pool.query(
            'SELECT id, name FROM products WHERE id = $1 AND status = $2',
            [product_id, 'active']
        );
        
        if (product.rows.length === 0) {
            return res.status(400).json({ error: 'Product not found or inactive' });
        }
        
        const query = `
            INSERT INTO prds (title, description, product_id, version, status, content, metadata, created_by)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id, title, description, version, status, content, metadata, created_at, updated_at
        `;
        
        // For now, use a default admin user ID (you might want to get this from auth)
        const adminUserId = await pool.query('SELECT id FROM admin_users LIMIT 1');
        const createdBy = adminUserId.rows[0]?.id || uuidv4();
        
        const result = await pool.query(query, [
            title, 
            description, 
            product_id, 
            version, 
            status, 
            JSON.stringify(content), 
            JSON.stringify(metadata), 
            createdBy
        ]);
        
        // Return PRD with product info
        const prdWithProduct = {
            ...result.rows[0],
            product_name: product.rows[0].name,
            product_id: product_id
        };
        
        res.status(201).json(prdWithProduct);
    } catch (error) {
        console.error('Error creating PRD:', error);
        res.status(500).json({ error: 'Failed to create PRD' });
    }
});

// PUT /api/prds/:id - Update PRD
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            title, 
            description, 
            product_id, 
            version, 
            status, 
            content, 
            metadata 
        } = req.body;
        
        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }
        
        // Check if PRD exists
        const existingPRD = await pool.query(
            'SELECT id FROM prds WHERE id = $1',
            [id]
        );
        
        if (existingPRD.rows.length === 0) {
            return res.status(404).json({ error: 'PRD not found' });
        }
        
        // If product_id is being changed, verify the new product exists
        if (product_id) {
            const product = await pool.query(
                'SELECT id, name FROM products WHERE id = $1 AND status = $2',
                [product_id, 'active']
            );
            
            if (product.rows.length === 0) {
                return res.status(400).json({ error: 'Product not found or inactive' });
            }
        }
        
        const query = `
            UPDATE prds 
            SET title = $1, description = $2, product_id = COALESCE($3, product_id), 
                version = $4, status = $5, content = $6, metadata = $7, updated_at = NOW()
            WHERE id = $8
            RETURNING id, title, description, version, status, content, metadata, created_at, updated_at
        `;
        
        const result = await pool.query(query, [
            title, 
            description, 
            product_id, 
            version, 
            status, 
            JSON.stringify(content), 
            JSON.stringify(metadata), 
            id
        ]);
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating PRD:', error);
        res.status(500).json({ error: 'Failed to update PRD' });
    }
});

// DELETE /api/prds/:id - Delete PRD (soft delete)
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if PRD exists
        const existingPRD = await pool.query(
            'SELECT id FROM prds WHERE id = $1',
            [id]
        );
        
        if (existingPRD.rows.length === 0) {
            return res.status(404).json({ error: 'PRD not found' });
        }
        
        // Soft delete by setting status to archived
        const query = `
            UPDATE prds 
            SET status = 'archived', updated_at = NOW()
            WHERE id = $1
            RETURNING id, title, status
        `;
        
        const result = await pool.query(query, [id]);
        
        res.json({ message: 'PRD archived successfully', prd: result.rows[0] });
    } catch (error) {
        console.error('Error deleting PRD:', error);
        res.status(500).json({ error: 'Failed to delete PRD' });
    }
});

// GET /api/prds/product/:product_id - Get PRDs for specific product
router.get('/product/:product_id', async (req, res) => {
    try {
        const { product_id } = req.params;
        const { status = 'draft' } = req.query;
        
        const query = `
            SELECT 
                p.id, p.title, p.description, p.version, p.status, 
                p.content, p.metadata, p.created_at, p.updated_at,
                pr.name as product_name, pr.category as product_category
            FROM prds p
            JOIN products pr ON p.product_id = pr.id
            WHERE p.product_id = $1 AND p.status = $2
            ORDER BY p.updated_at DESC
        `;
        
        const result = await pool.query(query, [product_id, status]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching PRDs for product:', error);
        res.status(500).json({ error: 'Failed to fetch PRDs for product' });
    }
});

module.exports = router;
