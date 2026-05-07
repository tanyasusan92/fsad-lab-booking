# Architecture — Campus Lab Slot Booking System

## High-Level Diagram

┌─────────────────────────────────────────────────────────┐
│                     CLIENT TIER                         │
│                                                         │
│   React + Vite + Tailwind CSS + React Router            │
│                  (Port 5173)                            │
│                                                         │
│   Pages: Login, Signup, Dashboard, Labs, LabDetail,     │
│          MyBookings, LabBookings, AdminStats,           │
│          Unauthorized                                   │
└──────────────────────────┬──────────────────────────────┘
│ HTTP/JSON + JWT in
│ Authorization header
▼
┌─────────────────────────────────────────────────────────┐
│                  APPLICATION TIER                       │
│                                                         │
│        Express.js API Gateway (Port 5000)               │
│                                                         │
│   ┌──────────┐   ┌──────────┐   ┌────────────────┐      │
│   │   Auth   │   │  Labs    │   │   Bookings     │      │
│   │ Service  │   │ Service  │   │   Service      │      │
│   │          │   │          │   │                │      │
│   │ /api/auth│   │ /api/labs│   │ /api/bookings  │      │
│   └─────┬────┘   └─────┬────┘   └────────┬───────┘      │
│         │              │                 │              │
│         └──────────────┼─────────────────┘              │
│                        │                                │
│              JWT Auth Middleware                        │
│            (authenticate + authorize)                   │
│                                                         │
│              Swagger UI: /api-docs                      │
└────────────────────────┬────────────────────────────────┘
│ mysql2/promise
▼
┌─────────────────────────────────────────────────────────┐
│                     DATA TIER                           │
│                                                         │
│              MySQL 8.0 (via XAMPP)                      │
│                                                         │
│   Tables: users | labs | slots | bookings               │
└─────────────────────────────────────────────────────────┘

## Service Responsibilities

### Auth Service
- User registration (POST /api/auth/signup)
- Login + JWT issuance (POST /api/auth/login)
- Token verification (GET /api/auth/me)
- Role-based authorization middleware

### Lab Service
- Lab CRUD (GET, POST, PUT, DELETE /api/labs)
- Filter by type
- Slot listing for a date (GET /api/labs/:id/slots) — delegates to Booking Service

### Booking Service
- Auto-generation of time slots (utils/slotGenerator)
- Booking creation with 3-layer conflict detection
- Approval workflow (approve/reject/cancel)
- User booking history
- Admin analytics (status breakdown, top labs)

## Inter-Service Communication

All services share the same MySQL database. Cross-service queries use SQL JOINs (e.g., the bookings list joins users + slots + labs in one query). This is intentional for the assignment scope — extracting services into separate processes would require message passing or an event bus, which is out of scope for a 7-day project.

## Authentication Flow

POST /api/auth/login  →  validates credentials → issues JWT (24h expiry)
Client stores JWT in localStorage
Every subsequent request: Authorization: Bearer <jwt>
authenticate middleware verifies signature, attaches req.user
authorize(role) middleware checks req.user.role for protected actions

## Conflict Detection (Booking Service Differentiator)

When a student creates a booking, three checks run in sequence:

1. **Slot availability** — slot must exist with status='available' (not blocked)
2. **Slot uniqueness** — no existing 'requested' or 'approved' booking for this slot
3. **User clash** — user has no other 'requested' or 'approved' booking at the same date+time across any lab

The third check prevents the common edge case where a user double-books themselves into two labs at once.

## Data Model

### users
- id (PK), name, email (UNIQUE), password (bcrypt hash), role (ENUM)

### labs
- id (PK), name, type (ENUM), location, capacity, equipment_description,
  operating_start_time, operating_end_time, staff_id (FK → users)

### slots
- id (PK), lab_id (FK → labs), date, start_time, end_time, status
- UNIQUE constraint on (lab_id, date, start_time) — prevents duplicate slots

### bookings
- id (PK), slot_id (FK → slots), user_id (FK → users),
  status (ENUM), purpose, decided_by (FK → users), decided_at,
  rejection_reason, created_at, updated_at

## Deployment Notes

For production deployment, the recommended split would be:
- Frontend: any static host (Vercel, Netlify, S3 + CloudFront)
- Backend: containerized Express services (Docker), one container per service
- Database: managed MySQL (RDS, PlanetScale, etc.)
- API Gateway: nginx or AWS API Gateway in front of the 3 service containers