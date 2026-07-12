> ⚠️ **Note:** Do not implement frontend for this layer.

# TransitOps Architecture

# Layer 1 — Master Data Layer (Fleet Foundation)

## Purpose

The Master Data Layer is responsible for managing all core business entities that serve as the foundation of the transport management system.

This layer only manages **master records**.

It **does not** execute business workflows such as trip dispatching, maintenance, fuel logging, or analytics.

Its primary responsibility is to ensure that all foundational business data is accurate, validated, and available for higher layers.

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
Layer 1 - Master Data
────────────────────────────
        │
Layer 0 - Foundation
        │
PostgreSQL
```

Higher layers only read or update master records through this layer.

---

# Responsibilities

- Vehicle Registration
- Driver Registration
- Vehicle Types
- Regions
- License Categories
- User Profiles
- CRUD Operations
- Search
- Filtering
- Pagination
- Soft Delete
- Data Validation

No workflows are executed here.

---

# Domain Modules

```
Master Data

│
├── Vehicles
├── Drivers
├── Vehicle Types
├── License Categories
├── Regions
├── Departments (Optional)
└── User Profile
```

---

# Folder Structure

```
src/

modules/

├── vehicles/
│   ├── vehicle.controller.js
│   ├── vehicle.service.js
│   ├── vehicle.repository.js
│   ├── vehicle.validator.js
│   ├── vehicle.routes.js
│   └── vehicle.model.js
│
├── drivers/
│
├── vehicle-types/
│
├── license-categories/
│
├── regions/
│
└── profile/
```

Every module follows the same architecture.

```
Controller

↓

Service

↓

Repository

↓

Database
```

---

# Vehicle Module

## Purpose

Maintain vehicle master records.

No trip assignment.

No maintenance workflow.

No fuel calculations.

---

## Vehicle Attributes

```
Vehicle ID

Registration Number

Vehicle Name

Vehicle Model

Vehicle Type

Maximum Capacity

Current Odometer

Acquisition Cost

Purchase Date

Status

Region

Description
```

---

## Validation Rules

Registration Number

- Required
- Unique

Maximum Capacity

- Greater than 0

Acquisition Cost

- Greater than or equal to 0

Odometer

- Cannot be negative

Vehicle Name

- Required

Vehicle Type

- Must exist

---

## CRUD Operations

```
Create Vehicle

Update Vehicle

View Vehicle

Search Vehicle

Delete Vehicle (Soft Delete)

List Vehicles
```

---

## Status Values

Although status is stored here,
business rules cannot modify it.

Allowed values

```
Available

On Trip

In Shop

Retired
```

Only Layer 2 and Layer 3 may change status.

Layer 1 only stores it.

---

# Driver Module

## Purpose

Maintain driver information.

---

## Driver Attributes

```
Driver ID

Full Name

License Number

License Category

License Expiry Date

Phone Number

Email

Safety Score

Status

Address

Joining Date
```

---

## Validation Rules

License Number

- Required
- Unique

License Expiry

- Required

Phone

- Valid format

Email

- Valid format

License Category

- Must exist

Safety Score

```
0 - 100
```

---

## CRUD Operations

```
Register Driver

Update Driver

Delete Driver

Search Driver

View Driver

List Drivers
```

---

## Driver Status

```
Available

On Trip

Off Duty

Suspended
```

Only higher layers modify status.

---

# Vehicle Type Module

Purpose

Maintain available vehicle categories.

Example

```
Truck

Mini Truck

Van

Pickup

Container

Bike
```

Fields

```
ID

Name

Description

Maximum Default Capacity
```

---

# License Category Module

Purpose

Standardize driver licenses.

Example

```
LMV

HMV

MCWG

Transport

Commercial
```

---

# Region Module

Purpose

Manage operational regions.

Example

```
North

South

East

West

Central
```

Used for

- Dashboard
- Search
- Dispatch
- Reporting

---

# User Profile Module

Stores

```
Employee Name

Role

Phone

Email

Department

Profile Photo
```

Authentication remains in Layer 0.

---

# Repository Layer

Repositories only perform database operations.

```
VehicleRepository

DriverRepository

VehicleTypeRepository

LicenseRepository

RegionRepository
```

No calculations.

No workflows.

---

# Service Layer

Services contain simple business validations.

Example

VehicleService

```
Check Registration Duplicate

↓

Validate Capacity

↓

Save Vehicle
```

DriverService

```
Check License Duplicate

↓

Validate Expiry Date

↓

Save Driver
```

---

# API Endpoints

## Vehicles

```
GET     /vehicles

GET     /vehicles/:id

POST    /vehicles

PUT     /vehicles/:id

DELETE  /vehicles/:id
```

---

## Drivers

```
GET     /drivers

GET     /drivers/:id

POST    /drivers

PUT     /drivers/:id

DELETE  /drivers/:id
```

---

## Vehicle Types

```
GET

POST

PUT

DELETE
```

---

## Regions

```
GET

POST

PUT

DELETE
```

---

# Database Tables

```
vehicles

drivers

vehicle_types

license_categories

regions

profiles
```

Relationships

```
Vehicle

↓

Vehicle Type

↓

Region
```

```
Driver

↓

License Category
```

---

# What This Layer Cannot Do

❌ Assign Driver

❌ Assign Vehicle

❌ Dispatch Trip

❌ Complete Trip

❌ Fuel Entry

❌ Maintenance Entry

❌ Expense Calculation

❌ Dashboard Calculation

Those responsibilities belong to higher layers.

---

# Data Flow

```
Admin

↓

Vehicle Form

↓

Vehicle Controller

↓

Vehicle Service

↓

Vehicle Validator

↓

Vehicle Repository

↓

PostgreSQL
```

---

# Dependencies

Depends On

- Layer 0 (Authentication, RBAC, Validation, Database)

Used By

- Layer 2 (Fleet State)
- Layer 3 (Operations)
- Layer 4 (Maintenance)
- Layer 5 (Finance)
- Layer 6 (Analytics)

---

# Design Principles

- Single Source of Truth
- CRUD Only
- No Workflow Logic
- No Status Transition Logic
- Reusable Master Data
- Strong Validation
- Modular Design

---

# Deliverables

Layer 1 is complete when

- Vehicle CRUD implemented
- Driver CRUD implemented
- Vehicle Type CRUD implemented
- License Category CRUD implemented
- Region CRUD implemented
- User Profile implemented
- Search & Filtering working
- Pagination implemented
- Soft Delete implemented
- Validation implemented