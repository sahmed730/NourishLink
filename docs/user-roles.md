# NourishLink — User Roles & Permissions

> **Version:** 1.0
> **Last Updated:** 2026-06-03
> **Status:** Active
> **Audience:** All engineers, designers, AI agents

---

## 1. Document Purpose

Defines the **three user roles** in NourishLink, the **permissions** each role holds, the **data scope** they can access, and the **UI surfaces** they see. This document is the source of truth for both the backend RBAC layer and the frontend navigation.

For auth flow: see [`authentication-flow.md`](./authentication-flow.md).
For API authorization: see [`api-specification.md`](./api-specification.md).

---

## 2. Roles Overview

| Role | Account Creator | Primary Use Case |
|---|---|---|
| **Restaurant** | Self (via public registration) | Post surplus food; track pickups and impact |
| **NGO** | Self (via public registration) | Browse donations; accept matches; complete pickups; plan routes |
| **Admin** | Internal (seeded; cannot self-register) | Operate the platform; support users; resolve disputes |

> Admins are created only by the seed script or by another admin. There is no public endpoint that produces an admin account.

---

## 3. Restaurant Role

### 3.1 Profile
A restaurant user owns **one** `restaurants` row. The profile contains business address, geo coordinates, cuisine, and license number.

### 3.2 Capabilities
- Create, edit, and cancel **own** donations.
- View all of **own** donations in any status.
- View match list for **own** donations.
- View **own** analytics (kg donated, meals served, CO₂ avoided).
- Receive notifications about matches and pickups for **own** donations.
- Update **own** profile (name, address, lat/lon, cuisine).

### 3.3 Restrictions
- **Cannot** see other restaurants' donations (unless visible to admins).
- **Cannot** accept matches (no NGO-side actions).
- **Cannot** view NGO personal data beyond what's needed for pickup.
- **Cannot** create admin accounts.

### 3.4 UI Surfaces
- `/dashboard/restaurant.html` — main dashboard.
- "Post donation" form (always visible at top).
- "My donations" table/cards (active + history tabs).
- "Impact" card.
- Profile settings (P1).

### 3.5 Data Visibility Matrix
| Resource | Read | Write |
|---|---|---|
| Own user | ✅ | ❌ (admin only) |
| Own restaurant profile | ✅ | ✅ |
| Other restaurant profiles | ❌ | ❌ |
| Own donations | ✅ (all statuses) | ✅ (edit/cancel only if `available`) |
| Other donations | ❌ | ❌ |
| Own matches (incoming) | ✅ | ❌ (NGO accepts/rejects) |
| Own pickups (incoming) | ✅ (read-only) | ❌ |
| Own analytics | ✅ | n/a |

---

## 4. NGO Role

### 4.1 Profile
An NGO user owns **one** `ngos` row. The profile contains base address, geo coordinates, vehicle type, capacity, and service radius.

### 4.2 Capabilities
- Browse **all** `available` donations (with optional geo and other filters).
- Accept or reject matches assigned to them.
- Manage pickup lifecycle for their matches: `en_route → arrived → completed`.
- Plan optimized multi-stop routes for accepted pickups.
- View their own analytics (kg collected, meals served, routes completed, avg distance saved).
- Receive notifications about new matches and pickup reminders.
- Update **own** profile (capacity, vehicle, radius, location).
- Toggle `is_accepting` (pause/resume).

### 4.3 Restrictions
- **Cannot** post donations.
- **Cannot** see restaurant address until a match is accepted (masked to neighborhood).
- **Cannot** edit other NGOs' profiles.
- **Cannot** create admin accounts.
- **Cannot** see donations in non-`available` states (except their own matches).

### 4.4 UI Surfaces
- `/dashboard/ngo.html` — main dashboard.
- Map view of available donations.
- Available donations list (sortable by distance).
- "My matches" panel.
- Route planner (date + multi-select).
- "Impact" card.
- Profile / settings (P1).

### 4.5 Data Visibility Matrix
| Resource | Read | Write |
|---|---|---|
| Own user | ✅ | ❌ (admin only) |
| Own NGO profile | ✅ | ✅ |
| Other NGOs' profiles | ❌ | ❌ |
| `available` donations (list) | ✅ (neighborhood only) | ❌ |
| Donation details (post-match) | ✅ (full address) | ❌ |
| Own matches | ✅ | ✅ (accept/reject) |
| Own pickups | ✅ | ✅ (state transitions) |
| Other NGOs' matches/pickups | ❌ | ❌ |
| Own analytics | ✅ | n/a |
| Platform-wide analytics | ❌ | n/a |

---

## 5. Admin Role

### 5.1 Profile
No additional profile table. Admin is a flag on `users` (`role='admin'`). Optionally store display name + contact.

### 5.2 Capabilities
- Full read across all entities.
- List, view, edit, deactivate users.
- View platform analytics (`/analytics/overview`).
- Manual match assignment (`POST /donations/{id}/matches`).
- View audit logs (P1).
- Mark dispute cases as resolved (P1).
- Reset user passwords (P1).

### 5.3 Restrictions
- Admin actions are **logged** with `actor_user_id`.
- Admins **cannot** impersonate users (no "login as" in MVP — P1).
- Admins **cannot** hard-delete donations with active matches (must cancel first via service).

### 5.4 UI Surfaces
- `/dashboard/admin.html` — main admin console.
- User list (filter by role, search, deactivate).
- Donation heatmap.
- Top NGOs / restaurants.
- (P1) Audit log viewer.

### 5.5 Data Visibility Matrix
| Resource | Read | Write |
|---|---|---|
| All users | ✅ | ✅ (limited to `is_active`) |
| All donations | ✅ | ✅ (manual re-match, cancel) |
| All matches | ✅ | ✅ (manual create, force-accept) |
| All pickups | ✅ | ❌ (transitions are NGO-driven; admin can only annotate) |
| All routes | ✅ | ❌ |
| Platform analytics | ✅ | n/a |
| Audit log (P1) | ✅ | append-only |

---

## 6. Cross-Role Permission Matrix

`R` = read own; `R*` = read all; `W` = write own; `W*` = write all; `—` = no access.

| Endpoint | Restaurant | NGO | Admin |
|---|---|---|---|
| POST `/auth/register` | R (self) | R (self) | — (no public admin) |
| POST `/auth/login` | ✅ | ✅ | ✅ |
| GET `/auth/me` | ✅ | ✅ | ✅ |
| GET `/users` | — | — | R* |
| PATCH `/users/{id}` | — | — | W* (limited) |
| GET `/restaurants/me` | R/W | — | R*/W* |
| PATCH `/restaurants/me` | W | — | W* |
| GET `/ngos/me` | — | R/W | R*/W* |
| PATCH `/ngos/me` | — | W | W* |
| POST `/donations` | W | — | W* |
| GET `/donations` (list) | R (own) | R (available) | R* |
| GET `/donations/{id}` | R (own) | R (if matched) | R* |
| PATCH `/donations/{id}` | W (own, if `available`) | — | W* |
| DELETE `/donations/{id}` | W (own, if `available`) | — | W* |
| POST `/donations/{id}/matches` | — | — | W* |
| GET `/matches` | R (own donation) | R (own) | R* |
| POST `/matches/{id}/accept` | — | W (own) | W* |
| POST `/matches/{id}/reject` | — | W (own) | W* |
| GET `/pickups/{id}` | R (own donation) | R (own) | R* |
| POST `/pickups/{id}/en-route` | — | W (own) | W* |
| POST `/pickups/{id}/arrived` | — | W (own) | W* |
| POST `/pickups/{id}/complete` | — | W (own) | W* |
| POST `/routes/plan` | — | W (own) | W* |
| GET `/routes/{id}` | — | R (own) | R* |
| GET `/routes` | — | R (own) | R* |
| GET `/analytics/overview` | — | — | R* |
| GET `/analytics/restaurant/{id}` | R (own) | — | R* |
| GET `/analytics/ngo/{id}` | — | R (own) | R* |
| GET `/notifications` | R (own) | R (own) | R (own) |
| GET `/healthz` | R | R | R |
| GET `/readyz` | R | R | R |

---

## 7. Frontend Role Routing

After login, the client redirects based on `user.role`:

```js
// app/static/js/auth.js
export function postLoginRedirect(user) {
  switch (user.role) {
    case 'restaurant': return '/dashboard/restaurant.html';
    case 'ngo':        return '/dashboard/ngo.html';
    case 'admin':      return '/dashboard/admin.html';
  }
}
```

A page's entry script also enforces role:
```js
// app/static/js/pages/restaurant.js
import { requireRole } from '../auth.js';
const me = requireRole('restaurant');
// ...page code
```

`requireRole` checks `localStorage.nl_user.role` and either renders the page or redirects/403s.

---

## 8. Multi-Role Users (P1, post-MVP)

For MVP, each user has exactly one role. v1.1 may allow:
- A single user tied to both a restaurant and an NGO (e.g., a community kitchen that is also a donor).
- An admin who is also an active NGO manager.

Implementation: `user_roles` junction table; `require_any_role(*roles)` dependency.

---

## 9. Adding a New Role (Checklist)

1. Update `users.role` enum (DB + Pydantic).
2. Add role-specific profile table (mirror of `restaurants` or `ngos`).
3. Update `Settings` and registration logic.
4. Add `require_role` invocations on new endpoints.
5. Add frontend page + entry script + role redirect.
6. Update this document.
7. Add seed data example.
8. Add acceptance tests for the new role.

---

## 10. Common Anti-Patterns (Forbidden)

- ❌ Checking role inside the service instead of via dependency — too easy to forget.
- ❌ Returning 200 with an empty list for "not allowed" (must be 403).
- ❌ Leaking resource existence via 404 vs 403 differences.
- ❌ Trusting client-supplied role in the JWT without DB check on sensitive operations.
- ❌ Single super-admin role (privilege separation comes from `admin`, not from `super_admin`).

---

## 11. Glossary

- **RBAC:** Role-Based Access Control.
- **Ownership:** A user is the *owner* of an entity if a foreign key chains back to their profile.
- **Admin override:** Admin actions that bypass ownership but are logged.

---

*End of user-roles.md*
