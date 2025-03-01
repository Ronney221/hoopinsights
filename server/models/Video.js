const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  youtubeId: {
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
  createdBy: {
    type: String, // Firebase UID
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  collaborators: [String] // Array of Firebase UIDs
});

// Update the updatedAt timestamp on save
videoSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Video = mongoose.model('Video', videoSchema);

module.exports = Video; 