import React, { useState, useEffect, useRef } from 'react';
import { useNotification } from './contexts/NotificationContext';
import { useAuth } from './contexts/AuthContext';
import { STATS_ENDPOINTS, STATS_V2_ENDPOINTS, createApiHeaders } from './config/apiConfig';

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
  const [selectedStatType, setSelectedStatType] = useState('FG Made');
  const [showTeamSetup, setShowTeamSetup] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [recentStat, setRecentStat] = useState(null);
  const recentStatTimeoutRef = useRef(null);
  const { success, error: showError, warning, info } = useNotification();
  const [hasShownTeamGuide, setHasShownTeamGuide] = useState(() => {
    const shown = localStorage.getItem('hasShownTeamGuide');
    return shown === 'true';
  });
  const [hasClickedEditTeams, setHasClickedEditTeams] = useState(() => {
    return localStorage.getItem('hasClickedEditTeams') === 'true';
  });
  const [hasClickedAddPlayer, setHasClickedAddPlayer] = useState(() => {
    return localStorage.getItem('hasClickedAddPlayer') === 'true';
  });

  useEffect(() => {
    if (!hasShownTeamGuide) {
      const timer = setTimeout(() => {
        info('Pro Tip: Start by setting up your teams and players using the buttons above the video 🏀');
        setHasShownTeamGuide(true);
        localStorage.setItem('hasShownTeamGuide', 'true');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasShownTeamGuide]);

  // Load YouTube API
  useEffect(() => {
    // Check if there's a continued game to load
    try {
      const continuedGameJSON = localStorage.getItem('continue-game');
      if (continuedGameJSON) {
        const continuedGame = JSON.parse(continuedGameJSON);
        setVideoUrl(continuedGame.videoUrl);
        setVideoId(continuedGame.videoId);
        setGameTitle(continuedGame.title || '');
        if (continuedGame.teams) {
          setTeams(continuedGame.teams);
        }
        if (continuedGame.stats && Array.isArray(continuedGame.stats)) {
          setStats(continuedGame.stats);
        }
        
        // Clear the continued game data to prevent reloading on refresh
        localStorage.removeItem('continue-game');
        
        info('Loaded saved game. You can continue tracking stats.');
      }
    } catch (err) {
      console.error('Error loading continued game:', err);
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
    
    // Load API and clean up on unmount
    loadYouTubeAPI().catch(err => {
      console.error('Error loading YouTube API:', err);
      warning('Error loading YouTube player. Please refresh the page.');
    });
    
    // Clean up
    return () => {
      if (timeUpdateInterval.current) {
        clearInterval(timeUpdateInterval.current);
      }
      
      // Also destroy player if it exists
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (err) {
          console.error('Error destroying player:', err);
        }
      }
    };
  }, []);

  // Reset timer when component unmounts
  useEffect(() => {
    return () => {
      if (recentStatTimeoutRef.current) {
        clearTimeout(recentStatTimeoutRef.current);
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
      warning('Please enter a YouTube URL');
      return;
    }

    setLoading(true);
    
    try {
      const id = extractVideoId(videoUrl);
      
      if (!id) {
        warning('Invalid YouTube URL. Please enter a valid URL');
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
            warning('Error loading player. Please try again.');
            setLoading(false);
            return;
          }
          
          if (window.YT && window.YT.Player) {
            console.log('YouTube API is ready, initializing player');
            initializePlayer(id);
            setLoading(false);
            success('Video loaded successfully!');
          } else {
            console.log('YouTube API not ready yet, waiting...');
            // If the API isn't loaded yet, set a function to be called when it is
            window.onYouTubeIframeAPIReady = () => {
              console.log('YouTube API now ready, initializing player');
              initializePlayer(id);
              setLoading(false);
              success('Video loaded successfully!');
            };
          }
        }, 500);
      };
      
      loadPlayer();
    } catch (err) {
      console.error('Error in handleSubmit:', err);
      warning('Error loading video. Please try again.');
      setLoading(false);
    }
  };

  const initializePlayer = (videoId) => {
    try {
      console.log('Creating YouTube player for video ID:', videoId);
      
      // Ensure container exists and is empty
      const container = document.getElementById('youtube-player');
      if (!container) {
        console.error('Player container not found!');
        warning('Error loading player. Please try again.');
        return;
      }
      
      // Only initialize if player doesn't exist or has a different video
      if (!playerRef.current || playerRef.current.getVideoData().video_id !== videoId) {
        console.log('Initializing new player instance');
        
        // Clear any existing content
        container.innerHTML = '';
        
        // Add a loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'absolute inset-0 flex items-center justify-center bg-black';
        loadingDiv.innerHTML = `
          <div class="loading loading-spinner loading-lg text-primary"></div>
        `;
        container.appendChild(loadingDiv);
        
        // Create new player with a slight delay to ensure DOM is ready
        setTimeout(() => {
          try {
            // First clean up any existing player
            if (playerRef.current) {
              try {
                playerRef.current.destroy();
                playerRef.current = null;
              } catch (err) {
                console.error('Error destroying old player:', err);
              }
            }
            
            const newPlayer = new window.YT.Player('youtube-player', {
              videoId: videoId,
              playerVars: {
                autoplay: 0,
                controls: 1,
                modestbranding: 1,
                rel: 0,
                enablejsapi: 1,
                origin: window.location.origin,
                playsinline: 1,
                fs: 1,
                host: 'https://www.youtube-nocookie.com'
              },
              events: {
                onReady: (event) => {
                  console.log('=== Player Ready Event ===');
                  
                  // Force iframe visibility and z-index
                  const iframe = event.target.getIframe();
                  if (iframe) {
                    iframe.style.visibility = 'visible';
                    iframe.style.opacity = '1';
                    iframe.style.zIndex = '1';
                    iframe.style.position = 'absolute';
                    iframe.style.top = '0';
                    iframe.style.left = '0';
                    iframe.style.width = '100%';
                    iframe.style.height = '100%';
                  }
                  
                  onPlayerReady(event);
                },
                onStateChange: onPlayerStateChange,
                onError: (event) => {
                  console.error('YouTube Player Error:', event.data);
                  const errorMessages = {
                    2: 'Invalid parameter value',
                    5: 'HTML5 player error',
                    100: 'Video not found',
                    101: 'Video playback not allowed',
                    150: 'Video playback not allowed'
                  };
                  const errorMessage = errorMessages[event.data] || 'An error occurred while loading the video';
                  warning(errorMessage);
                }
              }
            });
            
            console.log('Player instance created:', newPlayer);
            setPlayer(newPlayer);
            playerRef.current = newPlayer;
            
          } catch (err) {
            console.error('Error initializing YouTube player:', err);
            warning('Error initializing video player. Please try again.');
          }
        }, 100);
      } else {
        console.log('Player already exists with correct video');
      }
    } catch (err) {
      console.error('Error in initializePlayer:', err);
      warning('Error setting up video player. Please try again.');
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
      } catch (err) {
        console.error('Error getting current time:', err);
      }
    }, 1000);
  };

  const onPlayerStateChange = (event) => {
    try {
      // Update playing state
      setIsPlaying(event.data === window.YT.PlayerState.PLAYING);
    } catch (err) {
      console.error('Error in player state change:', err);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  // Handle recording a stat
  const recordStat = (statType, value = 1) => {
    if (!selectedPlayer) {
      warning('Please select a player first');
      return;
    }

    try {
      // Check if player is properly initialized
      if (!player || !playerRef.current || typeof playerRef.current.getCurrentTime !== 'function') {
        warning('Video player is not ready yet. Please wait a moment and try again.');
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
      
      // Add to stats state
      setStats(prevStats => {
        const updatedStats = [...prevStats, newStat];
        // Save to local storage
        saveStatsToLocalStorage(updatedStats);
        return updatedStats;
      });
      
      // Set as recent stat for announcement
      setRecentStat(newStat);
      
      // Clear any existing timeout and set a new one
      if (recentStatTimeoutRef.current) {
        clearTimeout(recentStatTimeoutRef.current);
      }
      
      // Clear recent stat after 4 seconds
      recentStatTimeoutRef.current = setTimeout(() => {
        setRecentStat(null);
      }, 4000);
      
      // Show quick toast notification - don't specify position
      success(`Recorded: ${statType} for ${selectedPlayer} (${teams[selectedTeam].name}) at ${formatTime(time)}`);
      
    } catch (err) {
      console.error('Error recording stat:', err);
      warning('Error recording stat. Please try again.');
    }
  };
  
  const saveStatsToLocalStorage = (statsData) => {
    try {
      localStorage.setItem(`stats-${videoId}`, JSON.stringify(statsData));
    } catch (err) {
      console.error('Error saving stats to local storage:', err);
    }
  };

  const loadStatsFromLocalStorage = () => {
    try {
      const savedStats = localStorage.getItem(`stats-${videoId}`);
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }
    } catch (err) {
      console.error('Error loading stats from local storage:', err);
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
          warning('Error loading player. Please try reloading the page.');
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

    // Cleanup function
    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
          playerRef.current = null;
        } catch (err) {
          console.error('Error destroying player:', err);
        }
      }
    };
  }, [videoId]);

  const jumpToStatTime = (timestamp) => {
    if (playerRef.current) {
      playerRef.current.seekTo(timestamp, true);
    }
  };

  const handleTeamChange = (e) => {
    const newTeam = e.target.value;
    setSelectedTeam(newTeam);
    
    // Auto-select the first player of the new team
    const teamPlayers = teams[newTeam]?.players || [];
    if (teamPlayers.length > 0) {
      selectPlayerDirectly(teamPlayers[0]);
    } else {
      selectPlayerDirectly(null); // Clear selection if no players
    }
  };

  const handlePlayerChange = (e) => {
    setSelectedPlayer(e.target.value);
  };

  const handleTeamNameChange = (team, newName) => {
    if (newName.trim()) {
      setTeams(prev => ({
        ...prev,
        [team]: { ...prev[team], name: newName.trim() }
      }));
      // Mark edit teams as clicked
      if (!hasClickedEditTeams) {
        setHasClickedEditTeams(true);
        localStorage.setItem('hasClickedEditTeams', 'true');
      }
    }
  };
  
  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) {
      warning('Please enter a player name');
      return;
    }
    
    // Check if player already exists in the team
    if (teams[selectedTeam].players.includes(newPlayerName.trim())) {
      warning('This player already exists in the team');
      return;
    }
    
    // Mark add player as clicked
    if (!hasClickedAddPlayer) {
      setHasClickedAddPlayer(true);
      localStorage.setItem('hasClickedAddPlayer', 'true');
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
    success(`Added ${newPlayerName.trim()} to ${teams[selectedTeam].name}`);
  };
  
  const selectPlayerDirectly = (playerName) => {
    setSelectedPlayer(playerName);
    info(`Selected ${playerName}`);
  };
  
  const removePlayer = (playerName) => {
    // Don't allow removing a player if they have stats
    const playerHasStats = stats.some(stat => stat.player === playerName);
    if (playerHasStats) {
      warning(`Cannot remove ${playerName} - they have recorded stats`);
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
    
    success(`Removed ${playerName} from ${teams[selectedTeam].name}`);
  };
  
  const saveGameToDatabase = async () => {
    if (!currentUser) {
      warning('Please log in to save games');
      return;
    }
    
    if (!gameTitle.trim()) {
      warning('Please enter a title for this game');
      return;
    }
    
    if (stats.length === 0) {
      warning('No stats recorded yet. Record some stats before saving.');
      return;
    }
    
    try {
      setSavingToDb(true);
      
      // Create a clean copy of stats to ensure no unexpected references
      const statsToSave = [...stats].map(stat => ({
        type: stat.type,
        value: stat.value || 1,
        player: stat.player,
        team: stat.team,
        timestamp: stat.timestamp,
        formattedTime: stat.formattedTime
      }));
      
      // Prepare data for saving
      const gameData = {
        title: gameTitle,
        videoId,
        videoUrl,
        userId: currentUser.uid,
        teams,
        stats: statsToSave,
        createdAt: new Date().toISOString()
      };
      
      console.log('Saving game data:', { title: gameData.title, statsCount: statsToSave.length });
      
      // Make API call to save the game using V2 endpoints
      const response = await fetch(STATS_V2_ENDPOINTS.SAVE_GAME, {
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
      
      // Give visual feedback of successful save
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
      
      success('Game saved successfully!');
      
      // Show post-save action dialog using DaisyUI modal
      const modal = document.createElement('dialog');
      modal.id = 'post-save-modal';
      modal.className = 'modal modal-bottom sm:modal-middle';
      modal.innerHTML = `
        <div class="modal-box bg-base-100">
          <h3 class="font-bold text-lg mb-4">Game Saved Successfully! 🎉</h3>
          <p class="py-4">What would you like to do next?</p>
          <div class="flex flex-col gap-3">
            <button onclick="window.postSaveAction('saved-games')" class="btn btn-primary gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              View Saved Games
            </button>
            <button onclick="window.postSaveAction('new')" class="btn btn-secondary gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Track New Game
            </button>
            <button onclick="window.postSaveAction('stay')" class="btn btn-ghost gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Stay Here
            </button>
          </div>
        </div>
        <form method="dialog" class="modal-backdrop">
          <button>close</button>
        </form>
      `;
      document.body.appendChild(modal);
      
      // Add window function to handle modal actions
      window.postSaveAction = (action) => {
        modal.close();
        modal.remove();
        switch (action) {
          case 'saved-games':
            setCurrentPage('saved-games');
            break;
          case 'new':
            localStorage.removeItem('continue-game');
            window.location.reload();
            break;
          case 'stay':
            // Do nothing, just close the modal
            break;
        }
      };
      
      modal.showModal();
      
    } catch (err) {
      console.error('Error saving game:', err);
      warning('Failed to save game: ' + err.message);
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

  // Function to undo the most recent stat
  const undoLastStat = () => {
    setStats(prevStats => {
      if (prevStats.length === 0) {
        warning("No stats to undo");
        return prevStats;
      }
      
      // Get the last stat for the notification
      const lastStat = prevStats[prevStats.length - 1];
      const statDescription = `${lastStat.type} for ${lastStat.player} at ${lastStat.formattedTime}`;
      
      // Create a copy without the last stat
      const updatedStats = prevStats.slice(0, -1);
      
      // Save to local storage
      saveStatsToLocalStorage(updatedStats);
      
      success(`Undone: ${statDescription}`);
      return updatedStats;
    });
  };
  
  // Function to delete a specific stat by ID
  const deleteStat = (statId) => {
    // Find the stat to provide context in the confirmation
    const statToDelete = stats.find(stat => stat.id === statId);
    if (!statToDelete) return;
    
    const statDescription = `${statToDelete.type} for ${statToDelete.player} at ${statToDelete.formattedTime}`;
    
    if (window.confirm(`Are you sure you want to delete this stat: ${statDescription}?`)) {
      setStats(prevStats => {
        const updatedStats = prevStats.filter(stat => stat.id !== statId);
        
        // Save to local storage
        saveStatsToLocalStorage(updatedStats);
        
        success("Stat deleted");
        return updatedStats;
      });
    }
  };

  // Function to clear all stats
  const clearStats = () => {
    if (window.confirm("Are you sure you want to clear all stats? This cannot be undone.")) {
      setStats([]);
      localStorage.removeItem(`stats-${videoId}`);
      success("All stats have been cleared");
    }
  };

  const loadYouTubePlayer = () => {
    if (typeof YT === 'undefined' || !YT.Player) {
      // Load the IFrame Player API code asynchronously
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      
      // Create the player once the API is ready
      window.onYouTubeIframeAPIReady = createPlayer;
    } else {
      createPlayer();
    }
  };

  const createPlayer = () => {
    try {
      console.log('=== Starting Player Creation ===');
      
      // Clean up any existing player
      if (playerRef.current) {
        console.log('Cleaning up existing player...');
        try {
          playerRef.current.destroy();
          playerRef.current = null;
        } catch (err) {
          console.error('Error destroying old player:', err);
        }
      }

      // Get container and clear it
      const container = document.getElementById('youtube-player');
      if (!container) {
        console.error('Player container not found!');
        warning('Error loading player. Please try again.');
        return;
      }
      
      container.innerHTML = '';

      // Create new player with autoplay disabled
      console.log('Creating new YouTube player instance...');
      const newPlayer = new YT.Player('youtube-player', {
        videoId: videoId,
        playerVars: {
          autoplay: 0, // Disable autoplay
          controls: 1,
          modestbranding: 1,
          rel: 0,
          enablejsapi: 1,
          origin: window.location.origin,
          playsinline: 1
        },
        events: {
          onReady: (event) => {
            console.log('=== Player Ready Event ===');
            console.log('Player state:', event.target.getPlayerState());
            console.log('Video URL:', event.target.getVideoUrl());
            
            // Force iframe visibility after a short delay
            setTimeout(() => {
              const iframe = event.target.getIframe();
              if (iframe) {
                iframe.style.position = 'absolute';
                iframe.style.top = '0';
                iframe.style.left = '0';
                iframe.style.width = '100%';
                iframe.style.height = '100%';
                iframe.style.opacity = '1';
                iframe.style.visibility = 'visible';
                iframe.style.pointerEvents = 'auto';
              }
            }, 100);
            
            onPlayerReady(event);
          },
          onStateChange: (event) => {
            console.log('=== Player State Change ===');
            console.log('New state:', event.data);
            onPlayerStateChange(event);
          },
          onError: (event) => {
            console.error('=== YouTube Player Error ===');
            console.error('Error code:', event.data);
            const errorMessages = {
              2: 'Invalid parameter value',
              5: 'HTML5 player error',
              100: 'Video not found',
              101: 'Video playback not allowed',
              150: 'Video playback not allowed'
            };
            const errorMessage = errorMessages[event.data] || 'An error occurred while loading the video';
            console.error('Error message:', errorMessage);
            warning(errorMessage);
          }
        }
      });

      console.log('Player instance created:', newPlayer);
      setPlayer(newPlayer);
      playerRef.current = newPlayer;

    } catch (err) {
      console.error('=== Error in createPlayer ===');
      console.error(err);
      warning('Error initializing video player. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-base-200 to-base-300">
      {/* Main Container - Reduced padding */}
      <div className="container mx-auto px-2 sm:px-4 pt-16 pb-6">
        {/* Hero Section - Reduced padding and margin */}
        <section className="py-4 sm:py-6 relative overflow-hidden rounded-2xl bg-base-100/50 backdrop-blur-sm border border-base-content/5 shadow-xl mb-4">
          {/* Enhanced decorative elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5"></div>
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-700"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/5 to-secondary/5 rounded-full blur-3xl animate-slow-spin"></div>
          
          {/* Basketball Pattern Overlay with enhanced opacity control */}
          <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 30c15.71 0 28.45-12.74 28.45-28.45h3C61.45 17.45 47.45 31.45 30 31.45S-1.45 17.45-1.45 1.55h3C1.55 17.26 14.29 30 30 30z' fill='%23ff6b00' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}/>
          
          <div className="max-w-7xl mx-auto px-6 relative">
            <div className="text-center mb-12">
              {/* Enhanced Title Section */}
              <div className="relative inline-block group mb-8">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative">
                  <div className="inline-flex items-center gap-3 px-8 py-4 bg-base-100 rounded-full text-2xl sm:text-3xl font-bold shadow-lg transform-gpu transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-xl border border-base-content/5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      GAME STATS TRACKER
                    </span>
                  </div>
                </div>
              </div>
            
              {/* Enhanced Description */}
              <p className="text-lg sm:text-xl opacity-80 max-w-2xl mx-auto mb-12 leading-relaxed">
                Track game stats in real-time while watching basketball videos. 
                <span className="hidden sm:inline"><br /></span>
                Analyze performance, track progress, and improve your game.
              </p>

              {/* Video URL Input Form - Enhanced */}
              {!videoId && (
                <div className="max-w-3xl mx-auto">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    <form onSubmit={handleSubmit} className="relative bg-base-100 ring-1 ring-base-content/5 rounded-lg p-6 sm:p-8">
                      <div className="space-y-6">
                        {/* URL Input - Enhanced */}
                        <div>
                          <label className="block text-sm font-medium mb-2 opacity-70">YouTube Video URL</label>
                          <div className="relative group/input">
                            <div className={`transition-all duration-300 rounded-xl border-2 ${focused ? 'border-primary shadow-lg scale-[1.01]' : 'border-base-300'} overflow-hidden bg-base-200/50 hover:border-primary/50 transform-gpu`}>
                              <div className="flex items-center px-4 py-3">
                                <div className={`transition-all duration-300 ${focused ? 'scale-110 text-primary' : 'text-base-content/40'}`}>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="h-5 w-5 mr-4"
                                  >
                                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                                  </svg>
                                </div>
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
                            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 blur-xl transition-opacity duration-300 group-hover/input:opacity-100"></div>
                          </div>
                        </div>

                        {/* Submit Button - Enhanced */}
                        <button 
                          type="submit" 
                          className="relative w-full transition-all duration-300 overflow-hidden group/btn"
                          disabled={loading}
                        >
                          <div className="h-12 bg-gradient-to-r from-primary to-secondary rounded-xl flex items-center justify-center text-white font-medium group-hover/btn:opacity-90 transition-opacity shadow-md">
                            {loading ? (
                              <div className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Loading Video</span>
                              </div>
                            ) : (
                              <span className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                </svg>
                                Load Video
                              </span>
                            )}
                          </div>
                          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary to-secondary opacity-50 blur-lg transition-all duration-300 scale-90 group-hover:scale-100 group-hover:opacity-60"></div>
                        </button>

                        {/* Features Preview - Enhanced */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-base-content/10">
                          {[
                            {
                              icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
                              title: 'Real-time Stats',
                              description: 'Track game statistics as they happen with our intuitive interface'
                            },
                            {
                              icon: 'M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
                              title: 'Advanced Analytics',
                              description: 'Get detailed insights and performance metrics for your games'
                            },
                            {
                              icon: 'M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2',
                              title: 'Export & Share',
                              description: 'Export stats in multiple formats and share with your team'
                            }
                          ].map((feature, index) => (
                            <div key={index} className="relative group/feature">
                              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl blur opacity-0 transition-opacity duration-300 group-hover/feature:opacity-100"></div>
                              <div className="relative bg-base-200/50 p-6 rounded-xl hover:bg-base-200 transition-all duration-300 transform-gpu hover:scale-[1.02]">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover/feature:scale-110 transition-transform duration-300">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={feature.icon} />
                                  </svg>
                                </div>
                                <h3 className="font-bold mb-2">{feature.title}</h3>
                                <p className="text-sm opacity-70">{feature.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Quick Tips - Enhanced */}
                        <div className="relative group/tips">
                          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl blur opacity-0 transition-opacity duration-300 group-hover/tips:opacity-100"></div>
                          <div className="relative bg-base-200/30 rounded-xl p-4 mt-6 hover:bg-base-200/40 transition-colors">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover/tips:scale-110 transition-transform duration-300">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <span className="font-medium">Quick Tips</span>
                            </div>
                            <ul className="text-sm space-y-2 opacity-70">
                              <li className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                                Paste any YouTube basketball game URL to start tracking
                              </li>
                              <li className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                                Use keyboard shortcuts for faster stat recording
                              </li>
                              <li className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                                Stats are automatically saved as you track
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Rest of the component - Reduced spacing */}
        <div className="min-h-screen pt-4 pb-6">
          {/* Increased max-width for larger screens */}
          <div className="max-w-[99%] max-w-[3000px] mx-auto px-2">
            {videoId && (
              <div className="rounded-2xl bg-base-100/50 backdrop-blur-sm border border-base-content/5 shadow-xl p-4 mb-4">
                {/* Game Title/Save Bar - Reduced margin */}
                <div className="mb-4">
                  <div className="flex gap-3 items-center">
                    <div className="grow">
                      <div className="join w-full">
                        <input
                          type="text"
                          placeholder="Enter game title..."
                          className="input input-bordered join-item w-full h-10 min-h-0 text-base"
                          value={gameTitle}
                          onChange={(e) => setGameTitle(e.target.value)}
                        />
                        <button
                          className={`btn join-item h-10 min-h-0 px-4 ${isSaved ? 'btn-success' : 'btn-primary'}`}
                          onClick={saveGameToDatabase}
                          disabled={savingToDb || !gameTitle.trim() || stats.length === 0 || !currentUser}
                        >
                          {savingToDb ? (
                            <span className="loading loading-spinner loading-sm"></span>
                          ) : isSaved ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            "Save"
                          )}
                        </button>
                      </div>
                      {!currentUser && (
                        <p className="text-xs mt-1 opacity-70">Sign in to save game stats</p>
                      )}
                    </div>
                    <div className="flex-none">
                      <button
                        className="btn h-10 min-h-0 btn-error gap-2"
                        onClick={clearStats}
                        disabled={stats.length === 0}
                        title="Clear all stats"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span className="hidden sm:inline">Clear Stats</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Main Content Area - Adjusted gap */}
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Left Side - Video and Timeline */}
                  <div className="lg:flex-1">
                    {/* Video Player Container - Reduced margin */}
                    <div className="card bg-base-100 shadow-xl overflow-hidden mb-4">
                      <div className="relative mx-auto w-full">
                        <div className="relative w-full" style={{ paddingBottom: '56.25%', backgroundColor: '#000', zIndex: '1' }}>
                          <div 
                            id="youtube-player" 
                            className="absolute inset-0 w-full h-full"
                            style={{ zIndex: '1' }}
                          ></div>
                        </div>
                      </div>
                      <div className="p-4 flex flex-wrap gap-3 justify-between items-center bg-base-200/50">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-primary">{formatTime(currentTime)}</span>
                          <div className="hidden sm:flex items-center gap-2">
                            <span className="text-sm opacity-70">Duration:</span>
                            <span className="font-medium">{formatTime((() => {
                              try {
                                return player && player.getPlayerState !== undefined ? player.getDuration() : 0;
                              } catch (err) {
                                return 0;
                              }
                            })())}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => setVideoId('')}
                            className="btn btn-sm btn-outline gap-2"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                            Change video
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Timeline Visualization - Reduced margin */}
                    <div className="card bg-base-100 shadow-xl overflow-hidden mb-4">
                      <div className="card-body">
                        <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
                          <h2 className="card-title">Stats Timeline</h2>
                          <div className="flex flex-wrap gap-2 text-xs">
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 rounded-full bg-primary"></div>
                              <span>{teams.team1.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="w-3 h-3 rounded-full bg-secondary"></div>
                              <span>{teams.team2.name}</span>
                            </div>
                          </div>
                        </div>
                        <div className="relative h-16 bg-base-200 rounded-xl overflow-hidden">
                          {player && stats.map(stat => {
                            const videoDuration = (() => {
                              try {
                                if (player.getPlayerState !== undefined) {
                                  return player.getDuration() || 600;
                                }
                                return 600;
                              } catch (err) {
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
                            } catch (err) {
                              return 0;
                            }
                          })())}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Stats Table - Reduced margin */}
                    <div className="card bg-base-100 shadow-xl overflow-hidden mb-4">
                      <div className="card-body">
                        <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
                          <h2 className="card-title">Recent Stats</h2>
                          <div className="flex gap-2">
                            {stats.length > 0 && (
                              <button 
                                onClick={undoLastStat}
                                className="btn btn-sm btn-outline gap-2"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                </svg>
                                Undo Last
                              </button>
                            )}
                            {stats.length > 10 && (
                              <div className="text-xs opacity-70 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                                Scroll for more
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="relative">
                          <div className="overflow-x-auto overflow-y-auto max-h-80 scrollbar-thin scrollbar-thumb-base-300 scrollbar-track-base-100 pr-2 pb-1 custom-scrollbar">
                            <table className="table table-zebra w-full">
                              <thead className="bg-base-200 sticky top-0 z-10">
                                <tr>
                                  <th className="hidden sm:table-cell">Time</th>
                                  <th>Team</th>
                                  <th>Player</th>
                                  <th>Stat</th>
                                  <th className="w-28">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {[...stats].sort((a, b) => b.timestamp - a.timestamp).map(stat => (
                                  <tr key={stat.id} className={`transition-all hover:bg-base-200 ${
                                    stat.type.includes('Made') ? 'bg-success/10' : 
                                    stat.type.includes('Missed') ? 'bg-error/10' : 
                                    ''
                                  }`}>
                                    <td className="hidden sm:table-cell">{stat.formattedTime}</td>
                                    <td className="whitespace-nowrap">{teams[stat.team].name}</td>
                                    <td className="whitespace-nowrap">{stat.player}</td>
                                    <td className={`whitespace-nowrap ${
                                      stat.type.includes('Made') ? 'text-success font-medium' : 
                                      stat.type.includes('Missed') ? 'text-error' : 
                                      ''
                                    }`}>{stat.type}</td>
                                    <td>
                                      <div className="flex gap-1">
                                        <button 
                                          onClick={() => jumpToStatTime(stat.timestamp)}
                                          className="btn btn-xs btn-outline"
                                          title={`Jump to ${stat.formattedTime}`}
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                          </svg>
                                        </button>
                                        <button 
                                          onClick={() => deleteStat(stat.id)}
                                          className="btn btn-xs btn-outline btn-error"
                                          title="Delete this stat"
                                        >
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                          </svg>
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                                {stats.length === 0 && (
                                  <tr>
                                    <td colSpan="5" className="text-center py-8">
                                      <div className="flex flex-col items-center gap-2 opacity-70">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        <span>No stats recorded yet</span>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                          {stats.length > 10 && (
                            <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-base-100 to-transparent pointer-events-none"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Stats Recording Panel */}
                  <div className="lg:w-96">
                    <div className="card bg-base-100 shadow-xl sticky top-24">
                      <div className="card-body">
                        <h2 className="card-title">Record Stats</h2>
                        
                        {/* Team/Player Selection */}
                        <div className="form-control mb-4">
                          {/* Team Selection Buttons */}
                          <div className="flex gap-2 mb-2">
                            <div className="flex-1 flex gap-2">
                              <button
                                className={`btn flex-1 ${selectedTeam === 'team1' ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => handleTeamChange({ target: { value: 'team1' } })}
                              >
                                {teams.team1.name}
                              </button>
                              <button
                                className={`btn flex-1 ${selectedTeam === 'team2' ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => handleTeamChange({ target: { value: 'team2' } })}
                              >
                                {teams.team2.name}
                              </button>
                            </div>
                          </div>

                          {/* Player Management */}
                          <div className="flex justify-between items-center mb-2">
                            <label className="label-text font-medium">Select Player</label>
                            <div className="flex gap-2 relative z-[9999]">
                              <div className="dropdown dropdown-end relative">
                                <label tabIndex={0} className="btn btn-ghost btn-xs">
                                  Edit Teams
                                </label>
                                {!hasClickedEditTeams && (
                                  <>
                                    <div className="absolute -top-2 -right-2 w-2 h-2 bg-primary rounded-full animate-ping"></div>
                                    <div className="absolute -top-2 -right-2 w-2 h-2 bg-primary rounded-full"></div>
                                  </>
                                )}
                                <div tabIndex={0} className="dropdown-content card card-compact w-64 p-2 shadow-xl bg-base-100 border border-base-200 z-[9999]">
                                  <div className="card-body">
                                    <h3 className="font-bold text-lg">Edit Team Names</h3>
                                    <div className="form-control">
                                      <label className="label">
                                        <span className="label-text">Team 1 Name</span>
                                      </label>
                                      <input 
                                        type="text"
                                        className="input input-bordered w-full"
                                        value={teams.team1.name}
                                        onChange={(e) => handleTeamNameChange('team1', e.target.value)}
                                      />
                                    </div>
                                    <div className="form-control">
                                      <label className="label">
                                        <span className="label-text">Team 2 Name</span>
                                      </label>
                                      <input 
                                        type="text"
                                        className="input input-bordered w-full"
                                        value={teams.team2.name}
                                        onChange={(e) => handleTeamNameChange('team2', e.target.value)}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="dropdown dropdown-end relative z-[1000]">
                                <label tabIndex={0} className="btn btn-ghost btn-xs">
                                  Add Player
                                </label>
                                {!hasClickedAddPlayer && (
                                  <>
                                    <div className="absolute -top-2 -right-2 w-2 h-2 bg-primary rounded-full animate-ping"></div>
                                    <div className="absolute -top-2 -right-2 w-2 h-2 bg-primary rounded-full"></div>
                                  </>
                                )}
                                <div tabIndex={0} className="dropdown-content card card-compact w-64 p-2 shadow-xl bg-base-100 border border-base-200 z-[1000]">
                                  <div className="card-body">
                                    <h3 className="font-bold text-lg">Add Player</h3>
                                    <div className="form-control">
                                      <label className="label">
                                        <span className="label-text">New Player Name</span>
                                      </label>
                                      <input
                                        type="text"
                                        placeholder="Enter player name"
                                        className="input input-bordered input-sm w-full"
                                        value={newPlayerName}
                                        onChange={(e) => setNewPlayerName(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddPlayer()}
                                      />
                                    </div>
                                    <div className="form-control">
                                      <button
                                        className="btn btn-primary btn-sm"
                                        onClick={handleAddPlayer}
                                        disabled={!newPlayerName.trim()}
                                      >
                                        Add Player
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Player Selection Grid */}
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            {teams[selectedTeam].players.map(player => (
                              <div key={player} className="relative group">
                                <button
                                  className={`btn btn-sm w-full ${selectedPlayer === player ? 'btn-primary' : 'btn-outline'} pr-8`}
                                  onClick={() => selectPlayerDirectly(player)}
                                >
                                  {player}
                                </button>
                                <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="dropdown dropdown-end">
                                    <label tabIndex={0} className="btn btn-ghost btn-xs">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                      </svg>
                                    </label>
                                    <ul tabIndex={0} className="dropdown-content z-[1000] menu p-2 shadow bg-base-100 rounded-box w-52 border border-base-200">
                                      <li>
                                        <button onClick={() => {
                                          const newName = prompt('Enter new name for ' + player);
                                          if (newName && newName.trim()) {
                                            const updatedPlayers = [...teams[selectedTeam].players];
                                            const playerIndex = updatedPlayers.indexOf(player);
                                            updatedPlayers[playerIndex] = newName.trim();
                                            setTeams(prev => ({
                                              ...prev,
                                              [selectedTeam]: {
                                                ...prev[selectedTeam],
                                                players: updatedPlayers
                                              }
                                            }));
                                            if (selectedPlayer === player) {
                                              setSelectedPlayer(newName.trim());
                                            }
                                            // Update stats with new player name
                                            setStats(prev => prev.map(stat => 
                                              stat.player === player && stat.team === selectedTeam
                                                ? { ...stat, player: newName.trim() }
                                                : stat
                                            ));
                                          }
                                        }}>
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                          </svg>
                                          Edit Name
                                        </button>
                                      </li>
                                      <li>
                                        <button onClick={() => removePlayer(player)} className="text-error">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                          </svg>
                                          Remove
                                        </button>
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                          {teams[selectedTeam].players.length === 0 && (
                            <div className="text-center py-4 text-sm opacity-70 bg-base-200/50 rounded-lg mt-2">
                              No players added. Click the "Add Player" button to start.
                            </div>
                          )}

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
                                  Made
                                </button>
                                <button 
                                  onClick={() => recordStat('FG Missed')}
                                  className="btn flex-1 bg-error hover:bg-error/80 border-error text-white"
                                  disabled={!selectedPlayer}
                                >
                                  Missed
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
                                  Made
                                </button>
                                <button 
                                  onClick={() => recordStat('3PT Missed')}
                                  className="btn flex-1 bg-error hover:bg-error/80 border-error text-white"
                                  disabled={!selectedPlayer}
                                >
                                  Missed
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
                                  Made
                                </button>
                                <button 
                                  onClick={() => recordStat('FT Missed')}
                                  className="btn flex-1 bg-error hover:bg-error/80 border-error text-white"
                                  disabled={!selectedPlayer}
                                >
                                  Missed
                                </button>
                              </div>
                            </div>
                            
                            <div className="stats-group">
                              <h3 className="text-sm font-medium uppercase opacity-70 mb-2">Other Stats</h3>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                          
                          {/* Undo button */}
                          <div className="mt-6 border-t border-base-300 pt-4">
                            <button 
                              onClick={undoLastStat}
                              className="btn btn-outline btn-block"
                              disabled={stats.length === 0}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                              </svg>
                              Undo Last Stat
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
              <div className="mt-10 mb-16 rounded-2xl bg-base-100/50 backdrop-blur-sm border border-base-content/5 shadow-xl p-6">
                <h2 className="text-2xl font-bold mb-6 text-center">Player Statistics</h2>
                
                <div className="space-y-6">
                  {/* Team 1 Stats */}
                  <div className="card bg-base-100 shadow-xl overflow-hidden border border-base-200">
                    <div className="card-body p-0">
                      <div className="bg-primary/5 p-4">
                        <h3 className="font-bold text-lg text-primary">{teams.team1.name}</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="table table-zebra w-full">
                          <thead className="sticky top-0 bg-base-100 z-10 shadow-sm text-xs">
                            <tr>
                              <th className="bg-base-200/50">Player</th>
                              <th>PTS</th>
                              <th>REB</th>
                              <th>AST</th>
                              <th>STL</th>
                              <th>BLK</th>
                              <th>TO</th>
                              <th>PF</th>
                              <th>FG</th>
                              <th>2PT</th>
                              <th>3PT</th>
                              <th>FT</th>
                              <th>FG%</th>
                              <th>2PT%</th>
                              <th>3PT%</th>
                              <th>FT%</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getPlayersWithStats()
                              .filter(playerStat => playerStat.team === 'team1')
                              .map(playerStat => (
                                <tr key={`${playerStat.team}|${playerStat.name}`} className="hover:bg-base-200/50 transition-colors">
                                  <td className="font-medium">{playerStat.name}</td>
                                  <td className="font-bold">{playerStat.points}</td>
                                  <td>{playerStat.rebounds}</td>
                                  <td>{playerStat.assists}</td>
                                  <td>{playerStat.steals}</td>
                                  <td>{playerStat.blocks}</td>
                                  <td>{playerStat.turnovers}</td>
                                  <td>{playerStat.fouls}</td>
                                  <td>{playerStat.fgMade}/{playerStat.fgAttempts}</td>
                                  <td>{playerStat.twoPtMade}/{playerStat.twoPtAttempts}</td>
                                  <td>{playerStat.threePtMade}/{playerStat.threePtAttempts}</td>
                                  <td>{playerStat.ftMade}/{playerStat.ftAttempts}</td>
                                  <td className={playerStat.fgPercentage >= 50 ? 'text-success' : playerStat.fgPercentage <= 30 ? 'text-error' : ''}>
                                    {playerStat.fgPercentage}%
                                  </td>
                                  <td className={playerStat.twoPtPercentage >= 50 ? 'text-success' : playerStat.twoPtPercentage <= 30 ? 'text-error' : ''}>
                                    {playerStat.twoPtPercentage}%
                                  </td>
                                  <td className={playerStat.threePtPercentage >= 40 ? 'text-success' : playerStat.threePtPercentage <= 25 ? 'text-error' : ''}>
                                    {playerStat.threePtPercentage}%
                                  </td>
                                  <td className={playerStat.ftPercentage >= 75 ? 'text-success' : playerStat.ftPercentage <= 50 ? 'text-error' : ''}>
                                    {playerStat.ftPercentage}%
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Team 2 Stats */}
                  <div className="card bg-base-100 shadow-xl overflow-hidden border border-base-200">
                    <div className="card-body p-0">
                      <div className="bg-secondary/5 p-4">
                        <h3 className="font-bold text-lg text-secondary">{teams.team2.name}</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="table table-zebra w-full">
                          <thead className="sticky top-0 bg-base-100 z-10 shadow-sm text-xs">
                            <tr>
                              <th className="bg-base-200/50">Player</th>
                              <th>PTS</th>
                              <th>REB</th>
                              <th>AST</th>
                              <th>STL</th>
                              <th>BLK</th>
                              <th>TO</th>
                              <th>PF</th>
                              <th>FG</th>
                              <th>2PT</th>
                              <th>3PT</th>
                              <th>FT</th>
                              <th>FG%</th>
                              <th>2PT%</th>
                              <th>3PT%</th>
                              <th>FT%</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getPlayersWithStats()
                              .filter(playerStat => playerStat.team === 'team2')
                              .map(playerStat => (
                                <tr key={`${playerStat.team}|${playerStat.name}`} className="hover:bg-base-200/50 transition-colors">
                                  <td className="font-medium">{playerStat.name}</td>
                                  <td className="font-bold">{playerStat.points}</td>
                                  <td>{playerStat.rebounds}</td>
                                  <td>{playerStat.assists}</td>
                                  <td>{playerStat.steals}</td>
                                  <td>{playerStat.blocks}</td>
                                  <td>{playerStat.turnovers}</td>
                                  <td>{playerStat.fouls}</td>
                                  <td>{playerStat.fgMade}/{playerStat.fgAttempts}</td>
                                  <td>{playerStat.twoPtMade}/{playerStat.twoPtAttempts}</td>
                                  <td>{playerStat.threePtMade}/{playerStat.threePtAttempts}</td>
                                  <td>{playerStat.ftMade}/{playerStat.ftAttempts}</td>
                                  <td className={playerStat.fgPercentage >= 50 ? 'text-success' : playerStat.fgPercentage <= 30 ? 'text-error' : ''}>
                                    {playerStat.fgPercentage}%
                                  </td>
                                  <td className={playerStat.twoPtPercentage >= 50 ? 'text-success' : playerStat.twoPtPercentage <= 30 ? 'text-error' : ''}>
                                    {playerStat.twoPtPercentage}%
                                  </td>
                                  <td className={playerStat.threePtPercentage >= 40 ? 'text-success' : playerStat.threePtPercentage <= 25 ? 'text-error' : ''}>
                                    {playerStat.threePtPercentage}%
                                  </td>
                                  <td className={playerStat.ftPercentage >= 75 ? 'text-success' : playerStat.ftPercentage <= 50 ? 'text-error' : ''}>
                                    {playerStat.ftPercentage}%
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center mt-4 text-sm opacity-70">
                  <div className="inline-flex gap-4">
                    <span>
                      <span className="inline-block w-3 h-3 rounded-full bg-success mr-1"></span> Good
                    </span>
                    <span>
                      <span className="inline-block w-3 h-3 rounded-full bg-error mr-1"></span> Needs Improvement
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Game Management - Compact Version */}
            {videoId && (
              <div className="rounded-2xl bg-base-100/50 backdrop-blur-sm border border-base-content/5 shadow-xl p-6 mt-10">
                <div className="card-body p-3">
                  <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
                    <div className="w-full sm:w-96">
                      <div className="join w-full">
                        <input
                          type="text"
                          placeholder="Enter game title..."
                          className="input input-bordered input-lg join-item w-full"
                          value={gameTitle}
                          onChange={(e) => setGameTitle(e.target.value)}
                        />
                        <button
                          className={`btn btn-lg join-item ${isSaved ? 'btn-success' : 'btn-primary'}`}
                          onClick={saveGameToDatabase}
                          disabled={savingToDb || !gameTitle.trim() || stats.length === 0 || !currentUser}
                        >
                          {savingToDb ? (
                            <span className="loading loading-spinner loading-sm"></span>
                          ) : isSaved ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            "Save"
                          )}
                        </button>
                      </div>
                      {!currentUser && (
                        <p className="text-xs mt-1 opacity-70">Sign in to save game stats</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="btn btn-lg btn-error gap-2"
                        onClick={clearStats}
                        disabled={stats.length === 0}
                        title="Clear all stats"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span className="hidden sm:inline">Clear Stats</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
           

            {/* Real-time Stat Announcer - Enhanced for Mobile */}
            {recentStat && (
              <div className="fixed top-20 sm:top-32 right-4 sm:right-8 z-40 animate-slideInRight">
                <div className="card shadow-lg border border-base-300 bg-base-100 w-64 sm:w-80 opacity-90 hover:opacity-100 transition-opacity">
                  <div className="card-body p-3">
                    <div className="text-xs opacity-70 mb-1">New Stat Recorded</div>
                    <div className="font-bold text-lg leading-tight">
                      {recentStat.player} 
                      <span className={
                        recentStat.type.includes('Made') ? ' text-success' : 
                        recentStat.type.includes('Missed') ? ' text-error' : ''
                      }> {recentStat.type}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span>{teams[recentStat.team]?.name || ''}</span>
                      <span className="font-mono">{recentStat.formattedTime}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(0, 0, 0, 0.1);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(0, 0, 0, 0.2);
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 0, 0, 0.1) transparent;
        }

        /* Animation for stat announcer */
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 0.9;
          }
        }

        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 0.9;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }

        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out forwards, slideOutRight 0.3s ease-in forwards 3.7s;
        }

        @keyframes slow-spin {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
        
        .animate-slow-spin {
          animation: slow-spin 60s linear infinite;
        }
        
        /* Enhanced background pattern */
        .bg-pattern {
          background-image: radial-gradient(circle at 1px 1px, rgba(0, 0, 0, 0.05) 1px, transparent 0);
          background-size: 24px 24px;
        }
      `}</style>
    </div>
  );
};

export default Youtube; 