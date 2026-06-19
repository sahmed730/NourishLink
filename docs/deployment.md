# NourishLink — Deployment Guide

> **Version:** 1.0
> **Last Updated:** 2026-06-03
> **Status:** Active
> **Audience:** DevOps, SRE, AI agents

---

## 1. Document Purpose

Defines how NourishLink is **built, packaged, configured, and deployed** using the Next.js and Prisma stack.

For architecture: see [`system-architecture.md`](./system-architecture.md).

---

## 2. Local Development

### 2.1 Prerequisites
- Node.js 20+ (LTS)
- npm or pnpm

### 2.2 Quickstart
```bash
# 1. Clone
git clone https://github.com/your-org/nurishlink.git
cd nurishlink

# 2. Install
npm install

# 3. Configure
cp .env.example .env
# Edit .env and set DATABASE_URL and JWT_SECRET

# 4. Initialize DB
npx prisma migrate dev --name init
npx prisma db seed

# 5. Run
npm run dev
```

Open `http://localhost:3000`.

---

## 3. Production Deployment

### 3.1 Vercel (Recommended)
1. Push code to GitHub/GitLab.
2. Connect repository to Vercel.
3. Configure environment variables.
4. Vercel automatically handles builds and deployments.
5. Note: For SQLite on Vercel, use a persistent storage solution (like Vercel Blob or an external database like Upstash/Neon) or deploy to a VPS if file-system persistence is required.

### 3.2 Node.js Server (VPS/Docker)
1. Build the application: `npm run build`.
2. Start the production server: `npm start`.
3. Use a process manager like `pm2` to ensure uptime.
4. Set up Nginx as a reverse proxy for TLS termination.

---

## 4. Database Migrations

Always run migrations during the deployment phase:

```bash
# In production
npx prisma migrate deploy
```

---

## 5. Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Prisma connection string (e.g., `file:./dev.db`) |
| `JWT_SECRET` | Secret for signing tokens |
| `NEXT_PUBLIC_APP_URL` | Base URL of the application |

---

## 6. Backups

For SQLite deployments on a VPS:
- Periodically copy the `prisma/dev.db` file to a secure backup location.
- Use a cron job for automated daily backups.

---

*End of deployment.md*
