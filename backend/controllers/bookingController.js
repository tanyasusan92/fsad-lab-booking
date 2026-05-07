const db = require('../config/db');
const { generateSlotsForLab } = require('../utils/slotGenerator');

/**
 * GET /api/labs/:labId/slots?date=YYYY-MM-DD
 * Returns all slots for a lab on a specific date,
 * with their booking status. Auto-generates slots if missing.
 */
const getSlotsForLab = async (req, res) => {
  try {
    const { labId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: 'date query param is required (YYYY-MM-DD)' });
    }

    // Verify lab exists
    const [labs] = await db.query('SELECT * FROM labs WHERE id = ?', [labId]);
    if (labs.length === 0) {
      return res.status(404).json({ message: 'Lab not found' });
    }
    const lab = labs[0];

    // Generate slots if not yet generated for this date
    await generateSlotsForLab(lab, 7);

    // Fetch slots with booking status
    const [slots] = await db.query( 
      `SELECT 
        s.id, s.lab_id, s.date, s.start_time, s.end_time, s.status,
        b.id AS booking_id, b.status AS booking_status, b.user_id AS booked_by_id,
        u.name AS booked_by_name
      FROM slots s
      LEFT JOIN bookings b 
        ON s.id = b.slot_id 
        AND b.status IN ('requested', 'approved')
      LEFT JOIN users u ON b.user_id = u.id
      WHERE s.lab_id = ? AND s.date = ?
      ORDER BY s.start_time ASC`,
      [labId, date]
    );

    // Add a helper field: is this slot available?
    const enriched = slots.map((s) => ({
      ...s,
      is_available: s.status === 'available' && s.booking_id === null,
      is_my_booking: s.booked_by_id === req.user.id,
    }));

    res.json({ lab, date, slots: enriched, count: enriched.length });
  } catch (error) {
    console.error('Get slots error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * POST /api/bookings
 * Student creates a booking request for a slot.
 * Conflict detection runs in 3 layers:
 *   1. Slot must exist and be available
 *   2. No existing requested/approved booking for this slot
 *   3. User has no other requested/approved booking at the same time
 */
const createBooking = async (req, res) => {
  try {
    const { slot_id, purpose } = req.body;
    const userId = req.user.id;

    if (!slot_id) {
      return res.status(400).json({ message: 'slot_id is required' });
    }

    // 1. Slot must exist and be 'available' (not 'blocked')
    const [slots] = await db.query(
      'SELECT id, lab_id, date, start_time, end_time, status FROM slots WHERE id = ?',
      [slot_id]
    );
    if (slots.length === 0) {
      return res.status(404).json({ message: 'Slot not found' });
    }
    const slot = slots[0];

    if (slot.status === 'blocked') {
      return res.status(409).json({ message: 'This slot is blocked for maintenance' });
    }

    // 2. Slot must not already have an active booking
    const [existingSlotBookings] = await db.query(
      `SELECT id FROM bookings 
       WHERE slot_id = ? AND status IN ('requested', 'approved')`,
      [slot_id]
    );
    if (existingSlotBookings.length > 0) {
      return res.status(409).json({ message: 'This slot is already booked' });
    }

    // 3. User must not have a clashing booking elsewhere at the same time
    const [userClashes] = await db.query(
      `SELECT b.id, l.name AS lab_name
       FROM bookings b
       JOIN slots s ON b.slot_id = s.id
       JOIN labs l ON s.lab_id = l.id
       WHERE b.user_id = ? 
         AND b.status IN ('requested', 'approved')
         AND s.date = ? 
         AND s.start_time = ?`,
      [userId, slot.date, slot.start_time]
    );
    if (userClashes.length > 0) {
      return res.status(409).json({
        message: `You already have a booking at this time in ${userClashes[0].lab_name}`,
      });
    }

    // All checks passed — create the booking
    const [result] = await db.query(
      'INSERT INTO bookings (slot_id, user_id, purpose, status) VALUES (?, ?, ?, ?)',
      [slot_id, userId, purpose || null, 'requested']
    );

    res.status(201).json({
      message: 'Booking request submitted. Awaiting staff approval.',
      bookingId: result.insertId,
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * GET /api/bookings/me
 * Returns the logged-in user's bookings, with lab + slot info.
 */
const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const [bookings] = await db.query(
      `SELECT 
        b.id, b.status, b.purpose, b.rejection_reason,
        b.created_at, b.decided_at,
        s.date, s.start_time, s.end_time,
        l.id AS lab_id, l.name AS lab_name, l.location AS lab_location, l.type AS lab_type,
        decider.name AS decided_by_name
      FROM bookings b
      JOIN slots s ON b.slot_id = s.id
      JOIN labs l ON s.lab_id = l.id
      LEFT JOIN users decider ON b.decided_by = decider.id
      WHERE b.user_id = ?
      ORDER BY s.date DESC, s.start_time DESC`,
      [userId]
    );

    res.json({ bookings, count: bookings.length });
  } catch (error) {
    console.error('Get my bookings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * GET /api/bookings/lab/:labId
 * Staff sees bookings for labs they manage. Admin sees all.
 */
const getBookingsForLab = async (req, res) => {
  try {
    const { labId } = req.params;
    const { status } = req.query; // optional filter

    // Verify lab exists
    const [labs] = await db.query('SELECT id, staff_id FROM labs WHERE id = ?', [labId]);
    if (labs.length === 0) {
      return res.status(404).json({ message: 'Lab not found' });
    }

    // Permission: admin OR assigned staff
    if (req.user.role !== 'admin' && labs[0].staff_id !== req.user.id) {
      return res.status(403).json({
        message: 'Access denied. Only assigned staff or admins can view this lab\'s bookings.',
      });
    }

    let query = `
      SELECT 
        b.id, b.status, b.purpose, b.rejection_reason, b.created_at, b.decided_at,
        s.date, s.start_time, s.end_time,
        u.id AS user_id, u.name AS user_name, u.email AS user_email
      FROM bookings b
      JOIN slots s ON b.slot_id = s.id
      JOIN users u ON b.user_id = u.id
      WHERE s.lab_id = ?
    `;
    const params = [labId];

    if (status) {
      query += ' AND b.status = ?';
      params.push(status);
    }

    query += ' ORDER BY s.date DESC, s.start_time DESC';

    const [bookings] = await db.query(query, params);

    res.json({ bookings, count: bookings.length });
  } catch (error) {
    console.error('Get lab bookings error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * PATCH /api/bookings/:id/approve
 * Staff/admin approves a 'requested' booking.
 */
const approveBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const [bookings] = await db.query(
      `SELECT b.id, b.status, s.lab_id, l.staff_id
       FROM bookings b
       JOIN slots s ON b.slot_id = s.id
       JOIN labs l ON s.lab_id = l.id
       WHERE b.id = ?`,
      [id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const booking = bookings[0];

    // Permission: admin OR assigned staff
    if (req.user.role !== 'admin' && booking.staff_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (booking.status !== 'requested') {
      return res.status(409).json({
        message: `Cannot approve a booking with status '${booking.status}'`,
      });
    }

    await db.query(
      `UPDATE bookings 
       SET status = 'approved', decided_by = ?, decided_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [req.user.id, id]
    );

    res.json({ message: 'Booking approved' });
  } catch (error) {
    console.error('Approve booking error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * PATCH /api/bookings/:id/reject
 * Staff/admin rejects a 'requested' booking with optional reason.
 */
const rejectBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const [bookings] = await db.query(
      `SELECT b.id, b.status, s.lab_id, l.staff_id
       FROM bookings b
       JOIN slots s ON b.slot_id = s.id
       JOIN labs l ON s.lab_id = l.id
       WHERE b.id = ?`,
      [id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const booking = bookings[0];

    if (req.user.role !== 'admin' && booking.staff_id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (booking.status !== 'requested') {
      return res.status(409).json({
        message: `Cannot reject a booking with status '${booking.status}'`,
      });
    }

    await db.query(
      `UPDATE bookings 
       SET status = 'rejected', 
           decided_by = ?, 
           decided_at = CURRENT_TIMESTAMP,
           rejection_reason = ?
       WHERE id = ?`,
      [req.user.id, reason || null, id]
    );

    res.json({ message: 'Booking rejected' });
  } catch (error) {
    console.error('Reject booking error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * PATCH /api/bookings/:id/cancel
 * Student cancels their own booking, OR admin cancels any booking.
 */
const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const [bookings] = await db.query(
      'SELECT id, user_id, status FROM bookings WHERE id = ?',
      [id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const booking = bookings[0];

    // Permission: own booking, OR admin
    if (booking.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!['requested', 'approved'].includes(booking.status)) {
      return res.status(409).json({
        message: `Cannot cancel a booking with status '${booking.status}'`,
      });
    }

    await db.query(
      `UPDATE bookings SET status = 'cancelled' WHERE id = ?`,
      [id]
    );

    res.json({ message: 'Booking cancelled' });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * GET /api/bookings/stats
 * Admin-only: usage analytics for the dashboard.
 */
const getBookingStats = async (req, res) => {
  try {
    const [totalRows] = await db.query('SELECT COUNT(*) AS total FROM bookings');
    const [statusBreakdown] = await db.query(
      `SELECT status, COUNT(*) AS count FROM bookings GROUP BY status`
    );
    const [topLabs] = await db.query(
      `SELECT l.id, l.name, COUNT(b.id) AS booking_count
       FROM labs l
       LEFT JOIN slots s ON s.lab_id = l.id
       LEFT JOIN bookings b ON b.slot_id = s.id 
         AND b.status IN ('approved', 'completed')
       GROUP BY l.id, l.name
       ORDER BY booking_count DESC
       LIMIT 5`
    );

    res.json({
      total_bookings: totalRows[0].total,
      status_breakdown: statusBreakdown,
      top_labs: topLabs,
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getSlotsForLab,
  createBooking,
  getMyBookings,
  getBookingsForLab,
  approveBooking,
  rejectBooking,
  cancelBooking,
  getBookingStats,
};