const mongoose = require('mongoose');

const statSchema = new mongoose.Schema({
  videoId: {
    type: String,
    required: true,
    index: true,
    description: 'Internal video ID this stat belongs to (not the YouTube ID)'
  },
  type: {
    type: String,
    required: true,
    enum: [
      'FG Made', 
      'FG Missed', 
      '3PT Made', 
      '3PT Missed', 
      'FT Made', 
      'FT Missed',
      'Rebound',
      'Assist',
      'Block',
      'Steal',
      'Turnover',
      'Foul'
    ]
  },
  value: {
    type: Number,
    default: 1
  },
  player: {
    type: String,
    required: true
  },
  team: {
    type: String,
    required: true
  },
  timestamp: {
    type: Number,
    required: true,
    index: true
  },
  formattedTime: String,
  createdBy: {
    type: String, // Firebase UID
    required: true,
    index: true,
    description: 'User ID (Firebase UID) who created this stat'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  // Add timestamps option for better indexing
  timestamps: true
});

// IMPORTANT: This ensures stats are associated with both the video AND the specific user
// This allows multiple users to have stats for the same YouTube video without conflicts
statSchema.index({ videoId: 1, createdBy: 1 }, { 
  name: 'videoUser_idx',
  background: true
});

// For efficiently querying stats by time
statSchema.index({ videoId: 1, timestamp: 1 }, {
  name: 'videoTime_idx',
  background: true
});

// For efficiently querying stats by player/team
statSchema.index({ videoId: 1, player: 1, team: 1 }, {
  name: 'videoPlayerTeam_idx',
  background: true
});

// Combined index for filtering stats by type for a specific video and user
statSchema.index({ videoId: 1, createdBy: 1, type: 1 }, {
  name: 'videoUserStatType_idx',
  background: true
});

const Stat = mongoose.model('Stat', statSchema);

module.exports = Stat; 