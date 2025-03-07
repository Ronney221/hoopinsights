/**
 * API Configuration
 * 
 * This file provides centralized configuration for API endpoints 
 * based on the current environment.
 */

// Determine if we're running in production
const isProduction = import.meta.env.PROD || process.env.NODE_ENV === 'production';

// API Base URLs
const BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:5000'
  : 'https://shotify.org';

const API_BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:5000/api'
  : 'https://shotify.org/api';

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
  BASE_URL: `${API_URL}/stats`,
  SAVE_GAME: `${API_URL}/stats/saveGame`,
  GET_SAVED_GAMES: `${API_URL}/stats/savedGames`,
  DELETE_GAME: (videoId) => `${API_URL}/stats/deleteGame/${videoId}`,
  SHARE_GAME: (videoId) => `${API_URL}/stats/shareGame/${videoId}`,
  GET_SHARED_GAME: (shareId) => `${API_URL}/stats/shared/${shareId}`,
  SAVE_SHARED_GAME: (shareId) => `${API_URL}/stats/saveSharedGame/${shareId}`
};

// New V2 endpoints using the new collection (resolves MongoDB index constraint issues)
export const STATS_V2_ENDPOINTS = {
  BASE_URL: `${API_URL}/statsv2`,
  SAVE_GAME: `${API_URL}/statsv2/saveGame`,
  GET_SAVED_GAMES: `${API_URL}/statsv2/savedGames`,
  DELETE_GAME: (videoId) => `${API_URL}/statsv2/deleteGame/${videoId}`,
  SHARE_GAME: (videoId) => `${API_URL}/statsv2/shareGame/${videoId}`,
  GET_SHARED_GAME: (shareId) => `${API_URL}/statsv2/shared/${shareId}`,
  SAVE_SHARED_GAME: (shareId) => `${API_URL}/statsv2/saveSharedGame/${shareId}`
};

// Season-related API endpoints
export const SEASON_ENDPOINTS = {
  BASE_URL: `${API_URL}/seasons`,
  GET_SEASONS: `${API_URL}/seasons`,
  GET_SEASON: (seasonId) => `${API_URL}/seasons/${seasonId}`,
  CREATE_SEASON: `${API_URL}/seasons`,
  UPDATE_SEASON: (seasonId) => `${API_URL}/seasons/${seasonId}`,
  DELETE_SEASON: (seasonId) => `${API_URL}/seasons/${seasonId}`
};

// A helper function to get absolute frontend URLs (for email links, etc.)
export const getAppUrl = (path = '') => {
  return `${APP_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

/**
 * Creates headers for API requests with user authentication
 * 
 * IMPORTANT: This ensures proper user identity for all API calls, which is critical for:
 * 1. Data isolation - Each user's data is kept separate even for the same YouTube videos
 * 2. Security - Preventing unauthorized access to other users' data
 * 3. Consistency - Maintaining proper relationships between users, videos, and stats
 * 
 * @param {Object|null} user - Firebase user object containing authentication data
 * @param {string} contentType - HTTP content type header
 * @returns {Object} Headers object for fetch API calls
 */
export const createApiHeaders = async (user, contentType = 'application/json') => {
  // Base headers with content type
  const headers = { 'Content-Type': contentType };
  
  // If no user, return only the content type header
  if (!user) return headers;
  
  try {
    // Get the Firebase ID token for authentication
    const token = await user.getIdToken();
    
    // Return headers with authentication information
    return {
      ...headers,
      'Authorization': `Bearer ${token}`,
      'X-User-Id': user.uid,
      'X-User-Email': user.email || ''
    };
  } catch (error) {
    console.error('Error creating API headers:', error);
    return headers;
  }
}; 