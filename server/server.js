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
  origin: '*', // Allow all origins in production for now
  methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],
  credentials: true
}));

app.use(express.json());

// MongoDB Connection with Mongoose
let cachedDb = null;

const connectToDatabase = async () => {
  if (cachedDb) {
    console.log('Using cached database connection');
    return cachedDb;
  }
  
  console.log('Creating new database connection');
  
  try {
    // Set mongoose connection options
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s
    };
    
    await mongoose.connect(process.env.MONGODB_URI, options);
    console.log('Successfully connected to MongoDB.');
    
    cachedDb = mongoose.connection;
    return cachedDb;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error; // Re-throw to be caught by the handler
  }
};

// Initialize routes
const userRoutes = require('./routes/users');
const analysisRoutes = require('./routes/analysis');
const statsRoutes = require('./routes/stats');
const statsV2Routes = require('./routes/statsV2');

// Connect to DB before handling routes for Vercel serverless functions
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    return res.status(500).json({ error: 'Database connection failed' });
  }
});

app.use('/api/users', userRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/statsv2', statsV2Routes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Error handling middleware - must be after all routes
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  
  // Don't expose stack traces in production
  const errorMessage = process.env.NODE_ENV === 'production' 
    ? 'An internal server error occurred' 
    : err.message;
  
  res.status(500).json({ error: errorMessage });
});

// For local development, start the server
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  
  // Handle cleanup on server shutdown
  process.on('SIGINT', async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
    process.exit(0);
  });
}

// Export for Vercel serverless functions
module.exports = app; 