> ⚠️ **Note:** No frontend. API-only backend platform.

# TransitOps — Layer 0: Foundation Layer

**Status: ✅ COMPLETE**

## Purpose

Layer 0 is the bedrock of the entire platform. It provides authentication, authorization, validation, error handling, logging, and the shared utility patterns used by every module in Layers 1–6.

**This layer has zero business logic.** No vehicles, no trips, no fuel — only infrastructure.

---

## What Was Built

### Actual Folder Structure

```
src/
├── app.js                        ← Express app entry point, registers all routes
│
├── config/
│   ├── env.js                    ← Loads .env variables (PORT, DATABASE_URL, JWT_SECRET, NODE_ENV)
│   └── database.js               ← pg Pool connection — shared by all repositories
│
├── auth/
│   ├── auth.controller.js        ← Login / Register / Me handlers
│   ├── auth.service.js           ← Password hashing (bcrypt), JWT generation/verification
│   ├── auth.repository.js        ← Queries the `users` table
│   └── auth.routes.js            ← POST /api/auth/login, /register, GET /me
│
├── middleware/
│   ├── auth.middleware.js        ← Verifies JWT Bearer token, attaches req.user
│   ├── role.middleware.js        ← RBAC role guard (variadic roles: roleMiddleware(ROLES.ADMIN, ...))
│   ├── validate.middleware.js    ← Zod schema validator (validates body + query + params)
│   ├── error.middleware.js       ← Global error handler — standardizes all error responses
│   └── logger.middleware.js      ← Logs method, URL, status, response time on every request
│
└── common/
    ├── base.repository.js        ← BaseRepository class — generic findById/findAll/insert/update/softDelete
    ├── catch-async.js            ← Shared (fn) => (req, res, next) wrapper for all controllers
    ├── constants.js              ← ROLES, VEHICLE_STATUS, DRIVER_STATUS, TRIP_STATUS enums
    ├── exceptions.js             ← AppError, NotFoundError, ValidationError (extend Error)
    ├── response.js               ← sendSuccess() and sendPaginatedSuccess() helpers
    └── schemas.js                ← Shared Zod schemas: idParam, pagination
```

---

## Authentication Flow

```
POST /api/auth/login
        ↓
auth.controller → auth.service
        ↓
bcrypt.compare(password, hash)
        ↓
jwt.sign({ id, email, role })
        ↓
Returns: { token, user }
```

**On every subsequent request:**
```
Request
    ↓
auth.middleware (reads Authorization: Bearer <token>)
    ↓
jwt.verify(token, JWT_SECRET)
    ↓
Attaches req.user = { id, email, role }
    ↓
role.middleware (checks req.user.role against allowed roles)
```

---

## RBAC Roles

| Role | Constant |
|---|---|
| Admin | `ROLES.ADMIN` |
| Fleet Manager | `ROLES.FLEET_MANAGER` |
| Dispatcher | `ROLES.DISPATCHER` |
| Safety Officer | `ROLES.SAFETY_OFFICER` |
| Financial Analyst | `ROLES.FINANCIAL_ANALYST` |

---

## Shared Utilities

### `BaseRepository` — used by ALL repositories

```javascript
class BaseRepository {
  constructor(table) { this.table = table; }
  findById(id)          // SELECT WHERE id AND is_deleted = false
  findAll(limit, offset, conditions, params)  // paginated SELECT
  findOneWhere(cond, params)   // single-row conditional SELECT
  insert(columns, values)     // INSERT ... RETURNING *
  update(id, data)             // dynamic SET, skips undefined fields
  softDelete(id)               // SET is_deleted = true
}
```

### `catchAsync` — used by ALL controllers

```javascript
module.exports = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
```

### Error Response Format

```json
{
  "success": false,
  "message": "Descriptive error message",
  "statusCode": 400
}
```

### Success Response Format

```json
{
  "success": true,
  "message": "Resource created",
  "data": { ... }
}
```

### Paginated Response Format

```json
{
  "success": true,
  "data": [...],
  "pagination": { "total": 45, "page": 2, "limit": 10, "totalPages": 5 }
}
```

---

## Security

| Feature | Implementation |
|---|---|
| Helmet | `helmet()` — sets 15+ security headers |
| CORS | `cors()` — allows cross-origin requests |
| Compression | `compression()` — gzip all responses |
| Rate Limiting | `express-rate-limit` — 10 requests/15min on `/api/auth` |
| Password Hashing | `bcrypt` (salt rounds = 10) |
| JWT | RS256 secret, stored in env variable |

---

## Database

- **Driver:** `pg` (raw queries, no ORM)
- **Connection:** `Pool` singleton exported from `config/database.js`
- **Tables (Layer 0):** `users (id, email, password_hash, role, full_name, created_at)`

---

## API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | ❌ | Login → returns JWT token |
| POST | `/api/auth/register` | ❌ | Register new user |
| GET | `/api/auth/me` | ✅ | Get current user info |
| GET | `/health` | ❌ | Server + DB health check |

---

## Dependencies

```json
{
  "express": "^5.2.1",
  "pg": "^8.22.0",
  "jsonwebtoken": "^9.0.3",
  "bcrypt": "^6.0.0",
  "zod": "^4.4.3",
  "helmet": "^8.3.0",
  "cors": "^2.8.6",
  "compression": "^1.8.1",
  "express-rate-limit": "^8.5.2",
  "dotenv": "^17.4.2"
}
```

---

## ✅ Completion Checklist

- [x] PostgreSQL connection (pg Pool) established
- [x] JWT authentication working (login + verify)
- [x] RBAC middleware working (5 roles)
- [x] Rate limiting on auth routes
- [x] Global error handler (all errors → standard JSON)
- [x] Zod validation middleware
- [x] Request logger middleware
- [x] BaseRepository shared utility
- [x] Shared catchAsync, response helpers, schemas
- [x] Express server running successfully