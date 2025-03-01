import { AUTH_ENDPOINTS } from '../config/apiConfig';

// Determine the API base URL based on environment
const isProduction = import.meta.env.PROD || process.env.NODE_ENV === 'production';
const API_BASE_URL = isProduction 
  ? 'https://hoopinsights.vercel.app/api' 
  : 'http://localhost:5000/api';

export const saveUserData = async (userData) => {
  try {
    console.log('Sending data to server:', userData); // Log outgoing data
    const response = await fetch(AUTH_ENDPOINTS.SAVE_USER_DATA, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    console.log('Server response:', data); // Log server response
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}; 