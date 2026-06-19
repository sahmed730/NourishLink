# NourishLink — Database Design

> **Version:** 1.0
> **Last Updated:** 2026-06-03
> **Status:** Active
> **Audience:** Engineers, AI agents, DBAs

---

## 1. Document Purpose

Defines the relational schema for NourishLink MVP v1.0. The schema is implemented using **Prisma 6** targeting **SQLite** for the MVP, providing type-safe access and simplified migrations.

For requirements: see [`requirements.md`](./requirements.md).
For architecture: see [`system-architecture.md`](./system-architecture.md).

---

## 2. Design Principles

1. **Normalization:** 3NF minimum. Junction tables only where cardinality requires it.
2. **Type safety:** All columns typed in Prisma; using enums (mapped to strings for SQLite compatibility).
3. **Auditability:** `createdAt` / `updatedAt` on every business table.
4. **Indexability:** Index every foreign key + every common WHERE/ORDER column.
5. **Portability:** Prisma handles the abstraction; schema is ready for PostgreSQL in v1.1.

---

## 3. Entity-Relationship Diagram

```
        ┌────────┐
        │ User   │
        └───┬────┘
            │ 1
   ┌────────┼────────┐
   │ 1      │ 1      │ 1
   ▼        ▼        ▼
┌──────────┐ ┌─────┐ ┌────────┐
│Restaurant│ │ NGO │ │ Admin  │ (role in User)
└──┬───────┘ └──┬──┘ └────────┘
   │ 1          │ 1
   │ *          │ *
   ▼            ▼
┌──────────────┐      ┌─────────┐
│  Donation    │◄────┤  Match  │
└──────┬───────┘  *  └────┬────┘
       │ 1                │ 1
       │ *                │ 1
       │                  ▼
       │           ┌──────────┐
       │           │  Pickup  │
       │           └──────────┘
       │
       │ (used in)
       ▼
┌────────────────────┐
│ Route (per NGO)    │
│  stopsJson → refs  │
└────────────────────┘
```

---

## 4. Prisma Schema (`prisma/schema.prisma`)

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

enum Role {
  RESTAURANT
  NGO
  ADMIN
}

enum VehicleType {
  BIKE
  CAR
  VAN
  TRUCK
}

enum FoodType {
  COOKED
  RAW
  PACKAGED
  BAKERY
}

enum DonationStatus {
  AVAILABLE
  MATCHED
  IN_TRANSIT
  PICKED_UP
  EXPIRED
  CANCELLED
}

enum MatchStatus {
  PENDING
  ACCEPTED
  REJECTED
  EXPIRED
  CANCELLED
}

model User {
  id            Int         @id @default(autoincrement())
  email         String      @unique
  passwordHash  String
  fullName      String
  role          Role
  phone         String?
  isActive      Boolean     @default(true)
  emailVerified Boolean     @default(false)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  restaurant    Restaurant?
  ngo           NGO?
  auditLogs     AuditLog[]

  @@index([role, isActive])
}

model Restaurant {
  id          Int        @id @default(autoincrement())
  userId      Int        @unique
  user        User       @relation(fields: [userId], references: [id])
  name        String
  address     String
  latitude    Float
  longitude   Float
  cuisineType String?
  licenseNo   String?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  donations   Donation[]

  @@index([latitude, longitude])
}

model NGO {
  id               Int         @id @default(autoincrement())
  userId           Int         @unique
  user             User        @relation(fields: [userId], references: [id])
  name             String
  address          String
  latitude         Float
  longitude        Float
  capacityKg       Float?
  vehicleType      VehicleType
  serviceRadiusKm  Float       @default(10.0)
  isAccepting      Boolean     @default(true)
  createdAt        DateTime    @default(now())
  updatedAt        DateTime    @updatedAt

  matches          Match[]
  routes           Route[]

  @@index([latitude, longitude])
  @@index([isAccepting])
}

model Donation {
  id                Int            @id @default(autoincrement())
  restaurantId      Int
  restaurant        Restaurant     @relation(fields: [restaurantId], references: [id])
  title             String
  description       String?
  foodType          FoodType
  quantityKg        Float
  servings          Int?
  preparedAt        DateTime?
  expiresAt         DateTime
  pickupWindowStart DateTime
  pickupWindowEnd   DateTime
  status            DonationStatus @default(AVAILABLE)
  latitude          Float          // Denormalized for matching
  longitude         Float          // Denormalized for matching
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt

  matches           Match[]

  @@index([status, expiresAt])
  @@index([restaurantId, createdAt])
  @@index([latitude, longitude])
}

model Match {
  id          Int         @id @default(autoincrement())
  donationId  Int
  donation    Donation    @relation(fields: [donationId], references: [id])
  ngoId       Int
  ngo         NGO         @relation(fields: [ngoId], references: [id])
  status      MatchStatus @default(PENDING)
  distanceKm  Float?
  score       Float
  createdAt   DateTime    @default(now())
  respondedAt DateTime?

  pickup      Pickup?

  @@unique([donationId, ngoId])
  @@index([ngoId, status])
  @@index([donationId, status])
}

model Pickup {
  id                  Int       @id @default(autoincrement())
  matchId             Int       @unique
  match               Match     @relation(fields: [matchId], references: [id])
  pickupTime          DateTime?
  arrivedAt           DateTime?
  completedAt         DateTime?
  collectedKg         Float?
  verificationPhotoUrl String?
  notes               String?
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt

  @@index([completedAt])
}

model Route {
  id               Int      @id @default(autoincrement())
  ngoId            Int
  ngo              NGO      @relation(fields: [ngoId], references: [id])
  date             DateTime
  stopsJson        String   // JSON string of stops
  totalDistanceKm  Float
  totalDurationMin Float
  polyline         String?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  @@index([ngoId, date])
}

model AuditLog {
  id           Int      @id @default(autoincrement())
  entityType   String
  entityId     Int
  action       String
  fromState    String?
  toState      String
  actorUserId  Int
  actor        User     @relation(fields: [actorUserId], references: [id])
  metadataJson String?
  createdAt    DateTime @default(now())

  @@index([entityType, entityId])
  @@index([actorUserId, createdAt])
}
```

---

## 5. Migrations

Prisma handles migrations via its CLI:

```bash
# Create a new migration and update the database
npx prisma migrate dev --name init

# Deploy migrations in production
npx prisma migrate deploy

# View the database locally
npx prisma studio
```

---

## 6. Performance & Integrity

1. **Denormalization:** `latitude` and `longitude` are copied to `Donation` from `Restaurant` to speed up geo-matching queries.
2. **Transactions:** Complex operations (like accepting a match) use Prisma's `$transaction` to ensure atomicity.
3. **Indexes:** Strategic indexes on frequently queried fields (`status`, `expiresAt`, `userId`, etc.) ensure fast reads.

---

## 7. Backup & Recovery

- **SQLite:** Daily file-level snapshots of `prisma/dev.db`.
- **Retention:** 7 daily + 4 weekly.
- **Offsite:** Periodic sync to secure cloud storage.

---

*End of database-design.md*
