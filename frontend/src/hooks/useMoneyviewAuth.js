import { useState, useCallback, useEffect } from 'react';
import api from '../utils/api';
import useAuthStore from '../stores/authStore';

/**
 * Custom hook for Moneyview OAuth authentication
 */
export const useMoneyviewAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [session, setSession] = useState(null);

  const { user, updateUser } = useAuthStore();

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  /**
   * Check current authentication status
   */
  const checkAuthStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get('/moneyview/auth/session');
      
      if (response.data.success) {
        setIsAuthenticated(true);
        setUserInfo(response.data.user);
        setSession(response.data.session);
      } else {
        setIsAuthenticated(false);
        setUserInfo(null);
        setSession(null);
      }
    } catch (err) {
      setIsAuthenticated(false);
      setUserInfo(null);
      setSession(null);
      
      // Don't set error for 401 (not authenticated)
      if (err.response?.status !== 401) {
        setError(err.response?.data?.error || 'Failed to check authentication status');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Initiate Moneyview OAuth flow
   */
  const initiateAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user?.id) {
        throw new Error('User ID not found. Please log in first.');
      }

      const response = await api.post('/moneyview/auth/initiate', {
        userId: user.id
      });

      if (response.data.success && response.data.authUrl) {
        // Redirect to Moneyview OAuth
        window.location.href = response.data.authUrl;
        return { success: true, authUrl: response.data.authUrl };
      }

      throw new Error('Failed to initiate authentication');
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to initiate authentication';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  /**
   * Handle OAuth callback (called by callback component)
   */
  const handleCallback = useCallback(async (code, state) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get('/moneyview/auth/callback', {
        params: { code, state }
      });

      if (response.data.success) {
        setIsAuthenticated(true);
        setUserInfo(response.data.user);
        
        // Update user store with Moneyview info
        updateUser({
          ...user,
          moneyviewId: response.data.user.id,
          moneyviewEmail: response.data.user.email,
          moneyviewName: response.data.user.name
        });

        return { success: true, user: response.data.user };
      }

      throw new Error('Authentication failed');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Authentication failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user, updateUser]);

  /**
   * Refresh access token
   */
  const refreshToken = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.post('/moneyview/auth/refresh');

      if (response.data.success) {
        setSession(prev => ({
          ...prev,
          expiresAt: response.data.expiresAt
        }));
        return { success: true };
      }

      throw new Error('Token refresh failed');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Token refresh failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout and revoke session
   */
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      await api.post('/moneyview/auth/logout');
      
      setIsAuthenticated(false);
      setUserInfo(null);
      setSession(null);
      
      // Update user store to remove Moneyview info
      updateUser({
        ...user,
        moneyviewId: null,
        moneyviewEmail: null,
        moneyviewName: null
      });

      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Logout failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user, updateUser]);

  /**
   * Get fresh user info from Moneyview
   */
  const refreshUserInfo = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get('/moneyview/user/info');

      if (response.data.success) {
        setUserInfo(response.data.user);
        return { success: true, user: response.data.user };
      }

      throw new Error('Failed to refresh user info');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to refresh user info';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isAuthenticated,
    isLoading,
    error,
    userInfo,
    session,
    initiateAuth,
    handleCallback,
    refreshToken,
    logout,
    refreshUserInfo,
    checkAuthStatus,
    clearError
  };
};

export default useMoneyviewAuth;
