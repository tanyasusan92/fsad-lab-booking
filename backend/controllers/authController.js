const bcrypt = require('bcryptjs');
const db = require('../config/db');

// Signup function — handles POST /api/auth/signup
const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email, and password are required',
      });
    }

    // 2. Validate email format (basic regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: 'Invalid email format',
      });
    }

    // 3. Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters',
      });
    }

    // 4. Validate role (default to 'student' if not provided)
    const validRoles = ['student', 'staff', 'admin'];
    const userRole = role || 'student';
    if (!validRoles.includes(userRole)) {
      return res.status(400).json({
        message: 'Role must be one of: student, staff, admin',
      });
    }

    // 5. Check if email already exists
    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    if (existingUsers.length > 0) {
      return res.status(409).json({
        message: 'Email already registered',
      });
    }

    // 6. Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 7. Insert into database
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, userRole]
    );

    // 8. Return success response (no password!)
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: result.insertId,
        name,
        email,
        role: userRole,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      message: 'Server error during signup',
      error: error.message,
    });
  }
};

module.exports = { signup };