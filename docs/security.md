# NourishLink — Security

> **Version:** 1.0
> **Last Updated:** 2026-06-03
> **Status:** Active
> **Audience:** Engineers, security reviewers, AI agents

---

## 1. Document Purpose

Captures the threat model and security controls for the Next.js and Prisma stack.

---

## 2. Security Goals

1. **Confidentiality** — protect user PII and donation data.
2. **Integrity** — ensure records are tamper-evident.
3. **Accountability** — every state transition is attributable to an authenticated user.

---

## 3. Security Controls

### 3.1 Authentication (JWT)
- Uses `jose` for secure signing and verification.
- Tokens have a 7-day expiry.
- Stored in `localStorage` (XSS risk minimized by strict CSP).

### 3.2 Password Hashing
- Uses `bcryptjs` with a cost factor of 12.

### 3.3 Authorization
- Enforced in Next.js Middleware and Server Actions.
- Ownership checks in the service layer using Prisma.

### 3.4 Data Integrity
- Prisma transactions used for atomic state changes.
- Input validation using Zod schemas.

### 3.5 Security Headers
Configured in `next.config.js`:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: same-origin`
- `Content-Security-Policy`: Strict policy limiting scripts and connections.

---

## 4. Secrets Management

- Secrets stored in `.env` and injected via the hosting platform (e.g., Vercel Secrets).
- Never log secrets or include them in client-side bundles (use `NEXT_PUBLIC_` prefix only for non-sensitive values).

---

## 5. Dependency Security

- `npm audit` on every PR.
- Scheduled Dependabot updates.

---

*End of security.md*
