import React, { useEffect, useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { useNotification } from './contexts/NotificationContext';

const VerifyEmail = ({ setCurrentPage }) => {
  const [verifying, setVerifying] = useState(true);
  const { verifyEmail } = useAuth();
  const { success, error: showError, warning, info } = useNotification();

  useEffect(() => {
    const verifyEmailWithCode = async () => {
      try {
        // Get the verification code from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const actionCode = urlParams.get('oobCode');

        if (actionCode) {
          await verifyEmail(actionCode);
          success('Email verified successfully!');
          setCurrentPage('home');
        } else {
          showError('No verification code found in URL');
          setCurrentPage('login');
        }
      } catch (err) {
        showError(err.message || 'Failed to verify email');
        setCurrentPage('login');
      } finally {
        setVerifying(false);
      }
    };

    verifyEmailWithCode();
  }, [verifyEmail, setCurrentPage]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base-100 to-base-200 px-6">
      <div className="card bg-base-100 shadow-xl backdrop-blur-sm border border-base-300 w-full max-w-md">
        <div className="card-body p-8 text-center">
          {verifying ? (
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h2 className="text-3xl font-light mb-2">Verifying Email</h2>
              <p className="text-base-content/70">Please wait while we verify your email address...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <h2 className="text-3xl font-light mb-2">Redirecting</h2>
              <p className="text-base-content/70">Taking you to the login page...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail; 