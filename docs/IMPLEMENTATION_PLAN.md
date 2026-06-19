# NourishLink Platform — Implementation Plan (Next.js Version)

> **Tech Stack:** Next.js 16 (App Router) · TypeScript · Prisma 6 · SQLite · Vanilla CSS (CSS Modules)
> **Goal:** Connect restaurants with surplus food to NGOs for real-time collection.

---

## 1. Project Foundations

### 1.1 Objective
Establish a reproducible Next.js project structure with TypeScript and Prisma.

### 1.2 Deliverables
- `package.json` — dependencies and scripts
- `tsconfig.json` — TypeScript configuration
- `prisma/schema.prisma` — initial database schema
- `app/layout.tsx` — root layout with global styles
- `lib/db.ts` — Prisma client singleton

### 1.3 Key Dependencies
```json
{
  "dependencies": {
    "next": "16.0.0",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "@prisma/client": "6.0.0",
    "jose": "^5.0.0",
    "bcryptjs": "^2.4.3",
    "zod": "^3.0.0",
    "react-hook-form": "^7.0.0",
    "lucide-react": "^0.400.0",
    "react-leaflet": "^5.0.0",
    "leaflet": "^1.9.4"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "prisma": "6.0.0",
    "vitest": "^2.0.0",
    "@playwright/test": "^1.40.0",
    "eslint": "^9.0.0",
    "prettier": "^3.0.0"
  }
}
```

---

## 2. Database Schema & Prisma Setup

### 2.1 Objective
Define the normalized schema in `prisma/schema.prisma` and generate the Prisma client.

### 2.2 Acceptance Criteria
- [ ] `npx prisma migrate dev` creates the database and generates types.
- [ ] `npx prisma studio` opens the data browser.

---

## 3. Authentication & Authorization

### 3.1 Objective
Implement JWT-based auth using `jose` and `bcryptjs`.

### 3.2 Deliverables
- `lib/auth.ts` — token creation and verification logic.
- `app/(auth)/login/page.tsx` — login UI.
- `app/(auth)/register/page.tsx` — registration UI.
- `middleware.ts` — route protection and role-based access control.

### 3.3 Acceptance Criteria
- [ ] Users can register and log in.
- [ ] Tokens have a 7-day expiry.
- [ ] Protected routes redirect to login if unauthenticated.

---

## 4. Core Features: Donations & Matching

### 4.1 Objective
Implement donation posting and automated matching.

### 4.2 Deliverables
- `lib/actions/donation.ts` — Server Action to create donations.
- `lib/services/matching.ts` — TypeScript matching engine.
- `app/dashboard/restaurant/page.tsx` — restaurant dashboard.

---

## 5. Pickup & Routing

### 5.1 Objective
Implement pickup lifecycle and route optimization.

### 5.2 Deliverables
- `lib/actions/pickup.ts` — Server Actions for pickup state transitions.
- `lib/services/routing.ts` — TypeScript routing engine (NN + 2-opt).
- `app/dashboard/ngo/page.tsx` — NGO dashboard with Leaflet map.

---

## 6. Testing & Quality Assurance

### 6.1 Objective
Ensure 85%+ coverage using Vitest and Playwright.

### 6.2 Acceptance Criteria
- [ ] `npm test` runs Vitest unit and integration tests.
- [ ] `npx playwright test` runs E2E scenarios.

---

## 7. Deployment

### 7.1 Objective
Deploy to Vercel or a Node.js-compatible environment.

### 7.2 Acceptance Criteria
- [ ] Production build succeeds with `npm run build`.
- [ ] Environment variables are properly configured.

---

*End of Implementation Plan.*
