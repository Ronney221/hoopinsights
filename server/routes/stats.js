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
    console.log(`[${req.user.uid}] Starting saveGame request`);
    const startTime = Date.now();
    
    const { title, videoId, videoUrl, teams, stats } = req.body;
    
    // Validate required fields
    if (!videoId || !title) {
      return res.status(400).json({ error: 'Missing required fields: videoId and title are required' });
    }
    
    if (!stats || !Array.isArray(stats) || stats.length === 0) {
      return res.status(400).json({ error: 'Stats must be a non-empty array' });
    }
    
    if (!teams) {
      return res.status(400).json({ error: 'Teams data is required' });
    }

    console.log(`[${req.user.uid}] Saving game: ${title} with ${stats.length} stats`);

    // Find user's video by YouTube ID and user ID
    let video = await Video.findOne({ 
      originalYoutubeId: videoId, // Use originalYoutubeId for lookup
      createdBy: req.user.uid
    });
    
    // Delete all existing stats for this specific user's video if it exists
    if (video) {
      await Stat.deleteMany({ 
        videoId: video.internalId, // Use internalId for stats
        createdBy: req.user.uid
      });
      
      console.log(`[${req.user.uid}] Deleted existing stats for user's video ${videoId}`);
    }
    
    try {
      if (!video) {
        // Generate unique IDs
        const crypto = require('crypto');
        const randomString = crypto.randomBytes(8).toString('hex');
        
        // Create a randomized youtubeId to avoid duplicates
        const uniqueYoutubeId = `${videoId}_${randomString}`;
        const internalId = `vid_${randomString}`;
        
        // Create a new video document
        video = new Video({
          youtubeId: uniqueYoutubeId, // Store randomized ID here to avoid DB conflicts
          originalYoutubeId: videoId, // Store the actual YouTube ID here for reference
          internalId: internalId,
          title,
          teams,
          totalStats: stats.length,
          createdBy: req.user.uid,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        await video.save();
        console.log(`[${req.user.uid}] Created new video with internalId: ${internalId} (originalYoutubeId: ${videoId})`);
      } else {
        // Update existing video
        video.title = title;
        video.teams = teams;
        video.totalStats = stats.length;
        video.updatedAt = new Date();
        
        await video.save();
        console.log(`[${req.user.uid}] Updated existing video with internalId: ${video.internalId}`);
      }
    } catch (error) {
      console.error(`[${req.user.uid}] Error saving video:`, error);
      throw new Error(`Unable to save video: ${error.message}`);
    }
    
    // Use the internal ID for stats references
    const videoIdForStats = video.internalId;
    
    // Prepare batch insert of stats
    const statsToInsert = stats.map(stat => ({
      videoId: videoIdForStats, // Use internalId for stats references
      type: stat.type,
      value: stat.value || 1,
      player: stat.player,
      team: stat.team,
      timestamp: stat.timestamp,
      formattedTime: stat.formattedTime,
      createdBy: req.user.uid
    }));
    
    // Insert stats in batches to prevent timeout
    const BATCH_SIZE = 100;
    let savedCount = 0;
    
    for (let i = 0; i < statsToInsert.length; i += BATCH_SIZE) {
      const batch = statsToInsert.slice(i, i + BATCH_SIZE);
      await Stat.insertMany(batch);
      savedCount += batch.length;
      console.log(`[${req.user.uid}] Saved batch of ${batch.length} stats (${savedCount}/${statsToInsert.length})`);
    }
    
    const duration = Date.now() - startTime;
    console.log(`[${req.user.uid}] Completed saveGame request in ${duration}ms`);
    
    res.status(201).json({
      message: 'Game saved successfully',
      videoId: videoId, // Return the original YouTube ID to the client
      originalYoutubeId: videoId,
      internalId: video.internalId,
      title: title,
      statsCount: savedCount
    });
  } catch (error) {
    console.error('Error saving game:', error);
    res.status(500).json({ error: 'Failed to save game: ' + error.message });
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
    // Set a reasonable time limit for the query
    const startTime = Date.now();
    console.log(`[${req.user.uid}] Starting savedGames request`);
    
    // IMPORTANT: Always filter by createdBy to ensure user isolation
    // Each user should only see their own saved games, even if multiple users
    // have saved the same YouTube video
    const videos = await Video.find({ createdBy: req.user.uid })
      .sort({ updatedAt: -1 })
      .lean();  // Use lean() for better performance
    
    if (videos.length === 0) {
      console.log(`[${req.user.uid}] No saved games found`);
      return res.json([]);
    }
    
    // Extract all internal video IDs for a single query
    const videoIds = videos.map(video => video.internalId || video.youtubeId);
    
    // IMPORTANT: Always include createdBy in the query to ensure proper user isolation
    // This ensures we only get stats created by this user, even if the videoId exists
    // for multiple users
    const allStats = await Stat.find({ 
      videoId: { $in: videoIds },
      createdBy: req.user.uid
    }).lean();  // Use lean() for better performance
    
    console.log(`[${req.user.uid}] Found ${allStats.length} stats across ${videos.length} games`);
    
    // Group stats by videoId for more efficient mapping
    const statsMap = {};
    allStats.forEach(stat => {
      if (!statsMap[stat.videoId]) {
        statsMap[stat.videoId] = [];
      }
      statsMap[stat.videoId].push({
        id: stat._id,
        type: stat.type,
        value: stat.value,
        player: stat.player,
        team: stat.team,
        timestamp: stat.timestamp,
        formattedTime: stat.formattedTime
      });
    });
    
    // Map videos with their stats
    const savedGames = videos.map(video => ({
      id: video._id,
      title: video.title,
      videoId: video.youtubeId, // The actual YouTube ID for the client
      internalId: video.internalId || video.youtubeId, // Internal ID for referencing stats
      videoUrl: `https://www.youtube.com/watch?v=${video.youtubeId}`,
      createdAt: video.createdAt,
      updatedAt: video.updatedAt,
      teams: video.teams,
      // Match stats by internal ID
      stats: statsMap[video.internalId || video.youtubeId] || [],
      shareId: video.shareId,
      isShared: video.isShared || false
    }));
    
    const duration = Date.now() - startTime;
    console.log(`[${req.user.uid}] Completed savedGames request in ${duration}ms, found ${savedGames.length} games`);
    
    res.json(savedGames);
  } catch (error) {
    console.error(`[${req.user.uid}] Error fetching saved games:`, error);
    
    // Provide more detailed error message for debugging
    let errorMessage = 'Failed to fetch saved games';
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      errorMessage += `: Database error (${error.code})`;
    } else if (error.name === 'ValidationError') {
      errorMessage += ': Data validation failed';
    }
    
    res.status(500).json({ error: errorMessage });
  }
});

// Share a game - generate and return a share link
router.post('/shareGame/:videoId', authenticateUser, async (req, res) => {
  try {
    const { videoId } = req.params;
    
    // Find the video to share using youtubeId which is what client provides
    const video = await Video.findOne({ 
      youtubeId: videoId,
      createdBy: req.user.uid
    });
    
    if (!video) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    // Generate a share ID if not already shared
    const shareId = video.generateShareId();
    await video.save();
    
    console.log(`User ${req.user.uid} shared game: ${video.title} with ID: ${shareId}`);
    
    // Update the public URL
    const publicUrl = process.env.PUBLIC_URL || req.headers.origin || 'https://shotify.org';
    const shareUrl = `${publicUrl}/shared/${shareId}`;
    
    res.json({
      message: 'Game shared successfully',
      shareId,
      shareUrl
    });
  } catch (error) {
    console.error('Error sharing game:', error);
    res.status(500).json({ error: 'Failed to share game' });
  }
});

// Get a shared game by shareId (public endpoint, no auth required)
router.get('/shared/:shareId', async (req, res) => {
  try {
    const { shareId } = req.params;
    
    // Find the shared video
    const video = await Video.findOne({ 
      shareId,
      isShared: true
    }).lean();
    
    if (!video) {
      return res.status(404).json({ error: 'Shared game not found' });
    }
    
    // Get the stats for this video using internalId
    const videoIdForStats = video.internalId || video.youtubeId;
    const stats = await Stat.find({ 
      videoId: videoIdForStats,
      createdBy: video.createdBy
    }).lean();
    
    // Prepare the response object
    const sharedGame = {
      id: video._id,
      title: video.title,
      videoId: video.youtubeId,
      internalId: videoIdForStats,
      videoUrl: `https://www.youtube.com/watch?v=${video.youtubeId}`,
      createdAt: video.createdAt,
      teams: video.teams,
      shareId: video.shareId,
      stats: stats.map(stat => ({
        id: stat._id,
        type: stat.type,
        value: stat.value,
        player: stat.player,
        team: stat.team,
        timestamp: stat.timestamp,
        formattedTime: stat.formattedTime
      })),
      isShared: true
    };
    
    console.log(`Shared game ${shareId} viewed: ${video.title}`);
    
    res.json(sharedGame);
  } catch (error) {
    console.error('Error retrieving shared game:', error);
    res.status(500).json({ error: 'Failed to retrieve shared game' });
  }
});

// Save a shared game to user's account
router.post('/saveSharedGame/:shareId', authenticateUser, async (req, res) => {
  try {
    const { shareId } = req.params;
    const startTime = Date.now();
    
    console.log(`User ${req.user.uid} saving shared game ${shareId} to their account`);
    
    // Find the shared video
    const sharedVideo = await Video.findOne({ 
      shareId,
      isShared: true
    }).lean();
    
    if (!sharedVideo) {
      return res.status(404).json({ error: 'Shared game not found' });
    }
    
    // Check if the user already has this game
    const existingVideo = await Video.findOne({
      youtubeId: sharedVideo.youtubeId,
      createdBy: req.user.uid
    });
    
    if (existingVideo) {
      return res.status(409).json({ 
        error: 'You already have this game saved',
        videoId: existingVideo.youtubeId
      });
    }
    
    // Generate a new unique internal ID for this copy
    const crypto = require('crypto');
    const randomString = crypto.randomBytes(8).toString('hex');
    const newInternalId = `${sharedVideo.youtubeId}_${randomString}`;
    
    // Get the stats for the shared video
    const sharedStats = await Stat.find({
      videoId: sharedVideo.internalId || sharedVideo.youtubeId,
      createdBy: sharedVideo.createdBy
    }).lean();
    
    // Create a new video for the current user
    const newVideo = new Video({
      youtubeId: sharedVideo.youtubeId,
      internalId: newInternalId,
      title: `${sharedVideo.title} (Copy)`,
      teams: sharedVideo.teams,
      totalStats: sharedStats.length,
      createdBy: req.user.uid,
      // Don't copy the shareId - this copy isn't shared by default
    });
    
    await newVideo.save();
    console.log(`Created new video for user ${req.user.uid}: ${newVideo.title} with internalId: ${newInternalId}`);
    
    // Copy all stats to the new user's account
    if (sharedStats.length > 0) {
      const statsToInsert = sharedStats.map(stat => ({
        videoId: newInternalId, // Use the new internal ID
        type: stat.type,
        value: stat.value,
        player: stat.player,
        team: stat.team,
        timestamp: stat.timestamp,
        formattedTime: stat.formattedTime,
        createdBy: req.user.uid
      }));
      
      // Insert stats in batches
      const BATCH_SIZE = 100;
      let savedCount = 0;
      
      for (let i = 0; i < statsToInsert.length; i += BATCH_SIZE) {
        const batch = statsToInsert.slice(i, i + BATCH_SIZE);
        await Stat.insertMany(batch);
        savedCount += batch.length;
        console.log(`Saved batch of ${batch.length} stats (${savedCount}/${statsToInsert.length})`);
      }
    }
    
    const duration = Date.now() - startTime;
    console.log(`Completed saving shared game to user account in ${duration}ms`);
    
    res.status(201).json({
      message: 'Game saved successfully to your account',
      videoId: newVideo.youtubeId,
      internalId: newVideo.internalId,
      title: newVideo.title,
      statsCount: sharedStats.length
    });
  } catch (error) {
    console.error('Error saving shared game:', error);
    res.status(500).json({ error: 'Failed to save shared game' });
  }
});

module.exports = router; 