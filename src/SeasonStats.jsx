import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from './contexts/NotificationContext';
import { useAuth } from './contexts/AuthContext';
import { formatDate } from './utils/dateUtils';
import { SEASON_ENDPOINTS, STATS_V2_ENDPOINTS, createApiHeaders } from './config/apiConfig';
import {
  ChartBarIcon,
  ChartPieIcon,
  ClockIcon,
  FireIcon,
  TrophyIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ArrowPathIcon,
  PlusIcon,
  CalendarIcon,
  AdjustmentsHorizontalIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  XMarkIcon,
  CheckIcon,
  PencilIcon,
  TrashIcon,
  FolderIcon,
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts';

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
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300 pt-28">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-12 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block"
            >
              <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full text-primary font-medium mb-6">
                <CalendarIcon className="w-5 h-5 mr-2" />
                Season Management
        </div>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              Your Basketball Journey
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl opacity-80 max-w-2xl mx-auto mb-12"
            >
              Track your progress, analyze performance, and celebrate your achievements throughout the season.
            </motion.p>
                  </div>

          {/* Season Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {seasons.map((season, index) => (
              <motion.div
                        key={season._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="relative group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                <button
                        onClick={() => setSelectedSeasonId(season._id)}
                  className={`relative w-full p-6 rounded-xl bg-base-100/50 backdrop-blur-sm border border-base-content/5 shadow-lg transition-all duration-300 ${
                          selectedSeasonId === season._id ? 'ring-2 ring-primary' : ''
                        }`}
                >
                  <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-bold mb-2">{season.name}</h3>
                      <div className="flex items-center gap-2 text-sm opacity-70">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{formatDate(season.createdAt)}</span>
                            </div>
                    </div>
                    <div className="flex gap-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                          startEditingName(season);
                              }}
                        className="btn btn-ghost btn-sm btn-circle"
                            >
                        <PencilIcon className="w-4 h-4" />
                            </button>
                <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSeason(season._id);
                        }}
                        className="btn btn-ghost btn-sm btn-circle text-error"
                      >
                        <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-base-200/50 rounded-lg p-3">
                      <div className="text-sm opacity-70 mb-1">Games</div>
                      <div className="text-2xl font-bold">{season.gameIds?.length || 0}</div>
            </div>
                    <div className="bg-base-200/50 rounded-lg p-3">
                      <div className="text-sm opacity-70 mb-1">Win Rate</div>
                      <div className="text-2xl font-bold">
                        {(() => {
                          const record = getSeasonRecord(seasonGames.filter(game => 
                            season.gameIds?.includes(game.videoId)
                          ));
                          return `${((record.wins / (record.wins + record.losses)) * 100 || 0).toFixed(0)}%`;
                        })()}
                    </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 opacity-70">
                      <FireIcon className="w-4 h-4" />
                      <span>
                        {(() => {
                          const streaks = getStreaks(seasonGames.filter(game => 
                            season.gameIds?.includes(game.videoId)
                          ));
                          return `${streaks.currentStreak}${streaks.currentStreakType} Streak`;
                        })()}
                      </span>
                  </div>
                    <ChevronRightIcon className="w-5 h-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                </button>
              </motion.div>
            ))}

            {/* Add Season Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + seasons.length * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
              <button
                onClick={goToSavedGames}
                className="relative w-full h-full p-6 rounded-xl bg-base-100/50 backdrop-blur-sm border border-base-content/5 shadow-lg transition-all duration-300 flex flex-col items-center justify-center gap-4"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <PlusIcon className="w-6 h-6 text-primary" />
                              </div>
                <span className="font-medium">Create New Season</span>
              </button>
            </motion.div>
                              </div>
                            </div>
      </motion.section>

      {/* Selected Season Stats */}
      <AnimatePresence mode="wait">
        {selectedSeason && (
          <motion.section
            key={selectedSeason._id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="py-24 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-primary/5"></div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
              {/* Season Header */}
              <div className="mb-12">
                <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                    {isEditingName ? (
                      <div className="join">
                        <input
                          type="text"
                          value={newSeasonName}
                          onChange={(e) => setNewSeasonName(e.target.value)}
                          className="input input-bordered join-item w-64"
                          placeholder="Enter season name"
                        />
                        <button
                          onClick={saveSeasonName}
                          className="btn btn-primary join-item"
                        >
                          <CheckIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setIsEditingName(false)}
                          className="btn btn-ghost join-item"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                            </div>
                    ) : (
                      <motion.h2 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-3xl font-bold flex items-center gap-3"
                      >
                        {selectedSeason.name}
                        <button
                          onClick={startEditingName}
                          className="btn btn-ghost btn-sm btn-circle"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                      </motion.h2>
                    )}
              </div>

                  <div className="flex items-center gap-4">
                    <div className="join">
                    <button 
                        className={`btn join-item ${timeframe === 'week' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setTimeframe('week')}
                    >
                        Week
                    </button>
                  <button 
                        className={`btn join-item ${timeframe === 'month' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setTimeframe('month')}
                      >
                        Month
                      </button>
                      <button 
                        className={`btn join-item ${timeframe === 'season' ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setTimeframe('season')}
                      >
                        Season
                  </button>
                </div>

                  <button 
                        onClick={() => setShowAdvancedStats(!showAdvancedStats)}
                      className="btn btn-ghost gap-2"
                      >
                      <AdjustmentsHorizontalIcon className="w-5 h-5" />
                      {showAdvancedStats ? 'Basic Stats' : 'Advanced Stats'}
                  </button>
                    </div>
              </div>
              
                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {statsGridItems.map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative group"
                    >
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                      <div className="relative bg-base-100/50 backdrop-blur-sm rounded-xl p-6 border border-base-content/5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                            </svg>
                  </div>
                          <div className="text-sm opacity-70">{stat.label}</div>
                          </div>
                        <div className="text-3xl font-bold">{stat.value}</div>
                        </div>
                    </motion.div>
                  ))}
                  </div>
                </div>

              {/* Performance Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                {/* Points Trend Chart */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="card bg-base-100 shadow-xl"
                >
                  <div className="card-body">
                    <h3 className="card-title mb-6">Points Per Game Trend</h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={getFilteredGames().map(game => ({
                            name: game.title,
                            points: getTeamStats(game, 'team1').points,
                            date: new Date(game.createdAt).toLocaleDateString()
                          }))}
                          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="pointsGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--p))" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="hsl(var(--p))" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="date" />
                          <YAxis />
                          <CartesianGrid strokeDasharray="3 3" />
                          <Tooltip />
                          <Area
                            type="monotone"
                            dataKey="points"
                            stroke="hsl(var(--p))"
                            fillOpacity={1}
                            fill="url(#pointsGradient)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
              </div>
            </div>
                </motion.div>

                {/* Shooting Percentages Chart */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="card bg-base-100 shadow-xl"
                >
                <div className="card-body">
                    <h3 className="card-title mb-6">Shooting Percentages</h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart
                          data={[{
                            subject: 'FG%',
                            A: (seasonGames.reduce((total, game) => {
                              const stats = getTeamStats(game, 'team1');
                              return total + (stats.fgMade / stats.fgAttempts || 0);
                            }, 0) / seasonGames.length * 100).toFixed(1),
                            fullMark: 100,
                          }, {
                            subject: '3P%',
                            A: (seasonGames.reduce((total, game) => {
                              const stats = getTeamStats(game, 'team1');
                              return total + (stats.threePtMade / stats.threePtAttempts || 0);
                            }, 0) / seasonGames.length * 100).toFixed(1),
                            fullMark: 100,
                          }, {
                            subject: 'FT%',
                            A: (seasonGames.reduce((total, game) => {
                              const stats = getTeamStats(game, 'team1');
                              return total + (stats.ftMade / stats.ftAttempts || 0);
                            }, 0) / seasonGames.length * 100).toFixed(1),
                            fullMark: 100,
                          }]}
                        >
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} />
                          <Radar
                            name="Team"
                            dataKey="A"
                            stroke="hsl(var(--p))"
                            fill="hsl(var(--p))"
                            fillOpacity={0.6}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                  </div>
                </div>
                </motion.div>
              </div>

              {/* Advanced Stats Section */}
              <AnimatePresence>
                {showAdvancedStats && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-12"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {advancedStatsItems.map((stat, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="card bg-base-100 shadow-xl"
                        >
                <div className="card-body">
                            <h3 className="text-lg font-bold mb-2">{stat.label}</h3>
                            <div className="text-3xl font-bold text-primary mb-2">
                              {stat.value}
                  </div>
                            <p className="text-sm opacity-70">{stat.description}</p>
                </div>
                        </motion.div>
                      ))}
              </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Player Stats Table */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card bg-base-100 shadow-xl overflow-hidden"
              >
              <div className="card-body">
                  <h3 className="card-title mb-6">Player Statistics</h3>
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th>Player</th>
                          <th>Team</th>
                        <th>GP</th>
                        <th>PPG</th>
                        <th>RPG</th>
                        <th>APG</th>
                        <th>SPG</th>
                        <th>BPG</th>
                        <th>FG%</th>
                        <th>3P%</th>
                        <th>FT%</th>
                      </tr>
                    </thead>
                    <tbody>
                        {getAllPlayers().map((player, index) => {
                        const stats = getPlayerSeasonStats(player.combinedName);
                        if (!stats) return null;
                        
                        return (
                            <motion.tr
                              key={player.combinedName}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="hover:bg-base-200/50 transition-colors"
                            >
                            <td className="font-medium">{stats.name}</td>
                              <td>{stats.team === 'team1' ? seasonGames[0]?.teams?.team1?.name || 'Team 1' : seasonGames[0]?.teams?.team2?.name || 'Team 2'}</td>
                            <td>{stats.gamesPlayed}</td>
                            <td className="font-medium">{stats.ppg}</td>
                            <td>{stats.rpg}</td>
                            <td>{stats.apg}</td>
                            <td>{stats.spg}</td>
                            <td>{stats.bpg}</td>
                            <td className={stats.fgPercentage >= 50 ? 'text-success' : stats.fgPercentage <= 30 ? 'text-error' : ''}>
                              {stats.fgPercentage}%
                            </td>
                            <td className={stats.threePtPercentage >= 40 ? 'text-success' : stats.threePtPercentage <= 25 ? 'text-error' : ''}>
                              {stats.threePtPercentage}%
                            </td>
                            <td className={stats.ftPercentage >= 75 ? 'text-success' : stats.ftPercentage <= 50 ? 'text-error' : ''}>
                              {stats.ftPercentage}%
                            </td>
                            </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                        </div>
                      </div>
              </motion.div>
                  </div>
          </motion.section>
              )}
      </AnimatePresence>
            
         {/* Navigation buttons */}
         <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-base-100/80 backdrop-blur-lg rounded-2xl shadow-lg border border-base-content/5 p-2 flex gap-2">
              <button
                onClick={() => setCurrentPage('saved-games')}
                className="btn btn-ghost hover:bg-secondary/10 px-6 gap-2 transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
            <FolderIcon className="h-5 w-5 text-secondary transition-transform duration-300 group-hover:translate-x-1" />
                <span className="font-medium">Saved Games</span>
              </button>
            </div>
          </div>
    </div>
  );
};

export default SeasonStats; 