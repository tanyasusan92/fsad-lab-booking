const express = require('express');
const router = express.Router();
const {
  getAllLabs,
  getLabById,
  createLab,
  updateLab,
  deleteLab,
} = require('../controllers/labController');
const { getSlotsForLab } = require('../controllers/bookingController');
const { authenticate, authorize } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /api/labs:
 *   get:
 *     tags: [Labs]
 *     summary: List all labs
 *     description: Any authenticated user can view labs. Optional filter by type.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [computer, printer_3d, studio, chemistry]
 *         description: Filter by lab type
 *     responses:
 *       200:
 *         description: List of labs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 labs:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Lab' }
 *                 count: { type: integer }
 *       401:
 *         description: Not authenticated
 */
router.get('/', authenticate, getAllLabs);

/**
 * @swagger
 * /api/labs/{id}:
 *   get:
 *     tags: [Labs]
 *     summary: Get a single lab by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Lab details
 *       404:
 *         description: Lab not found
 */
router.get('/:id', authenticate, getLabById);

/**
 * @swagger
 * /api/labs/{labId}/slots:
 *   get:
 *     tags: [Labs]
 *     summary: Get available slots for a lab on a specific date
 *     description: Auto-generates slots for the next 7 days if missing. Returns slots with booking status.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: labId
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: date
 *         required: true
 *         schema: { type: string, format: date }
 *         example: '2026-04-29'
 *     responses:
 *       200:
 *         description: Slots for the lab on the specified date
 *       400:
 *         description: Missing date parameter
 *       404:
 *         description: Lab not found
 */
router.get('/:labId/slots', authenticate, getSlotsForLab);

/**
 * @swagger
 * /api/labs:
 *   post:
 *     tags: [Labs]
 *     summary: Create a new lab (admin only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, type, location]
 *             properties:
 *               name: { type: string, example: 'Computer Lab A-101' }
 *               type: { type: string, enum: [computer, printer_3d, studio, chemistry] }
 *               location: { type: string }
 *               capacity: { type: integer, default: 1 }
 *               equipment_description: { type: string }
 *               operating_start_time: { type: string, example: '09:00:00' }
 *               operating_end_time: { type: string, example: '18:00:00' }
 *               staff_id: { type: integer, nullable: true }
 *     responses:
 *       201:
 *         description: Lab created
 *       400:
 *         description: Validation error
 *       403:
 *         description: Access denied (not admin)
 */
router.post('/', authenticate, authorize('admin'), createLab);

/**
 * @swagger
 * /api/labs/{id}:
 *   put:
 *     tags: [Labs]
 *     summary: Update a lab (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               type: { type: string }
 *               location: { type: string }
 *               capacity: { type: integer }
 *               equipment_description: { type: string }
 *               operating_start_time: { type: string }
 *               operating_end_time: { type: string }
 *               staff_id: { type: integer }
 *     responses:
 *       200:
 *         description: Updated successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Lab not found
 */
router.put('/:id', authenticate, authorize('admin'), updateLab);

/**
 * @swagger
 * /api/labs/{id}:
 *   delete:
 *     tags: [Labs]
 *     summary: Delete a lab (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Deleted successfully
 *       403:
 *         description: Access denied
 *       404:
 *         description: Lab not found
 */
router.delete('/:id', authenticate, authorize('admin'), deleteLab);

module.exports = router;