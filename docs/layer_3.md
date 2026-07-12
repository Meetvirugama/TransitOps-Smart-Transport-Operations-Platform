> ⚠️ **Note:** No frontend. API-only backend platform.

# TransitOps — Layer 3: Operations Layer (Trip Lifecycle)

**Status: ✅ COMPLETE**

## Purpose

Layer 3 is the **operational core** of TransitOps. It manages the complete trip lifecycle: creation, dispatch, completion, and cancellation. It enforces all mandatory business rules defined in the hackathon spec and orchestrates cross-module workflows by calling Layer 2 (availability) and querying Layer 1 (vehicles, drivers).

---

## Folder Structure

```
src/modules/operations/trips/
├── trip.routes.js       → Route definitions with role guards
├── trip.controller.js   → Request handlers (uses shared catchAsync)
├── trip.service.js      → All business logic, business rules, orchestration
├── trip.repository.js   → SQL queries for trips table
└── trip.validator.js    → Zod schemas for all trip operations
```

---

## Database Table

### `trips`
```sql
id, trip_number [UNIQUE], source, destination,
vehicle_id → vehicles,
driver_id → drivers,
cargo_weight, planned_distance, actual_distance,
status ['Draft'|'Dispatched'|'Completed'|'Cancelled'],
start_time, end_time,
created_by → users,
created_at, updated_at, is_deleted
```

---

## Trip Lifecycle

```
POST /api/trips          → Creates trip in 'Draft' state (no vehicle/driver yet)
         ↓
POST /api/trips/:id/dispatch → Validates + assigns vehicle + driver → 'Dispatched'
         ↓                         ↓
         ↓              POST /api/trips/:id/cancel → releases resources → 'Cancelled'
POST /api/trips/:id/complete → releases resources + updates odometer → 'Completed'
```

---

## Business Rules Enforced in `trip.service.js`

All rules are enforced in `dispatchTrip()`:

| Rule | Error if violated |
|---|---|
| Trip must be in `Draft` state | `Cannot dispatch trip in [X] state` |
| Vehicle must exist | `Vehicle not found` |
| Vehicle must be `Available` | `Cannot dispatch vehicle. Current status is [X]` |
| Vehicle cannot be `Retired` | `Cannot dispatch a Retired vehicle` |
| Vehicle cannot be `In Shop` | `Cannot dispatch a vehicle that is In Shop` |
| `cargo_weight` ≤ `vehicle.max_capacity` | `Cargo weight (X kg) exceeds vehicle capacity (Y kg)` |
| Driver must exist | `Driver not found` |
| Driver cannot be `Suspended` | `Cannot assign a Suspended driver to a trip` |
| `driver.license_expiry_date` ≥ today | `Driver license expired on [date]. Renew before dispatching.` |
| Driver must be `Available` | `Cannot assign driver. Current status is [X]` |

---

## Dispatch Workflow (step-by-step)

```javascript
// trip.service.js — dispatchTrip()

1. Fetch trip → verify status = 'Draft'
2. Fetch vehicle → check Retired/InShop/Available
3. Check cargo_weight ≤ vehicle.max_capacity
4. Fetch driver → check Suspended / license expiry / Available
5. availabilityService.reserveVehicle(vehicle_id)   ← FOR UPDATE lock
6. availabilityService.reserveDriver(driver_id)     ← FOR UPDATE lock
   [if step 6 fails → releaseVehicle() automatically]
7. changeVehicleStatus(vehicle_id, 'On Trip')
8. changeDriverStatus(driver_id, 'On Trip')
9. tripRepo.update(tripId, { vehicle_id, driver_id, start_time, status: 'Dispatched' })
```

---

## Complete Trip Workflow

```javascript
// trip.service.js — completeTrip()

1. Fetch trip → verify status = 'Dispatched'
2. availabilityService.releaseVehicle(vehicle_id) → status = 'Available'
3. Fetch vehicle → newOdometer = vehicle.odometer + actual_distance
4. vehicleRepo.update(vehicle_id, { odometer: newOdometer })  ← odometer auto-increment
5. availabilityService.releaseDriver(driver_id) → status = 'Available'
6. tripRepo.update(tripId, { actual_distance, end_time, status: 'Completed' })
```

---

## Cancel Trip Workflow

```javascript
// trip.service.js — cancelTrip()

1. Fetch trip → verify status is not 'Completed'/'Cancelled'
2. If 'Dispatched' → releaseVehicle() + releaseDriver()
3. tripRepo.update(tripId, { status: 'Cancelled', end_time })
```

---

## API Endpoints

| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/api/trips?status=Dispatched&vehicle_id=1` | All | List trips (filterable) |
| GET | `/api/trips/:id` | All | Get single trip |
| POST | `/api/trips` | Admin, Fleet Manager, Dispatcher | Create trip (Draft) |
| POST | `/api/trips/:id/dispatch` | Admin, Fleet Manager, Dispatcher | Dispatch → assign resources |
| POST | `/api/trips/:id/complete` | Admin, Fleet Manager, Dispatcher | Complete → release + odometer |
| POST | `/api/trips/:id/cancel` | Admin, Fleet Manager, Dispatcher | Cancel → release if Dispatched |

**Dispatch body:**
```json
{ "vehicle_id": 1, "driver_id": 2 }
```

**Complete body:**
```json
{ "actual_distance": 450.5 }
```

---

## Cross-Module Imports

```javascript
// trip.service.js imports:
const tripRepo           = require('./trip.repository');
const availabilityService = require('../../fleet/availability/availability.service');
const vehicleRepo        = require('../../vehicles/vehicle.repository');
const driverRepo         = require('../../drivers/driver.repository');
const { VEHICLE_STATUS, DRIVER_STATUS } = require('../../../common/constants');
```

---

## ✅ Completion Checklist

- [x] Trip creation (Draft state)
- [x] Dispatch with full business rule enforcement (9 rules)
- [x] License expiry date check at dispatch
- [x] Suspended driver check at dispatch
- [x] Retired/In Shop vehicle guard at dispatch
- [x] Capacity validation (cargo_weight ≤ max_capacity)
- [x] Race condition prevention (SELECT FOR UPDATE via Layer 2)
- [x] Rollback on partial failure
- [x] Trip completion with odometer auto-increment
- [x] Trip cancellation with resource release
- [x] Status filtering, pagination on list endpoint