import { prisma } from '../prisma'
import { haversineKm } from '../geo'
import type { Donation, NGO } from '@prisma/client'

const MATCH_WEIGHTS = {
  proximity: 0.40,
  capacity:  0.25,
  freshness: 0.20,
  vehicle:   0.15,
}

const VEHICLE_SCORES: Record<string, (qty: number) => number> = {
  truck: () => 1.0,
  van:   (qty) => (qty >= 20 ? 1.0 : 0.7),
  car:   (qty) => (qty < 10  ? 0.6 : 0.3),
  bike:  (qty) => (qty < 5   ? 0.4 : 0.0),
}

export function computeScore(donation: Donation, ngo: NGO, distanceKm: number): number {
  const proximity = Math.max(0, 1 - distanceKm / ngo.serviceRadiusKm)

  const capacity =
    !ngo.capacityKg || ngo.capacityKg <= 0
      ? 1.0
      : Math.min(1.0, ngo.capacityKg / donation.quantityKg)

  const now = Date.now()
  const remainingHours = Math.max(0, (donation.expiresAt.getTime() - now) / 3_600_000)
  const freshness = Math.min(1.0, remainingHours / 24)

  const vehicleFn = VEHICLE_SCORES[ngo.vehicleType] ?? (() => 0)
  const vehicle = vehicleFn(donation.quantityKg)

  const raw =
    MATCH_WEIGHTS.proximity * proximity +
    MATCH_WEIGHTS.capacity  * capacity  +
    MATCH_WEIGHTS.freshness * freshness +
    MATCH_WEIGHTS.vehicle   * vehicle

  return Math.round(raw * 100 * 100) / 100
}

export async function findMatches(donationId: number, n = 5) {
  const donation = await prisma.donation.findUniqueOrThrow({ where: { id: donationId } })
  const ngos     = await prisma.nGO.findMany({ where: { isAccepting: true } })

  const now = new Date()
  const candidates: { ngo: NGO; distanceKm: number; score: number }[] = []

  for (const ngo of ngos) {
    const dist = haversineKm(donation.latitude, donation.longitude, ngo.latitude, ngo.longitude)
    if (dist > ngo.serviceRadiusKm) continue

    const pickupEnd = donation.pickupWindowEnd
    const minTime = new Date(now.getTime() + 30 * 60 * 1000)
    if (pickupEnd < minTime) continue

    const score = computeScore(donation, ngo, dist)
    candidates.push({ ngo, distanceKm: dist, score })
  }

  candidates.sort((a, b) => b.score - a.score || a.distanceKm - b.distanceKm)
  const top = candidates.slice(0, n)

  const matches = await Promise.all(
    top.map((c) =>
      prisma.match.create({
        data: {
          donationId,
          ngoId: c.ngo.id,
          distanceKm: Math.round(c.distanceKm * 1000) / 1000,
          score: c.score,
        },
      })
    )
  )

  return matches
}
