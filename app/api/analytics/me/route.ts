import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromHeader } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const token = getTokenFromHeader(req.headers.get('authorization'))
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let payload
  try { payload = await verifyToken(token) } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

  if (payload.role === 'restaurant') {
    const restaurant = await prisma.restaurant.findUnique({ where: { userId: Number(payload.sub) } })
    if (!restaurant) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const [total, available, matched, pickedUp, totalKg] = await Promise.all([
      prisma.donation.count({ where: { restaurantId: restaurant.id } }),
      prisma.donation.count({ where: { restaurantId: restaurant.id, status: 'available' } }),
      prisma.donation.count({ where: { restaurantId: restaurant.id, status: 'matched' } }),
      prisma.donation.count({ where: { restaurantId: restaurant.id, status: 'picked_up' } }),
      prisma.donation.aggregate({ where: { restaurantId: restaurant.id }, _sum: { quantityKg: true } }),
    ])
    return NextResponse.json({ total_donations: total, available, matched, picked_up: pickedUp, total_kg: totalKg._sum.quantityKg || 0 })
  }

  if (payload.role === 'ngo') {
    const ngo = await prisma.nGO.findUnique({ where: { userId: Number(payload.sub) } })
    if (!ngo) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const [totalMatches, accepted, completed, totalKg] = await Promise.all([
      prisma.match.count({ where: { ngoId: ngo.id } }),
      prisma.match.count({ where: { ngoId: ngo.id, status: 'accepted' } }),
      prisma.pickup.count({ where: { match: { ngoId: ngo.id }, status: 'completed' } }),
      prisma.pickup.aggregate({ where: { match: { ngoId: ngo.id }, status: 'completed' }, _sum: { collectedKg: true } }),
    ])
    return NextResponse.json({ total_matches: totalMatches, accepted, completed, total_kg_collected: totalKg._sum.collectedKg || 0 })
  }

  return NextResponse.json({ error: 'No analytics for this role' }, { status: 400 })
}
