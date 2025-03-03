import React, { useState, useEffect } from 'react';
import { Analytics } from "@vercel/analytics/react";
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';

const Navbar = ({ setCurrentPage }) => {
  const { currentUser, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  // Detect scroll position for navbar appearance change
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const handleLogout = async () => {
    try {
      await logout();
      setCurrentPage('home');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <div className={`navbar fixed top-0 left-0 right-0 z-50 px-3 sm:px-6 transition-all duration-300 backdrop-blur-md ${
      scrolled 
        ? 'bg-base-100/90 shadow-lg py-2' 
        : 'bg-base-100/50 py-4'
    }`}>
      <Analytics />
      
      {/* Navbar Start - Dropdown Menu */}
      <div className="navbar-start">
        <div className="dropdown">
          <div 
            tabIndex={0} 
            role="button" 
            className="btn btn-ghost btn-circle hover:bg-primary/10"
            aria-label="Menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-md dropdown-content bg-base-100/95 backdrop-blur-md rounded-xl z-[1] mt-4 w-60 p-3 shadow-xl border border-base-200 animate-fadeIn"
          >
            <li className="mb-1">
              <a 
                onClick={() => setCurrentPage('home')}
                className="rounded-lg font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Home
              </a>
            </li>
            <li className="mb-1">
              <a 
                onClick={() => setCurrentPage('youtube')}
                className="rounded-lg font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Game Stat Tracker
              </a>
            </li>
            <li className="mb-1">
              <a 
                onClick={() => setCurrentPage('saved-games')}
                className="rounded-lg font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Saved Games
              </a>
            </li>
            <li className="mb-1">
              <a 
                onClick={() => setCurrentPage('season-stats')}
                className="rounded-lg font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Season Stats
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Navbar Center - Brand */}
      <div className="navbar-center">
        <button 
          className="btn btn-ghost text-lg sm:text-xl normal-case font-bold tracking-tight hover:bg-transparent"
          onClick={() => setCurrentPage('home')}
        >
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            HoopInsights
          </span>
        </button>
      </div>

      {/* Navbar End - Auth Section */}
      <div className="navbar-end gap-2 sm:gap-3">
        {/* Theme Toggle */}
        <label className="swap swap-rotate btn btn-ghost btn-circle hover:bg-primary/10">
          <input 
            type="checkbox" 
            className="theme-controller" 
            onChange={toggleTheme} 
            checked={isDark}
          />
          
          {/* sun icon */}
          <svg
            className="swap-on h-5 w-5 fill-current"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24">
            <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
          </svg>

          {/* moon icon */}
          <svg
            className="swap-off h-5 w-5 fill-current"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24">
            <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
          </svg>
        </label>

        {currentUser ? (
          // User is logged in - show avatar dropdown
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar ring ring-primary ring-offset-2 ring-offset-base-100 hover:bg-primary/10">
              <div className="avatar placeholder">
                <div className="bg-primary text-primary-content rounded-full w-10">
                  <span className="text-xl font-medium">
                    {currentUser.displayName ? 
                      currentUser.displayName[0].toUpperCase() : 
                      currentUser.email.split('@')[0][0].toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
            <ul
              tabIndex={0}
              className="menu menu-md dropdown-content bg-base-100/95 backdrop-blur-md rounded-xl z-[1] mt-4 w-60 p-3 shadow-xl border border-base-200 animate-fadeIn"
            >
              <li className="text-center py-2 font-medium opacity-80">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs uppercase tracking-widest opacity-60">Signed in as</span>
                  <span className="text-primary">{currentUser.displayName || currentUser.email.split('@')[0]}</span>
                </div>
              </li>
              <div className="divider my-1"></div>
              <li className="mb-1">
                <a 
                  onClick={() => setCurrentPage('saved-games')}
                  className="rounded-lg font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Saved Games
                </a>
              </li>
              <li className="mb-1">
                <a 
                  onClick={() => setCurrentPage('analytics')}
                  className="rounded-lg font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Season Stats
                </a>
              </li>
              <li className="mb-1">
                <a 
                  onClick={() => setCurrentPage('profile')}
                  className="rounded-lg font-medium"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profile
                </a>
              </li>
              <div className="divider my-1"></div>
              <li>
                <a 
                  onClick={handleLogout}
                  className="rounded-lg font-medium text-error"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </a>
              </li>
            </ul>
          </div>
        ) : (
          // User is not logged in - show login/signup buttons
          <div className="flex gap-2 sm:gap-3 items-center">
            <button 
              className="btn btn-ghost btn-sm sm:btn-md normal-case font-medium rounded-lg hover:bg-primary/10"
              onClick={() => setCurrentPage('login')}
            >
              Login
            </button>
            <button 
              className="btn btn-primary btn-sm sm:btn-md normal-case font-medium shadow-md hover:shadow-lg transition-all duration-300 rounded-lg"
              onClick={() => setCurrentPage('register')}
            >
              Sign up
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
