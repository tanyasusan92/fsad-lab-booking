const jwt = require('jsonwebtoken');

// Verifies that a request has a valid JWT
const authenticate = (req, res, next) => {
  try {
    // 1. Get the token from the Authorization header
    // Header format: "Authorization: Bearer <token>"
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'No token provided. Please log in.',
      });
    }

    const token = authHeader.split(' ')[1]; // grab the part after "Bearer "

    // 2. Verify the token's signature and expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Attach user info to the request so the next handler can use it
    req.user = decoded; // { id, email, role, iat, exp }

    // 4. Pass control to the next handler
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired. Please log in again.' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    return res.status(500).json({
      message: 'Authentication error',
      error: error.message,
    });
  }
};

// Restricts access to specific roles
// Usage: authorize('admin') or authorize('admin', 'staff')
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // This middleware MUST run AFTER `authenticate` (so req.user exists)
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
      });
    }

    next();
  };
};

module.exports = { authenticate, authorize };