import React, { useState, useEffect, useRef } from 'react';
import { useNotification } from './contexts/NotificationContext';
import { useAuth } from './contexts/AuthContext';
import { STATS_ENDPOINTS, STATS_V2_ENDPOINTS, createApiHeaders } from './config/apiConfig';
import { calculateBadges } from './utils/Shotify/badgeCalculator';

const Shotify = ({ setCurrentPage, sharedGame = null }) => {
  const { currentUser } = useAuth();
  const { success, error: showError, info } = useNotification();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState(() => {
    // Select first player from team1 if available, otherwise from team2
    if (sharedGame?.teams?.team1?.players?.length > 0) {
      return sharedGame.teams.team1.players[0];
    } else if (sharedGame?.teams?.team2?.players?.length > 0) {
      return sharedGame.teams.team2.players[0];
    }
    return null;
  });
  const [hasLoadedData, setHasLoadedData] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [expandedSection, setExpandedSection] = useState('stats');
  const loadAttemptRef = useRef(false);

  const loadGameData = () => {
    try {
      // If we have a shared game, use that instead of localStorage
      if (sharedGame) {
        if (!sharedGame.videoId || !sharedGame.teams || !sharedGame.stats) {
          throw new Error('Invalid shared game data format');
        }
        return sharedGame;
      }

      // Otherwise try to load from localStorage
      const rawGameData = localStorage.getItem('analyze-game');
      
      if (!rawGameData) {
        throw new Error('No game data found to analyze');
      }

      const gameData = JSON.parse(rawGameData);
      
      if (!gameData.videoId || !gameData.teams || !gameData.stats) {
        throw new Error('Invalid game data format');
      }

      return gameData;
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    const loadSavedGame = async () => {
      // If we've already attempted to load, don't try again
      if (loadAttemptRef.current) {
        return;
      }
      
      loadAttemptRef.current = true;
      setLoading(true);

      try {
        const gameData = loadGameData();
        setGame(gameData);
        setLoading(false);
        
        // Mark that we've loaded the data
        setHasLoadedData(true);

        // Only clear localStorage after a delay and if we still have the same data
        const timeoutId = setTimeout(() => {
          const currentData = localStorage.getItem('analyze-game');
          if (currentData === JSON.stringify(gameData)) {
            localStorage.removeItem('analyze-game');
          }
        }, 2000); // Increased delay to 2 seconds

        // Cleanup timeout if component unmounts
        return () => clearTimeout(timeoutId);
      } catch (error) {
        if (!hasLoadedData) {
          console.error('Error loading game data:', error);
          setError(error.message);
          showError(error.message);
          setCurrentPage('saved-games');
        }
        setLoading(false);
      }
    };

    loadSavedGame();
  }, [setCurrentPage, showError, hasLoadedData]);

  // Also add an effect to set default player when game loads
  useEffect(() => {
    if (game && !selectedPlayer) {
      if (game.teams.team1.players.length > 0) {
        setSelectedPlayer(game.teams.team1.players[0]);
      } else if (game.teams.team2.players.length > 0) {
        setSelectedPlayer(game.teams.team2.players[0]);
      }
    }
  }, [game]);

  // Copy share link to clipboard
  const copyShareLink = async () => {
    try {
      if (!game.shareId) {
        // Get authentication headers
        const headers = await createApiHeaders(currentUser);
        
        // If no shareId exists, create one by saving the game first
        const response = await fetch(STATS_V2_ENDPOINTS.SHARE_GAME(game.videoId), {
          method: 'POST',
          headers,
          body: JSON.stringify({
            game: {
              ...game,
              createdAt: new Date().toISOString(),
              userId: currentUser?.uid || 'anonymous'
            }
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to generate share link');
        }

        const result = await response.json();
        const shareUrl = `${window.location.origin}/shared/${result.shareId}`;
        await navigator.clipboard.writeText(shareUrl);
        success('Share link copied to clipboard!');
        setShareUrl(shareUrl);
      } else {
        // If shareId exists, use it
        const shareUrl = `${window.location.origin}/shared/${game.shareId}`;
        await navigator.clipboard.writeText(shareUrl);
        success('Share link copied to clipboard!');
        setShareUrl(shareUrl);
      }
    } catch (error) {
      console.error('Share link error:', error);
      showError('Failed to copy share link: ' + error.message);
    }
  };

  const handleSaveToMyAccount = async () => {
    if (!currentUser) {
      info('Please sign in to save this game to your account');
      setCurrentPage('login');
      return;
    }

    try {
      setSaving(true);
      
      // Get authentication headers
      const headers = await createApiHeaders(currentUser);
      
      // If this is a shared game, use the saveSharedGame endpoint
      if (game.shareId) {
        console.log('Saving shared game with ID:', game.shareId);
        console.log('Using endpoint:', STATS_V2_ENDPOINTS.SAVE_SHARED_GAME(game.shareId));
        
        const response = await fetch(STATS_V2_ENDPOINTS.SAVE_SHARED_GAME(game.shareId), {
          method: 'POST',
          headers,
          body: JSON.stringify({
            shareId: game.shareId,
            videoId: game.videoId,
            title: game.title
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          
          let errorMessage;
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || errorData.message || 'Failed to save shared game';
          } catch (e) {
            errorMessage = errorText || 'Failed to save shared game';
          }
          
          throw new Error(errorMessage);
        }

        const result = await response.json();
        success('Game saved successfully to your account!');
        setCurrentPage('saved-games');
        return;
      }

      // Otherwise, proceed with normal game saving logic
      const gameData = {
        ...game,
        userId: currentUser.uid,
        savedAt: new Date().toISOString(),
        videoId: game.videoId,
        videoUrl: `https://www.youtube.com/watch?v=${game.videoId}`,
        teams: {
          team1: {
            name: game.teams.team1.name,
            players: game.teams.team1.players
          },
          team2: {
            name: game.teams.team2.name,
            players: game.teams.team2.players
          }
        },
        stats: game.stats || [],
        title: game.title || 'Basketball Game'
      };

      const response = await fetch(STATS_V2_ENDPOINTS.SAVE_GAME, {
        method: 'POST',
        headers,
        body: JSON.stringify(gameData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        
        let errorMessage;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorData.message || 'Failed to save game';
        } catch (e) {
          errorMessage = errorText || 'Failed to save game';
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      success('Game saved successfully!');
      
      // Clear the game data from localStorage after successful save
      localStorage.removeItem('analyze-game');
      
      // Redirect to saved games
      setCurrentPage('saved-games');
    } catch (err) {
      console.error('Save game error:', err);
      showError(err.message);
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

  // Add this function after getPlayerStats
  const getTeamStats = (teamId) => {
    if (!game || !game.stats) return null;
    
    const teamStats = game.stats.filter(stat => stat.team === teamId);
    const totalPoints = teamStats.reduce((sum, stat) => {
      if (stat.type === 'FG Made') return sum + 2;
      if (stat.type === '3PT Made') return sum + 3;
      if (stat.type === 'FT Made') return sum + 1;
      return sum;
    }, 0);

    const fgAttempts = teamStats.filter(stat => stat.type === 'FG Made' || stat.type === 'FG Missed').length;
    const fgMade = teamStats.filter(stat => stat.type === 'FG Made').length;
    const threePtAttempts = teamStats.filter(stat => stat.type === '3PT Made' || stat.type === '3PT Missed').length;
    const threePtMade = teamStats.filter(stat => stat.type === '3PT Made').length;
    const ftAttempts = teamStats.filter(stat => stat.type === 'FT Made' || stat.type === 'FT Missed').length;
    const ftMade = teamStats.filter(stat => stat.type === 'FT Made').length;

    return {
      points: totalPoints,
      fgMade,
      fgAttempts,
      threePtMade,
      threePtAttempts,
      ftMade,
      ftAttempts,
      rebounds: teamStats.filter(stat => stat.type === 'Rebound').length,
      assists: teamStats.filter(stat => stat.type === 'Assist').length,
      steals: teamStats.filter(stat => stat.type === 'Steal').length,
      blocks: teamStats.filter(stat => stat.type === 'Block').length,
      turnovers: teamStats.filter(stat => stat.type === 'Turnover').length
    };
  };

  // First, define the export configurations
  const EXPORT_CONFIGS = [
    {
      format: 'CSV',
      icon: 'M10 18v-2m4 2v-2m4 2v-2M8 6h13a1 1 0 011 1v10a1 1 0 01-1 1H8a1 1 0 01-1-1V7a1 1 0 011-1z',
      description: 'Raw data export',
      handler: (game) => {
        const csvContent = [
          `Game: ${game.title}`,
          `Date: ${new Date().toLocaleDateString()}\n`,
          'Team Statistics',
          'Team,Points,FG Made,FG Attempts,FG%,3PT Made,3PT Attempts,3PT%,FT Made,FT Attempts,FT%,Rebounds,Assists,Steals,Blocks,Turnovers,Fouls',
          ...['team1', 'team2'].map(teamId => {
            const stats = getTeamStats(teamId);
            return `${game.teams[teamId].name},${[
              stats.points,
              `${stats.fgMade}/${stats.fgAttempts}`,
              `${(stats.fgMade/stats.fgAttempts*100||0).toFixed(1)}%`,
              `${stats.threePtMade}/${stats.threePtAttempts}`,
              `${(stats.threePtMade/stats.threePtAttempts*100||0).toFixed(1)}%`,
              `${stats.ftMade}/${stats.ftAttempts}`,
              `${(stats.ftMade/stats.ftAttempts*100||0).toFixed(1)}%`,
              stats.rebounds,
              stats.assists,
              stats.steals,
              stats.blocks,
              stats.turnovers,
              stats.fouls
            ].join(',')}`;
          }),
          '\nPlayer Statistics',
          'Player,Team,Points,FG Made,FG Attempts,FG%,3PT Made,3PT Attempts,3PT%,FT Made,FT Attempts,FT%,Rebounds,Assists,Steals,Blocks,Turnovers,Fouls',
          ...[...game.teams.team1.players, ...game.teams.team2.players].map(player => {
            const team = game.teams.team1.players.includes(player) ? game.teams.team1.name : game.teams.team2.name;
            const stats = getPlayerStats(player, game.teams.team1.players.includes(player) ? 'team1' : 'team2');
            return `${player},${team},${[
              stats.points,
              `${stats.fgMade}/${stats.fgAttempts}`,
              stats.fgPercentage,
              `${stats.threePtMade}/${stats.threePtAttempts}`,
              stats.threePtPercentage,
              `${stats.ftMade}/${stats.ftAttempts}`,
              stats.ftPercentage,
              stats.rebounds,
              stats.assists,
              stats.steals,
              stats.blocks,
              stats.turnovers,
              stats.fouls
            ].join(',')}`;
          })
        ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${game.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_stats.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    },
    {
      format: 'PDF',
      icon: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      description: 'Detailed report',
      handler: async (game) => {
    const { jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const doc = new jsPDF();
    
        // Add title and date
    doc.setFontSize(20);
    doc.text(game.title, 14, 20);
    doc.setFontSize(12);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Team Statistics
    const team1Stats = getTeamStats('team1');
    const team2Stats = getTeamStats('team2');
    
    autoTable(doc, {
      startY: 45,
      head: [['Team', 'Points', 'FG%', '3P%', 'FT%', 'REB', 'AST', 'STL', 'BLK']],
          body: [game.teams.team1, game.teams.team2].map(team => {
            const stats = getTeamStats(team === game.teams.team1 ? 'team1' : 'team2');
      return [
              team.name,
        stats.points,
              `${((stats.fgMade/stats.fgAttempts)*100||0).toFixed(1)}%`,
              `${((stats.threePtMade/stats.threePtAttempts)*100||0).toFixed(1)}%`,
              `${((stats.ftMade/stats.ftAttempts)*100||0).toFixed(1)}%`,
        stats.rebounds,
        stats.assists,
        stats.steals,
        stats.blocks
      ];
          })
        });
        
    doc.save(`${game.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_stats.pdf`);
      }
    },
    {
      format: 'JSON',
      icon: 'M4 6h16M4 10h16M4 14h16M4 18h16',
      description: 'API compatible',
      handler: (game) => {
        const jsonData = {
          gameInfo: {
            title: game.title,
            date: new Date().toISOString(),
            videoId: game.videoId,
            videoUrl: `https://www.youtube.com/watch?v=${game.videoId}`
          },
          teams: Object.fromEntries(
            ['team1', 'team2'].map(teamId => [
              game.teams[teamId].name,
              {
                stats: getTeamStats(teamId),
                players: game.teams[teamId].players.map(player => ({
                  name: player,
                  ...getPlayerStats(player, teamId)
                }))
              }
            ])
          )
        };

        const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${game.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_stats.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    }
  ];

  // Then simplify the ExportSection component
  const ExportSection = () => (
    <div className="mb-6">
      <h3 className="text-lg font-bold mb-4">Export Formats</h3>
      <div className="grid grid-cols-3 gap-4">
        {EXPORT_CONFIGS.map(({ format, icon, description, handler }, index) => (
          <div 
            key={index} 
            className="bg-base-200/50 p-4 rounded-xl text-center hover:bg-base-200 transition-colors cursor-pointer group/format"
            onClick={() => handler(game)}
          >
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center group-hover/format:bg-primary/20 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={icon} />
              </svg>
            </div>
            <div className="font-medium mb-1">{format}</div>
            <div className="text-xs opacity-60">{description}</div>
            <div className="mt-2 opacity-0 group-hover/format:opacity-100 transition-opacity">
              <div className="h-1 bg-base-300 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-1000 w-0 group-hover/format:w-full"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const getTeamLeaders = (teamId) => {
    if (!game?.teams?.[teamId]) return null;
    
    const statTypes = ['points', 'rebounds', 'assists', 'steals', 'blocks', 
                      'fgPercentage', 'threePtMade', 'turnovers', 'ftPercentage'];
    const leaders = Object.fromEntries(
      statTypes.map(stat => [stat, { value: 0, players: [] }])
    );
    
    game.teams[teamId].players.forEach(player => {
      const stats = getPlayerStats(player, teamId);
      if (!stats) return;
      
      Object.entries(stats).forEach(([stat, value]) => {
        if (leaders[stat] && value > leaders[stat].value) {
          leaders[stat] = { value, players: [player] };
        } else if (leaders[stat] && value === leaders[stat].value) {
          leaders[stat].players.push(player);
        }
      });
    });
    
    return leaders;
  };

  const sortData = (data, key) => {
    if (!key) return data;
    return [...data].sort((a, b) => 
      sortConfig.direction === 'asc' ? a[key] - b[key] : b[key] - a[key]
    );
  };

  // Add this function after getTeamLeaders
  const calculateEfficiency = ({
    fgMade, fgAttempts, threePtMade, threePtAttempts,
    ftMade, ftAttempts, rebounds, assists, steals, blocks,
    turnovers, fouls
  }) => Math.round(
    (fgMade * 2 - fgAttempts) +
    (threePtMade * 3 - threePtAttempts) +
    (ftMade * 2 - ftAttempts) +
    (rebounds * 0.5) +
    (assists * 1.5) +
    ((steals + blocks) * 2) +
    (turnovers * -2) +
    (fouls * -0.5)
  );


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
      {/* Remove the sticky nav header and replace the hero section with this */}
      <section className="relative py-8 mb-8">
        {/* Background gradients */}
        <div className="absolute top-0 -right-64 w-full md:w-[60rem] h-[30rem] bg-primary/5 rounded-full blur-3xl -z-10 transform-gpu"></div>
        <div className="absolute -bottom-32 -left-64 w-full md:w-[60rem] h-[30rem] bg-secondary/5 rounded-full blur-3xl -z-10 transform-gpu"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Back Navigation */}
          <div className="mb-6">
            <button
              onClick={() => setCurrentPage('saved-games')}
              className="group inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg hover:bg-base-200 transition-all"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 group-hover:-translate-x-1 transition-transform" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Games
            </button>
          </div>

          {/* Two Column Layout for Title and Video */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Title and Description */}
            <div className="text-left lg:pr-8">
            <div className="inline-block animate-fadeIn">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3 inline-block">
                Shared Game Stats
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                {game.title}
              </h1>
                <p className="text-base sm:text-lg opacity-70">
                Game statistics for {game.teams.team1.name} vs {game.teams.team2.name}
              </p>
              </div>
            </div>
            
            {/* YouTube Thumbnail */}
            <div className="relative aspect-video rounded-xl shadow-xl border border-base-300 bg-base-100 animate-fadeIn overflow-hidden group">
              <img
                src={`https://img.youtube.com/vi/${game.videoId}/maxresdefault.jpg`}
                alt={game.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.src = `https://img.youtube.com/vi/${game.videoId}/0.jpg`;
                }}
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <button
                  onClick={() => window.open(`https://www.youtube.com/watch?v=${game.videoId}`, '_blank')}
                  className="btn btn-circle btn-lg bg-red-600 hover:bg-red-700 border-none text-white transform-gpu group-hover:scale-110 transition-transform"
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
              
      {/* Main Action Buttons Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Go Back to Saved Games */}
              <button
            onClick={() => setCurrentPage('saved-games')}
            className="group relative flex flex-col items-center gap-4 p-6 rounded-2xl bg-accent/10 hover:bg-accent/20 transition-all duration-300"
          >
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-accent/20 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-1">Back to Games</h3>
              <p className="text-sm opacity-70">Return to library</p>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-accent scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
              </button>
              
          {/* Share Game */}
          <button
            onClick={copyShareLink}
            className="group relative flex flex-col items-center gap-4 p-6 rounded-2xl bg-secondary/10 hover:bg-secondary/20 transition-all duration-300"
          >
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-secondary/20 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-1">Share Game</h3>
              <p className="text-sm opacity-70">Copy link to clipboard</p>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-secondary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
          </button>

          {/* Save to Account */}
              <button
                onClick={handleSaveToMyAccount}
                disabled={saving}
            className="group relative flex flex-col items-center gap-4 p-6 rounded-2xl bg-primary/10 hover:bg-primary/20 transition-all duration-300"
              >
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/20 group-hover:scale-110 transition-transform">
                {saving ? (
                <span className="loading loading-spinner loading-lg text-primary"></span>
                ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                )}
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-1">Save to Library</h3>
              <p className="text-sm opacity-70">Add to your collection</p>
          </div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                </button>
              </div>
            </div>

      {/* Content tabs - Replace the existing tabs code with this */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">
        <div className="flex flex-col sm:flex-row gap-2 justify-center mb-6">
          <button 
            className={`
              btn btn-lg gap-2 flex-1 sm:flex-none min-w-[200px] relative
              ${expandedSection === 'stats' 
                ? 'btn-primary' 
                : 'btn-ghost hover:bg-primary/10'
              }
            `}
            onClick={() => setExpandedSection('stats')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Player Stats
          </button>

          <button 
            className={`
              btn btn-lg gap-2 flex-1 sm:flex-none min-w-[200px]
              ${expandedSection === 'fullStats' 
                ? 'btn-secondary' 
                : 'btn-ghost hover:bg-secondary/10'
              }
            `}
            onClick={() => setExpandedSection('fullStats')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Full Game Stats
          </button>

          <button 
            className={`
              btn btn-lg gap-2 flex-1 sm:flex-none min-w-[200px]
              ${expandedSection === 'timeline' 
                ? 'btn-accent' 
                : 'btn-ghost hover:bg-accent/10'
              }
            `}
            onClick={() => setExpandedSection('timeline')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
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
              <div className="card bg-base-100 shadow-lg border border-base-200 h-full">
                <div className="card-body">
                  <div className="h-16 flex items-center">
                  <h3 className="card-title text-primary">{game.teams.team1.name}</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {game.teams.team1.players.map(player => {
                          const stats = getPlayerStats(player, 'team1');
                          if (!stats) return null;
                      
                      const statsList = [
                        { name: 'PTS', value: stats.points },
                        { name: 'REB', value: stats.rebounds },
                        { name: 'AST', value: stats.assists },
                        { name: 'STL', value: stats.steals },
                        { name: 'BLK', value: stats.blocks }
                      ].sort((a, b) => b.value - a.value).slice(0, 3);
                          
                          return (
                        <div 
                          key={player}
                          className={`relative bg-base-200/50 p-4 rounded-xl cursor-pointer hover:bg-base-200 transition-all ${
                            selectedPlayer === player ? 'ring-2 ring-primary shadow-lg scale-[1.02]' : ''
                          }`}
                                  onClick={() => setSelectedPlayer(selectedPlayer === player ? null : player)}
                                >
                          <div className="flex items-center gap-3 mb-3">
                            {/* Player Avatar */}
                            <div className="avatar placeholder">
                              <div className="bg-neutral text-neutral-content rounded-full w-12 h-12">
                                <span className="text-xl">{player.split(' ').map(n => n[0]).join('')}</span>
                              </div>
                            </div>
                            <div>
                              <div className="font-medium text-lg">{player}</div>
                              <div className="text-xs opacity-70">
                                {game.teams.team1.name}
                              </div>
                            </div>
                          </div>

                          {/* Quick Stats */}
                          <div className="grid grid-cols-3 gap-2 mt-2">
                            {statsList.map((stat, index) => (
                              <div 
                                key={index} 
                                className={`text-center p-2 rounded-lg ${
                                  selectedPlayer === player ? 'bg-base-300/50' : 'bg-base-300/30'
                                }`}
                              >
                                <div className="text-lg font-bold">{stat.value}</div>
                                <div className="text-xs opacity-70">{stat.name}</div>
                              </div>
                            ))}
                          </div>

                          {/* Selection Indicator */}
                          {selectedPlayer === player && (
                            <div className="absolute -top-1 -right-1">
                              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-content">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                          );
                        })}
                  </div>
                </div>
              </div>
              
              {/* Team 2 Card */}
              <div className="card bg-base-100 shadow-lg border border-base-200 h-full">
                <div className="card-body">
                  <div className="h-16 flex items-center">
                  <h3 className="card-title text-secondary">{game.teams.team2.name}</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {game.teams.team2.players.map(player => {
                          const stats = getPlayerStats(player, 'team2');
                          if (!stats) return null;
                      
                      const statsList = [
                        { name: 'PTS', value: stats.points },
                        { name: 'REB', value: stats.rebounds },
                        { name: 'AST', value: stats.assists },
                        { name: 'STL', value: stats.steals },
                        { name: 'BLK', value: stats.blocks }
                      ].sort((a, b) => b.value - a.value).slice(0, 3);
                          
                          return (
                        <div 
                          key={player}
                          className={`relative bg-base-200/50 p-4 rounded-xl cursor-pointer hover:bg-base-200 transition-all ${
                            selectedPlayer === player ? 'ring-2 ring-secondary shadow-lg scale-[1.02]' : ''
                          }`}
                                  onClick={() => setSelectedPlayer(selectedPlayer === player ? null : player)}
                                >
                          <div className="flex items-center gap-3 mb-3">
                            {/* Player Avatar */}
                            <div className="avatar placeholder">
                              <div className="bg-neutral text-neutral-content rounded-full w-12 h-12">
                                <span className="text-xl">{player.split(' ').map(n => n[0]).join('')}</span>
                              </div>
                            </div>
                            <div>
                              <div className="font-medium text-lg">{player}</div>
                              <div className="text-xs opacity-70">
                                {game.teams.team2.name}
                              </div>
                            </div>
                          </div>

                          {/* Quick Stats */}
                          <div className="grid grid-cols-3 gap-2 mt-2">
                            {statsList.map((stat, index) => (
                              <div 
                                key={index} 
                                className={`text-center p-2 rounded-lg ${
                                  selectedPlayer === player ? 'bg-base-300/50' : 'bg-base-300/30'
                                }`}
                              >
                                <div className="text-lg font-bold">{stat.value}</div>
                                <div className="text-xs opacity-70">{stat.name}</div>
                              </div>
                            ))}
                          </div>

                          {/* Selection Indicator */}
                          {selectedPlayer === player && (
                            <div className="absolute -top-1 -right-1">
                              <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center text-secondary-content">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>
                          );
                        })}
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
                    const teamLeaders = getTeamLeaders(player.team);
                    const badges = calculateBadges(stats, teamLeaders);
                    
                    if (!stats || !teamLeaders) return null;
                    
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
                        
                        {/* Progress Charts */}
                        <div className="space-y-4 mb-6">
                          {/* Points */}
                          {stats.points > 0 && (
                            <div className="bg-base-200/50 p-4 rounded-xl">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">Points</span>
                                <span className="text-primary font-bold">{stats.points}</span>
                          </div>
                              <div className="h-2 bg-base-300 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary rounded-full transition-all duration-1000"
                                  style={{ width: `${(stats.points / (teamLeaders.points.value || 1)) * 100}%` }}
                                ></div>
                          </div>
                              <div className="flex justify-between text-xs opacity-60 mt-1">
                                <span>Current: {stats.points}</span>
                                <span>Team High: {teamLeaders.points.players.map(p => p).join(', ')} ({teamLeaders.points.value})</span>
                          </div>
                          </div>
                          )}

                          {/* Field Goal Percentage */}
                          {stats.fgAttempts > 0 && (
                            <div className="bg-base-200/50 p-4 rounded-xl">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">Field Goal %</span>
                                <span className="text-secondary font-bold">{stats.fgPercentage}%</span>
                              </div>
                              <div className="h-2 bg-base-300 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-secondary rounded-full transition-all duration-1000"
                                  style={{ width: `${(stats.fgPercentage / (teamLeaders.fgPercentage.value || 1)) * 100}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-xs opacity-60 mt-1">
                              <span>{stats.fgMade}/{stats.fgAttempts}</span>
                                <span>Team High: {teamLeaders.fgPercentage.players.map(p => p).join(', ')} ({teamLeaders.fgPercentage.value}%)</span>
                            </div>
                          </div>
                          )}

                          {/* Free Throw Percentage */}
                          {stats.ftAttempts > 0 && (
                            <div className="bg-base-200/50 p-4 rounded-xl">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">Free Throw %</span>
                                <span className="text-accent font-bold">{stats.ftPercentage}%</span>
                            </div>
                              <div className="h-2 bg-base-300 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-accent rounded-full transition-all duration-1000"
                                  style={{ width: `${(stats.ftPercentage / (teamLeaders.ftPercentage.value || 1)) * 100}%` }}
                                ></div>
                          </div>
                              <div className="flex justify-between text-xs opacity-60 mt-1">
                              <span>{stats.ftMade}/{stats.ftAttempts}</span>
                                <span>Team High: {teamLeaders.ftPercentage.players.map(p => p).join(', ')} ({teamLeaders.ftPercentage.value}%)</span>
                            </div>
                          </div>
                          )}

                          {/* Three Pointers Made */}
                          {stats.threePtMade > 0 && (
                            <div className="bg-base-200/50 p-4 rounded-xl">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">Three Pointers Made</span>
                                <span className="text-info font-bold">{stats.threePtMade}</span>
                        </div>
                              <div className="h-2 bg-base-300 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-info rounded-full transition-all duration-1000"
                                  style={{ width: `${(stats.threePtMade / (teamLeaders.threePtMade?.value || 1)) * 100}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-xs opacity-60 mt-1">
                                <span>{stats.threePtMade}/{stats.threePtAttempts} ({stats.threePtPercentage}%)</span>
                                <span>Team High: {teamLeaders.threePtMade?.players.map(p => p).join(', ')} ({teamLeaders.threePtMade?.value || 0})</span>
                              </div>
                            </div>
                          )}

                          {/* Rebounds */}
                          {stats.rebounds > 0 && (
                            <div className="bg-base-200/50 p-4 rounded-xl">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">Rebounds</span>
                                <span className="text-success font-bold">{stats.rebounds}</span>
                          </div>
                              <div className="h-2 bg-base-300 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-success rounded-full transition-all duration-1000"
                                  style={{ width: `${(stats.rebounds / (teamLeaders.rebounds.value || 1)) * 100}%` }}
                                ></div>
                          </div>
                              <div className="flex justify-between text-xs opacity-60 mt-1">
                                <span>Current: {stats.rebounds}</span>
                                <span>Team High: {teamLeaders.rebounds.players.map(p => p).join(', ')} ({teamLeaders.rebounds.value})</span>
                          </div>
                            </div>
                          )}

                          {/* Assists */}
                          {stats.assists > 0 && (
                            <div className="bg-base-200/50 p-4 rounded-xl">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">Assists</span>
                                <span className="text-warning font-bold">{stats.assists}</span>
                          </div>
                              <div className="h-2 bg-base-300 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-warning rounded-full transition-all duration-1000"
                                  style={{ width: `${(stats.assists / (teamLeaders.assists.value || 1)) * 100}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-xs opacity-60 mt-1">
                                <span>Current: {stats.assists}</span>
                                <span>Team High: {teamLeaders.assists.players.map(p => p).join(', ')} ({teamLeaders.assists.value})</span>
                              </div>
                            </div>
                          )}

                          {/* Steals */}
                          {stats.steals > 0 && (
                            <div className="bg-base-200/50 p-4 rounded-xl">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">Steals</span>
                                <span className="text-info font-bold">{stats.steals}</span>
                              </div>
                              <div className="h-2 bg-base-300 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-info rounded-full transition-all duration-1000"
                                  style={{ width: `${(stats.steals / (teamLeaders.steals.value || 1)) * 100}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-xs opacity-60 mt-1">
                                <span>Current: {stats.steals}</span>
                                <span>Team High: {teamLeaders.steals.players.map(p => p).join(', ')} ({teamLeaders.steals.value})</span>
                              </div>
                            </div>
                          )}

                          {/* Blocks */}
                          {stats.blocks > 0 && (
                            <div className="bg-base-200/50 p-4 rounded-xl">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">Blocks</span>
                                <span className="text-success font-bold">{stats.blocks}</span>
                              </div>
                              <div className="h-2 bg-base-300 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-success rounded-full transition-all duration-1000"
                                  style={{ width: `${(stats.blocks / (teamLeaders.blocks.value || 1)) * 100}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-xs opacity-60 mt-1">
                                <span>Current: {stats.blocks}</span>
                                <span>Team High: {teamLeaders.blocks.players.map(p => p).join(', ')} ({teamLeaders.blocks.value})</span>
                              </div>
                            </div>
                          )}

                          {/* Turnovers */}
                          {stats.turnovers > 0 && (
                            <div className="bg-base-200/50 p-4 rounded-xl">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium">Turnovers</span>
                                <span className="text-error font-bold">{stats.turnovers}</span>
                              </div>
                              <div className="h-2 bg-base-300 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-error rounded-full transition-all duration-1000"
                                  style={{ width: `${(stats.turnovers / (teamLeaders.turnovers?.value || 1)) * 100}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-xs opacity-60 mt-1">
                                <span>Current: {stats.turnovers}</span>
                                <span>Team High: {teamLeaders.turnovers?.players.map(p => p).join(', ')} ({teamLeaders.turnovers?.value || 0})</span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Achievement Badges */}
                        <div className="relative">
                          <div className="grid grid-cols-4 gap-4">
                            {badges.map((badge, index) => (
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
                                {/* Enhanced Tooltip */}
                                <div className={`absolute ${index >= 4 ? 'top-full' : 'bottom-full'} left-1/2 -translate-x-1/2 ${index >= 4 ? 'mt-2' : 'mb-2'} w-64 p-3 bg-base-300 rounded-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10`}>
                                  <div className="font-medium mb-2">{badge.name} ({badge.level})</div>
                                  <div className="opacity-80 mb-2">{badge.description}</div>
                                  <div className="h-1 bg-base-content/20 rounded-full">
                                    <div 
                                      className="h-full bg-primary rounded-full"
                                      style={{ width: `${badge.progress}%` }}
                                    ></div>
                                  </div>
                                  <div className="mt-1 opacity-60">{badge.progress}% Complete</div>
                                  <div className="mt-2 pt-2 border-t border-base-content/20">
                                    <div className="font-medium">Calculation:</div>
                                    <div className="opacity-80">{badge.metrics}</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                              <div className="relative group flex justify-end">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 cursor-help opacity-50 hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div className="absolute right-0 w-72 p-3 bg-base-300 rounded-lg text-xs opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                  <div className="font-medium mb-2"></div>
                                  {badges.map((badge, index) => (
                                    <div key={index} className="text-right text-xs">
                                      {badge.name}: {badge.metrics}
                                    </div>
                                  ))}
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
                const teamStats = getTeamStats(teamId);
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
                          <div className="stat-value text-2xl">{teamStats.points}</div>
                        </div>
                        <div className="stat bg-base-200/50 p-3 rounded-box">
                          <div className="stat-title text-xs">FG%</div>
                          <div className="stat-value text-2xl">
                            {teamStats.fgMade}/{teamStats.fgAttempts}
                          </div>
                          <div className="stat-desc">{teamStats.fgMade}/{teamStats.fgAttempts}</div>
                        </div>
                        <div className="stat bg-base-200/50 p-3 rounded-box">
                          <div className="stat-title text-xs">3P%</div>
                          <div className="stat-value text-2xl">
                            {teamStats.threePtMade}/{teamStats.threePtAttempts}
                          </div>
                          <div className="stat-desc">{teamStats.threePtMade}/{teamStats.threePtAttempts}</div>
                        </div>
                        <div className="stat bg-base-200/50 p-3 rounded-box">
                          <div className="stat-title text-xs">FT%</div>
                          <div className="stat-value text-2xl">
                            {teamStats.ftMade}/{teamStats.ftAttempts}
                          </div>
                          <div className="stat-desc">{teamStats.ftMade}/{teamStats.ftAttempts}</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="stat bg-base-200/50 p-3 rounded-box">
                          <div className="stat-title text-xs">Rebounds</div>
                          <div className="stat-value text-xl">{teamStats.rebounds}</div>
                        </div>
                        <div className="stat bg-base-200/50 p-3 rounded-box">
                          <div className="stat-title text-xs">Assists</div>
                          <div className="stat-value text-xl">{teamStats.assists}</div>
                        </div>
                        <div className="stat bg-base-200/50 p-3 rounded-box">
                          <div className="stat-title text-xs">Steals</div>
                          <div className="stat-value text-xl">{teamStats.steals}</div>
                        </div>
                        <div className="stat bg-base-200/50 p-3 rounded-box">
                          <div className="stat-title text-xs">Blocks</div>
                          <div className="stat-value text-xl">{teamStats.blocks}</div>
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
                <div className="flex justify-between items-center mb-4">
                  <h3 className="card-title">Detailed Player Statistics</h3>
                </div>

                {/* Team 1 */}
                <div className="mb-8">
                  <h4 className="text-lg font-medium text-primary mb-4">{game.teams.team1.name}</h4>
                <div className="overflow-x-auto">
                  <table className="table table-zebra w-full">
                    <thead>
                      <tr>
                        <th>Player</th>
                          <th onClick={() => {
                            setSortConfig({
                              key: 'points',
                              direction: sortConfig.key === 'points' && sortConfig.direction === 'asc' ? 'desc' : 'asc'
                            });
                          }} className="text-center cursor-pointer hover:bg-base-200">
                            PTS {sortConfig.key === 'points' && (sortConfig.direction === 'desc' ? '↓' : '↑')}
                          </th>
                          <th onClick={() => {
                            setSortConfig({
                              key: 'fgPercentage',
                              direction: sortConfig.key === 'fgPercentage' && sortConfig.direction === 'asc' ? 'desc' : 'asc'
                            });
                          }} className="text-center cursor-pointer hover:bg-base-200">
                            FG {sortConfig.key === 'fgPercentage' && (sortConfig.direction === 'desc' ? '↓' : '↑')}
                          </th>
                          <th onClick={() => {
                            setSortConfig({
                              key: 'threePtPercentage',
                              direction: sortConfig.key === 'threePtPercentage' && sortConfig.direction === 'asc' ? 'desc' : 'asc'
                            });
                          }} className="text-center cursor-pointer hover:bg-base-200">
                            3PT {sortConfig.key === 'threePtPercentage' && (sortConfig.direction === 'desc' ? '↓' : '↑')}
                          </th>
                          <th onClick={() => {
                            setSortConfig({
                              key: 'ftPercentage',
                              direction: sortConfig.key === 'ftPercentage' && sortConfig.direction === 'asc' ? 'desc' : 'asc'
                            });
                          }} className="text-center cursor-pointer hover:bg-base-200">
                            FT {sortConfig.key === 'ftPercentage' && (sortConfig.direction === 'desc' ? '↓' : '↑')}
                          </th>
                          <th onClick={() => {
                            setSortConfig({
                              key: 'rebounds',
                              direction: sortConfig.key === 'rebounds' && sortConfig.direction === 'asc' ? 'desc' : 'asc'
                            });
                          }} className="text-center cursor-pointer hover:bg-base-200">
                            REB {sortConfig.key === 'rebounds' && (sortConfig.direction === 'desc' ? '↓' : '↑')}
                          </th>
                          <th onClick={() => {
                            setSortConfig({
                              key: 'assists',
                              direction: sortConfig.key === 'assists' && sortConfig.direction === 'asc' ? 'desc' : 'asc'
                            });
                          }} className="text-center cursor-pointer hover:bg-base-200">
                            AST {sortConfig.key === 'assists' && (sortConfig.direction === 'desc' ? '↓' : '↑')}
                          </th>
                          <th onClick={() => {
                            setSortConfig({
                              key: 'steals',
                              direction: sortConfig.key === 'steals' && sortConfig.direction === 'asc' ? 'desc' : 'asc'
                            });
                          }} className="text-center cursor-pointer hover:bg-base-200">
                            STL {sortConfig.key === 'steals' && (sortConfig.direction === 'desc' ? '↓' : '↑')}
                          </th>
                          <th onClick={() => {
                            setSortConfig({
                              key: 'blocks',
                              direction: sortConfig.key === 'blocks' && sortConfig.direction === 'asc' ? 'desc' : 'asc'
                            });
                          }} className="text-center cursor-pointer hover:bg-base-200">
                            BLK {sortConfig.key === 'blocks' && (sortConfig.direction === 'desc' ? '↓' : '↑')}
                          </th>
                          <th onClick={() => {
                            setSortConfig({
                              key: 'turnovers',
                              direction: sortConfig.key === 'turnovers' && sortConfig.direction === 'asc' ? 'desc' : 'asc'
                            });
                          }} className="text-center cursor-pointer hover:bg-base-200">
                            TO {sortConfig.key === 'turnovers' && (sortConfig.direction === 'desc' ? '↓' : '↑')}
                          </th>
                      </tr>
                    </thead>
                    <tbody>
                        {sortData(game.teams.team1.players.map(player => ({
                          ...getPlayerStats(player, 'team1'),
                          name: player
                        })), sortConfig.key).map(player => (
                          <tr key={`team1-${player.name}`}>
                            <td className="font-medium">{player.name}</td>
                            <td className="text-center font-medium">{player.points}</td>
                            <td className="text-center">
                              {player.fgMade}/{player.fgAttempts}
                              <br />
                              <span className="text-xs opacity-60">
                                {player.fgPercentage}%
                              </span>
                            </td>
                            <td className="text-center">
                              {player.threePtMade}/{player.threePtAttempts}
                              <br />
                              <span className="text-xs opacity-60">
                                {player.threePtPercentage}%
                              </span>
                            </td>
                            <td className="text-center">
                              {player.ftMade}/{player.ftAttempts}
                              <br />
                              <span className="text-xs opacity-60">
                                {player.ftPercentage}%
                              </span>
                            </td>
                            <td className="text-center">{player.rebounds}</td>
                            <td className="text-center">{player.assists}</td>
                            <td className="text-center">{player.steals}</td>
                            <td className="text-center">{player.blocks}</td>
                            <td className="text-center">{player.turnovers}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Team 2 */}
                <div>
                  <h4 className="text-lg font-medium text-secondary mb-4">{game.teams.team2.name}</h4>
                  <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                      <thead>
                        <tr>
                          <th>Player</th>
                          <th onClick={() => {
                            setSortConfig({
                              key: 'points',
                              direction: sortConfig.key === 'points' && sortConfig.direction === 'asc' ? 'desc' : 'asc'
                            });
                          }} className="text-center cursor-pointer hover:bg-base-200">
                            PTS {sortConfig.key === 'points' && (sortConfig.direction === 'desc' ? '↓' : '↑')}
                          </th>
                          <th onClick={() => {
                            setSortConfig({
                              key: 'fgPercentage',
                              direction: sortConfig.key === 'fgPercentage' && sortConfig.direction === 'asc' ? 'desc' : 'asc'
                            });
                          }} className="text-center cursor-pointer hover:bg-base-200">
                            FG {sortConfig.key === 'fgPercentage' && (sortConfig.direction === 'desc' ? '↓' : '↑')}
                          </th>
                          <th onClick={() => {
                            setSortConfig({
                              key: 'threePtPercentage',
                              direction: sortConfig.key === 'threePtPercentage' && sortConfig.direction === 'asc' ? 'desc' : 'asc'
                            });
                          }} className="text-center cursor-pointer hover:bg-base-200">
                            3PT {sortConfig.key === 'threePtPercentage' && (sortConfig.direction === 'desc' ? '↓' : '↑')}
                          </th>
                          <th onClick={() => {
                            setSortConfig({
                              key: 'ftPercentage',
                              direction: sortConfig.key === 'ftPercentage' && sortConfig.direction === 'asc' ? 'desc' : 'asc'
                            });
                          }} className="text-center cursor-pointer hover:bg-base-200">
                            FT {sortConfig.key === 'ftPercentage' && (sortConfig.direction === 'desc' ? '↓' : '↑')}
                          </th>
                          <th onClick={() => {
                            setSortConfig({
                              key: 'rebounds',
                              direction: sortConfig.key === 'rebounds' && sortConfig.direction === 'asc' ? 'desc' : 'asc'
                            });
                          }} className="text-center cursor-pointer hover:bg-base-200">
                            REB {sortConfig.key === 'rebounds' && (sortConfig.direction === 'desc' ? '↓' : '↑')}
                          </th>
                          <th onClick={() => {
                            setSortConfig({
                              key: 'assists',
                              direction: sortConfig.key === 'assists' && sortConfig.direction === 'asc' ? 'desc' : 'asc'
                            });
                          }} className="text-center cursor-pointer hover:bg-base-200">
                            AST {sortConfig.key === 'assists' && (sortConfig.direction === 'desc' ? '↓' : '↑')}
                          </th>
                          <th onClick={() => {
                            setSortConfig({
                              key: 'steals',
                              direction: sortConfig.key === 'steals' && sortConfig.direction === 'asc' ? 'desc' : 'asc'
                            });
                          }} className="text-center cursor-pointer hover:bg-base-200">
                            STL {sortConfig.key === 'steals' && (sortConfig.direction === 'desc' ? '↓' : '↑')}
                          </th>
                          <th onClick={() => {
                            setSortConfig({
                              key: 'blocks',
                              direction: sortConfig.key === 'blocks' && sortConfig.direction === 'asc' ? 'desc' : 'asc'
                            });
                          }} className="text-center cursor-pointer hover:bg-base-200">
                            BLK {sortConfig.key === 'blocks' && (sortConfig.direction === 'desc' ? '↓' : '↑')}
                          </th>
                          <th onClick={() => {
                            setSortConfig({
                              key: 'turnovers',
                              direction: sortConfig.key === 'turnovers' && sortConfig.direction === 'asc' ? 'desc' : 'asc'
                            });
                          }} className="text-center cursor-pointer hover:bg-base-200">
                            TO {sortConfig.key === 'turnovers' && (sortConfig.direction === 'desc' ? '↓' : '↑')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortData(game.teams.team2.players.map(player => ({
                          ...getPlayerStats(player, 'team2'),
                          name: player
                        })), sortConfig.key).map(player => (
                          <tr key={`team2-${player.name}`}>
                            <td className="font-medium">{player.name}</td>
                            <td className="text-center font-medium">{player.points}</td>
                            <td className="text-center">
                              {player.fgMade}/{player.fgAttempts}
                              <br />
                              <span className="text-xs opacity-60">
                                {player.fgPercentage}%
                              </span>
                            </td>
                            <td className="text-center">
                              {player.threePtMade}/{player.threePtAttempts}
                              <br />
                              <span className="text-xs opacity-60">
                                {player.threePtPercentage}%
                              </span>
                            </td>
                            <td className="text-center">
                              {player.ftMade}/{player.ftAttempts}
                              <br />
                              <span className="text-xs opacity-60">
                                {player.ftPercentage}%
                              </span>
                            </td>
                            <td className="text-center">{player.rebounds}</td>
                            <td className="text-center">{player.assists}</td>
                            <td className="text-center">{player.steals}</td>
                            <td className="text-center">{player.blocks}</td>
                            <td className="text-center">{player.turnovers}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            </div>

            {/* Replace the old export button with the new ExportSection */}
            <ExportSection />
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
        {!currentUser && (
        <div className="text-center mt-12">
          <h3 className="text-xl font-bold mb-3">Want to track your own games?</h3>
          <p className="opacity-70 mb-6">Sign up for free and start tracking basketball stats with Shotify</p>
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
        )}

        
      </div>
    </div>
  );
};

export default Shotify; 