> ⚠️ **Note:** Do not implement frontend for this layer.

# TransitOps Architecture

# Layer 4 — Maintenance Management Layer

## Purpose

The Maintenance Management Layer is responsible for managing the complete lifecycle of vehicle maintenance.

Its objective is to ensure that vehicles remain operational, safe, and compliant by recording maintenance activities and controlling workshop operations.

This layer automatically affects vehicle availability through Layer 2.

It **does not** manage trips, fuel logs, expenses, or analytics.

---

# Position in Architecture

```
Presentation Layer
        │
API Layer
        │
────────────────────────────
Layer 4 - Maintenance
────────────────────────────
        │
Layer 3 - Operations
        │
Layer 2 - Fleet Availability
        │
Layer 1 - Master Data
        │
Layer 0 - Foundation
```

---

# Responsibilities

- Create Maintenance Record
- Schedule Maintenance
- Track Maintenance Progress
- Close Maintenance
- Update Vehicle Availability
- Maintain Service History
- Calculate Maintenance Cost
- Track Workshop Status

---

# Core Modules

```
Maintenance

│
├── Maintenance Records
├── Maintenance Workflow
├── Workshop Management
├── Service History
├── Maintenance Rules
└── Cost Tracking
```

---

# Maintenance Record

Purpose

Maintain complete maintenance information for every vehicle.

---

## Attributes

```
Maintenance ID

Vehicle ID

Maintenance Type

Description

Workshop Name

Technician

Start Date

Expected Completion Date

Completed Date

Estimated Cost

Actual Cost

Status

Remarks
```

---

# Maintenance Types

```
Oil Change

Engine Service

Brake Service

Tyre Replacement

Battery Replacement

Insurance Inspection

General Service

Accidental Repair
```

---

# Maintenance Status

```
Scheduled

In Progress

Completed

Cancelled
```

---

# Maintenance Workflow

## Workflow 1 — Create Maintenance

```
Create Request

↓

Validate Vehicle

↓

Check Vehicle Exists

↓

Check Active Maintenance

↓

Create Maintenance Record

↓

Change Vehicle Status

↓

In Shop
```

Vehicle immediately becomes unavailable.

---

## Workflow 2 — Start Maintenance

```
Scheduled

↓

Assign Workshop

↓

Assign Technician

↓

Start Work

↓

Status

↓

In Progress
```

---

## Workflow 3 — Complete Maintenance

```
Maintenance Completed

↓

Enter Final Cost

↓

Enter Completion Date

↓

Update Service History

↓

Vehicle Available

↓

Close Maintenance
```

---

## Workflow 4 — Cancel Maintenance

```
Cancel Request

↓

Maintenance Cancelled

↓

Vehicle Available
```

---

# Maintenance Rules

---

## Rule 1

One vehicle

↓

One active maintenance

```
Vehicle

↓

Only One Active Record
```

---

## Rule 2

Vehicle under maintenance

↓

Cannot Dispatch

---

## Rule 3

Completed maintenance

↓

Vehicle becomes Available

Unless

```
Vehicle

↓

Retired
```

---

## Rule 4

Cancelled maintenance

↓

Restore Previous Status

---

## Rule 5

Maintenance cost

```
>= 0
```

---

# Workshop Management

Purpose

Manage where maintenance is performed.

---

## Workshop Attributes

```
Workshop ID

Workshop Name

Address

Contact Number

Manager

Status
```

---

# Technician

Optional module.

Attributes

```
Technician ID

Name

Phone

Specialization
```

---

# Service History

Every completed maintenance generates a permanent service history.

History contains

```
Vehicle

↓

Maintenance Type

↓

Date

↓

Cost

↓

Technician

↓

Workshop
```

History cannot be modified after completion.

---

# Cost Tracking

Every maintenance records

```
Estimated Cost

Actual Cost

Difference
```

Finance Layer will consume these values.

---

# Folder Structure

```
src/

maintenance/

├── maintenance.controller.js
├── maintenance.service.js
├── maintenance.repository.js
├── maintenance.validator.js
├── maintenance.routes.js
├── maintenance.model.js
│
├── workflow/
│   ├── createMaintenance.workflow.js
│   ├── startMaintenance.workflow.js
│   ├── completeMaintenance.workflow.js
│   └── cancelMaintenance.workflow.js
│
├── workshop/
│
├── technician/
│
└── rules/
```

---

# API Endpoints

```
GET /maintenance

GET /maintenance/:id

POST /maintenance

PUT /maintenance/:id

DELETE /maintenance/:id
```

Workflow APIs

```
POST /maintenance/:id/start

POST /maintenance/:id/complete

POST /maintenance/:id/cancel
```

---

# Database Tables

```
maintenance

maintenance_history

workshops

technicians
```

Relationships

```
Vehicle

↓

Maintenance

↓

Workshop

↓

Technician
```

---

# Request Flow

```
Fleet Manager

↓

Maintenance Controller

↓

Maintenance Service

↓

Maintenance Workflow

↓

Maintenance Rules

↓

Fleet Availability Layer

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

Validation

RBAC
```

Uses

```
Layer 1

Vehicle Master Data
```

Uses

```
Layer 2

Vehicle Availability

Status Update
```

Provides

```
Layer 5

Maintenance Cost

Layer 6

Maintenance Statistics
```

---

# What This Layer Cannot Do

❌ Create Trips

❌ Dispatch Trips

❌ Record Fuel

❌ Record Expenses

❌ Generate Dashboard

Those belong to other layers.

---

# Design Principles

- Vehicle Safety First
- One Active Maintenance Per Vehicle
- Immutable Service History
- Automatic Availability Control
- Centralized Workflow
- Transaction Safe
- Cost Traceability

---

# Deliverables

Layer 4 is complete when

- Maintenance CRUD implemented
- Maintenance lifecycle implemented
- Workshop management implemented
- Service history implemented
- Maintenance rule engine implemented
- Vehicle availability integration completed
- Cost tracking implemented
- Status transitions implemented