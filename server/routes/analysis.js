const express = require('express');
const router = express.Router();
const multer = require('multer');
const User = require('../models/User');
const Analysis = require('../models/Analysis');
const { spawn } = require('child_process');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Upload and analyze poker data
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { firebaseUid } = req.body;
    if (!firebaseUid) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // Find user
    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create analysis record
    const analysis = new Analysis({
      userId: user._id,
      originalFileName: req.file.originalname,
      status: 'processing'
    });
    await analysis.save();

    // Add analysis to user's analyses array
    user.analyses.push(analysis._id);
    await user.save();

    // Start Python analysis process
    const pythonProcess = spawn('python', [
      path.join(__dirname, '../scripts/analyze_poker.py'),
      req.file.path
    ]);

    let outputData = '';
    let errorData = '';

    pythonProcess.stdout.on('data', (data) => {
      outputData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorData += data.toString();
    });

    pythonProcess.on('close', async (code) => {
      try {
        if (code === 0 && outputData) {
          // Update analysis with results
          analysis.results = JSON.parse(outputData);
          analysis.status = 'completed';
          await analysis.save();
        } else {
          analysis.status = 'error';
          analysis.errorMessage = errorData || 'Analysis failed';
          await analysis.save();
        }
      } catch (error) {
        console.error('Error processing analysis results:', error);
        analysis.status = 'error';
        analysis.errorMessage = 'Error processing analysis results';
        await analysis.save();
      }
    });

    res.status(202).json({ 
      message: 'Analysis started',
      analysisId: analysis._id
    });

  } catch (error) {
    console.error('Error processing upload:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get analysis status
router.get('/:analysisId', async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.analysisId);
    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' });
    }
    res.json({ analysis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all analyses for a user
router.get('/user/:firebaseUid', async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.params.firebaseUid });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const analyses = await Analysis.find({ userId: user._id })
      .sort({ analysisDate: -1 });
    
    res.json({ analyses });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 