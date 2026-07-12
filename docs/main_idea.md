# TransitOps — Smart Transport Operations Platform

> **Type:** Full-Stack Monorepo (React 19 Frontend + Node.js/Express 5 Backend + PostgreSQL)
> **Purpose:** Digitize the complete lifecycle of transport fleet operations

---

## Problem Statement

Many logistics companies still rely on spreadsheets and manual logbooks to manage transport operations. This leads to:

- **Scheduling conflicts** — same vehicle/driver double-booked
- **Underutilized vehicles** — no visibility into idle assets
- **Missed maintenance windows** — vehicles breaking down unexpectedly
- **Expired driver licenses** going unnoticed until dispatch
- **Inaccurate expense tracking** — no central fuel or cost record
- **Poor operational visibility** — no dashboards, no alerts, no reports

---

## Solution: TransitOps

TransitOps is a centralized, full-stack platform that manages the complete lifecycle of transport operations — from vehicle registration and driver management to trip dispatch, maintenance scheduling, fuel logging, financial analytics, and real-time dashboards.

**Live Frontend:** https://transit-ops-smart-transport-operati.vercel.app
**Live API:** https://transitops-smart-transport-operations.onrender.com

---

## Target Users (5 Roles)

| Role | Description |
|---|---|
| **Admin** | Full platform access. User management. System configuration. |
| **Fleet Manager** | Oversees fleet assets, maintenance, vehicle lifecycle, operational efficiency. |
| **Dispatcher** | Creates trips, assigns vehicles and drivers, monitors active deliveries. |
| **Safety Officer** | Ensures driver compliance, tracks license validity, monitors safety scores. |
| **Financial Analyst** | Reviews operational expenses, fuel consumption, maintenance costs, profitability. |

---

## Implemented Features

### ✅ Layer 0 — Authentication & Authorization
- Secure login with email + password (bcrypt hashed passwords)
- JWT-based stateless authentication
- Role-Based Access Control (RBAC) — 5 roles, enforced on every API endpoint
- Role-based UI access — buttons/modals hidden or disabled based on role
- Rate limiting: 10 login attempts per 15 minutes per IP
- Auto logout and redirect to `/login` on session expiry

### ✅ Layer 1 — Vehicle Registry
- Registration with unique Registration Number validation
- Fields: Name, Model, Vehicle Type, Max Capacity, Odometer, Acquisition Cost, Status, Region
- Status lifecycle: `Available` → `On Trip` / `In Shop` → `Available` → `Retired`
- Filtering by status, region, vehicle type
- Full CRUD with soft-delete

### ✅ Layer 1 — Driver Management
- Driver profiles with complete license tracking
- Fields: Name, License Number, Category, Expiry Date, Phone, Email, Safety Score, Status
- Status lifecycle: `Available` → `On Trip` / `Off Duty` / `Suspended`
- License expiry date validated at dispatch time (not just stored)

### ✅ Layer 2 — Fleet Availability Engine
- Real-time vehicle and driver availability tracking
- **Race condition prevention** using PostgreSQL `SELECT ... FOR UPDATE` row-level locking
- Prevents double-booking of the same vehicle or driver in concurrent requests
- Automatic transactional rollback if partial reservation fails
- Fleet statistics endpoint with live utilization metrics

### ✅ Layer 3 — Trip Management (9 Business Rules)
Trip lifecycle: `Draft` → `Dispatched` → `Completed` / `Cancelled`

All 9 rules enforced atomically at dispatch:
1. Vehicle must be `Available`
2. Vehicle cannot be `Retired`
3. Vehicle cannot be `In Shop`
4. Cargo weight ≤ vehicle max capacity
5. Driver must be `Available`
6. Driver cannot be `Suspended`
7. Driver license must not be expired
8. No double-booking (FOR UPDATE lock)
9. Resources (vehicle + driver) released on cancel or complete

Additional: Odometer auto-incremented by planned_distance on trip completion.

### ✅ Layer 4 — Maintenance Management
- Workshop CRUD (name, address, contact, manager)
- Maintenance record lifecycle: `Scheduled` → `In Progress` → `Completed` / `Cancelled`
- Scheduling maintenance **automatically sets vehicle to `In Shop`**
- Completing or cancelling **automatically restores vehicle to `Available`**
- Prevents dispatch of vehicles under active maintenance
- One active maintenance record per vehicle enforced

### ✅ Layer 5 — Fuel & Expense Tracking
- **Fuel Logs**: Station, quantity (liters), price per liter → `total_cost` auto-computed
- **Expense Logs**: Categorized (Tolls, Parking, Fines, Repair, etc.)
- **Revenue**: Linked to Completed trips with payment status tracking
- Full CRUD with filtering and pagination

### ✅ Layer 5 — Financial Analytics Engine
Three calculation engines via `/api/finance`:
- **Cost Engine**: fuel + maintenance + expenses per vehicle
- **ROI Engine**: `(Revenue - Total Cost) / Acquisition Cost × 100`
- **Efficiency Engine**: `Total Distance / Total Fuel` (km/liter)
- Per-vehicle, per-trip, and global financial summaries

### ✅ Layer 6 — Dashboard & KPIs
- Real-time fleet status counts (Available, On Trip, In Shop, Retired)
- Real-time trip counts (Draft, Dispatched, Completed, Cancelled)
- Real-time driver status counts
- Financial overview (total revenue, total costs, net profit)
- KPI metrics: Fleet Utilization %, Driver Availability %, Trip Completion Rate
- Dashboard filtering by region and vehicle type

### ✅ Layer 6 — License Compliance Alerts
- Lists drivers with licenses expiring within N days (configurable, default 30)
- Also surfaces already-expired licenses
- Accessible to Safety Officers

### ✅ Layer 6 — Top Performer Insights
- Top 5 most active drivers (by completed trips)
- Top 5 most used vehicles (by completed trips)
- Top 5 highest fuel cost vehicles

### ✅ Layer 6 — CSV Export
- Export trips (filter by status, date range, vehicle)
- Export vehicles (filter by status, region, type)
- Export fuel logs (filter by vehicle, date range)
- Pure string-based CSV generation — no external library dependency

---

## Mandatory Business Rules — Implementation Status

| Rule | Status | Location |
|---|---|---|
| Registration number must be unique | ✅ | `vehicle.service.js` |
| Retired/In Shop vehicles blocked from dispatch | ✅ | `trip.service.js` |
| Expired license blocks dispatch | ✅ | `trip.service.js` |
| Suspended driver blocks dispatch | ✅ | `trip.service.js` |
| On Trip driver/vehicle cannot be reassigned | ✅ | `availability.service.js` (FOR UPDATE) |
| Cargo ≤ max capacity | ✅ | `trip.service.js` |
| Dispatch sets vehicle + driver to On Trip | ✅ | `trip.service.js` → `availability.service.js` |
| Complete restores vehicle + driver to Available | ✅ | `trip.service.js` → `availability.service.js` |
| Cancel restores vehicle + driver to Available | ✅ | `trip.service.js` → `availability.service.js` |
| Maintenance scheduling sets vehicle to In Shop | ✅ | `maintenance.service.js` |
| Maintenance close restores vehicle to Available | ✅ | `maintenance.service.js` |
| One active maintenance per vehicle | ✅ | `maintenance.service.js` |

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│  Frontend (React 19 + Vite)       →  Vercel           │
│  Dashboard, Fleet, Drivers, Trips                     │
│  Maintenance, Fuel & Expenses                         │
│                                                       │
│  /api/* calls proxied via vercel.json → Render        │
└──────────────────────┬───────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼───────────────────────────────┐
│  Backend REST API (Express 5 + Node.js)   →  Render   │
│                                                       │
│  Layer 6 ── Analytics & CSV Reporting                 │
│  Layer 5 ── Finance (Fuel / Expenses / ROI)           │
│  Layer 4 ── Maintenance & Workshops                   │
│  Layer 3 ── Trip Operations (9 rules)                 │
│  Layer 2 ── Fleet Availability (FOR UPDATE lock)      │
│  Layer 1 ── Master Data (Vehicles / Drivers)          │
│  Layer 0 ── Foundation (Auth / JWT / Middleware)      │
└──────────────────────┬───────────────────────────────┘
                       │ pg pool
┌──────────────────────▼───────────────────────────────┐
│  PostgreSQL Database             →  Render Postgres   │
└──────────────────────────────────────────────────────┘
```

See individual layer docs for full implementation details:
- [Layer 0 — Foundation](./layer_0.md)
- [Layer 1 — Master Data](./layer_1.md)
- [Layer 2 — Fleet Availability](./layer_2.md)
- [Layer 3 — Operations](./layer_3.md)
- [Layer 4 — Maintenance](./layer_4.md)
- [Layer 5 — Finance](./layer_5.md)
- [Layer 6 — Analytics](./layer_6.md)

---

## Tech Stack

### Backend
| Technology | Role |
|---|---|
| Node.js | Runtime |
| Express 5 | REST API framework |
| PostgreSQL (raw `pg`) | Database — no ORM |
| JWT + bcrypt | Authentication |
| Zod | Request validation |
| Helmet, CORS, express-rate-limit | Security |
| compression | Response optimization |

### Frontend
| Technology | Role |
|---|---|
| React 19 | UI framework |
| Vite 8 | Build tool |
| React Router DOM v7 | Client-side routing |
| Axios | HTTP client |
| TailwindCSS 3 | Styling |
| Recharts | Data charts |
| Lucide React | Icons |

### Hosting
| Service | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | Render PostgreSQL |

---

## Bonus Features Implemented

- ✅ License expiry alerts (via `/api/analytics/expiring-licenses?days=30`)
- ✅ CSV export for trips, vehicles, fuel logs
- ✅ Dashboard filtering by region and vehicle type
- ✅ Top performer insights endpoint
- ✅ Rate limiting on authentication routes
- ✅ Odometer auto-update on trip completion
- ✅ `BaseRepository` pattern — eliminated ~900 lines of duplicate CRUD code
- ✅ Role-based UI — buttons hidden/disabled based on authenticated user's role
- ✅ Vercel `/api` proxy — no environment variable needed on frontend hosting
- ✅ Glassmorphic dark-mode UI design with micro-animations
