const { pool } = require('../models/database');
const IndianDemographicsService = require('./indianDemographics');

const PLACEHOLDER_PATTERNS = [
  'ui-avatars.com',
  'pravatar.cc',
  'data:image/svg+xml',
];

const DEFAULT_DEMOGRAPHICS = {
  name: 'Persona',
  age: 34,
  gender: 'Male',
  role_title: 'Professional',
  location: 'Mumbai, Maharashtra',
};

const needsNewAvatar = (url) => {
  if (!url) return true;
  return PLACEHOLDER_PATTERNS.some((pattern) => url.includes(pattern));
};

const buildDemographics = (agent) => {
  const demographics = agent.demographics || {};

  return {
    ...DEFAULT_DEMOGRAPHICS,
    ...demographics,
    name: demographics.name || agent.name || DEFAULT_DEMOGRAPHICS.name,
    age: demographics.age || agent.age || DEFAULT_DEMOGRAPHICS.age,
    gender: demographics.gender || agent.gender || DEFAULT_DEMOGRAPHICS.gender,
    role_title:
      demographics.role_title ||
      agent.role_title ||
      agent.occupation ||
      DEFAULT_DEMOGRAPHICS.role_title,
    location:
      demographics.location ||
      agent.location ||
      DEFAULT_DEMOGRAPHICS.location,
  };
};

const persistAvatar = async (agentId, avatarUrl) => {
  if (!agentId || !avatarUrl) return;
  try {
    await pool.query(
      'UPDATE ai_agents SET avatar_url = $1, updated_at = NOW() WHERE id = $2',
      [avatarUrl, agentId],
    );
  } catch (error) {
    console.error(`Failed to persist avatar for agent ${agentId}:`, error.message);
  }
};

const ensureAgentAvatar = async (agent) => {
  if (!agent) return agent;

  if (!needsNewAvatar(agent.avatar_url)) {
    return agent;
  }

  const demographics = buildDemographics(agent);
  const avatarUrl = IndianDemographicsService.generateUnsplashPhoto(demographics);

  if (!avatarUrl) {
    return agent;
  }

  await persistAvatar(agent.id, avatarUrl);

  return {
    ...agent,
    avatar_url: avatarUrl,
  };
};

const ensureAvatarsForAgents = async (agents = []) => {
  return Promise.all(agents.map((agent) => ensureAgentAvatar(agent)));
};

module.exports = {
  ensureAgentAvatar,
  ensureAvatarsForAgents,
};

