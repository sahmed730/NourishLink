# NourishLink — Testing Strategy

> **Version:** 1.0
> **Last Updated:** 2026-06-03
> **Status:** Active
> **Audience:** Engineers, QA, AI agents

---

## 1. Document Purpose

Defines the testing approach for the Next.js full-stack application.

---

## 2. Test Pyramid

```
       /\
      /  \          E2E (Playwright) — 10%
     /────\         Happy path flows
    /      \
   /────────\       Integration (Vitest + Prisma Mock) — 20%
  /          \     Server Actions & API Routes
 /────────────\
/              \   Unit (Vitest) — 70%
────────────────   Services & Utils
```

---

## 3. Tooling

- **Unit/Integration:** Vitest.
- **E2E:** Playwright.
- **Mocking:** `vitest-mock-extended` for Prisma.

---

## 4. Unit Testing (Example)

```typescript
// lib/services/matching.test.ts
import { describe, it, expect } from 'vitest';
import { computeProximityScore } from './matching';

describe('computeProximityScore', () => {
  it('should return 1.0 when distance is 0', () => {
    expect(computeProximityScore(0, 10)).toBe(1.0);
  });

  it('should return 0.0 when distance is equal to radius', () => {
    expect(computeProximityScore(10, 10)).toBe(0.0);
  });
});
```

---

## 5. Integration Testing (Server Actions)

```typescript
// lib/actions/donation.test.ts
import { describe, it, expect, vi } from 'vitest';
import { createDonationAction } from './donation';
import { prismaMock } from '@/lib/db/__mocks__/prisma';

describe('createDonationAction', () => {
  it('should create a donation and return data', async () => {
    prismaMock.donation.create.mockResolvedValue({ id: 1, title: 'Test' } as any);
    
    const result = await createDonationAction({ title: 'Test', ... });
    expect(result.data?.id).toBe(1);
  });
});
```

---

## 6. E2E Testing (Playwright)

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test('user can log in', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'restaurant@demo.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL('/dashboard/restaurant');
});
```

---

## 7. CI Pipeline

Every PR must pass:
- `npm run lint` (ESLint)
- `npx tsc` (Type Check)
- `npm test` (Vitest)
- `npx playwright test` (Playwright)

---

*End of testing-strategy.md*
