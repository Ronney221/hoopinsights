const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const mongoose = require('mongoose');

// Load environment variables from server/.env
dotenv.config({ path: path.join(__dirname, '../.env') });

// Verify environment variables are loaded
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  // Don't exit on Vercel - just log the error
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
}

const app = express();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://hoopinsights.vercel.app' 
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175']
}));
app.use(express.json());

// MongoDB Connection with Mongoose
let isConnected = false;
const connectToDatabase = async () => {
  if (isConnected) {
    return;
  }
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log('Successfully connected to MongoDB.');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    // Don't exit on Vercel - just log the error
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

// Initialize routes
const userRoutes = require('./routes/users');
const analysisRoutes = require('./routes/analysis');
const statsRoutes = require('./routes/stats');

app.use('/api/users', userRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/stats', statsRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// For local development, start the server
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  
  // Handle cleanup on server shutdown
  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    process.exit(0);
  });
}

// Connect to the database when the function is invoked
app.use(async (req, res, next) => {
  await connectToDatabase();
  next();
});

// Export for Vercel serverless functions
module.exports = app; 