/**
 * Campus Lab Slot Booking API — Server Entry Point
 *
 * ARCHITECTURE
 * ============
 * This backend follows a modular service-oriented architecture, often described
 * as a "modular monolith" — three logical microservices (Auth, Labs, Bookings)
 * deployed within a single Express process for simplicity. Each service owns
 * its own controller, routes, and database tables. The Express app itself
 * acts as a lightweight API Gateway, routing /api/auth/*, /api/labs/*, and
 * /api/bookings/* to the appropriate service module.
 *
 * Service boundaries:
 *   - Auth Service       (controllers/authController, routes/authRoutes)
 *                        Tables: users
 *   - Lab Service        (controllers/labController, routes/labRoutes)
 *                        Tables: labs
 *   - Booking Service    (controllers/bookingController, routes/bookingRoutes,
 *                         utils/slotGenerator)
 *                        Tables: slots, bookings
 *
 * Each module can be extracted into its own deployable Express app with
 * minimal changes — splitting requires only its own server.js plus an
 * upstream API gateway (nginx, Express + http-proxy-middleware, or a service
 * mesh) for cross-service request routing.
 */
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import database (this triggers the connection test on startup)
const db = require('./config/db');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Swagger API documentation
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Lab Booking API Docs',
  })
);

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
    documentation: 'http://localhost:5000/api-docs',
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});