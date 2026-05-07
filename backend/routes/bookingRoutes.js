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

router.use(authenticate);

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     tags: [Bookings]
 *     summary: Create a booking request
 *     description: |
 *       Creates a booking with status 'requested'. Includes 3-layer conflict detection:
 *       1. Slot must not be blocked for maintenance
 *       2. Slot must not already be booked
 *       3. User must not have another active booking at the same date/time
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [slot_id]
 *             properties:
 *               slot_id: { type: integer, example: 5 }
 *               purpose: { type: string, example: 'Working on assignment' }
 *     responses:
 *       201:
 *         description: Booking created
 *       409:
 *         description: Conflict (slot blocked / already booked / user has clashing booking)
 */
router.post('/', createBooking);

/**
 * @swagger
 * /api/bookings/me:
 *   get:
 *     tags: [Bookings]
 *     summary: Get current user's bookings
 *     description: Returns all bookings for the logged-in user with lab and slot info.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of bookings
 */
router.get('/me', getMyBookings);

/**
 * @swagger
 * /api/bookings/stats:
 *   get:
 *     tags: [Bookings]
 *     summary: Booking analytics (admin only)
 *     description: Returns total bookings, status breakdown, and top 5 most-booked labs.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats object
 *       403:
 *         description: Access denied (non-admin)
 */
router.get('/stats', authorize('admin'), getBookingStats);

/**
 * @swagger
 * /api/bookings/lab/{labId}:
 *   get:
 *     tags: [Bookings]
 *     summary: Get bookings for a specific lab (staff/admin)
 *     description: Staff can only see their assigned lab. Admins see any lab.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: labId
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [requested, approved, rejected, cancelled, completed]
 *     responses:
 *       200:
 *         description: Array of bookings for the lab
 *       403:
 *         description: Not the assigned staff for this lab
 */
router.get('/lab/:labId', authorize('staff', 'admin'), getBookingsForLab);

/**
 * @swagger
 * /api/bookings/{id}/approve:
 *   patch:
 *     tags: [Bookings]
 *     summary: Approve a booking request (staff/admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Approved
 *       409:
 *         description: Booking is not in 'requested' state
 */
router.patch('/:id/approve', authorize('staff', 'admin'), approveBooking);

/**
 * @swagger
 * /api/bookings/{id}/reject:
 *   patch:
 *     tags: [Bookings]
 *     summary: Reject a booking with optional reason (staff/admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason: { type: string, example: 'Lab is reserved for class' }
 *     responses:
 *       200:
 *         description: Rejected
 *       409:
 *         description: Booking is not in 'requested' state
 */
router.patch('/:id/reject', authorize('staff', 'admin'), rejectBooking);

/**
 * @swagger
 * /api/bookings/{id}/cancel:
 *   patch:
 *     tags: [Bookings]
 *     summary: Cancel a booking (own booking, or admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Cancelled
 *       403:
 *         description: Not your booking and not admin
 *       409:
 *         description: Booking is not in cancellable state
 */
router.patch('/:id/cancel', cancelBooking);

module.exports = router;