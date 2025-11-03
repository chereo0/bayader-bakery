// Middleware to check user role
// Accepts either requireRole('admin','staff') or requireRole(['admin','staff'])
const requireRole = (...allowedRoles) => {
  // Normalize when caller passes a single array argument
  let roles = allowedRoles;
  if (allowedRoles.length === 1 && Array.isArray(allowedRoles[0])) {
    roles = allowedRoles[0];
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const userRole = req.user && req.user.role;

    // Debug logging for role checks in development
    if (process.env.NODE_ENV === 'development') {
      console.debug('requireRole: checking roles', { allowed: roles, userRole, user: req.user });
    }

    if (!userRole || !roles.includes(userRole)) {
      if (process.env.NODE_ENV === 'development') {
        console.debug('requireRole: forbidden - roles do not match');
      }
      return res.status(403).json({
        success: false,
        message: 'Forbidden - insufficient permissions'
      });
    }

    next();
  };
};

module.exports = requireRole;
