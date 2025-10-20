/**
 * Persona Store - Zustand store for persona management
 * Handles persona CRUD operations with image support
 */

import { create } from 'zustand';
import api from '../utils/api';

const usePersonaStore = create((set, get) => ({
  // State
  personas: [],
  selectedPersona: null,
  isLoading: false,
  error: null,
  imageLoading: false,
  filters: {
    search: '',
    status: 'active',
    sortBy: 'created_at',
    sortOrder: 'DESC'
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  },

  // Actions
  /**
   * Fetch all personas with pagination and filtering
   */
  fetchPersonas: async (options = {}) => {
    set({ isLoading: true, error: null });
    
    try {
      const { filters, pagination } = get();
      const params = {
        page: options.page || pagination.page,
        limit: options.limit || pagination.limit,
        search: options.search || filters.search,
        status: options.status || filters.status,
        sortBy: options.sortBy || filters.sortBy,
        sortOrder: options.sortOrder || filters.sortOrder
      };

      const response = await api.get('/personas/v2', { params });
      
      set({
        personas: response.data.data.personas || [],
        pagination: {
          page: response.data.data.page || 1,
          limit: response.data.data.limit || 20,
          total: response.data.data.total || 0,
          totalPages: response.data.data.totalPages || 0
        },
        isLoading: false
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching personas:', error);
      set({
        error: error.response?.data?.error || error.message,
        isLoading: false
      });
      throw error;
    }
  },

  /**
   * Fetch a single persona by ID
   */
  fetchPersona: async (personaId) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.get(`/personas/v2/${personaId}`);
      
      set({
        selectedPersona: response.data.data,
        isLoading: false
      });

      return response.data.data;
    } catch (error) {
      console.error('Error fetching persona:', error);
      set({
        error: error.response?.data?.error || error.message,
        isLoading: false
      });
      throw error;
    }
  },

  /**
   * Create a new persona
   */
  createPersona: async (personaData) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.post('/personas/v2', personaData);
      
      // Add to local state
      set(state => ({
        personas: [response.data.data, ...state.personas],
        selectedPersona: response.data.data,
        isLoading: false
      }));

      return response.data.data;
    } catch (error) {
      console.error('Error creating persona:', error);
      set({
        error: error.response?.data?.error || error.message,
        isLoading: false
      });
      throw error;
    }
  },

  /**
   * Update an existing persona
   */
  updatePersona: async (personaId, updates) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.put(`/personas/v2/${personaId}`, updates);
      
      // Update local state
      set(state => ({
        personas: state.personas.map(p => 
          p.id === personaId ? { ...p, ...response.data.data } : p
        ),
        selectedPersona: state.selectedPersona?.id === personaId 
          ? { ...state.selectedPersona, ...response.data.data }
          : state.selectedPersona,
        isLoading: false
      }));

      return response.data.data;
    } catch (error) {
      console.error('Error updating persona:', error);
      set({
        error: error.response?.data?.error || error.message,
        isLoading: false
      });
      throw error;
    }
  },

  /**
   * Delete a persona
   */
  deletePersona: async (personaId) => {
    set({ isLoading: true, error: null });
    
    try {
      await api.delete(`/personas/v2/${personaId}`);
      
      // Remove from local state
      set(state => ({
        personas: state.personas.filter(p => p.id !== personaId),
        selectedPersona: state.selectedPersona?.id === personaId 
          ? null 
          : state.selectedPersona,
        isLoading: false
      }));

      return true;
    } catch (error) {
      console.error('Error deleting persona:', error);
      set({
        error: error.response?.data?.error || error.message,
        isLoading: false
      });
      throw error;
    }
  },

  /**
   * Regenerate persona image
   */
  regenerateImage: async (personaId) => {
    set({ imageLoading: true, error: null });
    
    try {
      const response = await api.put(`/personas/v2/${personaId}/regenerate-image`);
      
      // Update local state with new image data
      set(state => ({
        personas: state.personas.map(p => 
          p.id === personaId 
            ? { 
                ...p, 
                profile_image_url: response.data.data.imageData.url,
                image_metadata: response.data.data.imageData
              } 
            : p
        ),
        selectedPersona: state.selectedPersona?.id === personaId 
          ? { 
              ...state.selectedPersona, 
              profile_image_url: response.data.data.imageData.url,
              image_metadata: response.data.data.imageData
            }
          : state.selectedPersona,
        imageLoading: false
      }));

      return response.data.data;
    } catch (error) {
      console.error('Error regenerating image:', error);
      set({
        error: error.response?.data?.error || error.message,
        imageLoading: false
      });
      throw error;
    }
  },

  /**
   * Set selected persona
   */
  setSelectedPersona: (persona) => {
    set({ selectedPersona: persona });
  },

  /**
   * Update filters
   */
  updateFilters: (newFilters) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters }
    }));
  },

  /**
   * Update pagination
   */
  updatePagination: (newPagination) => {
    set(state => ({
      pagination: { ...state.pagination, ...newPagination }
    }));
  },

  /**
   * Clear error
   */
  clearError: () => {
    set({ error: null });
  },

  /**
   * Reset store
   */
  reset: () => {
    set({
      personas: [],
      selectedPersona: null,
      isLoading: false,
      error: null,
      imageLoading: false,
      filters: {
        search: '',
        status: 'active',
        sortBy: 'created_at',
        sortOrder: 'DESC'
      },
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
      }
    });
  },

  /**
   * Get persona by ID from local state
   */
  getPersonaById: (personaId) => {
    const { personas } = get();
    return personas.find(p => p.id === personaId);
  },

  /**
   * Search personas locally
   */
  searchPersonas: (query) => {
    const { personas } = get();
    if (!query) return personas;
    
    const lowercaseQuery = query.toLowerCase();
    return personas.filter(persona => 
      persona.name?.toLowerCase().includes(lowercaseQuery) ||
      persona.occupation?.toLowerCase().includes(lowercaseQuery) ||
      persona.location?.toLowerCase().includes(lowercaseQuery) ||
      persona.company?.toLowerCase().includes(lowercaseQuery)
    );
  }
}));

export default usePersonaStore;