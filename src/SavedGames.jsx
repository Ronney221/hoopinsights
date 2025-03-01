import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from './contexts/AuthContext';

const SavedGames = ({ setCurrentPage }) => {
  const { currentUser } = useAuth();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);
  const [expandedGame, setExpandedGame] = useState(null);

  useEffect(() => {
    const fetchSavedGames = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Fetch saved games from the API
        const response = await fetch('/api/stats/savedGames', {
          headers: {
            'Authorization': `Bearer ${await currentUser.getIdToken()}`,
            'X-User-Id': currentUser.uid,
            'X-User-Email': currentUser.email || ''
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch saved games');
        }
        
        const savedGames = await response.json();
        setGames(savedGames);
      } catch (error) {
        console.error('Error fetching saved games:', error);
        toast.error(`Failed to load saved games: ${error.message}`);
        // Set empty games array to avoid showing stale data
        setGames([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedGames();
  }, [currentUser]);

  // Helper function to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Helper function to get player statistics
  const getPlayerStats = (playerName, gameStats) => {
    const playerStats = {
      name: playerName,
      points: 0,
      fgMade: 0,
      fgAttempts: 0,
      threePtMade: 0,
      threePtAttempts: 0,
      ftMade: 0, 
      ftAttempts: 0,
      rebounds: 0,
      assists: 0,
      steals: 0,
      blocks: 0,
      turnovers: 0,
      fouls: 0
    };
    
    gameStats.forEach(stat => {
      if (stat.player === playerName) {
        switch(stat.type) {
          case 'FG Made':
            playerStats.points += 2;
            playerStats.fgMade += 1;
            playerStats.fgAttempts += 1;
            break;
          case 'FG Missed':
            playerStats.fgAttempts += 1;
            break;
          case '3PT Made':
            playerStats.points += 3;
            playerStats.threePtMade += 1;
            playerStats.threePtAttempts += 1;
            break;
          case '3PT Missed':
            playerStats.threePtAttempts += 1;
            break;
          case 'FT Made':
            playerStats.points += 1;
            playerStats.ftMade += 1;
            playerStats.ftAttempts += 1;
            break;
          case 'FT Missed':
            playerStats.ftAttempts += 1;
            break;
          case 'Rebound':
            playerStats.rebounds += 1;
            break;
          case 'Assist':
            playerStats.assists += 1;
            break;
          case 'Steal':
            playerStats.steals += 1;
            break;
          case 'Block':
            playerStats.blocks += 1;
            break;
          case 'Turnover':
            playerStats.turnovers += 1;
            break;
          case 'Foul':
            playerStats.fouls += 1;
            break;
        }
      }
    });
    
    return playerStats;
  };

  // Get an array of all players with stats for a specific game
  const getPlayersWithStats = (game) => {
    if (!game || !game.stats) return [];
    
    // Get unique players from stats
    const playerNames = [...new Set(game.stats.map(stat => stat.player))];
    return playerNames.map(name => getPlayerStats(name, game.stats));
  };

  // Handle continue watching a game
  const continueWatching = (game) => {
    try {
      // Save the game data to localStorage so the YouTube component can access it
      localStorage.setItem('continue-game', JSON.stringify({
        videoId: game.videoId,
        videoUrl: game.videoUrl,
        title: game.title,
        teams: game.teams,
        stats: game.stats
      }));
      
      // Navigate to the YouTube component
      toast.info(`Opening video: ${game.title}`);
      setCurrentPage('youtube');
    } catch (error) {
      console.error('Error preparing to continue game:', error);
      toast.error('Failed to load game. Please try again.');
    }
  };

  // Handle deleting a saved game
  const deleteGame = async (game, event) => {
    event.stopPropagation(); // Prevent expanding the game card
    
    if (window.confirm('Are you sure you want to delete this saved game?')) {
      try {
        const response = await fetch(`/api/stats/deleteGame/${game.videoId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${await currentUser.getIdToken()}`,
            'X-User-Id': currentUser.uid,
            'X-User-Email': currentUser.email || ''
          }
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete game');
        }
        
        setGames(prevGames => prevGames.filter(g => g.id !== game.id));
        toast.success('Game deleted successfully');
      } catch (error) {
        console.error('Error deleting game:', error);
        toast.error(`Failed to delete game: ${error.message}`);
      }
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Saved Games
          </h1>
          <p className="text-lg md:text-xl opacity-80 max-w-2xl mx-auto mb-8">
            View and analyze your previously tracked basketball games
          </p>
        </div>
        
        {/* Not Logged In Message */}
        {!currentUser && (
          <div className="card bg-base-100 shadow-xl p-6">
            <div className="text-center py-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-primary opacity-50 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h2 className="text-2xl font-bold mb-2">Login Required</h2>
              <p className="mb-6 opacity-70 max-w-md mx-auto">
                You need to be logged in to view your saved games.
              </p>
              <div className="flex justify-center gap-4">
                <button 
                  className="btn btn-primary"
                  onClick={() => setCurrentPage('login')}
                >
                  Login
                </button>
                <button 
                  className="btn btn-outline"
                  onClick={() => setCurrentPage('register')}
                >
                  Register
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Loading State */}
        {currentUser && loading && (
          <div className="flex justify-center items-center py-16">
            <div className="loading loading-spinner loading-lg text-primary"></div>
          </div>
        )}
        
        {/* No Games Saved Message */}
        {currentUser && !loading && games.length === 0 && (
          <div className="card bg-base-100 shadow-xl p-6">
            <div className="text-center py-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-primary opacity-50 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h2 className="text-2xl font-bold mb-2">No Saved Games</h2>
              <p className="mb-6 opacity-70 max-w-md mx-auto">
                You haven't saved any games yet. Start tracking stats by watching a YouTube video.
              </p>
              <button 
                className="btn btn-primary"
                onClick={() => setCurrentPage('youtube')}
              >
                Track a Game
              </button>
            </div>
          </div>
        )}
        
        {/* Saved Games List */}
        {currentUser && !loading && games.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {games.map(game => (
              <div 
                key={game.id}
                className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all cursor-pointer"
                onClick={() => setExpandedGame(expandedGame === game.id ? null : game.id)}
              >
                <div className="card-body">
                  <div className="flex justify-between items-start">
                    <h2 className="card-title">{game.title}</h2>
                    <button 
                      className="btn btn-square btn-ghost btn-sm"
                      onClick={(e) => deleteGame(game, e)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <p className="text-sm opacity-70">Saved on {formatDate(game.createdAt)}</p>
                  
                  <div className="flex justify-between items-center mt-2">
                    <div className="badge badge-primary">{game.teams.team1.name}</div>
                    <div className="text-xs">vs</div>
                    <div className="badge badge-secondary">{game.teams.team2.name}</div>
                  </div>
                  
                  <div className="text-sm mt-2">
                    <span className="font-medium">{game.stats.length}</span> stats recorded
                  </div>
                  
                  {/* Expanded Game Details */}
                  {expandedGame === game.id && (
                    <div className="mt-4 border-t pt-4">
                      <h3 className="font-bold text-lg mb-3">Player Statistics</h3>
                      
                      <div className="overflow-x-auto">
                        <table className="table table-zebra table-sm w-full">
                          <thead>
                            <tr>
                              <th>Player</th>
                              <th>PTS</th>
                              <th>REB</th>
                              <th>AST</th>
                              <th>STL</th>
                              <th>BLK</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getPlayersWithStats(game).map(playerStat => (
                              <tr key={playerStat.name}>
                                <td className="font-medium">{playerStat.name}</td>
                                <td>{playerStat.points}</td>
                                <td>{playerStat.rebounds}</td>
                                <td>{playerStat.assists}</td>
                                <td>{playerStat.steals}</td>
                                <td>{playerStat.blocks}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="card-actions justify-end mt-4">
                        <button 
                          className="btn btn-primary"
                          onClick={() => continueWatching(game)}
                        >
                          Continue Watching
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Back Button */}
        <div className="flex justify-center mt-8">
          <button 
            onClick={() => setCurrentPage('home')}
            className="btn btn-outline btn-sm rounded-xl"
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

export default SavedGames; 