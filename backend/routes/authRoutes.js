const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// POST /api/auth/signup
router.post('/signup', signup);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/me — returns logged-in user's info (test protected route)
router.get('/me', authenticate, (req, res) => {
  res.json({
    message: 'Token verified successfully',
    user: req.user,
  });
});

// GET /api/auth/admin-only — example admin-only route (test authorize)
router.get('/admin-only', authenticate, authorize('admin'), (req, res) => {
  res.json({
    message: 'Welcome, admin!',
    user: req.user,
  });
});

module.exports = router;