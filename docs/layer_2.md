> ⚠️ **Note:** No frontend. API-only backend platform.

# TransitOps — Layer 2: Fleet Availability Layer

**Status: ✅ COMPLETE**

## Purpose

Layer 2 manages real-time operational state of fleet resources. It provides the **resource locking mechanism** that prevents double-booking of vehicles and drivers. Every dispatch workflow passes through this layer.

This layer modifies status fields on the `vehicles` and `drivers` tables (owned by Layer 1). It does not own any tables itself.

---

## Folder Structure

```
src/modules/fleet/availability/
├── availability.routes.js       → All /api/fleet/* endpoints
├── availability.controller.js   → Request handlers (uses shared catchAsync)
├── availability.service.js      → Core lock/unlock logic with SELECT FOR UPDATE
└── availability.validator.js    → Zod schemas for param/body validation
```

---

## The Core Problem This Layer Solves

Without transactional locking, two dispatchers could simultaneously assign the same vehicle to two different trips. Layer 2 solves this using PostgreSQL row-level locking:

```sql
BEGIN;
SELECT status FROM vehicles WHERE id = $1 FOR UPDATE;
-- Only proceeds if status = 'Available'
UPDATE vehicles SET status = 'On Trip' WHERE id = $1;
COMMIT;
```

If the vehicle is already locked (another transaction holds the lock), this query blocks until the first transaction completes.

---

## Service Functions (called by Layer 3)

```javascript
// availability.service.js

reserveVehicle(vehicleId)     // SELECT FOR UPDATE → confirms Available → COMMIT
releaseVehicle(vehicleId)     // UPDATE status back to 'Available'
reserveDriver(driverId)       // SELECT FOR UPDATE → confirms Available → COMMIT
releaseDriver(driverId)       // UPDATE status back to 'Available'

changeVehicleStatus(id, status)   // Direct status update (used by maintenance + trip)
changeDriverStatus(id, status)    // Direct status update

getAvailableVehicles(filters)     // Returns vehicles WHERE status = 'Available'
getAvailableDrivers(filters)      // Returns drivers WHERE status = 'Available'
getFleetStatistics()              // Count summary by status
```

---

## Rollback on Failure

If vehicle reservation succeeds but driver reservation fails, the vehicle is automatically released:

```javascript
// In trip.service.js dispatch workflow:
try {
  await availabilityService.reserveVehicle(vehicle_id);
} catch (err) {
  throw new AppError(`Vehicle reservation failed: ${err.message}`, 400);
}

try {
  await availabilityService.reserveDriver(driver_id);
} catch (err) {
  await availabilityService.releaseVehicle(vehicle_id); // ← rollback
  throw new AppError(`Driver reservation failed: ${err.message}`, 400);
}
```

---

## Status Transition Map

```
Vehicle:
  Available ──reserve()──→ (locked) ──changeVehicleStatus('On Trip')──→ On Trip
  On Trip ──release()──────────────────────────────────────────────────→ Available
  Available ──changeVehicleStatus('In Shop')──────────────────────────→ In Shop
  In Shop ──changeVehicleStatus('Available')──────────────────────────→ Available
  Any ──changeVehicleStatus('Retired')────────────────────────────────→ Retired

Driver:
  Available ──reserve()──→ (locked) ──changeDriverStatus('On Trip')──→ On Trip
  On Trip ──release()─────────────────────────────────────────────────→ Available
  Any ──changeDriverStatus('Suspended'/'Off Duty')─────────────────────→ Suspended/Off Duty
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/fleet/status` | ✅ | Fleet statistics (counts by status) |
| GET | `/api/fleet/available-vehicles?region_id=1` | ✅ | Available vehicles list |
| GET | `/api/fleet/available-drivers?license_category_id=1` | ✅ | Available drivers list |
| POST | `/api/fleet/reserve-vehicle/:id` | ✅ | Lock vehicle with FOR UPDATE |
| POST | `/api/fleet/release-vehicle/:id` | ✅ | Release vehicle lock |
| POST | `/api/fleet/reserve-driver/:id` | ✅ | Lock driver with FOR UPDATE |
| POST | `/api/fleet/release-driver/:id` | ✅ | Release driver lock |
| PUT | `/api/fleet/vehicle-status/:id` | ✅ | Direct status change |
| PUT | `/api/fleet/driver-status/:id` | ✅ | Direct status change |

---

## Database

No new tables. Layer 2 writes to Layer 1 tables:

```
vehicles.status   ← Updated by reserveVehicle, releaseVehicle, changeVehicleStatus
drivers.status    ← Updated by reserveDriver, releaseDriver, changeDriverStatus
```

---

## Dependencies

- **Depends on:** Layer 0 (auth, JWT, pg pool), Layer 1 (vehicles + drivers tables)
- **Used by:** Layer 3 (Trips — dispatch, complete, cancel), Layer 4 (Maintenance — In Shop transitions)

---

## ✅ Completion Checklist

- [x] Vehicle availability tracking (status field)
- [x] Driver availability tracking (status field)
- [x] Resource reservation with `SELECT ... FOR UPDATE`
- [x] Resource release (back to Available)
- [x] Rollback on partial failure (vehicle released if driver fails)
- [x] Direct status transition endpoints
- [x] Fleet statistics API
- [x] Available vehicles/drivers query with filters