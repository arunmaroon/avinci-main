const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { pool } = require('../models/database');
const { 
  getOAuthUrl, 
  exchangeCodeForToken, 
  storeTokenForState, 
  getTokenForState,
  refreshAccessToken,
  getUserInfo,
  storeUserSession,
  getUserSession,
  revokeUserSession,
  requireEnv 
} = require('../config/moneyview');

requireEnv();

// Middleware to check if user is authenticated
async function requireAuth(req, res, next) {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check if user has valid Moneyview session
    const session = await getUserSession(userId);
    if (!session) {
      return res.status(401).json({ error: 'Moneyview session not found' });
    }

    // Check if token is expired
    if (Date.now() > session.expiresAt) {
      try {
        // Try to refresh the token
        const newTokenData = await refreshAccessToken(session.refresh_token);
        await storeUserSession(userId, newTokenData);
        req.user = { id: userId, session: newTokenData };
      } catch (refreshError) {
        // Refresh failed, user needs to re-authenticate
        await revokeUserSession(userId);
        return res.status(401).json({ 
          error: 'Session expired. Please re-authenticate.',
          needsAuth: true 
        });
      }
    } else {
      req.user = { id: userId, session };
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
}

// Initiate Moneyview OAuth flow
router.post('/auth/initiate', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const state = crypto.randomUUID();
    const authUrl = getOAuthUrl(state);
    
    // Store state with user ID
    await storeTokenForState(state, { 
      userId, 
      requestedAt: Date.now() 
    });

    res.json({ 
      success: true, 
      authUrl,
      state 
    });
  } catch (error) {
    console.error('OAuth initiation error:', error);
    res.status(500).json({ error: 'Failed to initiate OAuth flow' });
  }
});

// Handle OAuth callback
router.get('/auth/callback', async (req, res) => {
  try {
    const { code, state, error } = req.query;

    if (error) {
      return res.status(400).json({ 
        error: 'OAuth authorization failed', 
        details: error 
      });
    }

    if (!code || !state) {
      return res.status(400).json({ 
        error: 'Missing authorization code or state' 
      });
    }

    // Verify state
    const stateData = await getTokenForState(state);
    if (!stateData) {
      return res.status(400).json({ 
        error: 'Invalid or expired state parameter' 
      });
    }

    // Exchange code for tokens
    const tokenData = await exchangeCodeForToken(code);
    console.log('✅ Moneyview OAuth tokens received');

    // Get user info from Moneyview
    const userInfo = await getUserInfo(tokenData.access_token);
    console.log('✅ Moneyview user info retrieved:', userInfo.email);

    // Store user session
    await storeUserSession(stateData.userId, {
      ...tokenData,
      userInfo
    });

    // Update or create user in database
    await pool.query(`
      INSERT INTO users (id, email, name, moneyview_id, moneyview_data, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        moneyview_id = EXCLUDED.moneyview_id,
        moneyview_data = EXCLUDED.moneyview_data,
        updated_at = NOW()
    `, [
      stateData.userId,
      userInfo.email,
      userInfo.name || userInfo.email,
      userInfo.id,
      JSON.stringify(userInfo)
    ]);

    // Clean up state
    await redis.del(`moneyview:oauth:${state}`);

    res.json({ 
      success: true, 
      message: 'Moneyview authentication successful',
      user: {
        id: stateData.userId,
        email: userInfo.email,
        name: userInfo.name || userInfo.email
      }
    });

  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).json({ 
      error: 'OAuth callback failed', 
      details: error.message 
    });
  }
});

// Get current user session
router.get('/auth/session', requireAuth, async (req, res) => {
  try {
    const session = await getUserSession(req.user.id);
    if (!session) {
      return res.status(401).json({ error: 'No active session found' });
    }

    res.json({
      success: true,
      user: {
        id: req.user.id,
        email: session.userInfo?.email,
        name: session.userInfo?.name,
        moneyviewId: session.userInfo?.id
      },
      session: {
        expiresAt: session.expiresAt,
        scopes: session.scope
      }
    });
  } catch (error) {
    console.error('Session retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve session' });
  }
});

// Refresh access token
router.post('/auth/refresh', requireAuth, async (req, res) => {
  try {
    const session = await getUserSession(req.user.id);
    if (!session) {
      return res.status(401).json({ error: 'No active session found' });
    }

    const newTokenData = await refreshAccessToken(session.refresh_token);
    await storeUserSession(req.user.id, {
      ...newTokenData,
      userInfo: session.userInfo
    });

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      expiresAt: Date.now() + (newTokenData.expires_in * 1000)
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

// Logout and revoke session
router.post('/auth/logout', requireAuth, async (req, res) => {
  try {
    await revokeUserSession(req.user.id);
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Failed to logout' });
  }
});

// Get Moneyview user info
router.get('/user/info', requireAuth, async (req, res) => {
  try {
    const session = await getUserSession(req.user.id);
    if (!session) {
      return res.status(401).json({ error: 'No active session found' });
    }

    // Get fresh user info from Moneyview
    const userInfo = await getUserInfo(session.access_token);
    
    res.json({
      success: true,
      user: userInfo
    });
  } catch (error) {
    console.error('User info retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve user info' });
  }
});

module.exports = router;
