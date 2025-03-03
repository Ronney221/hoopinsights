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
                  onClick={() => currentUser ? handlePageChange('saved-games') : handlePageChange('register')}
                  className="btn btn-outline btn-lg group relative overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-base-content/0 via-base-content/5 to-base-content/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                  {currentUser ? 'View My Games' : 'Sign Up'}
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
                      src="https://edodevenreporting.com/wp-content/uploads/2023/01/north-americas-all-time-best-nba-players.jpg?w=816"
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
                  
                  {/* Interactive Demo Card */}
                  <div className="bg-base-100 rounded-2xl shadow-2xl p-6 transform hover:-rotate-2 transition-all duration-500">
                    <div className="relative rounded-xl overflow-hidden">
                      {/* Video Player Preview */}
                      <div className="relative aspect-video bg-base-300 rounded-t-xl overflow-hidden mb-4">
                        <img 
                          src="https://cdn.nba.com/manage/2023/01/MID-SEASON-SURVEY-PLAYERS-16X9-UPDATED.jpg"
                  alt="YouTube Integration" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <button className="btn btn-circle btn-lg bg-red-600 hover:bg-red-700 border-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            </svg>
                          </button>
                        </div>
                        {/* Timestamp Markers */}
                        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-base-100/20">
                          <div className="relative h-full">
                            {[15, 30, 45, 60, 75, 90].map((pos) => (
                              <div 
                                key={pos}
                                className="absolute top-0 w-1 h-full bg-primary/50 cursor-pointer hover:bg-primary transition-colors"
                                style={{ left: `${pos}%` }}
                                title={`Jump to play at ${Math.floor(pos * 1.2)}s`}
                              ></div>
                            ))}
                            <div className="absolute top-0 left-0 h-full bg-primary/80" style={{ width: '35%' }}></div>
                          </div>
                        </div>
                      </div>

                      {/* Stats Input Interface */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                        {[
                          { label: '2PT', variant: 'primary' },
                          { label: '3PT', variant: 'secondary' },
                          { label: 'AST', variant: 'accent' },
                          { label: 'REB', variant: 'primary' },
                          { label: 'STL', variant: 'secondary' },
                          { label: 'BLK', variant: 'accent' }
                        ].map((stat, index) => (
                          <button 
                            key={index}
                            className={`btn btn-${stat.variant} btn-outline btn-sm font-bold hover:scale-105 transform transition-transform`}
                          >
                            {stat.label}
                          </button>
                        ))}
                      </div>

                      {/* Recent Actions */}
                      <div className="space-y-2">
                        <div className="text-sm font-medium opacity-60 mb-2">Recent Actions</div>
                        {[
                          { time: '2:15', player: 'Player 1', action: '3PT Made', variant: 'success' },
                          { time: '2:05', player: 'Player 2', action: 'Rebound', variant: 'info' },
                          { time: '1:58', player: 'Player 1', action: 'Assist', variant: 'primary' }
                        ].map((action, index) => (
                          <div 
                            key={index}
                            className="flex items-center justify-between p-2 rounded-lg bg-base-200/50 text-sm"
                          >
                            <span className="font-mono">{action.time}</span>
                            <span className="font-medium">{action.player}</span>
                            <span className={`text-${action.variant}`}>{action.action}</span>
                          </div>
                        ))}
                      </div>
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
                  <div className="bg-base-100 rounded-2xl shadow-2xl p-6 transform hover:rotate-2 transition-all duration-500 relative">
                    {/* Live Stats Dashboard */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                      {/* Team Stats Cards */}
                      {[
                        { name: 'Team A', score: 87, variant: 'primary' },
                        { name: 'Team B', score: 82, variant: 'secondary' }
                      ].map((team, index) => (
                        <div key={index} className={`bg-${team.variant}/10 p-4 rounded-xl`}>
                          <h4 className={`text-${team.variant} text-lg font-bold mb-2`}>{team.name}</h4>
                          <div className="text-3xl font-bold mb-4">{team.score}</div>
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            <div>
                              <div className="opacity-60">FG%</div>
                              <div className="font-medium">48.5</div>
                            </div>
                            <div>
                              <div className="opacity-60">3P%</div>
                              <div className="font-medium">37.2</div>
                            </div>
                            <div>
                              <div className="opacity-60">FT%</div>
                              <div className="font-medium">82.1</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Shot Chart */}
                    <div className="relative aspect-[4/3] bg-base-200/50 rounded-xl mb-6 overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center">
                        {/* Court Lines */}
                        <div className="w-full h-full max-w-[80%] max-h-[80%] border-2 border-base-content/20 rounded-lg relative">
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 border-2 border-base-content/20 rounded-full"></div>
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-24 border-2 border-base-content/20 rounded-t-lg"></div>
                        </div>
                        {/* Shot Markers */}
                        {[
                          { x: 30, y: 40, made: true },
                          { x: 70, y: 30, made: false },
                          { x: 50, y: 60, made: true },
                          { x: 20, y: 70, made: true },
                          { x: 80, y: 50, made: false }
                        ].map((shot, index) => (
                          <div
                            key={index}
                            className={`absolute w-3 h-3 rounded-full ${
                              shot.made ? 'bg-success' : 'bg-error'
                            }`}
                            style={{
                              left: `${shot.x}%`,
                              top: `${shot.y}%`,
                              transform: 'translate(-50%, -50%)'
                            }}
                          ></div>
                        ))}
                      </div>
                    </div>

                    {/* Player Stats Table */}
                    <div className="overflow-x-auto">
                      <table className="table table-zebra w-full text-sm">
                        <thead>
                          <tr>
                            <th>Player</th>
                            <th className="text-center">PTS</th>
                            <th className="text-center">REB</th>
                            <th className="text-center">AST</th>
                            <th className="text-center">+/-</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { name: 'Player 1', pts: 28, reb: 7, ast: 9, plus_minus: 12 },
                            { name: 'Player 2', pts: 22, reb: 11, ast: 4, plus_minus: 8 },
                            { name: 'Player 3', pts: 18, reb: 5, ast: 12, plus_minus: 15 }
                          ].map((player, index) => (
                            <tr key={index}>
                              <td className="font-medium">{player.name}</td>
                              <td className="text-center">{player.pts}</td>
                              <td className="text-center">{player.reb}</td>
                              <td className="text-center">{player.ast}</td>
                              <td className={`text-center font-medium ${
                                player.plus_minus > 0 ? 'text-success' : 'text-error'
                              }`}>
                                {player.plus_minus > 0 ? '+' : ''}{player.plus_minus}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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
                  
                  {/* Career Stats Dashboard */}
                  <div className="bg-base-100 rounded-2xl shadow-2xl p-6 transform hover:rotate-2 transition-all duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl blur-xl"></div>
                    <div className="relative">
                      {/* Career Overview */}
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        {[
                          { label: 'Games', value: '156', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
                          { label: 'Points', value: '2,847', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                          { label: 'Win Rate', value: '68%', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' }
                        ].map((stat, index) => (
                          <div key={index} className="stat bg-base-200/50 p-4 rounded-xl text-center">
                            <div className="flex justify-center mb-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                              </svg>
              </div>
                            <div className="stat-value text-2xl font-bold">{stat.value}</div>
                            <div className="stat-title text-xs opacity-60">{stat.label}</div>
            </div>
                        ))}
                      </div>

                      {/* Progress Charts */}
                      <div className="space-y-6 mb-6">
                        {/* Points Per Game Progression */}
                        <div className="bg-base-200/50 p-4 rounded-xl">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">Points Per Game</span>
                            <span className="text-primary font-bold">18.2</span>
                          </div>
                          <div className="h-2 bg-base-300 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full transition-all duration-1000"
                              style={{ width: '75%' }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs opacity-60 mt-1">
                            <span>Last Season: 15.8</span>
                            <span>Career High: 24.3</span>
                          </div>
                        </div>

                        {/* Field Goal Percentage */}
                        <div className="bg-base-200/50 p-4 rounded-xl">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">Field Goal %</span>
                            <span className="text-secondary font-bold">45.8%</span>
                          </div>
                          <div className="h-2 bg-base-300 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-secondary rounded-full transition-all duration-1000"
                              style={{ width: '65%' }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs opacity-60 mt-1">
                            <span>Last Season: 42.3%</span>
                            <span>Career High: 48.9%</span>
                          </div>
                        </div>
                      </div>

                      {/* Achievement Badges */}
                      <div className="grid grid-cols-4 gap-4">
                        {[
                          { name: 'Sharpshooter', icon: '🎯', level: 'Gold', progress: '95' },
                          { name: 'Playmaker', icon: '🏀', level: 'Silver', progress: '75' },
                          { name: 'Defender', icon: '🛡️', level: 'Bronze', progress: '45' },
                          { name: 'Clutch', icon: '⚡', level: 'Gold', progress: '90' }
                        ].map((badge, index) => (
                          <div 
                            key={index}
                            className="group relative bg-base-200/50 p-3 rounded-xl text-center cursor-pointer hover:bg-base-200 transition-colors"
                          >
                            <div className="text-2xl mb-1">{badge.icon}</div>
                            <div className="text-xs font-medium truncate">{badge.name}</div>
                            <div className={`text-xs ${
                              badge.level === 'Gold' ? 'text-warning' :
                              badge.level === 'Silver' ? 'text-base-content/60' :
                              'text-orange-600'
                            }`}>
                              {badge.level}
                            </div>
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-32 p-2 bg-base-300 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="font-medium mb-1">{badge.name}</div>
                              <div className="h-1 bg-base-content/20 rounded-full">
                                <div 
                                  className="h-full bg-primary rounded-full"
                                  style={{ width: `${badge.progress}%` }}
                                ></div>
                              </div>
                              <div className="mt-1 opacity-60">{badge.progress}% Complete</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
          </div>
        </div>
      </section>

        {/* Share & Export Data */}
        <section className="py-24 relative overflow-hidden bg-base-200/30">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5"></div>
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-700"></div>
          
          {/* Basketball Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 30c15.71 0 28.45-12.74 28.45-28.45h3C61.45 17.45 47.45 31.45 30 31.45S-1.45 17.45-1.45 1.55h3C1.55 17.26 14.29 30 30 30z' fill='%23ff6b00' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}/>
          
          <div className="max-w-7xl mx-auto px-6 relative">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="md:w-1/2 lg:w-3/5 order-2 md:order-1">
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative bg-base-100 rounded-2xl shadow-2xl p-6 transform hover:scale-[1.02] transition-transform">
                    {/* Game Preview Card */}
                    <div className="bg-base-200/50 rounded-xl p-4 mb-6">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h3 className="text-lg font-bold">Warriors vs Lakers</h3>
                          <p className="text-sm opacity-60">March 15, 2024</p>
                        </div>
                        <div className="flex gap-2">
                          <div className="badge badge-primary">Final Score</div>
                          <div className="badge badge-ghost">ID: #2024315</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-base-100/50 rounded-lg">
                          <div className="text-3xl font-bold text-primary">120</div>
                          <div className="text-sm opacity-60">Warriors</div>
                        </div>
                        <div className="text-center p-4 bg-base-100/50 rounded-lg">
                          <div className="text-3xl font-bold text-secondary">115</div>
                          <div className="text-sm opacity-60">Lakers</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Share Options */}
                    <div className="mb-6">
                      <h3 className="text-lg font-bold mb-4">Share Options</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-base-200/50 p-4 rounded-xl hover:bg-base-200 transition-colors cursor-pointer group/share">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover/share:bg-primary/20">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                              </svg>
                            </div>
                            <div>
                              <div className="font-medium">Quick Share</div>
                              <div className="text-sm opacity-60">Share via link</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <input type="text" value="hoopinsights.com/g/2024315" className="input input-sm input-bordered flex-1" readOnly />
                            <button className="btn btn-primary btn-sm">Copy</button>
                          </div>
                        </div>
                        <div className="bg-base-200/50 p-4 rounded-xl hover:bg-base-200 transition-colors cursor-pointer group/team">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center group-hover/team:bg-secondary/20">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                              </svg>
                            </div>
                            <div>
                              <div className="font-medium">Team Share</div>
                              <div className="text-sm opacity-60">Share with your team</div>
                            </div>
                          </div>
                          <div className="flex -space-x-2">
                            {[
                              'https://i.pravatar.cc/100?img=1',
                              'https://i.pravatar.cc/100?img=2',
                              'https://i.pravatar.cc/100?img=3'
                            ].map((avatar, index) => (
                              <img 
                                key={index}
                                src={avatar}
                                alt={`Team member ${index + 1}`}
                                className="w-8 h-8 rounded-full border-2 border-base-100"
                              />
                            ))}
                            <button className="w-8 h-8 rounded-full bg-base-100 border-2 border-base-content/20 flex items-center justify-center text-sm font-medium">
                              +5
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Export Options */}
                    <div className="mb-6">
                      <h3 className="text-lg font-bold mb-4">Export Formats</h3>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { format: 'CSV', icon: 'M10 18v-2m4 2v-2m4 2v-2M8 6h13a1 1 0 011 1v10a1 1 0 01-1 1H8a1 1 0 01-1-1V7a1 1 0 011-1z', description: 'Raw data export' },
                          { format: 'PDF', icon: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', description: 'Detailed report' },
                          { format: 'JSON', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16', description: 'API compatible' }
                        ].map((item, index) => (
                          <div key={index} className="bg-base-200/50 p-4 rounded-xl text-center hover:bg-base-200 transition-colors cursor-pointer group/format">
                            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center group-hover/format:bg-primary/20 transition-colors">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
                              </svg>
                            </div>
                            <div className="font-medium mb-1">{item.format}</div>
                            <div className="text-xs opacity-60">{item.description}</div>
                            {/* Download Progress - Initially Hidden */}
                            <div className="mt-2 opacity-0 group-hover/format:opacity-100 transition-opacity">
                              <div className="h-1 bg-base-300 rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full transition-all duration-1000 w-0 group-hover/format:w-full"></div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Additional Features */}
                    <div>
                      <h3 className="text-lg font-bold mb-4">Enhanced Features</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-4 p-3 bg-base-200/50 rounded-lg hover:bg-base-200 transition-colors cursor-pointer group/feature">
                          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center group-hover/feature:bg-accent/20">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">Video Highlights</div>
                            <div className="text-sm opacity-60">Auto-generated highlights reel</div>
                          </div>
                          <div className="badge badge-accent">New</div>
                        </div>
                        
                        <div className="flex items-center gap-4 p-3 bg-base-200/50 rounded-lg hover:bg-base-200 transition-colors cursor-pointer group/feature">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover/feature:bg-primary/20">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">Advanced Analytics</div>
                            <div className="text-sm opacity-60">AI-powered insights</div>
                          </div>
                          <div className="badge badge-primary">Pro</div>
                        </div>

                        <div className="flex items-center gap-4 p-3 bg-base-200/50 rounded-lg hover:bg-base-200 transition-colors cursor-pointer group/feature">
                          <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center group-hover/feature:bg-secondary/20">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">Comments & Notes</div>
                            <div className="text-sm opacity-60">Collaborative feedback</div>
                          </div>
                          <button className="btn btn-sm btn-ghost">View All</button>
                        </div>
                      </div>
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
                  Share your game analysis with coaches, teammates, or friends. Export data in multiple formats and collaborate in real-time.
                </p>
                <ul className="space-y-4 text-left mb-8">
                  {[
                    'Share games with unique links',
                    'Export in CSV, PDF, or JSON formats',
                    'Real-time collaboration with team members',
                    'Include video highlights and comments',
                    'AI-powered insights and analytics',
                    'Secure and instant sharing'
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
                <div className="flex flex-wrap gap-4">
              <button
                    onClick={() => handlePageChange('saved-games')}
                    className="btn btn-primary btn-lg group relative overflow-hidden"
              >
                    <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/25 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                Share Game Stats
              </button>
                  <button
                    onClick={() => handlePageChange('export')}
                    className="btn btn-outline btn-lg group relative overflow-hidden"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-base-content/0 via-base-content/5 to-base-content/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                    Export Data
              </button>
                </div>
            </div>
          </div>
        </div>
      </section>

        {/* Season Stats Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5"></div>
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-700"></div>
          
          {/* Basketball Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 30c15.71 0 28.45-12.74 28.45-28.45h3C61.45 17.45 47.45 31.45 30 31.45S-1.45 17.45-1.45 1.55h3C1.55 17.26 14.29 30 30 30z' fill='%23ff6b00' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}/>
          
          <div className="max-w-7xl mx-auto px-6 relative">
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-2 bg-primary/10 rounded-full text-primary font-medium mb-6 transform hover:scale-105 transition-transform">
                SEASON TRACKING
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Season Statistics</h2>
              <p className="text-xl opacity-80 max-w-2xl mx-auto mb-12 leading-relaxed">
                Track your progress throughout the season with comprehensive statistics and advanced analytics.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Season Overview */}
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative bg-base-100 rounded-2xl shadow-2xl p-6 transform hover:scale-[1.02] transition-transform">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    Season Overview
                    <div className="badge badge-primary">2023-24</div>
                  </h3>
                  
                  {/* Progress Bar */}
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Season Progress</span>
                      <div className="flex items-center gap-2">
                        <span className="text-primary font-bold">24</span>
                        <span className="text-sm opacity-60">/</span>
                        <span className="text-sm opacity-60">82 Games</span>
                      </div>
                    </div>
                    <div className="h-3 bg-base-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-1000"
                        style={{ width: '29%' }}
                      >
                        <div className="w-full h-full opacity-75 bg-[length:10px_10px] bg-[linear-gradient(45deg,rgba(0,0,0,.2)25%,transparent_25%,transparent_50%,rgba(0,0,0,.2)50%,rgba(0,0,0,.2)75%,transparent_75%,transparent)] animate-[progress-bar-stripes_1s_linear_infinite]"></div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                      { label: 'Win Rate', value: '68%', trend: '+5%', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
                      { label: 'PPG', value: '95.4', trend: '+2.3', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
                      { label: 'FG%', value: '46.2%', trend: '+1.8%', icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z' },
                      { label: '3P%', value: '37.8%', trend: '+0.5%', icon: 'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' },
                      { label: 'AST', value: '23.5', trend: '+3.2', icon: 'M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11' },
                      { label: 'REB', value: '42.1', trend: '-1.4', icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z' }
                    ].map((stat, index) => (
                      <div key={index} className="group/stat bg-base-200/50 p-4 rounded-xl hover:bg-base-200 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                  </svg>
                          <div className="text-sm opacity-60">{stat.label}</div>
                        </div>
                        <div className="text-xl font-bold">{stat.value}</div>
                        <div className={`text-xs ${
                          stat.trend.startsWith('+') ? 'text-success' : 'text-error'
                        }`}>
                          {stat.trend} vs Last Season
                        </div>
                        {/* Tooltip */}
                        <div className="absolute opacity-0 group-hover/stat:opacity-100 transition-opacity bg-base-300 text-sm p-2 rounded-lg -top-12 left-1/2 -translate-x-1/2 pointer-events-none">
                          View detailed {stat.label} stats
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Recent Games Preview */}
                  <div className="mt-8">
                    <h4 className="font-bold mb-4 flex items-center justify-between">
                      <span>Recent Games</span>
                      <button className="btn btn-ghost btn-sm">View All</button>
                    </h4>
                    <div className="space-y-3">
                      {[
                        { opponent: 'Lakers', result: 'W', score: '120-115', date: 'Mar 15' },
                        { opponent: 'Celtics', result: 'W', score: '108-102', date: 'Mar 12' },
                        { opponent: 'Nets', result: 'L', score: '98-105', date: 'Mar 10' }
                      ].map((game, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-base-200/50 rounded-lg hover:bg-base-200 transition-colors cursor-pointer group/game">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              game.result === 'W' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                            }`}>
                              {game.result}
                            </div>
                            <div>
                              <div className="font-medium">vs {game.opponent}</div>
                              <div className="text-xs opacity-60">{game.date}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-medium">{game.score}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-0 group-hover/game:opacity-60 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Trends */}
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative bg-base-100 rounded-2xl shadow-2xl p-6 transform hover:scale-[1.02] transition-transform">
                  <h3 className="text-2xl font-bold mb-6 flex items-center justify-between">
                    <span>Performance Trends</span>
                    <div className="flex gap-2">
                      <button className="btn btn-sm btn-ghost">Week</button>
                      <button className="btn btn-sm btn-primary">Month</button>
                      <button className="btn btn-sm btn-ghost">Season</button>
                    </div>
                  </h3>
                  
                  {/* Points Trend */}
                  <div className="bg-base-200/50 p-4 rounded-xl mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <div className="font-medium">Points Per Game</div>
                        <div className="text-2xl font-bold text-primary">95.4</div>
                      </div>
                      <div className="text-success text-sm flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                        2.3 pts
                      </div>
                    </div>
                    <div className="h-24 flex items-end gap-1">
                      {[65, 72, 68, 85, 78, 92, 95].map((height, index) => (
                        <div key={index} className="relative flex-1 group/bar">
                          <div
                            className="bg-primary/20 rounded-t transition-all duration-500 hover:bg-primary"
                            style={{ height: `${height}%` }}
                          ></div>
                          {/* Tooltip */}
                          <div className="absolute opacity-0 group-hover/bar:opacity-100 transition-opacity bg-base-300 text-xs p-2 rounded-lg -top-8 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap">
                            Game {index + 1}: {height} points
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs opacity-60 mt-2">
                      <span>Last 7 Games</span>
                      <span>Current</span>
                    </div>
                  </div>

                  {/* Shooting Stats */}
                  <div className="space-y-4">
                    {[
                      { label: 'Field Goals', value: 46.2, color: 'primary', lastGame: 52.1 },
                      { label: '3-Pointers', value: 37.8, color: 'secondary', lastGame: 33.3 },
                      { label: 'Free Throws', value: 82.1, color: 'accent', lastGame: 85.7 }
                    ].map((stat, index) => (
                      <div key={index} className="bg-base-200/50 p-4 rounded-xl group/stat hover:bg-base-200 transition-colors">
                        <div className="flex justify-between text-sm mb-2">
                          <span>{stat.label}</span>
                          <div className="flex items-center gap-2">
                            <span className={`text-${stat.color}`}>{stat.value}%</span>
                            <span className={`text-xs ${stat.lastGame > stat.value ? 'text-success' : 'text-error'}`}>
                              ({stat.lastGame}% last game)
                            </span>
                          </div>
                        </div>
                        <div className="h-2 bg-base-300 rounded-full overflow-hidden">
                          <div 
                            className={`h-full bg-${stat.color} rounded-full transition-all duration-1000`}
                            style={{ width: `${stat.value}%` }}
                          >
                            <div className="w-full h-full opacity-75 bg-[length:10px_10px] bg-[linear-gradient(45deg,rgba(0,0,0,.2)25%,transparent_25%,transparent_50%,rgba(0,0,0,.2)50%,rgba(0,0,0,.2)75%,transparent_75%,transparent)] animate-[progress-bar-stripes_1s_linear_infinite]"></div>
                          </div>
                        </div>
                      </div>
                    ))}
            </div>

                  {/* Advanced Stats Preview */}
                  <div className="mt-6">
                    <h4 className="font-bold mb-4">Advanced Stats</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-base-200/50 p-4 rounded-xl hover:bg-base-200 transition-colors cursor-pointer">
                        <div className="text-sm opacity-60">True Shooting %</div>
                        <div className="text-xl font-bold">58.2%</div>
                        <div className="text-xs text-success">+2.1% vs League Avg</div>
              </div>
                      <div className="bg-base-200/50 p-4 rounded-xl hover:bg-base-200 transition-colors cursor-pointer">
                        <div className="text-sm opacity-60">Player Efficiency</div>
                        <div className="text-xl font-bold">22.4</div>
                        <div className="text-xs text-success">Top 15%</div>
            </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-12">
              <button
                onClick={() => handlePageChange('saved-games')}
                className="btn btn-primary btn-lg group relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/25 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                View Full Season Stats
              </button>
          </div>
        </div>
      </section>

 {/* NBA Stars Section */}
        <section className="py-24 relative overflow-hidden bg-base-200/30">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1546519638-68e109acd27d?q=80&w=2070')] bg-cover bg-center opacity-[0.03]"></div>
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-700"></div>
          
          {/* Basketball Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 30c15.71 0 28.45-12.74 28.45-28.45h3C61.45 17.45 47.45 31.45 30 31.45S-1.45 17.45-1.45 1.55h3C1.55 17.26 14.29 30 30 30z' fill='%23ff6b00' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}/>
          
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
            {/* LeBron James Card */}
              <div className="relative group">
                {/* Decorative Elements */}
                <div className="absolute -top-6 -left-6 w-12 h-12 border-4 border-primary/20 rounded-full animate-bounce"></div>
                <div className="absolute top-1/2 -right-6 w-12 h-12 border-4 border-secondary/20 rounded-full animate-bounce delay-150"></div>
                
                <div className="card bg-base-100 shadow-2xl overflow-hidden group-hover:shadow-primary/20 transition-all duration-500">
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
                        { label: 'PPG', value: '27.3', trend: '+1.2' },
                        { label: 'RPG', value: '7.3', trend: '-0.5' },
                        { label: 'APG', value: '8.3', trend: '+0.8' }
                      ].map((stat, index) => (
                        <div key={index} className="bg-base-200/50 p-4 rounded-xl group-hover:bg-primary/10 transition-colors duration-300">
                          <span className="text-2xl font-bold text-primary block mb-1">{stat.value}</span>
                          <span className="text-sm opacity-70 block">{stat.label}</span>
                          <span className={`text-xs ${stat.trend.startsWith('+') ? 'text-success' : 'text-error'}`}>
                            {stat.trend} vs Last Season
                          </span>
                  </div>
                      ))}
                  </div>
                    <div className="mt-6 space-y-4">
                      <div className="flex justify-between items-center text-sm">
                        <span>Career Points</span>
                        <span className="font-bold">39,868</span>
                  </div>
                      <div className="h-2 bg-base-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-1000"
                          style={{ width: '98%' }}
                        >
                          <div className="w-full h-full opacity-75 bg-[length:10px_10px] bg-[linear-gradient(45deg,rgba(0,0,0,.2)25%,transparent_25%,transparent_50%,rgba(0,0,0,.2)50%,rgba(0,0,0,.2)75%,transparent_75%,transparent)] animate-[progress-bar-stripes_1s_linear_infinite]"></div>
                </div>
                      </div>
                      <div className="text-xs opacity-60 text-center">All-Time Scoring Leader</div>
                    </div>
                    <div className="flex gap-4 mt-6">
                <button 
                        onClick={() => handlePageChange('youtube')}
                        className="btn btn-primary flex-1"
                      >
                        Analyze Games
                      </button>
                      <button 
                        className="btn btn-circle btn-ghost"
                        onClick={() => window.open('https://www.nba.com/stats/player/2544', '_blank')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                </button>
                    </div>
                  </div>
              </div>
            </div>
            
            {/* Stephen Curry Card */}
              <div className="relative group">
                {/* Decorative Elements */}
                <div className="absolute -top-6 -right-6 w-12 h-12 border-4 border-secondary/20 rounded-full animate-bounce"></div>
                <div className="absolute top-1/2 -left-6 w-12 h-12 border-4 border-primary/20 rounded-full animate-bounce delay-150"></div>
                
                <div className="card bg-base-100 shadow-2xl overflow-hidden group-hover:shadow-secondary/20 transition-all duration-500">
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
                        { label: 'PPG', value: '29.4', trend: '+1.8' },
                        { label: '3PM', value: '5.3', trend: '+0.4' },
                        { label: '3P%', value: '43.7', trend: '+2.1' }
                      ].map((stat, index) => (
                        <div key={index} className="bg-base-200/50 p-4 rounded-xl group-hover:bg-secondary/10 transition-colors duration-300">
                          <span className="text-2xl font-bold text-secondary block mb-1">{stat.value}</span>
                          <span className="text-sm opacity-70 block">{stat.label}</span>
                          <span className={`text-xs ${stat.trend.startsWith('+') ? 'text-success' : 'text-error'}`}>
                            {stat.trend} vs Last Season
                          </span>
                  </div>
                      ))}
                  </div>
                    <div className="mt-6 space-y-4">
                      <div className="flex justify-between items-center text-sm">
                        <span>Career 3-Pointers</span>
                        <span className="font-bold">3,535</span>
                  </div>
                      <div className="h-2 bg-base-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-secondary to-primary rounded-full transition-all duration-1000"
                          style={{ width: '100%' }}
                        >
                          <div className="w-full h-full opacity-75 bg-[length:10px_10px] bg-[linear-gradient(45deg,rgba(0,0,0,.2)25%,transparent_25%,transparent_50%,rgba(0,0,0,.2)50%,rgba(0,0,0,.2)75%,transparent_75%,transparent)] animate-[progress-bar-stripes_1s_linear_infinite]"></div>
                </div>
                      </div>
                      <div className="text-xs opacity-60 text-center">All-Time 3-Point Leader</div>
                    </div>
                    <div className="flex gap-4 mt-6">
                <button 
                        onClick={() => handlePageChange('youtube')}
                        className="btn btn-secondary flex-1"
                      >
                        Track Shooting
                      </button>
                      <button 
                        className="btn btn-circle btn-ghost"
                        onClick={() => window.open('https://www.nba.com/stats/player/201939', '_blank')}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                </button>
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </section>

        {/* Epic Call to Action */}
        <section className="py-32 relative overflow-hidden">
          {/* Dynamic Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-base-100 to-secondary/20"></div>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1470')] bg-cover bg-center opacity-[0.03]"></div>
          
          {/* Animated Gradient Orbs */}
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          
          {/* Basketball Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 30c15.71 0 28.45-12.74 28.45-28.45h3C61.45 17.45 47.45 31.45 30 31.45S-1.45 17.45-1.45 1.55h3C1.55 17.26 14.29 30 30 30z' fill='%23ff6b00' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}/>
          
          {/* Floating Elements */}
          <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-primary/10 rounded-xl rotate-12 animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-20 h-20 bg-secondary/10 rounded-xl -rotate-12 animate-float-delayed"></div>
          
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center">

              <div className="relative inline-block mb-8">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary blur-lg opacity-25"></div>
                <h2 className="relative text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  Ready to elevate your game?
                </h2>
              </div>
              <p className="text-xl opacity-80 max-w-2xl mx-auto mb-12 leading-relaxed">
            Start tracking your basketball stats today and discover insights that will take your game to the next level.
          </p>
              
              {/* Feature Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {[
                  { 
                    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
                    title: 'Real-Time Stats',
                    description: 'Track every play as it happens'
                  },
                  {
                    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
                    title: 'Advanced Analytics',
                    description: 'Get pro-level insights'
                  },
                  {
                    icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z',
                    title: 'Share & Collaborate',
                    description: 'Connect with your team'
                  }
                ].map((feature, index) => (
                  <div key={index} className="bg-base-200/50 p-6 rounded-2xl hover:bg-base-200 transition-all duration-300 transform hover:scale-105">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                    <p className="text-sm opacity-60">{feature.description}</p>
                  </div>
                ))}
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-6 justify-center items-center">
            <button
                  onClick={() => handlePageChange('youtube')}
                  className="btn btn-primary btn-lg group relative overflow-hidden"
            >
                  <span className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/25 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                  <span className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    </svg>
              Track Your First Game
                  </span>
            </button>
            {!currentUser && (
              <button
                    onClick={() => handlePageChange('register')}
                    className="btn btn-outline btn-lg group relative overflow-hidden"
              >
                    <span className="absolute inset-0 bg-gradient-to-r from-base-content/0 via-base-content/5 to-base-content/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                    <span className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                Create Free Account
                    </span>
              </button>
            )}
              </div>
              
              {/* Trust Indicators */}
              <div className="mt-12 flex flex-wrap justify-center items-center gap-8">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="text-sm">Secure & Private</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-sm">Real-Time Updates</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                  <span className="text-sm">Cloud Storage</span>
                </div>
              </div>
          </div>
        </div>
      </section>
      </div>
    </div>
  );
};

export default Home; 