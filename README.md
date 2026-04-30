# Campus Lab Slot Booking System

**SE ZG503 - Full Stack Application Development | Assignment 2026**

A full-stack web application that lets students book time slots in shared campus lab facilities (computer labs, 3D printer rooms, recording studios, chemistry labs), while staff manage availability and approvals, and admins monitor usage.

## Problem Statement

University campuses have multiple shared specialized facilities that students need to access outside scheduled classes. Currently, booking is managed through emails, WhatsApp groups, or paper sign-up sheets — leading to double-bookings, no-shows, capacity violations, and zero visibility into actual usage.

This platform digitizes the entire lab booking lifecycle.

## User Roles

## User Roles

- **Students** — Browse labs, book/cancel slots, view booking history
- **Staff** — Manage assigned labs, approve/reject bookings, mark no-shows, block slots for maintenance
- **Department Admins** — Add/edit labs, assign staff, view usage analytics, manage users

## Core Features

- Authentication & role-based access (JWT)
- Lab management (CRUD)
- Slot booking with conflict detection (no overlap, capacity-aware)
- Approval workflow (request → approve/reject → completed/no-show)
- Search & filter labs by type, date, availability
- Usage analytics dashboard for admins

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS + React Router |
| Backend | Node.js + Express (microservices) |
| Database | MySQL |
| Auth | JWT |
| API Docs | Swagger |
| AI Tools Used | Claude, GitHub Copilot |

## Architecture

Microservice-based backend with 3 services + an API gateway:

- **API Gateway** (port 5000) — Single entry point, JWT validation, request routing
- **Auth Service** (port 5001) — Signup, login, user management
- **Lab Service** (port 5002) — Lab CRUD, technician assignment
- **Booking Service** (port 5003) — Slot booking, conflict detection, approval workflow

## Folder Structure## Setup Instructions

*(Will be added as the project develops)*

## Author

Tanya Thomas | BITS Pilani WILP | SE ZG503