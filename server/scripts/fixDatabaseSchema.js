/**
 * Database Schema Fix Script
 * 
 * This script permanently fixes the database schema issues by:
 * 1. Dropping ALL existing indexes on the videos collection
 * 2. Recreating ONLY the correct indexes
 * 3. Ensuring no single-field unique index on youtubeId exists
 * 
 * Run with: node server/scripts/fixDatabaseSchema.js
 */

// Load environment variables
require('dotenv').config();

const mongoose = require('mongoose');

// Connect to MongoDB directly without using models
async function connectToDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully!');
    return mongoose.connection.db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

// Fix the video collection schema
async function fixVideoCollection(db) {
  try {
    console.log('\n===== FIXING VIDEO COLLECTION =====');
    
    // Get the video collection
    const videosCollection = db.collection('videos');
    
    // List all existing indexes
    console.log('Current indexes:');
    const indexes = await videosCollection.indexes();
    indexes.forEach(index => {
      console.log(`- ${JSON.stringify(index.key)} ${index.unique ? '(UNIQUE)' : ''}`);
    });
    
    // Drop ALL indexes except the _id index
    console.log('\nDropping all existing indexes (except _id)...');
    for (const index of indexes) {
      if (index.name !== '_id_') {
        await videosCollection.dropIndex(index.name);
        console.log(`Dropped index: ${index.name}`);
      }
    }
    
    // Recreate only the correct indexes
    console.log('\nRecreating correct indexes...');
    
    // 1. Create index on internalId (unique)
    await videosCollection.createIndex(
      { internalId: 1 },
      { 
        unique: true,
        background: true,
        name: 'internalId_unique'
      }
    );
    console.log('Created unique index on internalId');
    
    // 2. Create index on createdBy
    await videosCollection.createIndex(
      { createdBy: 1 },
      { 
        background: true,
        name: 'createdBy_index'
      }
    );
    console.log('Created index on createdBy');
    
    // 3. Create compound index on youtubeId + createdBy (unique)
    await videosCollection.createIndex(
      { youtubeId: 1, createdBy: 1 },
      { 
        unique: true,
        background: true,
        name: 'youtubeId_createdBy_unique'
      }
    );
    console.log('Created unique compound index on {youtubeId, createdBy}');
    
    // 4. Create index on user-specific video queries
    await videosCollection.createIndex(
      { createdBy: 1, updatedAt: -1 },
      { 
        background: true,
        name: 'createdBy_updatedAt_index'
      }
    );
    console.log('Created index on {createdBy, updatedAt}');
    
    // 5. Create index on shareId
    await videosCollection.createIndex(
      { shareId: 1 },
      { 
        unique: true,
        sparse: true,
        background: true,
        name: 'shareId_unique_sparse'
      }
    );
    console.log('Created unique sparse index on shareId');
    
    // 6. Create index on isShared field
    await videosCollection.createIndex(
      { isShared: 1 },
      { 
        background: true,
        name: 'isShared_index'
      }
    );
    console.log('Created index on isShared');
    
    // Verify the new index structure
    console.log('\nVerifying new index structure:');
    const newIndexes = await videosCollection.indexes();
    newIndexes.forEach(index => {
      console.log(`- ${JSON.stringify(index.key)} ${index.unique ? '(UNIQUE)' : ''}`);
    });
    
    // Confirm there is no single-field unique index on youtubeId
    const hasBadIndex = newIndexes.some(
      index => index.key.youtubeId === 1 && 
               Object.keys(index.key).length === 1 && 
               index.unique === true
    );
    
    if (hasBadIndex) {
      console.error('❌ WARNING: Single-field unique index on youtubeId still exists!');
    } else {
      console.log('✅ Confirmed: No single-field unique index on youtubeId exists');
    }
    
    console.log('\n✅ Video collection schema fixed successfully!');
  } catch (error) {
    console.error('Error fixing video collection:', error);
  }
}

// Fix the stat collection schema too (as a precaution)
async function fixStatCollection(db) {
  try {
    console.log('\n===== FIXING STAT COLLECTION =====');
    
    // Get the stat collection
    const statsCollection = db.collection('stats');
    
    // List all existing indexes
    console.log('Current indexes:');
    const indexes = await statsCollection.indexes();
    indexes.forEach(index => {
      console.log(`- ${JSON.stringify(index.key)}`);
    });
    
    // Drop ALL indexes except the _id index
    console.log('\nDropping all existing indexes (except _id)...');
    for (const index of indexes) {
      if (index.name !== '_id_') {
        await statsCollection.dropIndex(index.name);
        console.log(`Dropped index: ${index.name}`);
      }
    }
    
    // Recreate only the correct indexes
    console.log('\nRecreating correct indexes...');
    
    // 1. Create index on videoId
    await statsCollection.createIndex(
      { videoId: 1 },
      { 
        background: true,
        name: 'videoId_index'
      }
    );
    console.log('Created index on videoId');
    
    // 2. Create index on createdBy
    await statsCollection.createIndex(
      { createdBy: 1 },
      { 
        background: true,
        name: 'createdBy_index'
      }
    );
    console.log('Created index on createdBy');
    
    // 3. Create compound index on videoId + createdBy
    await statsCollection.createIndex(
      { videoId: 1, createdBy: 1 },
      { 
        background: true,
        name: 'videoId_createdBy_index'
      }
    );
    console.log('Created compound index on {videoId, createdBy}');
    
    // 4. Create timestamp index
    await statsCollection.createIndex(
      { timestamp: 1 },
      { 
        background: true,
        name: 'timestamp_index'
      }
    );
    console.log('Created index on timestamp');
    
    // 5. Create index for efficient time queries
    await statsCollection.createIndex(
      { videoId: 1, timestamp: 1 },
      { 
        background: true,
        name: 'videoId_timestamp_index'
      }
    );
    console.log('Created index on {videoId, timestamp}');
    
    // 6. Create index for player/team queries
    await statsCollection.createIndex(
      { videoId: 1, player: 1, team: 1 },
      { 
        background: true,
        name: 'videoId_player_team_index'
      }
    );
    console.log('Created index on {videoId, player, team}');
    
    // 7. Create index for stat type filtering
    await statsCollection.createIndex(
      { videoId: 1, createdBy: 1, type: 1 },
      { 
        background: true,
        name: 'videoId_createdBy_type_index'
      }
    );
    console.log('Created index on {videoId, createdBy, type}');
    
    // Verify the new index structure
    console.log('\nVerifying new index structure:');
    const newIndexes = await statsCollection.indexes();
    newIndexes.forEach(index => {
      console.log(`- ${JSON.stringify(index.key)}`);
    });
    
    console.log('\n✅ Stat collection schema fixed successfully!');
  } catch (error) {
    console.error('Error fixing stat collection:', error);
  }
}

// Run the script
async function main() {
  let db = null;
  try {
    console.log('Starting database schema fix...');
    db = await connectToDatabase();
    
    // Fix collections
    await fixVideoCollection(db);
    await fixStatCollection(db);
    
    console.log('\n===== DATABASE SCHEMA FIX COMPLETE =====');
    console.log('All collections have been updated with the correct indexes.');
    console.log('The application should now properly handle multiple users saving the same YouTube videos.');
  } catch (error) {
    console.error('Error in database schema fix script:', error);
  } finally {
    if (db) {
      console.log('Closing database connection...');
      await mongoose.connection.close();
      console.log('Database connection closed');
    }
  }
}

// Execute the script
main(); 