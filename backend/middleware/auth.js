const jwt = require('jsonwebtoken');
const config = require('../config');

// Middleware to verify JWT token
const auth = (req, res, next) => {
  try {
    // CRITICAL: Always set JSON content type FIRST
    res.set('Content-Type', 'application/json');
    
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[AUTH] ❌ No token provided for path:', req.path);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token',
        data: null
      });
    }

    // Extract token
    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET);

    // Attach user info to request
    // Normalize token payload so both `id` and `_id` are available
    req.user = decoded || {};
    if (decoded && decoded.id && !decoded._id) req.user._id = decoded.id;
    if (decoded && decoded._id && !decoded.id) req.user.id = decoded._id;

    // Debug logging in development to help trace auth issues
    if (config.NODE_ENV === 'development') {
      try {
        console.log('[AUTH] ✅ Token verified for user:', { id: decoded.id, role: decoded.role, email: decoded.email, path: req.path });
      } catch (e) {
        console.log('[AUTH] ✅ Token verified (minimal info)');
      }
    }
    next();
  } catch (err) {
    console.log('[AUTH] ❌ Token verification failed:', { error: err.message, path: req.path });
    // CRITICAL: Always set JSON content type on error
    res.set('Content-Type', 'application/json');
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token invalid',
      error: err.message,
      data: null
    });
  }
};

module.exports = auth;
