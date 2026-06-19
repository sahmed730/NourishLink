# NourishLink — Authentication & Authorization Flow

> **Version:** 1.0
> **Last Updated:** 2026-06-03
> **Status:** Active
> **Audience:** Backend, frontend, security, AI agents

---

## 1. Document Purpose

Defines **how** users register, log in, prove identity on every request, and how role-based access is enforced. Covers JWT structure using the `jose` library, password policy, session lifecycle, and the on-the-wire sequences.

For security threats & mitigations: see [`security.md`](./security.md).
For API contract: see [`api-specification.md`](./api-specification.md).

---

## 2. Authentication Goals

1. **Stateless server** — JWT validated on every protected request.
2. **7-Day Expiry** — Improved user experience for frequent donors and NGOs.
3. **Role-aware** — RESTAURANT / NGO / ADMIN distinct from issuance.
4. **Brute-force resistant** — Rate limiting + `bcryptjs` slow hash.
5. **TypeScript-first** — Type-safe implementation using modern Node.js primitives.

---

## 3. Demo Credentials

| Role | Email | Password |
|---|---|---|
| 🍽️ Restaurant | `restaurant@demo.com` | `password123` |
| 🤝 NGO | `ngo@demo.com` | `password123` |
| 🛡️ Admin | `admin@nourishlink.com` | `admin123` |

---

## 4. Implementation Details

### 4.1 Library: `jose`
We use `jose` for lightweight, edge-compatible JWT handling.

### 4.2 Hashing: `bcryptjs`
Used for password hashing to ensure compatibility across different Node.js environments.

---

## 5. JWT Structure

**Payload**
```json
{
  "sub": "42",          // User ID
  "role": "RESTAURANT", // RESTAURANT | NGO | ADMIN
  "iat": 1717413600,    // Issued at
  "exp": 1718018400     // Expires (iat + 7 days)
}
```

---

## 6. Code Examples (TypeScript)

### 6.1 Creating a Token
```typescript
import { SignJWT } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function createToken(userId: number, role: string) {
  return await new SignJWT({ role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setSubject(userId.toString())
    .setExpirationTime('7d')
    .sign(secret);
}
```

### 6.2 Verifying a Token
```typescript
import { jwtVerify } from 'jose';

export async function verifyToken(token: string) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);
  return payload;
}
```

---

## 7. Token Storage & Lifecycle

- **Storage:** `localStorage.nl_token`.
- **Expiry:** 7 days (`604800` seconds).
- **Cleanup:** On logout, the client removes the token from `localStorage`.
- **Authorization:** Included in the `Authorization: Bearer <token>` header for all protected API calls and passed to Server Actions.

---

## 8. Role-Based Access Control

Enforced in Next.js Middleware for routes and in the Service Layer for business logic.

| Action | RESTAURANT | NGO | ADMIN |
|---|---|---|---|
| Post Donation | ✅ | ❌ | ✅ |
| Accept Match | ❌ | ✅ | ✅ |
| View All Users | ❌ | ❌ | ✅ |

---

## 9. Error Handling

- **401 Unauthorized:** Missing or invalid token. Redirect to `/login`.
- **403 Forbidden:** Valid token but insufficient role permissions.

---

*End of authentication-flow.md*
