> ⚠️ **Note:** Do not implement frontend for this layer.

# TransitOps Architecture

# Layer 3 — Operations & Workflow Layer

## Purpose

The Operations Layer is the heart of TransitOps.

It executes all business workflows by orchestrating multiple modules from lower layers.

Unlike Layer 1 (Master Data) and Layer 2 (Fleet Availability), this layer contains **business processes**, **state transitions**, and **business rule enforcement**.

Every operational action performed by a user is executed through this layer.

---

# Position in Architecture

```
Presentation Layer
        │
API Layer
        │
────────────────────────────
Layer 3 - Operations
────────────────────────────
        │
Layer 2 - Fleet Availability
        │
Layer 1 - Master Data
        │
Layer 0 - Foundation
```

---

# Responsibilities

- Trip Creation
- Trip Dispatch
- Trip Completion
- Trip Cancellation
- Vehicle Assignment
- Driver Assignment
- Workflow Execution
- Business Rule Validation
- Operational Status Updates

---

# Core Modules

```
Operations

│
├── Trip Management
├── Dispatch Workflow
├── Completion Workflow
├── Cancellation Workflow
├── Assignment Engine
├── Workflow Engine
└── Business Rule Engine
```

---

# Trip Management

Purpose

Manage the complete lifecycle of transport trips.

---

## Trip Lifecycle

```
Draft

↓

Dispatched

↓

Completed
```

Alternative path

```
Draft

↓

Cancelled
```

Only valid transitions are allowed.

---

# Trip Entity

```
Trip ID

Trip Number

Source

Destination

Vehicle

Driver

Cargo Weight

Planned Distance

Actual Distance

Start Time

End Time

Status

Created By

Created At
```

---

# Trip Status

```
Draft

Dispatched

Completed

Cancelled
```

---

# Assignment Engine

Purpose

Assign available resources to a trip.

Resources

```
Vehicle

Driver
```

Assignment Process

```
Create Trip

↓

Find Available Vehicle

↓

Find Available Driver

↓

Validate Capacity

↓

Reserve Resources

↓

Save Trip
```

---

# Workflow Engine

Coordinates every business process.

Available workflows

```
Create Trip

Dispatch Trip

Complete Trip

Cancel Trip
```

Each workflow is independent.

---

# Workflow 1 — Create Trip

```
Receive Request

↓

Validate Input

↓

Check Vehicle Exists

↓

Check Driver Exists

↓

Validate Cargo Weight

↓

Create Draft Trip

↓

Return Trip
```

No resource status changes occur.

---

# Workflow 2 — Dispatch Trip

```
Draft Trip

↓

Check Vehicle Available

↓

Check Driver Available

↓

Validate License

↓

Validate Capacity

↓

Reserve Vehicle

↓

Reserve Driver

↓

Update Vehicle Status

↓

Update Driver Status

↓

Change Trip Status

↓

Dispatched
```

---

# Workflow 3 — Complete Trip

```
Trip Completed

↓

Enter Final Odometer

↓

Enter Fuel Consumed

↓

Update Trip Distance

↓

Release Vehicle

↓

Release Driver

↓

Vehicle Available

↓

Driver Available

↓

Trip Completed
```

---

# Workflow 4 — Cancel Trip

```
Cancel Request

↓

Check Status

↓

Release Vehicle

↓

Release Driver

↓

Trip Cancelled
```

---

# Business Rule Engine

Centralized validation.

Rules

---

## Vehicle Rules

```
Vehicle Exists

Vehicle Available

Vehicle Not Retired

Vehicle Not In Shop

Vehicle Capacity Valid
```

---

## Driver Rules

```
Driver Exists

Driver Available

License Valid

Driver Not Suspended

Driver Not Off Duty
```

---

## Trip Rules

```
Source Required

Destination Required

Cargo Weight Required

Distance Required
```

---

## Capacity Rule

```
Cargo Weight

≤

Vehicle Maximum Capacity
```

Otherwise

```
Reject Dispatch
```

---

## License Rule

```
Current Date

<

License Expiry
```

Otherwise

```
Reject Dispatch
```

---

## Duplicate Assignment Rule

Vehicle

```
One Vehicle

↓

One Active Trip
```

Driver

```
One Driver

↓

One Active Trip
```

---

# Folder Structure

```
src/

operations/

├── trips/
│   ├── trip.controller.js
│   ├── trip.service.js
│   ├── trip.repository.js
│   ├── trip.validator.js
│   ├── trip.routes.js
│   └── trip.model.js
│
├── workflows/
│   ├── createTrip.workflow.js
│   ├── dispatchTrip.workflow.js
│   ├── completeTrip.workflow.js
│   └── cancelTrip.workflow.js
│
├── assignment/
│
└── rules/
```

---

# API Endpoints

```
GET /trips

GET /trips/:id

POST /trips

PUT /trips/:id

DELETE /trips/:id
```

Workflow APIs

```
POST /trips/:id/dispatch

POST /trips/:id/complete

POST /trips/:id/cancel
```

---

# Database Tables

```
trips
```

Relationships

```
Trip

↓

Vehicle

↓

Driver
```

---

# Request Flow

```
Dispatcher

↓

Trip Controller

↓

Trip Service

↓

Dispatch Workflow

↓

Business Rules

↓

Availability Layer

↓

Repository

↓

Database
```

---

# Interaction With Other Layers

Uses

```
Layer 0

Authentication

RBAC

Validation
```

Uses

```
Layer 1

Vehicles

Drivers
```

Uses

```
Layer 2

Availability Service

Reservation

Release
```

Provides

```
Layer 4

Maintenance

Layer 5

Finance

Layer 6

Analytics
```

---

# What This Layer Cannot Do

❌ Perform Maintenance

❌ Record Fuel Logs

❌ Record Expenses

❌ Generate Reports

❌ Dashboard KPIs

Those belong to higher layers.

---

# Design Principles

- Workflow Driven
- Business Rules Centralized
- Thin Controllers
- Reusable Workflows
- Transaction Safe
- Layered Architecture
- Separation of Concerns

---

# Deliverables

Layer 3 is complete when

- Trip CRUD implemented
- Trip lifecycle implemented
- Dispatch workflow implemented
- Completion workflow implemented
- Cancellation workflow implemented
- Assignment engine implemented
- Business rule engine implemented
- Status transitions implemented
- Transaction rollback implemented