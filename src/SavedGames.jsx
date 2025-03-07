import React, { useState, useEffect, useRef } from 'react';
import { useNotification } from './contexts/NotificationContext';
import { useAuth } from './contexts/AuthContext';
import { STATS_ENDPOINTS, STATS_V2_ENDPOINTS, SEASON_ENDPOINTS, createApiHeaders, APP_URL } from './config/apiConfig';

const SavedGames = ({ setCurrentPage }) => {
  const { currentUser } = useAuth();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);
  const [expandedGame, setExpandedGame] = useState(null);
  const [filterOption, setFilterOption] = useState('all');
  const [sharingGame, setSharingGame] = useState(null);
  const [shareUrls, setShareUrls] = useState({});
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedGames, setSelectedGames] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const { success, error: showError, warning, info } = useNotification();
  const hasShownDemoNotice = useRef(false);

  // Demo games data with the provided players and YouTube link
  const demoGames = [
    {
      id: 'demo-game-1',
      videoId: '17MO0XFSPTk',
      videoUrl: 'https://www.youtube.com/watch?v=17MO0XFSPTk',
      title: 'Boston Celtics vs Dallas Mavericks Game 5 | 2024 NBA Finals',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      teams: {
        team1: {
          name: 'Boston Celtics',
          players: ['Jayson Tatum', 'Jaylen Brown', 'Derrick White']
        },
        team2: {
          name: 'East All-Stars',
          players: ['Luka Doncic', 'Kyrie Irving', 'P.J. Washington']
        }
      },
      stats: [
        // Jayson Tatum stats
        { player: 'Jayson Tatum', team: 'team1', type: 'FG Made', timestamp: 30, formattedTime: '0:30', uniquePlayerId: 'team1|Jayson Tatum' },
        { player: 'Jayson Tatum', team: 'team1', type: 'FG Made', timestamp: 45, formattedTime: '0:45', uniquePlayerId: 'team1|Jayson Tatum' },
        { player: 'Jayson Tatum', team: 'team1', type: 'FG Made', timestamp: 60, formattedTime: '1:00', uniquePlayerId: 'team1|Jayson Tatum' },
        { player: 'Jayson Tatum', team: 'team1', type: '3PT Made', timestamp: 75, formattedTime: '1:15', uniquePlayerId: 'team1|Jayson Tatum' },
        { player: 'Jayson Tatum', team: 'team1', type: '3PT Made', timestamp: 90, formattedTime: '1:30', uniquePlayerId: 'team1|Jayson Tatum' },
        { player: 'Jayson Tatum', team: 'team1', type: '3PT Missed', timestamp: 105, formattedTime: '1:45', uniquePlayerId: 'team1|Jayson Tatum' },
        { player: 'Jayson Tatum', team: 'team1', type: 'FT Made', timestamp: 120, formattedTime: '2:00', uniquePlayerId: 'team1|Jayson Tatum' },
        { player: 'Jayson Tatum', team: 'team1', type: 'FT Made', timestamp: 125, formattedTime: '2:05', uniquePlayerId: 'team1|Jayson Tatum' },
        { player: 'Jayson Tatum', team: 'team1', type: 'Rebound', timestamp: 140, formattedTime: '2:20', uniquePlayerId: 'team1|Jayson Tatum' },
        { player: 'Jayson Tatum', team: 'team1', type: 'Rebound', timestamp: 155, formattedTime: '2:35', uniquePlayerId: 'team1|Jayson Tatum' },
        { player: 'Jayson Tatum', team: 'team1', type: 'Assist', timestamp: 170, formattedTime: '2:50', uniquePlayerId: 'team1|Jayson Tatum' },
        { player: 'Jayson Tatum', team: 'team1', type: 'Assist', timestamp: 185, formattedTime: '3:05', uniquePlayerId: 'team1|Jayson Tatum' },
        { player: 'Jayson Tatum', team: 'team1', type: 'Steal', timestamp: 200, formattedTime: '3:20', uniquePlayerId: 'team1|Jayson Tatum' },
        { player: 'Jayson Tatum', team: 'team1', type: 'Block', timestamp: 215, formattedTime: '3:35', uniquePlayerId: 'team1|Jayson Tatum' },
        
        // Luka Doncic stats
        { player: 'Luka Doncic', team: 'team2', type: 'FG Made', timestamp: 50, formattedTime: '0:50', uniquePlayerId: 'team2|Luka Doncic' },
        { player: 'Luka Doncic', team: 'team2', type: 'FG Missed', timestamp: 65, formattedTime: '1:05', uniquePlayerId: 'team2|Luka Doncic' },
        { player: 'Luka Doncic', team: 'team2', type: '3PT Made', timestamp: 80, formattedTime: '1:20', uniquePlayerId: 'team2|Luka Doncic' },
        { player: 'Luka Doncic', team: 'team2', type: '3PT Made', timestamp: 95, formattedTime: '1:35', uniquePlayerId: 'team2|Luka Doncic' },
        { player: 'Luka Doncic', team: 'team2', type: '3PT Made', timestamp: 110, formattedTime: '1:50', uniquePlayerId: 'team2|Luka Doncic' },
        { player: 'Luka Doncic', team: 'team2', type: '3PT Made', timestamp: 125, formattedTime: '2:05', uniquePlayerId: 'team2|Luka Doncic' },
        { player: 'Luka Doncic', team: 'team2', type: '3PT Missed', timestamp: 140, formattedTime: '2:20', uniquePlayerId: 'team2|Luka Doncic' },
        { player: 'Luka Doncic', team: 'team2', type: '3PT Missed', timestamp: 155, formattedTime: '2:35', uniquePlayerId: 'team2|Luka Doncic' },
        { player: 'Luka Doncic', team: 'team2', type: 'Rebound', timestamp: 170, formattedTime: '2:50', uniquePlayerId: 'team2|Luka Doncic' },
        { player: 'Luka Doncic', team: 'team2', type: 'Assist', timestamp: 185, formattedTime: '3:05', uniquePlayerId: 'team2|Luka Doncic' },
        { player: 'Luka Doncic', team: 'team2', type: 'Steal', timestamp: 200, formattedTime: '3:20', uniquePlayerId: 'team2|Luka Doncic' },
        
        // Jaylen Brown stats
        { player: 'Jaylen Brown', team: 'team1', type: 'FG Made', timestamp: 40, formattedTime: '0:40', uniquePlayerId: 'team1|Jaylen Brown' },
        { player: 'Jaylen Brown', team: 'team1', type: 'FG Made', timestamp: 55, formattedTime: '0:55', uniquePlayerId: 'team1|Jaylen Brown' },
        { player: 'Jaylen Brown', team: 'team1', type: 'FG Made', timestamp: 70, formattedTime: '1:10', uniquePlayerId: 'team1|Jaylen Brown' },
        { player: 'Jaylen Brown', team: 'team1', type: '3PT Made', timestamp: 85, formattedTime: '1:25', uniquePlayerId: 'team1|Jaylen Brown' },
        { player: 'Jaylen Brown', team: 'team1', type: 'FG Missed', timestamp: 100, formattedTime: '1:40', uniquePlayerId: 'team1|Jaylen Brown' },
        
        // Kyrie Irving stats
        { player: 'Kyrie Irving', team: 'team2', type: 'FG Made', timestamp: 35, formattedTime: '0:35', uniquePlayerId: 'team2|Kyrie Irving' },
        { player: 'Kyrie Irving', team: 'team2', type: 'FG Missed', timestamp: 50, formattedTime: '0:50', uniquePlayerId: 'team2|Kyrie Irving' },
        { player: 'Kyrie Irving', team: 'team2', type: '3PT Made', timestamp: 65, formattedTime: '1:05', uniquePlayerId: 'team2|Kyrie Irving' },
        { player: 'Kyrie Irving', team: 'team2', type: '3PT Made', timestamp: 80, formattedTime: '1:20', uniquePlayerId: 'team2|Kyrie Irving' },
        { player: 'Kyrie Irving', team: 'team2', type: '3PT Missed', timestamp: 95, formattedTime: '1:35', uniquePlayerId: 'team2|Kyrie Irving' }
      ]
    },
    {
      id: 'demo-game-2',
      videoId: '-_b8kM5wGg4',
      videoUrl: 'https://www.youtube.com/watch?v=-_b8kM5wGg4',
      title: 'The Best Plays of 2023 NBA Finals!',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      teams: {
        team1: {
          name: 'Miami Heat',
          players: ['Jimmy Butler', 'Bam Adebayo', 'Duncan Robinson']
        },
        team2: {
          name: 'Denver Nuggets',
          players: ['Nikola Jokic', 'Jamal Murray', 'Michael Porter Jr.']
        }
      },
      stats: [
        // Jimmy Butler stats
        { player: 'Jimmy Butler', team: 'team1', type: 'FG Made', timestamp: 30, formattedTime: '0:30', uniquePlayerId: 'team1|Jimmy Butler' },
        { player: 'Jimmy Butler', team: 'team1', type: 'FG Made', timestamp: 45, formattedTime: '0:45', uniquePlayerId: 'team1|Jimmy Butler' },
        { player: 'Jimmy Butler', team: 'team1', type: 'FG Made', timestamp: 60, formattedTime: '1:00', uniquePlayerId: 'team1|Jimmy Butler' },
        { player: 'Jimmy Butler', team: 'team1', type: 'FG Made', timestamp: 75, formattedTime: '1:15', uniquePlayerId: 'team1|Jimmy Butler' },
        { player: 'Jimmy Butler', team: 'team1', type: '3PT Made', timestamp: 90, formattedTime: '1:30', uniquePlayerId: 'team1|Jimmy Butler' },
        { player: 'Jimmy Butler', team: 'team1', type: '3PT Missed', timestamp: 105, formattedTime: '1:45', uniquePlayerId: 'team1|Jimmy Butler' },
        { player: 'Jimmy Butler', team: 'team1', type: 'FT Made', timestamp: 120, formattedTime: '2:00', uniquePlayerId: 'team1|Jimmy Butler' },
        { player: 'Jimmy Butler', team: 'team1', type: 'FT Made', timestamp: 125, formattedTime: '2:05', uniquePlayerId: 'team1|Jimmy Butler' },
        { player: 'Jimmy Butler', team: 'team1', type: 'Rebound', timestamp: 140, formattedTime: '2:20', uniquePlayerId: 'team1|Jimmy Butler' },
        { player: 'Jimmy Butler', team: 'team1', type: 'Rebound', timestamp: 155, formattedTime: '2:35', uniquePlayerId: 'team1|Jimmy Butler' },
        { player: 'Jimmy Butler', team: 'team1', type: 'Rebound', timestamp: 170, formattedTime: '2:50', uniquePlayerId: 'team1|Jimmy Butler' },
        { player: 'Jimmy Butler', team: 'team1', type: 'Assist', timestamp: 185, formattedTime: '3:05', uniquePlayerId: 'team1|Jimmy Butler' },
        { player: 'Jimmy Butler', team: 'team1', type: 'Assist', timestamp: 200, formattedTime: '3:20', uniquePlayerId: 'team1|Jimmy Butler' },
        { player: 'Jimmy Butler', team: 'team1', type: 'Assist', timestamp: 215, formattedTime: '3:35', uniquePlayerId: 'team1|Jimmy Butler' },
        
        // Nikola Jokic stats
        { player: 'Nikola Jokic', team: 'team2', type: 'FG Made', timestamp: 35, formattedTime: '0:35', uniquePlayerId: 'team2|Nikola Jokic' },
        { player: 'Nikola Jokic', team: 'team2', type: '3PT Made', timestamp: 50, formattedTime: '0:50', uniquePlayerId: 'team2|Nikola Jokic' },
        { player: 'Nikola Jokic', team: 'team2', type: '3PT Made', timestamp: 65, formattedTime: '1:05', uniquePlayerId: 'team2|Nikola Jokic' },
        { player: 'Nikola Jokic', team: 'team2', type: '3PT Made', timestamp: 80, formattedTime: '1:20', uniquePlayerId: 'team2|Nikola Jokic' },
        { player: 'Nikola Jokic', team: 'team2', type: '3PT Made', timestamp: 95, formattedTime: '1:35', uniquePlayerId: 'team2|Nikola Jokic' },
        { player: 'Nikola Jokic', team: 'team2', type: '3PT Made', timestamp: 110, formattedTime: '1:50', uniquePlayerId: 'team2|Nikola Jokic' },
        { player: 'Nikola Jokic', team: 'team2', type: '3PT Made', timestamp: 125, formattedTime: '2:05', uniquePlayerId: 'team2|Nikola Jokic' },
        { player: 'Nikola Jokic', team: 'team2', type: '3PT Missed', timestamp: 140, formattedTime: '2:20', uniquePlayerId: 'team2|Nikola Jokic' },
        { player: 'Nikola Jokic', team: 'team2', type: '3PT Missed', timestamp: 155, formattedTime: '2:35', uniquePlayerId: 'team2|Nikola Jokic' },
        { player: 'Nikola Jokic', team: 'team2', type: 'Rebound', timestamp: 170, formattedTime: '2:50', uniquePlayerId: 'team2|Nikola Jokic' },
        { player: 'Nikola Jokic', team: 'team2', type: 'Assist', timestamp: 185, formattedTime: '3:05', uniquePlayerId: 'team2|Nikola Jokic' },
        { player: 'Nikola Jokic', team: 'team2', type: 'Steal', timestamp: 190, formattedTime: '3:10', uniquePlayerId: 'team2|Nikola Jokic' }
      ]
    },
    {
      id: 'demo-game-3',
      videoId: 'Z-gL8aSA-FQ',
      videoUrl: 'https://www.youtube.com/watch?v=Z-gL8aSA-FQ',
      title: 'Wembanyama vs Ball',
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days ago
      teams: {
        team1: {
          name: 'San Antonio Spurs',
          players: ['Victor Wembanyama', 'Keldon Johnson', 'Devin Vassell']
        },
        team2: {
          name: 'Charlotte Hornets',
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
    // Reset demo notice flag when component unmounts or user changes
    return () => {
      hasShownDemoNotice.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchSavedGames = async () => {
      try {
        setLoading(true);
        
        // Process demo games once, outside of any conditional logic
        const markedDemoGames = demoGames.map(game => ({
          ...game,
          isDemo: true,
          title: `[DEMO] ${game.title}`
        }));
        
        if (!currentUser) {
          // If no user is logged in, use the demo games
          setGames(markedDemoGames);
          // Show a notification about demo mode (only for non-logged in users and only once)
          if (!hasShownDemoNotice.current) {
            info('You are viewing demo games. Sign in to save your own games and statistics.');
            hasShownDemoNotice.current = true;
          }
          setLoading(false);
          return;
        }

        // Fetch saved games from the API using V2 endpoints
        const headers = await createApiHeaders(currentUser);
        const response = await fetch(STATS_V2_ENDPOINTS.GET_SAVED_GAMES, { headers });
        
        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage;
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || 'Failed to fetch saved games';
          } catch (e) {
            errorMessage = errorText || 'Failed to fetch saved games';
          }
          throw new Error(errorMessage);
        }
        
        const savedGames = await response.json();
        // Sort games by creation date (newest first)
        savedGames.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Combine user's games with demo games
        setGames([...savedGames, ...markedDemoGames]);
      } catch (err) {
        console.error('Error fetching saved games:', err);
        showError('Failed to load saved games: ' + err.message);
        
        // Set demo games if there's an error fetching from API
        const markedDemoGames = demoGames.map(game => ({
          ...game,
          isDemo: true,
          title: `[DEMO] ${game.title}`
        }));
        setGames(markedDemoGames);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedGames();
    // Remove demoGames from dependency array since it's static data
  }, [currentUser]);

  // Load seasons from API instead of localStorage
  useEffect(() => {
    const fetchSeasons = async () => {
      if (!currentUser) return;
      
      try {
        const headers = await createApiHeaders(currentUser);
        const response = await fetch(SEASON_ENDPOINTS.GET_SEASONS, { headers });
        
        if (!response.ok) {
          throw new Error('Failed to fetch seasons');
        }
        
        const seasonsData = await response.json();
        setSeasons(seasonsData);
      } catch (err) {
        console.error('Error fetching seasons:', err);
        showError('Failed to load seasons: ' + err.message);
        setSeasons([]);
      }
    };

    fetchSeasons();
  }, [currentUser]); // Only depends on currentUser, not on games

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
      info(`Opening video: ${game.title}`);
      setCurrentPage('youtube');
    } catch (error) {
      console.error('Error preparing to continue game:', error);
      showError('Failed to load game. Please try again.');
    }
  };

  // Add this function after continueWatching
  const analyzeGame = (game) => {
    try {
      // Ensure the game has all required properties
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
      
      console.log('Preparing game data for analysis:', gameData);
      
      // Clear any existing data first
      localStorage.removeItem('analyze-game');
      
      // Store the new game data
      localStorage.setItem('analyze-game', JSON.stringify(gameData));
      
      // Verify the data was stored correctly
      const storedData = localStorage.getItem('analyze-game');
      console.log('Stored game data:', storedData);
      
      if (!storedData) {
        throw new Error('Failed to store game data');
      }
      
      // Only navigate after confirming data is stored
      info(`Loading game for analysis: ${game.title}`);
      setTimeout(() => {
        setCurrentPage('shotify');
      }, 100);
    } catch (error) {
      console.error('Error preparing game for analysis:', error);
      showError('Failed to prepare game for analysis. Please try again.');
    }
  };

  // Handle deleting a saved game
  const deleteGame = async (game, event) => {
    if (event) {
      event.stopPropagation();
    }
    
    // Prevent deletion of demo games
    if (game.isDemo) {
      warning("Demo games cannot be deleted.");
      return;
    }

    // Show confirmation
    if (!window.confirm(`Are you sure you want to delete "${game.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      // Ensure the endpoint is in the correct format
      // Check if DELETE_GAME already includes the full URL or needs the videoId appended
      const deleteUrl = typeof STATS_V2_ENDPOINTS.DELETE_GAME === 'function' 
        ? STATS_V2_ENDPOINTS.DELETE_GAME(game.videoId)
        : `${STATS_V2_ENDPOINTS.DELETE_GAME}/${game.videoId}`;
      
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: await createApiHeaders(currentUser)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete game');
      }

      // Remove the game from local state
      setGames(prevGames => prevGames.filter(g => {
        // Handle different id formats between old and new versions
        const gameId = g.id || g._id;
        const targetId = game.id || game._id;
        return gameId !== targetId;
      }));

      success('Game deleted successfully');
    } catch (error) {
      console.error('Error deleting game:', error);
      showError('Failed to delete game: ' + error.message);
    }
  };

  // Modify the filter options to include a season selection dropdown
  const filterOptions = ['all', 'recent', 'month'];
  
  // Update the filterOption effect to prevent unnecessary re-renders
  useEffect(() => {
    // If we're switching to 'season' filter but no season is selected, switch back to 'all'
    if (filterOption === 'season' && !selectedSeason) {
      setFilterOption('all');
    }
  }, [filterOption, selectedSeason]);
  
  // Get games for a specific season
  const getGamesBySeason = (seasonId) => {
    if (!seasonId) return [];
    
    const season = seasons.find(s => s._id === seasonId);
    if (!season || !season.gameIds) return [];
    
    return games.filter(game => 
      season.gameIds.includes(game._id || game.videoId)
    );
  };
  
  // Get filtered games based on the current filter option
  const getFilteredGames = () => {
    if (!games || games.length === 0) return [];
    
    switch (filterOption) {
      case 'recent':
        // Show games from the last 7 days
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return games.filter(game => new Date(game.createdAt) >= weekAgo);
      case 'month': {
        // Show games from the current month
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        return games.filter(game => {
          const gameDate = new Date(game.createdAt);
          return gameDate.getMonth() === currentMonth && 
                 gameDate.getFullYear() === currentYear;
        });
      }
      case 'season':
        return getGamesBySeason(selectedSeason);
      case 'all':
      default:
        return games;
    }
  };

  // Calculate game statistics
  const getGameSummary = (game) => {
    if (!game || !game.stats) return { totalPoints: 0, totalStats: 0 };
    
    const players = getPlayersWithStats(game);
    const totalPoints = players.reduce((sum, player) => sum + player.points, 0);
    const totalStats = game.stats.length;
    
    return { totalPoints, totalStats };
  };

  // New function to share a game
  const shareGame = async (game, e) => {
    if (e) e.stopPropagation();
    
    // Don't allow sharing demo games
    if (game.isDemo) {
      warning('Demo games cannot be shared.');
      return;
    }
    
    try {
      setSharingGame(game.videoId);
      
      // Check if we already have a share URL for this game
      if (shareUrls[game.videoId]) {
        // Copy existing share URL to clipboard
        await navigator.clipboard.writeText(shareUrls[game.videoId]);
        success('Share link copied to clipboard!');
        return;
      }
      
      // Make sure we handle both endpoint formats (function or string)
      const shareUrl = typeof STATS_V2_ENDPOINTS.SHARE_GAME === 'function'
        ? STATS_V2_ENDPOINTS.SHARE_GAME(game.videoId)
        : `${STATS_V2_ENDPOINTS.SHARE_GAME}/${game.videoId}`;
      
      // Include complete game data in the request
      const response = await fetch(shareUrl, {
        method: 'POST',
        headers: await createApiHeaders(currentUser),
        body: JSON.stringify({
          game: {
            ...game,
            internalId: game.videoId || game.internalId,
            youtubeId: game.videoId || game.youtubeId,
            videoId: game.videoId,
            teams: game.teams || {
              team1: { name: 'Team 1', players: [] },
              team2: { name: 'Team 2', players: [] }
            },
            stats: game.stats || [],
            title: game.title || 'Basketball Game',
            createdAt: game.createdAt || new Date().toISOString(),
            userId: currentUser.uid
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to share game');
      }

      const result = await response.json();
      const fullShareUrl = result.shareUrl || `${APP_URL}/shared/${result.shareId}`;
      
      // Update share URLs state
      setShareUrls(prev => ({
        ...prev,
        [game.videoId]: fullShareUrl
      }));
      
      // Copy to clipboard
      await navigator.clipboard.writeText(fullShareUrl);
      success('Share link copied to clipboard!');
    } catch (error) {
      console.error('Error sharing game:', error);
      showError('Failed to share game: ' + error.message);
    } finally {
      setSharingGame(null);
    }
  };

  // Add this function to toggle selection mode
  const toggleMultiSelectMode = () => {
    if (multiSelectMode) {
      // Clear selections when exiting multi-select mode
      setSelectedGames([]);
    }
    setMultiSelectMode(!multiSelectMode);
  };
  
  // Add this function to toggle game selection
  const toggleGameSelection = (gameId) => {
    setSelectedGames(prev => {
      if (prev.includes(gameId)) {
        return prev.filter(id => id !== gameId);
      } else {
        return [...prev, gameId];
      }
    });
  };
  
  // Update the function to create a season via API
  const createSeasonFromSelection = async () => {
    // Check if any games are selected
    if (selectedGames.length === 0) {
      warning('Please select at least one game to create a season.');
      return;
    }

    // Get the filtered list of selected games, excluding demo games
    const selectedGamesList = getFilteredGames()
      .filter(game => selectedGames.includes(game.videoId))
      .filter(game => !game.isDemo); // Filter out demo games
    
    // Warn the user if they selected demo games that will be excluded
    const selectedDemoGamesCount = selectedGames.length - selectedGamesList.length;
    if (selectedDemoGamesCount > 0) {
      info(`${selectedDemoGamesCount} demo game(s) will not be included in your season.`);
    }
    
    // Make sure we still have games after filtering out demos
    if (selectedGamesList.length === 0) {
      warning('No valid games selected. Demo games cannot be added to seasons.');
      return;
    }

    // Extract just the IDs of the selected games for saving
    const realGameIds = selectedGamesList.map(game => game._id || game.videoId);

    try {
      // Ask for season name
      const seasonName = prompt('Enter a name for this season:', `Season ${new Date().toLocaleDateString()}`);
      // Allow user to cancel
      if (!seasonName) {
        return;
      }

      // Create season via API
      const response = await fetch(SEASON_ENDPOINTS.CREATE_SEASON, {
        method: 'POST',
        headers: await createApiHeaders(currentUser),
        body: JSON.stringify({
          name: seasonName,
          gameIds: realGameIds
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create season');
      }

      const result = await response.json();
      
      // Update local seasons list
      setSeasons(prev => [...prev, result]);
      
      // Reset selection state
      setSelectedGames([]);
      setMultiSelectMode(false);
      
      success(`Season "${seasonName}" created successfully with ${realGameIds.length} games.`);
      
      // Redirect to season stats
      setCurrentPage('season-stats');
    } catch (error) {
      console.error('Error creating season:', error);
      showError('Failed to create season: ' + error.message);
    }
  };

  // Function to render a game card with demo indication
  const renderGameCard = (game) => {
    const { totalPoints, totalStats } = getGameSummary(game);
    const gameId = game.id || game._id || `demo-${game.title.replace(/\s+/g, '-').toLowerCase()}`;
    
    return (
      <div 
        key={gameId}
        className={`card bg-base-100 shadow-xl overflow-hidden border transition-all duration-300 ${
          multiSelectMode 
            ? selectedGames.includes(game.videoId) 
              ? 'border-success border-2 shadow-success/20' 
              : 'border-base-200 opacity-70' 
            : game.isDemo 
              ? 'border-primary/30 hover:border-primary/50' 
              : 'border-base-200 hover:border-primary/20'
        }`}
        onClick={() => setExpandedGame(expandedGame === gameId ? null : gameId)}
      >
        {/* Demo badge */}
        {game.isDemo && (
          <div className="absolute top-0 right-0 z-20 m-2">
            <div className="badge badge-primary text-xs font-medium">DEMO</div>
          </div>
        )}
        
        {/* Make the checkbox more prominent */}
        {multiSelectMode && (
          <div 
            className="absolute top-0 left-0 w-full h-full z-10 cursor-pointer"
            onClick={() => toggleGameSelection(game.videoId)}
          >
            <div className="absolute top-4 right-4 bg-base-100 rounded-full shadow-lg p-1">
              <input 
                type="checkbox" 
                className="checkbox checkbox-success checkbox-lg" 
                checked={selectedGames.includes(game.videoId)}
                onChange={() => toggleGameSelection(game.videoId)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            {selectedGames.includes(game.videoId) && (
              <div className="absolute top-0 left-0 w-full h-full bg-success/10 flex items-center justify-center">
                <div className="bg-success/90 text-success-content rounded-full px-4 py-2 font-bold">
                  Selected
                </div>
              </div>
            )}
          </div>
        )}
        
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
            
            {currentUser && !game.isDemo && (
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
          
          <div className="card-actions justify-end mt-4 flex">
            {/* Analyze Button */}
            <button 
              className="btn btn-ghost hover:bg-primary/10 px-6 gap-2 transition-all duration-300 group relative overflow-hidden"
              onClick={(e) => {
                e.stopPropagation();
                analyzeGame(game);
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="font-medium">Analyze</span>
            </button>
            
            <button 
              className="btn btn-primary btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                continueWatching(game);
              }}
            >
              Continue Tracking Stats
            </button>
          </div>
          
          {/* Share URL display */}
          {shareUrls[game.videoId] && (
            <div className="mt-3 animate-fadeIn">
              <div className="flex items-center gap-2 bg-base-200 p-2 rounded-lg text-xs">
                <span className="opacity-70 truncate flex-1">
                  {shareUrls[game.videoId]}
                </span>
                <button 
                  className="btn btn-xs btn-ghost"
                  onClick={async (e) => {
                    e.stopPropagation();
                    await navigator.clipboard.writeText(shareUrls[game.videoId]);
                    success('Link copied!');
                  }}
                >
                  Copy
                </button>
              </div>
            </div>
          )}
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
          </div>
        )}
      </div>
    );
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
            <p className="text-lg opacity-80 max-w-2xl mx-auto mb-6">
              Review and analyze statistics from your previously tracked basketball games
            </p>
            
           
            
            {(currentUser || (!currentUser && games.length > 0)) && !loading && games.length > 0 && (
              <div className="mt-8 bg-base-100/80 backdrop-blur-sm p-1 rounded-full border border-base-200 shadow-sm flex items-center flex-wrap gap-1">
                {/* Filter buttons - all in a single flex container with items-center */}
                <button
                  onClick={() => {
                    setFilterOption('all');
                    setSelectedSeason(null);
                  }}
                  className={`h-10 px-4 rounded-full text-sm font-medium transition-all flex items-center ${
                    filterOption === 'all' ? 'bg-primary text-primary-content shadow-md' : 'hover:bg-base-200'
                  }`}
                >
                  All Games
                </button>
                <button
                  onClick={() => {
                    setFilterOption('recent');
                    setSelectedSeason(null);
                  }}
                  className={`h-10 px-4 rounded-full text-sm font-medium transition-all flex items-center ${
                    filterOption === 'recent' ? 'bg-primary text-primary-content shadow-md' : 'hover:bg-base-200'
                  }`}
                >
                  Last 7 Days
                </button>
                <button
                  onClick={() => {
                    setFilterOption('month');
                    setSelectedSeason(null);
                  }}
                  className={`h-10 px-4 rounded-full text-sm font-medium transition-all flex items-center ${
                    filterOption === 'month' ? 'bg-primary text-primary-content shadow-md' : 'hover:bg-base-200'
                  }`}
                >
                  This Month
                </button>
                
                {/* Season Filter Dropdown */}
                {seasons.length > 0 && (
                  <div className="dropdown dropdown-end inline-flex items-center">
                    <button 
                      type="button"
                      tabIndex={0} 
                      className={`h-10 px-4 rounded-full text-sm font-medium transition-all flex items-center ${
                        filterOption === 'season' ? 'bg-primary text-primary-content shadow-md' : 'hover:bg-base-200'
                      }`}
                    >
                      {selectedSeason
                        ? seasons.find(s => s._id === selectedSeason)?.name || 'Season'
                        : 'Season'
                      }
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 max-h-96 overflow-y-auto">
                      {seasons.map(season => (
                        <li key={season._id}>
                          <a 
                            onClick={() => {
                              setSelectedSeason(season._id);
                              setFilterOption('season'); // Make sure to set the filter option to 'season'
                            }} 
                            className={selectedSeason === season._id ? 'active' : ''}
                          >
                            {season.name}
                            <span className="badge badge-sm">{season.gameIds ? season.gameIds.length : 0}</span>
                          </a>
                        </li>
                      ))}
                      <li className="menu-title">
                        <a onClick={() => setCurrentPage('season-stats')}>
                          Manage Seasons
                        </a>
                      </li>
                    </ul>
                  </div>
                )}
                
                <div className="flex-grow"></div>
                
                {/* Multi-select mode toggle */}
                {!multiSelectMode ? (
                  <button
                    className="h-10 px-4 rounded-full text-sm font-medium hover:bg-base-200 transition-all flex items-center"
                    onClick={toggleMultiSelectMode}
                  >
                    Start a New Season
                  </button>
                ) : (
                  <button
                    className={`h-10 px-4 rounded-full text-sm font-medium transition-all flex items-center ${
                      selectedGames.length > 0
                        ? 'bg-success text-success-content shadow-md'
                        : 'bg-warning text-warning-content shadow-md'
                    }`}
                    onClick={createSeasonFromSelection}
                    disabled={selectedGames.length === 0}
                  >
                    Create Season ({selectedGames.length})
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
      
      <div className="max-w-7xl mx-auto px-6 pb-20 pt-20">
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
        
        {/* Games Grid - show for both logged in users and non-logged in with demo games */}
        {!loading && games.length > 0 && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredGames().map(game => renderGameCard(game))}
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
            
      {/* Navigation buttons */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
                <div className="bg-base-100/80 backdrop-blur-lg rounded-2xl shadow-lg border border-base-content/5 p-2 flex gap-2">
                  <button
                    onClick={() => setCurrentPage('youtube')}
                    className="btn btn-ghost hover:bg-primary/10 px-6 gap-2 transition-all duration-300 group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary transition-transform duration-300 group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">Track New Game</span>
                  </button>

                  <div className="w-px h-8 my-auto bg-base-content/10"></div>

                  <button
                    onClick={() => setCurrentPage('season-stats')}
                    className="btn btn-ghost hover:bg-secondary/10 px-6 gap-2 transition-all duration-300 group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                    <span className="font-medium">Season Stats</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 10v8m-4-5v5M8 10v8m-5 0h18a2 2 0 002-2V8a2 2 0 00-2-2H3a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>

           
          </div>
          
        )}
      </div>
    </div>
  );
};

export default SavedGames; 