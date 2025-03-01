const mongoose = require('mongoose');

const statSchema = new mongoose.Schema({
  videoId: {
    type: String,
    required: true,
    index: true
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
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  // Add timestamps option for better indexing
  timestamps: true
});

// Compound indexes for more efficient querying
statSchema.index({ videoId: 1, timestamp: 1 });
statSchema.index({ videoId: 1, createdBy: 1 });
statSchema.index({ videoId: 1, player: 1, team: 1 });

const Stat = mongoose.model('Stat', statSchema);

module.exports = Stat; 