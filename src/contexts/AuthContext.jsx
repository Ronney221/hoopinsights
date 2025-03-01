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
import { auth } from '../firebase';

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

      // Send email verification with custom URL
      await sendEmailVerification(user, {
        url: 'http://localhost:5173',
        handleCodeInApp: true,
      });

      // Save user data to MongoDB
      try {
        const response = await fetch('http://localhost:5000/api/users/saveUserData', {
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
      
      if (!user.emailVerified) {
        throw new Error('Please verify your email before logging in.');
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
    if (currentUser && !currentUser.emailVerified) {
      try {
        await sendEmailVerification(currentUser, {
          url: 'http://localhost:5173/verify-email',
          handleCodeInApp: true,
        });
        return true;
      } catch (error) {
        throw new Error(error.message);
      }
    }
  }

  async function resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email, {
        url: 'http://localhost:5173/login',
      });
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
        const response = await fetch('http://localhost:5000/api/users/saveUserData', {
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
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    verificationStatus,
    signup,
    login,
    logout,
    resendVerificationEmail,
    resetPassword,
    verifyEmail,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 