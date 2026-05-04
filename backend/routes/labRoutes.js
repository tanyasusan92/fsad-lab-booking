const express = require('express');
const router = express.Router();
const {
  getAllLabs,
  getLabById,
  createLab,
  updateLab,
  deleteLab,
} = require('../controllers/labController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// All lab routes require authentication
// Admin-only for create, update, delete

// GET /api/labs — anyone logged in can view
router.get('/', authenticate, getAllLabs);

// GET /api/labs/:id — anyone logged in can view
router.get('/:id', authenticate, getLabById);

// POST /api/labs — admin only
router.post('/', authenticate, authorize('admin'), createLab);

// PUT /api/labs/:id — admin only
router.put('/:id', authenticate, authorize('admin'), updateLab);

// DELETE /api/labs/:id — admin only
router.delete('/:id', authenticate, authorize('admin'), deleteLab);

module.exports = router;