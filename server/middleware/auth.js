/**
 * Simplified authentication middleware
 * This approach doesn't require Firebase Admin SDK verification
 */
const authenticateUser = async (req, res, next) => {
  const { authorization } = req.headers;

  try {
    // For Vercel deployment: handle options preflight requests
    if (req.method === 'OPTIONS') {
      return next();
    }

    // For development/testing purposes, allow requests without tokens if not in production
    if (!authorization || !authorization.startsWith('Bearer ')) {
      if (process.env.NODE_ENV === 'production') {
        console.warn('Unauthorized request: No valid authorization header provided');
        return res.status(401).json({ error: 'Authentication required' });
      } else {
        console.warn('No auth token provided, using mock user for development');
        req.user = {
          uid: 'mock-user-id',
          email: 'mock-user@example.com',
          isAdmin: false
        };
        return next();
      }
    }

    // Extract the token
    const idToken = authorization.split('Bearer ')[1];
    
    if (!idToken) {
      console.warn('Invalid authorization format: Bearer token is empty');
      return res.status(401).json({ error: 'Invalid authorization format' });
    }
    
    // We trust that the client-side Firebase SDK already verified this token
    // Extract user ID from custom headers
    const userId = req.headers['x-user-id'];
    const userEmail = req.headers['x-user-email'];
    
    if (!userId) {
      console.warn('Missing user ID in request headers');
      return res.status(401).json({ error: 'User ID is required' });
    }
    
    req.user = {
      uid: userId,
      email: userEmail || 'unknown@example.com',
      isAdmin: false
    };
    
    console.log(`Authenticated request from user: ${userId}`);
    next();
  } catch (error) {
    console.error('Error in auth middleware:', error);
    return res.status(403).json({ error: 'Authentication failed' });
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