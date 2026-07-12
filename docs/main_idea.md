# TransitOps — Smart Transport Operations Platform

> **Type:** Fullstack Monorepo (React Frontend + Node.js/Express Backend)
> **Purpose:** Digitize the complete lifecycle of transport operations

---

## Problem Statement

Many logistics companies still rely on spreadsheets and manual logbooks to manage transport operations. This leads to:

- Scheduling conflicts (same vehicle/driver double-booked)
- Underutilized vehicles
- Missed maintenance windows
- Expired driver licenses going unnoticed
- Inaccurate expense tracking
- Poor operational visibility

---

## Solution: TransitOps

TransitOps is a centralized REST API platform that manages the complete lifecycle of transport operations — from vehicle registration and driver management to dispatching, maintenance, fuel logging, and analytics.

---

## Target Users

| Role | What they do |
|---|---|
| **Admin** | Full platform access. User management. System configuration. |
| **Fleet Manager** | Oversees fleet assets, maintenance, vehicle lifecycle, operational efficiency. |
| **Dispatcher** | Creates trips, assigns vehicles and drivers, monitors active deliveries. |
| **Safety Officer** | Ensures driver compliance, tracks license validity, monitors safety scores. |
| **Financial Analyst** | Reviews operational expenses, fuel consumption, maintenance costs, profitability. |

---

## Implemented Features

### ✅ Authentication & Authorization (Layer 0)
- Secure login with email + password (bcrypt hashed)
- JWT-based stateless authentication
- Role-Based Access Control (RBAC) — 5 roles, enforced on every endpoint
- Rate limiting: 10 login attempts per 15 minutes per IP

### ✅ Vehicle Registry (Layer 1)
- Registration with unique Registration Number
- Fields: Name, Model, Type, Max Capacity, Odometer, Acquisition Cost, Status, Region
- Status values: `Available`, `On Trip`, `In Shop`, `Retired`
- Filtering by status, region, vehicle type

### ✅ Driver Management (Layer 1)
- Driver profiles with license tracking
- Fields: Name, License Number, Category, Expiry Date, Phone, Email, Safety Score, Status
- Status values: `Available`, `On Trip`, `Off Duty`, `Suspended`
- License expiry date stored and validated at dispatch time

### ✅ Fleet Availability (Layer 2)
- Real-time status tracking for vehicles and drivers
- Race condition prevention: `SELECT ... FOR UPDATE` row-level locking
- Prevents double-booking of the same vehicle or driver
- Automatic rollback if partial reservation fails

### ✅ Trip Management (Layer 3)
- Trip lifecycle: `Draft` → `Dispatched` → `Completed` / `Cancelled`
- 9 mandatory business rules enforced at dispatch:
  1. Vehicle must be `Available`
  2. Vehicle cannot be `Retired`
  3. Vehicle cannot be `In Shop`
  4. Cargo weight ≤ vehicle max capacity
  5. Driver must be `Available`
  6. Driver cannot be `Suspended`
  7. Driver license must not be expired
  8. No double-booking (FOR UPDATE lock)
  9. Resources released on cancel/complete
- Odometer auto-incremented on trip completion

### ✅ Maintenance (Layer 4)
- Workshop management (name, address, contact, manager)
- Maintenance records with full lifecycle: `Scheduled` → `In Progress` → `Completed`
- Scheduling maintenance automatically sets vehicle to `In Shop`
- Completing/cancelling maintenance restores vehicle to `Available`
- Prevents dispatch of vehicles under maintenance

### ✅ Fuel & Expense Management (Layer 5)
- Fuel logs: station, quantity, price_per_liter → `total_cost` auto-computed
- Expense logs: type (Toll, Parking, Fine, Repair), amount, date
- Revenue recording: linked to Completed trips, payment status tracking

### ✅ Financial Analytics (Layer 5)
- Cost Engine: fuel + maintenance + expenses per vehicle
- ROI Engine: `(Revenue - Total Cost) / Acquisition Cost × 100`
- Efficiency Engine: `Total Distance / Total Fuel` (km/liter)
- Per-vehicle and per-trip financial summaries

### ✅ Dashboard & KPIs (Layer 6)
- Real-time fleet counts (available, on trip, in shop, retired)
- Real-time trip counts (draft, active, completed, cancelled)
- Real-time driver counts (available, on trip, suspended, off duty)
- Financial overview (revenue, costs, profit)
- KPIs: Fleet Utilization %, Availability %, Trip Completion Rate
- Filter dashboard by region and vehicle type

### ✅ License Compliance Alerts (Layer 6)
- Endpoint to list drivers with licenses expiring within N days (default 30)
- Endpoint also returns already-expired licenses
- Accessible to Safety Officers

### ✅ Top Performer Insights (Layer 6)
- Top 5 most active drivers (by completed trips)
- Top 5 most used vehicles (by completed trips)
- Top 5 highest fuel cost vehicles

### ✅ CSV Export (Layer 6)
- Export trips as CSV (with filters: status, date range, vehicle)
- Export vehicles as CSV (with filters: status, region, type)
- Export fuel logs as CSV (with filters: vehicle, date range)
- No external library — pure string building

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

---

## Architecture

The platform is built as a **7-layer modular monolith**:

```
Layer 6 — Analytics & CSV Reporting     (read-only)
Layer 5 — Finance (Fuel/Expenses/ROI)
Layer 4 — Maintenance & Workshops
Layer 3 — Trip Operations
Layer 2 — Fleet Availability (FOR UPDATE locking)
Layer 1 — Master Data (Vehicles/Drivers/Regions)
Layer 0 — Foundation (Express/JWT/PostgreSQL/Middleware)
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

| | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express 5 |
| Database | PostgreSQL (raw `pg` queries) |
| Auth | JWT + bcrypt |
| Validation | Zod |
| Security | Helmet, CORS, express-rate-limit |

---

## Bonus Features Implemented

- ✅ License expiry alerts (via `/api/analytics/expiring-licenses`)
- ✅ CSV export for trips, vehicles, fuel logs
- ✅ Dashboard filtering by region and vehicle type
- ✅ Top performer insights endpoint
- ✅ Rate limiting on authentication routes
- ✅ Odometer auto-update on trip completion
