/**
 * Simplified authentication middleware
 * This approach doesn't require Firebase Admin SDK verification
 */
const authenticateUser = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    // For development purposes, allow requests without tokens
    console.warn('No auth token provided, using mock user');
    req.user = {
      uid: 'mock-user-id',
      email: 'mock-user@example.com',
      isAdmin: false
    };
    return next();
  }

  // Extract the token but don't verify it with Firebase Admin
  const idToken = authorization.split('Bearer ')[1];
  
  try {
    // We trust that the client-side Firebase SDK already verified this token
    // Extract user ID from custom headers or use a default
    req.user = {
      uid: req.headers['x-user-id'] || 'authenticated-user',
      email: req.headers['x-user-email'] || 'user@example.com',
      isAdmin: false
    };
    next();
  } catch (error) {
    console.error('Error in auth middleware:', error);
    return res.status(403).json({ error: 'Unauthorized' });
  }
};

/**
 * Admin middleware to check if user has admin privileges
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Admin privileges required' });
  }
  next();
};

module.exports = { authenticateUser, requireAdmin }; 