const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { pool } = require('../models/database');
const { getOAuthUrl, exchangeCodeForToken, getFigmaFile, storeTokenForState, getTokenForState, requireEnv } = require('../config/figma');
const { getAst } = require('../utils/figmaParser');
const rateLimit = require('express-rate-limit');

requireEnv();

const limiter = rateLimit({ windowMs: 60 * 1000, max: 5 });

// Basic admin guard using x-user-id and ADMIN role in roles tables
async function requireAdmin(req, res, next) {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: 'Authentication required' });
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

router.post('/admin/import', limiter, requireAdmin, async (req, res) => {
  try {
    const { fileUrl, fileKey: rawKey, accessToken, image } = req.body || {};
    let fileKey = rawKey;
    if (!fileKey && fileUrl) {
      const m = fileUrl.match(/file\/(\w+)/);
      fileKey = m ? m[1] : null;
    }
    if (!fileKey) return res.status(400).json({ error: 'fileKey or fileUrl required' });

    const token = accessToken; // OAuth flow not completed yet => request auth
    if (!token) {
      const state = crypto.randomUUID();
      const authUrl = getOAuthUrl(state);
      await storeTokenForState(state, { requestedBy: req.user.id, createdAt: Date.now() });
      return res.json({ needsAuth: true, authUrl });
    }

    // Fetch file from Figma
    const figma = await getFigmaFile(fileKey, token);
    const ast = getAst(figma.document);

    // Optional: AI validation — for now, stub minimal response to avoid blocking
    const aiInsights = { issues: [], score: 0.9 };

    // Store in DB
    const insert = await pool.query(
      `INSERT INTO design_prototypes (file_key, name, ast, version, imported_by, validation)
       VALUES ($1, $2, $3, 1, $4, $5) RETURNING id`,
      [fileKey, figma.name || 'Prototype', JSON.stringify(ast), req.user.id, aiInsights]
    );

    const id = insert.rows[0].id;
    return res.json({ success: true, prototypeId: id, astPreview: ast.slice(0, 3), validation: aiInsights });
  } catch (e) {
    if (String(e.message || '').includes('Too many top-level frames')) {
      return res.status(413).json({ error: e.message });
    }
    console.error('Import error:', e.response?.data || e.message);
    const status = e.response?.status || 500;
    return res.status(status).json({ error: 'Import failed', details: e.message });
  }
});

router.get('/admin/oauth-callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    if (!code || !state) return res.status(400).send('Missing code/state');
    const tokenData = await exchangeCodeForToken(code);
    await storeTokenForState(state, { ...tokenData, completedAt: Date.now() });
    res.json({ success: true });
  } catch (e) {
    console.error('OAuth callback error:', e.message);
    res.status(500).json({ error: 'OAuth failed' });
  }
});

module.exports = router;


