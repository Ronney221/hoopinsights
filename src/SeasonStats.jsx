import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from './contexts/AuthContext';
import { formatDate } from './utils/dateUtils';
import { SEASON_ENDPOINTS, STATS_V2_ENDPOINTS, createApiHeaders } from './config/apiConfig';

const SeasonStats = ({ setCurrentPage }) => {
  const { currentUser } = useAuth();
  const [seasons, setSeasons] = useState([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newSeasonName, setNewSeasonName] = useState('');
  const [statsView, setStatsView] = useState('per-game');
  const [loading, setLoading] = useState(true);
  const [seasonGames, setSeasonGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(false);

  // Load seasons data from API
  useEffect(() => {
    const fetchSeasons = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const headers = await createApiHeaders(currentUser);
        const response = await fetch(SEASON_ENDPOINTS.GET_SEASONS, { headers });
        
        if (!response.ok) {
          throw new Error('Failed to fetch seasons');
        }
        
        const seasonsData = await response.json();
        setSeasons(seasonsData);
        
        if (seasonsData.length > 0) {
          // Select the most recent season by default
          setSelectedSeasonId(seasonsData[0]._id); // Using MongoDB _id
        }
      } catch (error) {
        console.error('Error fetching seasons:', error);
        toast.error('Failed to load seasons');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSeasons();
  }, [currentUser]);

  // Get the currently selected season
  const selectedSeason = seasons.find(season => season._id === selectedSeasonId);

  // Fetch games data for the selected season
  useEffect(() => {
    const fetchSeasonGames = async () => {
      if (!selectedSeasonId || !currentUser) {
        setSeasonGames([]);
        return;
      }
      
      try {
        setLoadingGames(true);
        const headers = await createApiHeaders(currentUser);
        const response = await fetch(SEASON_ENDPOINTS.GET_SEASON(selectedSeasonId), { headers });
        
        if (!response.ok) {
          throw new Error('Failed to fetch season data');
        }
        
        const seasonData = await response.json();
        
        // Fetch all games for this season
        if (seasonData.gameIds && seasonData.gameIds.length > 0) {
          const gamesResponse = await fetch(STATS_V2_ENDPOINTS.GET_SAVED_GAMES, { headers });
          
          if (!gamesResponse.ok) {
            throw new Error('Failed to fetch games data');
          }
          
          const allGames = await gamesResponse.json();
          
          // Filter games that belong to this season
          const filteredGames = allGames.filter(game => 
            seasonData.gameIds.includes(game.videoId)
          );
          
          setSeasonGames(filteredGames);
        } else {
          setSeasonGames([]);
        }
      } catch (error) {
        console.error('Error fetching season games:', error);
        toast.error('Failed to load season games');
        setSeasonGames([]);
      } finally {
        setLoadingGames(false);
      }
    };
    
    fetchSeasonGames();
  }, [selectedSeasonId, currentUser]);

  // Edit season name
  const startEditingName = () => {
    if (!selectedSeason) return;
    setNewSeasonName(selectedSeason.name);
    setIsEditingName(true);
  };

  // Save the edited season name
  const saveSeasonName = async () => {
    if (!currentUser) {
      toast.warning('Please sign in to edit seasons');
      return;
    }
    
    if (!newSeasonName.trim()) {
      toast.error('Season name cannot be empty');
      return;
    }

    try {
      const headers = await createApiHeaders(currentUser);
      const response = await fetch(SEASON_ENDPOINTS.UPDATE_SEASON(selectedSeasonId), {
        method: 'PUT',
        headers,
        body: JSON.stringify({ name: newSeasonName.trim() })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update season');
      }
      
      // Update the local state
      const updatedSeasons = seasons.map(season => 
        season._id === selectedSeasonId 
          ? { ...season, name: newSeasonName.trim() } 
          : season
      );
      
      setSeasons(updatedSeasons);
      setIsEditingName(false);
      toast.success('Season name updated');
    } catch (error) {
      console.error('Error updating season:', error);
      toast.error('Failed to update season: ' + error.message);
    }
  };

  // Delete a season
  const deleteSeason = async (seasonId) => {
    if (!currentUser) {
      toast.warning('Please sign in to delete seasons');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this season? This action cannot be undone.')) {
      return;
    }

    try {
      const headers = await createApiHeaders(currentUser);
      const response = await fetch(SEASON_ENDPOINTS.DELETE_SEASON(seasonId), {
        method: 'DELETE',
        headers
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete season');
      }
      
      // Update the local state
      const updatedSeasons = seasons.filter(season => season._id !== seasonId);
      setSeasons(updatedSeasons);
      
      // If the deleted season was selected, select another one or clear selection
      if (seasonId === selectedSeasonId) {
        setSelectedSeasonId(updatedSeasons.length > 0 ? updatedSeasons[0]._id : null);
      }
      
      toast.success('Season deleted');
    } catch (error) {
      console.error('Error deleting season:', error);
      toast.error('Failed to delete season: ' + error.message);
    }
  };

  // Get all players from all games in the season
  const getAllPlayers = () => {
    if (!seasonGames || seasonGames.length === 0) return [];

    const allPlayersSet = new Set();
    
    seasonGames.forEach(game => {
      if (game.stats) {
        game.stats.forEach(stat => {
          if (stat.player) {
            // Include team info to distinguish same-named players on different teams
            allPlayersSet.add(`${stat.team}|${stat.player}`);
          }
        });
      }
    });

    // Convert to array and split into team and player name
    return Array.from(allPlayersSet).map(combinedName => {
      const [team, name] = combinedName.split('|');
      return { team, name, combinedName };
    });
  };

  // Get the HTML header for the stats table based on the current view
  const getStatsTableHeader = () => {
    if (statsView === 'per-game') {
      return (
        <tr className="bg-base-200">
          <th>Player</th>
          <th>Team</th>
          <th>GP</th>
          <th>PPG</th>
          <th>RPG</th>
          <th>APG</th>
          <th>SPG</th>
          <th>BPG</th>
          <th>FG%</th>
          <th>2P%</th>
          <th>3P%</th>
          <th>FT%</th>
        </tr>
      );
    } else {
      return (
        <tr className="bg-base-200">
          <th>Player</th>
          <th>Team</th>
          <th>Games</th>
          <th>Points</th>
          <th>Rebounds</th>
          <th>Assists</th>
          <th>Steals</th>
          <th>Blocks</th>
          <th>FG</th>
          <th>2PT</th>
          <th>3PT</th>
          <th>FT</th>
        </tr>
      );
    }
  };

  // Get the table cell content based on the current view
  const getPlayerStatsRow = (player) => {
    const stats = getPlayerSeasonStats(player.combinedName);
    if (!stats) return null;
    
    if (statsView === 'per-game') {
      return (
        <tr key={player.combinedName}>
          <td className="font-medium">{stats.name}</td>
          <td>{stats.team === 'team1' ? seasonGames[0]?.teams?.team1?.name || 'Team 1' : seasonGames[0]?.teams?.team2?.name || 'Team 2'}</td>
          <td>{stats.gamesPlayed}</td>
          <td className="font-medium">{stats.ppg}</td>
          <td>{stats.rpg}</td>
          <td>{stats.apg}</td>
          <td>{stats.spg}</td>
          <td>{stats.bpg}</td>
          <td>{stats.fgPercentage}%</td>
          <td>{stats.twoPtPercentage}%</td>
          <td>{stats.threePtPercentage}%</td>
          <td>{stats.ftPercentage}%</td>
        </tr>
      );
    } else {
      return (
        <tr key={player.combinedName}>
          <td className="font-medium">{stats.name}</td>
          <td>{stats.team === 'team1' ? seasonGames[0]?.teams?.team1?.name || 'Team 1' : seasonGames[0]?.teams?.team2?.name || 'Team 2'}</td>
          <td>{stats.gamesPlayed}</td>
          <td className="font-medium">{stats.points}</td>
          <td>{stats.rebounds}</td>
          <td>{stats.assists}</td>
          <td>{stats.steals}</td>
          <td>{stats.blocks}</td>
          <td>{`${stats.fgMade}/${stats.fgAttempts}`}</td>
          <td>{`${stats.twoPtMade}/${stats.twoPtAttempts}`}</td>
          <td>{`${stats.threePtMade}/${stats.threePtAttempts}`}</td>
          <td>{`${stats.ftMade}/${stats.ftAttempts}`}</td>
        </tr>
      );
    }
  };

  // Calculate aggregated stats for a player across all games in the season
  const getPlayerSeasonStats = (playerCombinedName) => {
    if (!seasonGames || seasonGames.length === 0) return null;

    const [playerTeam, playerName] = playerCombinedName.split('|');
    
    const playerStats = {
      name: playerName,
      team: playerTeam,
      gamesPlayed: 0,
      points: 0,
      fgMade: 0,
      fgAttempts: 0,
      twoPtMade: 0,
      twoPtAttempts: 0,
      threePtMade: 0,
      threePtAttempts: 0,
      ftMade: 0,
      ftAttempts: 0,
      rebounds: 0,
      assists: 0,
      steals: 0,
      blocks: 0,
      turnovers: 0,
      fouls: 0,
      // Percentages and averages - calculated at the end
      fgPercentage: 0,
      twoPtPercentage: 0,
      threePtPercentage: 0,
      ftPercentage: 0,
      ppg: 0,
      rpg: 0,
      apg: 0,
      spg: 0,
      bpg: 0
    };

    // Track which games the player appeared in
    const gamesWithPlayer = new Set();

    // Process each game
    seasonGames.forEach(game => {
      if (!game.stats) return;

      // Check if player appears in this game
      const playerAppears = game.stats.some(
        stat => stat.player === playerName && stat.team === playerTeam
      );

      if (playerAppears) {
        gamesWithPlayer.add(game.videoId);
      }

      // Aggregate stats
      game.stats.forEach(stat => {
        if (stat.player !== playerName || stat.team !== playerTeam) return;

        switch(stat.type) {
          case 'FG Made':
            playerStats.points += 2;
            playerStats.fgMade += 1;
            playerStats.fgAttempts += 1;
            playerStats.twoPtMade += 1;
            playerStats.twoPtAttempts += 1;
            break;
          case 'FG Missed':
            playerStats.fgAttempts += 1;
            playerStats.twoPtAttempts += 1;
            break;
          case '3PT Made':
            playerStats.points += 3;
            playerStats.threePtMade += 1;
            playerStats.threePtAttempts += 1;
            // Count 3PT attempts as FG attempts
            playerStats.fgMade += 1;
            playerStats.fgAttempts += 1;
            break;
          case '3PT Missed':
            playerStats.threePtAttempts += 1;
            // Count 3PT attempts as FG attempts
            playerStats.fgAttempts += 1;
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
      });
    });

    // Update games played
    playerStats.gamesPlayed = gamesWithPlayer.size;

    // Calculate percentages (avoid division by zero)
    playerStats.fgPercentage = playerStats.fgAttempts > 0 
      ? Number((playerStats.fgMade / playerStats.fgAttempts * 100).toFixed(1)) 
      : 0;
    
    playerStats.twoPtPercentage = playerStats.twoPtAttempts > 0 
      ? Number((playerStats.twoPtMade / playerStats.twoPtAttempts * 100).toFixed(1)) 
      : 0;
    
    playerStats.threePtPercentage = playerStats.threePtAttempts > 0 
      ? Number((playerStats.threePtMade / playerStats.threePtAttempts * 100).toFixed(1)) 
      : 0;
    
    playerStats.ftPercentage = playerStats.ftAttempts > 0 
      ? Number((playerStats.ftMade / playerStats.ftAttempts * 100).toFixed(1)) 
      : 0;

    // Calculate per game averages
    if (playerStats.gamesPlayed > 0) {
      playerStats.ppg = Number((playerStats.points / playerStats.gamesPlayed).toFixed(1));
      playerStats.rpg = Number((playerStats.rebounds / playerStats.gamesPlayed).toFixed(1));
      playerStats.apg = Number((playerStats.assists / playerStats.gamesPlayed).toFixed(1));
      playerStats.spg = Number((playerStats.steals / playerStats.gamesPlayed).toFixed(1));
      playerStats.bpg = Number((playerStats.blocks / playerStats.gamesPlayed).toFixed(1));
    }

    return playerStats;
  };

  // Add a game to the current season
  const goToSavedGames = () => {
    setCurrentPage('saved-games');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-base-200 to-base-100 pt-36">
      {/* Header */}
      <section className="py-12 px-6 text-center relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Season Stats
          </h1>
          <p className="text-lg opacity-70 max-w-xl mx-auto mb-6">
            View aggregated statistics for your basketball seasons.
          </p>
          
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        {/* Season Selection */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* Season List */}
          <div className="w-full md:w-64 lg:w-72">
            <div className="card bg-base-100 shadow-xl overflow-hidden border border-base-200">
              <div className="card-body p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Your Seasons</h2>
                  <button 
                    className="btn btn-sm btn-ghost" 
                    onClick={goToSavedGames}
                    title="Create a new season"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                {seasons.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="opacity-60 mb-4">No seasons yet</p>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={goToSavedGames}
                    >
                      Create Your First Season
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {seasons.map(season => (
                      <div 
                        key={season._id}
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${selectedSeasonId === season._id ? 'bg-primary text-primary-content' : 'hover:bg-base-200'}`}
                        onClick={() => setSelectedSeasonId(season._id)}
                      >
                        <div>
                          <h3 className="font-medium">{season.name}</h3>
                          <p className="text-xs opacity-70">
                            {season.gameIds ? season.gameIds.length : 0} game{season.gameIds && season.gameIds.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <button 
                          className={`btn btn-xs ${selectedSeasonId === season._id ? 'btn-ghost' : 'btn-ghost'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSeason(season._id);
                          }}
                          title="Delete season"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Season details and stats */}
          {!selectedSeason ? (
            <div className="flex flex-col items-center justify-center h-96">
              <p className="text-xl opacity-70">Select a season to view stats</p>
            </div>
          ) : (
            <div className="bg-base-100 rounded-xl shadow-xl p-6 mb-8">
              {/* Season header */}
              <div className="flex flex-wrap justify-between items-center mb-6 pb-4 border-b border-base-300">
                <div className="flex-1">
                  {isEditingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        className="input input-bordered w-full max-w-xs"
                        value={newSeasonName}
                        onChange={(e) => setNewSeasonName(e.target.value)}
                        autoFocus
                      />
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={saveSeasonName}
                      >
                        Save
                      </button>
                      <button 
                        className="btn btn-ghost btn-sm"
                        onClick={() => setIsEditingName(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <h2 className="text-2xl font-bold">{selectedSeason.name}</h2>
                  )}
                  
                  <div className="flex flex-wrap gap-4 mt-2 text-sm opacity-70">
                    <span>
                      {loadingGames ? (
                        <span className="loading loading-spinner loading-xs mr-2"></span>
                      ) : (
                        <span>{seasonGames.length} game{seasonGames.length !== 1 ? 's' : ''}</span>
                      )}
                    </span>
                    <span>
                      Created: {selectedSeason.createdAt ? formatDate(selectedSeason.createdAt) : 'Unknown date'}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {!isEditingName && (
                    <button 
                      className="btn btn-ghost btn-sm"
                      onClick={startEditingName}
                      title="Edit season name"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  )}
                  <button 
                    className="btn btn-ghost btn-sm"
                    onClick={goToSavedGames}
                    title="Add games to this season"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Stats view toggle */}
              <div className="flex justify-between items-center mb-4">
                <div className="btn-group">
                  <button 
                    className={`btn btn-sm ${statsView === 'per-game' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setStatsView('per-game')}
                  >
                    Per Game
                  </button>
                  <button 
                    className={`btn btn-sm ${statsView === 'totals' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setStatsView('totals')}
                  >
                    Totals
                  </button>
                </div>
              </div>
              
              {/* Player stats table */}
              <div className="overflow-x-auto">
                {loadingGames ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="loading loading-spinner loading-lg"></div>
                  </div>
                ) : seasonGames.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-lg opacity-70">No games in this season</p>
                    <button 
                      className="btn btn-primary btn-sm mt-4"
                      onClick={goToSavedGames}
                    >
                      Add Games
                    </button>
                  </div>
                ) : (
                  <table className="table table-zebra w-full">
                    <thead>
                      {getStatsTableHeader()}
                    </thead>
                    <tbody>
                      {getAllPlayers().map(player => getPlayerStatsRow(player))}
                      
                      {getAllPlayers().length === 0 && (
                        <tr>
                          <td colSpan="12" className="text-center py-4">No player stats available</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>
              
              {/* Games in this season */}
              {seasonGames.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xl font-bold mb-4">Games in this Season</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {seasonGames.map(game => (
                      <div key={game.videoId} className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow">
                        <div className="card-body p-4">
                          <h4 className="card-title text-base">{game.title || 'Basketball Game'}</h4>
                          <p className="text-sm opacity-70">{formatDate(game.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
          )}
          
        </div>
         {/* Navigation buttons */}
         <div className="flex justify-center mt-4 space-x-4">
            <button
              onClick={() => setCurrentPage('saved-games')}
              className="btn btn-outline btn-sm px-4 group flex items-center gap-2 hover:gap-3 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Saved Games
            </button>
          </div>
      </div>
    </div>
  );
};

export default SeasonStats; 