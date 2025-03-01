const mongoose = require('mongoose');

const statNewSchema = new mongoose.Schema({
  videoId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    index: true
  },
  value: {
    type: Number,
    default: 1
  },
  player: {
    type: String,
    required: true,
    index: true
  },
  team: {
    type: String,
    required: true,
    index: true
  },
  timestamp: {
    type: Number,
    required: true,
    index: true
  },
  formattedTime: String,
  createdBy: {
    type: String,
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for efficiently finding stats by video and creator
statNewSchema.index(
  { videoId: 1, createdBy: 1 },
  { background: true }
);

// Index for efficiently filtering stats by time
statNewSchema.index(
  { videoId: 1, timestamp: 1 },
  { background: true }
);

// Index for efficiently filtering by player/team
statNewSchema.index(
  { videoId: 1, player: 1, team: 1 },
  { background: true }
);

// Index for efficiently filtering stats by type for a specific video
statNewSchema.index(
  { videoId: 1, type: 1 },
  { background: true }
);

// Use a different collection name to match with videos_new
const StatNew = mongoose.model('StatNew', statNewSchema, 'stats_new');

module.exports = StatNew; 