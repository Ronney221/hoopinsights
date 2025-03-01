const mongoose = require('mongoose');
const crypto = require('crypto'); // For generating unique share IDs

const videoNewSchema = new mongoose.Schema({
  // This field will now store a combination of original YouTube ID and user ID
  youtubeId: {
    type: String,
    required: true,
    unique: true // We'll make this unique since it's now user-specific
  },
  // Store the actual YouTube ID for reference
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

// Index for looking up videos by original YouTube ID and creator
videoNewSchema.index(
  { originalYoutubeId: 1, createdBy: 1 }, 
  { 
    unique: true,
    background: true,
    name: 'originalYoutubeId_createdBy_unique'
  }
);

// Index for efficient user-specific video queries
videoNewSchema.index(
  { createdBy: 1, updatedAt: -1 }, 
  { 
    background: true,
    name: 'createdBy_updatedAt_index'
  }
);

// Generate unique IDs for new videos
videoNewSchema.pre('save', function(next) {
  // If this is a new document or it doesn't have required unique IDs
  if (this.isNew) {
    // Ensure internalId exists - this should be globally unique
    if (!this.internalId) {
      // Use a combination of userId and originalYoutubeId plus a short random string for uniqueness
      const shortRandom = crypto.randomBytes(4).toString('hex');
      this.internalId = `vid_${this.createdBy}_${this.originalYoutubeId}_${shortRandom}`;
    }
    
    // Create a user-specific youtubeId that's predictable and always unique per user
    // Format: originalYoutubeId__userId (double underscore as separator)
    if (!this.youtubeId || this.youtubeId === this.originalYoutubeId) {
      this.youtubeId = `${this.originalYoutubeId}__${this.createdBy}`;
    }
  }
  
  // Update the updatedAt timestamp
  this.updatedAt = new Date();
  next();
});

// Generate a unique share ID when a game is first shared
videoNewSchema.methods.generateShareId = function() {
  if (!this.shareId) {
    // Create a unique, URL-friendly ID that includes part of the originalYoutubeId
    // for easier debugging and identification
    const randomBytes = crypto.randomBytes(6).toString('hex');
    const youtubeIdPrefix = this.originalYoutubeId.substring(0, 4);
    this.shareId = `${youtubeIdPrefix}_${randomBytes}`;
    this.isShared = true;
  }
  return this.shareId;
};

// Use a different collection name to avoid the unique index constraint in the existing collection
const VideoNew = mongoose.model('VideoNew', videoNewSchema, 'videos_new');

module.exports = VideoNew; 