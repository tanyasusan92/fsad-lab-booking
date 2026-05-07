# Campus Lab Slot Booking System

> **SE ZG503 — Full Stack Application Development**  
> BITS Pilani WILP | Assignment 2026

A full-stack web application that digitizes lab slot booking on a university campus. Students can browse available labs (computer rooms, 3D printer rooms, recording studios, chemistry labs), book one-hour time slots, and track approvals. Lab staff approve/reject bookings for their assigned lab. Admins manage labs system-wide and view usage analytics.

---

## 🎯 Problem Statement

Many campuses still manage lab bookings through emails, WhatsApp groups, or paper sign-up sheets — leading to double-bookings, no-shows, and zero visibility into actual usage. This application replaces those ad-hoc workflows with a structured booking system featuring conflict detection, role-based approval workflows, and admin analytics.

---

## ✨ Key Features

### For Students
- 🔍 Browse all labs with filtering by type (computer / 3D printer / studio / chemistry)
- 📅 Select a date and view a slot calendar
- 📝 Submit booking requests with optional purpose
- ✅ Track booking status (requested → approved/rejected → completed/cancelled)
- ❌ Cancel pending or approved bookings

### For Lab Staff
- 📋 Manage bookings for their assigned lab
- ✔️ Approve booking requests
- ✗ Reject with optional reason

### For Admins
- 🏢 Full CRUD on labs (create, edit, delete)
- 👥 Override booking decisions on any lab
- 📊 System-wide analytics: total bookings, status breakdown, top labs

### Smart Conflict Detection (Differentiator)
When a student submits a booking, three layers of validation run:
1. The slot must not be blocked for maintenance
2. The slot must not already be reserved
3. **The user must not have any other active booking at the same time across any lab** — prevents accidental double-booking

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Frontend** | React 18 + Vite + Tailwind CSS + React Router | React mandated by brief; Vite for fast dev; Tailwind for rapid UI |
| **Backend** | Node.js + Express.js | JavaScript everywhere reduces context-switching with React |
| **Database** | MySQL 8 (via XAMPP) | Relational data with foreign keys for integrity |
| **Driver** | mysql2/promise | Async/await SQL with parameterized queries |
| **Auth** | JSON Web Tokens (JWT) + bcryptjs | Industry-standard token-based auth with password hashing |
| **API Docs** | Swagger UI (swagger-jsdoc) | Interactive auto-generated documentation |
| **HTTP Client** | Axios with interceptors | Auto-attaches JWT, handles 401 globally |

---

## 🏗️ Architecture

The backend follows a **modular service-oriented architecture** (modular monolith) — three logical microservices share a single Express process:

┌────────────────────────────────────────────────────────┐
│            React Frontend (port 5173)                  │
└───────────────────────┬────────────────────────────────┘
│ HTTP/JSON + JWT Authorization
▼
┌────────────────────────────────────────────────────────┐
│         Express API Gateway (port 5000)                │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐    │
│  │ Auth Service│  │ Lab Service │  │ Booking Svc  │    │
│  │ /api/auth/* │  │ /api/labs/* │  │/api/bookings │    │
│  └─────────────┘  └─────────────┘  └──────────────┘    │
│           Auth Middleware (authenticate, authorize)    │
│              Swagger UI: /api-docs                     │
└───────────────────────┬────────────────────────────────┘
│ mysql2/promise
▼
┌────────────────────────────────────────────────────────┐
│      MySQL Database (lab_booking)                      │
│   users | labs | slots | bookings                      │
└────────────────────────────────────────────────────────┘

For a detailed breakdown, see [`docs/architecture.md`](./docs/architecture.md).

---

## 📂 Project Structure

fsad-lab-booking/
├── backend/
│   ├── config/
│   │   ├── db.js              # MySQL connection pool
│   │   └── swagger.js         # Swagger config
│   ├── controllers/
│   │   ├── authController.js  # Signup, login logic
│   │   ├── labController.js   # Lab CRUD
│   │   └── bookingController.js  # Slots, bookings, approval
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT auth + role authorization
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── labRoutes.js
│   │   └── bookingRoutes.js
│   ├── utils/
│   │   └── slotGenerator.js   # Auto-generates 1-hr slots
│   ├── server.js              # Entry point
│   ├── package.json
│   └── .env                   # (gitignored — use .env.example)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProtectedRoute.jsx
│   │   │   └── LabFormModal.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Labs.jsx
│   │   │   ├── LabDetail.jsx        # Slot calendar + booking
│   │   │   ├── MyBookings.jsx
│   │   │   ├── LabBookings.jsx      # Staff/admin approval
│   │   │   ├── AdminStats.jsx
│   │   │   └── Unauthorized.jsx
│   │   ├── services/
│   │   │   └── api.js              # Axios instance + endpoints
│   │   ├── App.jsx                 # React Router setup
│   │   └── main.jsx
│   ├── tailwind.config.js
│   └── package.json
├── docs/
│   ├── architecture.md
│   └── ai-usage-log.md
└── README.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js v22.12+** (download: https://nodejs.org)
- **XAMPP** (for MySQL — https://www.apachefriends.org/download.html)
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/tanyasusan92/fsad-lab-booking.git
cd fsad-lab-booking
```

### 2. Database Setup

Start XAMPP → Start MySQL → open phpMyAdmin (http://localhost/phpmyadmin):

1. Create a new database named **`lab_booking`** (use default collation)
2. Click on `lab_booking` → **SQL** tab → paste and run:

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('student', 'staff', 'admin') NOT NULL DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE labs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  type ENUM('computer', 'printer_3d', 'studio', 'chemistry') NOT NULL,
  location VARCHAR(200) NOT NULL,
  capacity INT NOT NULL DEFAULT 1,
  equipment_description TEXT,
  operating_start_time TIME NOT NULL DEFAULT '09:00:00',
  operating_end_time TIME NOT NULL DEFAULT '18:00:00',
  staff_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE slots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lab_id INT NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status ENUM('available', 'blocked') NOT NULL DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lab_id) REFERENCES labs(id) ON DELETE CASCADE,
  UNIQUE KEY unique_slot (lab_id, date, start_time)
);

CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slot_id INT NOT NULL,
  user_id INT NOT NULL,
  status ENUM('requested', 'approved', 'rejected', 'cancelled', 'completed') 
    NOT NULL DEFAULT 'requested',
  purpose VARCHAR(500),
  decided_by INT,
  decided_at TIMESTAMP NULL,
  rejection_reason VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (slot_id) REFERENCES slots(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (decided_by) REFERENCES users(id) ON DELETE SET NULL
);
```

### 3. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with:

PORT=5000
JWT_SECRET=your_random_secret_here_change_me
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=lab_booking

> Default XAMPP MySQL uses empty password for `root`. If you've set one, update `DB_PASSWORD`.

Start the backend:

```bash
npm run dev
```

You should see:

✅ Database connected successfully
✅ Server running on http://localhost:5000

### 4. Frontend Setup

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

You should see:

VITE v8.x.x ready in xxx ms
➜ Local: http://localhost:5173/

### 5. Open the App

- **Frontend:** http://localhost:5173
- **Swagger API Docs:** http://localhost:5000/api-docs
- **Backend health check:** http://localhost:5000/health

### 6. Create Your First Users

1. Visit http://localhost:5173/signup
2. Sign up at least three accounts:
   - One **student** (e.g., student@test.com)
   - One **staff** (e.g., staff@test.com)
   - One **admin** (e.g., admin@test.com)

> Note: In production, the role field would be locked to "student" and admins would promote others. For demo purposes, the role selector allows direct admin creation.

3. Login as admin → create some labs from the Labs page
4. Login as student → browse labs → book a slot
5. Login as admin (or staff) → manage bookings → approve/reject

---

## 🔑 Test Accounts (after signup)

| Role | Email | Password |
|---|---|---|
| Admin | admin@test.com | password123 |
| Staff | staff@test.com | password123 |
| Student | student@test.com | password123 |

---

## 📡 API Reference

Full interactive documentation is available at **http://localhost:5000/api-docs** when the backend is running.

### Auth
- `POST /api/auth/signup` — Create a new user
- `POST /api/auth/login` — Login, returns JWT
- `GET /api/auth/me` — Get current user (auth required)

### Labs
- `GET /api/labs?type=computer` — List labs (auth required)
- `GET /api/labs/:id` — Get lab details
- `GET /api/labs/:labId/slots?date=YYYY-MM-DD` — Get slots for a date
- `POST /api/labs` — Create lab (admin only)
- `PUT /api/labs/:id` — Update lab (admin only)
- `DELETE /api/labs/:id` — Delete lab (admin only)

### Bookings
- `POST /api/bookings` — Create booking request
- `GET /api/bookings/me` — My bookings
- `GET /api/bookings/lab/:labId` — Lab's bookings (staff/admin)
- `PATCH /api/bookings/:id/approve` — Approve (staff/admin)
- `PATCH /api/bookings/:id/reject` — Reject with reason (staff/admin)
- `PATCH /api/bookings/:id/cancel` — Cancel (own booking or admin)
- `GET /api/bookings/stats` — System analytics (admin only)

---

## 🔒 Security Considerations

- **Passwords** are hashed with bcrypt (10 salt rounds) — never stored in plain text
- **JWTs** signed with HS256, 24-hour expiry
- **Role-based authorization** enforced on backend (frontend role checks are UX-only)
- **SQL injection** prevented via parameterized queries (`?` placeholders, never string concatenation)
- **CORS** configured for the development frontend
- **Authorization header** required for all data endpoints
- **Generic error messages** on login (no email enumeration leak)

---

## 🤖 AI-Assisted Development

This project was built with significant AI assistance from **Claude (Anthropic)**. See [`docs/ai-usage-log.md`](./docs/ai-usage-log.md) for a detailed log of how AI was used, including:
- Architecture decisions
- Boilerplate generation
- Debugging
- Documentation

---

## 📝 License & Attribution

Built as a coursework submission for **SE ZG503 — Full Stack Application Development** at BITS Pilani WILP.

Developed by **Tanya Thomas** with AI pair-programming assistance.

---

## 🐛 Troubleshooting

| Issue | Fix |
|---|---|
| `Database connection failed: Unknown database 'lab_booking'` | Create the database in phpMyAdmin first |
| `Access denied for user 'root'@'localhost'` | Check `DB_PASSWORD` in `backend/.env` matches your MySQL setup |
| `port 5000 already in use` | Change `PORT=5001` in `backend/.env` |
| `Vite requires Node.js version 22.12+` | Upgrade Node from https://nodejs.org |
| Swagger UI loads but no endpoints | JSDoc YAML formatting issue — check route file syntax |
| Frontend shows "Network Error" on login | Backend isn't running, or XAMPP MySQL isn't started |
