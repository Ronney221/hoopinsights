/**
 * API Configuration
 * 
 * This file provides centralized configuration for API endpoints 
 * based on the current environment.
 */

// Determine if we're running in production
const isProduction = import.meta.env.PROD || process.env.NODE_ENV === 'production';

// Set base URLs for app and API
export const APP_URL = isProduction 
  ? 'https://hoopinsights.vercel.app' 
  : 'http://localhost:5173';

export const API_URL = isProduction 
  ? 'https://hoopinsights.vercel.app/api' 
  : 'http://localhost:5000/api';

// Auth-related API endpoints
export const AUTH_ENDPOINTS = {
  SAVE_USER_DATA: `${API_URL}/users/saveUserData`,
};

// Game stats-related API endpoints
export const STATS_ENDPOINTS = {
  SAVE_GAME: `${API_URL}/stats/saveGame`,
  GET_SAVED_GAMES: `${API_URL}/stats/savedGames`,
  DELETE_GAME: (videoId) => `${API_URL}/stats/deleteGame/${videoId}`,
};

// A helper function to get absolute frontend URLs (for email links, etc.)
export const getAppUrl = (path = '') => {
  return `${APP_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

// For use in fetch API calls
export const createApiHeaders = async (user, contentType = 'application/json') => {
  if (!user) return { 'Content-Type': contentType };
  
  try {
    const token = await user.getIdToken();
    return {
      'Content-Type': contentType,
      'Authorization': `Bearer ${token}`,
      'X-User-Id': user.uid,
      'X-User-Email': user.email || ''
    };
  } catch (error) {
    console.error('Error creating API headers:', error);
    return { 'Content-Type': contentType };
  }
}; 