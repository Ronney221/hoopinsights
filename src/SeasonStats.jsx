import React, { useState, useEffect } from 'react';
import { useNotification } from './contexts/NotificationContext';
import { useAuth } from './contexts/AuthContext';
import { formatDate } from './utils/dateUtils';
import { SEASON_ENDPOINTS, STATS_V2_ENDPOINTS, createApiHeaders } from './config/apiConfig';

const SeasonStats = ({ setCurrentPage }) => {
  const { currentUser } = useAuth();
  const { success, error: showError, warning, info } = useNotification();
  const [seasons, setSeasons] = useState([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newSeasonName, setNewSeasonName] = useState('');
  const [statsView, setStatsView] = useState('per-game');
  const [loading, setLoading] = useState(true);
  const [seasonGames, setSeasonGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(false);
  const [timeframe, setTimeframe] = useState('month'); // 'week', 'month', 'season'
  const [showAdvancedStats, setShowAdvancedStats] = useState(false);

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
      } catch (err) {
        console.error('Error fetching seasons:', err);
        showError('Failed to load seasons');
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
      } catch (err) {
        console.error('Error fetching season games:', err);
        showError('Failed to load season games');
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
      info('Please sign in to edit seasons');
      return;
    }
    
    if (!newSeasonName.trim()) {
      info('Season name cannot be empty');
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
      success('Season name updated');
    } catch (err) {
      console.error('Error updating season:', err);
      showError('Failed to update season: ' + err.message);
    }
  };

  // Delete a season
  const deleteSeason = async (seasonId) => {
    if (!currentUser) {
      info('Please sign in to delete seasons');
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
      
      success('Season deleted');
    } catch (err) {
      console.error('Error deleting season:', err);
      showError('Failed to delete season: ' + err.message);
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

  // Add this helper function after the goToSavedGames function
  const getTeamStats = (game, teamId) => {
    if (!game || !game.stats) return {
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

  // Add this helper function to calculate win/loss record
  const getSeasonRecord = (games) => {
    return games.reduce((record, game) => {
      const team1Stats = getTeamStats(game, 'team1');
      const team2Stats = getTeamStats(game, 'team2');
      if (team1Stats.points > team2Stats.points) {
        record.wins++;
      } else if (team1Stats.points < team2Stats.points) {
        record.losses++;
      }
      return record;
    }, { wins: 0, losses: 0 });
  };

  // Add this helper function to calculate streaks
  const getStreaks = (games) => {
    let currentStreak = 0;
    let longestWinStreak = 0;
    let longestLoseStreak = 0;
    let currentType = null;

    games.forEach(game => {
      const team1Stats = getTeamStats(game, 'team1');
      const team2Stats = getTeamStats(game, 'team2');
      const isWin = team1Stats.points > team2Stats.points;

      if (currentType === null) {
        currentType = isWin;
        currentStreak = 1;
      } else if (currentType === isWin) {
        currentStreak++;
      } else {
        if (currentType) {
          longestWinStreak = Math.max(longestWinStreak, currentStreak);
        } else {
          longestLoseStreak = Math.max(longestLoseStreak, currentStreak);
        }
        currentType = isWin;
        currentStreak = 1;
      }
    });

    // Check final streak
    if (currentType !== null) {
      if (currentType) {
        longestWinStreak = Math.max(longestWinStreak, currentStreak);
      } else {
        longestLoseStreak = Math.max(longestLoseStreak, currentStreak);
      }
    }

    return {
      longestWinStreak,
      longestLoseStreak,
      currentStreak,
      currentStreakType: currentType ? 'W' : 'L'
    };
  };

  // Add this helper function to calculate advanced stats
  const getAdvancedStats = (games) => {
    return games.reduce((stats, game) => {
      const team1Stats = getTeamStats(game, 'team1');
      const team2Stats = getTeamStats(game, 'team2');
      
      // Calculate possessions (estimate)
      const possessions = team1Stats.fgAttempts + team2Stats.fgAttempts 
                         - (team1Stats.rebounds + team2Stats.rebounds) 
                         + (team1Stats.turnovers + team2Stats.turnovers) 
                         + 0.4 * (team1Stats.ftAttempts + team2Stats.ftAttempts);
      
      // Calculate pace
      const pace = 48 * (possessions / 40); // Normalized to 48 minutes
      
      // Calculate offensive rating
      const offRtg = (team1Stats.points / possessions) * 100;
      
      // Calculate defensive rating
      const defRtg = (team2Stats.points / possessions) * 100;
      
      // Calculate net rating
      const netRtg = offRtg - defRtg;
      
      // Update running averages
      stats.pace += pace;
      stats.offRtg += offRtg;
      stats.defRtg += defRtg;
      stats.netRtg += netRtg;
      
      return stats;
    }, { pace: 0, offRtg: 0, defRtg: 0, netRtg: 0 });
  };

  // Add this helper function to filter games by timeframe
  const getFilteredGames = () => {
    if (timeframe === 'season') return seasonGames;
    
    const now = new Date();
    const cutoff = new Date();
    if (timeframe === 'week') {
      cutoff.setDate(now.getDate() - 7);
    } else if (timeframe === 'month') {
      cutoff.setMonth(now.getMonth() - 1);
    }
    
    return seasonGames.filter(game => new Date(game.createdAt) >= cutoff);
  };

  // Update the Stats Grid section to include more categories
  const statsGridItems = [
    { 
      label: 'Record',
      value: (() => {
        const record = getSeasonRecord(seasonGames);
        return `${record.wins}-${record.losses}`;
      })(),
      icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z'
    },
    { 
      label: 'Win %',
      value: (() => {
        const record = getSeasonRecord(seasonGames);
        return `${((record.wins / (record.wins + record.losses)) * 100 || 0).toFixed(1)}%`;
      })(),
      icon: 'M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
    },
    { 
      label: 'Streak',
      value: (() => {
        const streaks = getStreaks(seasonGames);
        return `${streaks.currentStreak}${streaks.currentStreakType}`;
      })(),
      icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
    },
    { 
      label: 'PPG',
      value: (seasonGames.reduce((total, game) => {
        const team1Stats = getTeamStats(game, 'team1');
        return total + team1Stats.points;
      }, 0) / seasonGames.length).toFixed(1),
      icon: 'M13 10V3L4 14h7v7l9-11h-7z'
    },
    { 
      label: 'FG%',
      value: `${(seasonGames.reduce((total, game) => {
        const team1Stats = getTeamStats(game, 'team1');
        return total + (team1Stats.fgMade / team1Stats.fgAttempts || 0);
      }, 0) / seasonGames.length * 100).toFixed(1)}%`,
      icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z'
    },
    { 
      label: '3P%',
      value: `${(seasonGames.reduce((total, game) => {
        const team1Stats = getTeamStats(game, 'team1');
        return total + (team1Stats.threePtMade / team1Stats.threePtAttempts || 0);
      }, 0) / seasonGames.length * 100).toFixed(1)}%`,
      icon: 'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z'
    },
    { 
      label: 'AST',
      value: (seasonGames.reduce((total, game) => {
        const team1Stats = getTeamStats(game, 'team1');
        return total + team1Stats.assists;
      }, 0) / seasonGames.length).toFixed(1),
      icon: 'M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11'
    },
    { 
      label: 'REB',
      value: (seasonGames.reduce((total, game) => {
        const team1Stats = getTeamStats(game, 'team1');
        return total + team1Stats.rebounds;
      }, 0) / seasonGames.length).toFixed(1),
      icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z'
    },
    { 
      label: 'STL',
      value: (seasonGames.reduce((total, game) => {
        const team1Stats = getTeamStats(game, 'team1');
        return total + team1Stats.steals;
      }, 0) / seasonGames.length).toFixed(1),
      icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z'
    }
  ];

  // Update the Performance Trends section to include advanced stats
  const advancedStats = getAdvancedStats(seasonGames);
  const advancedStatsItems = [
    {
      label: 'Pace',
      value: (advancedStats.pace / seasonGames.length).toFixed(1),
      description: 'Possessions per 48 minutes'
    },
    {
      label: 'Off Rating',
      value: (advancedStats.offRtg / seasonGames.length).toFixed(1),
      description: 'Points per 100 possessions'
    },
    {
      label: 'Def Rating',
      value: (advancedStats.defRtg / seasonGames.length).toFixed(1),
      description: 'Points allowed per 100 possessions'
    },
    {
      label: 'Net Rating',
      value: (advancedStats.netRtg / seasonGames.length).toFixed(1),
      description: 'Point differential per 100 possessions'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-base-200 to-base-100 pt-36">
      {/* Header with Season Selection */}
      <section className="py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="text-center mb-12">
            <div className="inline-block px-4 py-2 bg-primary/10 rounded-full text-primary font-medium mb-6 transform hover:scale-105 transition-transform">
              YOUR SEASONS
        </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Season Management</h2>
            <p className="text-xl opacity-80 max-w-2xl mx-auto mb-8">
              Select or create a season to track your basketball statistics and progress.
            </p>
                </div>

                {seasons.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="opacity-60 mb-4">No seasons yet</p>
                    <button 
                className="btn btn-primary"
                      onClick={goToSavedGames}
                    >
                      Create Your First Season
                    </button>
                  </div>
                ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {seasons.map(season => (
                      <div 
                        key={season._id}
                  className={`relative group transform hover:scale-[1.02] transition-all duration-300 ${
                    selectedSeasonId === season._id ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                  <div 
                    className={`relative p-6 bg-base-100/50 backdrop-blur-sm rounded-lg cursor-pointer ${
                      selectedSeasonId === season._id ? 'bg-primary/10' : ''
                    }`}
                        onClick={() => setSelectedSeasonId(season._id)}
                      >
                    <div className="flex justify-between items-start">
                        <div>
                        <h3 className="text-lg font-bold mb-2">{season.name}</h3>
                        <p className="text-sm opacity-70">
                            {season.gameIds ? season.gameIds.length : 0} game{season.gameIds && season.gameIds.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                        <button 
                        className="btn btn-ghost btn-sm btn-circle"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSeason(season._id);
                          }}
                          title="Delete season"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                    </div>
                  </div>
                      </div>
                    ))}

              {/* Add Season Button */}
              <div className="relative group transform hover:scale-[1.02] transition-all duration-300">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                <button 
                  onClick={goToSavedGames}
                  className="relative w-full h-full p-6 bg-base-100/50 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center gap-2"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span className="font-medium">Add Season</span>
                </button>
              </div>
            </div>
          )}
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

          {selectedSeason && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Season Overview */}
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative bg-base-100 rounded-2xl shadow-2xl p-6 transform hover:scale-[1.02] transition-transform">
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    Season Overview
                    <div className="badge badge-primary">{selectedSeason.name}</div>
                  </h3>
                  
                  {/* Progress Bar */}
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Season Progress</span>
                    <div className="flex items-center gap-2">
                        <span className="text-primary font-bold">{seasonGames.length}</span>
                        <span className="text-sm opacity-60">Games</span>
                      </div>
                    </div>
                    <div className="h-3 bg-base-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-1000"
                        style={{ width: `${(seasonGames.length / (selectedSeason?.targetGames || 82)) * 100}%` }}
                      >
                        <div className="w-full h-full opacity-75 bg-[length:10px_10px] bg-[linear-gradient(45deg,rgba(0,0,0,.2)25%,transparent_25%,transparent_50%,rgba(0,0,0,.2)50%,rgba(0,0,0,.2)75%,transparent_75%,transparent)] animate-[progress-bar-stripes_1s_linear_infinite]"></div>
                    </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {statsGridItems.map((stat, index) => (
                      <div key={index} className="group/stat bg-base-200/50 p-4 rounded-xl hover:bg-base-200 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                          </svg>
                          <div className="text-sm opacity-60">{stat.label}</div>
                  </div>
                        <div className="text-xl font-bold">{stat.value}</div>
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
                      {seasonGames.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3).map((game, index) => {
                        const team1Stats = getTeamStats(game, 'team1');
                        const team2Stats = getTeamStats(game, 'team2');
                        const score = `${team1Stats.points}-${team2Stats.points}`;
                        const isWin = team1Stats.points > team2Stats.points;
                        
                        return (
                          <div key={index} className="flex items-center justify-between p-3 bg-base-200/50 rounded-lg hover:bg-base-200 transition-colors cursor-pointer group/game">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                isWin ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                              }`}>
                                {isWin ? 'W' : 'L'}
                              </div>
                              <div>
                                <div className="font-medium">{game.title}</div>
                                <div className="text-xs opacity-60">{new Date(game.createdAt).toLocaleDateString()}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-medium">{score}</span>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-0 group-hover/game:opacity-60 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        );
                      })}
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
                    <button 
                        className={`btn btn-sm ${timeframe === 'week' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setTimeframe('week')}
                    >
                        Week
                    </button>
                  <button 
                        className={`btn btn-sm ${timeframe === 'month' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setTimeframe('month')}
                      >
                        Month
                      </button>
                      <button 
                        className={`btn btn-sm ${timeframe === 'season' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setTimeframe('season')}
                      >
                        Season
                  </button>
                </div>
                  </h3>
              
                  {/* Points Trend */}
                  <div className="bg-base-200/50 p-4 rounded-xl mb-6">
              <div className="flex justify-between items-center mb-4">
                      <div>
                        <div className="font-medium">Points Per Game</div>
                        <div className="text-2xl font-bold text-primary">
                          {(getFilteredGames().reduce((total, game) => {
                            const team1Stats = getTeamStats(game, 'team1');
                            return total + team1Stats.points;
                          }, 0) / getFilteredGames().length || 0).toFixed(1)}
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <div className="text-xs opacity-60">Last {getFilteredGames().length} games</div>
                        <div className="text-sm">
                          High: {Math.max(...getFilteredGames().map(game => {
                            const team1Stats = getTeamStats(game, 'team1');
                            return team1Stats.points;
                          }) || [0])}
                        </div>
                      </div>
                    </div>
                    <div className="h-32 flex items-end gap-1">
                      {getFilteredGames().sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).map((game, index) => {
                        const team1Stats = getTeamStats(game, 'team1');
                        const points = team1Stats.points;
                        const maxPoints = Math.max(...getFilteredGames().map(g => {
                          const stats = getTeamStats(g, 'team1');
                          return stats.points;
                        }));
                        const height = maxPoints > 0 ? (points / maxPoints) * 100 : 0;
                        const isWin = team1Stats.points > getTeamStats(game, 'team2').points;
                        
                        return (
                          <div key={index} className="relative flex-1 group/bar">
                            <div
                              className={`rounded-t transition-all duration-500 ${
                                isWin ? 'bg-success/20 hover:bg-success' : 'bg-error/20 hover:bg-error'
                              }`}
                              style={{ height: `${height}%` }}
                            ></div>
                            {/* Tooltip */}
                            <div className="absolute opacity-0 group-hover/bar:opacity-100 transition-opacity bg-base-300 text-xs p-2 rounded-lg -top-8 left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap">
                              {game.title}: {points} points
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between text-xs opacity-60 mt-2">
                      <span>First Game</span>
                      <span>Latest</span>
                    </div>
                  </div>

                  {/* Advanced Stats */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold">Advanced Stats</h4>
                  <button 
                        className="btn btn-ghost btn-xs"
                        onClick={() => setShowAdvancedStats(!showAdvancedStats)}
                      >
                        {showAdvancedStats ? 'Hide Details' : 'Show Details'}
                  </button>
                </div>
                    <div className="grid grid-cols-2 gap-4">
                      {advancedStatsItems.map((stat, index) => (
                        <div key={index} className="bg-base-200/50 p-4 rounded-xl">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium">{stat.label}</span>
                            <span className="text-xl font-bold">{stat.value}</span>
                          </div>
                          {showAdvancedStats && (
                            <p className="text-xs opacity-60">{stat.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
              </div>
              
                  {/* Shooting Stats */}
                  <div className="space-y-4">
                    {[
                      { 
                        label: 'Field Goals',
                        getMade: (game) => getTeamStats(game, 'team1').fgMade,
                        getAttempts: (game) => getTeamStats(game, 'team1').fgAttempts,
                        color: 'primary'
                      },
                      { 
                        label: '3-Pointers',
                        getMade: (game) => getTeamStats(game, 'team1').threePtMade,
                        getAttempts: (game) => getTeamStats(game, 'team1').threePtAttempts,
                        color: 'secondary'
                      },
                      { 
                        label: 'Free Throws',
                        getMade: (game) => getTeamStats(game, 'team1').ftMade,
                        getAttempts: (game) => getTeamStats(game, 'team1').ftAttempts,
                        color: 'accent'
                      }
                    ].map((stat, index) => {
                      const filteredGames = getFilteredGames().sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                      const made = filteredGames.reduce((sum, game) => sum + stat.getMade(game), 0);
                      const attempts = filteredGames.reduce((sum, game) => sum + stat.getAttempts(game), 0);
                      const percentage = ((made / attempts) * 100 || 0).toFixed(1);
                      
                      const lastGame = filteredGames[filteredGames.length - 1];
                      const lastGameMade = lastGame ? stat.getMade(lastGame) : 0;
                      const lastGameAttempts = lastGame ? stat.getAttempts(lastGame) : 0;
                      const lastGamePercentage = ((lastGameMade / lastGameAttempts) * 100 || 0).toFixed(1);
                      
                      return (
                        <div key={index} className="bg-base-200/50 p-4 rounded-xl group/stat hover:bg-base-200 transition-colors">
                          <div className="flex justify-between text-sm mb-2">
                            <span>{stat.label}</span>
                            <div className="flex items-center gap-2">
                              <span className={`text-${stat.color}`}>{percentage}%</span>
                              <span className={`text-xs ${Number(lastGamePercentage) > Number(percentage) ? 'text-success' : 'text-error'}`}>
                                ({lastGamePercentage}% last game)
                              </span>
                  </div>
                          </div>
                          <div className="h-2 bg-base-300 rounded-full overflow-hidden">
                            <div 
                              className={`h-full bg-${stat.color} rounded-full transition-all duration-1000`}
                              style={{ width: `${percentage}%` }}
                            >
                              <div className="w-full h-full opacity-75 bg-[length:10px_10px] bg-[linear-gradient(45deg,rgba(0,0,0,.2)25%,transparent_25%,transparent_50%,rgba(0,0,0,.2)50%,rgba(0,0,0,.2)75%,transparent_75%,transparent)] animate-[progress-bar-stripes_1s_linear_infinite]"></div>
                  </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Team Total Stats */}
      {selectedSeason && (
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-primary/5"></div>
          <div className="max-w-7xl mx-auto px-6 relative">
            <h2 className="text-3xl font-bold mb-12 text-center">Team Statistics</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
              {/* Team Totals */}
              <div className="card bg-base-100 shadow-xl overflow-hidden border border-base-200">
                <div className="card-body">
                  <h3 className="text-xl font-bold mb-6">Season Totals</h3>
                  <div className="overflow-x-auto">
                    <table className="table w-full">
                    <thead>
                        <tr>
                          <th>Stat</th>
                          <th>Total</th>
                          <th>Per Game</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                          { label: 'Points', getValue: (game) => getTeamStats(game, 'team1').points },
                          { label: 'Rebounds', getValue: (game) => getTeamStats(game, 'team1').rebounds },
                          { label: 'Assists', getValue: (game) => getTeamStats(game, 'team1').assists },
                          { label: 'Steals', getValue: (game) => getTeamStats(game, 'team1').steals },
                          { label: 'Blocks', getValue: (game) => getTeamStats(game, 'team1').blocks },
                          { label: 'Turnovers', getValue: (game) => getTeamStats(game, 'team1').turnovers }
                        ].map(stat => {
                          const total = seasonGames.reduce((sum, game) => sum + stat.getValue(game), 0);
                          const perGame = (total / seasonGames.length).toFixed(1);
                          return (
                            <tr key={stat.label}>
                              <td>{stat.label}</td>
                              <td className="font-medium">{total}</td>
                              <td>{perGame}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Shooting Splits */}
              <div className="card bg-base-100 shadow-xl overflow-hidden border border-base-200">
                <div className="card-body">
                  <h3 className="text-xl font-bold mb-6">Shooting Splits</h3>
                  <div className="overflow-x-auto">
                    <table className="table w-full">
                      <thead>
                        <tr>
                          <th>Shot Type</th>
                          <th>Made</th>
                          <th>Attempts</th>
                          <th>Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { 
                            label: 'Field Goals',
                            getMade: (game) => getTeamStats(game, 'team1').fgMade,
                            getAttempts: (game) => getTeamStats(game, 'team1').fgAttempts
                          },
                          { 
                            label: '3-Pointers',
                            getMade: (game) => getTeamStats(game, 'team1').threePtMade,
                            getAttempts: (game) => getTeamStats(game, 'team1').threePtAttempts
                          },
                          { 
                            label: 'Free Throws',
                            getMade: (game) => getTeamStats(game, 'team1').ftMade,
                            getAttempts: (game) => getTeamStats(game, 'team1').ftAttempts
                          }
                        ].map(shot => {
                          const made = seasonGames.reduce((sum, game) => sum + shot.getMade(game), 0);
                          const attempts = seasonGames.reduce((sum, game) => sum + shot.getAttempts(game), 0);
                          const percentage = ((made / attempts) * 100 || 0).toFixed(1);
                          return (
                            <tr key={shot.label}>
                              <td>{shot.label}</td>
                              <td>{made}</td>
                              <td>{attempts}</td>
                              <td className={
                                percentage >= 50 ? 'text-success' :
                                percentage <= 30 ? 'text-error' :
                                ''
                              }>{percentage}%</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                  </div>
                </div>
              </div>
              </div>
              
            {/* Full Team Stats Table */}
            <div className="card bg-base-100 shadow-xl overflow-hidden border border-base-200">
              <div className="card-body">
                <h3 className="text-xl font-bold mb-6">Full Team Statistics</h3>
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th>Player</th>
                        <th>GP</th>
                        <th>PPG</th>
                        <th>RPG</th>
                        <th>APG</th>
                        <th>SPG</th>
                        <th>BPG</th>
                        <th>FG</th>
                        <th>FG%</th>
                        <th>3P</th>
                        <th>3P%</th>
                        <th>FT</th>
                        <th>FT%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getAllPlayers().map(player => {
                        const stats = getPlayerSeasonStats(player.combinedName);
                        if (!stats) return null;
                        
                        return (
                          <tr key={player.combinedName} className="hover:bg-base-200/50">
                            <td className="font-medium">{stats.name}</td>
                            <td>{stats.gamesPlayed}</td>
                            <td className="font-medium">{stats.ppg}</td>
                            <td>{stats.rpg}</td>
                            <td>{stats.apg}</td>
                            <td>{stats.spg}</td>
                            <td>{stats.bpg}</td>
                            <td>{`${stats.fgMade}/${stats.fgAttempts}`}</td>
                            <td className={stats.fgPercentage >= 50 ? 'text-success' : stats.fgPercentage <= 30 ? 'text-error' : ''}>
                              {stats.fgPercentage}%
                            </td>
                            <td>{`${stats.threePtMade}/${stats.threePtAttempts}`}</td>
                            <td className={stats.threePtPercentage >= 40 ? 'text-success' : stats.threePtPercentage <= 25 ? 'text-error' : ''}>
                              {stats.threePtPercentage}%
                            </td>
                            <td>{`${stats.ftMade}/${stats.ftAttempts}`}</td>
                            <td className={stats.ftPercentage >= 75 ? 'text-success' : stats.ftPercentage <= 50 ? 'text-error' : ''}>
                              {stats.ftPercentage}%
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
        </section>
              )}
            
         {/* Navigation buttons */}
         <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-base-100/80 backdrop-blur-lg rounded-2xl shadow-lg border border-base-content/5 p-2 flex gap-2">
             

              <button
                onClick={() => setCurrentPage('saved-games')}
                className="btn btn-ghost hover:bg-secondary/10 px-6 gap-2 transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="font-medium">Saved Games</span>
              </button>
            </div>
          </div>
    </div>
  );
};

export default SeasonStats; 