> ⚠️ **Note:** No frontend. API-only backend platform.

# TransitOps — Layer 4: Maintenance Layer

**Status: ✅ COMPLETE**

## Purpose

Layer 4 manages the vehicle maintenance lifecycle — from scheduling through completion. Its key integration point is **automatic vehicle status management**: when maintenance is scheduled, the vehicle moves to `In Shop`; when completed or cancelled, it returns to `Available`.

---

## Folder Structure

```
src/modules/maintenance/
│
├── workshops/
│   ├── workshop.routes.js       → CRUD /api/workshops
│   ├── workshop.controller.js   → Request handlers (shared catchAsync)
│   ├── workshop.service.js      → Duplicate name check, CRUD
│   ├── workshop.repository.js   → extends BaseRepository (9 lines)
│   └── workshop.validator.js    → Zod schemas
│
└── records/
    ├── maintenance.routes.js    → CRUD + workflow /api/maintenance
    ├── maintenance.controller.js
    ├── maintenance.service.js   → All workflow logic + vehicle status transitions
    ├── maintenance.repository.js → extends BaseRepository, custom JOINs (48 lines)
    └── maintenance.validator.js
```

---

## Database Tables

### `workshops`
```sql
id, name, address, contact_number, manager,
status ['Active'|'Inactive'],
created_at, updated_at, is_deleted
```

### `maintenance_records`
```sql
id,
vehicle_id → vehicles,
workshop_id → workshops,
maintenance_type,          -- e.g., 'Oil Change', 'Tire Replacement', 'Engine Service'
description,
status ['Scheduled'|'In Progress'|'Completed'|'Cancelled'],
estimated_cost,
actual_cost,
scheduled_date,
started_at,
completed_at,
created_by → users,
created_at, updated_at, is_deleted
```

---

## Maintenance Lifecycle

```
POST /api/maintenance
    → Creates record with status 'Scheduled'
    → Vehicle status automatically → 'In Shop'
         ↓
POST /api/maintenance/:id/start
    → status → 'In Progress', records started_at
         ↓
POST /api/maintenance/:id/complete
    → status → 'Completed', records completed_at, saves actual_cost
    → Vehicle status automatically → 'Available'
         ↓ (alternative)
POST /api/maintenance/:id/cancel
    → status → 'Cancelled'
    → Vehicle status automatically → 'Available'
```

---

## Business Logic in `maintenance.service.js`

### Schedule Maintenance
```javascript
async scheduleMaintenance(data, userId) {
  // 1. Check vehicle exists
  const vehicle = await vehicleRepo.findById(data.vehicle_id);
  if (!vehicle) throw new NotFoundError('Vehicle not found');

  // 2. Check no active maintenance already exists
  const active = await maintenanceRepo.findActiveByVehicleId(data.vehicle_id);
  if (active) throw new AppError('Vehicle already has active maintenance', 400);

  // 3. Create maintenance record
  const record = await maintenanceRepo.create({ ...data, created_by: userId });

  // 4. Update vehicle status → In Shop
  await vehicleRepo.update(data.vehicle_id, { status: 'In Shop' });

  return record;
}
```

### Complete Maintenance
```javascript
async completeMaintenance(id, { actual_cost }) {
  // 1. Verify record is In Progress
  // 2. Update record → Completed + actual_cost + completed_at
  // 3. Restore vehicle → Available
  await vehicleRepo.update(record.vehicle_id, { status: 'Available' });
}
```

---

## Repository — Custom JOINs

`maintenance.repository.js` extends `BaseRepository` and overrides `findById`/`findAll` to include vehicle registration number and workshop name:

```sql
SELECT m.*, v.registration_number, w.name as workshop_name
FROM maintenance_records m
LEFT JOIN vehicles v ON m.vehicle_id = v.id
LEFT JOIN workshops w ON m.workshop_id = w.id
WHERE m.id = $1 AND m.is_deleted = false
```

Also implements `findActiveByVehicleId`:
```sql
SELECT * FROM maintenance_records
WHERE vehicle_id = $1
  AND status IN ('Scheduled', 'In Progress')
  AND is_deleted = false
```

---

## API Endpoints

### Workshops
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/api/workshops` | All | List workshops |
| GET | `/api/workshops/:id` | All | Get workshop |
| POST | `/api/workshops` | Admin, Fleet Manager | Create workshop |
| PUT | `/api/workshops/:id` | Admin, Fleet Manager | Update |
| DELETE | `/api/workshops/:id` | Admin, Fleet Manager | Soft-delete |

### Maintenance Records
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/api/maintenance?status=In Progress&vehicle_id=1&workshop_id=1` | All | List (filterable) |
| GET | `/api/maintenance/:id` | All | Get with vehicle + workshop JOIN |
| POST | `/api/maintenance` | Admin, Fleet Manager | Schedule → vehicle to **In Shop** |
| POST | `/api/maintenance/:id/start` | Admin, Fleet Manager | Start → In Progress |
| POST | `/api/maintenance/:id/complete` | Admin, Fleet Manager | Complete → vehicle to **Available** |
| POST | `/api/maintenance/:id/cancel` | Admin, Fleet Manager | Cancel → vehicle to **Available** |

---

## Integration with Other Layers

- **Layer 1:** Reads `vehicles` (checks existence, updates status)
- **Layer 2:** Calls `changeVehicleStatus()` to update vehicle status
- **Layer 5:** Maintenance `actual_cost` is queried by the Cost Engine for total cost calculations
- **Layer 6:** KPI engine sums maintenance costs from `maintenance_records`

---

## ✅ Completion Checklist

- [x] Workshop CRUD (name, address, contact, manager, status)
- [x] Maintenance record creation → vehicle auto In Shop
- [x] Maintenance start workflow
- [x] Maintenance completion → vehicle auto Available + actual_cost saved
- [x] Maintenance cancellation → vehicle auto Available
- [x] Guard: prevents scheduling when active maintenance exists
- [x] Filtering by status, vehicle_id, workshop_id
- [x] JOIN responses (vehicle registration + workshop name)
- [x] Soft delete on both workshops and records