# TransitOps — Complete Technical Reference

> Smart Transport Operations Platform — API-only backend. No frontend.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Architecture — Layer Model](#3-architecture--layer-model)
4. [Folder Structure](#4-folder-structure)
5. [Code Connection Map](#5-code-connection-map)
6. [Database Schema](#6-database-schema)
7. [All API Endpoints](#7-all-api-endpoints)
8. [Business Rules](#8-business-rules)
9. [Roles & Permissions](#9-roles--permissions)
10. [Environment Setup](#10-environment-setup)

---

## 1. Project Overview

TransitOps manages the complete lifecycle of transport operations:

- Vehicle registration and status management
- Driver management with license compliance
- Trip dispatch with resource locking (no double-booking)
- Workshop and maintenance workflows
- Fuel, expense, and revenue tracking
- Financial ROI and efficiency analytics
- Real-time fleet dashboard with KPI aggregation
- CSV export for reporting

---

## 2. Tech Stack

| Component | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express 5 |
| Database | PostgreSQL (`pg` raw queries — no ORM) |
| Auth | JWT (jsonwebtoken) + bcrypt |
| Validation | Zod |
| Security | Helmet, CORS, express-rate-limit |
| Dev Server | nodemon |

**No ORM is used.** All queries are raw SQL for precise transactional control. Row-level locking (`SELECT ... FOR UPDATE`) prevents race conditions on resource allocation.

---

## 3. Architecture — Layer Model

The platform is organized as a **layered modular monolith**. Each layer depends only on layers below it.

```
┌─────────────────────────────────────────┐
│  Layer 6 — Analytics & Reporting        │  Read-only. Dashboard, KPIs, CSV exports, insights.
├─────────────────────────────────────────┤
│  Layer 5 — Financial Management         │  Fuel logs, expenses, revenues, ROI & efficiency engines.
├─────────────────────────────────────────┤
│  Layer 4 — Maintenance                  │  Workshops, maintenance records, In Shop lifecycle.
├─────────────────────────────────────────┤
│  Layer 3 — Operations (Trips)           │  Trip lifecycle, dispatch, completion, cancellation.
├─────────────────────────────────────────┤
│  Layer 2 — Fleet Availability           │  SELECT FOR UPDATE resource locking, status transitions.
├─────────────────────────────────────────┤
│  Layer 1 — Master Data                  │  Vehicles, Drivers, Regions, Vehicle Types, License Categories.
├─────────────────────────────────────────┤
│  Layer 0 — Foundation                   │  Express, PostgreSQL, JWT auth, error handling, logging.
└─────────────────────────────────────────┘
```

---

## 4. Folder Structure

The project has been restructured into a fullstack monorepo with separate `frontend` and `backend` workspaces.

```
TransitOps/
├── backend/                       # Node.js + Express API Backend
│   ├── scripts/                   # DB initialization scripts
│   ├── src/
│   │   ├── app.js                 # Express app — all routes registered here
│   │   ├── auth/                  # JWT authentication
│   │   ├── common/                # Shared utilities (BaseRepository, etc.)
│   │   ├── config/                # DB and env config
│   │   ├── middleware/            # Auth, validation, error handling
│   │   └── modules/               # Feature modules (regions, vehicles, trips, etc.)
│   └── package.json               # Backend dependencies
│
├── frontend/                      # React + Vite Frontend (Aurora UI)
│   ├── public/                    # Static assets
│   ├── src/
│   │   ├── App.jsx                # React app entry
│   │   ├── components/            # Reusable UI components
│   │   ├── pages/                 # Route pages (Dashboard, Fleet, Trips, etc.)
│   │   ├── context/               # React context (Auth)
│   │   └── index.css              # Tailwind entry
│   ├── tailwind.config.js         # Tailwind styling config
│   ├── vite.config.js             # Vite bundler config
│   └── package.json               # Frontend dependencies
│
├── docs/                          # Documentation
│   ├── README.md                  # ← This file
│   └── project_tracker.md         # Status of all layers
│
└── package.json                   # Root monorepo workspace config
```

Each backend module follows the same **MVC pattern**:
```
module/
├── *.routes.js       # Defines URL paths + middleware chain
├── *.controller.js   # Handles request/response (uses catchAsync)
├── *.service.js      # Business logic + workflow enforcement
├── *.repository.js   # SQL queries only (extends BaseRepository)
└── *.validator.js    # Zod schemas for request validation
```

---

## 5. Code Connection Map

### Request Lifecycle
```
HTTP Request
    ↓
app.js          (route registration)
    ↓
auth.middleware  (JWT verification)
    ↓
role.middleware  (RBAC check)
    ↓
validate.middleware (Zod schema validation)
    ↓
*.controller.js  (wrapped in catchAsync)
    ↓
*.service.js     (business rules enforced here)
    ↓
*.repository.js  (SQL via BaseRepository → pg Pool)
    ↓
PostgreSQL
```

### Key Cross-Module Dependencies

```
trip.service.js
    ├── imports vehicleRepo       (capacity check, status update)
    ├── imports driverRepo        (license expiry, suspension check)
    └── imports availabilityService (SELECT FOR UPDATE locking)

maintenance.service.js
    ├── imports vehicleRepo       (set status → In Shop / Available)
    └── imports maintenanceRepo

roi.engine.js
    ├── imports vehicleRepo       (acquisition_cost)
    ├── imports costEngine        (fuel + maintenance + expenses)
    └── queries revenues table

dashboard.service.js
    └── imports kpiEngine
            ├── queries vehicles
            ├── queries trips
            ├── queries drivers
            ├── queries fuel_logs
            ├── queries expenses
            ├── queries revenues
            └── queries maintenance_records
```

### Shared Utilities Map
```
common/base.repository.js  ← used by ALL 10+ repository files
common/catch-async.js      ← used by ALL 16 controller files
common/schemas.js          ← used by ALL validator files (idParam, pagination)
common/exceptions.js       ← used by ALL service files
common/constants.js        ← used by routes (ROLES) and services (VEHICLE_STATUS, etc.)
common/response.js         ← used by ALL controllers (sendSuccess, sendPaginatedSuccess)
```

---

## 6. Database Schema

> All tables include: `id SERIAL PRIMARY KEY`, `created_at TIMESTAMP`, `updated_at TIMESTAMP`, `is_deleted BOOLEAN DEFAULT false`

### Layer 0 — Foundation
```sql
users (id, email, password_hash, role, full_name)
```
`role` values: `Admin`, `Fleet Manager`, `Dispatcher`, `Safety Officer`, `Financial Analyst`

### Layer 1 — Master Data
```sql
regions (id, name, description)

vehicle_types (id, name, description, max_default_capacity)

license_categories (id, name, description)

vehicles (
  id, registration_number [UNIQUE], name, model,
  vehicle_type_id → vehicle_types,
  region_id → regions,
  max_capacity, odometer, acquisition_cost, purchase_date,
  status [Available | On Trip | In Shop | Retired],
  description
)

drivers (
  id, full_name, license_number [UNIQUE],
  license_category_id → license_categories,
  license_expiry_date, phone, email,
  safety_score [default 100],
  status [Available | On Trip | Off Duty | Suspended],
  address, joining_date
)
```

### Layer 3 — Operations
```sql
trips (
  id, trip_number [UNIQUE], source, destination,
  vehicle_id → vehicles, driver_id → drivers,
  cargo_weight, planned_distance, actual_distance,
  status [Draft | Dispatched | Completed | Cancelled],
  start_time, end_time, created_by → users
)
```

### Layer 4 — Maintenance
```sql
workshops (id, name, address, contact_number, manager, status)

maintenance_records (
  id, vehicle_id → vehicles, workshop_id → workshops,
  maintenance_type, description,
  status [Scheduled | In Progress | Completed | Cancelled],
  estimated_cost, actual_cost,
  scheduled_date, started_at, completed_at,
  created_by → users
)
```

### Layer 5 — Finance
```sql
fuel_logs (
  id, vehicle_id → vehicles, trip_id → trips, driver_id → drivers,
  fuel_station, quantity, price_per_liter, total_cost,
  odometer_reading, fuel_date, remarks, created_by → users
)

expenses (
  id, vehicle_id → vehicles, trip_id → trips,
  expense_type, amount, expense_date, description, created_by → users
)

revenues (
  id, trip_id → trips [COMPLETED ONLY], vehicle_id → vehicles,
  customer_name, amount,
  payment_status [Pending | Partial | Paid],
  invoice_number, received_date, created_by → users
)
```

---

## 7. All API Endpoints

Base URL: `http://localhost:<PORT>/api`

All endpoints except `/auth/login` and `/auth/register` require:
```
Authorization: Bearer <jwt_token>
```

---

### Authentication
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/login` | ❌ | Login with email + password |
| POST | `/auth/register` | ❌ | Register new user |
| GET | `/auth/me` | ✅ | Get current user profile |

Rate limited: 10 requests / 15 minutes per IP on `/auth`.

---

### Master Data — Regions
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/regions` | All | List all regions |
| GET | `/regions/:id` | All | Get region by ID |
| POST | `/regions` | Admin, Fleet Manager | Create region |
| PUT | `/regions/:id` | Admin, Fleet Manager | Update region |
| DELETE | `/regions/:id` | Admin, Fleet Manager | Soft-delete region |

---

### Master Data — Vehicle Types
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/vehicle-types` | All | List vehicle types |
| GET | `/vehicle-types/:id` | All | Get vehicle type |
| POST | `/vehicle-types` | Admin, Fleet Manager | Create |
| PUT | `/vehicle-types/:id` | Admin, Fleet Manager | Update |
| DELETE | `/vehicle-types/:id` | Admin, Fleet Manager | Delete |

---

### Master Data — License Categories
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/license-categories` | All | List license categories |
| GET | `/license-categories/:id` | All | Get by ID |
| POST | `/license-categories` | Admin | Create |
| PUT | `/license-categories/:id` | Admin | Update |
| DELETE | `/license-categories/:id` | Admin | Delete |

---

### Master Data — Vehicles
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/vehicles?status=Available&region_id=1&vehicle_type_id=2` | All | List with filters |
| GET | `/vehicles/:id` | All | Get vehicle |
| POST | `/vehicles` | Admin, Fleet Manager | Register vehicle |
| PUT | `/vehicles/:id` | Admin, Fleet Manager | Update vehicle |
| DELETE | `/vehicles/:id` | Admin, Fleet Manager | Soft-delete |

---

### Master Data — Drivers
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/drivers?status=Available&license_category_id=1` | All | List with filters |
| GET | `/drivers/:id` | All | Get driver |
| POST | `/drivers` | Admin, Fleet Manager | Register driver |
| PUT | `/drivers/:id` | Admin, Fleet Manager | Update driver |
| DELETE | `/drivers/:id` | Admin | Delete |

---

### Fleet Availability (Layer 2)
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/fleet/status` | ✅ | Fleet statistics summary |
| GET | `/fleet/available-vehicles?region_id=1` | ✅ | Get available vehicles |
| GET | `/fleet/available-drivers?license_category_id=1` | ✅ | Get available drivers |
| POST | `/fleet/reserve-vehicle/:id` | ✅ | Lock vehicle (FOR UPDATE) |
| POST | `/fleet/release-vehicle/:id` | ✅ | Release vehicle lock |
| POST | `/fleet/reserve-driver/:id` | ✅ | Lock driver |
| POST | `/fleet/release-driver/:id` | ✅ | Release driver |
| PUT | `/fleet/vehicle-status/:id` | ✅ | Change vehicle status |
| PUT | `/fleet/driver-status/:id` | ✅ | Change driver status |

---

### Trips (Layer 3)
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/trips?status=Dispatched&vehicle_id=1` | All | List trips |
| GET | `/trips/:id` | All | Get trip |
| POST | `/trips` | Admin, Fleet Manager, Dispatcher | Create trip (Draft) |
| POST | `/trips/:id/dispatch` | Admin, Fleet Manager, Dispatcher | Dispatch trip → assigns vehicle + driver |
| POST | `/trips/:id/complete` | Admin, Fleet Manager, Dispatcher | Complete trip → releases resources + updates odometer |
| POST | `/trips/:id/cancel` | Admin, Fleet Manager, Dispatcher | Cancel trip → releases resources |

**Dispatch request body:**
```json
{ "vehicle_id": 1, "driver_id": 2 }
```
**Complete request body:**
```json
{ "actual_distance": 450.5 }
```

---

### Workshops (Layer 4)
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/workshops` | All | List workshops |
| GET | `/workshops/:id` | All | Get workshop |
| POST | `/workshops` | Admin, Fleet Manager | Create |
| PUT | `/workshops/:id` | Admin, Fleet Manager | Update |
| DELETE | `/workshops/:id` | Admin, Fleet Manager | Delete |

---

### Maintenance Records (Layer 4)
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/maintenance?status=In Progress&vehicle_id=1` | All | List records |
| GET | `/maintenance/:id` | All | Get record |
| POST | `/maintenance` | Admin, Fleet Manager | Schedule maintenance → sets vehicle to **In Shop** |
| POST | `/maintenance/:id/start` | Admin, Fleet Manager | Start maintenance |
| POST | `/maintenance/:id/complete` | Admin, Fleet Manager | Complete → restores vehicle to **Available** |
| POST | `/maintenance/:id/cancel` | Admin, Fleet Manager | Cancel → restores vehicle to **Available** |

---

### Fuel Logs (Layer 5)
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/fuel?vehicle_id=1&trip_id=2` | All | List fuel logs |
| GET | `/fuel/:id` | All | Get fuel log |
| POST | `/fuel` | Admin, Fleet Manager, Dispatcher | Log fuel entry (auto-computes `total_cost`) |
| PUT | `/fuel/:id` | Admin, Fleet Manager, Dispatcher | Update log |
| DELETE | `/fuel/:id` | Admin, Fleet Manager, Dispatcher | Soft-delete |

---

### Expenses (Layer 5)
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/expenses?vehicle_id=1&expense_type=Toll` | All | List |
| GET | `/expenses/:id` | All | Get |
| POST | `/expenses` | Admin, Fleet Manager, Dispatcher | Create expense |
| PUT | `/expenses/:id` | Admin, Fleet Manager, Dispatcher | Update |
| DELETE | `/expenses/:id` | Admin, Fleet Manager, Dispatcher | Delete |

---

### Revenues (Layer 5)
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/revenues?payment_status=Pending` | All | List revenues |
| GET | `/revenues/:id` | All | Get |
| POST | `/revenues` | Admin, Fleet Manager | Record revenue (**trip must be Completed**) |
| PUT | `/revenues/:id` | Admin, Fleet Manager | Update |
| DELETE | `/revenues/:id` | Admin, Fleet Manager | Delete |

---

### Finance Calculators (Layer 5)
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/finance/summary` | Admin, Fleet Manager | Global financial summary |
| GET | `/finance/vehicle/:id` | Admin, Fleet Manager | Per-vehicle ROI, costs, efficiency |
| GET | `/finance/trip/:id` | Admin, Fleet Manager | Per-trip revenue vs. costs |

**Sample `/finance/vehicle/:id` response:**
```json
{
  "vehicleId": 3,
  "financials": {
    "revenue": 12000,
    "costs": { "fuelCost": 3200, "maintenanceCost": 1500, "expenses": 400, "totalCost": 5100 },
    "netProfit": 6900,
    "acquisitionCost": 50000,
    "roiPercentage": 13.80
  },
  "performance": {
    "totalDistance": 4800,
    "totalFuel": 360,
    "efficiency": 13.33
  }
}
```

---

### Analytics Dashboard (Layer 6)
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/analytics/dashboard?region_id=1&vehicle_type_id=2` | Admin, Fleet Manager, Safety Officer | Real-time fleet + financial dashboard |
| GET | `/analytics/expiring-licenses?days=30` | Admin, Fleet Manager, Safety Officer | Drivers with licenses expiring soon + already expired |
| GET | `/analytics/insights` | Admin, Fleet Manager, Safety Officer | Top performers: most active drivers, vehicles, highest fuel cost |

**Sample `/analytics/dashboard` response:**
```json
{
  "vehicles": { "total": 25, "available": 18, "onTrip": 5, "inShop": 2, "retired": 0 },
  "trips": { "total": 340, "draft": 3, "active": 5, "completed": 320, "cancelled": 12 },
  "drivers": { "total": 30, "available": 22, "onTrip": 5, "suspended": 1, "offDuty": 2 },
  "financials": { "revenue": 150000, "totalCost": 95000, "profit": 55000 },
  "kpis": {
    "fleetUtilizationPercentage": 20.0,
    "vehicleAvailabilityPercentage": 72.0,
    "tripCompletionRate": 94.1
  }
}
```

---

### Reports — CSV Exports (Layer 6)
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/reports/trips/export?status=Completed&from_date=2024-01-01&to_date=2024-12-31` | Admin, Fleet Manager, Financial Analyst | Download trips CSV |
| GET | `/reports/vehicles/export?status=Available&region_id=1` | Admin, Fleet Manager, Financial Analyst | Download vehicles CSV |
| GET | `/reports/fuel/export?vehicle_id=1&from_date=2024-01-01` | Admin, Fleet Manager, Financial Analyst | Download fuel logs CSV |

Response: `Content-Type: text/csv` with `Content-Disposition: attachment`.

---

### Health Check
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/health` | ❌ | Returns server + DB status |

---

## 8. Business Rules

### Dispatch Rules (enforced in `trip.service.js`)
| Rule | What happens if violated |
|---|---|
| Vehicle status must be `Available` | 400 — Cannot dispatch |
| Vehicle cannot be `Retired` | 400 — Cannot dispatch a Retired vehicle |
| Vehicle cannot be `In Shop` | 400 — Under maintenance |
| Cargo weight ≤ vehicle max capacity | 400 — Exceeds capacity |
| Driver license must not be expired | 400 — License expired on [date] |
| Driver cannot be `Suspended` | 400 — Driver is suspended |
| Driver must be `Available` | 400 — Current status is [X] |

### Race Condition Prevention (Layer 2 — `availability.service.js`)
Both vehicle and driver are locked with `SELECT ... FOR UPDATE` inside a transaction before dispatch. If driver reservation fails, the vehicle is automatically released (rollback).

### Status Transitions
```
Vehicle:
  Available → Reserved → On Trip → Available
  Available → In Shop  (maintenance scheduled)
  In Shop   → Available (maintenance completed/cancelled)
  Any       → Retired  (manual admin action)

Driver:
  Available → Reserved → On Trip → Available
  Any       → Suspended / Off Duty (manual admin action)

Trip:
  Draft → Dispatched → Completed
  Draft → Cancelled
  Dispatched → Cancelled (releases vehicle + driver)

Maintenance:
  Scheduled → In Progress → Completed
  Scheduled → Cancelled
  In Progress → Cancelled
```

### Financial Rules
- Revenue can only be recorded against **Completed** trips
- Fuel `total_cost` is auto-computed as `quantity × price_per_liter`
- ROI = `(Revenue - (Fuel + Maintenance + Expenses)) / Acquisition Cost × 100`
- Fuel Efficiency = `Total Distance (from Completed trips) / Total Fuel Consumed (from fuel_logs)`
- Odometer is automatically incremented by `actual_distance` when a trip completes

---

## 9. Roles & Permissions

| Role | Capabilities |
|---|---|
| `Admin` | Full access to everything |
| `Fleet Manager` | Vehicles, drivers, trips, maintenance, finance, analytics |
| `Dispatcher` | Create + dispatch + complete + cancel trips, log fuel & expenses |
| `Safety Officer` | Read-only access + license expiry alerts |
| `Financial Analyst` | Finance module read + CSV exports |

---

## 10. Environment Setup

### `.env` file
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/TransitOps
JWT_SECRET=your_jwt_secret_here
PORT=3000
NODE_ENV=development
```

### First-Time Setup

```bash
# 1. Install dependencies
npm install

# 2. Create DB tables (run in order)
node scripts/init-db.js
node scripts/init-layer1-db.js
node scripts/init-layer3-db.js
node scripts/init-layer4-db.js
node scripts/init-layer5-db.js

# 3. Start dev server
npm run dev

# 4. Health check
curl http://localhost:3000/health
```

### Run in Production
```bash
npm start
```
