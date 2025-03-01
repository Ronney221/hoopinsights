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
  process.exit(1);
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection with Mongoose
mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log('Successfully connected to MongoDB.');
})
.catch((error) => {
  console.error('Error connecting to MongoDB:', error);
  process.exit(1);
});

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

// Add console.logs to debug
app.post('/api/users/saveUserData', async (req, res) => {
  console.log('Request body:', req.body); // See what data is being received
  try {
    // ... your code
    console.log('Data saved successfully');
  } catch (error) {
    console.error('Error:', error); // See detailed error messages
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle cleanup on server shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  process.exit(0);
}); 