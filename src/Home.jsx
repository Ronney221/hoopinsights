import React, { useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';

const Home = ({ setCurrentPage }) => {
  const { currentUser } = useAuth();

  // Add subtle parallax effect on scroll
  useEffect(() => {
    const handleScroll = () => {
      const parallaxElements = document.querySelectorAll('.parallax');
      parallaxElements.forEach(element => {
        const scrolled = window.pageYOffset;
        const rate = element.getAttribute('data-rate');
        element.style.transform = `translate3d(0px, ${scrolled * rate}px, 0px)`;
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top on page change
  const handlePageChange = (page) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Enhanced Hero Section */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        {/* Dynamic Basketball Pattern Background */}
        <div className="absolute inset-0 bg-base-100">
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 30c15.71 0 28.45-12.74 28.45-28.45h3C61.45 17.45 47.45 31.45 30 31.45S-1.45 17.45-1.45 1.55h3C1.55 17.26 14.29 30 30 30z' fill='%23ff6b00' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}/>
        </div>

        {/* Animated Gradient Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -right-64 w-[70rem] h-[70rem] bg-primary/10 rounded-full blur-3xl animate-pulse parallax" data-rate="0.2"></div>
          <div className="absolute -bottom-96 -left-64 w-[70rem] h-[70rem] bg-secondary/10 rounded-full blur-3xl animate-pulse parallax" data-rate="0.15"></div>
        </div>

        {/* Basketball Court Lines Overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h100v100H0z' fill='none' stroke='%23ffffff' stroke-width='2'/%3E%3Ccircle cx='50' cy='50' r='30' fill='none' stroke='%23ffffff' stroke-width='2'/%3E%3C/svg%3E")`,
          backgroundSize: '100px 100px'
        }}/>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Hero Content */}
            <div className="lg:w-1/2 text-center lg:text-left">
              <div className="relative mb-6 inline-block">
                <span className="absolute -inset-1 rounded-lg bg-gradient-to-r from-primary to-secondary blur-lg opacity-25"></span>
                <h1 className="relative text-5xl md:text-6xl lg:text-7xl font-black mb-2 tracking-tight">
                  <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Hoop</span>
                  <span className="text-base-content">Insights</span>
                </h1>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight leading-tight">
                Pro-Level Stats At Your Fingertips
              </h2>
              <p className="text-xl opacity-80 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                Track every assist, rebound, and shot with our powerful YouTube-based statistics tracker. 
                The same detailed analytics used by the pros, made simple for everyone.
              </p>
              <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
                <button
                  onClick={() => handlePageChange('youtube')}
                  className="btn btn-primary btn-lg group relative overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/25 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                  Start Tracking
                </button>
                <button
                  onClick={() => currentUser ? handlePageChange('saved-games') : handlePageChange('login')}
                  className="btn btn-outline btn-lg group relative overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-base-content/0 via-base-content/5 to-base-content/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                  {currentUser ? 'View My Games' : 'Sign In'}
                </button>
              </div>
            </div>

            {/* Enhanced Dashboard Preview - New Design */}
            <div className="lg:w-1/2 relative">
              <div className="relative">
                {/* Floating Elements */}
                <div className="absolute -top-12 -left-12 w-24 h-24 bg-primary/10 rounded-xl rotate-12 animate-float"></div>
                <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-secondary/10 rounded-xl -rotate-12 animate-float-delayed"></div>
                
                {/* Main Dashboard Container */}
                <div className="relative bg-base-100 rounded-2xl shadow-2xl p-1 z-10">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl"></div>
                  
                  {/* Dashboard Content */}
                  <div className="relative bg-base-100 rounded-xl p-4 backdrop-blur-sm">
                    {/* Top Bar */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                        <div className="w-3 h-3 rounded-full bg-secondary"></div>
                        <div className="w-3 h-3 rounded-full bg-accent"></div>
                      </div>
                      <div className="px-4 py-1 bg-primary/10 rounded-full">
                        <span className="text-sm font-medium text-primary">Track Stats</span>
                      </div>
                    </div>
                    
                    <img
                      src="https://emssound.net/wp-content/uploads/2024/01/Screenshot-2023-12-14-1.10.39-PM.webp"
                      alt="Basketball Analytics Dashboard"
                      className="rounded-lg shadow-lg w-full"
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* Beta Badge - Updated */}
                <div className="absolute -bottom-6 -right-6 z-20">
                  <div className="relative">
                    <div className="w-28 h-28 rounded-full bg-gradient-to-r from-primary to-secondary p-[2px] rotate-12 hover:rotate-0 transition-all duration-300">
                      <div className="w-full h-full rounded-full bg-base-100 flex items-center justify-center">
                        <span className="text-2xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">BETA</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Sections Wrapper */}
      <div className="relative">
        {/* Basketball Pattern Background */}
        <div className="absolute inset-0 bg-base-100">
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 30c15.71 0 28.45-12.74 28.45-28.45h3C61.45 17.45 47.45 31.45 30 31.45S-1.45 17.45-1.45 1.55h3C1.55 17.26 14.29 30 30 30z' fill='%23ff6b00' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}/>
        </div>

        {/* YouTube Integration Section - Enhanced */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl"></div>
          
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="md:w-1/2 lg:w-2/5 text-center md:text-left">
                <div className="inline-block px-4 py-2 bg-primary/10 rounded-full text-primary font-medium mb-6 transform hover:scale-105 transition-transform">
                  SEAMLESS INTEGRATION
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">YouTube Video Analysis</h2>
                <p className="text-lg opacity-80 mb-8 leading-relaxed">
                  Use any basketball video on YouTube as your source. Our platform integrates directly with YouTube, allowing you to track stats while watching any game.
                </p>
                <ul className="space-y-4 text-left mb-8">
                  {[
                    'Works with any YouTube basketball video',
                    'Automatically syncs timestamps with video',
                    'Jump to any play with a single click'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start group">
                      <div className="mt-1 mr-4 flex-shrink-0">
                        <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center group-hover:bg-primary transition-colors duration-300">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-primary group-hover:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                      <span className="group-hover:text-primary transition-colors duration-300">{item}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handlePageChange('youtube')}
                  className="btn btn-primary btn-lg group relative overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/25 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                  Connect YouTube Video
                </button>
              </div>
              
              <div className="md:w-1/2 lg:w-3/5">
                <div className="relative">
                  {/* Decorative Elements */}
                  <div className="absolute -top-6 -left-6 w-12 h-12 border-4 border-primary/20 rounded-full animate-bounce"></div>
                  <div className="absolute -bottom-6 -right-6 w-12 h-12 border-4 border-secondary/20 rounded-full animate-bounce delay-150"></div>
                  
                  <div className="bg-base-100 rounded-2xl shadow-2xl p-2 md:p-4 transform hover:-rotate-2 transition-all duration-500">
                    <div className="relative rounded-xl overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-t from-base-100 via-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-500 z-10"></div>
                      <img 
                        src="public\2.png"
                        alt="YouTube Integration" 
                        className="rounded-xl w-full transform group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Real-Time Stat Tracking Section - Enhanced */}
        <section className="py-24 relative overflow-hidden bg-base-200/30">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5"></div>
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl"></div>
          
          <div className="max-w-7xl mx-auto px-6 relative">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="md:w-1/2 lg:w-3/5 order-2 md:order-1">
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-xl opacity-50"></div>
                  <div className="bg-base-100 rounded-2xl shadow-2xl p-2 md:p-4 transform hover:rotate-2 transition-all duration-500 relative">
                    <div className="relative rounded-xl overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-t from-base-100 via-transparent opacity-0 group-hover:opacity-60 transition-opacity duration-500 z-10"></div>
                      <img 
                        src="public\3.png"
                        alt="Real-Time Stat Tracking" 
                        className="rounded-xl w-full transform group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="md:w-1/2 lg:w-2/5 text-center md:text-left order-1 md:order-2">
                <div className="inline-block px-4 py-2 bg-primary/10 rounded-full text-primary font-medium mb-6 transform hover:scale-105 transition-transform">
                  CORE FEATURE
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Real-Time Stat Tracking</h2>
                <p className="text-lg opacity-80 mb-8 leading-relaxed">
                  Our intuitive interface lets you track every rebound, assist, steal, and shot as you watch the game. Each stat is timestamped for instant replay.
                </p>
                <ul className="space-y-4 text-left mb-8">
                  {[
                    'One-click stat recording with no delays',
                    'Track complex stats like assists to 3-pointers',
                    'Automatic timestamps for every recorded stat'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start group">
                      <div className="mt-1 mr-4 flex-shrink-0">
                        <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center group-hover:bg-primary transition-colors duration-300">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-primary group-hover:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                      <span className="group-hover:text-primary transition-colors duration-300">{item}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handlePageChange('youtube')}
                  className="btn btn-primary btn-lg group relative overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/25 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                  Try It Now
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Lifetime Stats Storage - Enhanced */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-20 right-20 w-60 h-60 bg-primary/10 rounded-full blur-2xl animate-pulse"></div>
          
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="md:w-1/2 lg:w-2/5 text-center md:text-left">
                <div className="inline-block px-4 py-2 bg-primary/10 rounded-full text-primary font-medium mb-6 transform hover:scale-105 transition-transform">
                  CLOUD STORAGE
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Lifetime Stats Storage</h2>
                <p className="text-lg opacity-80 mb-8 leading-relaxed">
                  Never lose your game statistics with our unlimited cloud storage. Every game, every stat, and every highlight is securely stored and easily accessible forever - completely free.
                </p>
                <ul className="space-y-4 text-left mb-8">
                  {[
                    'Unlimited cloud storage for all your games',
                    'Access your stats from any device',
                    'Track your progress over your entire career'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start group">
                      <div className="mt-1 mr-4 flex-shrink-0">
                        <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center group-hover:bg-primary transition-colors duration-300">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-primary group-hover:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                      <span className="group-hover:text-primary transition-colors duration-300">{item}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handlePageChange('youtube')}
                  className="btn btn-primary btn-lg group relative overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/25 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                  Start Saving Games
                </button>
              </div>
              
              <div className="md:w-1/2 lg:w-3/5">
                <div className="relative">
                  {/* Decorative Elements */}
                  <div className="absolute -top-8 -left-8 w-16 h-16 border-4 border-primary/20 rounded-full animate-spin-slow"></div>
                  <div className="absolute -bottom-8 -right-8 w-20 h-20 border-4 border-secondary/20 rounded-full animate-spin-slow delay-150"></div>
                  
                  <div className="relative bg-base-100 rounded-2xl shadow-2xl p-4 transform hover:rotate-2 transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl blur-xl"></div>
                    <div className="relative rounded-xl overflow-hidden">
                      <img 
                        src="public/share2.png"
                        alt="Cloud Storage" 
                        className="w-full transform hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Share & Export Data - Enhanced */}
        <section className="py-24 relative overflow-hidden bg-base-200/30">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5"></div>
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl"></div>
          
          <div className="max-w-7xl mx-auto px-6 relative">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="md:w-1/2 lg:w-3/5 order-2 md:order-1">
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-xl opacity-50"></div>
                  <div className="bg-base-100 rounded-2xl shadow-2xl p-4 transform hover:-rotate-2 transition-all duration-500 relative">
                    <div className="relative rounded-xl overflow-hidden">
                      <img 
                        src="public/share.png"
                        alt="Sharing & Export" 
                        className="w-full transform hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="md:w-1/2 lg:w-2/5 text-center md:text-left order-1 md:order-2">
                <div className="inline-block px-4 py-2 bg-primary/10 rounded-full text-primary font-medium mb-6 transform hover:scale-105 transition-transform">
                  COLLABORATION
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Share & Export Data</h2>
                <p className="text-lg opacity-80 mb-8 leading-relaxed">
                  Share your game analysis with coaches, teammates, or friends. Export data for further analysis or to create highlight reels.
                </p>
                <ul className="space-y-4 text-left mb-8">
                  {[
                    'Share games with unique links',
                    'Export statistics for external analysis',
                    'Create custom reports for coaches and teams'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start group">
                      <div className="mt-1 mr-4 flex-shrink-0">
                        <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center group-hover:bg-primary transition-colors duration-300">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-primary group-hover:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                      <span className="group-hover:text-primary transition-colors duration-300">{item}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handlePageChange('saved-games')}
                  className="btn btn-primary btn-lg group relative overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/25 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                  Share Game Stats
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Season Stats Analysis - Enhanced */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-primary/5"></div>
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
          
          <div className="max-w-7xl mx-auto px-6 relative">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="md:w-1/2 lg:w-2/5 text-center md:text-left">
                <div className="inline-block px-4 py-2 bg-secondary/10 rounded-full text-secondary font-medium mb-6 transform hover:scale-105 transition-transform">
                  NEW FEATURE
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Season Stats Analysis</h2>
                <p className="text-lg opacity-80 mb-8 leading-relaxed">
                  Group games together to track player development over time. See how performance evolves throughout a season with our comprehensive analysis tools.
                </p>
                <ul className="space-y-4 text-left mb-8">
                  {[
                    'Create multiple seasons from your saved games',
                    'Compare per-game and total statistics',
                    'Track player improvement over time'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start group">
                      <div className="mt-1 mr-4 flex-shrink-0">
                        <div className="w-5 h-5 rounded-full border-2 border-secondary flex items-center justify-center group-hover:bg-secondary transition-colors duration-300">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-secondary group-hover:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                      <span className="group-hover:text-secondary transition-colors duration-300">{item}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => currentUser ? handlePageChange('season-stats') : handlePageChange('login')}
                  className="btn btn-secondary btn-lg group relative overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-secondary/0 via-white/25 to-secondary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                  {currentUser ? 'View Season Stats' : 'Sign In to Use'}
                </button>
              </div>

              <div className="md:w-1/2 lg:w-3/5">
                <div className="relative">
                  {/* Decorative Elements */}
                  <div className="absolute -top-6 -left-6 w-12 h-12 border-4 border-secondary/20 rounded-full animate-bounce"></div>
                  <div className="absolute -bottom-6 -right-6 w-12 h-12 border-4 border-primary/20 rounded-full animate-bounce delay-150"></div>
                  
                  <div className="relative bg-base-100 rounded-2xl shadow-2xl p-4 transform hover:rotate-2 transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-secondary/10 to-primary/10 rounded-2xl blur-xl"></div>
                    <div className="relative rounded-xl overflow-hidden">
                      <img 
                        src="public\season stats.png"
                        alt="Season Stats Feature" 
                        className="w-full transform hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* NBA Stars Section - Enhanced */}
        <section className="py-24 relative overflow-hidden bg-base-200/30">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1546519638-68e109acd27d?q=80&w=2070')] bg-cover bg-center opacity-[0.03]"></div>
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl"></div>
          
          <div className="max-w-7xl mx-auto px-6 relative">
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-2 bg-primary/10 rounded-full text-primary font-medium mb-6 transform hover:scale-105 transition-transform">
                PRO INSPIRATION
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Learn From The Best</h2>
              <p className="text-xl opacity-80 max-w-2xl mx-auto mb-12 leading-relaxed">
                Track stats from your favorite NBA stars' games and analyze their performance like never before.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              {/* LeBron James Card - Enhanced */}
              <div className="relative">
                {/* Decorative Elements */}
                <div className="absolute -top-6 -left-6 w-12 h-12 border-4 border-primary/20 rounded-full animate-bounce"></div>
                <div className="absolute top-1/2 -right-6 w-12 h-12 border-4 border-secondary/20 rounded-full animate-bounce delay-150"></div>
                
                <div className="card bg-base-100 shadow-2xl overflow-hidden group hover:shadow-primary/20 transition-all duration-500">
                  <figure className="relative h-[400px]">
                    <div className="absolute inset-0 bg-gradient-to-t from-base-100 via-base-100/20 to-transparent opacity-60 z-10"></div>
                    <img 
                      src="https://m.media-amazon.com/images/I/81MoV7qLkrL._AC_UF1000,1000_QL80_.jpg" 
                      alt="LeBron James" 
                      className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                      <h3 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">LeBron James</h3>
                      <p className="text-lg opacity-90">Los Angeles Lakers</p>
                    </div>
                  </figure>
                  <div className="card-body p-8">
                    <div className="grid grid-cols-3 gap-6">
                      {[
                        { label: 'PPG', value: '27.3' },
                        { label: 'RPG', value: '7.3' },
                        { label: 'APG', value: '8.3' }
                      ].map((stat, index) => (
                        <div key={index} className="bg-base-200/50 p-4 rounded-xl group-hover:bg-primary/10 transition-colors duration-300">
                          <span className="text-2xl font-bold text-primary block mb-1">{stat.value}</span>
                          <span className="text-sm opacity-70">{stat.label}</span>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => handlePageChange('youtube')}
                      className="btn btn-outline w-full mt-6 group-hover:btn-primary transition-all duration-300"
                    >
                      Analyze Games Like LeBron
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Stephen Curry Card - Enhanced */}
              <div className="relative">
                {/* Decorative Elements */}
                <div className="absolute -top-6 -right-6 w-12 h-12 border-4 border-secondary/20 rounded-full animate-bounce"></div>
                <div className="absolute top-1/2 -left-6 w-12 h-12 border-4 border-primary/20 rounded-full animate-bounce delay-150"></div>
                
                <div className="card bg-base-100 shadow-2xl overflow-hidden group hover:shadow-secondary/20 transition-all duration-500">
                  <figure className="relative h-[400px]">
                    <div className="absolute inset-0 bg-gradient-to-t from-base-100 via-base-100/20 to-transparent opacity-60 z-10"></div>
                    <img 
                      src="https://imageio.forbes.com/specials-images/imageserve/67c187c311e5ca5ac2689aad/Steph-Curry/960x0.jpg?format=jpg&width=960" 
                      alt="Stephen Curry" 
                      className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                      <h3 className="text-4xl font-bold mb-2 bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">Stephen Curry</h3>
                      <p className="text-lg opacity-90">Golden State Warriors</p>
                    </div>
                  </figure>
                  <div className="card-body p-8">
                    <div className="grid grid-cols-3 gap-6">
                      {[
                        { label: 'PPG', value: '29.4' },
                        { label: '3PM', value: '5.3' },
                        { label: '3P%', value: '43.7' }
                      ].map((stat, index) => (
                        <div key={index} className="bg-base-200/50 p-4 rounded-xl group-hover:bg-secondary/10 transition-colors duration-300">
                          <span className="text-2xl font-bold text-secondary block mb-1">{stat.value}</span>
                          <span className="text-sm opacity-70">{stat.label}</span>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => handlePageChange('youtube')}
                      className="btn btn-outline w-full mt-6 group-hover:btn-secondary transition-all duration-300"
                    >
                      Track Shooting Like Curry
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Call to Action */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-base-100 to-secondary/20"></div>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1470')] bg-cover bg-center opacity-[0.03]"></div>
          
          {/* Basketball Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 30c15.71 0 28.45-12.74 28.45-28.45h3C61.45 17.45 47.45 31.45 30 31.45S-1.45 17.45-1.45 1.55h3C1.55 17.26 14.29 30 30 30z' fill='%23ff6b00' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}/>
          
          {/* Animated Gradient Orbs */}
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center">
              <div className="inline-block px-6 py-3 bg-primary/10 rounded-full text-primary font-medium mb-8 transform hover:scale-105 transition-transform">
                GET STARTED TODAY
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight">
                Ready to elevate your game?
              </h2>
              <p className="text-xl opacity-80 max-w-2xl mx-auto mb-12 leading-relaxed">
                Start tracking your basketball stats today and discover insights that will take your game to the next level.
              </p>
              <div className="flex flex-wrap gap-6 justify-center">
                <button
                  onClick={() => handlePageChange('youtube')}
                  className="btn btn-primary btn-lg group relative overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/25 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                  Track Your First Game
                </button>
                {!currentUser && (
                  <button
                    onClick={() => handlePageChange('register')}
                    className="btn btn-outline btn-lg group relative overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-base-content/0 via-base-content/5 to-base-content/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                    Create Free Account
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home; 