const mongoose = require('mongoose');
const crypto = require('crypto'); // For generating unique share IDs

const videoSchema = new mongoose.Schema({
  // This field will now store a randomized unique ID
  youtubeId: {
    type: String,
    required: true,
    unique: true // We'll make this unique since it's now randomized
  },
  // New field to store the actual YouTube ID for reference
  originalYoutubeId: {
    type: String,
    required: true,
    index: true // Index for searching but not unique
  },
  // Internal ID field for stats references
  internalId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  lastTrackedTime: {
    type: Number,
    default: 0
  },
  totalStats: {
    type: Number,
    default: 0
  },
  teams: {
    team1: {
      name: {
        type: String,
        default: 'Team 1'
      },
      players: [String]
    },
    team2: {
      name: {
        type: String,
        default: 'Team 2'
      },
      players: [String]
    }
  },
  shareId: {
    type: String,
    index: true,
    unique: true,
    sparse: true // Allow null/undefined values and only index documents with the field
  },
  isShared: {
    type: Boolean,
    default: false,
    index: true
  },
  createdBy: {
    type: String, // Firebase UID
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  collaborators: [String] // Array of Firebase UIDs
});

// IMPORTANT: Do NOT add a unique index on youtubeId alone
// ONLY use compound index to ensure each user can have their own copy of a YouTube video

// Index for looking up videos by original YouTube ID and creator
videoSchema.index(
  { originalYoutubeId: 1, createdBy: 1 }, 
  { 
    unique: true,
    background: true,
    name: 'originalYoutubeId_createdBy_unique'
  }
);

// Index for efficient user-specific video queries
videoSchema.index(
  { createdBy: 1, updatedAt: -1 }, 
  { 
    background: true,
    name: 'createdBy_updatedAt_index'
  }
);

// Generate unique IDs for new videos
videoSchema.pre('save', function(next) {
  // If this is a new document or it doesn't have required unique IDs
  if (this.isNew) {
    // Ensure internalId exists
    if (!this.internalId) {
      const randomString = crypto.randomBytes(8).toString('hex');
      this.internalId = `vid_${randomString}`;
    }
    
    // Ensure youtubeId is unique (if using the original approach)
    if (this.youtubeId === this.originalYoutubeId) {
      const randomString = crypto.randomBytes(8).toString('hex');
      this.youtubeId = `${this.originalYoutubeId}_${randomString}`;
    }
  }
  
  // Update the updatedAt timestamp
  this.updatedAt = new Date();
  next();
});

// Generate a unique share ID when a game is first shared
videoSchema.methods.generateShareId = function() {
  if (!this.shareId) {
    // Create a unique, URL-friendly ID
    const randomBytes = crypto.randomBytes(8).toString('hex');
    this.shareId = `${randomBytes}`;
    this.isShared = true;
  }
  return this.shareId;
};

const Video = mongoose.model('Video', videoSchema);

module.exports = Video; 