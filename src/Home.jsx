import React from 'react';
import { useAuth } from './contexts/AuthContext';

const Home = ({ setCurrentPage }) => {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section with Visual Appeal */}
      <section className="relative py-20 sm:py-28 md:py-32 lg:pt-80 lg:pb-28 overflow-hidden">
        {/* Responsive decorative elements */}
        <div className="absolute top-0 -right-64 w-full md:w-[60rem] lg:w-[80rem] h-[60rem] lg:h-[80rem] bg-primary/5 rounded-full blur-3xl -z-10 transform-gpu"></div>
        <div className="absolute -bottom-96 -left-64 w-full md:w-[60rem] lg:w-[80rem] h-[60rem] lg:h-[80rem] bg-secondary/5 rounded-full blur-3xl -z-10 transform-gpu"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center text-center mb-8 sm:mb-12 md:mb-16">
            {/* Subtle animation for title */}
            <div className="relative mb-2 sm:mb-4 animate-fadeIn">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 -z-10"></div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Game Stats Tracking 
                <span className="block mt-1 sm:mt-2">Reimagined</span>
              </h1>
            </div>
            
            <p className="text-base sm:text-lg md:text-xl opacity-80 max-w-md sm:max-w-xl md:max-w-2xl mx-auto mb-6 sm:mb-8 md:mb-10 leading-relaxed">
              Elevate your basketball analysis with real-time stat tracking that's simple, powerful, and insightful
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-6 w-full sm:w-auto">
              <button 
                onClick={() => setCurrentPage(currentUser ? 'youtube' : 'register')}
                className="btn btn-primary btn-md sm:btn-lg normal-case font-medium w-full sm:w-auto sm:min-w-40 md:min-w-52 shadow-lg hover:shadow-primary/20 hover:scale-105 transition-all"
                aria-label="Get Started"
              >
                Start Tracking
              </button>
              
              <button 
                onClick={() => setCurrentPage('saved-games')}
                className="btn btn-outline btn-md sm:btn-lg border-2 normal-case font-medium w-full sm:w-auto sm:min-w-40 md:min-w-52 hover:border-primary hover:scale-105 transition-all"
                aria-label={currentUser ? "View Saved Games" : "View Demo Games"}
              >
                {currentUser ? "View Saved Games" : "View Demo Games"}
              </button>
            </div>
          </div>
          
          {/* Hero image or basketball court mockup - visible on larger screens */}
          <div className="hidden md:block relative mx-auto mt-8 max-w-3xl h-64 lg:h-72">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-base-100/10 backdrop-blur-sm flex items-center justify-center">
                <div className="relative w-full h-full">
                  {/* Court markings */}
                  <div className="absolute left-1/2 top-1/2 w-[90%] h-[70%] border-2 border-base-content/20 rounded-md transform -translate-x-1/2 -translate-y-1/2"></div>
                  <div className="absolute left-1/2 top-1/2 w-36 h-36 rounded-full border-2 border-base-content/20 transform -translate-x-1/2 -translate-y-1/2"></div>
                  <div className="absolute left-1/2 top-1/2 w-4 h-4 rounded-full bg-base-content/20 transform -translate-x-1/2 -translate-y-1/2"></div>
                  
                  {/* Animated basketball */}
                  <div className="absolute left-[30%] top-[40%] w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-orange-500 animate-bounce shadow-lg"></div>
                  
                  {/* Stats floating up */}
                  <div className="absolute right-[35%] top-[45%] text-xs font-bold text-primary animate-float-up-slow">+2pts</div>
                  <div className="absolute left-[25%] top-[60%] text-xs font-bold text-secondary animate-float-up-slow animation-delay-500">+1 REB</div>
                  <div className="absolute right-[25%] top-[30%] text-xs font-bold text-accent animate-float-up-slow animation-delay-1000">+3pts</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-16 sm:py-20 md:py-24 bg-base-100/50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <div className="inline-block">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg blur-sm -z-10"></div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">Key Features</h2>
              </div>
            </div>
            <p className="text-base sm:text-lg opacity-70 max-w-md sm:max-w-xl md:max-w-2xl mx-auto">
              Everything you need for detailed basketball game analysis
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {/* Feature 1 */}
            <div className="card bg-base-100 hover:shadow-xl transition-all duration-300 border border-base-300 hover:border-primary/30 overflow-hidden group">
              <div className="card-body p-5 sm:p-6 md:p-8">
                <div className="w-12 h-12 sm:w-14 sm:h-14 mb-4 sm:mb-5 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">Real-Time Stat Tracking</h3>
                <p className="opacity-70 mb-4 text-sm sm:text-base">
                  Record detailed player statistics while watching YouTube basketball videos with just a few clicks
                </p>
                
                <div className="mt-auto">
                  <button 
                    onClick={() => setCurrentPage('youtube')}
                    className="btn btn-sm btn-ghost px-0 text-primary normal-case font-medium hover:bg-transparent"
                  >
                    Try it now
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Feature 2 */}
            <div className="card bg-base-100 hover:shadow-xl transition-all duration-300 border border-base-300 hover:border-secondary/30 overflow-hidden group">
              <div className="card-body p-5 sm:p-6 md:p-8">
                <div className="w-12 h-12 sm:w-14 sm:h-14 mb-4 sm:mb-5 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">Interactive Timestamps</h3>
                <p className="opacity-70 mb-4 text-sm sm:text-base">
                  Jump back to key moments with automatically recorded timestamps for every stat tracked
                </p>
                
                <div className="mt-auto">
                  <button 
                    onClick={() => setCurrentPage('youtube')}
                    className="btn btn-sm btn-ghost px-0 text-secondary normal-case font-medium hover:bg-transparent"
                  >
                    See how it works
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Feature 3 */}
            <div className="card bg-base-100 hover:shadow-xl transition-all duration-300 border border-base-300 hover:border-accent/30 overflow-hidden group">
              <div className="card-body p-5 sm:p-6 md:p-8">
                <div className="w-12 h-12 sm:w-14 sm:h-14 mb-4 sm:mb-5 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">Save and Review Games</h3>
                <p className="opacity-70 mb-4 text-sm sm:text-base">
                  Store complete game statistics in the cloud for future reference and analysis
                </p>
                
                <div className="mt-auto">
                  <button 
                    onClick={() => setCurrentPage('saved-games')}
                    className="btn btn-sm btn-ghost px-0 text-accent normal-case font-medium hover:bg-transparent"
                  >
                    View saved games
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section - With interactive elements */}
      <section className="py-16 sm:py-20 md:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <div className="inline-block">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg blur-sm -z-10"></div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4">How It Works</h2>
              </div>
            </div>
            <p className="text-base sm:text-lg opacity-70 max-w-md sm:max-w-xl md:max-w-2xl mx-auto">
              Simple enough for casual fans, powerful enough for coaches
            </p>
          </div>
          
          <div className="relative">
            {/* Connection line - visible only on medium screens and up */}
            <div className="hidden md:block absolute top-24 left-1/2 w-[70%] h-0.5 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 transform -translate-x-1/2"></div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center bg-base-100/50 p-6 rounded-xl border border-base-200 hover:border-primary/30 hover:shadow-md transition-all duration-300">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 sm:mb-6 relative shadow-inner group hover:bg-primary/20 transition-colors duration-300">
                  <span className="text-2xl font-bold text-primary">1</span>
                  <div className="absolute -right-10 top-1/2 w-10 h-0.5 bg-primary/20 hidden md:block"></div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">Paste YouTube Link</h3>
                <p className="opacity-70 text-sm sm:text-base">
                  Start by pasting any YouTube basketball game link in the Game Stat Tracker
                </p>
                
                {/* Visual cue: YouTube link image */}
                <div className="mt-4 p-2 rounded-lg bg-base-200/50 w-full max-w-[240px] mx-auto">
                  <div className="flex items-center text-xs space-x-2">
                    <svg viewBox="0 0 24 24" width="16" height="16" className="text-red-500">
                      <path fill="currentColor" d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    <span className="truncate opacity-80">youtube.com/watch?v=...</span>
                  </div>
                </div>
              </div>
              
              {/* Step 2 */}
              <div className="flex flex-col items-center text-center bg-base-100/50 p-6 rounded-xl border border-base-200 hover:border-secondary/30 hover:shadow-md transition-all duration-300">
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-4 sm:mb-6 relative shadow-inner group hover:bg-secondary/20 transition-colors duration-300">
                  <span className="text-2xl font-bold text-secondary">2</span>
                  <div className="absolute -right-10 top-1/2 w-10 h-0.5 bg-secondary/20 hidden md:block"></div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">Track Player Stats</h3>
                <p className="opacity-70 text-sm sm:text-base">
                  Create teams, add players, and record stats as you watch the game unfold
                </p>
                
                {/* Visual cue: Stat buttons */}
                <div className="mt-4 flex flex-wrap justify-center gap-1 w-full max-w-[240px]">
                  <span className="badge badge-primary badge-sm">+2 PTS</span>
                  <span className="badge badge-secondary badge-sm">REB</span>
                  <span className="badge badge-accent badge-sm">AST</span>
                  <span className="badge badge-outline badge-sm">3PT</span>
                </div>
              </div>
              
              {/* Step 3 */}
              <div className="flex flex-col items-center text-center bg-base-100/50 p-6 rounded-xl border border-base-200 hover:border-accent/30 hover:shadow-md transition-all duration-300">
                <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-4 sm:mb-6 shadow-inner group hover:bg-accent/20 transition-colors duration-300">
                  <span className="text-2xl font-bold text-accent">3</span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">Save & Analyze</h3>
                <p className="opacity-70 text-sm sm:text-base">
                  Save the complete game stats and review detailed performance metrics
                </p>
                
                {/* Visual cue: Analysis chart */}
                <div className="mt-4 w-full max-w-[240px] h-8 bg-base-200/50 rounded-lg overflow-hidden flex items-end">
                  <div className="h-3 w-1/5 bg-primary"></div>
                  <div className="h-6 w-1/5 bg-secondary"></div>
                  <div className="h-4 w-1/5 bg-accent"></div>
                  <div className="h-5 w-1/5 bg-primary"></div>
                  <div className="h-7 w-1/5 bg-secondary"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Enhanced Call to Action */}
      <section className="py-16 sm:py-20 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
            Transform Your Basketball Analysis Today
          </h2>
          <p className="text-base sm:text-lg opacity-80 max-w-2xl mx-auto mb-8 sm:mb-10">
            Join coaches, players, and analysts who are elevating their game with data-driven insights
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => setCurrentPage(currentUser ? 'youtube' : 'register')}
              className="btn btn-primary btn-lg w-full sm:w-auto min-w-56 shadow-lg hover:shadow-primary/20 hover:scale-105 transition-all group"
            >
              <span>Get Started Now</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
            
            <div className="text-sm opacity-70 mt-2 sm:mt-0">
              No credit card required • Free to use
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 