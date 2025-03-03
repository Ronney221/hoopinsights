import React, { useState, useEffect } from 'react';
import { useNotification } from './contexts/NotificationContext';
import { useAuth } from './contexts/AuthContext';
import { STATS_ENDPOINTS, STATS_V2_ENDPOINTS, createApiHeaders } from './config/apiConfig';

const HoopInsights = ({ setCurrentPage }) => {
  const { currentUser } = useAuth();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [saving, setSaving] = useState(false);
  const [expandedSection, setExpandedSection] = useState('stats'); // 'stats' or 'timeline' or 'fullStats'
  const { success, error: notificationError, warning, info } = useNotification();

  useEffect(() => {
    const loadGameData = () => {
      try {
        setLoading(true);
        const gameData = JSON.parse(localStorage.getItem('hoopinsights-game'));
        
        if (!gameData) {
          throw new Error('No game data found');
        }
        
        setGame(gameData);
      } catch (err) {
        console.error('Error loading game data:', err);
        setError(err.message || 'Failed to load game data');
        notificationError(err.message || 'Failed to load game data');
      } finally {
        setLoading(false);
      }
    };

    loadGameData();
  }, []);

  const handleSaveToMyAccount = async () => {
    if (!currentUser) {
      info('Please sign in to save this game to your account');
      setCurrentPage('login');
      return;
    }

    try {
      setSaving(true);
      
      // Prepare the game data with all required fields
      const gameData = {
        ...game,
        userId: currentUser.uid,
        savedAt: new Date().toISOString(),
        internalId: game.videoId || game.internalId,
        youtubeId: game.videoId || game.youtubeId,
        videoId: game.videoId,
        videoUrl: `https://www.youtube.com/watch?v=${game.videoId}`,
        teams: game.teams || {
          team1: { name: 'Team 1', players: [] },
          team2: { name: 'Team 2', players: [] }
        },
        stats: game.stats || [],
        title: game.title || 'Basketball Game'
      };

      // Log the request data for debugging
      console.log('Saving game data:', gameData);

      const response = await fetch(`${STATS_V2_ENDPOINTS.BASE_URL}/saveSharedGame/${game.shareId}`, {
        method: 'POST',
        headers: await createApiHeaders(currentUser),
        body: JSON.stringify({ game: gameData })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save game to your account');
      }

      const result = await response.json();
      success(result.message || 'Game saved to your account successfully!');
      
      // Redirect to the saved games page
      setCurrentPage('saved-games');
    } catch (err) {
      console.error('Error saving shared game:', err);
      notificationError(err.message || 'Failed to save game to your account');
    } finally {
      setSaving(false);
    }
  };

  // Helper function to get player statistics
  const getPlayerStats = (playerName, teamId) => {
    if (!game || !game.stats) return null;
    
    const playerStats = {
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
      fouls: 0,
      // Percentages
      fgPercentage: 0,
      threePtPercentage: 0,
      ftPercentage: 0
    };
    
    game.stats.forEach(stat => {
      if (stat.player === playerName && stat.team === teamId) {
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
            playerStats.fgMade += 1;
            playerStats.fgAttempts += 1;
            break;
          case '3PT Missed':
            playerStats.threePtAttempts += 1;
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
      }
    });
    
    // Calculate percentages
    playerStats.fgPercentage = playerStats.fgAttempts > 0 
      ? Math.round((playerStats.fgMade / playerStats.fgAttempts) * 100) 
      : 0;
    
    playerStats.threePtPercentage = playerStats.threePtAttempts > 0 
      ? Math.round((playerStats.threePtMade / playerStats.threePtAttempts) * 100) 
      : 0;
    
    playerStats.ftPercentage = playerStats.ftAttempts > 0 
      ? Math.round((playerStats.ftMade / playerStats.ftAttempts) * 100) 
      : 0;
    
    return playerStats;
  };

  // Get all players with stats
  const getAllPlayers = () => {
    if (!game || !game.teams) return [];
    
    const allPlayers = [];
    
    if (game.teams.team1 && game.teams.team1.players) {
      game.teams.team1.players.forEach(player => {
        allPlayers.push({
          name: player,
          team: 'team1',
          teamName: game.teams.team1.name
        });
      });
    }
    
    if (game.teams.team2 && game.teams.team2.players) {
      game.teams.team2.players.forEach(player => {
        allPlayers.push({
          name: player,
          team: 'team2',
          teamName: game.teams.team2.name
        });
      });
    }
    
    return allPlayers;
  };

  // Copy share link to clipboard
  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/shared/${game.shareId}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => success('Share link copied to clipboard!'))
      .catch(() => notificationError('Failed to copy link'));
  };

  // Add this function after getPlayerStats
  const getTeamStats = (teamId) => {
    if (!game || !game.stats) return null;
    
    const teamStats = {
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
    
    game.stats.forEach(stat => {
      if (stat.team === teamId) {
        switch(stat.type) {
          case 'FG Made':
            teamStats.points += 2;
            teamStats.fgMade += 1;
            teamStats.fgAttempts += 1;
            break;
          case 'FG Missed':
            teamStats.fgAttempts += 1;
            break;
          case '3PT Made':
            teamStats.points += 3;
            teamStats.threePtMade += 1;
            teamStats.threePtAttempts += 1;
            teamStats.fgMade += 1;
            teamStats.fgAttempts += 1;
            break;
          case '3PT Missed':
            teamStats.threePtAttempts += 1;
            teamStats.fgAttempts += 1;
            break;
          case 'FT Made':
            teamStats.points += 1;
            teamStats.ftMade += 1;
            teamStats.ftAttempts += 1;
            break;
          case 'FT Missed':
            teamStats.ftAttempts += 1;
            break;
          case 'Rebound':
            teamStats.rebounds += 1;
            break;
          case 'Assist':
            teamStats.assists += 1;
            break;
          case 'Steal':
            teamStats.steals += 1;
            break;
          case 'Block':
            teamStats.blocks += 1;
            break;
          case 'Turnover':
            teamStats.turnovers += 1;
            break;
          case 'Foul':
            teamStats.fouls += 1;
            break;
        }
      }
    });
    
    return teamStats;
  };

  const exportToCSV = () => {
    // Prepare data for both teams
    const team1Stats = getTeamStats('team1');
    const team2Stats = getTeamStats('team2');
    const team1Players = game.teams.team1.players.map(player => ({
      name: player,
      team: game.teams.team1.name,
      ...getPlayerStats(player, 'team1')
    }));
    const team2Players = game.teams.team2.players.map(player => ({
      name: player,
      team: game.teams.team2.name,
      ...getPlayerStats(player, 'team2')
    }));

    // Create CSV content
    let csvContent = "Game: " + game.title + "\n";
    csvContent += "Date: " + new Date().toLocaleDateString() + "\n\n";
    
    // Team Statistics
    csvContent += "Team Statistics\n";
    csvContent += "Team,Points,FG Made,FG Attempts,FG%,3PT Made,3PT Attempts,3PT%,FT Made,FT Attempts,FT%,Rebounds,Assists,Steals,Blocks,Turnovers,Fouls\n";
    
    [
      { name: game.teams.team1.name, stats: team1Stats },
      { name: game.teams.team2.name, stats: team2Stats }
    ].forEach(team => {
      const stats = team.stats;
      csvContent += `${team.name},${stats.points},${stats.fgMade},${stats.fgAttempts},${(stats.fgMade/stats.fgAttempts*100||0).toFixed(1)}%,${stats.threePtMade},${stats.threePtAttempts},${(stats.threePtMade/stats.threePtAttempts*100||0).toFixed(1)}%,${stats.ftMade},${stats.ftAttempts},${(stats.ftMade/stats.ftAttempts*100||0).toFixed(1)}%,${stats.rebounds},${stats.assists},${stats.steals},${stats.blocks},${stats.turnovers},${stats.fouls}\n`;
    });
    
    // Player Statistics
    csvContent += "\nPlayer Statistics\n";
    csvContent += "Player,Team,Points,FG Made,FG Attempts,FG%,3PT Made,3PT Attempts,3PT%,FT Made,FT Attempts,FT%,Rebounds,Assists,Steals,Blocks,Turnovers,Fouls\n";
    
    [...team1Players, ...team2Players].forEach(player => {
      csvContent += `${player.name},${player.team},${player.points},${player.fgMade},${player.fgAttempts},${player.fgPercentage}%,${player.threePtMade},${player.threePtAttempts},${player.threePtPercentage}%,${player.ftMade},${player.ftAttempts},${player.ftPercentage}%,${player.rebounds},${player.assists},${player.steals},${player.blocks},${player.turnovers},${player.fouls}\n`;
    });

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${game.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_stats.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100 pt-32">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
          <h2 className="text-xl font-medium">Loading shared game...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100 pt-32">
        <div className="card bg-base-100 shadow-xl max-w-md mx-auto">
          <div className="card-body text-center">
            <div className="text-error text-5xl mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Game Not Found</h2>
            <p className="mb-6">{error}</p>
            <button
              className="btn btn-primary"
              onClick={() => setCurrentPage('home')}
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100 pt-32">
        <div className="card bg-base-100 shadow-xl max-w-md mx-auto">
          <div className="card-body text-center">
            <h2 className="text-2xl font-bold mb-2">Game Not Found</h2>
            <p className="mb-6">This shared game could not be loaded.</p>
            <button
              className="btn btn-primary"
              onClick={() => setCurrentPage('home')}
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 pb-12">
      {/* Hero section with YouTube thumbnail */}
      <section className="relative py-20 sm:py-24 md:py-28 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 -right-64 w-full md:w-[60rem] h-[30rem] bg-primary/5 rounded-full blur-3xl -z-10 transform-gpu"></div>
        <div className="absolute -bottom-32 -left-64 w-full md:w-[60rem] h-[30rem] bg-secondary/5 rounded-full blur-3xl -z-10 transform-gpu"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <div className="inline-block animate-fadeIn">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3 inline-block">
                Shared Game Stats
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                {game.title}
              </h1>
              <p className="text-base sm:text-lg opacity-70 max-w-2xl mx-auto">
                Game statistics for {game.teams.team1.name} vs {game.teams.team2.name}
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <button
                onClick={copyShareLink}
                className="btn btn-outline btn-sm gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Copy Share Link
              </button>
              
              <button
                onClick={() => window.open(`https://www.youtube.com/watch?v=${game.videoId}`, '_blank')}
                className="btn btn-outline btn-accent btn-sm gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Watch on YouTube
              </button>
              
              <button
                onClick={handleSaveToMyAccount}
                className="btn btn-primary btn-sm gap-2"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Save to My Account
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* YouTube Thumbnail */}
          <div className="relative mx-auto max-w-3xl overflow-hidden rounded-xl shadow-xl border border-base-300 bg-base-100 animate-fadeIn">
            <div className="relative aspect-video">
              <img
                src={`https://img.youtube.com/vi/${game.videoId}/maxresdefault.jpg`}
                alt={game.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to lower resolution if HD thumbnail is not available
                  e.target.src = `https://img.youtube.com/vi/${game.videoId}/0.jpg`;
                }}
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <button
                  onClick={() => window.open(`https://www.youtube.com/watch?v=${game.videoId}`, '_blank')}
                  className="btn btn-circle btn-lg bg-red-600 hover:bg-red-700 border-none text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">
        <div className="tabs tabs-boxed justify-center bg-base-200/50 p-1 rounded-box mb-6">
          <button 
            className={`tab ${expandedSection === 'stats' ? 'tab-active' : ''}`}
            onClick={() => setExpandedSection('stats')}
          >
            Player Stats
          </button>
          <button 
            className={`tab ${expandedSection === 'fullStats' ? 'tab-active' : ''}`}
            onClick={() => setExpandedSection('fullStats')}
          >
            Full Game Stats
          </button>
          <button 
            className={`tab ${expandedSection === 'timeline' ? 'tab-active' : ''}`}
            onClick={() => setExpandedSection('timeline')}
          >
            Game Timeline
          </button>
        </div>

        {/* Player Stats Section */}
        {expandedSection === 'stats' && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-center">Player Statistics</h2>
            
            {/* Team cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Team 1 Card */}
              <div className="card bg-base-100 shadow-lg border border-base-200">
                <div className="card-body">
                  <h3 className="card-title text-primary">{game.teams.team1.name}</h3>
                  <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                      <thead>
                        <tr>
                          <th>Player</th>
                          <th>PTS</th>
                          <th>REB</th>
                          <th>AST</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {game.teams.team1.players.map(player => {
                          const stats = getPlayerStats(player, 'team1');
                          if (!stats) return null;
                          
                          return (
                            <tr key={player} className={selectedPlayer === player ? 'bg-primary/10' : ''}>
                              <td className="font-medium">{player}</td>
                              <td>{stats.points}</td>
                              <td>{stats.rebounds}</td>
                              <td>{stats.assists}</td>
                              <td>
                                <button 
                                  className="btn btn-xs btn-ghost"
                                  onClick={() => setSelectedPlayer(selectedPlayer === player ? null : player)}
                                >
                                  {selectedPlayer === player ? 'Hide' : 'Details'}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              
              {/* Team 2 Card */}
              <div className="card bg-base-100 shadow-lg border border-base-200">
                <div className="card-body">
                  <h3 className="card-title text-secondary">{game.teams.team2.name}</h3>
                  <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                      <thead>
                        <tr>
                          <th>Player</th>
                          <th>PTS</th>
                          <th>REB</th>
                          <th>AST</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {game.teams.team2.players.map(player => {
                          const stats = getPlayerStats(player, 'team2');
                          if (!stats) return null;
                          
                          return (
                            <tr key={player} className={selectedPlayer === player ? 'bg-secondary/10' : ''}>
                              <td className="font-medium">{player}</td>
                              <td>{stats.points}</td>
                              <td>{stats.rebounds}</td>
                              <td>{stats.assists}</td>
                              <td>
                                <button 
                                  className="btn btn-xs btn-ghost"
                                  onClick={() => setSelectedPlayer(selectedPlayer === player ? null : player)}
                                >
                                  {selectedPlayer === player ? 'Hide' : 'Details'}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Selected Player Details */}
            {selectedPlayer && (
              <div className="card bg-base-100 shadow-lg border border-base-200 mb-6 animate-fadeIn">
                <div className="card-body">
                  {getAllPlayers().map(player => {
                    if (player.name !== selectedPlayer) return null;
                    
                    const stats = getPlayerStats(player.name, player.team);
                    if (!stats) return null;
                    
                    return (
                      <div key={player.name}>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xl font-bold">
                            {player.name} 
                            <span className="text-sm font-normal ml-2 opacity-70">
                              ({player.teamName})
                            </span>
                          </h3>
                          <button 
                            className="btn btn-sm btn-ghost"
                            onClick={() => setSelectedPlayer(null)}
                          >
                            Close
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                          <div className="stat bg-base-200/50 p-3 rounded-box">
                            <div className="stat-title text-xs">Points</div>
                            <div className="stat-value text-2xl">{stats.points}</div>
                          </div>
                          <div className="stat bg-base-200/50 p-3 rounded-box">
                            <div className="stat-title text-xs">Rebounds</div>
                            <div className="stat-value text-2xl">{stats.rebounds}</div>
                          </div>
                          <div className="stat bg-base-200/50 p-3 rounded-box">
                            <div className="stat-title text-xs">Assists</div>
                            <div className="stat-value text-2xl">{stats.assists}</div>
                          </div>
                          <div className="stat bg-base-200/50 p-3 rounded-box">
                            <div className="stat-title text-xs">Steals</div>
                            <div className="stat-value text-2xl">{stats.steals}</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="bg-base-200/50 p-3 rounded-box">
                            <div className="text-sm font-medium">Field Goals</div>
                            <div className="flex justify-between mt-1">
                              <span>{stats.fgMade}/{stats.fgAttempts}</span>
                              <span className={stats.fgPercentage >= 50 ? 'text-success' : stats.fgPercentage <= 30 ? 'text-error' : ''}>
                                {stats.fgPercentage}%
                              </span>
                            </div>
                          </div>
                          <div className="bg-base-200/50 p-3 rounded-box">
                            <div className="text-sm font-medium">3-Pointers</div>
                            <div className="flex justify-between mt-1">
                              <span>{stats.threePtMade}/{stats.threePtAttempts}</span>
                              <span className={stats.threePtPercentage >= 40 ? 'text-success' : stats.threePtPercentage <= 25 ? 'text-error' : ''}>
                                {stats.threePtPercentage}%
                              </span>
                            </div>
                          </div>
                          <div className="bg-base-200/50 p-3 rounded-box">
                            <div className="text-sm font-medium">Free Throws</div>
                            <div className="flex justify-between mt-1">
                              <span>{stats.ftMade}/{stats.ftAttempts}</span>
                              <span className={stats.ftPercentage >= 75 ? 'text-success' : stats.ftPercentage <= 50 ? 'text-error' : ''}>
                                {stats.ftPercentage}%
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                          <div className="bg-base-200/50 p-3 rounded-box">
                            <div className="text-sm font-medium">Blocks</div>
                            <div className="mt-1">{stats.blocks}</div>
                          </div>
                          <div className="bg-base-200/50 p-3 rounded-box">
                            <div className="text-sm font-medium">Turnovers</div>
                            <div className="mt-1">{stats.turnovers}</div>
                          </div>
                          <div className="bg-base-200/50 p-3 rounded-box">
                            <div className="text-sm font-medium">Fouls</div>
                            <div className="mt-1">{stats.fouls}</div>
                          </div>
                          <div className="bg-base-200/50 p-3 rounded-box">
                            <div className="text-sm font-medium">Efficiency</div>
                            <div className="mt-1">
                              {stats.points + stats.rebounds + stats.assists + stats.steals + stats.blocks - (stats.fgAttempts - stats.fgMade) - (stats.ftAttempts - stats.ftMade) - stats.turnovers}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Full Game Stats Section */}
        {expandedSection === 'fullStats' && (
          <section className="mb-10 animate-fadeIn">
            <h2 className="text-2xl font-bold mb-4 text-center">Full Game Statistics</h2>
            
            {/* Team Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {['team1', 'team2'].map((teamId) => {
                const stats = getTeamStats(teamId);
                const teamName = game.teams[teamId].name;
                const isTeam1 = teamId === 'team1';
                
                return (
                  <div key={teamId} className="card bg-base-100 shadow-lg border border-base-200">
                    <div className="card-body">
                      <h3 className={`card-title ${isTeam1 ? 'text-primary' : 'text-secondary'}`}>
                        {teamName}
                      </h3>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                        <div className="stat bg-base-200/50 p-3 rounded-box">
                          <div className="stat-title text-xs">Points</div>
                          <div className="stat-value text-2xl">{stats.points}</div>
                        </div>
                        <div className="stat bg-base-200/50 p-3 rounded-box">
                          <div className="stat-title text-xs">FG%</div>
                          <div className="stat-value text-2xl">
                            {((stats.fgMade / stats.fgAttempts) * 100 || 0).toFixed(1)}%
                          </div>
                          <div className="stat-desc">{stats.fgMade}/{stats.fgAttempts}</div>
                        </div>
                        <div className="stat bg-base-200/50 p-3 rounded-box">
                          <div className="stat-title text-xs">3P%</div>
                          <div className="stat-value text-2xl">
                            {((stats.threePtMade / stats.threePtAttempts) * 100 || 0).toFixed(1)}%
                          </div>
                          <div className="stat-desc">{stats.threePtMade}/{stats.threePtAttempts}</div>
                        </div>
                        <div className="stat bg-base-200/50 p-3 rounded-box">
                          <div className="stat-title text-xs">FT%</div>
                          <div className="stat-value text-2xl">
                            {((stats.ftMade / stats.ftAttempts) * 100 || 0).toFixed(1)}%
                          </div>
                          <div className="stat-desc">{stats.ftMade}/{stats.ftAttempts}</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="stat bg-base-200/50 p-3 rounded-box">
                          <div className="stat-title text-xs">Rebounds</div>
                          <div className="stat-value text-xl">{stats.rebounds}</div>
                        </div>
                        <div className="stat bg-base-200/50 p-3 rounded-box">
                          <div className="stat-title text-xs">Assists</div>
                          <div className="stat-value text-xl">{stats.assists}</div>
                        </div>
                        <div className="stat bg-base-200/50 p-3 rounded-box">
                          <div className="stat-title text-xs">Steals</div>
                          <div className="stat-value text-xl">{stats.steals}</div>
                        </div>
                        <div className="stat bg-base-200/50 p-3 rounded-box">
                          <div className="stat-title text-xs">Blocks</div>
                          <div className="stat-value text-xl">{stats.blocks}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Detailed Player Stats */}
            <div className="card bg-base-100 shadow-lg border border-base-200 mb-8">
              <div className="card-body">
                <h3 className="card-title mb-4">Detailed Player Statistics</h3>
                <div className="overflow-x-auto">
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr>
                        <th>Player</th>
                        <th>Team</th>
                        <th className="text-center">PTS</th>
                        <th className="text-center">FG</th>
                        <th className="text-center">3PT</th>
                        <th className="text-center">FT</th>
                        <th className="text-center">REB</th>
                        <th className="text-center">AST</th>
                        <th className="text-center">STL</th>
                        <th className="text-center">BLK</th>
                        <th className="text-center">TO</th>
                        <th className="text-center">+/-</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Team 1 Players */}
                      {game.teams.team1.players.map(player => {
                        const stats = getPlayerStats(player, 'team1');
                        const efficiency = stats.points + stats.rebounds + stats.assists + 
                                        stats.steals + stats.blocks - 
                                        (stats.fgAttempts - stats.fgMade) - 
                                        (stats.ftAttempts - stats.ftMade) - 
                                        stats.turnovers;
                        return (
                          <tr key={`team1-${player}`}>
                            <td className="font-medium">{player}</td>
                            <td className="text-primary">{game.teams.team1.name}</td>
                            <td className="text-center font-medium">{stats.points}</td>
                            <td className="text-center">
                              {stats.fgMade}/{stats.fgAttempts}
                              <br />
                              <span className="text-xs opacity-60">
                                {stats.fgPercentage}%
                              </span>
                            </td>
                            <td className="text-center">
                              {stats.threePtMade}/{stats.threePtAttempts}
                              <br />
                              <span className="text-xs opacity-60">
                                {stats.threePtPercentage}%
                              </span>
                            </td>
                            <td className="text-center">
                              {stats.ftMade}/{stats.ftAttempts}
                              <br />
                              <span className="text-xs opacity-60">
                                {stats.ftPercentage}%
                              </span>
                            </td>
                            <td className="text-center">{stats.rebounds}</td>
                            <td className="text-center">{stats.assists}</td>
                            <td className="text-center">{stats.steals}</td>
                            <td className="text-center">{stats.blocks}</td>
                            <td className="text-center">{stats.turnovers}</td>
                            <td className={`text-center font-medium ${
                              efficiency > 0 ? 'text-success' : 
                              efficiency < 0 ? 'text-error' : ''
                            }`}>
                              {efficiency > 0 ? '+' : ''}{efficiency}
                            </td>
                          </tr>
                        );
                      })}
                      
                      {/* Team 2 Players */}
                      {game.teams.team2.players.map(player => {
                        const stats = getPlayerStats(player, 'team2');
                        const efficiency = stats.points + stats.rebounds + stats.assists + 
                                        stats.steals + stats.blocks - 
                                        (stats.fgAttempts - stats.fgMade) - 
                                        (stats.ftAttempts - stats.ftMade) - 
                                        stats.turnovers;
                        return (
                          <tr key={`team2-${player}`}>
                            <td className="font-medium">{player}</td>
                            <td className="text-secondary">{game.teams.team2.name}</td>
                            <td className="text-center font-medium">{stats.points}</td>
                            <td className="text-center">
                              {stats.fgMade}/{stats.fgAttempts}
                              <br />
                              <span className="text-xs opacity-60">
                                {stats.fgPercentage}%
                              </span>
                            </td>
                            <td className="text-center">
                              {stats.threePtMade}/{stats.threePtAttempts}
                              <br />
                              <span className="text-xs opacity-60">
                                {stats.threePtPercentage}%
                              </span>
                            </td>
                            <td className="text-center">
                              {stats.ftMade}/{stats.ftAttempts}
                              <br />
                              <span className="text-xs opacity-60">
                                {stats.ftPercentage}%
                              </span>
                            </td>
                            <td className="text-center">{stats.rebounds}</td>
                            <td className="text-center">{stats.assists}</td>
                            <td className="text-center">{stats.steals}</td>
                            <td className="text-center">{stats.blocks}</td>
                            <td className="text-center">{stats.turnovers}</td>
                            <td className={`text-center font-medium ${
                              efficiency > 0 ? 'text-success' : 
                              efficiency < 0 ? 'text-error' : ''
                            }`}>
                              {efficiency > 0 ? '+' : ''}{efficiency}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Export Button */}
            <div className="text-center">
              <button
                onClick={exportToCSV}
                className="btn btn-primary gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export as CSV
              </button>
            </div>
          </section>
        )}

        {/* Game Timeline */}
        {expandedSection === 'timeline' && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-center">Game Timeline</h2>
            
            <div className="card bg-base-100 shadow-lg border border-base-200">
              <div className="card-body">
                <div className="overflow-x-auto">
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr>
                        <th>Time</th>
                        <th>Team</th>
                        <th>Player</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {game.stats.sort((a, b) => a.timestamp - b.timestamp).map(stat => (
                        <tr key={stat.id}>
                          <td className="font-mono">{stat.formattedTime}</td>
                          <td>{game.teams[stat.team].name}</td>
                          <td>{stat.player}</td>
                          <td>
                            <span className={`
                              ${stat.type.includes('Made') ? 'text-success' : ''}
                              ${stat.type.includes('Missed') ? 'text-error' : ''}
                              ${stat.type === 'Turnover' || stat.type === 'Foul' ? 'text-warning' : ''}
                            `}>
                              {stat.type}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {game.stats.length === 0 && (
                        <tr>
                          <td colSpan="4" className="text-center py-4">No stats recorded for this game</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        )}
        
        {/* Call to Action */}
        <div className="text-center mt-12">
          <h3 className="text-xl font-bold mb-3">Want to track your own games?</h3>
          <p className="opacity-70 mb-6">Sign up for free and start tracking basketball stats with HoopInsights</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => setCurrentPage('register')}
              className="btn btn-primary"
            >
              Create Free Account
            </button>
            <button 
              onClick={() => setCurrentPage('youtube')}
              className="btn btn-outline"
            >
              Try Game Tracker
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HoopInsights; 