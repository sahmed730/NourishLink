# NourishLink — Development Roadmap

> **Version:** 1.0
> **Last Updated:** 2026-06-03
> **Status:** Active
> **Horizon:** v1.0 MVP → v1.1 → v1.2 → v2.0
> **Audience:** Product, engineering, AI agents

---

## 1. Document Purpose

Defines the **phased delivery plan** for NourishLink from MVP through post-launch evolution.

---

## 2. Roadmap Overview

```
v0.1  Foundations              ✅ 2026-06-03
v0.5  Alpha (internal)         🎯 2026-06-20
v1.0  MVP (public launch)      🎯 2026-08-15
v1.1  Hardening & scale        🎯 2026-11-01
v1.2  Multi-tenant ready       🎯 2027-02-15
v2.0  Mobile + ML              🎯 2027-Q4
```

---

## 3. Phase 0.5 — Alpha (target 2026-06-20)

### 3.1 Goals
- Internal demo usable end-to-end with seed data.

### 3.2 Scope
- Project foundations (Next.js 16, TypeScript, Prisma 6, SQLite).
- Auth (register, login, /me) using `jose`.
- Donations CRUD via Server Actions.
- Matching engine (TypeScript port).
- Pickup lifecycle.
- Route optimization (TypeScript port).
- Static UI: landing, login, register, restaurant + NGO dashboards.
- Test suite: unit + integration (Vitest), ≥ 85% coverage.

---

## 4. Phase 1.0 — MVP Public Launch (target 2026-08-15)

### 4.1 Goals
- A real restaurant can register, post a donation, and have it picked up by a real NGO.

---

## 5. Phase 1.1 — Hardening & Scale (target 2026-11-01)

### 5.1 Scope
- **Database:** Migrate to PostgreSQL using Prisma.
- **Caching:** Redis for rate limiting.
- **Observability:** Integrated metrics and logging.

---

*End of development-roadmap.md*
