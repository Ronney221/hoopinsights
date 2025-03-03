const mongoose = require('mongoose');

const seasonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  gameIds: [{
    type: String,
    required: true
  }],
  createdBy: {
    type: String, // Firebase UID
    required: true,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficiently retrieving user's seasons sorted by creation date
seasonSchema.index({ createdBy: 1, createdAt: -1 });

// Auto-update the updatedAt field
seasonSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Season = mongoose.model('Season', seasonSchema);

module.exports = Season; 