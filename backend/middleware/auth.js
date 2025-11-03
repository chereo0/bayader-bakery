const jwt = require('jsonwebtoken');
const config = require('../config');

// Middleware to verify JWT token
const auth = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token'
      });
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET);

    // Attach user info to request
    req.user = decoded;

    // Debug logging in development to help trace auth issues
    if (config.NODE_ENV === 'development') {
      try {
        console.debug('auth middleware decoded token:', { id: decoded.id, role: decoded.role, email: decoded.email });
      } catch (e) {
        console.debug('auth middleware decoded token (no details)');
      }
    }
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token invalid'
    });
  }
};

module.exports = auth;
