> ⚠️ **Note:** No frontend. API-only backend platform.

# TransitOps — Layer 6: Analytics & Reporting Layer

**Status: ✅ COMPLETE**

## Purpose

Layer 6 is the read-only intelligence layer. It aggregates data from all other layers to produce real-time KPIs, operational insights, license compliance alerts, and CSV data exports. No data is modified here — only read and aggregated.

---

## Folder Structure

```
src/modules/analytics/
│
├── kpi/
│   └── kpi.engine.js           ← Core query engine for all metrics
│
├── dashboard/
│   ├── dashboard.routes.js     → /api/analytics/* endpoints
│   ├── dashboard.controller.js → Request handlers (filters from query params)
│   └── dashboard.service.js    → Orchestrates kpiEngine calls
│
└── exports/
    ├── reports.routes.js       → /api/reports/* CSV export endpoints
    ├── reports.controller.js   → Streams CSV to response
    └── csv.export.js           ← CSV engine (no dependencies, pure string building)
```

---

## KPI Engine (`kpi.engine.js`)

Uses `Promise.all()` to run all queries in parallel for maximum performance.

### Functions Exported

```javascript
getVehicleCounts(filters)       // Total, available, onTrip, inShop, retired
getTripCounts(filters)          // Total, draft, active, completed, cancelled
getDriverCounts()               // Total, available, onTrip, suspended, offDuty
getFinancialMetrics()           // Revenue, costs (fuel/maintenance/expenses), profit
getExpiringLicenses(daysAhead)  // Drivers with license_expiry_date ≤ NOW + N days
getExpiredLicenses()            // Drivers with license already expired
getInsights()                   // Top 5 most active drivers/vehicles, highest fuel cost
```

### Filter Support

`getVehicleCounts` and `getTripCounts` accept optional filters:
```javascript
filters = { region_id: '1', vehicle_type_id: '2' }
// → appended as WHERE conditions dynamically
```

---

## Dashboard Service (`dashboard.service.js`)

Calls all KPI functions in parallel:

```javascript
const getDashboardSummary = async (filters = {}) => {
  const [vehicles, trips, drivers, financials] = await Promise.all([
    kpiEngine.getVehicleCounts(filters),
    kpiEngine.getTripCounts(filters),
    kpiEngine.getDriverCounts(),
    kpiEngine.getFinancialMetrics()
  ]);
  // ... computes KPI ratios
};
```

---

## CSV Export Engine (`csv.export.js`)

Zero external dependencies — builds CSV strings manually:

```javascript
const objectsToCSV = (rows) => {
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(',')];
  for (const row of rows) {
    const values = headers.map(h => {
      const val = String(row[h] ?? '');
      return val.includes(',') ? `"${val.replace(/"/g, '""')}"` : val;
    });
    lines.push(values.join(','));
  }
  return lines.join('\n');
};
```

Sends with correct headers:
```
Content-Type: text/csv
Content-Disposition: attachment; filename="trips_export.csv"
```

---

## API Endpoints

### Dashboard
| Method | Endpoint | Roles | Query Params | Description |
|---|---|---|---|---|
| GET | `/api/analytics/dashboard` | Admin, Fleet Manager, Safety Officer | `?region_id=1&vehicle_type_id=2` | Real-time fleet + financial KPIs |
| GET | `/api/analytics/expiring-licenses` | Admin, Fleet Manager, Safety Officer | `?days=30` | Expiring soon + already expired |
| GET | `/api/analytics/insights` | Admin, Fleet Manager, Safety Officer | — | Top performers |

### CSV Exports
| Method | Endpoint | Roles | Query Params | Downloads |
|---|---|---|---|---|
| GET | `/api/reports/trips/export` | Admin, Fleet Manager, Financial Analyst | `?status=Completed&from_date=2024-01-01&to_date=2024-12-31` | `trips_export.csv` |
| GET | `/api/reports/vehicles/export` | Admin, Fleet Manager, Financial Analyst | `?status=Available&region_id=1&vehicle_type_id=2` | `vehicles_export.csv` |
| GET | `/api/reports/fuel/export` | Admin, Fleet Manager, Financial Analyst | `?vehicle_id=1&from_date=2024-01-01` | `fuel_logs_export.csv` |

---

## Sample API Responses

### `GET /api/analytics/dashboard`
```json
{
  "vehicles": { "total": 25, "available": 18, "onTrip": 5, "inShop": 2, "retired": 0 },
  "trips": { "total": 340, "draft": 3, "active": 5, "completed": 320, "cancelled": 12 },
  "drivers": { "total": 30, "available": 22, "onTrip": 5, "suspended": 1, "offDuty": 2 },
  "financials": {
    "revenue": 150000, "totalCost": 95000,
    "fuelCost": 60000, "maintenanceCost": 25000, "otherExpenses": 10000,
    "profit": 55000
  },
  "kpis": {
    "fleetUtilizationPercentage": 20.0,
    "vehicleAvailabilityPercentage": 72.0,
    "tripCompletionRate": 94.1
  }
}
```

### `GET /api/analytics/expiring-licenses?days=30`
```json
{
  "expiringSoon": [
    { "id": 5, "full_name": "Alex Kumar", "license_expiry_date": "2024-08-01", "phone": "9876543210" }
  ],
  "alreadyExpired": [
    { "id": 12, "full_name": "Ravi Sharma", "license_expiry_date": "2024-06-15" }
  ]
}
```

### `GET /api/analytics/insights`
```json
{
  "mostActiveDrivers": [
    { "id": 3, "full_name": "Rohit Singh", "trip_count": "47" }
  ],
  "mostUsedVehicles": [
    { "id": 7, "registration_number": "MH12AB1234", "trip_count": "62" }
  ],
  "highestFuelCostVehicles": [
    { "id": 7, "registration_number": "MH12AB1234", "total_fuel_cost": "18400.50" }
  ]
}
```

---

## KPI Calculations

| KPI | Formula |
|---|---|
| Fleet Utilization % | `(onTrip / total vehicles) × 100` |
| Vehicle Availability % | `(available / total vehicles) × 100` |
| Trip Completion Rate | `(completed / total trips) × 100` |
| Net Profit | `Revenue - (Fuel + Maintenance + Expenses)` |

---

## Data Sources (Read-Only)

| Query | Tables read |
|---|---|
| Vehicle counts | `vehicles` |
| Trip counts | `trips` |
| Driver counts | `drivers` |
| Financial metrics | `revenues`, `fuel_logs`, `expenses`, `maintenance_records` |
| Expiring licenses | `drivers` |
| Insights | `drivers` + `trips` + `vehicles` + `fuel_logs` |
| CSV exports | `trips` + `vehicles` + `drivers` + `fuel_logs` + `vehicle_types` + `regions` |

---

## ✅ Completion Checklist

- [x] Dashboard KPIs (fleet, trips, drivers, financials)
- [x] Real-time parallel queries (Promise.all)
- [x] Dashboard filtering by `region_id` and `vehicle_type_id`
- [x] Trip completion rate KPI
- [x] Expiring licenses endpoint (`?days=N`, defaults to 30)
- [x] Already-expired licenses in same response
- [x] Top 5 most active drivers (by completed trips)
- [x] Top 5 most used vehicles (by completed trips)
- [x] Top 5 highest fuel cost vehicles
- [x] CSV export: trips (with filters)
- [x] CSV export: vehicles (with filters)
- [x] CSV export: fuel logs (with filters)
- [x] Safety Officer access to license alerts
- [x] Financial Analyst access to CSV exports