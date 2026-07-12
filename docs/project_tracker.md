# TransitOps — Project Tracker

> API-only backend. No frontend.

## Overall Status: ✅ ALL LAYERS COMPLETE

| Layer | Name | Status | Key Files |
|---|---|---|---|
| 0 | Foundation | ✅ Done | `src/app.js`, `src/auth/`, `src/middleware/`, `src/common/` |
| 1 | Master Data | ✅ Done | `src/modules/vehicles/`, `src/modules/drivers/`, `src/modules/regions/` |
| 2 | Fleet Availability | ✅ Done | `src/modules/fleet/availability/` |
| 3 | Operations (Trips) | ✅ Done | `src/modules/operations/trips/` |
| 4 | Maintenance | ✅ Done | `src/modules/maintenance/` |
| 5 | Finance | ✅ Done | `src/modules/finance/` |
| 6 | Analytics & Reports | ✅ Done | `src/modules/analytics/` |

---

## Layer 0 — Foundation ✅

- [x] Express server with all routes registered
- [x] PostgreSQL connection pool (`pg`)
- [x] JWT authentication (login, register, /me)
- [x] Rate limiting on `/api/auth` (10 req/15min)
- [x] RBAC middleware (5 roles)
- [x] Zod validation middleware
- [x] Global error handler
- [x] Request logger
- [x] `BaseRepository` — shared CRUD base class
- [x] `catchAsync` — shared controller wrapper
- [x] `schemas.js` — shared Zod schemas
- [x] `response.js` — `sendSuccess`, `sendPaginatedSuccess`
- [x] `constants.js` — ROLES, VEHICLE_STATUS, DRIVER_STATUS, TRIP_STATUS

## Layer 1 — Master Data ✅

- [x] Regions CRUD (filter, paginate, soft delete)
- [x] Vehicle Types CRUD
- [x] License Categories CRUD
- [x] Vehicles CRUD (filter by status/region/type, JOIN responses)
- [x] Drivers CRUD (filter by status/license_category, JOIN responses)
- [x] User Profiles CRUD
- [x] Duplicate registration number / license number validation

## Layer 2 — Fleet Availability ✅

- [x] `SELECT ... FOR UPDATE` race condition prevention
- [x] Vehicle reserve / release
- [x] Driver reserve / release
- [x] Auto-rollback on partial failure
- [x] Direct status change endpoints
- [x] Available vehicles/drivers query with filters
- [x] Fleet statistics endpoint

## Layer 3 — Operations ✅

- [x] Trip creation (Draft state)
- [x] 9 dispatch business rules enforced
- [x] License expiry check at dispatch
- [x] Suspended driver check at dispatch
- [x] Retired/In Shop vehicle guard
- [x] Cargo capacity validation
- [x] Trip completion with odometer increment
- [x] Trip cancellation with resource release
- [x] Filtering and pagination on list endpoint

## Layer 4 — Maintenance ✅

- [x] Workshop CRUD
- [x] Maintenance record scheduling → vehicle auto In Shop
- [x] Start maintenance workflow
- [x] Complete maintenance → vehicle auto Available
- [x] Cancel maintenance → vehicle auto Available
- [x] Guard against duplicate active maintenance
- [x] JOIN responses (vehicle registration + workshop name)

## Layer 5 — Finance ✅

- [x] Fuel log CRUD (`total_cost` auto-computed)
- [x] Expense CRUD
- [x] Revenue CRUD (trip must be Completed)
- [x] Cost Engine (fuel + maintenance + expenses)
- [x] ROI Engine (uses `acquisition_cost`, correct field)
- [x] Efficiency Engine (km/liter)
- [x] Per-vehicle finance summary
- [x] Per-trip finance summary
- [x] Global finance summary

## Layer 6 — Analytics & Reports ✅

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

---

## Refactoring Applied

- [x] `BaseRepository` — ~900 lines removed across 10+ repositories
- [x] `catchAsync` — deduped from all 16 controller files
- [x] `schemas.js` — shared Zod schemas for idParam, pagination
- [x] All ROI calculations corrected (was using wrong field name)
- [x] `sendPaginatedSuccess` helper added to `response.js`

---

## API Summary

| Module | Routes | Prefix |
|---|---|---|
| Auth | login, register, me | `/api/auth` |
| Regions | CRUD | `/api/regions` |
| Vehicle Types | CRUD | `/api/vehicle-types` |
| License Categories | CRUD | `/api/license-categories` |
| Vehicles | CRUD + filters | `/api/vehicles` |
| Drivers | CRUD + filters | `/api/drivers` |
| Profiles | CRUD | `/api/profiles` |
| Fleet Availability | 9 endpoints | `/api/fleet` |
| Trips | CRUD + 3 workflow endpoints | `/api/trips` |
| Workshops | CRUD | `/api/workshops` |
| Maintenance | CRUD + 3 workflow endpoints | `/api/maintenance` |
| Fuel Logs | CRUD | `/api/fuel` |
| Expenses | CRUD | `/api/expenses` |
| Revenues | CRUD | `/api/revenues` |
| Finance Calculators | 3 summary endpoints | `/api/finance` |
| Analytics Dashboard | dashboard, licenses, insights | `/api/analytics` |
| CSV Reports | 3 export endpoints | `/api/reports` |
| Health | health check | `/health` |
