/**
 * Migration Script: Original Collections to New Collections
 * 
 * This script migrates data from the original Video and Stat collections
 * to the new VideoNew and StatNew collections, using the new ID structure
 * where the youtubeId is a combination of the original YouTube ID and user ID.
 * 
 * Run this script when you want to move your existing data to the new collections:
 * node server/scripts/migrateToNewCollections.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');
const chalk = require('chalk');  // For colored console output
const ora = require('ora');      // For spinner animation

// Import models
const Video = require('../models/Video');
const Stat = require('../models/Stat');
const VideoNew = require('../models/VideoNew');
const StatNew = require('../models/StatNew');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Connect to MongoDB database
 */
async function connectToDatabase() {
  const spinner = ora('Connecting to MongoDB...').start();
  
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    spinner.succeed('Connected to MongoDB');
    return true;
  } catch (error) {
    spinner.fail(`Failed to connect to MongoDB: ${error.message}`);
    console.error(chalk.red('Database connection error:'), error);
    return false;
  }
}

/**
 * Migrate a single video and its associated stats
 */
async function migrateVideoAndStats(video) {
  // Create a new document in VideoNew collection
  const videoNew = new VideoNew({
    originalYoutubeId: video.youtubeId,
    title: video.title,
    description: video.description || '',
    lastTrackedTime: video.lastTrackedTime || 0,
    totalStats: video.totalStats || 0,
    teams: video.teams || { team1: { name: 'Team 1', players: [] }, team2: { name: 'Team 2', players: [] } },
    shareId: video.shareId,
    isShared: video.isShared || false,
    createdBy: video.createdBy,
    createdAt: video.createdAt,
    updatedAt: video.updatedAt,
    isPublic: video.isPublic
  });
  
  // Save the new video document
  await videoNew.save();
  
  // Find all stats for this video
  const stats = await Stat.find({ 
    videoId: video.youtubeId,
    createdBy: video.createdBy
  });
  
  // Skip if no stats
  if (stats.length === 0) {
    return { videoMigrated: true, statsMigrated: 0 };
  }
  
  // Prepare stats for batch insert
  const statsToInsert = stats.map(stat => ({
    videoId: videoNew.internalId,  // Use the new internal ID
    type: stat.type,
    value: stat.value || 1,
    player: stat.player,
    team: stat.team,
    timestamp: stat.timestamp,
    formattedTime: stat.formattedTime,
    createdBy: stat.createdBy,
    createdAt: stat.createdAt
  }));
  
  // Insert stats in batches
  const BATCH_SIZE = 100;
  let totalMigrated = 0;
  
  for (let i = 0; i < statsToInsert.length; i += BATCH_SIZE) {
    const batch = statsToInsert.slice(i, i + BATCH_SIZE);
    await StatNew.insertMany(batch);
    totalMigrated += batch.length;
  }
  
  return { videoMigrated: true, statsMigrated: totalMigrated };
}

/**
 * Main migration function
 */
async function migrateData() {
  console.log(chalk.cyan.bold('\n=== Migration from Original Collections to New Collections ===\n'));
  
  const spinner = ora('Checking collections...').start();
  
  try {
    // Get counts from original collections
    const videoCount = await Video.countDocuments();
    const statCount = await Stat.countDocuments();
    
    spinner.succeed(`Found ${chalk.green(videoCount)} videos and ${chalk.green(statCount)} stats in original collections`);
    
    // Check if we already have data in new collections
    const videoNewCount = await VideoNew.countDocuments();
    const statNewCount = await StatNew.countDocuments();
    
    if (videoNewCount > 0 || statNewCount > 0) {
      console.log(chalk.yellow(`Warning: New collections already contain data (${videoNewCount} videos, ${statNewCount} stats)`));
      
      const confirmContinue = await new Promise(resolve => {
        rl.question(chalk.yellow('Do you want to continue with migration? This will not delete existing data in new collections. (y/n): '), answer => {
          resolve(answer.toLowerCase() === 'y');
        });
      });
      
      if (!confirmContinue) {
        console.log(chalk.yellow('Migration cancelled.'));
        return;
      }
    }
    
    console.log(chalk.cyan('\nStarting migration...\n'));
    
    // Get all videos grouped by user
    const users = await Video.distinct('createdBy');
    console.log(chalk.cyan(`Found ${users.length} users with videos`));
    
    let totalVideosMigrated = 0;
    let totalStatsMigrated = 0;
    
    // Migrate videos user by user
    for (const userId of users) {
      const userSpinner = ora(`Migrating videos for user ${userId}...`).start();
      
      const userVideos = await Video.find({ createdBy: userId });
      userSpinner.text = `Migrating ${userVideos.length} videos for user ${userId}...`;
      
      let userVideosMigrated = 0;
      let userStatsMigrated = 0;
      
      for (const video of userVideos) {
        try {
          // Check if this video has already been migrated
          const existingVideo = await VideoNew.findOne({ 
            originalYoutubeId: video.youtubeId,
            createdBy: video.createdBy
          });
          
          if (existingVideo) {
            userSpinner.text = `Skipping already migrated video ${video.youtubeId} for user ${userId}...`;
            continue;
          }
          
          userSpinner.text = `Migrating video ${video.youtubeId} for user ${userId}...`;
          
          const result = await migrateVideoAndStats(video);
          if (result.videoMigrated) {
            userVideosMigrated++;
            userStatsMigrated += result.statsMigrated;
          }
        } catch (error) {
          userSpinner.warn(`Error migrating video ${video.youtubeId}: ${error.message}`);
          console.error(chalk.red(`Migration error for video ${video.youtubeId}:`), error);
        }
      }
      
      totalVideosMigrated += userVideosMigrated;
      totalStatsMigrated += userStatsMigrated;
      
      userSpinner.succeed(`Migrated ${userVideosMigrated} videos and ${userStatsMigrated} stats for user ${userId}`);
    }
    
    console.log(chalk.green.bold(`\nMigration completed successfully!`));
    console.log(chalk.green(`Total videos migrated: ${totalVideosMigrated}`));
    console.log(chalk.green(`Total stats migrated: ${totalStatsMigrated}`));
    
    // Get final counts
    const finalVideoNewCount = await VideoNew.countDocuments();
    const finalStatNewCount = await StatNew.countDocuments();
    
    console.log(chalk.cyan(`\nNew collections now contain ${finalVideoNewCount} videos and ${finalStatNewCount} stats`));
    
  } catch (error) {
    spinner.fail(`Migration failed: ${error.message}`);
    console.error(chalk.red('Migration error:'), error);
  } finally {
    // Close readline interface
    rl.close();
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log(chalk.cyan('Disconnected from MongoDB'));
  }
}

// Run the migration
connectToDatabase().then(connected => {
  if (connected) {
    migrateData();
  } else {
    rl.close();
    process.exit(1);
  }
}); 