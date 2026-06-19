# NourishLink — AI Features (Matching & Routing)

> **Version:** 1.0
> **Last Updated:** 2026-06-03
> **Status:** Active
> **Audience:** Engineers, AI agents

---

## 1. Document Purpose

Specifies the algorithmic features of NourishLink: the donation-to-NGO matching engine and the multi-stop pickup route optimizer, now implemented in **TypeScript**.

---

## 2. Matching Engine

### 2.1 Goal
Select the most suitable NGOs for a donation based on multiple criteria.

### 2.2 Score Components (TypeScript)

#### 2.2.1 Proximity Score
```typescript
function computeProximityScore(distanceKm: number, radiusKm: number): number {
  return Math.max(0.0, 1.0 - distanceKm / radiusKm);
}
```

#### 2.2.2 Capacity Score
```typescript
function computeCapacityScore(ngoCapacityKg: number | null, donationQuantityKg: number): number {
  if (!ngoCapacityKg || ngoCapacityKg <= 0) return 1.0;
  return Math.min(1.0, ngoCapacityKg / donationQuantityKg);
}
```

#### 2.2.3 Freshness Score
```typescript
function computeFreshnessScore(expiresAt: Date): number {
  const now = new Date();
  const remainingHours = Math.max(0.0, (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60));
  return Math.min(1.0, remainingHours / 24.0);
}
```

### 2.3 Weighted Scoring
```typescript
const WEIGHTS = {
  proximity: 0.45,
  capacity: 0.20,
  freshness: 0.25,
  vehicle: 0.10,
};

function calculateScore(components: ScoreComponents): number {
  return (
    WEIGHTS.proximity * components.proximity +
    WEIGHTS.capacity * components.capacity +
    WEIGHTS.freshness * components.freshness +
    WEIGHTS.vehicle * components.vehicle
  ) * 100;
}
```

---

## 3. Route Optimization

Implemented using **Nearest-Neighbor** followed by **2-opt** improvement in TypeScript.

```typescript
// lib/services/routing.ts
export function nearestNeighbor(start: Coord, stops: Stop[]): Stop[] {
  let unvisited = [...stops];
  let route: Stop[] = [];
  let current = start;

  while (unvisited.length > 0) {
    let nearest = unvisited.reduce((prev, curr) => 
      distance(current, curr) < distance(current, prev) ? curr : prev
    );
    route.push(nearest);
    unvisited = unvisited.filter(s => s !== nearest);
    current = nearest;
  }
  return route;
}
```

---

*End of ai-features.md*
