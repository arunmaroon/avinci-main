/**
 * Unsplash Image Service
 * Fetches real stock images for AI agent personas
 */

const { createApi } = require('unsplash-js');

// Simple logger fallback
const logger = {
  error: (message, error) => console.error(`[ERROR] ${message}`, error),
  warn: (message, context) => console.warn(`[WARN] ${message}`, context),
  info: (message, context) => console.log(`[INFO] ${message}`, context)
};

class UnsplashImageService {
  constructor() {
    this.unsplash = createApi({
      accessKey: process.env.UNSPLASH_ACCESS_KEY
    });
  }

  /**
   * Generate search query for persona image
   * @param {Object} persona - Persona data
   * @returns {string} - Search query
   */
  generateSearchQuery(persona) {
    try {
      const { name, age, gender, occupation, location } = persona;
      
      // Extract state from location for better results
      const state = location ? location.split(',').pop().trim() : '';
      
      // Build query components
      const queryParts = [];
      
      // Age and gender
      if (age) {
        queryParts.push(`${age} year old`);
      }
      
      if (gender) {
        queryParts.push(gender.toLowerCase());
      } else {
        queryParts.push('person');
      }
      
      // Location context
      if (state && state.toLowerCase() !== 'india') {
        queryParts.push(state.toLowerCase());
      } else {
        queryParts.push('indian');
      }
      
      // Occupation context
      if (occupation) {
        const occupationKeywords = this.getOccupationKeywords(occupation);
        queryParts.push(occupationKeywords);
      }
      
      // Professional context
      queryParts.push('professional', 'portrait');
      
      return queryParts.join(' ');
    } catch (error) {
      logger.error('Error generating search query:', error);
      return 'indian professional person portrait';
    }
  }

  /**
   * Get occupation-specific keywords for better image search
   * @param {string} occupation - Person's occupation
   * @returns {string} - Occupation keywords
   */
  getOccupationKeywords(occupation) {
    const occupationMap = {
      'trader': 'business professional',
      'engineer': 'tech professional',
      'doctor': 'medical professional',
      'teacher': 'education professional',
      'manager': 'business professional',
      'designer': 'creative professional',
      'developer': 'tech professional',
      'consultant': 'business professional',
      'analyst': 'business professional',
      'entrepreneur': 'business professional',
      'student': 'young professional',
      'freelancer': 'creative professional'
    };
    
    const lowerOccupation = occupation.toLowerCase();
    
    for (const [key, value] of Object.entries(occupationMap)) {
      if (lowerOccupation.includes(key)) {
        return value;
      }
    }
    
    return 'professional';
  }

  /**
   * Search for persona image
   * @param {Object} persona - Persona data
   * @returns {Promise<Object>} - Image data
   */
  async searchPersonaImage(persona) {
    try {
      const query = this.generateSearchQuery(persona);
      console.log(`Searching Unsplash for: ${query}`);
      
      // Check if API key is available
      if (!process.env.UNSPLASH_ACCESS_KEY) {
        console.log('No Unsplash API key found, using fallback image');
        return this.getFallbackImage();
      }
      
      const response = await this.unsplash.search.getPhotos({
        query: query,
        page: 1,
        perPage: 10,
        orientation: 'portrait',
        orderBy: 'relevant'
      });
      
      console.log('Unsplash API response received');
      
      if (response && response.errors) {
        logger.error('Unsplash API errors:', response.errors);
        return this.getFallbackImage();
      }
      
      if (!response || !response.response || !response.response.results) {
        logger.warn('Invalid response structure from Unsplash API');
        return this.getFallbackImage();
      }
      
      const photos = response.response.results;
      
      if (!photos || photos.length === 0) {
        logger.warn('No images found for query:', query);
        return this.getFallbackImage();
      }
      
      // Select the best image (first result is usually most relevant)
      const selectedPhoto = photos[0];
      
      const imageData = {
        id: selectedPhoto.id,
        url: selectedPhoto.urls.regular,
        thumb: selectedPhoto.urls.thumb,
        small: selectedPhoto.urls.small,
        full: selectedPhoto.urls.full,
        alt: selectedPhoto.alt_description || `Portrait of ${persona.name || 'person'}`,
        photographer: selectedPhoto.user.name,
        photographer_url: selectedPhoto.user.links.html,
        unsplash_url: selectedPhoto.links.html,
        query: query
      };
      
      logger.info(`Found image for ${persona.name}: ${imageData.url}`);
      
      return imageData;
    } catch (error) {
      logger.error('Error searching persona image:', error);
      console.log('Using fallback image due to error:', error.message);
      return this.getFallbackImage();
    }
  }

  /**
   * Get fallback image when search fails
   * @returns {Object} - Fallback image data
   */
  getFallbackImage() {
    // Use a more appropriate Indian professional image as fallback
    return {
      id: 'fallback',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      thumb: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80',
      small: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
      full: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      alt: 'Indian professional portrait',
      photographer: 'Unsplash',
      photographer_url: 'https://unsplash.com',
      unsplash_url: 'https://unsplash.com/photos/1507003211169-0a1dd7228f2d',
      query: 'indian professional portrait',
      is_fallback: true
    };
  }

  /**
   * Search for multiple persona images
   * @param {Array} personas - Array of persona data
   * @returns {Promise<Array>} - Array of image data
   */
  async searchMultiplePersonaImages(personas) {
    try {
      const results = [];
      
      for (const persona of personas) {
        try {
          const imageData = await this.searchPersonaImage(persona);
          results.push({
            persona_id: persona.id || persona.name,
            image: imageData,
            success: true
          });
        } catch (error) {
          logger.error(`Error searching image for ${persona.name}:`, error);
          results.push({
            persona_id: persona.id || persona.name,
            image: this.getFallbackImage(),
            success: false,
            error: error.message
          });
        }
      }

      return results;
    } catch (error) {
      logger.error('Error searching multiple persona images:', error);
      throw error;
    }
  }

  /**
   * Get image attribution text
   * @param {Object} imageData - Image data
   * @returns {string} - Attribution text
   */
  getAttribution(imageData) {
    if (imageData.is_fallback) {
      return 'Photo by Unsplash';
    }
    
    return `Photo by ${imageData.photographer} on Unsplash`;
  }

  /**
   * Get image attribution HTML
   * @param {Object} imageData - Image data
   * @returns {string} - Attribution HTML
   */
  getAttributionHTML(imageData) {
    if (imageData.is_fallback) {
      return '<a href="https://unsplash.com" target="_blank" rel="noopener noreferrer">Photo by Unsplash</a>';
    }
    
    return `<a href="${imageData.photographer_url}" target="_blank" rel="noopener noreferrer">Photo by ${imageData.photographer}</a> on <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer">Unsplash</a>`;
  }
}

module.exports = UnsplashImageService;
