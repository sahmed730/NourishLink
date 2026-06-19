# NourishLink — Frontend Design

> **Version:** 1.0
> **Last Updated:** 2026-06-03
> **Status:** Active
> **Audience:** Frontend engineers, designers, AI agents

---

## 1. Document Purpose

Defines the frontend structure, components, and data flow for the NourishLink web UI using **Next.js 16 (App Router)** and **React**.

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Library** | React 19 |
| **Language** | TypeScript |
| **Styling** | Vanilla CSS (CSS Modules) |
| **Maps** | Leaflet.js (via `react-leaflet`) |

---

## 3. Directory Structure

```
app/
├── layout.tsx                # Root layout (Header, Nav)
├── page.tsx                  # Landing page
├── (auth)/                   # Auth route group
│   ├── login/page.tsx
│   └── register/page.tsx
├── dashboard/                # Dashboard route group
│   ├── restaurant/page.tsx
│   ├── ngo/page.tsx
│   └── admin/page.tsx
components/                   # Shared React components
│   ├── ui/                   # Reusable UI primitives (Button, Card)
│   ├── maps/                 # Map components
│   └── forms/                # Form components
lib/                          # Core utilities
│   ├── actions/              # Next.js Server Actions
│   ├── services/             # Business logic
│   └── db.ts                 # Prisma client
```

---

## 4. Component Patterns

### 4.1 Server Components (RSC)
Used for data fetching and static content. Default choice for pages.
```tsx
// app/dashboard/restaurant/page.tsx
import { getDonations } from '@/lib/services/donation';
import { DonationList } from '@/components/DonationList';

export default async function RestaurantDashboard() {
  const donations = await getDonations();
  return <DonationList initialDonations={donations} />;
}
```

### 4.2 Client Components
Used for interactivity (forms, maps). Marked with `'use client';`.
```tsx
'use client';
import { useForm } from 'react-hook-form';
import { createDonationAction } from '@/lib/actions/donation';

export function DonationForm() {
  const { register, handleSubmit } = useForm();
  
  const onSubmit = async (data) => {
    const { data: newDonation, error } = await createDonationAction(data);
    if (error) alert(error);
  };

  return <form onSubmit={handleSubmit(onSubmit)}>...</form>;
}
```

---

## 5. Styling with CSS Modules

```css
/* components/DonationCard.module.css */
.card {
  border: 1px solid var(--gray-200);
  padding: 1rem;
}
```

```tsx
import styles from './DonationCard.module.css';

export function DonationCard() {
  return <div className={styles.card}>...</div>;
}
```

---

## 6. Accessibility

- Maintain semantic HTML.
- Use `aria-*` attributes where necessary.
- Ensure keyboard focus states are visible.

---

*End of frontend-design.md*
