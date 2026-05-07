const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBookingsForLab,
  approveBooking,
  rejectBooking,
  cancelBooking,
  getBookingStats,
} = require('../controllers/bookingController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

// All booking routes require authentication- runs before every route in this file.
router.use(authenticate);

// POST /api/bookings — student creates a booking
router.post('/', createBooking);

// GET /api/bookings/me — get my own bookings
router.get('/me', getMyBookings);

// GET /api/bookings/stats — admin only
router.get('/stats', authorize('admin'), getBookingStats);

// GET /api/bookings/lab/:labId — staff or admin
router.get('/lab/:labId', authorize('staff', 'admin'), getBookingsForLab);

// PATCH /api/bookings/:id/approve — staff or admin
router.patch('/:id/approve', authorize('staff', 'admin'), approveBooking);

// PATCH /api/bookings/:id/reject — staff or admin
router.patch('/:id/reject', authorize('staff', 'admin'), rejectBooking);

// PATCH /api/bookings/:id/cancel — student (own) or admin
router.patch('/:id/cancel', cancelBooking);

module.exports = router;