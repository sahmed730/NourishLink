# NourishLink — Notification System

> **Version:** 1.0
> **Last Updated:** 2026-06-03
> **Status:** Active
> **Audience:** Backend engineers, product, AI agents

---

## 1. Document Purpose

Defines **when**, **how**, and **to whom** NourishLink sends notifications. Covers event triggers, channel selection, templates, and delivery logic.

---

## 2. Channels

| Channel | MVP | Description |
|---|---|---|
| **In-app** | ✅ | Polled or refreshed on page load |
| **Email** | ✅ | Node.js based delivery (e.g., Nodemailer or Resend) |

---

## 3. Implementation (TypeScript)

### 3.1 Triggering from Server Actions
Notifications are triggered as part of the business logic within Server Actions.

```typescript
// lib/actions/match.ts
import { prisma } from '@/lib/db';
import { sendNotification } from '@/lib/services/notification';

export async function acceptMatch(matchId: number) {
  const match = await prisma.match.update({
    where: { id: matchId },
    data: { status: 'ACCEPTED' },
    include: { donation: { include: { restaurant: true } } }
  });

  await sendNotification({
    userId: match.donation.restaurant.userId,
    type: 'MATCH_ACCEPTED',
    title: 'Match Accepted',
    body: `${match.ngoId} will pick up your donation.`,
  });
}
```

### 3.2 Async Email Delivery
Use a background worker or a serverless function to handle email delivery without blocking the main request.

---

## 4. Templates

Templates are managed as TypeScript functions returning formatted strings or React components for email rendering (e.g., using `react-email`).

---

*End of notification-system.md*
