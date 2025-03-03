import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  applyActionCode,
  checkActionCode
} from 'firebase/auth';
import { auth, actionCodeSettings } from '../firebase';
import { APP_URL, AUTH_ENDPOINTS } from '../config/apiConfig';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState('pending'); // 'pending', 'verified', 'unverified'

  async function signup(email, password, username) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update the user's profile with the username
      if (username) {
        await updateProfile(user, {
          displayName: username
        });
      }

      // Send email verification with proper URL
      await sendEmailVerification(user, actionCodeSettings);

      // Save user data to MongoDB
      try {
        const response = await fetch(AUTH_ENDPOINTS.SAVE_USER_DATA, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firebaseUid: user.uid,
            email: user.email,
            username: username || user.email.split('@')[0],
            displayName: username || user.email.split('@')[0]
          }),
        });

        if (!response.ok) {
          console.error('Failed to save user data to MongoDB:', await response.text());
        }
      } catch (error) {
        console.error('Error saving user data to MongoDB:', error);
      }
      
      return userCredential;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async function login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check if email is verified before allowing login
      if (!user.emailVerified) {
        // If not verified, sign out immediately and throw an error
        await signOut(auth); 
        throw new Error('Please verify your email before logging in. Check your inbox for a verification link.');
      }
      
      return userCredential;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  function logout() {
    return signOut(auth);
  }

  async function resendVerificationEmail() {
    if (!currentUser) {
      throw new Error('No user signed in');
    }

    try {
      await sendEmailVerification(currentUser, actionCodeSettings);
      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async function resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async function verifyEmail(actionCode) {
    try {
      await applyActionCode(auth, actionCode);
      if (currentUser) {
        await currentUser.reload();
        setVerificationStatus('verified');
      }
      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async function updateUserProfile(profileData) {
    try {
      if (!currentUser) throw new Error('No user logged in');
      
      // Update Firebase profile
      await updateProfile(currentUser, profileData);
      await currentUser.reload();
      setCurrentUser(auth.currentUser);

      // Sync with MongoDB
      try {
        const response = await fetch(AUTH_ENDPOINTS.SAVE_USER_DATA, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firebaseUid: currentUser.uid,
            email: currentUser.email,
            username: profileData.displayName || currentUser.email.split('@')[0],
            displayName: profileData.displayName || currentUser.email.split('@')[0]
          }),
        });

        if (!response.ok) {
          console.error('Failed to sync profile update with MongoDB:', await response.text());
        }
      } catch (error) {
        console.error('Error syncing profile update with MongoDB:', error);
      }

      return true;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  // Check verification status periodically
  useEffect(() => {
    if (currentUser) {
      const checkVerification = async () => {
        await currentUser.reload();
        setVerificationStatus(currentUser.emailVerified ? 'verified' : 'unverified');
      };

      const interval = setInterval(checkVerification, 10000); // Check every 10 seconds
      checkVerification(); // Check immediately

      return () => clearInterval(interval);
    } else {
      setVerificationStatus('pending');
    }
  }, [currentUser]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Only set currentUser if user is verified or if we're in the verification process
      // This prevents auto-login after registration when email is not verified
      if (user && !user.emailVerified) {
        // Update verification status but don't set currentUser
        // This allows the app to know there's a pending verification
        setVerificationStatus('unverified');
        setLoading(false);
      } else {
        setCurrentUser(user);
        setLoading(false);
        if (user) {
          setVerificationStatus(user.emailVerified ? 'verified' : 'unverified');
        } else {
          setVerificationStatus('pending');
        }
      }
    });

    return unsubscribe;
  }, []);

  // Add a function to check verification status on demand
  const checkVerificationStatus = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      const isVerified = auth.currentUser.emailVerified;
      setVerificationStatus(isVerified ? 'verified' : 'unverified');
      if (isVerified && !currentUser) {
        // If verified and not logged in, set the current user
        setCurrentUser(auth.currentUser);
      }
      return isVerified;
    }
    return false;
  };

  const value = {
    currentUser,
    verificationStatus,
    signup,
    login,
    logout,
    resendVerificationEmail,
    resetPassword,
    verifyEmail,
    updateUserProfile,
    checkVerificationStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 