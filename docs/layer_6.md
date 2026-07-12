> ⚠️ **Note:** Do not implement frontend for this layer.

# TransitOps Architecture

# Layer 6 — Analytics & Reporting Layer

## Purpose

The Analytics & Reporting Layer is the presentation layer for operational intelligence.

It consolidates data from all lower layers to provide real-time KPIs, dashboards, charts, reports, and business insights.

This layer is **read-only**.

It never creates, updates, or deletes business data.

---

# Position in Architecture

```
Presentation Layer

↓

────────────────────────────
Layer 6 - Analytics & Reporting
────────────────────────────

↓

Layer 5 - Financial Management

↓

Layer 4 - Maintenance

↓

Layer 3 - Operations

↓

Layer 2 - Fleet Availability

↓

Layer 1 - Master Data

↓

Layer 0 - Foundation
```

---

# Responsibilities

- Dashboard
- KPIs
- Charts
- Reports
- Fleet Utilization
- Fuel Efficiency
- Operational Cost Analysis
- ROI Analysis
- Vehicle Performance
- Driver Performance
- CSV Export
- PDF Export (Optional)

No business logic.

No workflow execution.

---

# Core Modules

```
Analytics

│
├── Dashboard
├── KPI Engine
├── Charts
├── Reports
├── Export Engine
└── Insights
```

---

# Dashboard

Purpose

Provide a real-time overview of transport operations.

---

## Dashboard Cards

```
Active Vehicles

Available Vehicles

Vehicles In Maintenance

Active Trips

Pending Trips

Completed Trips

Available Drivers

Drivers On Trip

Fleet Utilization

Total Operational Cost

Fuel Efficiency

Vehicle ROI
```

---

# KPI Engine

Purpose

Calculate operational metrics.

---

## Fleet KPIs

```
Fleet Utilization %

Vehicle Availability %

Maintenance Rate

Trip Completion Rate
```

---

## Financial KPIs

```
Total Fuel Cost

Total Maintenance Cost

Total Expenses

Revenue

Profit

Vehicle ROI
```

---

## Driver KPIs

```
Trips Completed

Safety Score

License Expiry

Average Distance
```

---

# Fleet Utilization

Formula

```
Fleet Utilization

=

Vehicles On Trip

------------------------

Total Active Vehicles

×

100
```

---

# Fuel Efficiency

Formula

```
Distance

/

Fuel Consumed
```

Example

```
800 KM

/

50 L

=

16 KM/L
```

---

# Vehicle ROI

Formula

```
Revenue

-

(Fuel

+

Maintenance

+

Expenses)

------------------------

Acquisition Cost
```

---

# Charts

Purpose

Visualize operational data.

---

## Supported Charts

```
Line Chart

Bar Chart

Pie Chart

Area Chart

Doughnut Chart
```

---

## Dashboard Charts

```
Trips Per Day

Fuel Cost Trend

Maintenance Cost Trend

Revenue Trend

Vehicle Utilization

Expense Breakdown

Driver Performance

Vehicle Status Distribution
```

---

# Reports

Purpose

Generate printable business reports.

---

## Available Reports

```
Vehicle Report

Driver Report

Trip Report

Maintenance Report

Fuel Report

Expense Report

Financial Summary

Fleet Summary
```

---

# Filters

All reports support

```
Date Range

Vehicle

Driver

Region

Trip Status

Vehicle Type
```

---

# Export Engine

Purpose

Export report data.

Supported formats

```
CSV

PDF (Optional)
```

---

# Insights Engine

Purpose

Generate quick business insights.

Examples

```
Most Used Vehicle

Highest Fuel Cost Vehicle

Lowest Fuel Efficiency

Most Active Driver

Vehicle With Highest ROI

Vehicle With Highest Maintenance Cost
```

---

# Folder Structure

```
src/

analytics/

├── dashboard/
│   ├── dashboard.controller.js
│   ├── dashboard.service.js
│   ├── dashboard.routes.js
│
├── kpi/
│   ├── kpi.engine.js
│
├── charts/
│
├── reports/
│
├── exports/
│   ├── csv.export.js
│   └── pdf.export.js
│
└── insights/
```

---

# API Endpoints

Dashboard

```
GET /dashboard
```

KPIs

```
GET /dashboard/kpis
```

Charts

```
GET /dashboard/charts
```

Reports

```
GET /reports/vehicles

GET /reports/drivers

GET /reports/trips

GET /reports/maintenance

GET /reports/finance
```

Exports

```
GET /reports/export/csv

GET /reports/export/pdf
```

---

# Data Sources

Analytics does not own any data.

It reads from

```
Layer 1

Vehicles

Drivers
```

```
Layer 3

Trips
```

```
Layer 4

Maintenance
```

```
Layer 5

Fuel

Expenses

Revenue
```

---

# Dashboard Flow

```
Dashboard Request

↓

Dashboard Controller

↓

Dashboard Service

↓

KPI Engine

↓

Repositories

↓

Aggregate Data

↓

Response
```

---

# Business Rules

## Rule 1

Dashboard

```
Read Only
```

---

## Rule 2

Reports

```
Never Modify Data
```

---

## Rule 3

Analytics

```
Always Use Latest Data
```

---

## Rule 4

Export

```
Uses Filtered Data
```

---

# Performance Strategy

To keep dashboard fast

```
Parallel Queries

↓

Aggregate Results

↓

Return Single Response
```

Future optimization

```
Redis Cache

Materialized Views

Background Scheduler
```

(Not required for the hackathon.)

---

# Dependencies

Uses

```
Layer 0

Authentication

RBAC
```

Uses

```
Layer 1

Master Data
```

Uses

```
Layer 3

Trip Data
```

Uses

```
Layer 4

Maintenance Data
```

Uses

```
Layer 5

Financial Data
```

Provides

```
Dashboard

Reports

Charts

Business Insights
```

---

# What This Layer Cannot Do

❌ Create Vehicle

❌ Register Driver

❌ Dispatch Trip

❌ Complete Trip

❌ Create Maintenance

❌ Record Fuel

❌ Record Expense

❌ Change Vehicle Status

Analytics is completely read-only.

---

# Design Principles

- Read-Only Layer
- Real-Time Metrics
- High Performance
- Modular Report Generation
- Reusable KPI Engine
- Export Friendly
- Business Intelligence Focus

---

# Deliverables

Layer 6 is complete when

- Dashboard implemented
- KPI engine implemented
- Charts implemented
- Reports implemented
- CSV export implemented
- PDF export (optional) implemented
- Filters implemented
- Business insights implemented