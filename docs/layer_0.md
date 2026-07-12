> ⚠️ **Note:** Do not implement frontend for this layer.

# TransitOps Architecture

# Layer 0 — Foundation Layer

## Purpose

The Foundation Layer provides the core infrastructure required by every other layer in the system.

This layer **does not contain any transport business logic** (Vehicles, Trips, Maintenance, Fuel, etc.).

Instead, it provides common services such as authentication, authorization, configuration, logging, validation, database connectivity, and shared utilities.

Every higher layer depends on Layer 0.

---

# Responsibilities

- Initialize application
- Load configuration
- Connect PostgreSQL
- Configure Express
- Register middleware
- Authentication
- Authorization (RBAC)
- Request validation
- Error handling
- Logging
- Security
- Shared utilities

---

# High Level Architecture

```
                Layer 1+
                    │
                    ▼
        ┌─────────────────────┐
        │   Foundation Layer  │
        └─────────────────────┘
                    │
                    ▼
            PostgreSQL Database
```

Every request enters the Foundation Layer before reaching business modules.

---

# Modules

```
Foundation
│
├── Configuration
├── Database
├── Authentication
├── Authorization
├── Middleware
├── Logger
├── Validation
├── Error Handler
├── Shared Utilities
└── Constants
```

---

# Folder Structure

```
src/

├── config/
│   ├── env.js
│   ├── database.js
│   └── app.js
│
├── middleware/
│   ├── auth.middleware.js
│   ├── role.middleware.js
│   ├── validate.middleware.js
│   ├── error.middleware.js
│   └── logger.middleware.js
│
├── auth/
│   ├── auth.controller.js
│   ├── auth.service.js
│   ├── auth.repository.js
│   ├── auth.routes.js
│   └── jwt.js
│
├── common/
│   ├── constants.js
│   ├── enums.js
│   ├── response.js
│   ├── exceptions.js
│   ├── logger.js
│   ├── helpers.js
│   └── validators.js
│
└── app.js
```

---

# Components

## 1. Configuration

Responsible for

- Environment variables
- Database credentials
- JWT Secret
- SMTP Configuration
- Server Port
- Application Constants

Example

```
PORT

DATABASE_URL

JWT_SECRET

NODE_ENV

SMTP_HOST
```

---

## 2. Database

Responsibilities

- PostgreSQL Connection
- Connection Pool
- Transactions
- Health Check

No business logic.

Only database initialization.

---

## 3. Authentication

Purpose

Verify user identity.

Responsibilities

- Login
- Logout
- Password Hashing
- JWT Generation
- JWT Verification
- Token Refresh (optional)

Output

```
Authenticated User
```

---

## 4. Authorization (RBAC)

Purpose

Determine what a user can access.

Roles

```
Admin

Fleet Manager

Dispatcher

Safety Officer

Financial Analyst
```

Permissions example

```
Fleet Manager

✓ Vehicles

✓ Maintenance

✗ Users
```

```
Dispatcher

✓ Trips

✓ Drivers

✗ Expenses
```

---

## 5. Middleware

Global middleware.

Includes

```
Authentication

Authorization

Validation

Logger

Error Handler

CORS

Helmet

Compression
```

Every request flows through middleware.

```
Request

↓

Authentication

↓

Authorization

↓

Validation

↓

Controller
```

---

## 6. Logger

Purpose

Capture application activity.

Log Levels

```
INFO

WARNING

ERROR

DEBUG
```

Example

```
User Login

Trip Created

Maintenance Completed

Database Error
```

---

## 7. Validation

Centralized validation.

Examples

```
Email Format

Phone Number

UUID

Date

Required Fields

Numeric Range
```

Business validation belongs to higher layers.

Layer 0 only validates request format.

---

## 8. Error Handling

Global exception handler.

Standard Response

```json
{
    "success": false,
    "message": "...",
    "errorCode": "...",
    "timestamp": "...",
    "path": "..."
}
```

---

## 9. Shared Utilities

Contains reusable functions.

Examples

```
Date Formatter

Response Builder

Pagination

UUID Generator

File Helper

CSV Helper
```

No business-specific utilities.

---

# Request Flow

```
Client Request

↓

Express

↓

Logger Middleware

↓

Authentication Middleware

↓

Authorization Middleware

↓

Validation Middleware

↓

Controller

↓

Business Layer

↓

Repository

↓

PostgreSQL

↓

Response Builder

↓

Client
```

---

# Database Tables (Layer 0)

Only security-related tables belong here.

```
users

roles

user_roles
```

Transport-related tables belong to higher layers.

---

# Exposed Services

Layer 0 provides the following reusable services.

```
Authenticate User

Authorize Role

Validate Request

Generate JWT

Verify JWT

Log Event

Create Response

Database Connection
```

---

# Dependencies

Layer 0 depends on

- Node.js
- Express.js
- PostgreSQL
- JWT
- bcrypt
- dotenv

---

# Layers Using Layer 0

```
Layer 1

Layer 2

Layer 3

Layer 4

Layer 5

Layer 6
```

Every layer depends on Layer 0.

Layer 0 depends on none.

---

# Design Principles

- Single Responsibility Principle
- Dependency Injection where practical
- Stateless Authentication
- Centralized Error Handling
- Modular Structure
- Reusable Components
- Security First
- No Business Logic
- Common Services Only

---

# Deliverables

Layer 0 is considered complete when:

- PostgreSQL connection established
- JWT authentication working
- RBAC middleware working
- Logger implemented
- Global error handler implemented
- Validation middleware implemented
- Environment configuration loaded
- Express server running successfully