# NourishLink — API Specification

> **Version:** 1.0
> **Last Updated:** 2026-06-03
> **Status:** Active
> **Base URL:** `/api`
> **Format:** REST/JSON
> **Auth:** JWT Bearer (except `/auth/register`, `/auth/login`, public reads)
> **Stack:** Next.js 16 API Routes & Server Actions

---

## 1. Document Purpose

Defines every HTTP endpoint and Server Action exposed by the NourishLink application: paths, methods, request/response schemas, status codes, and error formats. This is the **contract** between the frontend components and the server layer.

For requirements traceability: see [`requirements.md`](./requirements.md).
For data shapes: see [`database-design.md`](./database-design.md).
For auth details: see [`authentication-flow.md`](./authentication-flow.md).

---

## 2. Conventions

### 2.1 Implementation Strategy
- **Server Actions:** Preferred for data mutations (POST, PATCH, DELETE) from the web UI.
- **API Routes:** Used for data fetching (GET) where RSCs aren't suitable, and for potential external integrations.

### 2.2 Content Type
- Request: `application/json; charset=utf-8` (or `multipart/form-data` for photo uploads).
- Response: `application/json; charset=utf-8`.

### 2.3 Authentication
- Header: `Authorization: Bearer <jwt>`.
- JWT payload: `{ "sub": "<user_id>", "role": "RESTAURANT|NGO|ADMIN", "exp": <epoch> }`.
- Token expiry: 7 days.

### 2.4 Timestamps
- All timestamps in ISO 8601 UTC: `2026-06-03T14:30:00Z`.

### 2.5 Standard Error Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      { "path": ["quantityKg"], "message": "must be > 0" }
    ],
    "requestId": "abc123"
  }
}
```

### 2.6 Standard Status Codes
| Code | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Unprocessable Entity (Validation) |
| 500 | Internal Server Error |

---

## 3. Endpoint & Action Catalog

| # | Type | Method | Path / Action | Auth | Purpose |
|---|---|---|---|---|---|
| 3.1 | Route | POST | `/api/auth/register` | public | Create user + profile |
| 3.2 | Route | POST | `/api/auth/login` | public | Exchange creds for JWT |
| 3.3 | Action | — | `registerAction` | public | Server Action for registration |
| 3.4 | Action | — | `loginAction` | public | Server Action for login |
| 3.5 | Route | GET | `/api/auth/me` | any | Current user |
| 3.6 | Action | — | `createDonation` | RESTAURANT | Create donation |
| 3.7 | Route | GET | `/api/donations` | any | List (filter) |
| 3.8 | Action | — | `acceptMatch` | NGO | Accept match |
| 3.9 | Action | — | `completePickup` | NGO | Complete pickup |
| 3.10 | Action | — | `planRoute` | NGO | Plan optimized route |
| 3.11 | Route | GET | `/api/analytics/overview` | ADMIN | Platform stats |

---

## 4. Detailed Schemas (Highlights)

### 4.1 Auth

#### POST /api/auth/login
**Request**
```json
{ "email": "restaurant@demo.com", "password": "password123" }
```
**200 Response**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "restaurant@demo.com",
    "role": "RESTAURANT"
  }
}
```

### 4.2 Donations

#### createDonation (Server Action)
**Input**
```typescript
{
  title: string;
  foodType: 'COOKED' | 'RAW' | 'PACKAGED' | 'BAKERY';
  quantityKg: number;
  expiresAt: Date;
  pickupWindowStart: Date;
  pickupWindowEnd: Date;
}
```

---

## 5. Error Codes Reference

| Code | Meaning |
|---|---|
| `VALIDATION_ERROR` | Zod/Prisma validation failed |
| `AUTHENTICATION_REQUIRED` | Missing/expired token |
| `INSUFFICIENT_PERMISSIONS` | Wrong role |
| `RESOURCE_NOT_FOUND` | Entity doesn't exist |
| `INVALID_STATE_TRANSITION` | FSM violation |

---

## 6. Rate Limiting

Implemented via Next.js Middleware using an edge-compatible store (e.g., Upstash Redis).
- `/api/auth/login`: 5 / 15 min / IP.
- General API: 60 / min / user.

---

## 7. CORS

Configured in `next.config.js` or via Middleware for `/api` routes.
- Dev: `http://localhost:3000`.
- Prod: explicit allowlist.

---

*End of api-specification.md*
