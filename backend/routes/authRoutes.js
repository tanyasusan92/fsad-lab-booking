const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     description: Creates a new user with the specified role. Password is hashed with bcrypt.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Tanya Thomas
 *               email:
 *                 type: string
 *                 example: tanya@example.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: password123
 *               role:
 *                 type: string
 *                 enum: [student, staff, admin]
 *                 default: student
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error (missing fields, bad email, etc.)
 *       409:
 *         description: Email already registered
 */
router.post('/signup', signup);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     description: Returns a JWT token valid for 24 hours.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: tanya@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 token: { type: string }
 *                 user: { $ref: '#/components/schemas/User' }
 *       400:
 *         description: Missing email or password
 *       401:
 *         description: Invalid email or password
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user info from JWT
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns the JWT payload
 *       401:
 *         description: Missing or invalid token
 */
router.get('/me', authenticate, (req, res) => {
  res.json({
    message: 'Token verified successfully',
    user: req.user,
  });
});

/**
 * @swagger
 * /api/auth/admin-only:
 *   get:
 *     tags: [Auth]
 *     summary: Test endpoint - admin only
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Welcome admin
 *       403:
 *         description: Access denied (non-admin)
 */
router.get('/admin-only', authenticate, authorize('admin'), (req, res) => {
  res.json({ message: 'Welcome, admin!', user: req.user });
});

module.exports = router;