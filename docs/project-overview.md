# NourishLink — Project Overview

> **Version:** 1.0
> **Last Updated:** 2026-06-03
> **Status:** Active
> **Audience:** All stakeholders, developers, designers, and AI agents

---

## 1. Executive Summary

**NourishLink** is a real-time logistics platform that connects commercial restaurants and event venues with surplus edible food to local NGOs capable of collecting and redistributing it. The platform minimizes food waste, optimizes community support resource allocation, and reduces environmental footprint by providing an on-demand, geo-aware donation-to-collection matching system.

### 1.1 Mission
Eliminate the loss of edible surplus food to landfills by creating a transparent, real-time channel between food providers (restaurants, events) and social organizations (NGOs, shelters, community kitchens).

### 1.2 Vision
A world where no edible food is wasted while people in the same community go hungry — bridged by smart logistics.

---

## 2. The Challenge

### 2.1 Problem Statement
Tons of edible surplus food from commercial restaurants, hotels, catering events, and food retailers go directly to landfills every day. The root causes are:

1. **Absence of real-time logistics channels** — restaurants have surplus at unpredictable times; NGOs cannot plan pickup without advance notice.
2. **Lack of visibility** — NGOs don't know what is available, where, and when.
3. **No trust/verification layer** — food safety, hygiene, and chain-of-custody concerns inhibit donation.
4. **Inefficient matching** — even when a connection exists, manual coordination wastes time and food.
5. **Environmental cost** — food waste in landfills generates methane (a potent greenhouse gas) and wasted water/energy used in production.

### 2.2 Quantified Impact (Industry Benchmarks)
- ~1/3 of all food produced globally is wasted (~1.3 billion tons/year).
- Restaurants account for ~10–15% of that waste pre-consumer.
- Edible food redirected from landfill avoids ~2.5 kg CO₂e per kg of food (FAO).
- A typical restaurant generates 25,000–75,000 kg of food waste annually.

---

## 3. The Solution: NourishLink

A dynamic platform prototype that:

| Capability | Description |
|---|---|
| **Real-time donation posting** | Restaurants post surplus food with quantity, type, expiry, and pickup window. |
| **Auto-matching** | Algorithm scores NGOs by proximity, capacity, vehicle, and freshness. |
| **Route optimization** | Multi-stop pickup planning for NGOs to minimize travel time and fuel. |
| **Chain-of-custody** | Pickup verification, timestamps, and status transitions create an audit trail. |
| **Impact analytics** | Real-time dashboards for kg saved, meals served, and CO₂ avoided. |
| **Role-based UX** | Dedicated dashboards for restaurants, NGOs, and platform administrators. |

---

## 4. Core Value Propositions

### 4.1 For Restaurants
- ✅ Reduce waste disposal costs.
- ✅ Corporate social responsibility (CSR) reporting and impact metrics.
- ✅ Tax-deductible donation records (where applicable).
- ✅ Brand goodwill and community standing.

### 4.2 For NGOs
- ✅ Predictable, geo-filtered supply of fresh food.
- ✅ Optimized pickup routes save fuel and volunteer time.
- ✅ Verified, audited donation records for grant reporting.
- ✅ Capacity-aware matching prevents overload.

### 4.3 For the Community
- ✅ More meals reach people in need.
- ✅ Lower environmental footprint.
- ✅ Stronger local food resilience.

### 4.4 For Regulators / Cities
- ✅ Aggregate data on food waste reduction.
- ✅ Compliance with food safety regulations.
- ✅ Insights for urban planning and policy.

---

## 5. Scope

### 5.1 In-Scope (MVP v1.0)
- Three user roles: **Restaurant**, **NGO**, **Admin**.
- Web-based responsive UI (desktop + mobile).
- Next.js 16 Full-Stack application.
- SQLite database via Prisma 6.
- Donation lifecycle: post → match → accept → pickup → complete.
- Auto-matching engine with weighted scoring.
- Route optimization (nearest-neighbor + 2-opt heuristic).
- Impact analytics dashboards.
- Notification system (in-app + email).
- Seed data for demos.

### 5.2 Out-of-Scope (v1.0)
- Native mobile apps (iOS/Android).
- Real-time push notifications via WebSockets (v1.1).
- Payment processing / micro-rewards.
- Multi-language localization (English only at MVP).
- Government regulatory integrations.
- Predictive ML models for surplus forecasting (v1.1).
- Production-scale multi-region deployment.

---

## 6. Stakeholders

| Stakeholder | Role | Interest |
|---|---|---|
| Restaurants | Data provider (donations) | Waste reduction, CSR |
| NGOs | Action taker (pickups) | Reliable supply, efficiency |
| Platform Admins | Operators | Platform health, dispute resolution |
| End Beneficiaries | Indirect users | Meals, nutrition |
| Local Government | Indirect stakeholder | Policy compliance, sustainability |
| Investors/Donors | Funders | Impact metrics |

---

## 7. Success Metrics (KPIs)

| Metric | Target (6 months post-launch) |
|---|---|
| Registered restaurants | 100+ |
| Registered NGOs | 30+ |
| Monthly donations posted | 1,000+ |
| Match-to-pickup conversion | ≥ 75% |
| Average time from post → pickup | < 3 hours |
| Kg of food saved / month | 5,000+ |
| Average NGO route efficiency gain | ≥ 20% |
| Mobile session share | ≥ 40% |

---

## 8. High-Level Architecture

```
┌──────────────────────────────────────────────────────┐
│           Next.js 16 (App Router)                    │
│   Landing · Auth · Restaurant · NGO · Admin Dash     │
└──────────────────┬───────────────────────────────────┘
                   │ Server Actions / API Routes
┌──────────────────▼───────────────────────────────────┐
│              Node.js Runtime                         │
│  Auth · Donations · Matching · Pickups · Routes      │
└──────────────────┬───────────────────────────────────┘
                   │ Prisma ORM
┌──────────────────▼───────────────────────────────────┐
│              SQLite Database                         │
│  Users · Restaurants · NGOs · Donations              │
│  Matches · Pickups · Routes · Audit                  │
└──────────────────────────────────────────────────────┘
```

Detailed architecture: see [`system-architecture.md`](./system-architecture.md).

---

## 9. Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router), TypeScript 5+ |
| **Database** | SQLite via Prisma 6 |
| **Auth** | JWT (jose), bcryptjs |
| **Frontend** | React, Vanilla CSS (CSS Modules), Leaflet.js (maps) |
| **Maps/Tiles** | OpenStreetMap |
| **Testing** | Vitest, Playwright (E2E) |
| **Linting/Formatting** | ESLint, Prettier |
| **Runtime** | Node.js 20+ |
| **Deployment** | Vercel or Node.js Docker container |

---

## 10. Project Structure

```
nurishlink/
├── docs/                        # This folder
├── app/                         # Next.js App Router (Layouts, Pages, Components)
├── components/                  # Shared React components
├── lib/                         # Core logic, Prisma client, auth utilities
├── prisma/                      # Schema and migrations
├── public/                      # Static assets
├── styles/                      # Global and shared CSS
├── tests/                       # Test suite
└── scripts/                     # Seed and utilities
```

---

## 11. Repository Map

| Document | Purpose |
|---|---|
| [requirements.md](./requirements.md) | Functional + non-functional requirements |
| [system-architecture.md](./system-architecture.md) | Components, data flow, deployment |
| [database-design.md](./database-design.md) | Schema, ER diagrams, indexes |
| [api-specification.md](./api-specification.md) | REST endpoints, payloads |
| [frontend-design.md](./frontend-design.md) | UI structure, components |
| [ui-ux-guidelines.md](./ui-ux-guidelines.md) | Visual language, accessibility |
| [authentication-flow.md](./authentication-flow.md) | Login, JWT, RBAC |
| [security.md](./security.md) | Threats, controls, hardening |
| [notification-system.md](./notification-system.md) | Triggers, channels, templates |
| [ai-features.md](./ai-features.md) | Matching + routing algorithms |
| [user-roles.md](./user-roles.md) | Roles, permissions matrix |
| [deployment.md](./deployment.md) | Local, staging, production |
| [testing-strategy.md](./testing-strategy.md) | Test pyramid, coverage |
| [coding-standards.md](./coding-standards.md) | Style, conventions, tooling |
| [development-roadmap.md](./development-roadmap.md) | Phased delivery plan |

Top-level engineering plan: see [`../IMPLEMENTATION_PLAN.md`](../IMPLEMENTATION_PLAN.md).

---

## 12. Glossary

- **Donation** — A unit of surplus food offered by a restaurant for collection.
- **Match** — A proposed pairing of donation ↔ NGO with a computed suitability score.
- **Pickup** — The executed event of an NGO collecting a donation.
- **Route** — A planned multi-stop path for an NGO on a given day.
- **Service Radius** — Max distance (km) within which an NGO operates.
- **Pickup Window** — Time range during which the donation is available.
- **NGO** — Non-Governmental Organization (charity, shelter, community kitchen).
- **CSR** — Corporate Social Responsibility.

---

## 13. Document Control

| Field | Value |
|---|---|
| Owner | Product Lead |
| Reviewers | Eng Lead, Design Lead, Operations |
| Cadence | Quarterly review |
| Change log | See [`CHANGELOG.md`](../CHANGELOG.md) (root) |

---

*End of project-overview.md*
