import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from './contexts/AuthContext';

const SavedGames = ({ setCurrentPage }) => {
  const { currentUser } = useAuth();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);
  const [expandedGame, setExpandedGame] = useState(null);
  const [filterOption, setFilterOption] = useState('all');

  // Demo games data with the provided players and YouTube link
  const demoGames = [
    {
      id: 'demo-game-1',
      videoId: 'dQw4w9WgXcQ',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      title: 'All-Stars Exhibition Game 2024',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      teams: {
        team1: {
          name: 'West All-Stars',
          players: ['LeBron James', 'Stephen Curry', 'Victor Wembanyama']
        },
        team2: {
          name: 'East All-Stars',
          players: ['LaMelo Ball', 'Jayson Tatum', 'Joel Embiid']
        }
      },
      stats: [
        // LeBron James stats
        { player: 'LeBron James', team: 'team1', type: 'FG Made', timestamp: 30, formattedTime: '0:30', uniquePlayerId: 'team1|LeBron James' },
        { player: 'LeBron James', team: 'team1', type: 'FG Made', timestamp: 45, formattedTime: '0:45', uniquePlayerId: 'team1|LeBron James' },
        { player: 'LeBron James', team: 'team1', type: 'FG Made', timestamp: 60, formattedTime: '1:00', uniquePlayerId: 'team1|LeBron James' },
        { player: 'LeBron James', team: 'team1', type: '3PT Made', timestamp: 75, formattedTime: '1:15', uniquePlayerId: 'team1|LeBron James' },
        { player: 'LeBron James', team: 'team1', type: '3PT Made', timestamp: 90, formattedTime: '1:30', uniquePlayerId: 'team1|LeBron James' },
        { player: 'LeBron James', team: 'team1', type: '3PT Missed', timestamp: 105, formattedTime: '1:45', uniquePlayerId: 'team1|LeBron James' },
        { player: 'LeBron James', team: 'team1', type: 'FT Made', timestamp: 120, formattedTime: '2:00', uniquePlayerId: 'team1|LeBron James' },
        { player: 'LeBron James', team: 'team1', type: 'FT Made', timestamp: 125, formattedTime: '2:05', uniquePlayerId: 'team1|LeBron James' },
        { player: 'LeBron James', team: 'team1', type: 'Rebound', timestamp: 140, formattedTime: '2:20', uniquePlayerId: 'team1|LeBron James' },
        { player: 'LeBron James', team: 'team1', type: 'Rebound', timestamp: 155, formattedTime: '2:35', uniquePlayerId: 'team1|LeBron James' },
        { player: 'LeBron James', team: 'team1', type: 'Assist', timestamp: 170, formattedTime: '2:50', uniquePlayerId: 'team1|LeBron James' },
        { player: 'LeBron James', team: 'team1', type: 'Assist', timestamp: 185, formattedTime: '3:05', uniquePlayerId: 'team1|LeBron James' },
        { player: 'LeBron James', team: 'team1', type: 'Steal', timestamp: 200, formattedTime: '3:20', uniquePlayerId: 'team1|LeBron James' },
        { player: 'LeBron James', team: 'team1', type: 'Block', timestamp: 215, formattedTime: '3:35', uniquePlayerId: 'team1|LeBron James' },
        
        // Stephen Curry stats
        { player: 'Stephen Curry', team: 'team1', type: 'FG Made', timestamp: 50, formattedTime: '0:50', uniquePlayerId: 'team1|Stephen Curry' },
        { player: 'Stephen Curry', team: 'team1', type: 'FG Missed', timestamp: 65, formattedTime: '1:05', uniquePlayerId: 'team1|Stephen Curry' },
        { player: 'Stephen Curry', team: 'team1', type: '3PT Made', timestamp: 80, formattedTime: '1:20', uniquePlayerId: 'team1|Stephen Curry' },
        { player: 'Stephen Curry', team: 'team1', type: '3PT Made', timestamp: 95, formattedTime: '1:35', uniquePlayerId: 'team1|Stephen Curry' },
        { player: 'Stephen Curry', team: 'team1', type: '3PT Made', timestamp: 110, formattedTime: '1:50', uniquePlayerId: 'team1|Stephen Curry' },
        { player: 'Stephen Curry', team: 'team1', type: '3PT Made', timestamp: 125, formattedTime: '2:05', uniquePlayerId: 'team1|Stephen Curry' },
        { player: 'Stephen Curry', team: 'team1', type: '3PT Missed', timestamp: 140, formattedTime: '2:20', uniquePlayerId: 'team1|Stephen Curry' },
        { player: 'Stephen Curry', team: 'team1', type: '3PT Missed', timestamp: 155, formattedTime: '2:35', uniquePlayerId: 'team1|Stephen Curry' },
        { player: 'Stephen Curry', team: 'team1', type: 'Rebound', timestamp: 170, formattedTime: '2:50', uniquePlayerId: 'team1|Stephen Curry' },
        { player: 'Stephen Curry', team: 'team1', type: 'Assist', timestamp: 185, formattedTime: '3:05', uniquePlayerId: 'team1|Stephen Curry' },
        { player: 'Stephen Curry', team: 'team1', type: 'Steal', timestamp: 200, formattedTime: '3:20', uniquePlayerId: 'team1|Stephen Curry' },
        
        // Victor Wembanyama stats
        { player: 'Victor Wembanyama', team: 'team1', type: 'FG Made', timestamp: 40, formattedTime: '0:40', uniquePlayerId: 'team1|Victor Wembanyama' },
        { player: 'Victor Wembanyama', team: 'team1', type: 'FG Made', timestamp: 55, formattedTime: '0:55', uniquePlayerId: 'team1|Victor Wembanyama' },
        { player: 'Victor Wembanyama', team: 'team1', type: 'FG Made', timestamp: 70, formattedTime: '1:10', uniquePlayerId: 'team1|Victor Wembanyama' },
        { player: 'Victor Wembanyama', team: 'team1', type: '3PT Made', timestamp: 85, formattedTime: '1:25', uniquePlayerId: 'team1|Victor Wembanyama' },
        { player: 'Victor Wembanyama', team: 'team1', type: 'FG Missed', timestamp: 100, formattedTime: '1:40', uniquePlayerId: 'team1|Victor Wembanyama' },
        
        // LaMelo Ball stats
        { player: 'LaMelo Ball', team: 'team2', type: 'FG Made', timestamp: 35, formattedTime: '0:35', uniquePlayerId: 'team2|LaMelo Ball' },
        { player: 'LaMelo Ball', team: 'team2', type: 'FG Missed', timestamp: 50, formattedTime: '0:50', uniquePlayerId: 'team2|LaMelo Ball' },
        { player: 'LaMelo Ball', team: 'team2', type: '3PT Made', timestamp: 65, formattedTime: '1:05', uniquePlayerId: 'team2|LaMelo Ball' },
        { player: 'LaMelo Ball', team: 'team2', type: '3PT Made', timestamp: 80, formattedTime: '1:20', uniquePlayerId: 'team2|LaMelo Ball' },
        { player: 'LaMelo Ball', team: 'team2', type: '3PT Missed', timestamp: 95, formattedTime: '1:35', uniquePlayerId: 'team2|LaMelo Ball' }
      ]
    },
    {
      id: 'demo-game-2',
      videoId: 'dQw4w9WgXcQ',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      title: 'NBA Finals Highlights 2023',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      teams: {
        team1: {
          name: 'Lakers',
          players: ['LeBron James', 'Anthony Davis', 'Russell Westbrook']
        },
        team2: {
          name: 'Warriors',
          players: ['Stephen Curry', 'Klay Thompson', 'Draymond Green']
        }
      },
      stats: [
        // LeBron James stats
        { player: 'LeBron James', team: 'team1', type: 'FG Made', timestamp: 30, formattedTime: '0:30', uniquePlayerId: 'team1|LeBron James' },
        { player: 'LeBron James', team: 'team1', type: 'FG Made', timestamp: 45, formattedTime: '0:45', uniquePlayerId: 'team1|LeBron James' },
        { player: 'LeBron James', team: 'team1', type: 'FG Made', timestamp: 60, formattedTime: '1:00', uniquePlayerId: 'team1|LeBron James' },
        { player: 'LeBron James', team: 'team1', type: 'FG Made', timestamp: 75, formattedTime: '1:15', uniquePlayerId: 'team1|LeBron James' },
        { player: 'LeBron James', team: 'team1', type: '3PT Made', timestamp: 90, formattedTime: '1:30', uniquePlayerId: 'team1|LeBron James' },
        { player: 'LeBron James', team: 'team1', type: '3PT Missed', timestamp: 105, formattedTime: '1:45', uniquePlayerId: 'team1|LeBron James' },
        { player: 'LeBron James', team: 'team1', type: 'FT Made', timestamp: 120, formattedTime: '2:00', uniquePlayerId: 'team1|LeBron James' },
        { player: 'LeBron James', team: 'team1', type: 'FT Made', timestamp: 125, formattedTime: '2:05', uniquePlayerId: 'team1|LeBron James' },
        { player: 'LeBron James', team: 'team1', type: 'Rebound', timestamp: 140, formattedTime: '2:20', uniquePlayerId: 'team1|LeBron James' },
        { player: 'LeBron James', team: 'team1', type: 'Rebound', timestamp: 155, formattedTime: '2:35', uniquePlayerId: 'team1|LeBron James' },
        { player: 'LeBron James', team: 'team1', type: 'Rebound', timestamp: 170, formattedTime: '2:50', uniquePlayerId: 'team1|LeBron James' },
        { player: 'LeBron James', team: 'team1', type: 'Assist', timestamp: 185, formattedTime: '3:05', uniquePlayerId: 'team1|LeBron James' },
        { player: 'LeBron James', team: 'team1', type: 'Assist', timestamp: 200, formattedTime: '3:20', uniquePlayerId: 'team1|LeBron James' },
        { player: 'LeBron James', team: 'team1', type: 'Assist', timestamp: 215, formattedTime: '3:35', uniquePlayerId: 'team1|LeBron James' },
        
        // Stephen Curry stats
        { player: 'Stephen Curry', team: 'team2', type: 'FG Made', timestamp: 35, formattedTime: '0:35', uniquePlayerId: 'team2|Stephen Curry' },
        { player: 'Stephen Curry', team: 'team2', type: '3PT Made', timestamp: 50, formattedTime: '0:50', uniquePlayerId: 'team2|Stephen Curry' },
        { player: 'Stephen Curry', team: 'team2', type: '3PT Made', timestamp: 65, formattedTime: '1:05', uniquePlayerId: 'team2|Stephen Curry' },
        { player: 'Stephen Curry', team: 'team2', type: '3PT Made', timestamp: 80, formattedTime: '1:20', uniquePlayerId: 'team2|Stephen Curry' },
        { player: 'Stephen Curry', team: 'team2', type: '3PT Made', timestamp: 95, formattedTime: '1:35', uniquePlayerId: 'team2|Stephen Curry' },
        { player: 'Stephen Curry', team: 'team2', type: '3PT Made', timestamp: 110, formattedTime: '1:50', uniquePlayerId: 'team2|Stephen Curry' },
        { player: 'Stephen Curry', team: 'team2', type: '3PT Made', timestamp: 125, formattedTime: '2:05', uniquePlayerId: 'team2|Stephen Curry' },
        { player: 'Stephen Curry', team: 'team2', type: '3PT Missed', timestamp: 140, formattedTime: '2:20', uniquePlayerId: 'team2|Stephen Curry' },
        { player: 'Stephen Curry', team: 'team2', type: '3PT Missed', timestamp: 155, formattedTime: '2:35', uniquePlayerId: 'team2|Stephen Curry' },
        { player: 'Stephen Curry', team: 'team2', type: 'Rebound', timestamp: 170, formattedTime: '2:50', uniquePlayerId: 'team2|Stephen Curry' },
        { player: 'Stephen Curry', team: 'team2', type: 'Assist', timestamp: 185, formattedTime: '3:05', uniquePlayerId: 'team2|Stephen Curry' },
        { player: 'Stephen Curry', team: 'team2', type: 'Steal', timestamp: 190, formattedTime: '3:10', uniquePlayerId: 'team2|Stephen Curry' }
      ]
    },
    {
      id: 'demo-game-3',
      videoId: 'dQw4w9WgXcQ',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      title: 'Rookie Showdown: Wembanyama vs Ball',
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
      teams: {
        team1: {
          name: 'Spurs',
          players: ['Victor Wembanyama', 'Keldon Johnson', 'Devin Vassell']
        },
        team2: {
          name: 'Hornets',
          players: ['LaMelo Ball', 'Miles Bridges', 'P.J. Washington']
        }
      },
      stats: [
        // Victor Wembanyama stats
        { player: 'Victor Wembanyama', team: 'team1', type: 'FG Made', timestamp: 30, formattedTime: '0:30', uniquePlayerId: 'team1|Victor Wembanyama' },
        { player: 'Victor Wembanyama', team: 'team1', type: 'FG Made', timestamp: 45, formattedTime: '0:45', uniquePlayerId: 'team1|Victor Wembanyama' },
        { player: 'Victor Wembanyama', team: 'team1', type: 'FG Made', timestamp: 60, formattedTime: '1:00', uniquePlayerId: 'team1|Victor Wembanyama' },
        { player: 'Victor Wembanyama', team: 'team1', type: 'FG Made', timestamp: 75, formattedTime: '1:15', uniquePlayerId: 'team1|Victor Wembanyama' },
        { player: 'Victor Wembanyama', team: 'team1', type: '3PT Made', timestamp: 90, formattedTime: '1:30', uniquePlayerId: 'team1|Victor Wembanyama' },
        { player: 'Victor Wembanyama', team: 'team1', type: 'FG Missed', timestamp: 105, formattedTime: '1:45', uniquePlayerId: 'team1|Victor Wembanyama' },
        { player: 'Victor Wembanyama', team: 'team1', type: 'FT Made', timestamp: 120, formattedTime: '2:00', uniquePlayerId: 'team1|Victor Wembanyama' },
        { player: 'Victor Wembanyama', team: 'team1', type: 'FT Made', timestamp: 125, formattedTime: '2:05', uniquePlayerId: 'team1|Victor Wembanyama' },
        { player: 'Victor Wembanyama', team: 'team1', type: 'Rebound', timestamp: 140, formattedTime: '2:20', uniquePlayerId: 'team1|Victor Wembanyama' },
        { player: 'Victor Wembanyama', team: 'team1', type: 'Rebound', timestamp: 155, formattedTime: '2:35', uniquePlayerId: 'team1|Victor Wembanyama' },
        { player: 'Victor Wembanyama', team: 'team1', type: 'Rebound', timestamp: 170, formattedTime: '2:50', uniquePlayerId: 'team1|Victor Wembanyama' },
        { player: 'Victor Wembanyama', team: 'team1', type: 'Rebound', timestamp: 185, formattedTime: '3:05', uniquePlayerId: 'team1|Victor Wembanyama' },
        { player: 'Victor Wembanyama', team: 'team1', type: 'Block', timestamp: 200, formattedTime: '3:20', uniquePlayerId: 'team1|Victor Wembanyama' },
        { player: 'Victor Wembanyama', team: 'team1', type: 'Block', timestamp: 215, formattedTime: '3:35', uniquePlayerId: 'team1|Victor Wembanyama' },
        { player: 'Victor Wembanyama', team: 'team1', type: 'Block', timestamp: 230, formattedTime: '3:50', uniquePlayerId: 'team1|Victor Wembanyama' },
        
        // LaMelo Ball stats
        { player: 'LaMelo Ball', team: 'team2', type: 'FG Made', timestamp: 35, formattedTime: '0:35', uniquePlayerId: 'team2|LaMelo Ball' },
        { player: 'LaMelo Ball', team: 'team2', type: 'FG Made', timestamp: 50, formattedTime: '0:50', uniquePlayerId: 'team2|LaMelo Ball' },
        { player: 'LaMelo Ball', team: 'team2', type: '3PT Made', timestamp: 65, formattedTime: '1:05', uniquePlayerId: 'team2|LaMelo Ball' },
        { player: 'LaMelo Ball', team: 'team2', type: '3PT Made', timestamp: 80, formattedTime: '1:20', uniquePlayerId: 'team2|LaMelo Ball' },
        { player: 'LaMelo Ball', team: 'team2', type: '3PT Made', timestamp: 95, formattedTime: '1:35', uniquePlayerId: 'team2|LaMelo Ball' },
        { player: 'LaMelo Ball', team: 'team2', type: '3PT Missed', timestamp: 110, formattedTime: '1:50', uniquePlayerId: 'team2|LaMelo Ball' },
        { player: 'LaMelo Ball', team: 'team2', type: 'FT Made', timestamp: 125, formattedTime: '2:05', uniquePlayerId: 'team2|LaMelo Ball' },
        { player: 'LaMelo Ball', team: 'team2', type: 'Assist', timestamp: 140, formattedTime: '2:20', uniquePlayerId: 'team2|LaMelo Ball' },
        { player: 'LaMelo Ball', team: 'team2', type: 'Assist', timestamp: 155, formattedTime: '2:35', uniquePlayerId: 'team2|LaMelo Ball' },
        { player: 'LaMelo Ball', team: 'team2', type: 'Assist', timestamp: 170, formattedTime: '2:50', uniquePlayerId: 'team2|LaMelo Ball' },
        { player: 'LaMelo Ball', team: 'team2', type: 'Assist', timestamp: 185, formattedTime: '3:05', uniquePlayerId: 'team2|LaMelo Ball' },
        { player: 'LaMelo Ball', team: 'team2', type: 'Assist', timestamp: 200, formattedTime: '3:20', uniquePlayerId: 'team2|LaMelo Ball' },
        { player: 'LaMelo Ball', team: 'team2', type: 'Steal', timestamp: 215, formattedTime: '3:35', uniquePlayerId: 'team2|LaMelo Ball' },
        { player: 'LaMelo Ball', team: 'team2', type: 'Steal', timestamp: 230, formattedTime: '3:50', uniquePlayerId: 'team2|LaMelo Ball' }
      ]
    }
  ];

  useEffect(() => {
    const fetchSavedGames = async () => {
      if (!currentUser) {
        // If no user is logged in, use the demo games
        setGames(demoGames);
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
        // Sort games by creation date (newest first)
        savedGames.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setGames(savedGames);
      } catch (error) {
        console.error('Error fetching saved games:', error);
        toast.error(`Failed to load saved games: ${error.message}`);
        // Set demo games if there's an error fetching from API
        setGames(demoGames);
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

  // Helper function to format time
  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  // Helper function to get player statistics
  const getPlayerStats = (playerName, gameStats, teamInfo = null) => {
    // Find which team this player belongs to
    let teamName = '';
    if (teamInfo) {
      Object.entries(teamInfo).forEach(([teamKey, team]) => {
        if (team.players.includes(playerName)) {
          teamName = team.name;
        }
      });
    }
    
    const playerStats = {
      name: playerName,
      teamName,
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
      fgPercentage: 0,
      twoPtPercentage: 0,
      threePtPercentage: 0,
      ftPercentage: 0
    };
    
    gameStats.forEach(stat => {
      if (stat.player === playerName) {
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
      }
    });
    
    // Calculate percentages
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
    
    return playerStats;
  };

  // Get an array of all players with stats for a specific game
  const getPlayersWithStats = (game) => {
    if (!game || !game.stats) return [];
    
    // Get unique players from stats
    const playerNames = [...new Set(game.stats.map(stat => stat.player))];
    return playerNames.map(name => getPlayerStats(name, game.stats, game.teams));
  };

  // Handle continue watching a game
  const continueWatching = (game) => {
    try {
      // Ensure the game has all required properties, with fallbacks for demo games
      const gameData = {
        videoId: game.videoId,
        videoUrl: game.videoUrl || `https://www.youtube.com/watch?v=${game.videoId}`,
        title: game.title || 'Basketball Game',
        teams: game.teams || {
          team1: { name: 'Team 1', players: [] },
          team2: { name: 'Team 2', players: [] }
        },
        stats: game.stats || []
      };
      
      // Save the game data to localStorage so the YouTube component can access it
      localStorage.setItem('continue-game', JSON.stringify(gameData));
      
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

  // Get filtered games based on selected option
  const getFilteredGames = () => {
    if (filterOption === 'all') return games;
    
    const currentDate = new Date();
    if (filterOption === 'recent') {
      // Games from the last 7 days
      const weekAgo = new Date(currentDate);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return games.filter(game => new Date(game.createdAt) >= weekAgo);
    }
    if (filterOption === 'month') {
      // Games from the current month
      return games.filter(game => {
        const gameDate = new Date(game.createdAt);
        return gameDate.getMonth() === currentDate.getMonth() && 
               gameDate.getFullYear() === currentDate.getFullYear();
      });
    }
    return games;
  };

  // Calculate game statistics
  const getGameSummary = (game) => {
    if (!game || !game.stats) return { totalPoints: 0, totalStats: 0 };
    
    const players = getPlayersWithStats(game);
    const totalPoints = players.reduce((sum, player) => sum + player.points, 0);
    const totalStats = game.stats.length;
    
    return { totalPoints, totalStats };
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section with Visual Appeal */}
      <section className="relative pb-16 overflow-hidden pt-36">
        {/* Decorative elements */}
        <div className="absolute top-0 -right-64 w-[60rem] h-[60rem] bg-primary/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute -bottom-96 -left-64 w-[60rem] h-[60rem] bg-secondary/5 rounded-full blur-3xl -z-10"></div>
        
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Your Saved Games
            </h1>
            <p className="text-lg opacity-80 max-w-2xl mx-auto">
              Review and analyze statistics from your previously tracked basketball games
            </p>
            
            {(currentUser || (!currentUser && games.length > 0)) && !loading && games.length > 0 && (
              <div className="mt-8 bg-base-100/80 backdrop-blur-sm p-1 rounded-full border border-base-200 shadow-sm flex gap-1">
                <button 
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filterOption === 'all' ? 'bg-primary text-primary-content shadow-md' : 'hover:bg-base-200'}`}
                  onClick={() => setFilterOption('all')}
                >
                  All Games
                </button>
                <button 
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filterOption === 'recent' ? 'bg-primary text-primary-content shadow-md' : 'hover:bg-base-200'}`}
                  onClick={() => setFilterOption('recent')}
                >
                  Last 7 Days
                </button>
                <button 
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filterOption === 'month' ? 'bg-primary text-primary-content shadow-md' : 'hover:bg-base-200'}`}
                  onClick={() => setFilterOption('month')}
                >
                  This Month
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
      
      <div className="max-w-7xl mx-auto px-6 pb-20 pt-20">
        {/* Not Logged In Message with Demo Games */}
        {!currentUser && games.length > 0 && (
          <div className="mb-10">
            <div className="card bg-base-100 shadow-xl overflow-hidden border border-base-200">
              <div className="text-center py-8 px-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold mb-2">Demo Mode</h2>
                <p className="mb-6 opacity-70 max-w-md mx-auto">
                  You're viewing demo games. Sign in to save your own games and statistics.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <button 
                    className="btn btn-primary btn-sm min-w-40 shadow-md"
                    onClick={() => setCurrentPage('login')}
                  >
                    Sign In
                  </button>
                  <button 
                    className="btn btn-outline btn-sm min-w-40 border-2"
                    onClick={() => setCurrentPage('register')}
                  >
                    Create Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Original not logged in message - only show if no demo games are set */}
        {!currentUser && games.length === 0 && (
          <div className="card bg-base-100 shadow-xl overflow-hidden border border-base-200 pt-20">
            <div className="text-center py-16 px-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-3">Sign in to Access Your Games</h2>
              <p className="mb-8 opacity-70 max-w-md mx-auto">
                Create an account or sign in to view your saved basketball games and statistics.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button 
                  className="btn btn-primary min-w-40 shadow-md"
                  onClick={() => setCurrentPage('login')}
                >
                  Sign In
                </button>
                <button 
                  className="btn btn-outline min-w-40 border-2"
                  onClick={() => setCurrentPage('register')}
                >
                  Create Account
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="loading loading-spinner loading-lg text-primary mb-4"></div>
            <p className="text-base-content/60 animate-pulse">Loading your saved games...</p>
          </div>
        )}
        
        {/* No Games Saved Message - only show for logged in users */}
        {currentUser && !loading && games.length === 0 && (
          <div className="card bg-base-100 shadow-xl overflow-hidden border border-base-200 pt-24">
            <div className="text-center py-16 px-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-3">No Saved Games Yet</h2>
              <p className="mb-8 opacity-70 max-w-md mx-auto">
                Start tracking basketball stats by watching a YouTube video and recording player statistics.
              </p>
              <button 
                className="btn btn-primary min-w-56 shadow-md"
                onClick={() => setCurrentPage('youtube')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Track Game Stats
              </button>
            </div>
          </div>
        )}
        
        {/* Games Grid - show for both logged in users and non-logged in with demo games */}
        {!loading && games.length > 0 && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-24">
              {getFilteredGames().map(game => {
                const { totalPoints, totalStats } = getGameSummary(game);
                const gameId = game.id || game._id || `demo-${game.title.replace(/\s+/g, '-').toLowerCase()}`;
                
                return (
                  <div 
                    key={gameId}
                    className="card bg-base-100 hover:shadow-xl transition-all duration-300 border border-base-200 cursor-pointer group overflow-hidden"
                    onClick={() => setExpandedGame(expandedGame === gameId ? null : gameId)}
                  >
                    {/* YouTube Thumbnail */}
                    <figure className="relative h-48 overflow-hidden">
                      <img 
                        src={`https://img.youtube.com/vi/${game.videoId}/mqdefault.jpg`} 
                        alt={game.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-base-100 via-transparent to-transparent opacity-70"></div>
                      
                      {/* Play button */}
                      <button
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-primary/90 text-primary-content flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          continueWatching(game);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        </svg>
                      </button>
                    </figure>
                    
                    <div className="card-body p-5">
                      <div className="flex justify-between items-start">
                        <h3 className="card-title text-lg font-medium line-clamp-2 mb-1">
                          {game.title}
                        </h3>
                        
                        {currentUser && (
                          <button 
                            className="btn btn-square btn-ghost btn-sm text-error"
                            onClick={(e) => deleteGame(game, e)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                      
                      <div className="text-sm opacity-70 mb-3">
                        Saved on {formatDate(game.createdAt)} at {formatTime(game.createdAt)}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-base-200/50 rounded-lg p-2 text-center">
                          <div className="text-xl font-bold text-primary">{totalPoints}</div>
                          <div className="text-xs opacity-70">Total Points</div>
                        </div>
                        <div className="bg-base-200/50 rounded-lg p-2 text-center">
                          <div className="text-xl font-bold text-secondary">{totalStats}</div>
                          <div className="text-xs opacity-70">Stats Recorded</div>
                        </div>
                      </div>
                      
                      <div className="card-actions justify-end mt-4">
                        <button 
                          className="btn btn-primary btn-sm flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            continueWatching(game);
                          }}
                        >
                          Continue Tracking
                        </button>
                      </div>
                    </div>
                    
                    {/* Expandable section with player stats */}
                    {expandedGame === gameId && (
                      <div className="border-t border-base-200 p-5 bg-base-200/30">
                        <h4 className="font-medium mb-3">Player Statistics</h4>
                        <div className="overflow-x-auto">
                          <table className="table table-xs table-zebra w-full">
                            <thead>
                              <tr>
                                <th>Player</th>
                                <th>Team</th>
                                <th>PTS</th>
                                <th>FG%</th>
                                <th>3P%</th>
                                <th>REB</th>
                                <th>AST</th>
                              </tr>
                            </thead>
                            <tbody>
                              {getPlayersWithStats(game).map(player => (
                                <tr key={player.name}>
                                  <td className="font-medium">{player.name}</td>
                                  <td>{player.teamName}</td>
                                  <td>{player.points}</td>
                                  <td>{player.fgPercentage}%</td>
                                  <td>{player.threePtPercentage}%</td>
                                  <td>{player.rebounds}</td>
                                  <td>{player.assists}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <button 
                          className="btn btn-outline btn-xs mt-4"
                          onClick={(e) => {
                            e.stopPropagation();
                            continueWatching(game);
                          }}
                        >
                          View Full Stats
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {getFilteredGames().length === 0 && games.length > 0 && (
              <div className="text-center py-10">
                <div className="w-16 h-16 mx-auto rounded-full bg-base-200 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium mb-2">No games in this time period</h3>
                <p className="opacity-70 mb-4">Try selecting a different filter option</p>
                <button 
                  className="btn btn-sm btn-outline"
                  onClick={() => setFilterOption('all')}
                >
                  Show All Games
                </button>
              </div>
            )}
            
            {/* Track New Game Button */}
            <div className="flex justify-center mt-10">
              <button 
                className="btn btn-primary"
                onClick={() => setCurrentPage('youtube')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Track New Game
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedGames; 