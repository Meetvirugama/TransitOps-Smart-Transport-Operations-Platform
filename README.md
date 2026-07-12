# 🚌 TransitOps — Smart Transport Operations Platform

<div align="center">

![TransitOps Banner](https://img.shields.io/badge/TransitOps-Smart%20Transport%20Ops-4ff7d1?style=for-the-badge&logo=bus&logoColor=black)

[![Live Frontend](https://img.shields.io/badge/Frontend-Vercel%20Live-000000?style=for-the-badge&logo=vercel)](https://transit-ops-smart-transport-operati.vercel.app)
[![Live Backend](https://img.shields.io/badge/Backend-Render%20Live-46E3B7?style=for-the-badge&logo=render)](https://transitops-smart-transport-operations.onrender.com/health)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://render.com)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express%205-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/Frontend-React%2019-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)

> **A full-stack enterprise-grade platform to digitize the complete lifecycle of transport fleet operations** — from vehicle registration and driver management to trip dispatch, maintenance scheduling, fuel logging, and financial analytics.

</div>

---

## 🔗 Live Deployment

| Service | URL | Platform |
|---|---|---|
| **Frontend** | https://transit-ops-smart-transport-operati.vercel.app | Vercel |
| **Backend API** | https://transitops-smart-transport-operations.onrender.com | Render |
| **Database** | Hosted PostgreSQL | Render Postgres |
| **Health Check** | https://transitops-smart-transport-operations.onrender.com/health | — |

---

## 🧩 Problem Statement

Many logistics companies still rely on spreadsheets and manual logbooks to manage fleet operations. This leads to:

- 📋 **Scheduling conflicts** — same vehicle or driver accidentally double-booked
- 🚗 **Underutilized assets** — vehicles sitting idle with no visibility
- 🔧 **Missed maintenance windows** — vehicles breaking down in the field
- 📄 **Expired driver licenses** going unnoticed until it's too late
- 💸 **Inaccurate expense tracking** — no central record of fuel and costs
- 📊 **Zero operational visibility** — no dashboards, no alerts, no reports

**TransitOps solves all of this** with a centralized, role-secured, real-time operations platform.

---

## 📐 Architecture

TransitOps is built as a **7-layer modular monolith** with a fully decoupled frontend:

```
┌─────────────────────────────────────────────────┐
│  Frontend (React 19 + Vite)   →  Vercel          │
│  Dashboard, Fleet, Trips, Maintenance, Finance   │
└───────────────────┬─────────────────────────────┘
                    │ HTTPS /api/* → Vercel Proxy
┌───────────────────▼─────────────────────────────┐
│  Backend REST API (Express 5 + Node.js)          │
│  Hosted on Render                                │
│                                                  │
│  Layer 6 ── Analytics & CSV Reporting            │
│  Layer 5 ── Finance (Fuel / Expenses / ROI)      │
│  Layer 4 ── Maintenance & Workshops              │
│  Layer 3 ── Trip Operations                      │
│  Layer 2 ── Fleet Availability (FOR UPDATE lock) │
│  Layer 1 ── Master Data (Vehicles / Drivers)     │
│  Layer 0 ── Foundation (Auth / JWT / Middleware) │
└───────────────────┬─────────────────────────────┘
                    │ pg pool
┌───────────────────▼─────────────────────────────┐
│  PostgreSQL Database                             │
│  Hosted on Render Postgres                       │
└─────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Node.js** | Runtime environment |
| **Express 5** | REST API framework |
| **PostgreSQL** | Relational database (raw `pg` queries — no ORM) |
| **JWT (jsonwebtoken)** | Stateless authentication tokens |
| **bcrypt** | Password hashing |
| **Zod** | Schema-based request validation |
| **Helmet** | HTTP security headers |
| **CORS** | Cross-origin request handling |
| **express-rate-limit** | Auth route rate limiting |
| **compression** | Gzip compression for responses |
| **nodemon** | Dev hot-reload |

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **Vite 8** | Build tool & dev server |
| **React Router DOM v7** | Client-side routing |
| **Axios** | HTTP client for API calls |
| **Recharts** | Data visualization (charts) |
| **Lucide React** | Icon library |
| **TailwindCSS 3** | Utility-first CSS framework |
| **PostCSS / Autoprefixer** | CSS processing |

### DevOps & Tooling
| Tool | Purpose |
|---|---|
| **Vercel** | Frontend hosting with `/api` proxy |
| **Render** | Backend & PostgreSQL hosting |
| **GitHub** | Source control & CI/CD trigger |
| **oxlint** | JavaScript linter |

---

## 📁 Folder Structure

```
TransitOps-Smart-Transport-Operations-Platform/
│
├── 📄 README.md                        # This file
├── 📄 package.json                     # Root workspace config
├── 📄 .gitignore
│
├── 📁 backend/                         # Node.js + Express REST API
│   ├── 📄 package.json
│   ├── 📄 .env                         # Environment variables (not committed)
│   │
│   ├── 📁 scripts/                     # One-time database setup scripts
│   │   ├── 📄 init-db.js               # Base schema creation
│   │   ├── 📄 init-layer1-db.js        # Layer 1 tables (vehicles, drivers)
│   │   ├── 📄 init-layer3-db.js        # Layer 3 tables (trips)
│   │   ├── 📄 init-layer4-db.js        # Layer 4 tables (maintenance, workshops)
│   │   ├── 📄 init-layer5-db.js        # Layer 5 tables (fuel, expenses, revenue)
│   │   ├── 📄 seed-dummy-data.js       # Seed realistic operational data
│   │   └── 📄 seed-users.js            # Seed role-based user accounts
│   │
│   └── 📁 src/
│       ├── 📄 app.js                   # Express app entry, routes registration
│       │
│       ├── 📁 config/
│       │   ├── 📄 database.js          # PostgreSQL connection pool
│       │   └── 📄 env.js               # Environment variable loader
│       │
│       ├── 📁 auth/                    # Authentication module
│       │   ├── 📄 auth.routes.js
│       │   ├── 📄 auth.controller.js
│       │   ├── 📄 auth.service.js
│       │   ├── 📄 auth.repository.js
│       │   └── 📄 jwt.js               # Token sign/verify helpers
│       │
│       ├── 📁 middleware/
│       │   ├── 📄 auth.middleware.js   # JWT verification on all protected routes
│       │   ├── 📄 role.middleware.js   # RBAC — restrict by role array
│       │   ├── 📄 validate.middleware.js # Zod schema validation
│       │   ├── 📄 error.middleware.js  # Global error handler
│       │   └── 📄 logger.middleware.js # Request/response logger
│       │
│       ├── 📁 common/                  # Shared utilities
│       │   ├── 📄 base.repository.js   # Generic CRUD base class for all repos
│       │   ├── 📄 catch-async.js       # Async controller wrapper
│       │   ├── 📄 constants.js         # ROLES, VEHICLE_STATUS, TRIP_STATUS
│       │   ├── 📄 exceptions.js        # AppError, NotFoundError classes
│       │   ├── 📄 logger.js            # Winston/console logger
│       │   ├── 📄 response.js          # sendSuccess, sendPaginatedSuccess
│       │   └── 📄 schemas.js           # Shared Zod schemas (idParam, pagination)
│       │
│       └── 📁 modules/                 # Feature modules
│           │
│           ├── 📁 regions/             # Geographic regions
│           ├── 📁 vehicle-types/       # Vehicle type master data
│           ├── 📁 license-categories/  # Driver license categories
│           │
│           ├── 📁 vehicles/            # Vehicle registry
│           │   ├── 📄 vehicle.routes.js
│           │   ├── 📄 vehicle.controller.js
│           │   ├── 📄 vehicle.service.js
│           │   ├── 📄 vehicle.repository.js
│           │   └── 📄 vehicle.validator.js
│           │
│           ├── 📁 drivers/             # Driver management
│           │   └── [same structure as vehicles/]
│           │
│           ├── 📁 profiles/            # User profile management
│           │
│           ├── 📁 fleet/
│           │   └── 📁 availability/    # Fleet availability & FOR UPDATE locking
│           │
│           ├── 📁 operations/
│           │   └── 📁 trips/           # Trip lifecycle management
│           │
│           ├── 📁 maintenance/
│           │   ├── 📁 records/         # Maintenance record CRUD + workflow
│           │   └── 📁 workshops/       # Workshop CRUD
│           │
│           ├── 📁 finance/
│           │   ├── 📁 fuel/            # Fuel log CRUD
│           │   ├── 📁 expenses/        # Expense log CRUD
│           │   ├── 📁 revenue/         # Revenue (linked to trips)
│           │   └── 📁 calculator/      # Cost/ROI/Efficiency engines
│           │
│           └── 📁 analytics/
│               ├── 📁 dashboard/       # KPIs, insights, license alerts
│               └── 📁 exports/         # CSV report generation
│
│
├── 📁 frontend/                        # React 19 + Vite SPA
│   ├── 📄 package.json
│   ├── 📄 vite.config.js               # Dev proxy to localhost:3000
│   ├── 📄 vercel.json                  # Production /api/* proxy to Render
│   ├── 📄 tailwind.config.js
│   ├── 📄 index.html
│   │
│   └── 📁 src/
│       ├── 📄 main.jsx                 # React app bootstrap
│       ├── 📄 App.jsx                  # Router & protected route definitions
│       ├── 📄 index.css                # Global glassmorphic dark-mode design tokens
│       │
│       ├── 📁 config/
│       │   └── 📄 api.js               # Axios instance with JWT interceptor
│       │
│       ├── 📁 context/
│       │   └── 📄 AuthContext.jsx      # Global auth state (user, token, login/logout)
│       │
│       ├── 📁 components/
│       │   ├── 📄 Header.jsx           # Top navbar with role badge and search
│       │   ├── 📄 Modal.jsx            # Reusable modal overlay component
│       │   └── 📄 Sidebar.jsx          # Side navigation with route links
│       │
│       └── 📁 pages/
│           ├── 📄 Login.jsx            # Animated login page with demo credentials
│           ├── 📄 Dashboard.jsx        # KPI cards, fleet status, recent trips
│           ├── 📄 Fleet.jsx            # Vehicle registry table with add/edit/delete
│           ├── 📄 Drivers.jsx          # Driver management table
│           ├── 📄 Trips.jsx            # Trip dispatch with stepper workflow
│           ├── 📄 Maintenance.jsx      # Maintenance scheduling and status
│           └── 📄 FuelExpenses.jsx     # Fuel logs and expense records (tabbed)
│
│
└── 📁 docs/                            # Project documentation
    ├── 📄 README.md                    # Docs index
    ├── 📄 main_idea.md                 # Feature overview and architecture
    ├── 📄 project_tracker.md           # Layer-by-layer completion tracker
    ├── 📄 layer_0.md                   # Foundation layer deep-dive
    ├── 📄 layer_1.md                   # Master data layer
    ├── 📄 layer_2.md                   # Fleet availability layer
    ├── 📄 layer_3.md                   # Operations/trips layer
    ├── 📄 layer_4.md                   # Maintenance layer
    ├── 📄 layer_5.md                   # Finance layer
    └── 📄 layer_6.md                   # Analytics & reports layer
```

---

## 👥 Role-Based Access Control (RBAC)

The platform enforces **5 distinct user roles** at both the API and UI level:

| Role | Description | Key Permissions |
|---|---|---|
| 🔴 **Admin** | Full platform access | All CRUD, user management, all reports |
| 🟠 **Fleet Manager** | Manages all fleet assets | Add/edit vehicles & drivers, schedule maintenance, view finance |
| 🟡 **Dispatcher** | Manages daily operations | Create & dispatch trips, log fuel, record expenses |
| 🟢 **Safety Officer** | Ensures compliance | View drivers & vehicles, access license alerts (read-only) |
| 🔵 **Financial Analyst** | Reviews financial data | View all finance, expense & fuel reports (read-only) |

### UI Permission Matrix

| Feature | Admin | Fleet Manager | Dispatcher | Safety Officer | Financial Analyst |
|---|:---:|:---:|:---:|:---:|:---:|
| View Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Add/Edit/Delete Vehicles | ✅ | ✅ | — | — | — |
| Add/Edit/Delete Drivers | ✅ | ✅ | — | — | — |
| Create/Dispatch Trips | ✅ | ✅ | ✅ | — | — |
| Complete/Cancel Trips | ✅ | ✅ | ✅ | — | — |
| Schedule Maintenance | ✅ | ✅ | — | — | — |
| Start/Complete Maintenance | ✅ | ✅ | — | — | — |
| Add Fuel Logs | ✅ | ✅ | ✅ | — | — |
| Add Expenses | ✅ | ✅ | ✅ | — | — |
| View All Data | ✅ | ✅ | ✅ | ✅ | ✅ |

### Demo User Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@transitops.in` | `admin123` |
| Fleet Manager | `manager@transitops.in` | `manager123` |
| Dispatcher | `dispatcher@transitops.in` | `dispatcher123` |
| Safety Officer | `safety@transitops.in` | `safety123` |
| Financial Analyst | `finance@transitops.in` | `finance123` |

---

## ✨ Feature Breakdown

### 1. 🔐 Authentication & Authorization
- Email + password login (bcrypt hashed passwords)
- JWT access tokens (stateless, no sessions)
- Token stored in `localStorage` with auto-logout on 401
- Rate limiting: **10 login attempts per 15 minutes** per IP
- All non-login routes require a valid Bearer token

### 2. 🚛 Vehicle Registry
- Full CRUD with soft-delete (`is_deleted` flag)
- Unique registration number enforced
- Fields: Registration Number, Name, Model, Vehicle Type, Max Capacity, Odometer, Acquisition Cost, Status, Region
- Status lifecycle: `Available` → `On Trip` / `In Shop` → `Available` → `Retired`
- Filter by status, region, vehicle type

### 3. 👨‍✈️ Driver Management
- Driver profiles with license tracking
- Fields: Full Name, License Number, License Category, Expiry Date, Phone, Email, Safety Score, Status
- Status lifecycle: `Available` → `On Trip` / `Off Duty` / `Suspended`
- Filter by status and license category

### 4. 🔄 Fleet Availability Engine
- Real-time vehicle and driver availability tracking
- **Race condition prevention** using PostgreSQL `SELECT ... FOR UPDATE` row-level locking
- Prevents double-booking the same vehicle or driver across concurrent requests
- Automatic transactional rollback if reservation partially fails

### 5. 📦 Trip Management (9 Business Rules)
Full trip lifecycle: `Draft` → `Dispatched` → `Completed` / `Cancelled`

All 9 dispatch rules enforced atomically:
1. Vehicle must be `Available`
2. Vehicle must not be `Retired`
3. Vehicle must not be `In Shop`
4. Cargo weight must not exceed vehicle max capacity
5. Driver must be `Available`
6. Driver must not be `Suspended`
7. Driver license must not be expired
8. Vehicle/driver cannot be double-booked (FOR UPDATE lock)
9. Resources automatically released on cancel or complete

Odometer auto-incremented by `planned_distance` on trip completion.

### 6. 🔧 Maintenance Management
- Workshop CRUD (name, address, contact, manager)
- Maintenance record lifecycle: `Scheduled` → `In Progress` → `Completed` / `Cancelled`
- Scheduling maintenance **automatically sets vehicle to `In Shop`**
- Completing or cancelling maintenance **automatically restores vehicle to `Available`**
- Prevents dispatch of vehicles currently under maintenance
- One active maintenance per vehicle at a time enforced

### 7. ⛽ Fuel & Expense Tracking
- **Fuel Logs**: Station name, quantity (liters), price per liter → `total_cost` auto-computed
- **Expenses**: Ad-hoc costs categorized as Tolls, Parking, Fines, Repair, etc.
- **Revenue**: Revenue entries linked to completed trips with payment status

### 8. 💰 Financial Analytics Engine
Three calculation engines accessible via `/api/finance`:
- **Cost Engine**: Fuel + Maintenance + Expenses per vehicle
- **ROI Engine**: `(Revenue - Total Cost) / Acquisition Cost × 100`
- **Efficiency Engine**: `Total Distance / Total Fuel` (km/liter)

### 9. 📊 Dashboard & KPIs
- Real-time fleet status counts (Available, On Trip, In Shop, Retired)
- Real-time trip counts (Draft, Active, Completed, Cancelled)
- Real-time driver status counts
- Financial overview (total revenue, costs, profit)
- KPIs: Fleet Utilization %, Driver Availability %, Trip Completion Rate
- Filter by region and vehicle type

### 10. 🚨 License Compliance Alerts
- Endpoint listing drivers with licenses expiring within N days (default: 30)
- Also surfaces already-expired licenses
- Accessible to Safety Officers

### 11. 📈 Top Performer Insights
- Top 5 most active drivers (by completed trips)
- Top 5 most used vehicles (by completed trips)
- Top 5 highest fuel cost vehicles

### 12. 📥 CSV Export
- Export **trips** (filter by status, date range, vehicle)
- Export **vehicles** (filter by status, region, type)
- Export **fuel logs** (filter by vehicle, date range)
### 13. 🤖 Dual-AI Intelligence
- **Operations Brief (Groq + Gemini)**: High-speed LLaMA 3.3 via Groq performs JSON-structured risk analysis on fleet data, which is then fed into Gemini 2.5 Flash to generate a natural language narrative and actionable dispatch items.
- **Maintenance Insights**: Gemini analyzes vehicle maintenance history to provide targeted recommendations for vehicles needing attention.
- **AI Chatbot**: A floating conversational assistant powered by Gemini that understands live fleet context and answers natural language questions about your operations.
- **Key Rotation**: Built-in array-based API key rotation for Groq to gracefully handle rate limits (429s).

---

## 📡 API Reference

**Base URL:** `https://transitops-smart-transport-operations.onrender.com`

All endpoints (except `/api/auth/login` and `/health`) require:
```
Authorization: Bearer <your_jwt_token>
```

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Login with email + password |
| `POST` | `/api/auth/register` | Register a new user |
| `GET` | `/api/auth/me` | Get current logged-in user |

### AI Intelligence
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/ai/chat` | Chat with the fleet AI assistant |
| `GET` | `/api/ai/operations-brief` | Get Groq risk analysis + Gemini narrative |
| `GET` | `/api/ai/maintenance-insights` | Get AI maintenance recommendations |

### Vehicles
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/vehicles` | List all vehicles (paginated + filterable) |
| `GET` | `/api/vehicles/:id` | Get single vehicle |
| `POST` | `/api/vehicles` | Create vehicle (Admin, Fleet Manager) |
| `PUT` | `/api/vehicles/:id` | Update vehicle (Admin, Fleet Manager) |
| `DELETE` | `/api/vehicles/:id` | Soft-delete vehicle (Admin only) |

### Drivers
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/drivers` | List all drivers (paginated + filterable) |
| `GET` | `/api/drivers/:id` | Get single driver |
| `POST` | `/api/drivers` | Create driver (Admin, Fleet Manager) |
| `PUT` | `/api/drivers/:id` | Update driver |
| `DELETE` | `/api/drivers/:id` | Soft-delete driver (Admin only) |

### Fleet Availability
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/fleet/vehicles/available` | Available vehicles |
| `GET` | `/api/fleet/drivers/available` | Available drivers |
| `GET` | `/api/fleet/stats` | Fleet statistics summary |
| `PATCH` | `/api/fleet/vehicles/:id/status` | Manually set vehicle status |
| `PATCH` | `/api/fleet/drivers/:id/status` | Manually set driver status |

### Trips
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/trips` | List all trips (paginated + filterable) |
| `GET` | `/api/trips/:id` | Get single trip |
| `POST` | `/api/trips` | Create trip draft |
| `POST` | `/api/trips/:id/dispatch` | Dispatch trip (enforces 9 rules) |
| `POST` | `/api/trips/:id/complete` | Complete trip |
| `POST` | `/api/trips/:id/cancel` | Cancel trip |

### Maintenance
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/workshops` | List workshops |
| `POST` | `/api/workshops` | Create workshop |
| `GET` | `/api/maintenance` | List maintenance records |
| `POST` | `/api/maintenance` | Schedule new maintenance |
| `POST` | `/api/maintenance/:id/start` | Start maintenance (assign workshop & tech) |
| `POST` | `/api/maintenance/:id/complete` | Complete maintenance |
| `POST` | `/api/maintenance/:id/cancel` | Cancel maintenance |

### Finance
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/fuel` | List fuel logs |
| `POST` | `/api/fuel` | Create fuel log (total_cost auto-computed) |
| `GET` | `/api/expenses` | List expenses |
| `POST` | `/api/expenses` | Create expense |
| `GET` | `/api/revenues` | List revenues |
| `POST` | `/api/revenues` | Create revenue |
| `GET` | `/api/finance/vehicle/:id` | Vehicle financial summary |
| `GET` | `/api/finance/trip/:id` | Trip financial summary |
| `GET` | `/api/finance/global` | Platform-wide financial summary |

### Analytics & Reports
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/analytics/dashboard` | Main dashboard KPIs |
| `GET` | `/api/analytics/expiring-licenses` | Drivers with expiring/expired licenses |
| `GET` | `/api/analytics/insights` | Top performers (drivers, vehicles) |
| `GET` | `/api/reports/trips` | Export trips as CSV |
| `GET` | `/api/reports/vehicles` | Export vehicles as CSV |
| `GET` | `/api/reports/fuel` | Export fuel logs as CSV |

---

## 🗃️ Database Schema (Key Tables)

```sql
-- Core Master Data
users              (id, email, password_hash, role, ...)
regions            (id, name, description)
vehicle_types      (id, name, max_default_capacity)
license_categories (id, name, description)

-- Layer 1: Assets
vehicles           (id, registration_number, name, model, vehicle_type_id,
                    max_capacity, odometer, acquisition_cost, status, region_id)
drivers            (id, full_name, license_number, license_category_id,
                    license_expiry_date, phone, safety_score, status)

-- Layer 3: Operations
trips              (id, trip_number, vehicle_id, driver_id, source, destination,
                    cargo_weight, planned_distance, status, ...)

-- Layer 4: Maintenance
workshops          (id, name, address, contact_number, manager)
maintenance_records(id, vehicle_id, workshop_id, maintenance_type, status,
                    estimated_cost, actual_cost, technician_name, ...)

-- Layer 5: Finance
fuel_logs          (id, vehicle_id, fuel_station, quantity, price_per_liter,
                    total_cost, odometer_reading, fuel_date)
expenses           (id, vehicle_id, expense_type, amount, description, expense_date)
revenues           (id, trip_id, amount, payment_status, ...)
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js v18+
- PostgreSQL 14+
- npm

### 1. Clone the Repository
```bash
git clone https://github.com/Meetvirugama/TransitOps-Smart-Transport-Operations-Platform.git
cd TransitOps-Smart-Transport-Operations-Platform
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create backend .env
cp .env.example .env
# Edit .env and set DATABASE_URL and JWT_SECRET
```

**`backend/.env` contents:**
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/transitops_db
JWT_SECRET=your_super_secret_key_here
```

### 3. Initialize Database
```bash
# Run schema migrations in order
node scripts/init-db.js
node scripts/init-layer1-db.js
node scripts/init-layer3-db.js
node scripts/init-layer4-db.js
node scripts/init-layer5-db.js

# Seed users (with all 5 roles)
node scripts/seed-users.js

# Seed operational dummy data
node scripts/seed-dummy-data.js
```

### 4. Start Backend
```bash
# Development (with hot-reload)
npm run dev

# Production
npm start
```

Backend runs on: `http://localhost:3000`

### 5. Frontend Setup
```bash
cd ../frontend
npm install
```

The Vite dev server proxies `/api` to `localhost:3000` automatically.

```bash
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## 🧪 Testing the API

Use the Health Check endpoint to verify the backend is live and the database is connected:

```bash
curl https://transitops-smart-transport-operations.onrender.com/health
```

Expected response:
```json
{
  "success": true,
  "status": "UP",
  "dbConnected": true,
  "timestamp": "2026-07-12T08:00:00.000Z"
}
```

---

## 🌐 Deployment Guide

### Frontend → Vercel
The `frontend/vercel.json` contains an `/api/*` proxy rewrite that forwards all API calls to the Render backend, so no environment variables are needed on Vercel.

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://transitops-smart-transport-operations.onrender.com/api/:path*"
    },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Backend → Render
Set the following environment variables in Render's dashboard:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `DATABASE_URL` | Your Render PostgreSQL connection string |
| `JWT_SECRET` | A long, random secret string |

**Start Command:** `node src/app.js`

---

## 🗂️ Documentation Index

Full layer-by-layer documentation is in the `/docs` folder:

| File | Coverage |
|---|---|
| [main_idea.md](./docs/main_idea.md) | Platform overview, features, business rules |
| [project_tracker.md](./docs/project_tracker.md) | Layer completion tracker, API summary |
| [layer_0.md](./docs/layer_0.md) | Foundation: Express, JWT, Middleware |
| [layer_1.md](./docs/layer_1.md) | Master Data: Vehicles, Drivers, Regions |
| [layer_2.md](./docs/layer_2.md) | Fleet Availability & Race Condition Prevention |
| [layer_3.md](./docs/layer_3.md) | Trip Operations & 9 Business Rules |
| [layer_4.md](./docs/layer_4.md) | Maintenance & Workshop Management |
| [layer_5.md](./docs/layer_5.md) | Finance: Fuel, Expenses, ROI Engine |
| [layer_6.md](./docs/layer_6.md) | Analytics, KPIs, CSV Export |

---

## 📦 Key Design Decisions

| Decision | Rationale |
|---|---|
| **Raw SQL (pg) over an ORM** | Full control over queries, no magic, easier to optimize |
| **Zod validation on all endpoints** | Catches invalid payloads before business logic |
| **Soft deletes (`is_deleted`)** | Preserves audit trail, trips still reference deleted assets |
| **FOR UPDATE locking** | Prevents double-booking at the database level, not application level |
| **7-layer monolith** | Clear domain boundaries without microservice overhead |
| **No environment variables on Vercel** | `/api` proxy in vercel.json keeps config simple |
| **JWT stateless auth** | No server-side sessions, scales horizontally |
| **BaseRepository pattern** | Eliminated ~900 lines of duplicate CRUD code across 10+ repositories |

---

## 📄 License

ISC License — see backend `package.json`
