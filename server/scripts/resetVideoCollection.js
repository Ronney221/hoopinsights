/**
 * CAUTION: This script will completely ERASE the Video collection and recreate it.
 * 
 * Use this as a LAST RESORT if the fixDatabaseSchema.js script doesn't solve the issue.
 * ALL VIDEOS AND THEIR DATA WILL BE PERMANENTLY LOST!
 * 
 * Run with: node server/scripts/resetVideoCollection.js
 */

// Load environment variables
require('dotenv').config();

const mongoose = require('mongoose');
const readline = require('readline');

// Interactive confirmation to prevent accidental execution
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function confirmDeletion() {
  return new Promise((resolve) => {
    console.log('\n⚠️  WARNING ⚠️');
    console.log('This script will PERMANENTLY DELETE all videos from the database.');
    console.log('This is a destructive operation that cannot be undone.\n');
    
    rl.question('Type "DELETE ALL VIDEOS" to confirm: ', (answer) => {
      if (answer === 'DELETE ALL VIDEOS') {
        resolve(true);
      } else {
        console.log('Confirmation phrase did not match. Operation aborted.');
        resolve(false);
      }
    });
  });
}

// Connect to MongoDB
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

// Reset the Video collection
async function resetVideoCollection(db) {
  try {
    console.log('\n===== RESETTING VIDEO COLLECTION =====');
    
    // Drop the entire collection
    console.log('Dropping videos collection...');
    await db.collection('videos').drop()
      .then(() => console.log('Videos collection dropped successfully'))
      .catch(err => {
        if (err.codeName === 'NamespaceNotFound') {
          console.log('Videos collection did not exist, nothing to drop');
        } else {
          throw err;
        }
      });
    
    // Create a new videos collection
    console.log('Creating new videos collection...');
    await db.createCollection('videos');
    console.log('Videos collection created successfully');
    
    // Set up proper indexes on the new collection
    console.log('Setting up proper indexes...');
    const videosCollection = db.collection('videos');
    
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
    
    // Verify no single-field uniqueness constraint on youtubeId
    const indexes = await videosCollection.indexes();
    const hasBadIndex = indexes.some(
      index => index.key.youtubeId === 1 && 
               Object.keys(index.key).length === 1 && 
               index.unique === true
    );
    
    if (hasBadIndex) {
      console.error('❌ WARNING: Single-field unique index on youtubeId still exists!');
    } else {
      console.log('✅ Confirmed: No single-field unique index on youtubeId exists');
    }
    
    console.log('\n✅ Video collection has been completely reset with proper schema!');
    
    // Also check related stats for orphaned stats
    const statCount = await db.collection('stats').countDocuments();
    if (statCount > 0) {
      console.log(`\nNOTE: There are ${statCount} stats in the database that are now orphaned.`);
      console.log('You may want to run a separate script to clean up orphaned stats.');
    }
  } catch (error) {
    console.error('Error resetting video collection:', error);
  }
}

// Run the script
async function main() {
  let db = null;
  try {
    // Ask for confirmation
    const confirmed = await confirmDeletion();
    if (!confirmed) {
      process.exit(0);
    }
    
    // Connect and reset
    db = await connectToDatabase();
    await resetVideoCollection(db);
    
    console.log('\n===== VIDEO COLLECTION RESET COMPLETE =====');
  } catch (error) {
    console.error('Error in reset script:', error);
  } finally {
    if (db) {
      console.log('Closing database connection...');
      await mongoose.connection.close();
      console.log('Database connection closed');
    }
    rl.close();
  }
}

// Execute the script
main(); 