# NourishLink — Coding Standards

> **Version:** 1.0
> **Last Updated:** 2026-06-03
> **Status:** Active
> **Audience:** All engineers, AI agents

---

## 1. Document Purpose

Defines the **code style, conventions, and tooling** for the NourishLink codebase. These rules ensure consistency across the Next.js full-stack application and make the codebase friendly to both developers and AI agents.

---

## 2. Languages & Runtimes

| Element | Choice | Version |
|---|---|---|
| **Language** | TypeScript | 5.x |
| **Runtime** | Node.js | 20+ (LTS) |
| **Framework** | Next.js (App Router) | 16 |
| **Database ORM** | Prisma | 6 |
| **Styling** | Vanilla CSS / CSS Modules | Standard CSS |

---

## 3. Tooling Configuration

- **Linter:** ESLint with Next.js and TypeScript plugins.
- **Formatter:** Prettier.
- **Type Checking:** `tsc`.

---

## 4. TypeScript Standards

### 4.1 Naming
| Element | Convention | Example |
|---|---|---|
| Files (Components) | `PascalCase.tsx` | `DonationCard.tsx` |
| Files (Utils/Logic) | `camelCase.ts` | `matchingLogic.ts` |
| Components | `PascalCase` | `function DonationList()` |
| Functions / Variables| `camelCase` | `const findMatches` |
| Types / Interfaces | `PascalCase` | `interface UserProfile` |
| Enums | `PascalCase` | `enum DonationStatus` |

### 4.2 Code Style
- Use `interface` for object definitions; `type` for unions/aliases.
- Prefer `const` over `let`.
- Use arrow functions for callbacks; standard functions for components.
- Strict type checking enabled (`strict: true` in `tsconfig.json`).

---

## 5. Next.js Patterns (App Router)

### 5.1 Components
- **Server Components:** Default choice for data fetching and static content.
- **Client Components:** Use sparingly for interactivity (e.g., forms, maps, toggles). Add `'use client';` directive.
- **Layouts:** Use `layout.tsx` for shared UI structures.

### 5.2 Data Fetching
- Fetch data directly in Server Components using `async/await`.
- Use Prisma client singleton from `lib/db.ts`.

### 5.3 Server Actions
- Use for all mutations.
- Organize in `lib/actions/*.ts`.
- Return standardized objects: `{ data?: T, error?: string }`.

---

## 6. CSS Standards

- Use **CSS Modules** (`Name.module.css`) to prevent global namespace pollution.
- Use CSS Custom Properties (variables) for design tokens (colors, spacing).
- No TailwindCSS unless explicitly requested.

---

## 7. Import Rules

- Order: React/Next.js → External Libraries → Internal Components → Lib/Utils → Styles.
- Use absolute imports with `@/` prefix (configured in `tsconfig.json`).

```typescript
import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { prisma } from '@/lib/db';
import styles from './Dashboard.module.css';
```

---

## 8. Git Standards

- Follow Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`.
- Branch naming: `feature/name`, `bugfix/name`.

---

*End of coding-standards.md*
