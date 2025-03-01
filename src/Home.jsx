import React from 'react';
import { useAuth } from './contexts/AuthContext';

const Home = ({ setCurrentPage }) => {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section with Visual Appeal */}
      <section className="relative pt-96 pb-64 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 -right-64 w-[80rem] h-[80rem] bg-primary/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute -bottom-96 -left-64 w-[80rem] h-[80rem] bg-secondary/5 rounded-full blur-3xl -z-10"></div>
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Game Stats Tracking 
              <span className="block">Reimagined</span>
            </h1>
            
            <p className="text-lg md:text-xl opacity-80 max-w-2xl mx-auto mb-10 leading-relaxed">
              Elevate your basketball analysis with real-time stat tracking that's simple, powerful, and insightful
            </p>
            
            <div className="flex flex-wrap justify-center gap-6">
              <button 
                onClick={() => setCurrentPage(currentUser ? 'youtube' : 'register')}
                className="btn btn-primary btn-lg normal-case font-medium min-w-52 shadow-lg hover:shadow-primary/20 hover:scale-105 transition-all"
              >
                Get Started Free
              </button>
              
              <button 
                onClick={() => setCurrentPage('saved-games')}
                className="btn btn-outline btn-lg border-2 normal-case font-medium min-w-52 hover:border-primary hover:scale-105 transition-all"
              >
                View Demo Games
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-24 bg-base-100/50 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Key Features</h2>
            <p className="text-lg opacity-70 max-w-2xl mx-auto">
              Everything you need for detailed basketball game analysis
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card bg-base-100 hover:shadow-xl transition-shadow border border-base-300 overflow-hidden group">
              <div className="card-body p-8">
                <div className="w-14 h-14 mb-5 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Real-Time Stat Tracking</h3>
                <p className="opacity-70 mb-4">
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
            <div className="card bg-base-100 hover:shadow-xl transition-shadow border border-base-300 overflow-hidden group">
              <div className="card-body p-8">
                <div className="w-14 h-14 mb-5 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Interactive Timestamps</h3>
                <p className="opacity-70 mb-4">
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
            <div className="card bg-base-100 hover:shadow-xl transition-shadow border border-base-300 overflow-hidden group">
              <div className="card-body p-8">
                <div className="w-14 h-14 mb-5 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">Save and Review Games</h3>
                <p className="opacity-70 mb-4">
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

      {/* How It Works Section */}
      <section className="py-24 relative pb-64">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg opacity-70 max-w-2xl mx-auto">
              Simple enough for casual fans, powerful enough for coaches
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 relative">
                <span className="text-2xl font-bold text-primary">1</span>
                <div className="absolute -right-8 top-1/2 w-16 h-0.5 bg-primary/20 hidden md:block"></div>
              </div>
              <h3 className="text-xl font-bold mb-2">Paste YouTube Link</h3>
              <p className="opacity-70">
                Start by pasting any YouTube basketball game link in the Game Stat Tracker
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-6 relative">
                <span className="text-2xl font-bold text-secondary">2</span>
                <div className="absolute -right-8 top-1/2 w-16 h-0.5 bg-secondary/20 hidden md:block"></div>
              </div>
              <h3 className="text-xl font-bold mb-2">Track Player Stats</h3>
              <p className="opacity-70">
                Create teams, add players, and record stats as you watch the game unfold
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mb-6">
                <span className="text-2xl font-bold text-accent">3</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Save & Analyze</h3>
              <p className="opacity-70">
                Save the complete game stats and review detailed performance metrics
              </p>
            </div>
          </div>
        </div>
      </section>
      

    </div>
  );
};

export default Home; 