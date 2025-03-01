/**
 * Fix Database Indexes
 * 
 * This script corrects the database indexes for the Video collection:
 * 1. Removes the incorrect unique index on youtubeId (single field)
 * 2. Ensures the proper compound index on {youtubeId, createdBy} exists
 * 
 * Run with: node server/scripts/fixIndexes.js
 */

// Load environment variables
require('dotenv').config();

const mongoose = require('mongoose');
const Video = require('../models/Video');

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

// Fix indexes for the Video collection
async function fixVideoIndexes() {
  try {
    console.log('\nChecking Video collection indexes...');
    
    // Get all current indexes
    const existingIndexes = await Video.collection.indexes();
    console.log('Current indexes:');
    existingIndexes.forEach(index => {
      const indexFields = Object.keys(index.key).join(', ');
      const isUnique = index.unique ? 'UNIQUE' : '';
      console.log(`  - ${indexFields} ${isUnique} (${index.name})`);
    });
    
    // Check if the problematic single-field youtubeId index exists
    const singleFieldYoutubeIdIndex = existingIndexes.find(
      index => index.key.youtubeId === 1 && 
              Object.keys(index.key).length === 1 && 
              index.name !== '_id_' // Skip the _id index
    );
    
    if (singleFieldYoutubeIdIndex) {
      console.log(`\n⚠️ Found problematic single-field index on youtubeId: ${singleFieldYoutubeIdIndex.name}`);
      console.log('Dropping the problematic index...');
      
      await Video.collection.dropIndex(singleFieldYoutubeIdIndex.name);
      console.log('✅ Successfully dropped the problematic index');
    } else {
      console.log('\nℹ️ No problematic single-field index found on youtubeId');
    }
    
    // Check if the compound index exists
    const hasCompoundIndex = existingIndexes.some(
      index => index.key.youtubeId === 1 && 
              index.key.createdBy === 1 && 
              index.unique === true
    );
    
    if (!hasCompoundIndex) {
      console.log('\n⚠️ The proper compound index is missing. Creating it now...');
      
      // Recreate the compound index (in case it doesn't exist or was removed)
      await Video.collection.createIndex(
        { youtubeId: 1, createdBy: 1 }, 
        { unique: true, background: true }
      );
      
      console.log('✅ Successfully created the compound index on {youtubeId: 1, createdBy: 1}');
    } else {
      console.log('\n✅ The proper compound index already exists');
    }
    
    // Verify the updated indexes
    const updatedIndexes = await Video.collection.indexes();
    console.log('\nUpdated indexes:');
    updatedIndexes.forEach(index => {
      const indexFields = Object.keys(index.key).join(', ');
      const isUnique = index.unique ? 'UNIQUE' : '';
      console.log(`  - ${indexFields} ${isUnique} (${index.name})`);
    });
    
    console.log('\n✅ Index structure has been fixed successfully');
    
  } catch (error) {
    console.error('Error fixing indexes:', error);
  }
}

// Run the script
async function run() {
  try {
    await connectToDatabase();
    await fixVideoIndexes();
    console.log('\nIndex fixing completed!');
  } catch (error) {
    console.error('Error running script:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

run(); 