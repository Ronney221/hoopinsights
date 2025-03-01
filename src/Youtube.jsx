import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from './contexts/AuthContext';
import { STATS_ENDPOINTS, createApiHeaders } from './config/apiConfig';

const Youtube = ({ setCurrentPage }) => {
  const { currentUser } = useAuth();
  const [videoUrl, setVideoUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const [player, setPlayer] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stats, setStats] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState('team1');
  const [teams, setTeams] = useState({
    team1: { name: 'Team 1', players: [] },
    team2: { name: 'Team 2', players: [] }
  });
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [newPlayerName, setNewPlayerName] = useState('');
  const [savingToDb, setSavingToDb] = useState(false);
  const [gameTitle, setGameTitle] = useState('');
  const playerRef = useRef(null);
  const timeUpdateInterval = useRef(null);

  // Load YouTube API
  useEffect(() => {
    // Check if there's a continued game to load
    try {
      const continuedGameJSON = localStorage.getItem('continue-game');
      if (continuedGameJSON) {
        const continuedGame = JSON.parse(continuedGameJSON);
        // Set the video URL and ID
        setVideoUrl(continuedGame.videoUrl);
        setVideoId(continuedGame.videoId);
        // Set the game title
        setGameTitle(continuedGame.title || '');
        // Set the teams if available
        if (continuedGame.teams) {
          setTeams(continuedGame.teams);
        }
        // Set the stats if available
        if (continuedGame.stats && Array.isArray(continuedGame.stats)) {
          setStats(continuedGame.stats);
        }
        
        // Clear the continued game data to prevent reloading on refresh
        localStorage.removeItem('continue-game');
        
        toast.info('Loaded saved game. You can continue tracking stats.');
      }
    } catch (error) {
      console.error('Error loading continued game:', error);
    }
    
    // Load the IFrame Player API code asynchronously
    const loadYouTubeAPI = () => {
      // Check if API is already loaded
      if (window.YT) {
        console.log('YouTube API already loaded');
        return Promise.resolve();
      }
      
      console.log('Loading YouTube API...');
      return new Promise((resolve) => {
        // Create script element
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        
        // Set callback for when API is ready
        window.onYouTubeIframeAPIReady = () => {
          console.log('YouTube API loaded successfully');
          resolve();
        };
        
        // Add script to page
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      });
    };
    
    loadYouTubeAPI();
    
    // Clean up
    return () => {
      if (timeUpdateInterval.current) {
        clearInterval(timeUpdateInterval.current);
      }
      
      // Also destroy player if it exists
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.error('Error destroying player:', e);
        }
      }
    };
  }, []);

  // Function to extract YouTube video ID from URL
  const extractVideoId = (url) => {
    if (!url) return null;

    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!videoUrl) {
      toast.error('Please enter a YouTube URL');
      return;
    }

    setLoading(true);
    
    try {
      const id = extractVideoId(videoUrl);
      
      if (!id) {
        toast.error('Invalid YouTube URL. Please enter a valid URL');
        setLoading(false);
        return;
      }
      
      setVideoId(id);
      
      // Create YouTube player once we have a video ID
      const loadPlayer = () => {
        console.log('Attempting to initialize player for video:', id);
        
        // Wait a moment for the DOM to update and the container to be available
        setTimeout(() => {
          const playerContainer = document.getElementById('youtube-player');
          
          if (!playerContainer) {
            console.error('Player container not found!');
            toast.error('Error loading player. Please try again.');
            setLoading(false);
            return;
          }
          
          if (window.YT && window.YT.Player) {
            console.log('YouTube API is ready, initializing player');
            initializePlayer(id);
            setLoading(false);
            toast.success('Video loaded successfully!');
          } else {
            console.log('YouTube API not ready yet, waiting...');
            // If the API isn't loaded yet, set a function to be called when it is
            window.onYouTubeIframeAPIReady = () => {
              console.log('YouTube API now ready, initializing player');
              initializePlayer(id);
              setLoading(false);
              toast.success('Video loaded successfully!');
            };
          }
        }, 500);
      };
      
      loadPlayer();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      toast.error('Error loading video. Please try again.');
      setLoading(false);
    }
  };

  const initializePlayer = (videoId) => {
    try {
      console.log('Creating YouTube player for video ID:', videoId);
      
      // First clean up any existing player
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          console.error('Error destroying old player:', e);
        }
      }
      
      const newPlayer = new window.YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          'playsinline': 1,
          'rel': 0,
          'modestbranding': 1,
          'origin': window.location.origin
        },
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange,
          'onError': (event) => {
            console.error('YouTube player error:', event.data);
            toast.error('Error playing video. Please try another video.');
          }
        }
      });
      
      console.log('Player created successfully:', newPlayer);
      setPlayer(newPlayer);
      playerRef.current = newPlayer;
    } catch (error) {
      console.error('Error initializing YouTube player:', error);
      toast.error('Error initializing video player. Please try again.');
    }
  };

  const onPlayerReady = (event) => {
    // Player is ready, you can access player methods
    console.log('YouTube player is ready');
    
    // Start tracking time
    if (timeUpdateInterval.current) {
      clearInterval(timeUpdateInterval.current);
    }
    
    timeUpdateInterval.current = setInterval(() => {
      try {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          setCurrentTime(playerRef.current.getCurrentTime());
        }
      } catch (error) {
        console.error('Error getting current time:', error);
      }
    }, 1000);
  };

  const onPlayerStateChange = (event) => {
    try {
      // Update playing state
      setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
    } catch (error) {
      console.error('Error in player state change:', error);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const recordStat = (statType, value = 1) => {
    if (!selectedPlayer) {
      toast.warning('Please select a player first');
      return;
    }

    try {
      // Check if player is properly initialized
      if (!player || !playerRef.current || typeof playerRef.current.getCurrentTime !== 'function') {
        toast.error('Video player is not ready yet. Please wait a moment and try again.');
        return;
      }
      
      const time = playerRef.current.getCurrentTime();
      
      // Create a unique ID that combines team and player name
      const uniquePlayerId = `${selectedTeam}|${selectedPlayer}`;
      
      const newStat = {
        id: Date.now(),
        type: statType,
        value: value,
        player: selectedPlayer,
        team: selectedTeam,
        uniquePlayerId, // Store the unique player ID
        timestamp: time,
        formattedTime: formatTime(time),
        createdAt: new Date().toISOString()
      };
      
      setStats(prevStats => [...prevStats, newStat]);
      toast.success(`Recorded: ${statType} for ${selectedPlayer} (${teams[selectedTeam].name}) at ${formatTime(time)}`);
      
      // Save to local storage
      saveStatsToLocalStorage([...stats, newStat]);
    } catch (error) {
      console.error('Error recording stat:', error);
      toast.error('Error recording stat. Please try again.');
    }
  };
  
  const saveStatsToLocalStorage = (statsData) => {
    try {
      localStorage.setItem(`stats-${videoId}`, JSON.stringify(statsData));
    } catch (error) {
      console.error('Error saving stats to local storage:', error);
    }
  };

  const loadStatsFromLocalStorage = () => {
    try {
      const savedStats = localStorage.getItem(`stats-${videoId}`);
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }
    } catch (error) {
      console.error('Error loading stats from local storage:', error);
    }
  };
  
  // Load stats from local storage when video ID changes
  useEffect(() => {
    if (videoId) {
      loadStatsFromLocalStorage();
    }
  }, [videoId]);

  // Initialize player when videoId changes
  useEffect(() => {
    if (!videoId) return;
    
    console.log('videoId changed, preparing to initialize player');
    
    const initPlayer = () => {
      // Wait a moment for the DOM to update and the container to be available
      setTimeout(() => {
        const playerContainer = document.getElementById('youtube-player');
        
        if (!playerContainer) {
          console.error('Player container not found after videoId change!');
          toast.error('Error loading player. Please try reloading the page.');
          return;
        }
        
        if (window.YT && window.YT.Player) {
          console.log('Initializing player after videoId change');
          initializePlayer(videoId);
        } else {
          console.log('YouTube API not ready after videoId change, waiting...');
          window.onYouTubeIframeAPIReady = () => {
            console.log('YouTube API ready after waiting, initializing player');
            initializePlayer(videoId);
          };
        }
      }, 500);
    };
    
    initPlayer();
  }, [videoId]);

  const jumpToStatTime = (timestamp) => {
    if (playerRef.current) {
      playerRef.current.seekTo(timestamp, true);
    }
  };

  const handleTeamChange = (e) => {
    setSelectedTeam(e.target.value);
    setSelectedPlayer(''); // Reset player selection
  };

  const handlePlayerChange = (e) => {
    setSelectedPlayer(e.target.value);
  };

  const handleTeamNameChange = (team, name) => {
    setTeams(prevTeams => ({
      ...prevTeams,
      [team]: { ...prevTeams[team], name }
    }));
  };
  
  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) {
      toast.error('Please enter a player name');
      return;
    }
    
    // Check if player already exists in the team
    if (teams[selectedTeam].players.includes(newPlayerName.trim())) {
      toast.error('This player already exists in the team');
      return;
    }
    
    setTeams(prevTeams => ({
      ...prevTeams,
      [selectedTeam]: {
        ...prevTeams[selectedTeam],
        players: [...prevTeams[selectedTeam].players, newPlayerName.trim()]
      }
    }));
    
    // Auto-select the newly added player
    setSelectedPlayer(newPlayerName.trim());
    setNewPlayerName('');
    toast.success(`Added ${newPlayerName.trim()} to ${teams[selectedTeam].name}`);
  };
  
  const selectPlayerDirectly = (playerName) => {
    setSelectedPlayer(playerName);
    toast.info(`Selected ${playerName}`);
  };
  
  const removePlayer = (playerName) => {
    // Don't allow removing a player if they have stats
    const playerHasStats = stats.some(stat => stat.player === playerName);
    if (playerHasStats) {
      toast.error(`Cannot remove ${playerName} - they have recorded stats`);
      return;
    }
    
    setTeams(prevTeams => ({
      ...prevTeams,
      [selectedTeam]: {
        ...prevTeams[selectedTeam],
        players: prevTeams[selectedTeam].players.filter(p => p !== playerName)
      }
    }));
    
    // If currently selected player is removed, clear selection
    if (selectedPlayer === playerName) {
      setSelectedPlayer('');
    }
    
    toast.success(`Removed ${playerName} from ${teams[selectedTeam].name}`);
  };
  
  const saveGameToDatabase = async () => {
    if (!currentUser) {
      toast.error('Please log in to save games');
      return;
    }
    
    if (!gameTitle.trim()) {
      toast.error('Please enter a title for this game');
      return;
    }
    
    if (stats.length === 0) {
      toast.error('No stats recorded yet. Record some stats before saving.');
      return;
    }
    
    try {
      setSavingToDb(true);
      
      // Prepare data for saving
      const gameData = {
        title: gameTitle,
        videoId,
        videoUrl,
        userId: currentUser.uid,
        teams,
        stats,
        createdAt: new Date().toISOString()
      };
      
      // Make API call to save the game
      const response = await fetch(STATS_ENDPOINTS.SAVE_GAME, {
        method: 'POST',
        headers: await createApiHeaders(currentUser),
        body: JSON.stringify(gameData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save game');
      }
      
      const result = await response.json();
      console.log('Game saved successfully:', result);
      
      toast.success('Game saved successfully!');
    } catch (error) {
      console.error('Error saving game:', error);
      toast.error(`Failed to save game: ${error.message}`);
    } finally {
      setSavingToDb(false);
    }
  };
  
  // Helper function to get player statistics
  const getPlayerStats = (uniquePlayerId) => {
    // Split the uniquePlayerId to get team and player name
    const [team, playerName] = uniquePlayerId.split('|');
    
    const playerStats = {
      team,
      teamName: teams[team]?.name || team,
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
      fouls: 0,
      // Add percentage fields
      fgPercentage: 0,
      twoPtMade: 0,
      twoPtAttempts: 0,
      twoPtPercentage: 0,
      threePtPercentage: 0,
      ftPercentage: 0
    };
    
    stats.forEach(stat => {
      // Match by unique player ID or create one if it doesn't exist yet
      const statPlayerId = stat.uniquePlayerId || `${stat.team}|${stat.player}`;
      
      if (statPlayerId === uniquePlayerId) {
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
    
    // Calculate percentages (avoid division by zero)
    playerStats.fgPercentage = playerStats.fgAttempts > 0 
      ? Number((playerStats.fgMade / playerStats.fgAttempts * 100).toFixed(2)) 
      : 0;
    
    playerStats.twoPtPercentage = playerStats.twoPtAttempts > 0 
      ? Number((playerStats.twoPtMade / playerStats.twoPtAttempts * 100).toFixed(2)) 
      : 0;
    
    playerStats.threePtPercentage = playerStats.threePtAttempts > 0 
      ? Number((playerStats.threePtMade / playerStats.threePtAttempts * 100).toFixed(2)) 
      : 0;
    
    playerStats.ftPercentage = playerStats.ftAttempts > 0 
      ? Number((playerStats.ftMade / playerStats.ftAttempts * 100).toFixed(2)) 
      : 0;
    
    return playerStats;
  };
  
  // Get an array of all players with stats
  const getPlayersWithStats = () => {
    // Get unique player IDs from stats
    const playerIds = [...new Set(stats.map(stat => {
      // Use uniquePlayerId if it exists, otherwise create one
      return stat.uniquePlayerId || `${stat.team}|${stat.player}`;
    }))];
    
    return playerIds.map(id => getPlayerStats(id));
  };

  // Function to clear all stats
  const clearStats = () => {
    if (window.confirm("Are you sure you want to clear all stats? This cannot be undone.")) {
      setStats([]);
      localStorage.removeItem(`stats-${videoId}`);
      toast.info("All stats have been cleared");
    }
  };

  return (
    <div className="min-h-screen pt-96 pb-12">
      <div className="max-w-[75%] mx-auto px-6">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Basketball Stats Tracker
          </h1>
          <p className="text-lg md:text-xl opacity-80 max-w-2xl mx-auto mb-8">
            Track game stats in real-time while watching basketball videos
          </p>
          
          {/* Video URL Input Form */}
          {!videoId && (
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-12">
              <div className="space-y-4">
                <div className="relative">
                  <div className={`transition-all duration-300 rounded-xl border ${focused ? 'border-primary shadow-sm' : 'border-base-300'} overflow-hidden bg-base-200/50`}>
                    <div className="flex items-center px-4 py-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className={`h-5 w-5 mr-4 transition-all duration-300 ${focused ? 'text-primary' : 'text-base-content/40'}`}
                      >
                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Paste YouTube URL here (e.g., https://www.youtube.com/watch?v=...)"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setFocused(false)}
                        className="grow bg-transparent border-none py-2 focus:outline-none focus:ring-0 text-base-content placeholder:text-base-content/30"
                      />
                    </div>
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className="relative w-full transition-all duration-300 overflow-hidden group"
                  disabled={loading}
                >
                  <div className="h-12 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center text-white font-medium group-hover:opacity-90 transition-opacity shadow-md">
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Loading Video</span>
                      </div>
                    ) : (
                      <span>Load Video</span>
                    )}
                  </div>
                  <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary to-secondary opacity-50 blur-lg transition-all duration-300 scale-90 group-hover:scale-100 group-hover:opacity-60"></div>
                </button>
              </div>
            </form>
          )}
          
          {/* Main Content when Video is Loaded */}
          {videoId && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Video Player */}
              <div className="lg:col-span-9">
                {/* Larger Video Player with handle for resizing */}
                <div className="card bg-base-100 shadow-xl overflow-hidden mb-6">
                  <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                    <div 
                      id="youtube-player" 
                      className="absolute top-0 left-0 w-full h-full"
                    ></div>
                  </div>
                  <div className="p-4 flex justify-between items-center bg-base-200/50">
                    <div>
                      <span className="font-medium text-primary">{formatTime(currentTime)}</span>
                    </div>
                    <div>
                      <button 
                        onClick={() => setVideoId('')}
                        className="btn btn-sm btn-outline"
                      >
                        Change video
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Timeline Visualization */}
                <div className="card bg-base-100 shadow-xl overflow-hidden mb-6">
                  <div className="card-body">
                    <h2 className="card-title text-center">Stats Timeline</h2>
                    <div className="relative h-16 bg-base-200 rounded-xl overflow-hidden">
                      {player && stats.map(stat => {
                        // Get video duration safely with fallback
                        const videoDuration = (() => {
                          try {
                            // Only try to get duration if player is ready
                            if (player.getPlayerState !== undefined) {
                              return player.getDuration() || 600;
                            }
                            return 600; // Default fallback of 10 minutes
                          } catch (e) {
                            console.log("Couldn't get video duration yet:", e);
                            return 600;
                          }
                        })();
                        
                        return (
                          <div 
                            key={stat.id}
                            onClick={() => jumpToStatTime(stat.timestamp)}
                            className={`absolute w-4 h-4 -ml-2 rounded-full cursor-pointer transition-all hover:scale-125 hover:z-10 ${
                              stat.team === 'team1' ? 'bg-primary' : 'bg-secondary'
                            }`}
                            style={{ 
                              left: `${(stat.timestamp / videoDuration) * 100}%`,
                              top: stat.team === 'team1' ? '25%' : '75%'
                            }}
                            title={`${stat.player} (${teams[stat.team].name}): ${stat.type} at ${stat.formattedTime}`}
                          />
                        );
                      })}
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span>0:00</span>
                      <span>{formatTime((() => {
                        try {
                          return player && player.getPlayerState !== undefined ? player.getDuration() : 0;
                        } catch (e) {
                          return 0;
                        }
                      })())}</span>
                    </div>
                  </div>
                </div>
                
                {/* Stats Table */}
                <div className="card bg-base-100 shadow-xl overflow-hidden mb-6">
                  <div className="card-body">
                    <h2 className="card-title">Recent Stats</h2>
                    <div className="overflow-x-auto">
                      <table className="table table-zebra w-full">
                        <thead>
                          <tr>
                            <th>Time</th>
                            <th>Team</th>
                            <th>Player</th>
                            <th>Stat</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.slice().reverse().slice(0, 10).map(stat => (
                            <tr key={stat.id}>
                              <td>{stat.formattedTime}</td>
                              <td>{teams[stat.team].name}</td>
                              <td>{stat.player}</td>
                              <td>{stat.type}</td>
                              <td>
                                <button 
                                  onClick={() => jumpToStatTime(stat.timestamp)}
                                  className="btn btn-xs btn-outline"
                                >
                                  Jump
                                </button>
                              </td>
                            </tr>
                          ))}
                          {stats.length === 0 && (
                            <tr>
                              <td colSpan="5" className="text-center py-4">No stats recorded yet</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Stats Recording Panel - Always positioned to the right */}
              <div className="lg:col-span-3">
                <div className="card bg-base-100 shadow-xl sticky top-24">
                  <div className="card-body">
                    <h2 className="card-title">Record Stats</h2>
                    
                    {/* Team/Player Selection */}
                    <div className="form-control mb-4">
                      <label className="label">
                        <span className="label-text">Team</span>
                      </label>
                      <div className="flex gap-2 mb-2">
                        <div className="flex-1">
                          <select 
                            className="select select-bordered w-full" 
                            value={selectedTeam}
                            onChange={handleTeamChange}
                          >
                            <option value="team1">{teams.team1.name}</option>
                            <option value="team2">{teams.team2.name}</option>
                          </select>
                        </div>
                        <input 
                          type="text"
                          placeholder="Team name"
                          className="input input-bordered flex-1"
                          value={teams[selectedTeam].name}
                          onChange={(e) => handleTeamNameChange(selectedTeam, e.target.value)}
                        />
                      </div>
                      
                      {/* Add New Player */}
                      <div className="flex gap-2 mb-4">
                        <input
                          type="text"
                          placeholder="New player name"
                          className="input input-bordered w-full"
                          value={newPlayerName}
                          onChange={(e) => setNewPlayerName(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddPlayer()}
                        />
                        <button
                          className="btn btn-primary"
                          onClick={handleAddPlayer}
                          disabled={!newPlayerName.trim()}
                        >
                          Add
                        </button>
                      </div>
                      
                      {/* Player Selection Buttons */}
                      <div className="mb-4">
                        <label className="label">
                          <span className="label-text">Select Player</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {teams[selectedTeam].players.map(player => (
                            <div key={player} className="flex items-center">
                              <button
                                className={`btn btn-sm ${selectedPlayer === player ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => selectPlayerDirectly(player)}
                              >
                                {player}
                              </button>
                              <button
                                className="btn btn-ghost btn-xs text-error"
                                onClick={() => removePlayer(player)}
                                title={`Remove ${player}`}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                        {teams[selectedTeam].players.length === 0 && (
                          <div className="text-center py-2 text-sm opacity-70">
                            No players added. Add some players to start tracking stats.
                          </div>
                        )}
                      </div>
                      
                      {/* Current Selected Player */}
                      {selectedPlayer && (
                        <div className="bg-base-200 p-3 rounded-lg mb-4">
                          <div className="text-center">
                            <span className="text-sm opacity-70">Currently tracking:</span>
                            <div className="font-bold text-primary">
                              {selectedPlayer} <span className="text-sm font-normal">({teams[selectedTeam].name})</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Stat Buttons */}
                    <div className="space-y-2">
                      <div className="stats-group">
                        <h3 className="text-sm font-medium uppercase opacity-70 mb-2">Field Goals</h3>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => recordStat('FG Made')}
                            className="btn flex-1 bg-success hover:bg-success/80 border-success text-white"
                            disabled={!selectedPlayer}
                          >
                            FG Made
                          </button>
                          <button 
                            onClick={() => recordStat('FG Missed')}
                            className="btn flex-1 bg-error hover:bg-error/80 border-error text-white"
                            disabled={!selectedPlayer}
                          >
                            FG Missed
                          </button>
                        </div>
                      </div>
                      
                      <div className="stats-group">
                        <h3 className="text-sm font-medium uppercase opacity-70 mb-2">3-Pointers</h3>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => recordStat('3PT Made')}
                            className="btn flex-1 bg-success hover:bg-success/80 border-success text-white"
                            disabled={!selectedPlayer}
                          >
                            3PT Made
                          </button>
                          <button 
                            onClick={() => recordStat('3PT Missed')}
                            className="btn flex-1 bg-error hover:bg-error/80 border-error text-white"
                            disabled={!selectedPlayer}
                          >
                            3PT Missed
                          </button>
                        </div>
                      </div>
                      
                      <div className="stats-group">
                        <h3 className="text-sm font-medium uppercase opacity-70 mb-2">Free Throws</h3>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => recordStat('FT Made')}
                            className="btn flex-1 bg-success hover:bg-success/80 border-success text-white"
                            disabled={!selectedPlayer}
                          >
                            FT Made
                          </button>
                          <button 
                            onClick={() => recordStat('FT Missed')}
                            className="btn flex-1 bg-error hover:bg-error/80 border-error text-white"
                            disabled={!selectedPlayer}
                          >
                            FT Missed
                          </button>
                        </div>
                      </div>
                      
                      <div className="stats-group">
                        <h3 className="text-sm font-medium uppercase opacity-70 mb-2">Other Stats</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <button 
                            onClick={() => recordStat('Rebound')}
                            className="btn btn-outline"
                            disabled={!selectedPlayer}
                          >
                            Rebound
                          </button>
                          <button 
                            onClick={() => recordStat('Assist')}
                            className="btn btn-outline"
                            disabled={!selectedPlayer}
                          >
                            Assist
                          </button>
                          <button 
                            onClick={() => recordStat('Block')}
                            className="btn btn-outline"
                            disabled={!selectedPlayer}
                          >
                            Block
                          </button>
                          <button 
                            onClick={() => recordStat('Steal')}
                            className="btn btn-outline"
                            disabled={!selectedPlayer}
                          >
                            Steal
                          </button>
                          <button 
                            onClick={() => recordStat('Turnover')}
                            className="btn btn-outline"
                            disabled={!selectedPlayer}
                          >
                            Turnover
                          </button>
                          <button 
                            onClick={() => recordStat('Foul')}
                            className="btn btn-outline"
                            disabled={!selectedPlayer}
                          >
                            Foul
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Player Stats Summary - Only show if we have stats */}
          {videoId && stats.length > 0 && (
            <div className="mt-10">
              <h2 className="text-2xl font-bold mb-6 text-center">Player Statistics</h2>
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr>
                      <th>Team</th>
                      <th>Player</th>
                      <th>PTS</th>
                      <th>FG</th>
                      <th>FG%</th>
                      <th>2PT</th>
                      <th>2PT%</th>
                      <th>3PT</th>
                      <th>3PT%</th>
                      <th>FT</th>
                      <th>FT%</th>
                      <th>REB</th>
                      <th>AST</th>
                      <th>STL</th>
                      <th>BLK</th>
                      <th>TO</th>
                      <th>PF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getPlayersWithStats().map(playerStat => (
                      <tr key={`${playerStat.team}|${playerStat.name}`}>
                        <td className="font-medium">{playerStat.teamName}</td>
                        <td className="font-medium">{playerStat.name}</td>
                        <td>{playerStat.points}</td>
                        <td>{playerStat.fgMade}/{playerStat.fgAttempts}</td>
                        <td>{playerStat.fgPercentage}%</td>
                        <td>{playerStat.twoPtMade}/{playerStat.twoPtAttempts}</td>
                        <td>{playerStat.twoPtPercentage}%</td>
                        <td>{playerStat.threePtMade}/{playerStat.threePtAttempts}</td>
                        <td>{playerStat.threePtPercentage}%</td>
                        <td>{playerStat.ftMade}/{playerStat.ftAttempts}</td>
                        <td>{playerStat.ftPercentage}%</td>
                        <td>{playerStat.rebounds}</td>
                        <td>{playerStat.assists}</td>
                        <td>{playerStat.steals}</td>
                        <td>{playerStat.blocks}</td>
                        <td>{playerStat.turnovers}</td>
                        <td>{playerStat.fouls}</td>
                      </tr>
                    ))}
                    {getPlayersWithStats().length === 0 && (
                      <tr>
                        <td colSpan="17" className="text-center py-4">No player stats available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Game Title and Save Button - Moved below stats */}
          {videoId && (
            <div className="card bg-base-100 shadow-xl overflow-hidden mt-10">
              <div className="card-body">
                <h2 className="card-title">Game Management</h2>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Game Title</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <input
                      type="text"
                      placeholder="Enter game title (e.g., Team A vs Team B - 2023)"
                      className="input input-bordered flex-grow"
                      value={gameTitle}
                      onChange={(e) => setGameTitle(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <button
                        className="btn btn-primary"
                        onClick={saveGameToDatabase}
                        disabled={savingToDb || !gameTitle.trim() || stats.length === 0}
                      >
                        {savingToDb ? (
                          <>
                            <span className="loading loading-spinner loading-xs"></span>
                            Saving...
                          </>
                        ) : (
                          "Save Game"
                        )}
                      </button>
                      <button
                        className="btn btn-error"
                        onClick={clearStats}
                        disabled={stats.length === 0}
                      >
                        Clear Stats
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs opacity-70">
                      Save your game stats to view later. You need to be logged in to save games.
                    </p>
                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={() => setCurrentPage('saved-games')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      View Saved Games
                    </button>
                  </div>
                </div>
              </div>
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
    </div>
  );
};

export default Youtube; 