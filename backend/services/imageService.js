/**
 * Image Service
 * Fetches a representative persona image using Pexels (if API key present)
 * with a resilient fallback to our curated Unsplash list. Results are cached
 * in Redis for one hour to avoid API overuse.
 */

const axios = require('axios');
const crypto = require('crypto');
const { redis } = require('../models/database');
const IndianDemographicsService = require('./indianDemographics');

const ONE_HOUR = 60 * 60; // seconds

/**
 * Build a deterministic cache key from agent id or demographics
 */
function buildCacheKey(agent, demographics) {
  const seedStr = `${agent?.id || ''}|${demographics?.name || ''}|${demographics?.gender || ''}|${demographics?.age || ''}|${demographics?.role_title || ''}|${demographics?.location || ''}`;
  const hash = crypto.createHash('sha1').update(seedStr).digest('hex');
  return `avatar:${hash}`;
}

/**
 * Build a Pexels search query from demographics
 */
function buildPexelsQuery(demographics = {}) {
  const parts = [];
  if (demographics.gender === 'Male') parts.push('indian man');
  if (demographics.gender === 'Female') parts.push('indian woman');
  if (!parts.length) parts.push('indian person');
  if (demographics.role_title) parts.push(String(demographics.role_title));
  if (demographics.location) parts.push(String(demographics.location).split(',')[0]);
  parts.push('portrait professional');
  return parts.join(' ').trim();
}

/**
 * Try Pexels search and return an image URL cropped to square
 */
async function fetchFromPexels(demographics) {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) return null;

  const query = buildPexelsQuery(demographics);
  const url = `https://api.pexels.com/v1/search?per_page=15&orientation=portrait&query=${encodeURIComponent(query)}`;

  const res = await axios.get(url, {
    headers: { Authorization: apiKey }
  });

  const photos = Array.isArray(res?.data?.photos) ? res.data.photos : [];
  if (!photos.length) return null;

  // Prefer photos with a person/face tagged if available
  const pick = photos.find(p => p.width >= 400 && p.height >= 400) || photos[0];
  const src = pick?.src?.medium || pick?.src?.small || pick?.src?.original;
  if (!src) return null;

  // Normalize to a square 400x400 crop when possible
  const normalized = `${src}${src.includes('?') ? '&' : '?'}w=400&h=400&fit=crop&crop=faces`;
  return { url: normalized, attribution: 'pexels', photographer: pick?.photographer, photographer_url: pick?.photographer_url };
}

/**
 * Fallback provider using curated Unsplash faces
 */
function fetchFromFallback(demographics) {
  const seed = IndianDemographicsService.generateSeedFromDemographics(demographics);
  const url = IndianDemographicsService.generateIndianFacePhoto(demographics, seed);
  return { url, attribution: 'unsplash' };
}

/**
 * Public API: fetchPersonaImage
 * - Checks Redis cache
 * - Tries Pexels when key exists, else Unsplash fallback
 * - Caches final URL for 1 hour
 */
async function fetchPersonaImage(agent, demographics = {}) {
  const cacheKey = buildCacheKey(agent, demographics);

  try {
    if (redis?.isOpen === false) {
      try { await redis.connect(); } catch (_) {}
    }
    const cached = redis ? await redis.get(cacheKey) : null;
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (_) {}

  let result = null;
  try {
    result = await fetchFromPexels(demographics);
  } catch (_) {
    // ignore API errors and fallback
  }

  if (!result) {
    result = fetchFromFallback(demographics);
  }

  try {
    if (redis) {
      await redis.setEx(cacheKey, ONE_HOUR, JSON.stringify(result));
    }
  } catch (_) {}

  return result;
}

module.exports = {
  fetchPersonaImage,
  buildCacheKey,
};


