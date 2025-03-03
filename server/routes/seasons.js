const express = require('express');
const router = express.Router();
const Season = require('../models/Season');
const { authenticateUser } = require('../middleware/auth');

// Get all seasons for the current user
router.get('/', authenticateUser, async (req, res) => {
  try {
    console.log(`[${req.user.uid}] Fetching all seasons`);
    const seasons = await Season.find({ createdBy: req.user.uid })
      .sort({ createdAt: -1 });
    
    res.json(seasons);
  } catch (error) {
    console.error('Error fetching seasons:', error);
    res.status(500).json({ error: 'Failed to fetch seasons' });
  }
});

// Get a specific season by ID
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const season = await Season.findOne({ 
      _id: req.params.id,
      createdBy: req.user.uid 
    });
    
    if (!season) {
      return res.status(404).json({ error: 'Season not found' });
    }
    
    res.json(season);
  } catch (error) {
    console.error('Error fetching season:', error);
    res.status(500).json({ error: 'Failed to fetch season' });
  }
});

// Create a new season
router.post('/', authenticateUser, async (req, res) => {
  try {
    console.log(`[${req.user.uid}] Creating new season`);
    const { name, gameIds } = req.body;
    
    if (!name || !gameIds || !Array.isArray(gameIds) || gameIds.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid data. Name and at least one game ID are required' 
      });
    }
    
    const newSeason = new Season({
      name,
      gameIds,
      createdBy: req.user.uid
    });
    
    const savedSeason = await newSeason.save();
    console.log(`[${req.user.uid}] Created season: ${savedSeason._id}`);
    
    res.status(201).json(savedSeason);
  } catch (error) {
    console.error('Error creating season:', error);
    res.status(500).json({ error: 'Failed to create season' });
  }
});

// Update a season
router.put('/:id', authenticateUser, async (req, res) => {
  try {
    console.log(`[${req.user.uid}] Updating season: ${req.params.id}`);
    const { name, gameIds } = req.body;
    
    // Find the season and ensure it belongs to the current user
    const season = await Season.findOne({ 
      _id: req.params.id,
      createdBy: req.user.uid 
    });
    
    if (!season) {
      return res.status(404).json({ error: 'Season not found' });
    }
    
    // Update fields
    if (name) season.name = name;
    if (gameIds && Array.isArray(gameIds)) season.gameIds = gameIds;
    
    const updatedSeason = await season.save();
    console.log(`[${req.user.uid}] Updated season: ${updatedSeason._id}`);
    
    res.json(updatedSeason);
  } catch (error) {
    console.error('Error updating season:', error);
    res.status(500).json({ error: 'Failed to update season' });
  }
});

// Delete a season
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    console.log(`[${req.user.uid}] Deleting season: ${req.params.id}`);
    
    const result = await Season.findOneAndDelete({ 
      _id: req.params.id,
      createdBy: req.user.uid 
    });
    
    if (!result) {
      return res.status(404).json({ error: 'Season not found' });
    }
    
    console.log(`[${req.user.uid}] Deleted season: ${req.params.id}`);
    res.json({ message: 'Season deleted successfully' });
  } catch (error) {
    console.error('Error deleting season:', error);
    res.status(500).json({ error: 'Failed to delete season' });
  }
});

module.exports = router; 