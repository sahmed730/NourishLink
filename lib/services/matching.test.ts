import { describe, it, expect } from 'vitest';
import { computeScore } from './matching';
import type { Donation, NGO } from '@prisma/client';

describe('Matching Service', () => {
  const baseDonation = {
    quantityKg: 50,
    expiresAt: new Date(Date.now() + 24 * 3600 * 1000), // 24 hours from now
  } as Donation;

  const baseNGO = {
    serviceRadiusKm: 10,
    capacityKg: 50,
    vehicleType: 'truck',
  } as NGO;

  it('should score 100 for perfect match', () => {
    // distance 0 -> proximity 1
    // capacity 50/50 -> 1
    // freshness 24h -> 1
    // vehicle truck -> 1
    const score = computeScore(baseDonation, baseNGO, 0);
    expect(score).toBe(100);
  });

  it('should penalize distance', () => {
    const scoreNear = computeScore(baseDonation, baseNGO, 0);
    const scoreFar = computeScore(baseDonation, baseNGO, 5); // 5km / 10km max -> proximity 0.5 (loss of 0.5 * 0.40 * 100 = 20 points)
    expect(scoreFar).toBe(80);
    expect(scoreFar).toBeLessThan(scoreNear);
  });

  it('should cap proximity penalty to 0 if out of radius', () => {
    const scoreOut = computeScore(baseDonation, baseNGO, 15); // 15km > 10km -> proximity 0
    expect(scoreOut).toBe(60); // 100 - 40
  });

  it('should penalize capacity mismatch', () => {
    const ngoSmall = { ...baseNGO, capacityKg: 25 }; // 25 / 50 = 0.5 -> capacity score 0.5 (loss of 0.5 * 0.25 * 100 = 12.5 points)
    const scoreSmall = computeScore(baseDonation, ngoSmall, 0);
    expect(scoreSmall).toBe(87.5);
  });

  it('should give full capacity score if NGO capacity is huge', () => {
    const ngoBig = { ...baseNGO, capacityKg: 100 }; // 100 / 50 > 1 -> capped at 1.0
    const scoreBig = computeScore(baseDonation, ngoBig, 0);
    expect(scoreBig).toBe(100);
  });
});
