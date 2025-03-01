/**
 * Database Maintenance Script
 * 
 * This script performs health checks on the database and generates reports
 * without modifying any data. Use it to identify potential issues in your database.
 * 
 * Run with: node server/scripts/maintainDatabase.js
 */

// Load environment variables
require('dotenv').config();

const mongoose = require('mongoose');
const Video = require('../models/Video');
const Stat = require('../models/Stat');

// Connect to MongoDB
async function connectToDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully!');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

// Check for potential duplicate videos
async function checkDuplicateVideos() {
  console.log('\n--- Checking for potential duplicate videos ---');
  
  // Find all unique youtubeIds that have more than one document
  const videoGroups = await Video.aggregate([
    { $group: { _id: "$youtubeId", count: { $sum: 1 }, users: { $push: "$createdBy" } } },
    { $match: { count: { $gt: 1 } } }
  ]);
  
  if (videoGroups.length === 0) {
    console.log('✅ No potential duplicate videos found. All videos are properly isolated by user.');
    return;
  }
  
  console.log(`⚠️ Found ${videoGroups.length} YouTube videos used by multiple users`);
  
  // Process each group of potential duplicates
  for (const group of videoGroups) {
    console.log(`\nYouTube video: ${group._id} (used by ${group.count} users)`);
    
    // Get all videos for this youtubeId
    const videos = await Video.find({ youtubeId: group._id });
    
    // Check if any have the same creator (true duplicates)
    const userVideos = {};
    for (const video of videos) {
      const userId = video.createdBy;
      
      if (!userVideos[userId]) {
        userVideos[userId] = [];
      }
      
      userVideos[userId].push(video);
    }
    
    // Report true duplicates within each user's collection
    for (const [userId, userVideoList] of Object.entries(userVideos)) {
      if (userVideoList.length > 1) {
        console.log(`⚠️ User ${userId} has ${userVideoList.length} duplicate videos for YouTube ID ${group._id}`);
        
        // Sort by update date to identify newest
        userVideoList.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        
        for (const video of userVideoList) {
          console.log(`  - Video ID: ${video._id}, Updated: ${video.updatedAt}, Title: ${video.title}`);
        }
      }
    }
  }
}

// Check for potential duplicate stats
async function checkDuplicateStats() {
  console.log('\n--- Checking for potential duplicate stats ---');
  
  // Find all unique combinations of videoId, timestamp, type, player, and createdBy
  // that have more than one document
  const statGroups = await Stat.aggregate([
    { 
      $group: { 
        _id: {
          videoId: "$videoId",
          timestamp: "$timestamp",
          type: "$type",
          player: "$player",
          createdBy: "$createdBy"
        },
        count: { $sum: 1 },
        statIds: { $push: "$_id" }
      }
    },
    { $match: { count: { $gt: 1 } } }
  ]);
  
  if (statGroups.length === 0) {
    console.log('✅ No duplicate stats found. All stats are unique.');
    return;
  }
  
  console.log(`⚠️ Found ${statGroups.length} groups of duplicate stats`);
  
  // Process each group of duplicates
  for (const group of statGroups) {
    const { videoId, timestamp, type, player, createdBy } = group._id;
    console.log(`\nDuplicate stats: Video ${videoId}, User ${createdBy}, Type ${type}, Player ${player}, Time ${timestamp}`);
    
    // Get all stats for this combination
    const stats = await Stat.find({
      videoId,
      timestamp,
      type,
      player,
      createdBy
    }).sort({ createdAt: -1 }); // Sort by creation date, newest first
    
    if (stats.length > 1) {
      console.log(`  Found ${stats.length} duplicate entries:`);
      for (const stat of stats) {
        console.log(`  - Stat ID: ${stat._id}, Created: ${stat.createdAt}`);
      }
    }
  }
}

// Check for orphaned stats (stats without a corresponding video)
async function checkOrphanedStats() {
  console.log('\n--- Checking for orphaned stats ---');
  
  // Get all unique videoIds from stats
  const statVideoIds = await Stat.distinct('videoId');
  
  // Check each videoId to see if it has a corresponding video
  let orphanedStats = 0;
  let orphanedGroups = 0;
  
  for (const videoId of statVideoIds) {
    const video = await Video.findOne({ youtubeId: videoId });
    
    if (!video) {
      const statsCount = await Stat.countDocuments({ videoId });
      console.log(`⚠️ Found ${statsCount} orphaned stats for video ID: ${videoId}`);
      orphanedStats += statsCount;
      orphanedGroups++;
    }
  }
  
  if (orphanedGroups === 0) {
    console.log('✅ No orphaned stats found. All stats have corresponding videos.');
  } else {
    console.log(`⚠️ Found a total of ${orphanedStats} orphaned stats across ${orphanedGroups} video groups.`);
  }
}

// Check database indexes
async function checkIndexes() {
  console.log('\n--- Checking database indexes ---');
  
  // Check Video model indexes
  const videoIndexes = await Video.collection.indexes();
  console.log('Video collection indexes:');
  videoIndexes.forEach(index => {
    const indexFields = Object.keys(index.key).join(', ');
    const isUnique = index.unique ? 'UNIQUE' : '';
    console.log(`  - ${indexFields} ${isUnique}`);
  });
  
  // Check Stat model indexes
  const statIndexes = await Stat.collection.indexes();
  console.log('\nStat collection indexes:');
  statIndexes.forEach(index => {
    const indexFields = Object.keys(index.key).join(', ');
    const isUnique = index.unique ? 'UNIQUE' : '';
    console.log(`  - ${indexFields} ${isUnique}`);
  });
  
  // Verify critical indexes exist
  const hasVideoUserIndex = videoIndexes.some(index => 
    index.key.youtubeId === 1 && index.key.createdBy === 1 && index.unique);
  
  const hasStatVideoUserIndex = statIndexes.some(index => 
    index.key.videoId === 1 && index.key.createdBy === 1);
  
  if (hasVideoUserIndex) {
    console.log('✅ Video collection has proper user isolation index (youtubeId + createdBy)');
  } else {
    console.log('⚠️ Video collection is missing recommended unique index on youtubeId + createdBy');
  }
  
  if (hasStatVideoUserIndex) {
    console.log('✅ Stat collection has proper user isolation index (videoId + createdBy)');
  } else {
    console.log('⚠️ Stat collection is missing recommended index on videoId + createdBy');
  }
}

// Generate database statistics
async function generateDatabaseStats() {
  console.log('\n--- Database Statistics ---');
  
  // Count total videos and stats
  const videoCount = await Video.countDocuments();
  const statCount = await Stat.countDocuments();
  
  console.log(`Total videos: ${videoCount}`);
  console.log(`Total stats: ${statCount}`);
  
  // Count unique users
  const uniqueUsers = await Video.distinct('createdBy');
  console.log(`Unique users: ${uniqueUsers.length}`);
  
  // Count shared videos
  const sharedVideos = await Video.countDocuments({ isShared: true });
  console.log(`Shared videos: ${sharedVideos}`);
  
  // Average stats per video
  const avgStatsPerVideo = statCount / videoCount || 0;
  console.log(`Average stats per video: ${avgStatsPerVideo.toFixed(2)}`);
  
  // Find video with most stats
  const videosWithStatCounts = await Video.aggregate([
    { $match: { totalStats: { $exists: true, $ne: null } } },
    { $sort: { totalStats: -1 } },
    { $limit: 1 }
  ]);
  
  if (videosWithStatCounts.length > 0) {
    const topVideo = videosWithStatCounts[0];
    console.log(`Video with most stats: "${topVideo.title}" (${topVideo.totalStats} stats)`);
  }
}

// Check for potential compound index issues
async function checkCompoundIndexIssues() {
  console.log('\n--- Checking for potential compound index issues ---');
  
  // Check if the unique compound index exists on Video collection
  const videoIndexes = await Video.collection.indexes();
  const hasUniqueCompoundIndex = videoIndexes.some(index => 
    index.key.youtubeId === 1 && 
    index.key.createdBy === 1 && 
    index.unique === true
  );
  
  if (!hasUniqueCompoundIndex) {
    console.log('⚠️ WARNING: The Video collection does not have a unique compound index on {youtubeId: 1, createdBy: 1}');
    console.log('This can cause issues when multiple users try to save the same YouTube video.');
    return;
  }
  
  console.log('✅ Unique compound index on {youtubeId: 1, createdBy: 1} exists in Video collection');
  
  // Check for videos that might cause uniqueness constraint violations
  console.log('\nChecking for potential uniqueness constraint issues...');
  
  // Find videos that share the same youtubeId but different createdBy
  const potentialIssues = await Video.aggregate([
    { $group: { 
        _id: "$youtubeId", 
        count: { $sum: 1 }, 
        users: { $addToSet: "$createdBy" } 
      } 
    },
    { $match: { count: { $gt: 1 } } },
    { $project: { 
        _id: 0,
        youtubeId: "$_id", 
        userCount: { $size: "$users" }, 
        videoCount: "$count",
        users: 1
      } 
    },
    { $sort: { videoCount: -1 } }
  ]);
  
  if (potentialIssues.length === 0) {
    console.log('✅ No potential index issues found. All videos have proper user isolation.');
    return;
  }
  
  console.log(`Found ${potentialIssues.length} YouTube videos saved by multiple users:`);
  
  for (const issue of potentialIssues) {
    console.log(`\n  YouTube ID: ${issue.youtubeId}`);
    console.log(`  Video count: ${issue.videoCount}`);
    console.log(`  User count: ${issue.userCount}`);
    
    // If user count doesn't match video count, there might be a problem
    if (issue.userCount !== issue.videoCount) {
      console.log(`  ⚠️ WARNING: Video count (${issue.videoCount}) does not match user count (${issue.userCount})`);
      console.log(`  This suggests some users have multiple copies of the same video, which could cause conflicts.`);
      
      // Find all videos with this youtubeId
      const conflictingVideos = await Video.find({ youtubeId: issue.youtubeId }).sort({ createdBy: 1, updatedAt: -1 });
      
      // Group videos by user to find duplicates
      const videosByUser = {};
      for (const video of conflictingVideos) {
        if (!videosByUser[video.createdBy]) {
          videosByUser[video.createdBy] = [];
        }
        videosByUser[video.createdBy].push(video);
      }
      
      // Report users with multiple copies
      for (const [userId, userVideos] of Object.entries(videosByUser)) {
        if (userVideos.length > 1) {
          console.log(`    User ${userId} has ${userVideos.length} copies of this video:`);
          for (const v of userVideos) {
            console.log(`      - ${v._id} (${v.title}), updated: ${v.updatedAt}`);
          }
        }
      }
    } else {
      console.log('  ✅ Each user has exactly one copy of this video, as expected.');
    }
  }
}

// Run the maintenance checks
async function runMaintenance() {
  try {
    await connectToDatabase();
    
    console.log('\n=== DATABASE MAINTENANCE REPORT ===\n');
    
    // Run all checks
    await generateDatabaseStats();
    await checkIndexes();
    await checkCompoundIndexIssues();
    await checkDuplicateVideos();
    await checkDuplicateStats();
    await checkOrphanedStats();
    
    console.log('\n=== MAINTENANCE REPORT COMPLETE ===\n');
    console.log('No changes were made to the database.');
    console.log('This was a read-only operation to help identify potential issues.');
  } catch (error) {
    console.error('Error during maintenance:', error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the script
runMaintenance(); 