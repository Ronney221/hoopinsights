const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Stat = require('../models/Stat');
const Video = require('../models/Video');
const { authenticateUser } = require('../middleware/auth');

// Create a new stat record
router.post('/', authenticateUser, async (req, res) => {
  try {
    const { videoId, type, value, player, team, timestamp, formattedTime } = req.body;
    
    // Validate required fields
    if (!videoId || !type || !player || !team || timestamp === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create new stat record
    const newStat = new Stat({
      videoId,
      type,
      value: value || 1,
      player,
      team,
      timestamp,
      formattedTime,
      createdBy: req.user.uid
    });

    const savedStat = await newStat.save();

    // Update the video's lastTrackedTime if this timestamp is later
    await Video.findOneAndUpdate(
      { youtubeId: videoId, lastTrackedTime: { $lt: timestamp } },
      { $set: { lastTrackedTime: timestamp } },
      { new: true }
    );

    res.status(201).json(savedStat);
  } catch (error) {
    console.error('Error creating stat record:', error);
    res.status(500).json({ error: 'Failed to create stat record' });
  }
});

// Get all stats for a specific video
router.get('/video/:youtubeId', async (req, res) => {
  try {
    const { youtubeId } = req.params;
    
    // Find the video first
    const video = await Video.findOne({ youtubeId });
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    // Get all stats for this video
    const stats = await Stat.find({ videoId: youtubeId })
      .sort({ timestamp: 1 })
      .populate('createdBy', 'displayName email');
    
    res.json({
      video,
      stats
    });
  } catch (error) {
    console.error('Error fetching video stats:', error);
    res.status(500).json({ error: 'Failed to fetch video stats' });
  }
});

// Get the last tracked time for a video
router.get('/lastTracked/:youtubeId', async (req, res) => {
  try {
    const { youtubeId } = req.params;
    
    const video = await Video.findOne({ youtubeId });
    if (!video) {
      return res.json({ lastTime: 0 });
    }
    
    res.json({ 
      lastTime: video.lastTrackedTime || 0,
      totalStats: video.totalStats || 0
    });
  } catch (error) {
    console.error('Error fetching last tracked time:', error);
    res.status(500).json({ error: 'Failed to fetch last tracked time' });
  }
});

// Initialize or get video tracking data
router.post('/initVideo', authenticateUser, async (req, res) => {
  try {
    const { youtubeId, title } = req.body;
    
    if (!youtubeId) {
      return res.status(400).json({ error: 'YouTube ID is required' });
    }
    
    // Find or create video record
    let video = await Video.findOne({ youtubeId });
    
    if (!video) {
      video = new Video({
        youtubeId,
        title: title || 'Untitled Video',
        lastTrackedTime: 0,
        totalStats: 0,
        createdBy: req.user.uid
      });
      await video.save();
    }
    
    res.json(video);
  } catch (error) {
    console.error('Error initializing video:', error);
    res.status(500).json({ error: 'Failed to initialize video tracking' });
  }
});

// Delete a stat
router.delete('/:statId', authenticateUser, async (req, res) => {
  try {
    const { statId } = req.params;
    
    const stat = await Stat.findById(statId);
    if (!stat) {
      return res.status(404).json({ error: 'Stat not found' });
    }
    
    // Only allow the creator or an admin to delete
    if (stat.createdBy.toString() !== req.user.uid && !req.user.isAdmin) {
      return res.status(403).json({ error: 'Not authorized to delete this stat' });
    }
    
    await Stat.findByIdAndDelete(statId);
    
    // Update total stats count for the video
    await Video.findOneAndUpdate(
      { youtubeId: stat.videoId },
      { $inc: { totalStats: -1 } }
    );
    
    res.json({ message: 'Stat deleted successfully' });
  } catch (error) {
    console.error('Error deleting stat:', error);
    res.status(500).json({ error: 'Failed to delete stat' });
  }
});

// Save a complete game with stats
router.post('/saveGame', authenticateUser, async (req, res) => {
  try {
    const { title, videoId, videoUrl, teams, stats } = req.body;
    
    // Validate required fields
    if (!videoId || !title || !teams || !stats || !stats.length) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // First check if this video already exists
    let video = await Video.findOne({ 
      youtubeId: videoId,
      createdBy: req.user.uid
    });
    
    // Delete all existing stats for this video if it exists
    if (video) {
      await Stat.deleteMany({ 
        videoId: videoId,
        createdBy: req.user.uid
      });
    }
    
    if (!video) {
      // Create new video record
      video = new Video({
        youtubeId: videoId,
        title,
        teams,
        totalStats: stats.length,
        createdBy: req.user.uid
      });
    } else {
      // Update existing video with new data
      video.title = title;
      video.teams = teams;
      video.totalStats = stats.length; // Reset to current stats count
      video.updatedAt = new Date();
    }
    
    await video.save();
    
    // Save all new stats
    const savedStats = [];
    for (const stat of stats) {
      const newStat = new Stat({
        videoId,
        type: stat.type,
        value: stat.value || 1,
        player: stat.player,
        team: stat.team,
        timestamp: stat.timestamp,
        formattedTime: stat.formattedTime,
        createdBy: req.user.uid
      });
      
      const savedStat = await newStat.save();
      savedStats.push(savedStat);
    }
    
    res.status(201).json({
      message: 'Game saved successfully',
      video,
      stats: savedStats
    });
  } catch (error) {
    console.error('Error saving game:', error);
    res.status(500).json({ error: 'Failed to save game' });
  }
});

// Delete a game and all its stats
router.delete('/deleteGame/:videoId', authenticateUser, async (req, res) => {
  try {
    const { videoId } = req.params;
    
    // Find the video first
    const video = await Video.findOne({ 
      youtubeId: videoId,
      createdBy: req.user.uid
    });
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    // Only allow the creator to delete
    if (video.createdBy !== req.user.uid) {
      return res.status(403).json({ error: 'Not authorized to delete this game' });
    }
    
    // Delete all stats for this video
    await Stat.deleteMany({ 
      videoId: videoId,
      createdBy: req.user.uid 
    });
    
    // Delete the video document
    await Video.findByIdAndDelete(video._id);
    
    res.json({ message: 'Game and all associated stats deleted successfully' });
  } catch (error) {
    console.error('Error deleting game:', error);
    res.status(500).json({ error: 'Failed to delete game' });
  }
});

// Get all saved games for the current user
router.get('/savedGames', authenticateUser, async (req, res) => {
  try {
    // Find all videos created by this user
    const videos = await Video.find({ createdBy: req.user.uid })
      .sort({ updatedAt: -1 });
    
    const savedGames = [];
    
    // For each video, fetch its stats
    for (const video of videos) {
      const stats = await Stat.find({ 
        videoId: video.youtubeId,
        createdBy: req.user.uid
      }).sort({ timestamp: 1 });
      
      savedGames.push({
        id: video._id,
        title: video.title,
        videoId: video.youtubeId,
        videoUrl: `https://www.youtube.com/watch?v=${video.youtubeId}`,
        createdAt: video.createdAt,
        teams: video.teams,
        stats: stats.map(stat => ({
          id: stat._id,
          type: stat.type,
          value: stat.value,
          player: stat.player,
          team: stat.team,
          timestamp: stat.timestamp,
          formattedTime: stat.formattedTime
        }))
      });
    }
    
    res.json(savedGames);
  } catch (error) {
    console.error('Error fetching saved games:', error);
    res.status(500).json({ error: 'Failed to fetch saved games' });
  }
});

module.exports = router; 