# NourishLink — Requirements Specification

> **Version:** 1.0
> **Last Updated:** 2026-06-03
> **Status:** Active
> **Format:** EARS-inspired (Easy Approach to Requirements Syntax)

---

## 1. Document Purpose

This document captures **all** functional and non-functional requirements for NourishLink MVP v1.0. Every requirement has a unique ID (FR-* for functional, NFR-* for non-functional), a priority, and acceptance criteria. Designers, developers, and AI agents use this as the **source of truth** for what to build.

### 1.1 Requirement Conventions
- **Priority:** P0 (must-have for launch) · P1 (should-have) · P2 (nice-to-have, post-MVP)
- **Status:** Draft · Approved · Implemented · Verified
- **Traceability:** Every requirement links to one or more components in [`system-architecture.md`](./system-architecture.md).

---

## 2. Functional Requirements

### 2.1 Authentication & User Management

#### FR-AUTH-001 — User Registration [P0]
**When** an unauthenticated visitor submits the registration form with email, password, full name, role, and (for restaurant/NGO) profile details, **the system shall** create a new user, hash the password with bcryptjs, and return a 201 with a user payload (no password).

**Acceptance:**
- Email uniqueness is enforced (409 on duplicate).
- Password minimum 8 chars, must include letter and digit.
- Restaurant/NGO registration creates both a `User` row and the corresponding profile row in a single transaction.
- Admin accounts are not creatable via public registration.

#### FR-AUTH-002 — Login [P0]
**When** a registered user submits valid email + password, **the system shall** return a JWT access token (HS256, 7-day expiry) and the user payload.

**Acceptance:**
- Invalid credentials return 401 with a generic "Invalid email or password" message (no user enumeration).
- 5 failed attempts within 15 minutes from the same IP trigger rate limiting (429).

#### FR-AUTH-003 — Current User Lookup [P0]
**When** an authenticated client requests `GET /api/auth/me`, **the system shall** return the current user's profile.

#### FR-AUTH-004 — Role-Based Access [P0]
**When** an authenticated user attempts an action outside their role, **the system shall** return 403 with a structured error.

**Role matrix:** see [`user-roles.md`](./user-roles.md).

#### FR-AUTH-005 — Logout [P1]
**When** the user logs out, **the system shall** invalidate the token client-side by removing it from storage.

---

### 2.2 Restaurant Features

#### FR-RES-001 — Create Donation [P0]
**When** an authenticated restaurant posts a donation, **the system shall** persist it with status `AVAILABLE` and trigger the matching engine.

**Required fields:** title, foodType, quantityKg, expiresAt, pickupWindowStart, pickupWindowEnd.
**Optional:** description, servings, preparedAt.

**Validation:**
- `quantityKg > 0`.
- `pickupWindowEnd > pickupWindowStart`.
- `expiresAt > now()`.
- `pickupWindowEnd <= expiresAt + 2h`.

#### FR-RES-002 — View My Donations [P0]
**When** a restaurant requests their donations, **the system shall** return paginated results, newest first, filterable by status.

#### FR-RES-003 — Edit Donation [P0]
**When** the owner edits a donation that is still `AVAILABLE`, **the system shall** apply the patch and re-run matching if material fields (quantity, location, window) changed.

Editing is forbidden once status is `MATCHED` or later.

#### FR-RES-004 — Cancel Donation [P0]
**When** the owner cancels an `AVAILABLE` donation, **the system shall** flip status to `CANCELLED` and mark all pending matches as `EXPIRED`.

#### FR-RES-005 — Restaurant Analytics [P1]
**When** a restaurant views analytics, **the system shall** return total kg donated, total matches, total pickups completed, and CO₂ avoided for that restaurant.

---

### 2.3 NGO Features

#### FR-NGO-001 — Browse Available Donations [P0]
**When** an NGO lists donations, **the system shall** return only `AVAILABLE` donations, with optional filters: foodType, nearLat/nearLon + radiusKm, expiresBefore, minQuantityKg.

Results are sorted by distance ascending (when geo filter present) or createdAt descending.

#### FR-NGO-002 — Accept Match [P0]
**When** an NGO accepts a pending match, **the system shall**:
1. Set match status → `ACCEPTED`, set donation status → `MATCHED`.
2. Create a `Pickup` row linked to the match.
3. Mark all other pending matches for the same donation as `EXPIRED`.
4. Notify the restaurant.

The operation is atomic using Prisma transactions.

#### FR-NGO-003 — Reject Match [P0]
**When** an NGO rejects a match, **the system shall** set match status → `REJECTED`. The donation remains `AVAILABLE` and other matches remain pending.

#### FR-NGO-004 — Pickup Lifecycle [P0]
**When** an NGO progresses a pickup through `EN_ROUTE → ARRIVED → COMPLETED`, **the system shall** record timestamps and (on complete) collectedKg + optional photo URL.

Invalid transitions return 409.

#### FR-NGO-005 — Plan Route [P0]
**When** an NGO submits 2+ donation IDs for a date, **the system shall** compute an optimized sequence using nearest-neighbor + 2-opt, starting and ending at the NGO base.

Returns: ordered stops, total distance, total duration, polyline (or stop coordinates).

#### FR-NGO-006 — NGO Analytics [P1]
**When** an NGO views analytics, **the system shall** return kg collected, meals served, routes completed, average route distance saved.

---

### 2.4 Admin Features

#### FR-ADM-001 — User Management [P0]
**When** an admin views users, **the system shall** return paginated user list with role filters. Admins can deactivate accounts (`isActive=false`).

#### FR-ADM-002 — Platform Analytics [P0]
**When** an admin views the platform overview, **the system shall** return total users (by role), total donations, total kg saved, total CO₂ avoided, last-30-day trend.

---

### 2.5 Matching Engine

#### FR-MATCH-001 — Auto-Match on Donation Creation [P0]
**When** a donation is created, **the system shall** score all active NGOs within the donation's effective radius and create up to 5 pending matches (top-N by score).

#### FR-MATCH-002 — Match Score [P0]
**The system shall** compute a score using weighted proximity, capacity, freshness, and vehicle type.

#### FR-MATCH-003 — Re-Run on Donation Edit [P1]
**When** a restaurant edits a donation in a way that changes geo, time, or quantity, **the system shall** re-score pending matches.

---

### 2.6 Notifications

#### FR-NOTIF-001 — NGO Match Alert [P0]
**When** a match is created, **the system shall** notify the NGO via in-app + email.

#### FR-NOTIF-002 — Restaurant Match Update [P0]
**When** a match is accepted/rejected, **the system shall** notify the restaurant.

---

### 2.7 Public / Landing

#### FR-PUB-001 — Landing Page [P0]
**The system shall** serve a public landing page with platform description, live impact stats, and CTAs to register.

---

## 3. Non-Functional Requirements

### 3.1 Performance

| ID | Requirement | Target |
|---|---|---|
| NFR-PERF-001 | API/Action response time (p95) | < 300 ms for non-route endpoints |
| NFR-PERF-002 | Route plan (≤10 stops) | < 1 s |
| NFR-PERF-003 | Time-to-first-byte (TTFB) | < 200 ms |
| NFR-PERF-004 | Match run per donation | < 200 ms |

### 3.2 Scalability

| ID | Requirement | Target |
|---|---|---|
| NFR-SCALE-001 | Concurrent users | 500 active, 50 concurrent writes |
| NFR-SCALE-002 | Database size | SQLite via Prisma 6 |

### 3.3 Availability & Reliability

| ID | Requirement | Target |
|---|---|---|
| NFR-AVAIL-001 | Uptime | 99.0% (MVP) |
| NFR-AVAIL-002 | Backup | Daily SQLite snapshot |
| NFR-AVAIL-003 | Health endpoints | `/api/health` always available |

### 3.4 Security

| ID | Requirement | Target |
|---|---|---|
| NFR-SEC-001 | Password storage | bcryptjs, cost factor ≥ 12 |
| NFR-SEC-002 | Transport | TLS only in production; HSTS |
| NFR-SEC-003 | JWT expiry | ≤ 7 days |
| NFR-SEC-004 | Rate limit on auth | 60 req/min per IP |
| NFR-SEC-005 | Input validation | Zod on all endpoints/actions |
| NFR-SEC-006 | SQL injection | Prisma (parameterized) only |
| NFR-SEC-007 | CORS | Configurable allowlist |
| NFR-SEC-008 | Secrets | Env vars only; never logged |

### 3.5 Privacy & Compliance

| ID | Requirement | Target |
|---|---|---|
| NFR-PRIV-001 | Data minimization | Only collect what is required |
| NFR-PRIV-002 | Address masking | NGO sees exact address only after match acceptance |
| NFR-PRIV-004 | Audit log | All state transitions recorded |

### 3.6 Usability & Accessibility

| ID | Requirement | Target |
|---|---|---|
| NFR-UX-001 | Mobile usability | 360px-wide viewport; no horizontal scroll |
| NFR-UX-002 | Keyboard navigation | All forms fully keyboard-operable |
| NFR-UX-003 | Screen reader | WCAG 2.1 AA compliance |

### 3.7 Maintainability

| ID | Requirement | Target |
|---|---|---|
| NFR-MAINT-001 | Type safety | TypeScript strict mode |
| NFR-MAINT-002 | Test coverage | ≥ 85% |
| NFR-MAINT-003 | Linting | ESLint, zero errors |

### 3.8 Portability

| ID | Requirement | Target |
|---|---|---|
| NFR-PORT-001 | Runtime version | Node.js 20+ |
| NFR-PORT-002 | OS | Linux/macOS/Windows for dev; Linux for prod |
| NFR-PORT-003 | Browser support | Latest 2 versions of Chrome, Firefox, Safari, Edge |

---

## 4. Constraints

- **C-1:** Use Node.js 20+.
- **C-2:** Use SQLite via Prisma 6 for MVP.
- **C-3:** No paid services or third-party APIs required for the MVP.
- **C-4:** Framework: Next.js 16 (App Router).
- **C-5:** No paid maps services — OpenStreetMap tiles only.

---

## 5. Assumptions

- Restaurants have GPS coordinates.
- NGOs have a base location and at least one vehicle type.
- Email delivery uses a stubbed sender in dev.

---

## 6. Out-of-Scope

- Native mobile applications.
- Real-time chat.
- AI-based demand forecasting.
- Internationalization (i18n) — English only.

---

*End of requirements.md*
