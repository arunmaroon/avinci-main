const axios = require('axios');
const { redis } = require('../models/database');

const MONEYVIEW_API_BASE = 'https://api.moneyview.in/v1';
const OAUTH_BASE = 'https://auth.moneyview.in/oauth';

function requireEnv() {
  if (process.env.MONEYVIEW_OAUTH_ENABLED === 'true') {
    if (!process.env.MONEYVIEW_CLIENT_ID || !process.env.MONEYVIEW_CLIENT_SECRET) {
      throw new Error('MONEYVIEW_CLIENT_ID and MONEYVIEW_CLIENT_SECRET are required when MONEYVIEW_OAUTH_ENABLED=true');
    }
  }
}

function getOAuthUrl(state) {
  const redirect = encodeURIComponent(process.env.MONEYVIEW_REDIRECT_URI || 'http://localhost:9000/auth/moneyview-callback');
  const scope = encodeURIComponent('read write admin');
  return `${OAUTH_BASE}?client_id=${process.env.MONEYVIEW_CLIENT_ID}&redirect_uri=${redirect}&scope=${scope}&state=${state}&response_type=code`;
}

async function exchangeCodeForToken(code) {
  const res = await axios.post(`${MONEYVIEW_API_BASE}/oauth/token`, null, {
    params: {
      client_id: process.env.MONEYVIEW_CLIENT_ID,
      client_secret: process.env.MONEYVIEW_CLIENT_SECRET,
      redirect_uri: process.env.MONEYVIEW_REDIRECT_URI || 'http://localhost:9000/auth/moneyview-callback',
      code,
      grant_type: 'authorization_code'
    }
  });
  return res.data; // { access_token, refresh_token, expires_in, user_info }
}

async function storeTokenForState(state, data) {
  await redis.connect().catch(() => {});
  await redis.setEx(`moneyview:oauth:${state}`, 3600, JSON.stringify(data));
}

async function getTokenForState(state) {
  await redis.connect().catch(() => {});
  const raw = await redis.get(`moneyview:oauth:${state}`);
  return raw ? JSON.parse(raw) : null;
}

async function refreshAccessToken(refreshToken) {
  try {
    const res = await axios.post(`${MONEYVIEW_API_BASE}/oauth/refresh`, null, {
      params: {
        client_id: process.env.MONEYVIEW_CLIENT_ID,
        client_secret: process.env.MONEYVIEW_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      }
    });
    return res.data;
  } catch (error) {
    console.error('Failed to refresh Moneyview token:', error);
    throw error;
  }
}

async function getUserInfo(accessToken) {
  try {
    const res = await axios.get(`${MONEYVIEW_API_BASE}/user`, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    return res.data;
  } catch (error) {
    console.error('Failed to get Moneyview user info:', error);
    throw error;
  }
}

async function storeUserSession(userId, tokenData) {
  await redis.connect().catch(() => {});
  const sessionKey = `moneyview:session:${userId}`;
  const sessionData = {
    ...tokenData,
    createdAt: Date.now(),
    expiresAt: Date.now() + (tokenData.expires_in * 1000)
  };
  await redis.setEx(sessionKey, tokenData.expires_in, JSON.stringify(sessionData));
}

async function getUserSession(userId) {
  await redis.connect().catch(() => {});
  const sessionKey = `moneyview:session:${userId}`;
  const raw = await redis.get(sessionKey);
  return raw ? JSON.parse(raw) : null;
}

async function revokeUserSession(userId) {
  await redis.connect().catch(() => {});
  const sessionKey = `moneyview:session:${userId}`;
  await redis.del(sessionKey);
}

module.exports = {
  MONEYVIEW_API_BASE,
  getOAuthUrl,
  exchangeCodeForToken,
  getFigmaFile: null, // Not applicable for Moneyview
  storeTokenForState,
  getTokenForState,
  refreshAccessToken,
  getUserInfo,
  storeUserSession,
  getUserSession,
  revokeUserSession,
  requireEnv
};
