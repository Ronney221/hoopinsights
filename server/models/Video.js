const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  youtubeId: {
    type: String,
    required: true,
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

// Add compound index for faster user-specific video queries
videoSchema.index({ youtubeId: 1, createdBy: 1 }, { unique: true });
videoSchema.index({ createdBy: 1, updatedAt: -1 });

// Update the updatedAt timestamp on save
videoSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Video = mongoose.model('Video', videoSchema);

module.exports = Video; 