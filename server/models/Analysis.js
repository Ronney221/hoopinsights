const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  originalFileName: String,
  analysisDate: {
    type: Date,
    default: Date.now,
  },
  results: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  metadata: {
    gameType: String,
    handCount: Number,
    dateRange: {
      start: Date,
      end: Date,
    },
    // Add other metadata fields as needed
  },
  status: {
    type: String,
    enum: ['processing', 'completed', 'error'],
    default: 'processing',
  },
  errorMessage: String,
});

// Create indexes
analysisSchema.index({ userId: 1 });
analysisSchema.index({ analysisDate: -1 });
analysisSchema.index({ status: 1 });

const Analysis = mongoose.model('Analysis', analysisSchema);

module.exports = Analysis; 