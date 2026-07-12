# TransitOps — Project Tracker

> **Full-Stack Platform** — React 19 Frontend + Node.js/Express 5 Backend + PostgreSQL

## Overall Status: ✅ ALL LAYERS COMPLETE (Backend + Frontend)

| Layer | Name | Backend | Frontend | Live |
|---|---|:---:|:---:|:---:|
| 0 | Foundation (Auth, Middleware) | ✅ | ✅ Login Page | ✅ |
| 1 | Master Data (Vehicles, Drivers) | ✅ | ✅ Fleet & Drivers Pages | ✅ |
| 2 | Fleet Availability (FOR UPDATE) | ✅ | ✅ Integrated in Trips | ✅ |
| 3 | Operations (Trips) | ✅ | ✅ Trips Page | ✅ |
| 4 | Maintenance & Workshops | ✅ | ✅ Maintenance Page | ✅ |
| 5 | Finance (Fuel/Expenses) | ✅ | ✅ Fuel & Expenses Page | ✅ |
| 6 | Analytics & Reports | ✅ | ✅ Dashboard (KPI cards) | ✅ |

---

## Deployment

| Service | Platform | URL |
|---|---|---|
| Frontend | Vercel | https://transit-ops-smart-transport-operati.vercel.app |
| Backend API | Render | https://transitops-smart-transport-operations.onrender.com |
| Database | Render PostgreSQL | (Internal connection via DATABASE_URL) |

---

## Layer 0 — Foundation ✅

### Backend
- [x] Express server with all routes registered
- [x] PostgreSQL connection pool (`pg`)
- [x] JWT authentication (login, register, /me)
- [x] Rate limiting on `/api/auth` (10 req/15min per IP)
- [x] RBAC middleware (5 roles: Admin, Fleet Manager, Dispatcher, Safety Officer, Financial Analyst)
- [x] Zod validation middleware on all route schemas
- [x] Global error handler
- [x] Request logger
- [x] `BaseRepository` — shared CRUD base class (~900 lines saved)
- [x] `catchAsync` — shared controller wrapper
- [x] `schemas.js` — shared Zod schemas (idParam, pagination)
- [x] `response.js` — `sendSuccess`, `sendPaginatedSuccess`
- [x] `constants.js` — ROLES, VEHICLE_STATUS, DRIVER_STATUS, TRIP_STATUS

### Frontend
- [x] React 19 + Vite 8 SPA
- [x] React Router DOM v7 with protected routes
- [x] `AuthContext` — global login/logout state
- [x] `api.js` — Axios instance with JWT `Bearer` interceptor
- [x] Auto-redirect to `/login` on 401 responses
- [x] Glassmorphic dark-mode design system (CSS custom properties)
- [x] Login page with animated UI and demo credentials panel
- [x] `vercel.json` — `/api/*` proxy to Render backend

---

## Layer 1 — Master Data ✅

### Backend
- [x] Regions CRUD (filter, paginate, soft delete)
- [x] Vehicle Types CRUD
- [x] License Categories CRUD
- [x] Vehicles CRUD (filter by status/region/type, JOIN responses)
- [x] Drivers CRUD (filter by status/license_category, JOIN responses)
- [x] User Profiles CRUD
- [x] Duplicate registration number / license number validation

### Frontend
- [x] **Fleet Page** (`/fleet`) — Vehicle table with registration, model, capacity, status badges, region
- [x] Fleet Page — Add/Edit vehicle modal (Admin, Fleet Manager only)
- [x] Fleet Page — Delete vehicle (Admin, Fleet Manager only)
- [x] Fleet Page — Search by registration/name/model, filter by status
- [x] **Drivers Page** (`/drivers`) — Driver table with license, category, expiry, score, status
- [x] Drivers Page — Add/Edit driver modal (Admin, Fleet Manager only)
- [x] Drivers Page — Delete driver (Admin, Fleet Manager only)
- [x] Drivers Page — Search by name/license, filter by status

---

## Layer 2 — Fleet Availability ✅

### Backend
- [x] `SELECT ... FOR UPDATE` race condition prevention
- [x] Vehicle reserve / release
- [x] Driver reserve / release
- [x] Auto-rollback on partial reservation failure
- [x] Direct status change endpoints (`PATCH /api/fleet/vehicles/:id/status`)
- [x] Available vehicles/drivers query with filters
- [x] Fleet statistics endpoint (`GET /api/fleet/stats`)

### Frontend
- [x] Integrated transparently in Trips page — available vehicle/driver dropdowns
- [x] Real-time status reflected in Fleet and Drivers pages

---

## Layer 3 — Operations ✅

### Backend
- [x] Trip creation (Draft state)
- [x] 9 dispatch business rules enforced atomically
- [x] License expiry check at dispatch time
- [x] Suspended driver check at dispatch
- [x] Retired/In Shop vehicle guard
- [x] Cargo capacity validation
- [x] Trip completion with odometer auto-increment
- [x] Trip cancellation with resource release
- [x] Filtering and pagination on list endpoint

### Frontend
- [x] **Trips Page** (`/trips`) — Full trip table with status stepper
- [x] Trips Page — Create new trip draft (vehicle, driver, source, destination, weight, distance)
- [x] Trips Page — Dispatch trip modal (enforces all 9 business rules via backend)
- [x] Trips Page — Complete trip with actual distance input
- [x] Trips Page — Cancel trip with confirmation
- [x] Trips Page — Visual status stepper (Draft → Dispatched → Completed/Cancelled)
- [x] Trips Page — RBAC: Dispatchers & above can dispatch; Safety Officers/Finance Analysts view only

---

## Layer 4 — Maintenance ✅

### Backend
- [x] Workshop CRUD
- [x] Maintenance record scheduling → vehicle auto sets to `In Shop`
- [x] Start maintenance workflow (assign workshop + technician + expected date)
- [x] Complete maintenance → vehicle auto `Available`
- [x] Cancel maintenance → vehicle auto `Available`
- [x] Guard against duplicate active maintenance per vehicle
- [x] JOIN responses (vehicle registration + workshop name)

### Frontend
- [x] **Maintenance Page** (`/maintenance`) — Records table with type, vehicle, workshop, costs, status badge
- [x] Maintenance Page — Schedule new maintenance modal (Admin, Fleet Manager only)
- [x] Maintenance Page — Start maintenance modal (assign workshop from dropdown, technician name)
- [x] Maintenance Page — Complete maintenance modal (actual cost + remarks)
- [x] Maintenance Page — Cancel maintenance
- [x] Maintenance Page — Filter by status, search by vehicle/type
- [x] Maintenance Page — RBAC: Only Admin & Fleet Manager can modify

---

## Layer 5 — Finance ✅

### Backend
- [x] Fuel log CRUD (`total_cost` auto-computed from `quantity × price_per_liter`)
- [x] Expense CRUD
- [x] Revenue CRUD (trip must be Completed)
- [x] Cost Engine (fuel + maintenance + expenses per vehicle)
- [x] ROI Engine (`(Revenue - Total Cost) / Acquisition Cost × 100`)
- [x] Efficiency Engine (`Total Distance / Total Fuel` km/liter)
- [x] Per-vehicle finance summary
- [x] Per-trip finance summary
- [x] Global finance summary

### Frontend
- [x] **Fuel & Expenses Page** (`/fuel-expenses`) — Tabbed interface (Fuel Logs / Other Expenses)
- [x] Fuel Logs tab — Table with date, vehicle, station, qty/price, total cost
- [x] Fuel Logs tab — Add Fuel Log modal (vehicle, station, quantity, price, odometer)
- [x] Expenses tab — Table with date, vehicle, type, description, amount
- [x] Expenses tab — Add Expense modal (vehicle, type, amount, description)
- [x] Delete fuel log / expense (with confirmation)
- [x] Search by vehicle, filter by date
- [x] RBAC: Admin, Fleet Manager, Dispatcher can add; Safety Officer/Finance Analyst view only

---

## Layer 6 — Analytics & Reports ✅

### Backend
- [x] Dashboard with fleet + trip + driver + financial KPIs
- [x] Dashboard filtering by region_id and vehicle_type_id
- [x] Fleet utilization, availability, trip completion rate
- [x] Expiring license alerts (`?days=N`)
- [x] Already-expired license listing
- [x] Top 5 most active drivers
- [x] Top 5 most used vehicles
- [x] Top 5 highest fuel cost vehicles
- [x] CSV export: trips (with filters)
- [x] CSV export: vehicles (with filters)
- [x] CSV export: fuel logs (with filters)

### Frontend
- [x] **Dashboard Page** (`/`) — KPI cards (fleet counts, trip counts, driver counts)
- [x] Dashboard — Fleet status donut data (Available, On Trip, In Shop, Retired)
- [x] Dashboard — Recent trips table
- [x] Dashboard — Filter by region and vehicle type
- [x] Dashboard — Financial overview (revenue, costs, profit)

---

## API Summary

| Module | Prefix | Key Endpoints |
|---|---|---|
| Auth | `/api/auth` | login, register, me |
| Regions | `/api/regions` | CRUD |
| Vehicle Types | `/api/vehicle-types` | CRUD |
| License Categories | `/api/license-categories` | CRUD |
| Vehicles | `/api/vehicles` | CRUD + filter by status/region/type |
| Drivers | `/api/drivers` | CRUD + filter by status/category |
| Profiles | `/api/profiles` | CRUD |
| Fleet Availability | `/api/fleet` | 9 endpoints (stats, reserve, release, status change) |
| Trips | `/api/trips` | CRUD + dispatch + complete + cancel |
| Workshops | `/api/workshops` | CRUD |
| Maintenance | `/api/maintenance` | CRUD + start + complete + cancel |
| Fuel Logs | `/api/fuel` | CRUD |
| Expenses | `/api/expenses` | CRUD |
| Revenues | `/api/revenues` | CRUD |
| Finance Calculators | `/api/finance` | vehicle summary, trip summary, global summary |
| Analytics Dashboard | `/api/analytics` | dashboard, expiring-licenses, insights |
| CSV Reports | `/api/reports` | trips.csv, vehicles.csv, fuel.csv |
| Health | `/health` | server + DB health check |

---

## Refactoring Applied

- [x] `BaseRepository` — ~900 lines removed across 10+ repositories
- [x] `catchAsync` — deduped from all 16 controller files
- [x] `schemas.js` — shared Zod schemas for idParam, pagination
- [x] All ROI calculations corrected (was using wrong field name `cost` → `acquisition_cost`)
- [x] `sendPaginatedSuccess` helper added to `response.js`
- [x] Frontend API bug fixed: `/fuel-logs` → `/fuel` to match backend route
- [x] `vercel.json` API proxy added to fix Vercel frontend → Render backend connection

---

## Known Limitations / Future Work

| Item | Status |
|---|---|
| Analytics page (charts/graphs UI) | 🔄 Placeholder — backend complete |
| Portal Settings page | 🔄 Placeholder — future feature |
| Pagination UI in frontend | 🔄 All pages load up to 100 records |
| Real-time updates (WebSockets) | 🔄 Planned |
| CSV export buttons in UI | 🔄 Available via direct API call |
| Mobile responsive layout | 🔄 Desktop-first design |
