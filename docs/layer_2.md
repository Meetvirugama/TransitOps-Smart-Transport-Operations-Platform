> ⚠️ **Note:** Do not implement frontend for this layer.

# TransitOps Architecture

# Layer 2 — Fleet Availability Layer

## Purpose

The Fleet Availability Layer is responsible for managing the real-time operational state of fleet resources.

Unlike Layer 1, which stores master records, this layer determines whether a vehicle or driver is currently available for business operations.

Every workflow (Trip, Maintenance, Finance, Analytics) depends on this layer to know the current availability of resources.

---

# Position in Architecture

```
Presentation Layer
        │
API Layer
        │
Business Layer
        │
────────────────────────────
Layer 3 - Operations
────────────────────────────
        │
────────────────────────────
Layer 2 - Fleet Availability
────────────────────────────
        │
────────────────────────────
Layer 1 - Master Data
────────────────────────────
        │
Layer 0 - Foundation
```

Layer 2 sits between Master Data and all business workflows.

---

# Responsibilities

- Track Vehicle Availability
- Track Driver Availability
- Maintain Current Operational Status
- Prevent Resource Conflicts
- Allocate Resources
- Release Resources
- Availability Validation
- Fleet State Queries

No trip creation.

No maintenance records.

No fuel logging.

Only resource state.

---

# Core Modules

```
Fleet Availability

│
├── Vehicle State
├── Driver State
├── Resource Allocation
├── Availability Service
└── Fleet Status
```

---

# Vehicle State

Purpose

Maintain the current operational state of every vehicle.

---

## Vehicle Status

```
Available

On Trip

In Shop

Retired
```

Only one active status is allowed.

---

## Allowed Operations

```
Reserve Vehicle

Release Vehicle

Mark In Shop

Retire Vehicle

Restore Vehicle
```

---

## Validation Rules

Vehicle cannot

- Be reserved twice
- Be dispatched if retired
- Be dispatched if in shop
- Be dispatched if already on trip

---

# Driver State

Purpose

Maintain current driver availability.

---

## Driver Status

```
Available

On Trip

Off Duty

Suspended
```

---

## Allowed Operations

```
Reserve Driver

Release Driver

Suspend Driver

Resume Driver

Mark Off Duty
```

---

## Validation Rules

Driver cannot

- Drive two trips simultaneously
- Drive with expired license
- Drive while suspended
- Drive while off duty

---

# Resource Allocation

Purpose

Temporarily reserve resources before a workflow begins.

Example

```
Vehicle

↓

Reserve

↓

Locked

↓

Trip Starts

↓

On Trip
```

If workflow fails

```
Reserve

↓

Rollback

↓

Available
```

This prevents race conditions.

---

# Availability Service

Provides reusable APIs for higher layers.

Example

```
isVehicleAvailable()

isDriverAvailable()

reserveVehicle()

reserveDriver()

releaseVehicle()

releaseDriver()
```

No workflow logic exists here.

---

# Fleet Status Service

Provides fleet statistics.

Examples

```
Available Vehicles

Vehicles On Trip

Vehicles In Shop

Available Drivers

Drivers On Trip

Suspended Drivers
```

Dashboard uses these services.

---

# Folder Structure

```
src/

fleet/

├── availability/
│   ├── availability.controller.js
│   ├── availability.service.js
│   ├── availability.repository.js
│   ├── availability.validator.js
│   └── availability.routes.js
│
├── vehicle-state/
│
├── driver-state/
│
└── allocation/
```

---

# API Endpoints

```
GET /fleet/status

GET /fleet/available-vehicles

GET /fleet/available-drivers

POST /fleet/reserve-vehicle

POST /fleet/release-vehicle

POST /fleet/reserve-driver

POST /fleet/release-driver
```

---

# Database

No new master tables.

Layer 2 updates operational fields inside Layer 1 entities.

Example

Vehicle

```
vehicle_id

status

allocated_at

updated_at
```

Driver

```
driver_id

status

updated_at
```

---

# State Transition

Vehicle

```
Available

↓

Reserved

↓

On Trip

↓

Available
```

Maintenance

```
Available

↓

In Shop

↓

Available
```

Retirement

```
Available

↓

Retired
```

---

# Validation Flow

Example

Trip requests vehicle.

```
Trip Workflow

↓

Availability Service

↓

Vehicle Status

↓

Available ?

↓

Yes

↓

Reserve Vehicle
```

If status

```
On Trip

In Shop

Retired
```

Request fails.

---

# Data Flow

```
Trip Workflow

↓

Availability Service

↓

Vehicle Repository

↓

Driver Repository

↓

Update Status

↓

Return Result
```

---

# Exposed Services

```
getAvailableVehicles()

getAvailableDrivers()

reserveVehicle()

releaseVehicle()

reserveDriver()

releaseDriver()

changeVehicleStatus()

changeDriverStatus()

getFleetStatistics()
```

---

# Dependencies

Depends On

- Layer 0 (Authentication, Validation)
- Layer 1 (Vehicle, Driver Master Data)

Used By

- Layer 3 (Trip Operations)
- Layer 4 (Maintenance)
- Layer 5 (Finance)
- Layer 6 (Analytics)

---

# What This Layer Cannot Do

❌ Create Trip

❌ Complete Trip

❌ Create Maintenance Record

❌ Add Fuel Log

❌ Add Expense

❌ Calculate ROI

❌ Dashboard Charts

Those responsibilities belong to higher layers.

---

# Design Principles

- Single Responsibility
- Resource Availability Only
- Centralized State Management
- Conflict Prevention
- No Business Workflow
- Transaction Safe
- Reusable Services

---

# Deliverables

Layer 2 is complete when

- Vehicle availability tracking implemented
- Driver availability tracking implemented
- Resource reservation implemented
- Resource release implemented
- Status transition service implemented
- Fleet status APIs implemented
- Availability validation implemented
- Fleet statistics service implemented