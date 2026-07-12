> ⚠️ **Note:** No frontend. API-only backend platform.

# TransitOps — Layer 1: Master Data Layer

**Status: ✅ COMPLETE**

## Purpose

Layer 1 manages all foundational business entities. These are the "lookup tables" that every other layer reads or references. No workflows run here — only data registration, validation, and retrieval.

---

## Modules Built

| Module | Table | Key Fields |
|---|---|---|
| Regions | `regions` | name, description |
| Vehicle Types | `vehicle_types` | name, max_default_capacity |
| License Categories | `license_categories` | name, description |
| Vehicles | `vehicles` | registration_number, status, odometer, acquisition_cost |
| Drivers | `drivers` | license_number, license_expiry_date, safety_score, status |
| Profiles | `profiles` | linked to users table |

---

## Folder Structure

```
src/modules/
│
├── regions/
│   ├── region.routes.js        → GET/POST/PUT/DELETE /api/regions
│   ├── region.controller.js    → uses shared catchAsync
│   ├── region.service.js       → duplicate name check, CRUD
│   ├── region.repository.js    → extends BaseRepository (8 lines)
│   └── region.validator.js     → Zod schemas for body + params
│
├── vehicle-types/
│   ├── vehicle-type.routes.js
│   ├── vehicle-type.controller.js
│   ├── vehicle-type.service.js
│   ├── vehicle-type.repository.js   → extends BaseRepository (10 lines)
│   └── vehicle-type.validator.js
│
├── license-categories/
│   ├── license-category.routes.js
│   ├── license-category.controller.js
│   ├── license-category.service.js
│   ├── license-category.repository.js  → extends BaseRepository (8 lines)
│   └── license-category.validator.js
│
├── vehicles/
│   ├── vehicle.routes.js
│   ├── vehicle.controller.js
│   ├── vehicle.service.js       → registration duplicate check, capacity validation
│   ├── vehicle.repository.js    → extends BaseRepository, overrides findById/findAll (JOINs)
│   └── vehicle.validator.js
│
├── drivers/
│   ├── driver.routes.js
│   ├── driver.controller.js
│   ├── driver.service.js        → license duplicate check
│   ├── driver.repository.js     → extends BaseRepository, overrides findById/findAll (JOINs)
│   └── driver.validator.js
│
└── profiles/
    ├── profile.routes.js
    ├── profile.controller.js
    ├── profile.service.js
    └── profile.repository.js
```

---

## Database Tables

### `regions`
```sql
id, name, description, created_at, updated_at, is_deleted
```

### `vehicle_types`
```sql
id, name, description, max_default_capacity, created_at, updated_at, is_deleted
```

### `license_categories`
```sql
id, name, description, created_at, updated_at, is_deleted
```

### `vehicles`
```sql
id, registration_number [UNIQUE], name, model,
vehicle_type_id → vehicle_types,
region_id → regions,
max_capacity, odometer, acquisition_cost, purchase_date,
status ['Available'|'On Trip'|'In Shop'|'Retired'],
description, created_at, updated_at, is_deleted
```

### `drivers`
```sql
id, full_name, license_number [UNIQUE],
license_category_id → license_categories,
license_expiry_date, phone, email,
safety_score [0–100, default 100],
status ['Available'|'On Trip'|'Off Duty'|'Suspended'],
address, joining_date, created_at, updated_at, is_deleted
```

---

## Repository Pattern

All Layer 1 repositories extend `BaseRepository` from `src/common/base.repository.js`.

**Simple repos (region, vehicle-type, license-category) — ~8 lines each:**
```javascript
class RegionRepository extends BaseRepository {
  constructor() { super('regions'); }
  findByName(name) { return this.findOneWhere('name = $1', [name]); }
  create(name, description) { return this.insert(['name', 'description'], [name, description]); }
}
module.exports = new RegionRepository();
```

**Complex repos (vehicles, drivers) — override findById/findAll to include JOINs:**
```javascript
// vehicle.repository.js — findById JOINs vehicle_types + regions
async findById(id) {
  SELECT v.*, vt.name as vehicle_type_name, r.name as region_name
  FROM vehicles v
  LEFT JOIN vehicle_types vt ON v.vehicle_type_id = vt.id
  LEFT JOIN regions r ON v.region_id = r.id
  WHERE v.id = $1 AND v.is_deleted = false
}
```

---

## Validation Rules

### Vehicle
- `registration_number` — Required, unique
- `max_capacity` — Required, > 0
- `acquisition_cost` — ≥ 0
- `odometer` — ≥ 0
- `vehicle_type_id`, `region_id` — Must reference existing records

### Driver
- `license_number` — Required, unique
- `license_expiry_date` — Required, valid date
- `safety_score` — Integer 0–100
- `license_category_id` — Must reference existing record

---

## API Endpoints

### Vehicles
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/api/vehicles?status=Available&region_id=1&vehicle_type_id=2` | All | Filtered paginated list |
| GET | `/api/vehicles/:id` | All | Get vehicle with JOINed type + region names |
| POST | `/api/vehicles` | Admin, Fleet Manager | Register vehicle |
| PUT | `/api/vehicles/:id` | Admin, Fleet Manager | Update vehicle fields |
| DELETE | `/api/vehicles/:id` | Admin, Fleet Manager | Soft-delete |

### Drivers
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/api/drivers?status=Available&license_category_id=1` | All | Filtered list |
| GET | `/api/drivers/:id` | All | Get driver with license category |
| POST | `/api/drivers` | Admin, Fleet Manager | Register driver |
| PUT | `/api/drivers/:id` | Admin, Fleet Manager | Update |
| DELETE | `/api/drivers/:id` | Admin | Soft-delete |

### Regions / Vehicle Types / License Categories
All follow the same pattern: `GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`

---

## What This Layer Cannot Do

- ❌ Assign a vehicle or driver to a trip
- ❌ Change status to `On Trip` or `In Shop`
- ❌ Log fuel or expenses
- ❌ Create maintenance records
- ❌ Calculate ROI or analytics

Status transitions are handled by Layers 2 and 3.

---

## ✅ Completion Checklist

- [x] Vehicle CRUD + JOINed responses
- [x] Driver CRUD + JOINed responses
- [x] Vehicle Type CRUD
- [x] License Category CRUD
- [x] Region CRUD
- [x] User Profile CRUD
- [x] Filtering (status, region_id, vehicle_type_id, license_category_id)
- [x] Pagination (page + limit query params)
- [x] Soft Delete (is_deleted flag)
- [x] Zod validation on all endpoints
- [x] Duplicate registration number / license number check