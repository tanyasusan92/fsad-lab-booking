const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Campus Lab Slot Booking API',
      version: '1.0.0',
      description:
        'REST API for managing campus lab bookings. Supports student, staff, and admin roles with JWT-based authentication.',
      contact: {
        name: 'Tanya Thomas',
        email: 'tanya@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token (without the word "Bearer")',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Tanya Thomas' },
            email: { type: 'string', example: 'tanya@example.com' },
            role: {
              type: 'string',
              enum: ['student', 'staff', 'admin'],
              example: 'student',
            },
          },
        },
        Lab: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: 'Computer Lab A-101' },
            type: {
              type: 'string',
              enum: ['computer', 'printer_3d', 'studio', 'chemistry'],
            },
            location: { type: 'string', example: 'Building A, 1st Floor' },
            capacity: { type: 'integer', example: 30 },
            equipment_description: { type: 'string' },
            operating_start_time: { type: 'string', example: '09:00:00' },
            operating_end_time: { type: 'string', example: '18:00:00' },
            staff_id: { type: 'integer', nullable: true },
          },
        },
        Booking: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            slot_id: { type: 'integer', example: 5 },
            user_id: { type: 'integer', example: 3 },
            status: {
              type: 'string',
              enum: ['requested', 'approved', 'rejected', 'cancelled', 'completed'],
            },
            purpose: { type: 'string' },
            rejection_reason: { type: 'string', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        Slot: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            lab_id: { type: 'integer', example: 1 },
            date: { type: 'string', format: 'date', example: '2026-04-29' },
            start_time: { type: 'string', example: '09:00:00' },
            end_time: { type: 'string', example: '10:00:00' },
            status: { type: 'string', enum: ['available', 'blocked'] },
            is_available: { type: 'boolean' },
            is_my_booking: { type: 'boolean' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Error description' },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Labs', description: 'Lab management (admin) and viewing (all)' },
      { name: 'Bookings', description: 'Slot booking and approval workflow' },
    ],
  },
  // Files to scan for JSDoc comments
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;