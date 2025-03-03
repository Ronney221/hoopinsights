import React, { useState, useEffect } from 'react';
import { useNotification } from './contexts/NotificationContext';
import { useAuth } from './contexts/AuthContext';
import { STATS_ENDPOINTS, STATS_V2_ENDPOINTS, createApiHeaders } from './config/apiConfig';

const Shotify = ({ setCurrentPage }) => {
  const { currentUser } = useAuth();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [saving, setSaving] = useState(false);
  const [expandedSection, setExpandedSection] = useState('stats'); // 'stats' or 'timeline' or 'fullStats'
  const { success, error: notificationError, warning, info } = useNotification();
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

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

  const exportToJSON = () => {
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

    const jsonData = {
      gameInfo: {
        title: game.title,
        date: new Date().toISOString(),
        videoId: game.videoId,
        videoUrl: `https://www.youtube.com/watch?v=${game.videoId}`
      },
      teams: {
        [game.teams.team1.name]: {
          stats: team1Stats,
          players: team1Players
        },
        [game.teams.team2.name]: {
          stats: team2Stats,
          players: team2Players
        }
      }
    };

    // Create and trigger download
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${game.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_stats.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToPDF = async () => {
    // We'll use jspdf and jspdf-autotable for PDF generation
    const { jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text(game.title, 14, 20);
    
    // Add date
    doc.setFontSize(12);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Team Statistics
    doc.setFontSize(16);
    doc.text('Team Statistics', 14, 40);
    
    const team1Stats = getTeamStats('team1');
    const team2Stats = getTeamStats('team2');
    
    autoTable(doc, {
      startY: 45,
      head: [['Team', 'Points', 'FG%', '3P%', 'FT%', 'REB', 'AST', 'STL', 'BLK']],
      body: [
        [
          game.teams.team1.name,
          team1Stats.points,
          `${((team1Stats.fgMade/team1Stats.fgAttempts)*100||0).toFixed(1)}%`,
          `${((team1Stats.threePtMade/team1Stats.threePtAttempts)*100||0).toFixed(1)}%`,
          `${((team1Stats.ftMade/team1Stats.ftAttempts)*100||0).toFixed(1)}%`,
          team1Stats.rebounds,
          team1Stats.assists,
          team1Stats.steals,
          team1Stats.blocks
        ],
        [
          game.teams.team2.name,
          team2Stats.points,
          `${((team2Stats.fgMade/team2Stats.fgAttempts)*100||0).toFixed(1)}%`,
          `${((team2Stats.threePtMade/team2Stats.threePtAttempts)*100||0).toFixed(1)}%`,
          `${((team2Stats.ftMade/team2Stats.ftAttempts)*100||0).toFixed(1)}%`,
          team2Stats.rebounds,
          team2Stats.assists,
          team2Stats.steals,
          team2Stats.blocks
        ]
      ]
    });
    
    // Player Statistics
    doc.setFontSize(16);
    doc.text('Player Statistics', 14, doc.lastAutoTable.finalY + 20);
    
    const playerStats = [...game.teams.team1.players, ...game.teams.team2.players].map(player => {
      const stats = getPlayerStats(player, game.teams.team1.players.includes(player) ? 'team1' : 'team2');
      const team = game.teams.team1.players.includes(player) ? game.teams.team1.name : game.teams.team2.name;
      return [
        player,
        team,
        stats.points,
        `${stats.fgMade}/${stats.fgAttempts}`,
        `${stats.threePtMade}/${stats.threePtAttempts}`,
        `${stats.ftMade}/${stats.ftAttempts}`,
        stats.rebounds,
        stats.assists,
        stats.steals,
        stats.blocks
      ];
    });
    
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 25,
      head: [['Player', 'Team', 'PTS', 'FG', '3PT', 'FT', 'REB', 'AST', 'STL', 'BLK']],
      body: playerStats
    });
    
    // Save the PDF
    doc.save(`${game.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_stats.pdf`);
  };

  // Replace the Export Button section with the new design
  const ExportSection = () => (
    <div className="mb-6">
      <h3 className="text-lg font-bold mb-4">Export Formats</h3>
      <div className="grid grid-cols-3 gap-4">
        {[
          { format: 'CSV', icon: 'M10 18v-2m4 2v-2m4 2v-2M8 6h13a1 1 0 011 1v10a1 1 0 01-1 1H8a1 1 0 01-1-1V7a1 1 0 011-1z', description: 'Raw data export', onClick: exportToCSV },
          { format: 'PDF', icon: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', description: 'Detailed report', onClick: exportToPDF },
          { format: 'JSON', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16', description: 'API compatible', onClick: exportToJSON }
        ].map((item, index) => (
          <div 
            key={index} 
            className="bg-base-200/50 p-4 rounded-xl text-center hover:bg-base-200 transition-colors cursor-pointer group/format"
            onClick={item.onClick}
          >
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center group-hover/format:bg-primary/20 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
              </svg>
            </div>
            <div className="font-medium mb-1">{item.format}</div>
            <div className="text-xs opacity-60">{item.description}</div>
            {/* Download Progress - Initially Hidden */}
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
    if (!game || !game.teams || !game.teams[teamId]) return null;
    
    const leaders = {
      points: { value: 0, players: [] },
      rebounds: { value: 0, players: [] },
      assists: { value: 0, players: [] },
      steals: { value: 0, players: [] },
      blocks: { value: 0, players: [] },
      fgPercentage: { value: 0, players: [] },
      threePtMade: { value: 0, players: [] },
      turnovers: { value: 0, players: [] },
      ftPercentage: { value: 0, players: [] }
    };
    
    game.teams[teamId].players.forEach(player => {
      const stats = getPlayerStats(player, teamId);
      if (!stats) return;
      
      // Update points leader
      if (stats.points > leaders.points.value) {
        leaders.points = { value: stats.points, players: [player] };
      } else if (stats.points === leaders.points.value) {
        leaders.points.players.push(player);
      }
      
      // Update rebounds leader
      if (stats.rebounds > leaders.rebounds.value) {
        leaders.rebounds = { value: stats.rebounds, players: [player] };
      } else if (stats.rebounds === leaders.rebounds.value) {
        leaders.rebounds.players.push(player);
      }
      
      // Update assists leader
      if (stats.assists > leaders.assists.value) {
        leaders.assists = { value: stats.assists, players: [player] };
      } else if (stats.assists === leaders.assists.value) {
        leaders.assists.players.push(player);
      }
      
      // Update steals leader
      if (stats.steals > leaders.steals.value) {
        leaders.steals = { value: stats.steals, players: [player] };
      } else if (stats.steals === leaders.steals.value) {
        leaders.steals.players.push(player);
      }
      
      // Update blocks leader
      if (stats.blocks > leaders.blocks.value) {
        leaders.blocks = { value: stats.blocks, players: [player] };
      } else if (stats.blocks === leaders.blocks.value) {
        leaders.blocks.players.push(player);
      }
      
      // Update FG% leader (minimum 5 attempts)
      if (stats.fgAttempts >= 5 && stats.fgPercentage > leaders.fgPercentage.value) {
        leaders.fgPercentage = { value: stats.fgPercentage, players: [player] };
      } else if (stats.fgAttempts >= 5 && stats.fgPercentage === leaders.fgPercentage.value) {
        leaders.fgPercentage.players.push(player);
      }
      
      // Update 3PT made leader
      if (stats.threePtMade > leaders.threePtMade.value) {
        leaders.threePtMade = { value: stats.threePtMade, players: [player] };
      } else if (stats.threePtMade === leaders.threePtMade.value) {
        leaders.threePtMade.players.push(player);
      }
      
      // Update turnovers leader
      if (stats.turnovers > leaders.turnovers.value) {
        leaders.turnovers = { value: stats.turnovers, players: [player] };
      } else if (stats.turnovers === leaders.turnovers.value) {
        leaders.turnovers.players.push(player);
      }
      
      // Update FT% leader (minimum 2 attempts)
      if (stats.ftAttempts >= 2 && stats.ftPercentage > leaders.ftPercentage.value) {
        leaders.ftPercentage = { value: stats.ftPercentage, players: [player] };
      } else if (stats.ftAttempts >= 2 && stats.ftPercentage === leaders.ftPercentage.value) {
        leaders.ftPercentage.players.push(player);
      }
    });
    
    return leaders;
  };

  const calculateBadges = (stats, teamLeaders) => {
    const badges = [];
    
    // MVP Badge (points + assists * 2)
    const mvpScore = stats.points + (stats.assists * 2);
    if (mvpScore > 0) {
      if (mvpScore >= 30) {
        badges.push({ 
          name: 'MVP', 
          icon: '🏆🏆🏆', 
          level: 'Gold', 
          progress: 100,
          description: `Generated ${stats.points} points and ${stats.assists * 2} potential points from assists`,
          metrics: 'Points + (Assists × 2) ≥ 30'
        });
      } else if (mvpScore >= 20) {
        badges.push({ 
          name: 'MVP', 
          icon: '🏆🏆', 
          level: 'Silver', 
          progress: 75,
          description: `Generated ${stats.points} points and ${stats.assists * 2} potential points from assists`,
          metrics: 'Points + (Assists × 2) ≥ 20'
        });
      } else if (mvpScore >= 10) {
        badges.push({ 
          name: 'MVP', 
          icon: '🏆', 
          level: 'Bronze', 
          progress: 45,
          description: `Generated ${stats.points} points and ${stats.assists * 2} potential points from assists`,
          metrics: 'Points + (Assists × 2) ≥ 10'
        });
      }
    }
    
    // Big Man Badge (rebounds + blocks * 2)
    const bigManScore = stats.rebounds + (stats.blocks * 2);
    if (bigManScore > 0) {
      if (bigManScore >= 15) {
        badges.push({ 
          name: 'Big Man', 
          icon: '💪💪💪', 
          level: 'Gold', 
          progress: 100,
          description: `Dominated the paint with ${stats.rebounds} rebounds and ${stats.blocks} blocks`,
          metrics: 'Rebounds + (Blocks × 2) ≥ 15'
        });
      } else if (bigManScore >= 10) {
        badges.push({ 
          name: 'Big Man', 
          icon: '💪💪', 
          level: 'Silver', 
          progress: 75,
          description: `Dominated the paint with ${stats.rebounds} rebounds and ${stats.blocks} blocks`,
          metrics: 'Rebounds + (Blocks × 2) ≥ 10'
        });
      } else if (bigManScore >= 5) {
        badges.push({ 
          name: 'Big Man', 
          icon: '💪', 
          level: 'Bronze', 
          progress: 45,
          description: `Dominated the paint with ${stats.rebounds} rebounds and ${stats.blocks} blocks`,
          metrics: 'Rebounds + (Blocks × 2) ≥ 5'
        });
      }
    }
    
    // Playmaker Badge (assists vs turnovers)
    if (stats.assists > 0) {
      const assistRatio = stats.assists / (stats.turnovers || 1);
      if (assistRatio >= 3) {
        badges.push({ 
          name: 'Playmaker', 
          icon: '🏀🏀🏀', 
          level: 'Gold', 
          progress: 100,
          description: `${stats.assists}:${stats.turnovers} assist to turnover ratio`,
          metrics: 'Assist:Turnover Ratio ≥ 3:1'
        });
      } else if (assistRatio >= 2) {
        badges.push({ 
          name: 'Playmaker', 
          icon: '🏀🏀🏀', 
          level: 'Silver', 
          progress: 75,
          description: `${stats.assists}:${stats.turnovers} assist to turnover ratio`,
          metrics: 'Assist:Turnover Ratio ≥ 2:1'
        });
      } else if (assistRatio >= 1.5) {
        badges.push({ 
          name: 'Playmaker', 
          icon: '🏀', 
          level: 'Bronze', 
          progress: 45,
          description: `${stats.assists}:${stats.turnovers} assist to turnover ratio`,
          metrics: 'Assist:Turnover Ratio ≥ 1.5:1'
        });
      }
    }
    
    // Lockdown Defender Badge (steals + blocks)
    const defenseScore = (stats.steals * 2) + (stats.blocks * 2);
    if (defenseScore > 0) {
      if (defenseScore >= 10) {
        badges.push({ 
          name: 'Lockdown', 
          icon: '🛡️🛡️🛡️', 
          level: 'Gold', 
          progress: 100,
          description: `Defensive force with ${stats.steals} steals and ${stats.blocks} blocks`,
          metrics: '(Steals × 2) + (Blocks × 2) ≥ 10'
        });
      } else if (defenseScore >= 6) {
        badges.push({ 
          name: 'Lockdown', 
          icon: '🛡️🛡️', 
          level: 'Silver', 
          progress: 75,
          description: `Defensive force with ${stats.steals} steals and ${stats.blocks} blocks`,
          metrics: '(Steals × 2) + (Blocks × 2) ≥ 6'
        });
      } else if (defenseScore >= 4) {
        badges.push({ 
          name: 'Lockdown', 
          icon: '🛡️', 
          level: 'Bronze', 
          progress: 45,
          description: `Defensive force with ${stats.steals} steals and ${stats.blocks} blocks`,
          metrics: '(Steals × 2) + (Blocks × 2) ≥ 4'
        });
      }
    }
    
    // Sharpshooter Badge (FG% and 3PT makes)
    if (stats.fgAttempts >= 5 || stats.threePtMade >= 2) {
      const shootingScore = ((stats.fgPercentage * 0.6) + (stats.threePtMade * 15)) / 2;
      if (shootingScore >= 50) {
        badges.push({ 
          name: 'Sharpshooter', 
          icon: '🎯🎯🎯', 
          level: 'Gold', 
          progress: 100,
          description: `${stats.fgPercentage}% FG with ${stats.threePtMade} three-pointers made`,
          metrics: '(FG% × 0.6 + 3PM × 15) ÷ 2 ≥ 50'
        });
      } else if (shootingScore >= 35) {
        badges.push({ 
          name: 'Sharpshooter', 
          icon: '🎯🎯', 
          level: 'Silver', 
          progress: 75,
          description: `${stats.fgPercentage}% FG with ${stats.threePtMade} three-pointers made`,
          metrics: '(FG% × 0.6 + 3PM × 15) ÷ 2 ≥ 35'
        });
      } else if (shootingScore >= 25) {
        badges.push({ 
          name: 'Sharpshooter', 
          icon: '🎯🎯', 
          level: 'Bronze', 
          progress: 45,
          description: `${stats.fgPercentage}% FG with ${stats.threePtMade} three-pointers made`,
          metrics: '(FG% × 0.6 + 3PM × 15) ÷ 2 ≥ 25'
        });
      }
    }
    
    // Bricks Badge (poor shooting)
    if (stats.fgAttempts >= 5) {
      const brickScore = (100 - stats.fgPercentage) + (100 - stats.ftPercentage);
      if (brickScore >= 120) {
        badges.push({ 
          name: 'Bricklayer', 
          icon: '🧱🧱🧱', 
          level: 'Gold', 
          progress: 100,
          description: `Struggled with ${stats.fgPercentage}% FG and ${stats.ftPercentage}% FT`,
          metrics: '(100 - FG%) + (100 - FT%) ≥ 120'
        });
      } else if (brickScore >= 100) {
        badges.push({ 
          name: 'Bricklayer', 
          icon: '🧱🧱', 
          level: 'Silver', 
          progress: 75,
          description: `Struggled with ${stats.fgPercentage}% FG and ${stats.ftPercentage}% FT`,
          metrics: '(100 - FG%) + (100 - FT%) ≥ 100'
        });
      } else if (brickScore >= 80) {
        badges.push({ 
          name: 'Bricklayer', 
          icon: '🧱', 
          level: 'Bronze', 
          progress: 45,
          description: `Struggled with ${stats.fgPercentage}% FG and ${stats.ftPercentage}% FT`,
          metrics: '(100 - FG%) + (100 - FT%) ≥ 80'
        });
      }
    }
    
    // Butterfingers Badge (high turnovers)
    if (stats.turnovers > 0) {
      const turnoverRatio = stats.turnovers / (stats.assists || 1);
      if (turnoverRatio >= 3 && stats.turnovers >= 4) {
        badges.push({ 
          name: 'Butterfingers', 
          icon: '🧈🧈🧈', 
          level: 'Gold', 
          progress: 100,
          description: `${stats.turnovers} turnovers with ${stats.assists} assists`,
          metrics: 'Turnover:Assist Ratio ≥ 3:1 and TO ≥ 4'
        });
      } else if (turnoverRatio >= 2 && stats.turnovers >= 3) {
        badges.push({ 
          name: 'Butterfingers', 
          icon: '🧈🧈', 
          level: 'Silver', 
          progress: 75,
          description: `${stats.turnovers} turnovers with ${stats.assists} assists`,
          metrics: 'Turnover:Assist Ratio ≥ 2:1 and TO ≥ 3'
        });
      } else if (turnoverRatio >= 1.5 && stats.turnovers >= 2) {
        badges.push({ 
          name: 'Butterfingers', 
          icon: '🧈', 
          level: 'Bronze', 
          progress: 45,
          description: `${stats.turnovers} turnovers with ${stats.assists} assists`,
          metrics: 'Turnover:Assist Ratio ≥ 1.5:1 and TO ≥ 2'
        });
      }
    }
    
    return badges;
  };

  const sortData = (data, key) => {
    if (!key) return data;
    
    return [...data].sort((a, b) => {
      let aValue, bValue;
      
      switch (key) {
        case 'points':
          aValue = a.points;
          bValue = b.points;
          break;
        case 'fgPercentage':
          aValue = a.fgPercentage;
          bValue = b.fgPercentage;
          break;
        case 'threePtPercentage':
          aValue = a.threePtPercentage;
          bValue = b.threePtPercentage;
          break;
        case 'ftPercentage':
          aValue = a.ftPercentage;
          bValue = b.ftPercentage;
          break;
        case 'rebounds':
          aValue = a.rebounds;
          bValue = b.rebounds;
          break;
        case 'assists':
          aValue = a.assists;
          bValue = b.assists;
          break;
        case 'steals':
          aValue = a.steals;
          bValue = b.steals;
          break;
        case 'blocks':
          aValue = a.blocks;
          bValue = b.blocks;
          break;
        case 'turnovers':
          aValue = a.turnovers;
          bValue = b.turnovers;
          break;
        default:
          return 0;
      }

      if (sortConfig.direction === 'asc') {
        return aValue - bValue;
      }
      return bValue - aValue;
    });
  };

  // Add this function after getTeamLeaders
  const calculateEfficiency = (stats) => {
    const {
      fgMade,
      fgAttempts,
      threePtMade,
      threePtAttempts,
      ftMade,
      ftAttempts,
      rebounds,
      assists,
      steals,
      blocks,
      turnovers,
      fouls
    } = stats;

    // Calculate shooting efficiency
    const fgScore = fgMade - (fgAttempts - fgMade);
    const threePtScore = (threePtMade * 1.5) - (threePtAttempts - threePtMade);
    const ftScore = ftMade - (ftAttempts - ftMade);

    // Calculate other contributions
    const reboundScore = rebounds * 0.5;
    const assistScore = assists * 1.5;
    const stealScore = steals * 2;
    const blockScore = blocks * 2;

    // Calculate negative contributions
    const turnoverScore = turnovers * -2;
    const foulScore = fouls * -0.5;

    // Combine all scores
    const totalScore = fgScore + threePtScore + ftScore + reboundScore + 
                      assistScore + stealScore + blockScore + turnoverScore + foulScore;

    return Math.round(totalScore);
  };

  const GameTimeline = () => {
    const [selectedQuarter, setSelectedQuarter] = useState(1);
    const [selectedPlayer, setSelectedPlayer] = useState(null);

    // Calculate scoring timeline data
    const timelineData = game.quarters.map((quarter, index) => {
      const team1Score = quarter.team1Score;
      const team2Score = quarter.team2Score;
      const leadChange = team1Score !== team2Score && 
                        (index === 0 || team1Score !== game.quarters[index - 1].team1Score || 
                         team2Score !== game.quarters[index - 1].team2Score);
      
      return {
        quarter: index + 1,
        team1Score,
        team2Score,
        leadChange,
        team1Momentum: team1Score - (index > 0 ? game.quarters[index - 1].team1Score : 0),
        team2Momentum: team2Score - (index > 0 ? game.quarters[index - 1].team2Score : 0)
      };
    });

    // Calculate player performance trends
    const playerTrends = game.teams.team1.players.map(player => {
      const stats = getPlayerStats(player, 'team1');
      const quarters = game.quarters.map((quarter, index) => {
        const quarterStats = quarter.team1Stats[player] || {};
        return {
          quarter: index + 1,
          points: quarterStats.points || 0,
          fgPercentage: quarterStats.fgPercentage || 0,
          threePtPercentage: quarterStats.threePtPercentage || 0,
          efficiency: calculateEfficiency(quarterStats)
        };
      });

      return {
        name: player,
        quarters,
        hotStreak: quarters.filter(q => q.points >= 8).length,
        coldStreak: quarters.filter(q => q.points === 0).length
      };
    });

    return (
      <div className="space-y-6">
        {/* Scoring Timeline */}
        <div className="bg-base-200 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Scoring Timeline</h3>
          <div className="relative h-64">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-1 bg-base-300"></div>
            </div>
            {timelineData.map((data, index) => (
              <div key={index} className="absolute top-0 left-0 w-full">
                <div className="flex justify-between px-4">
                  <div className={`text-sm ${data.team1Momentum > 0 ? 'text-success' : ''}`}>
                    {data.team1Score}
                  </div>
                  <div className={`text-sm ${data.team2Momentum > 0 ? 'text-success' : ''}`}>
                    {data.team2Score}
                  </div>
                </div>
                {data.leadChange && (
                  <div className="absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="bg-primary text-primary-content text-xs px-2 py-1 rounded-full">
                      Lead Change
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Player Performance Trends */}
        <div className="bg-base-200 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Player Performance Trends</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {playerTrends.map(player => (
              <div key={player.name} className="bg-base-100 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">{player.name}</h4>
                  <div className="flex gap-2">
                    {player.hotStreak > 0 && (
                      <div className="badge badge-success">Hot Streak</div>
                    )}
                    {player.coldStreak > 0 && (
                      <div className="badge badge-error">Cold Streak</div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  {player.quarters.map((quarter, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm opacity-60">Q{quarter.quarter}</span>
                      <div className="flex gap-4">
                        <span className="text-sm">{quarter.points} pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Moments */}
        <div className="bg-base-200 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Critical Moments</h3>
          <div className="space-y-4">
            {game.quarters.map((quarter, index) => (
              <div key={index} className="bg-base-100 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Quarter {index + 1}</h4>
                <div className="space-y-2">
                  {quarter.team1Stats && Object.entries(quarter.team1Stats).map(([player, stats]) => {
                    const efficiency = calculateEfficiency(stats);
                    if (efficiency >= 5 || stats.points >= 8) {
                      return (
                        <div key={player} className="flex justify-between items-center">
                          <span className="text-sm">{player}</span>
                          <div className="flex gap-2">
                            {stats.points >= 8 && (
                              <div className="badge badge-success">Clutch Shot</div>
                            )}
                            {efficiency >= 5 && (
                              <div className="badge badge-primary">Key Play</div>
                            )}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
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
                          className={`bg-base-200/50 p-4 rounded-xl cursor-pointer hover:bg-base-200 transition-colors ${selectedPlayer === player ? 'ring-2 ring-primary' : ''}`}
                                  onClick={() => setSelectedPlayer(selectedPlayer === player ? null : player)}
                                >
                          <div className="font-medium mb-2 h-6 flex items-center">{player}</div>
                          <div className="grid grid-cols-3 gap-2">
                            {statsList.map((stat, index) => (
                              <div key={index} className="text-center">
                                <div className="text-xs opacity-60">{stat.name}</div>
                                <div className="font-bold">{stat.value}</div>
                              </div>
                            ))}
                          </div>
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
                          className={`bg-base-200/50 p-4 rounded-xl cursor-pointer hover:bg-base-200 transition-colors ${selectedPlayer === player ? 'ring-2 ring-secondary' : ''}`}
                                  onClick={() => setSelectedPlayer(selectedPlayer === player ? null : player)}
                                >
                          <div className="font-medium mb-2 h-6 flex items-center">{player}</div>
                          <div className="grid grid-cols-3 gap-2">
                            {statsList.map((stat, index) => (
                              <div key={index} className="text-center">
                                <div className="text-xs opacity-60">{stat.name}</div>
                                <div className="font-bold">{stat.value}</div>
                              </div>
                            ))}
                          </div>
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
    </div>
  );
};

export default Shotify; 