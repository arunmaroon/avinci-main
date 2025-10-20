/**
 * Image Fetcher Utility - Pexels API Integration
 * Fetches real stock images for AI agent personas based on 51 UXPressia fields
 * Optimized for fintech UX simulations with empathetic, realistic personas
 */

const axios = require('axios');
const redis = require('redis');

class ImageFetcher {
  constructor() {
    this.pexelsApiKey = process.env.PEXELS_API_KEY;
    this.pexelsBaseUrl = 'https://api.pexels.com/v1/search';
    this.redisClient = null;
    this.cacheTtl = 3600; // 1 hour TTL
    
    // Initialize Redis connection
    this.initRedis();
  }

  /**
   * Initialize Redis connection for caching
   */
  async initRedis() {
    try {
      this.redisClient = redis.createClient({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined
      });
      
      await this.redisClient.connect();
      console.log('✅ Redis connected for image caching');
    } catch (error) {
      console.warn('⚠️ Redis connection failed, proceeding without cache:', error.message);
      this.redisClient = null;
    }
  }

  /**
   * Build search query from 51 UXPressia fields
   * Creates natural language queries like "male 30 year old Indian businessman in Bangalore realistic photo"
   */
  buildSearchQuery(personaData) {
    const {
      gender,
      age,
      ethnicity,
      occupation,
      location,
      industry,
      education,
      income_range,
      family_status,
      personality_archetype,
      lifestyle,
      tech_savviness,
      communication_style,
      cultural_background,
      life_stage
    } = personaData;

    // Core demographic terms
    const demographicTerms = [];
    
    // Gender
    if (gender) {
      demographicTerms.push(gender.toLowerCase());
    }
    
    // Age group
    if (age) {
      const ageGroup = this.getAgeGroup(age);
      demographicTerms.push(ageGroup);
    }
    
    // Ethnicity/Cultural background
    if (ethnicity || cultural_background) {
      const ethnicityTerm = ethnicity || cultural_background;
      if (ethnicityTerm.toLowerCase().includes('indian')) {
        demographicTerms.push('indian');
      } else if (ethnicityTerm.toLowerCase().includes('asian')) {
        demographicTerms.push('asian');
      } else if (ethnicityTerm.toLowerCase().includes('caucasian')) {
        demographicTerms.push('caucasian');
      } else if (ethnicityTerm.toLowerCase().includes('african')) {
        demographicTerms.push('african');
      } else if (ethnicityTerm.toLowerCase().includes('hispanic')) {
        demographicTerms.push('hispanic');
      }
    }
    
    // Professional context
    const professionalTerms = [];
    if (occupation) {
      professionalTerms.push(occupation.toLowerCase());
    }
    if (industry) {
      professionalTerms.push(industry.toLowerCase());
    }
    
    // Location context
    const locationTerms = [];
    if (location) {
      // Extract city/region from location
      const city = this.extractCityFromLocation(location);
      if (city) {
        locationTerms.push(city.toLowerCase());
      }
    }
    
    // Lifestyle and personality context
    const lifestyleTerms = [];
    if (lifestyle) {
      lifestyleTerms.push(lifestyle.toLowerCase());
    }
    if (personality_archetype) {
      lifestyleTerms.push(personality_archetype.toLowerCase());
    }
    
    // Tech context
    const techTerms = [];
    if (tech_savviness) {
      if (tech_savviness.toLowerCase().includes('high') || tech_savviness.toLowerCase().includes('expert')) {
        techTerms.push('professional');
      } else if (tech_savviness.toLowerCase().includes('low') || tech_savviness.toLowerCase().includes('beginner')) {
        techTerms.push('casual');
      }
    }
    
    // Communication style
    const communicationTerms = [];
    if (communication_style) {
      if (communication_style.tone) {
        communicationTerms.push(communication_style.tone.toLowerCase());
      }
      if (communication_style.formality) {
        if (communication_style.formality > 6) {
          communicationTerms.push('formal');
        } else if (communication_style.formality < 4) {
          communicationTerms.push('casual');
        }
      }
    }
    
    // Combine all terms
    const allTerms = [
      ...demographicTerms,
      ...professionalTerms,
      ...locationTerms,
      ...lifestyleTerms,
      ...techTerms,
      ...communicationTerms
    ];
    
    // Add quality descriptors
    allTerms.push('realistic', 'professional', 'portrait');
    
    // Remove duplicates and empty strings
    const uniqueTerms = [...new Set(allTerms.filter(term => term && term.length > 0))];
    
    return uniqueTerms.join(' ');
  }

  /**
   * Get age group from specific age
   */
  getAgeGroup(age) {
    if (age < 25) return 'young';
    if (age < 35) return 'young adult';
    if (age < 45) return 'adult';
    if (age < 55) return 'middle aged';
    if (age < 65) return 'mature';
    return 'senior';
  }

  /**
   * Extract city from location string
   */
  extractCityFromLocation(location) {
    if (!location) return null;
    
    // Common Indian cities
    const indianCities = [
      'mumbai', 'delhi', 'bangalore', 'hyderabad', 'chennai', 'kolkata', 'pune',
      'ahmedabad', 'jaipur', 'lucknow', 'kanpur', 'nagpur', 'indore', 'thane',
      'bhopal', 'visakhapatnam', 'pimpri', 'patna', 'vadodara', 'ludhiana',
      'agra', 'nashik', 'faridabad', 'meerut', 'rajkot', 'kalyan', 'vasai',
      'varanasi', 'srinagar', 'aurangabad', 'noida', 'solapur', 'ranchi',
      'kochi', 'coimbatore', 'tiruchirappalli', 'madurai', 'salem', 'tirunelveli'
    ];
    
    const locationLower = location.toLowerCase();
    for (const city of indianCities) {
      if (locationLower.includes(city)) {
        return city;
      }
    }
    
    // Fallback: return first word
    return location.split(',')[0].trim();
  }

  /**
   * Generate cache key for persona image
   */
  getCacheKey(personaData) {
    const keyData = {
      gender: personaData.gender,
      age: personaData.age,
      occupation: personaData.occupation,
      location: personaData.location,
      ethnicity: personaData.ethnicity
    };
    
    return `persona_image:${Buffer.from(JSON.stringify(keyData)).toString('base64')}`;
  }

  /**
   * Fetch image from cache
   */
  async getCachedImage(cacheKey) {
    if (!this.redisClient) return null;
    
    try {
      const cached = await this.redisClient.get(cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.warn('⚠️ Cache read error:', error.message);
      return null;
    }
  }

  /**
   * Cache image data
   */
  async cacheImage(cacheKey, imageData) {
    if (!this.redisClient) return;
    
    try {
      await this.redisClient.setEx(cacheKey, this.cacheTtl, JSON.stringify(imageData));
    } catch (error) {
      console.warn('⚠️ Cache write error:', error.message);
    }
  }

  /**
   * Fetch persona image from Pexels API
   * @param {Object} personaData - Persona data with 51 UXPressia fields
   * @returns {Object} Image data with URL and metadata
   */
  async fetchPersonaImage(personaData) {
    try {
      // Check cache first
      const cacheKey = this.getCacheKey(personaData);
      const cachedImage = await this.getCachedImage(cacheKey);
      
      if (cachedImage) {
        console.log('✅ Using cached image for persona');
        return cachedImage;
      }

      // Build search query
      const searchQuery = this.buildSearchQuery(personaData);
      console.log(`🔍 Searching Pexels for: "${searchQuery}"`);

      if (!this.pexelsApiKey) {
        console.warn('⚠️ PEXELS_API_KEY not found, using fallback');
        return this.getFallbackImage(personaData);
      }

      // Make API request to Pexels
      const response = await axios.get(this.pexelsBaseUrl, {
        headers: {
          'Authorization': this.pexelsApiKey
        },
        params: {
          query: searchQuery,
          per_page: 1,
          orientation: 'portrait',
          size: 'medium'
        },
        timeout: 10000
      });

      if (response.data && response.data.photos && response.data.photos.length > 0) {
        const photo = response.data.photos[0];
        
        const imageData = {
          url: photo.src.medium,
          photographer: photo.photographer,
          photographer_url: photo.photographer_url,
          pexels_url: photo.url,
          alt: photo.alt || searchQuery,
          width: photo.width,
          height: photo.height,
          attribution: 'Via Pexels',
          source: 'pexels',
          cached_at: new Date().toISOString()
        };

        // Cache the result
        await this.cacheImage(cacheKey, imageData);
        
        console.log(`✅ Fetched image from Pexels: ${imageData.url}`);
        return imageData;
      } else {
        console.warn('⚠️ No images found in Pexels response');
        return this.getFallbackImage(personaData);
      }

    } catch (error) {
      console.error('❌ Error fetching image from Pexels:', error.message);
      
      // Fallback to Unsplash or default
      return this.getFallbackImage(personaData);
    }
  }

  /**
   * Get fallback image when Pexels fails
   */
  async getFallbackImage(personaData) {
    try {
      // Try Unsplash as fallback
      const unsplashQuery = this.buildSearchQuery(personaData);
      const unsplashUrl = `https://source.unsplash.com/400x400/?${encodeURIComponent(unsplashQuery)}`;
      
      return {
        url: unsplashUrl,
        photographer: 'Unsplash',
        photographer_url: 'https://unsplash.com',
        pexels_url: null,
        alt: unsplashQuery,
        width: 400,
        height: 400,
        attribution: 'Via Unsplash',
        source: 'unsplash',
        cached_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Fallback image generation failed:', error.message);
      
      // Ultimate fallback - UI Avatars
      const name = personaData.name || 'Persona';
      const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
      
      return {
        url: `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=random&color=fff&size=400`,
        photographer: 'UI Avatars',
        photographer_url: 'https://ui-avatars.com',
        pexels_url: null,
        alt: `${name} avatar`,
        width: 400,
        height: 400,
        attribution: 'Generated Avatar',
        source: 'ui-avatars',
        cached_at: new Date().toISOString()
      };
    }
  }

  /**
   * Batch fetch images for multiple personas
   * @param {Array} personasData - Array of persona data objects
   * @returns {Array} Array of image data objects
   */
  async batchFetchImages(personasData) {
    const results = [];
    
    // Process in batches of 5 to avoid rate limiting
    const batchSize = 5;
    for (let i = 0; i < personasData.length; i += batchSize) {
      const batch = personasData.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (personaData) => {
        try {
          const imageData = await this.fetchPersonaImage(personaData);
          return { personaId: personaData.id, imageData, success: true };
        } catch (error) {
          console.error(`❌ Error fetching image for persona ${personaData.id}:`, error.message);
          return { personaId: personaData.id, imageData: null, success: false, error: error.message };
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < personasData.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }

  /**
   * Close Redis connection
   */
  async close() {
    if (this.redisClient) {
      await this.redisClient.quit();
    }
  }
}

module.exports = ImageFetcher;