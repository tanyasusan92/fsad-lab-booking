const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import database (this triggers the connection test on startup)
const db = require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/labs', require('./routes/labRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend is running',
    timestamp: new Date().toISOString(),
  });
});

// Database health check route — verifies DB is reachable
app.get('/health/db', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 + 1 AS result');
    res.json({
      status: 'ok',
      message: 'Database is reachable',
      result: rows[0].result,
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Database not reachable',
      error: error.message,
    });
  }
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Campus Lab Slot Booking API',
    version: '1.0.0',
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});