> ⚠️ **Note:** Do not implement frontend for this layer.

# TransitOps Architecture

# Layer 5 — Financial Management Layer

## Purpose

The Financial Management Layer is responsible for recording, tracking, and calculating all operational costs associated with fleet operations.

This layer consolidates fuel consumption, maintenance expenses, toll charges, and other operational costs into a centralized financial system.

Unlike previous layers, this layer focuses on **cost tracking** rather than operational workflows.

---

# Position in Architecture

```
Presentation Layer
        │
API Layer
        │
────────────────────────────
Layer 6 - Analytics
────────────────────────────
        │
────────────────────────────
Layer 5 - Financial Management
────────────────────────────
        │
Layer 4 - Maintenance
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

- Fuel Log Management
- Expense Management
- Operational Cost Calculation
- Revenue Recording
- Vehicle Profitability
- Trip Cost Calculation
- ROI Calculation
- Financial Summary

This layer never changes operational status.

---

# Core Modules

```
Financial Management

│
├── Fuel Management
├── Expense Management
├── Revenue Management
├── Cost Engine
├── ROI Engine
└── Financial Reports
```

---

# Fuel Management

## Purpose

Maintain complete fuel consumption history.

Every fuel refill is recorded.

---

## Fuel Log

```
Fuel Log ID

Vehicle ID

Trip ID (Optional)

Driver ID

Fuel Station

Fuel Quantity (Liters)

Price Per Liter

Total Cost

Odometer Reading

Fuel Date

Remarks
```

---

# Fuel Workflow

```
Vehicle Refuel

↓

Validate Vehicle

↓

Record Fuel

↓

Calculate Total Cost

↓

Save Fuel Log
```

---

# Fuel Validation Rules

Fuel Quantity

```
> 0
```

Price

```
>= 0
```

Vehicle

```
Must Exist
```

Odometer

```
Cannot decrease
```

---

# Expense Management

## Purpose

Track operational expenses other than fuel.

---

# Expense Types

```
Toll

Parking

Repair

Maintenance

Insurance

Fine

Permit

Cleaning

Other
```

---

## Expense Entity

```
Expense ID

Vehicle ID

Trip ID (Optional)

Expense Type

Amount

Expense Date

Description

Created By
```

---

# Expense Workflow

```
Expense Request

↓

Validate Vehicle

↓

Validate Amount

↓

Save Expense

↓

Update Financial Summary
```

---

# Revenue Management

Purpose

Record revenue earned by completed trips.

---

## Revenue Entity

```
Revenue ID

Trip ID

Vehicle ID

Customer

Revenue Amount

Payment Status

Invoice Number

Received Date
```

---

# Cost Engine

Purpose

Automatically calculate operational costs.

---

## Vehicle Cost

```
Fuel Cost

+

Maintenance Cost

+

Operational Expenses

=

Total Vehicle Cost
```

---

## Trip Cost

```
Fuel

+

Expenses

=

Trip Cost
```

---

# Fuel Efficiency Engine

Purpose

Calculate vehicle efficiency.

Formula

```
Fuel Efficiency

=

Distance Travelled

/

Fuel Consumed
```

Example

```
500 KM

/

40 Liters

=

12.5 KM/L
```

---

# ROI Engine

Purpose

Calculate vehicle profitability.

Formula

```
ROI

=

Revenue

-

(Fuel

+

Maintenance

+

Expenses)

-----------------------

Acquisition Cost
```

---

# Financial Summary

Provides

```
Total Fuel Cost

Total Maintenance Cost

Total Expenses

Total Revenue

Total Profit

Vehicle ROI
```

---

# Folder Structure

```
src/

finance/

├── fuel/
│   ├── fuel.controller.js
│   ├── fuel.service.js
│   ├── fuel.repository.js
│   ├── fuel.validator.js
│   ├── fuel.routes.js
│   └── fuel.model.js
│
├── expenses/
│
├── revenue/
│
├── calculator/
│   ├── cost.engine.js
│   ├── roi.engine.js
│   └── efficiency.engine.js
│
└── reports/
```

---

# API Endpoints

Fuel

```
GET /fuel

GET /fuel/:id

POST /fuel

PUT /fuel/:id

DELETE /fuel/:id
```

Expenses

```
GET /expenses

POST /expenses

PUT /expenses/:id

DELETE /expenses/:id
```

Revenue

```
GET /revenue

POST /revenue

PUT /revenue/:id
```

Financial Summary

```
GET /finance/summary

GET /finance/vehicle/:id

GET /finance/trip/:id
```

---

# Database Tables

```
fuel_logs

expenses

revenues
```

Relationships

```
Vehicle

↓

Fuel Logs

↓

Expenses

↓

Revenue
```

---

# Request Flow

```
Financial Analyst

↓

Finance Controller

↓

Finance Service

↓

Cost Engine

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

Vehicle

Driver
```

Uses

```
Layer 3

Trip Information
```

Uses

```
Layer 4

Maintenance Cost
```

Provides

```
Layer 6

Financial KPIs

Cost Statistics

ROI

Fuel Efficiency
```

---

# Business Rules

## Rule 1

Fuel Quantity

```
Must Be Positive
```

---

## Rule 2

Expense Amount

```
Cannot Be Negative
```

---

## Rule 3

Revenue

```
Only Completed Trips
```

---

## Rule 4

Fuel Efficiency

```
Distance > 0

Fuel > 0
```

---

## Rule 5

Vehicle ROI

Requires

```
Revenue

Fuel Cost

Maintenance Cost

Acquisition Cost
```

---

# What This Layer Cannot Do

❌ Dispatch Trip

❌ Assign Driver

❌ Change Vehicle Status

❌ Start Maintenance

❌ Generate Dashboard Charts

Those responsibilities belong to other layers.

---

# Design Principles

- Financial Data Integrity
- Immutable Transaction Records
- Automatic Cost Calculation
- Reusable Calculation Engine
- Audit Friendly
- Readable Financial History

---

# Deliverables

Layer 5 is complete when

- Fuel Log CRUD implemented
- Expense CRUD implemented
- Revenue CRUD implemented
- Cost Engine implemented
- Fuel Efficiency calculation implemented
- ROI Engine implemented
- Financial Summary APIs implemented
- Financial validation implemented