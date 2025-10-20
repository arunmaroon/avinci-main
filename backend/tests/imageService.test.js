const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const { fetchPersonaImage, buildCacheKey } = require('../services/imageService');

describe('imageService', () => {
  const demographics = { name: 'Rakesh', gender: 'Male', age: 32, role_title: 'Engineer', location: 'Bengaluru' };
  const agent = { id: '11111111-1111-1111-1111-111111111111' };

  beforeEach(() => {
    process.env.PEXELS_API_KEY = 'test-key';
  });

  afterEach(() => {
    delete process.env.PEXELS_API_KEY;
  });

  it('builds deterministic cache key', () => {
    const k1 = buildCacheKey(agent, demographics);
    const k2 = buildCacheKey(agent, demographics);
    expect(k1).toBe(k2);
  });

  it('returns Pexels image when API responds', async () => {
    const mock = new MockAdapter(axios);
    mock.onGet(/pexels\.com/).reply(200, {
      photos: [
        { width: 800, height: 1000, src: { medium: 'https://images.pexels.com/photo.jpg' }, photographer: 'Alex', photographer_url: 'https://pexels.com/u/alex' },
      ]
    });

    const result = await fetchPersonaImage(agent, demographics);
    expect(result.url).toMatch(/^https:\/\/images\.pexels\.com\/photo/);
    expect(result.attribution).toBe('pexels');
  });

  it('falls back to curated Unsplash list when no API or empty', async () => {
    delete process.env.PEXELS_API_KEY;
    const result = await fetchPersonaImage(agent, demographics);
    expect(result.url).toMatch(/^https:\/\/images\.unsplash\.com\//);
    expect(['unsplash', 'pexels']).toContain(result.attribution);
  });
});


