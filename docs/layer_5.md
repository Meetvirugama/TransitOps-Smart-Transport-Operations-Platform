> ⚠️ **Note:** No frontend. API-only backend platform.

# TransitOps — Layer 5: Financial Management Layer

**Status: ✅ COMPLETE**

## Purpose

Layer 5 handles all financial data and calculations: fuel consumption tracking, operational expenses, revenue recording, and financial engines that compute cost, ROI, and fuel efficiency per vehicle.

---

## Folder Structure

```
src/modules/finance/
│
├── fuel/
│   ├── fuel.routes.js           → /api/fuel
│   ├── fuel.controller.js
│   ├── fuel.service.js          → auto-computes total_cost on create/update
│   ├── fuel.repository.js       → extends BaseRepository (18 lines)
│   └── fuel.validator.js
│
├── expenses/
│   ├── expense.routes.js        → /api/expenses
│   ├── expense.controller.js
│   ├── expense.service.js
│   ├── expense.repository.js    → extends BaseRepository (18 lines)
│   └── expense.validator.js
│
├── revenue/
│   ├── revenue.routes.js        → /api/revenues
│   ├── revenue.controller.js
│   ├── revenue.service.js       → validates trip is Completed before recording revenue
│   ├── revenue.repository.js    → extends BaseRepository (18 lines)
│   └── revenue.validator.js
│
└── calculator/
    ├── finance.routes.js        → /api/finance/*
    ├── finance.controller.js
    ├── finance.service.js       → orchestrates the 3 engines
    ├── cost.engine.js           → fuel + maintenance + expenses per vehicle
    ├── roi.engine.js            → (Revenue - Cost) / acquisition_cost × 100
    └── efficiency.engine.js     → total_distance / total_fuel_consumed
```

---

## Database Tables

### `fuel_logs`
```sql
id,
vehicle_id → vehicles,
trip_id → trips,
driver_id → drivers,
fuel_station, quantity, price_per_liter,
total_cost [auto-computed = quantity × price_per_liter],
odometer_reading, fuel_date, remarks,
created_by → users,
created_at, updated_at, is_deleted
```

### `expenses`
```sql
id,
vehicle_id → vehicles,
trip_id → trips,
expense_type,    -- e.g., 'Toll', 'Parking', 'Fine', 'Repair'
amount, expense_date, description,
created_by → users,
created_at, updated_at, is_deleted
```

### `revenues`
```sql
id,
trip_id → trips,         -- MUST be a Completed trip
vehicle_id → vehicles,
customer_name, amount,
payment_status ['Pending'|'Partial'|'Paid'],
invoice_number, received_date,
created_by → users,
created_at, updated_at, is_deleted
```

---

## Financial Engines

### Cost Engine (`cost.engine.js`)

Aggregates all costs for a vehicle:
```sql
-- Fuel cost
SELECT COALESCE(SUM(total_cost), 0) FROM fuel_logs WHERE vehicle_id = $1

-- Maintenance cost
SELECT COALESCE(SUM(actual_cost), 0) FROM maintenance_records
  WHERE vehicle_id = $1 AND status = 'Completed'

-- Other expenses
SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE vehicle_id = $1
```

Returns:
```json
{
  "fuelCost": 3200,
  "maintenanceCost": 1500,
  "otherExpenses": 400,
  "totalCost": 5100
}
```

---

### ROI Engine (`roi.engine.js`)

```javascript
// roi.engine.js

const acquisitionCost = vehicle.acquisition_cost ?? 0;
const revenue = SUM(revenues.amount WHERE vehicle_id = $1)
const costs = await costEngine.calculate(vehicleId)
const netProfit = revenue - costs.totalCost
const roiPercentage = acquisitionCost > 0 ? (netProfit / acquisitionCost) * 100 : 0
```

**Formula:**
```
ROI = (Revenue - (Fuel + Maintenance + Expenses)) / Acquisition Cost × 100
```

---

### Efficiency Engine (`efficiency.engine.js`)

```javascript
// efficiency.engine.js

// Total distance = sum of actual_distance from Completed trips for this vehicle
const totalDistance = SUM(actual_distance FROM trips WHERE vehicle_id AND status='Completed')

// Total fuel = sum of quantity from fuel_logs for this vehicle
const totalFuel = SUM(quantity FROM fuel_logs WHERE vehicle_id)

const efficiency = totalFuel > 0 ? totalDistance / totalFuel : 0
// Unit: km/liter
```

---

## Business Rules

| Rule | Location |
|---|---|
| `total_cost` auto-computed on create | `fuel.service.js` — `quantity × price_per_liter` |
| `total_cost` re-computed on update | `fuel.service.js` — uses existing values as fallback |
| Revenue only allowed for **Completed** trips | `revenue.service.js` |
| ROI uses `vehicle.acquisition_cost` (not a hardcoded default) | `roi.engine.js` |

---

## API Endpoints

### Fuel Logs
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/api/fuel?vehicle_id=1&trip_id=2&driver_id=3` | All | Filtered list |
| GET | `/api/fuel/:id` | All | Get log |
| POST | `/api/fuel` | Admin, Fleet Manager, Dispatcher | Create → auto total_cost |
| PUT | `/api/fuel/:id` | Admin, Fleet Manager, Dispatcher | Update → re-compute total_cost |
| DELETE | `/api/fuel/:id` | Admin, Fleet Manager, Dispatcher | Soft-delete |

### Expenses
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/api/expenses?vehicle_id=1&expense_type=Toll` | All | Filtered list |
| GET | `/api/expenses/:id` | All | Get expense |
| POST | `/api/expenses` | Admin, Fleet Manager, Dispatcher | Create |
| PUT | `/api/expenses/:id` | Admin, Fleet Manager, Dispatcher | Update |
| DELETE | `/api/expenses/:id` | Admin, Fleet Manager, Dispatcher | Soft-delete |

### Revenues
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/api/revenues?payment_status=Pending&vehicle_id=1` | All | Filtered list |
| GET | `/api/revenues/:id` | All | Get revenue |
| POST | `/api/revenues` | Admin, Fleet Manager | Create (trip must be Completed) |
| PUT | `/api/revenues/:id` | Admin, Fleet Manager | Update |
| DELETE | `/api/revenues/:id` | Admin, Fleet Manager | Soft-delete |

### Financial Calculators
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/api/finance/summary` | Admin, Fleet Manager | Global financial summary |
| GET | `/api/finance/vehicle/:id` | Admin, Fleet Manager | Per-vehicle: costs, ROI, efficiency |
| GET | `/api/finance/trip/:id` | Admin, Fleet Manager | Per-trip: revenue vs costs |

**Sample `/api/finance/vehicle/:id` response:**
```json
{
  "vehicleId": 3,
  "financials": {
    "revenue": 12000,
    "costs": { "fuelCost": 3200, "maintenanceCost": 1500, "expenses": 400, "totalCost": 5100 },
    "netProfit": 6900,
    "acquisitionCost": 50000,
    "roiPercentage": 13.8
  },
  "performance": {
    "totalDistance": 4800,
    "totalFuel": 360,
    "efficiency": 13.33
  }
}
```

---

## ✅ Completion Checklist

- [x] Fuel log CRUD with auto `total_cost` computation
- [x] Expense CRUD
- [x] Revenue CRUD with Completed-trip validation
- [x] Cost Engine (fuel + maintenance + expenses per vehicle)
- [x] ROI Engine using correct `acquisition_cost` field
- [x] Fuel Efficiency Engine (km/liter)
- [x] Per-vehicle finance summary API
- [x] Per-trip finance summary API
- [x] Global finance summary API
- [x] Filtering by vehicle_id, trip_id, driver_id, expense_type, payment_status