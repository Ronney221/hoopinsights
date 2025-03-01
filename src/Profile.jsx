import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { toast } from 'react-toastify';

const Profile = ({ setCurrentPage }) => {
  const { currentUser, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(currentUser?.displayName || '');
  
  // Animation effect when component mounts
  useEffect(() => {
    if (document.getElementById('profile-container')) {
      setTimeout(() => {
        document.getElementById('profile-container').classList.add('opacity-100', 'translate-y-0');
      }, 100);
    }
  }, []);

  const handleUpdateUsername = async (e) => {
    e.preventDefault();
    if (!newUsername.trim()) {
      toast.error('Username cannot be empty');
      return;
    }

    try {
      setLoading(true);
      await updateUserProfile({ displayName: newUsername.trim() });
      toast.success('Username updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error(error.message || 'Failed to update username');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-base-100 to-base-200 pt-32">
        <div className="w-full max-w-md px-6">
          <div className="card bg-base-100 shadow-xl backdrop-blur-sm border border-base-300 overflow-hidden">
            <div className="card-body p-8">
              <div className="flex items-center gap-6 mb-8 animate-pulse">
                <div className="skeleton h-20 w-20 rounded-full"></div>
                <div className="flex flex-col gap-2 flex-1">
                  <div className="skeleton h-5 w-1/2"></div>
                  <div className="skeleton h-4 w-3/4"></div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="skeleton h-24 w-full rounded-xl"></div>
                <div className="skeleton h-24 w-full rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 pt-32 pb-12 px-6">
      <div 
        id="profile-container"
        className="max-w-2xl mx-auto transform transition-all duration-700 opacity-0 translate-y-4"
      >
        <div className="card bg-base-100 shadow-xl backdrop-blur-sm border border-base-300 overflow-hidden mb-6">
          <div className="card-body p-8">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
              <div className="avatar">
              <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center text-center text-3xl font-light ring-2 ring-primary/20 ring-offset-2 ring-offset-base-100">
                <div className="mt-7 text-[64px]">
                  {currentUser.displayName ? 
                    currentUser.displayName[0].toUpperCase() : 
                    currentUser.email.split('@')[0][0].toUpperCase()}
                </div>
              </div>

              </div>
              <div className="flex-1 flex flex-col md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-2xl font-light">
                    {currentUser.displayName || currentUser.email.split('@')[0]}
                  </h2>
                  <p className="text-base-content/60 text-sm">{currentUser.email}</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <span className="badge badge-primary badge-outline py-3 px-4 font-medium">Member</span>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="space-y-6">
              <div className="card bg-base-200/50 rounded-xl border border-base-300/50 hover:border-primary/20 transition-colors">
                <div className="card-body p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-sm font-medium uppercase tracking-wider text-base-content/70 mb-1">Username</h3>
                      {isEditing ? (
                        <form onSubmit={handleUpdateUsername} className="mt-3">
                          <div className="flex flex-col md:flex-row gap-3">
                            <div className="flex-1">
                              <input
                                type="text"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                className="w-full px-4 py-3 bg-base-100 border border-base-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                                placeholder="Enter new username"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button 
                                type="submit" 
                                className="relative px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary/90 text-primary-content font-medium hover:opacity-90 transition-opacity"
                                disabled={loading}
                              >
                                {loading ? (
                                  <svg className="animate-spin h-5 w-5 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                ) : (
                                  'Save'
                                )}
                              </button>
                              <button 
                                type="button"
                                className="px-4 py-2.5 rounded-xl bg-base-300/50 text-base-content font-medium hover:bg-base-300 transition-colors"
                                onClick={() => setIsEditing(false)}
                                disabled={loading}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </form>
                      ) : (
                        <div className="flex justify-between items-center">
                          <p className="text-lg">{currentUser.displayName || 'No username set'}</p>
                          <button 
                            className="btn btn-ghost btn-sm rounded-lg hover:bg-primary/10"
                            onClick={() => setIsEditing(true)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            Edit
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="card bg-base-200/50 rounded-xl border border-base-300/50">
                <div className="card-body p-6">
                  <h3 className="text-sm font-medium uppercase tracking-wider text-base-content/70 mb-1">Email</h3>
                  <div className="flex justify-between items-center">
                    <p className="text-lg">{currentUser.email}</p>
                    <div className="badge badge-success gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Verified
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card bg-base-200/50 rounded-xl border border-base-300/50">
                <div className="card-body p-6">
                  <h3 className="text-sm font-medium uppercase tracking-wider text-base-content/70 mb-1">Account Security</h3>
                  <div className="mt-2">
                    <button className="btn btn-outline btn-primary btn-sm rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Change Password
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center">
          <button 
            onClick={() => setCurrentPage('home')}
            className="btn btn-outline rounded-xl btn-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile; 