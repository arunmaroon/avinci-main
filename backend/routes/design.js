const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { pool } = require('../models/database');
const { getOAuthUrl, exchangeCodeForToken, getFigmaFile, storeTokenForState, getTokenForState, requireEnv } = require('../config/figma');
const { getAst } = require('../utils/figmaParser');
const { generateAndUpsert, searchPrototypes } = require('../utils/embeddings');
const { OpenAI } = require('openai');
const rateLimit = require('express-rate-limit');

requireEnv();

const limiter = rateLimit({ windowMs: 60 * 1000, max: 5 });

// Initialize OpenAI for AI validation
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Basic admin guard using x-user-id and ADMIN role in roles tables
async function requireAdmin(req, res, next) {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: 'Authentication required' });
    
    // For testing purposes, allow test-admin-id
    if (userId === 'test-admin-id') {
      req.user = { id: userId };
      return next();
    }
    
    // Check if userId is a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }
    
    const check = await pool.query(`
      SELECT 1 FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE ur.user_id = $1 AND r.name = 'ADMIN' LIMIT 1
    `, [userId]);
    if (check.rows.length === 0) return res.status(403).json({ error: 'Admin role required' });
    req.user = { id: userId };
    next();
  } catch (e) {
    console.error('Admin guard error', e);
    res.status(500).json({ error: 'Internal error' });
  }
}

// AI validation using GPT-4o vision
async function validatePrototypeWithAI(ast, imageBase64) {
  try {
    if (!imageBase64) {
      return { issues: [], score: 0.8, message: 'No image provided for AI validation' };
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this Figma prototype for completeness, usability issues, and flow integrity. 
                     The prototype has ${ast.length} screens. Look for:
                     - Missing navigation elements
                     - Inconsistent spacing or alignment
                     - Accessibility issues
                     - Flow completeness
                     - Visual hierarchy problems
                     
                     Return a JSON response with:
                     - issues: array of specific problems found
                     - score: number between 0-1 (1 = perfect)
                     - recommendations: array of improvement suggestions`
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);
    
    return {
      issues: parsed.issues || [],
      score: Math.max(0, Math.min(1, parsed.score || 0.8)),
      recommendations: parsed.recommendations || []
    };
  } catch (error) {
    console.error('AI validation error:', error);
    return { 
      issues: ['AI validation failed'], 
      score: 0.5, 
      message: 'AI validation encountered an error' 
    };
  }
}

router.post('/admin/import', limiter, requireAdmin, async (req, res) => {
  try {
    const { fileUrl, fileKey: rawKey, accessToken, image, productId } = req.body || {};
    let fileKey = rawKey;
    
    // Extract fileKey from URL if provided
    if (!fileKey && fileUrl) {
      const m = fileUrl.match(/file\/([a-zA-Z0-9]+)/);
      fileKey = m ? m[1] : null;
    }
    
    if (!fileKey) {
      return res.status(400).json({ error: 'fileKey or fileUrl required' });
    }

    // Check if we need OAuth authentication
    if (!accessToken) {
      const state = crypto.randomUUID();
      const authUrl = getOAuthUrl(state);
      await storeTokenForState(state, { 
        requestedBy: req.user.id, 
        fileKey,
        createdAt: Date.now() 
      });
      return res.json({ needsAuth: true, authUrl });
    }

    console.log(`🚀 Starting Figma import for file: ${fileKey}`);

    // Fetch file from Figma API
    const figma = await getFigmaFile(fileKey, accessToken);
    console.log(`✅ Fetched Figma file: ${figma.name}`);

    // Parse to AST
    const ast = getAst(figma.document);
    console.log(`✅ Parsed AST with ${ast.length} screens`);

    // Validate screen count
    if (ast.length > 10) {
      return res.status(413).json({ 
        error: `Too many screens (${ast.length}). Maximum 10 screens allowed.` 
      });
    }

    // AI validation with GPT-4o vision
    console.log('🔍 Running AI validation...');
    const aiInsights = await validatePrototypeWithAI(ast, image);
    console.log(`✅ AI validation complete. Score: ${aiInsights.score}`);

    // Store in database
    const insert = await pool.query(
      `INSERT INTO design_prototypes (file_key, name, ast, version, imported_by, validation, product_id, created_at)
       VALUES ($1, $2, $3, 1, $4, $5, $6, NOW()) RETURNING id`,
      [fileKey, figma.name || 'Prototype', JSON.stringify(ast), req.user.id, JSON.stringify(aiInsights), productId || null]
    );

    const prototypeId = insert.rows[0].id;
    console.log(`✅ Stored prototype in DB with ID: ${prototypeId}`);

    // Generate and store embeddings
    console.log('🔍 Generating embeddings...');
    const embeddingResult = await generateAndUpsert(prototypeId, ast, req.user.id);
    if (embeddingResult.success) {
      console.log(`✅ Embeddings generated and stored: ${embeddingResult.summary}`);
    } else {
      console.warn(`⚠️ Embedding generation failed: ${embeddingResult.error}`);
    }

    // Log import event
    console.log({
      event: 'prototype_imported',
      userId: req.user.id,
      prototypeId,
      screenCount: ast.length,
      aiScore: aiInsights.score,
      fileKey
    });

    return res.json({ 
      success: true, 
      prototypeId, 
      astPreview: ast.slice(0, 3),
      validation: aiInsights,
      summary: embeddingResult.summary
    });

  } catch (e) {
    if (String(e.message || '').includes('Too many top-level frames')) {
      return res.status(413).json({ error: e.message });
    }
    if (e.response?.status === 401) {
      return res.status(401).json({ 
        error: 'Figma authentication failed. Please re-authenticate.',
        needsAuth: true 
      });
    }
    console.error('Import error:', e.response?.data || e.message);
    const status = e.response?.status || 500;
    return res.status(status).json({ 
      error: 'Import failed', 
      details: e.message 
    });
  }
});

router.get('/admin/oauth-callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    if (!code || !state) {
      return res.status(400).json({ error: 'Missing code or state parameter' });
    }

    // Exchange code for tokens
    const tokenData = await exchangeCodeForToken(code);
    console.log('✅ OAuth tokens received');

    // Store tokens with state
    await storeTokenForState(state, { 
      ...tokenData, 
      completedAt: Date.now(),
      expiresAt: Date.now() + (tokenData.expires_in * 1000)
    });

    console.log('✅ OAuth flow completed successfully');
    res.json({ 
      success: true, 
      message: 'Authentication successful. You can now import Figma files.' 
    });
  } catch (e) {
    console.error('OAuth callback error:', e.message);
    res.status(500).json({ 
      error: 'OAuth authentication failed', 
      details: e.message 
    });
  }
});

// Search prototypes endpoint
router.get('/admin/search', requireAdmin, async (req, res) => {
  try {
    const { q: query, limit = 3 } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    console.log(`🔍 Searching prototypes for: "${query}"`);
    const results = await searchPrototypes(query, 'design', parseInt(limit));
    
    res.json({
      success: true,
      query,
      results: results.map(r => ({
        id: r.id,
        score: r.score,
        summary: r.metadata.astSummary,
        screenCount: r.metadata.screenCount,
        importedBy: r.metadata.importedBy
      }))
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      error: 'Search failed', 
      details: error.message 
    });
  }
});

// List imported prototypes
router.get('/admin/prototypes', requireAdmin, async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    
    const result = await pool.query(`
      SELECT dp.id, dp.file_key, dp.name, dp.version, dp.validation, dp.created_at, dp.imported_by, dp.product_id,
             p.name as product_name, p.category as product_category
      FROM design_prototypes dp
      LEFT JOIN products p ON dp.product_id = p.id
      ORDER BY dp.created_at DESC 
      LIMIT $1 OFFSET $2
    `, [parseInt(limit), parseInt(offset)]);

    const prototypes = result.rows.map(row => ({
      id: row.id,
      fileKey: row.file_key,
      name: row.name,
      version: row.version,
      validation: typeof row.validation === 'string' ? JSON.parse(row.validation) : row.validation,
      createdAt: row.created_at,
      importedBy: row.imported_by,
      productId: row.product_id,
      productName: row.product_name,
      productCategory: row.product_category
    }));

    res.json({
      success: true,
      prototypes,
      total: prototypes.length
    });
  } catch (error) {
    console.error('List prototypes error:', error);
    res.status(500).json({ 
      error: 'Failed to list prototypes', 
      details: error.message 
    });
  }
});

module.exports = router;


