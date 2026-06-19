# NourishLink — System Architecture

> **Version:** 1.0
> **Last Updated:** 2026-06-03
> **Status:** Active
> **Audience:** Engineers, AI agents, technical reviewers

---

## 1. Document Purpose

This document defines the **system architecture** for NourishLink MVP v1.0: the components, their responsibilities, communication patterns, data flow, and deployment topology. It is the engineering reference for all backend and infrastructure decisions.

For requirements: see [`requirements.md`](./requirements.md).
For database details: see [`database-design.md`](./database-design.md).
For API contracts: see [`api-specification.md`](./api-specification.md).

---

## 2. Architectural Goals

| Goal | Description |
|---|---|
| **Simplicity** | Single deployable (Next.js); no microservices in MVP. |
| **Speed of iteration** | All engineers can run the full stack locally with `npm run dev`. |
| **Modularity** | Clean separation of `components / lib / services / prisma` so any layer can be swapped. |
| **Cost-efficiency** | Run on a single small VM or serverless (Vercel); no managed services required. |
| **Portability** | Same code runs on Linux/macOS/Windows dev and production. |
| **AI-Agent friendly** | Layout deterministic, file names explicit, dependencies minimal. |

---

## 3. Architectural Style

**Next.js Full-Stack Application** with App Router:

```
┌────────────────────────────────────────────┐
│   Next.js App Router (React Components)    │
│   Presentation + Client-Side Interactivity │
└────────────────┬───────────────────────────┘
                 │ Server Actions / API Routes
┌────────────────▼───────────────────────────┐
│   Server Layer (Next.js Server Side)       │
│   Auth · Matching · Routing · Analytics    │
└────────────────┬───────────────────────────┘
                 │ Prisma Client
┌────────────────▼───────────────────────────┐
│   Data Layer (SQLite / Prisma 6)           │
└────────────────────────────────────────────┘
```

---

## 4. Component Diagram

```
                     ┌──────────────────────────┐
                     │   Browser (Web Client)   │
                     │  Desktop · Tablet · Phone│
                     └────────────┬─────────────┘
                                  │ HTTPS
                                  ▼
        ┌──────────────────────────────────────────────┐
        │            Vercel / Node.js Server           │
        └────────────┬─────────────────────────────────┘
                     │
                     ▼
        ┌──────────────────────────────────────────────┐
        │            Next.js Application               │
        │  ┌────────────────────────────────────────┐  │
        │  │ App Router (/app)                      │  │
        │  │  · Layouts & Pages                     │  │
        │  │  · Server Components (RSC)             │  │
        │  │  · Client Components                   │  │
        │  │  · Server Actions                      │  │
        │  └────────────────────┬───────────────────┘  │
        │                       │                      │
        │  ┌────────────────────▼───────────────────┐  │
        │  │ Service Layer (/lib/services)          │  │
        │  │  · matching.ts                         │  │
        │  │  · routing.ts                          │  │
        │  │  · notifications.ts                    │  │
        │  │  · analytics.ts                        │  │
        │  └────────────────────┬───────────────────┘  │
        │                       │                      │
        │  ┌────────────────────▼───────────────────┐  │
        │  │ Data Layer (/prisma)                   │  │
        │  │  · Prisma Client                       │  │
        │  │  · Schema (schema.prisma)              │  │
        │  └────────────────────┬───────────────────┘  │
        └───────────────────────┼──────────────────────┘
                                │ SQL
                                ▼
                    ┌──────────────────────────┐
                    │  SQLite                  │
                    │  ./prisma/dev.db         │
                    └──────────────────────────┘
```

---

## 5. Layer Responsibilities

### 5.1 Presentation Layer (Frontend)
- **Stack:** Next.js 16 (App Router), React 19, TypeScript, Vanilla CSS (CSS Modules).
- **Responsibilities:**
  - Server-side rendering (SSR) of initial page states.
  - Client-side interactivity and hydration.
  - Manage JWT in `localStorage` and attach to requests.
  - Form validation (Client-side Zod + Server-side Prisma/Zod).
  - Map rendering using Leaflet.js.
- **Constraints:** Minimize client-side bundle size; favor Server Components.

### 5.2 Server Layer (Next.js Server Side)
- **Stack:** Node.js 20+, Server Actions, API Routes.
- **Responsibilities:**
  - Business logic (matching algorithm, route planning).
  - Authentication & authorization using `jose`.
  - Rate limiting (Next.js middleware).
  - API endpoint handling.
- **Files:** `app/api/**/*.ts`, `lib/services/*.ts`, `lib/actions/*.ts`

### 5.3 Data Layer (Prisma)
- **Stack:** Prisma 6.
- **Responsibilities:**
  - Type-safe database queries.
  - Schema migrations (`prisma migrate`).
  - Connection management for SQLite.
- **Files:** `prisma/schema.prisma`, `lib/db.ts` (Prisma client singleton).

---

## 6. Cross-Cutting Concerns

### 6.1 Configuration
- Loaded via `process.env` from `.env`.
- Type-safe validation using Zod in `lib/env.ts`.

### 6.2 Logging
- Consistent metadata: `timestamp, level, requestId, userId, path, duration`.
- Standardized logging interface for both Server Components and Actions.

### 6.3 Error Handling
- Centralized `error.tsx` boundaries in Next.js.
- Custom exception classes in `lib/exceptions.ts`.
- Server Actions return standardized `{ data, error }` envelopes.

### 6.4 Security
- HTTPS enforcement.
- `bcryptjs` for password hashing.
- JWT (HS256) with `jose` library; 7-day tokens stored in `localStorage`.
- CSRF protection via Server Actions.
- OWASP-aligned headers via `next.config.js`.

---

## 7. Request Lifecycle (Example: NGO Accepts Match)

```
1. Browser (NGO) clicks "Accept" → invokes Server Action `acceptMatch(matchId)`
2. Next.js handles the POST request.
3. Middleware:
   a. Auth check → verify JWT with `jose` → extract userId.
4. Server Action logic:
   a. Validate match ownership.
   b. Prisma transaction:
      i. Update match status to 'accepted'.
      ii. Update donation status to 'matched'.
      iii. Expire other pending matches.
      iv. Create pickup record.
   c. Enqueue notification (e.g., via background task).
5. Response: Revalidate path or return updated data.
6. Logger: "AcceptMatch success, userId=42, matchId=87"
```

---

## 8. Data Flow

### 8.1 Donation Creation Flow
```
Restaurant UI (React Form)
   │ Server Action: createDonation(data)
   ▼
Server: validate, persist donation via Prisma (status=available)
   │
   ├──► Service: matching.findMatches(donation)
   │      │
   │      └──► For each active NGO within radius:
   │             - compute score
   │             - persist match row
   │
   └──► Service: notifications.notifyNGO(match)
          │
          └──► Email + in-app notification
```

### 8.2 Pickup Completion Flow
```
NGO UI
   │ Server Action: completePickup(id, data)
   ▼
Server: validate, transition pickup
   │
   ├──► Service: pickups.complete()
   │      - set status, collectedKg, photoUrl, completedAt
   │      - update donation.status = 'picked_up'
   │
   ├──► Service: analytics.recordCompletion()
   │      - recompute totals
   │
   └──► Service: notifications.notifyRestaurant()
```

---

## 9. Deployment Topology

### 9.1 Local Development
```
┌─────────────────────────────────────────┐
│  Dev Machine                            │
│  ┌──────────────────────────────────┐   │
│  │ Node.js Runtime                  │   │
│  │  npm run dev                     │   │
│  │  sqlite at ./prisma/dev.db       │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### 9.2 Production (Vercel)
```
Internet
   │
   ▼
┌────────────────────────────┐
│ Vercel Edge / Serverless   │
│ (Next.js Application)      │
└─────────────┬──────────────┘
              │
              ▼
┌────────────────────────────┐
│ SQLite (on persistent vol) │
│ or Serverless DB (Neon/etc)│
└────────────────────────────┘
```

---

## 10. Module Boundaries & Imports

Strict import rules (enforced by ESLint):

| From | May import | Must NOT import |
|---|---|---|
| `app/**` | `lib/**`, `components/**` | — |
| `components/**` | `lib/utils.ts`, `styles/**` | `lib/db.ts` (Prisma) |
| `lib/services/**` | `lib/db.ts`, `lib/utils.ts` | `app/**` |
| `lib/actions/**` | `lib/services/**`, `lib/db.ts` | `app/**` |

---

## 11. Performance Considerations

| Concern | Strategy |
|---|---|
| Slow geo queries | Haversine computed in TypeScript; use indexes on lat/lon |
| N+1 on list endpoints | Prisma `include` and `select` for efficient fetching |
| Large client bundles | Use Server Components by default; lazy load heavy libraries |

---

## 12. Observability

### 12.1 Logging
- Structured logs to stdout.
- Integrated with Vercel Logs or external provider.

### 12.2 Metrics
- Vercel Web Analytics.
- Custom instrumentation for business KPIs.

### 12.3 Health
- `/api/health` — process alive and DB ping.

---

## 13. Security Architecture

- Defense in depth: TLS → Middleware auth → RBAC → Server Action validation → Parameterized queries (Prisma).
- Secrets in env vars.
- Address masking: NGO sees neighborhood only until match acceptance.
- Audit log records state transitions.

---

## 14. Failure Modes & Recovery

| Failure | Behavior | Recovery |
|---|---|---|
| DB connection lost | 503 from API/Actions; Error boundary triggered | Auto-reconnect; ops alerts |
| JWT_SECRET rotated | All tokens invalidate | Users re-login |
| Geo data missing | Skipped from matching | Manual fix |
| Matching throws | Donation persists as `available`; error logged | Manual re-match trigger |

---

## 15. Architectural Decision Records (ADRs)

### ADR-001: Next.js over Python/FastAPI
- **Status:** Accepted
- **Context:** Desire for a unified TypeScript stack and better full-stack developer experience.
- **Decision:** Use Next.js 16 with App Router and TypeScript.
- **Consequences:** Unified language, built-in routing, SSR/SSG capabilities, simplified deployment.

### ADR-002: Prisma over SQLAlchemy
- **Status:** Accepted
- **Context:** Need for type-safe database access in TypeScript.
- **Decision:** Prisma 6 with SQLite.
- **Consequences:** Auto-generated types, simplified migrations, excellent DX.

### ADR-003: JWT with jose over sessions
- **Status:** Accepted
- **Context:** Stateless API; existing frontend expectation for token-based auth.
- **Decision:** JWT with `jose`, 7-day expiry, stored in `localStorage`.
- **Consequences:** Simple, stateless, but requires careful XSS prevention.

### ADR-004: TypeScript for Matching Algorithm
- **Status:** Accepted
- **Context:** Porting the core business logic from Python.
- **Decision:** Full TypeScript port of the scoring algorithm.
- **Consequences:** Maintain logic consistency while gaining type safety.

### ADR-005: Vanilla CSS (CSS Modules)
- **Status:** Accepted
- **Context:** Preference for standard CSS while maintaining component isolation.
- **Decision:** Use CSS Modules.
- **Consequences:** Scoped styles, no large utility-class overhead.

---

## 16. Glossary

- **SSR:** Server-Side Rendering.
- **RSC:** React Server Components.
- **Server Actions:** Next.js mechanism for handling form submissions and data mutations.
- **Prisma:** Modern ORM for Node.js and TypeScript.
- **RBAC:** Role-Based Access Control.

---

*End of system-architecture.md*
