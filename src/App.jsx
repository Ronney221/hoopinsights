// src/App.jsx
import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import Register from './Register';
import Login from './Login';
import Profile from './Profile';
import VerifyEmail from './VerifyEmail';
import Home from './Home';
import Youtube from './Youtube';
import SavedGames from './SavedGames';
import SeasonStats from './SeasonStats';
import NotificationTest from './NotificationTest';
import { NotificationProvider } from './contexts/NotificationContext';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Shotify from './Shotify';

function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    // Check if we're on the verification page
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('oobCode') && window.location.pathname.includes('/verify-email')) {
      return 'verify-email';
    }
    
    // Check if we're on a shared game page
    const path = window.location.pathname;
    if (path.startsWith('/shared/')) {
      // Extract the shareId from the URL
      const shareId = path.substring('/shared/'.length);
      return `shared-${shareId}`;
    }
    
    // Get page from URL path or fallback to home
    const pagePath = path.substring(1) || 'home';
    return pagePath;
  });

  // Update URL when page changes
  useEffect(() => {
    if (currentPage.startsWith('shared-')) {
      const shareId = currentPage.substring('shared-'.length);
      window.history.pushState({}, '', `/shared/${shareId}`);
    } else {
      const path = currentPage === 'home' ? '/' : `/${currentPage}`;
      window.history.pushState({}, '', path);
    }
  }, [currentPage]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      
      // Handle shared game URLs
      if (path.startsWith('/shared/')) {
        const shareId = path.substring('/shared/'.length);
        setCurrentPage(`shared-${shareId}`);
        return;
      }
      
      // Handle regular pages
      const pagePath = path.substring(1) || 'home';
      setCurrentPage(pagePath);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Determine what content to render
  let content;
  
  // Handle shared game pages
  if (currentPage.startsWith('shared-')) {
    const shareId = currentPage.substring('shared-'.length);
    content = <SharedGame shareId={shareId} setCurrentPage={setCurrentPage} />;
  } else {
    // Handle regular pages
    switch (currentPage) {
      case "home":
        content = <Home setCurrentPage={setCurrentPage} />;
        break;
      case "register":
        content = <Register setCurrentPage={setCurrentPage} />;
        break;
      case "analytics":
        content = <Analytics />;
        break;
      case "youtube":
        content = <Youtube setCurrentPage={setCurrentPage} />;
        break;
      case "login":
        content = <Login setCurrentPage={setCurrentPage} />;
        break;
      case "profile":
        content = <Profile setCurrentPage={setCurrentPage} />;
        break;
      case "verify-email":
        content = <VerifyEmail setCurrentPage={setCurrentPage} />;
        break;
      case "saved-games":
        content = <SavedGames setCurrentPage={setCurrentPage} />;
        break;
      case "season-stats":
        content = <SeasonStats setCurrentPage={setCurrentPage} />;
        break;
      case "notification-test":
        content = <NotificationTest setCurrentPage={setCurrentPage} />;
        break;
      case "shotify":
        content = <Shotify setCurrentPage={setCurrentPage} />;
        break;
      default:
        content = <Home setCurrentPage={setCurrentPage} />;
    }
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <div className="min-h-screen flex flex-col font-sans">
            <Navbar setCurrentPage={setCurrentPage} />
            <main className="flex-grow">
              {content}
            </main>
            <Footer />
          </div>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
