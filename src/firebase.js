import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { APP_URL } from './config/apiConfig';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Configure auth action URL handler
auth.config.emulator = {
  url: '',
};

// Set custom URL for auth actions (verification emails, password reset, etc.)
auth.config.authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;

// Update action code settings for verification and password reset links
export const actionCodeSettings = {
  url: APP_URL,
  handleCodeInApp: true,
}; 