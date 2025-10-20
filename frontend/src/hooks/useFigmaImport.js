import { useState, useCallback } from 'react';
import api from '../utils/api';

/**
 * Custom hook for Figma import functionality
 */
export const useFigmaImport = () => {
  const [prototype, setPrototype] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Initiate Figma OAuth flow
   */
  const initiateAuth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/design/admin/import', { needsAuth: true });
      
      if (response.data.needsAuth && response.data.authUrl) {
        // Redirect to Figma OAuth
        window.location.href = response.data.authUrl;
        return { needsAuth: true, authUrl: response.data.authUrl };
      }
      
      return { needsAuth: false };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to initiate authentication';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Import a Figma prototype
   * @param {string} fileKey - Figma file key
   * @param {string} accessToken - Figma access token
   * @param {string} imageBase64 - Optional base64 image for AI validation
   * @returns {Promise<Object>} Import result
   */
  const importFigma = useCallback(async (fileKey, accessToken, imageBase64 = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/design/admin/import', {
        fileKey,
        accessToken,
        image: imageBase64
      });
      
      if (response.data.success) {
        setPrototype({
          id: response.data.prototypeId,
          astPreview: response.data.astPreview,
          validation: response.data.validation,
          summary: response.data.summary
        });
        
        return {
          success: true,
          prototypeId: response.data.prototypeId,
          astPreview: response.data.astPreview,
          validation: response.data.validation,
          summary: response.data.summary
        };
      }
      
      throw new Error('Import failed');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to import Figma file';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Search for prototypes
   * @param {string} query - Search query
   * @param {number} limit - Number of results to return
   * @returns {Promise<Array>} Search results
   */
  const searchPrototypes = useCallback(async (query, limit = 3) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/design/admin/search', {
        params: { q: query, limit }
      });
      
      if (response.data.success) {
        return response.data.results;
      }
      
      throw new Error('Search failed');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to search prototypes';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * List imported prototypes
   * @param {number} limit - Number of prototypes to return
   * @param {number} offset - Offset for pagination
   * @returns {Promise<Array>} List of prototypes
   */
  const listPrototypes = useCallback(async (limit = 20, offset = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/design/admin/prototypes', {
        params: { limit, offset }
      });
      
      if (response.data.success) {
        return response.data.prototypes;
      }
      
      throw new Error('Failed to list prototypes');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to list prototypes';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Clear current prototype and error state
   */
  const clearState = useCallback(() => {
    setPrototype(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    prototype,
    loading,
    error,
    initiateAuth,
    importFigma,
    searchPrototypes,
    listPrototypes,
    clearState
  };
};

export default useFigmaImport;
