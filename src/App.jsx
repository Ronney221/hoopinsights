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
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    // Check if we're on the verification page
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('oobCode') && window.location.pathname.includes('/verify-email')) {
      return 'verify-email';
    }
    
    // Get page from URL path or fallback to home
    const pagePath = window.location.pathname.substring(1) || 'home';
    return pagePath;
  });

  // Update URL when page changes
  useEffect(() => {
    const path = currentPage === 'home' ? '/' : `/${currentPage}`;
    window.history.pushState({}, '', path);
  }, [currentPage]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      const pagePath = path.substring(1) || 'home';
      setCurrentPage(pagePath);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  let content;
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
    default:
      content = <Home setCurrentPage={setCurrentPage} />;
  }

  return (
    <AuthProvider>
      <ThemeProvider>
        <div className="min-h-screen flex flex-col font-sans">
          <Navbar setCurrentPage={setCurrentPage} />
          <main className="flex-grow">
            {content}
          </main>
          <Footer />
          <ToastContainer 
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
