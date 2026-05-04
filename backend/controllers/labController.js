const db = require('../config/db');

// Get all labs (any logged-in user)
const getAllLabs = async (req, res) => {
  try {
    const { type } = req.query; // optional filter

    let query = `
      SELECT 
        l.id, l.name, l.type, l.location, l.capacity, 
        l.equipment_description, l.operating_start_time, l.operating_end_time,
        l.staff_id, u.name AS staff_name,
        l.created_at, l.updated_at
      FROM labs l
      LEFT JOIN users u ON l.staff_id = u.id
    `;
    const params = [];

    if (type) {
      query += ' WHERE l.type = ?';
      params.push(type);
    }

    query += ' ORDER BY l.name ASC';

    const [labs] = await db.query(query, params);
    res.json({ labs, count: labs.length });
  } catch (error) {
    console.error('Get labs error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get a single lab by ID
const getLabById = async (req, res) => {
  try {
    const { id } = req.params;

    const [labs] = await db.query(
      `SELECT 
        l.id, l.name, l.type, l.location, l.capacity, 
        l.equipment_description, l.operating_start_time, l.operating_end_time,
        l.staff_id, u.name AS staff_name,
        l.created_at, l.updated_at
      FROM labs l
      LEFT JOIN users u ON l.staff_id = u.id
      WHERE l.id = ?`,
      [id]
    );

    if (labs.length === 0) {
      return res.status(404).json({ message: 'Lab not found' });
    }

    res.json({ lab: labs[0] });
  } catch (error) {
    console.error('Get lab error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new lab (admin only)
const createLab = async (req, res) => {
  try {
    const {
      name,
      type,
      location,
      capacity,
      equipment_description,
      operating_start_time,
      operating_end_time,
      staff_id,
    } = req.body;

    // Validation
    if (!name || !type || !location) {
      return res.status(400).json({
        message: 'Name, type, and location are required',
      });
    }

    const validTypes = ['computer', 'printer_3d', 'studio', 'chemistry'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        message: `Type must be one of: ${validTypes.join(', ')}`,
      });
    }

    if (capacity && capacity < 1) {
      return res.status(400).json({ message: 'Capacity must be at least 1' });
    }

    // If staff_id provided, verify it's an actual staff user
    if (staff_id) {
      const [staffUsers] = await db.query(
        'SELECT id, role FROM users WHERE id = ?',
        [staff_id]
      );
      if (staffUsers.length === 0) {
        return res.status(400).json({ message: 'Assigned staff user not found' });
      }
      if (staffUsers[0].role !== 'staff') {
        return res.status(400).json({
          message: 'Assigned user must have role "staff"',
        });
      }
    }

    // Insert
    const [result] = await db.query(
      `INSERT INTO labs 
        (name, type, location, capacity, equipment_description, 
         operating_start_time, operating_end_time, staff_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        type,
        location,
        capacity || 1,
        equipment_description || null,
        operating_start_time || '09:00:00',
        operating_end_time || '18:00:00',
        staff_id || null,
      ]
    );

    res.status(201).json({
      message: 'Lab created successfully',
      labId: result.insertId,
    });
  } catch (error) {
    console.error('Create lab error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update an existing lab (admin only)
const updateLab = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      type,
      location,
      capacity,
      equipment_description,
      operating_start_time,
      operating_end_time,
      staff_id,
    } = req.body;

    // Verify lab exists
    const [existing] = await db.query('SELECT id FROM labs WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Lab not found' });
    }

    // Validation
    if (type) {
      const validTypes = ['computer', 'printer_3d', 'studio', 'chemistry'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          message: `Type must be one of: ${validTypes.join(', ')}`,
        });
      }
    }

    if (staff_id) {
      const [staffUsers] = await db.query(
        'SELECT id, role FROM users WHERE id = ?',
        [staff_id]
      );
      if (staffUsers.length === 0 || staffUsers[0].role !== 'staff') {
        return res.status(400).json({
          message: 'Assigned staff user must exist and have role "staff"',
        });
      }
    }

    await db.query(
      `UPDATE labs SET 
        name = COALESCE(?, name),
        type = COALESCE(?, type),
        location = COALESCE(?, location),
        capacity = COALESCE(?, capacity),
        equipment_description = COALESCE(?, equipment_description),
        operating_start_time = COALESCE(?, operating_start_time),
        operating_end_time = COALESCE(?, operating_end_time),
        staff_id = COALESCE(?, staff_id)
       WHERE id = ?`,
      [
        name,
        type,
        location,
        capacity,
        equipment_description,
        operating_start_time,
        operating_end_time,
        staff_id,
        id,
      ]
    );

    res.json({ message: 'Lab updated successfully' });
  } catch (error) {
    console.error('Update lab error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a lab (admin only)
const deleteLab = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query('DELETE FROM labs WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Lab not found' });
    }

    res.json({ message: 'Lab deleted successfully' });
  } catch (error) {
    console.error('Delete lab error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getAllLabs, getLabById, createLab, updateLab, deleteLab };