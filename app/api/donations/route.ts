import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromHeader } from '@/lib/auth'
import { findMatches } from '@/lib/services/matching'

async function getUser(req: NextRequest) {
  const token = getTokenFromHeader(req.headers.get('authorization'))
  if (!token) return null
  try {
    return await verifyToken(token)
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const payload = await getUser(req)
  if (!payload) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('page_size') || '20')

  const where: Record<string, string> = {}
  if (payload.role === 'ngo') {
    where.status = 'available'
  } else if (status) {
    where.status = status
  }

  const [total, items] = await Promise.all([
    prisma.donation.count({ where }),
    prisma.donation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { restaurant: true },
    }),
  ])

  return NextResponse.json({ items, page, pageSize, total })
}

export async function POST(req: NextRequest) {
  const payload = await getUser(req)
  if (!payload || payload.role !== 'restaurant') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const restaurant = await prisma.restaurant.findUnique({
      where: { userId: Number(payload.sub) },
    })
    if (!restaurant) return NextResponse.json({ error: 'Restaurant profile not found' }, { status: 400 })

    const donation = await prisma.donation.create({
      data: {
        restaurantId: restaurant.id,
        latitude: restaurant.latitude,
        longitude: restaurant.longitude,
        title: body.title,
        description: body.description,
        foodType: body.food_type || body.foodType,
        quantityKg: body.quantity_kg || body.quantityKg,
        servings: body.servings,
        preparedAt: body.prepared_at ? new Date(body.prepared_at) : null,
        expiresAt: new Date(body.expires_at || body.expiresAt),
        pickupWindowStart: new Date(body.pickup_window_start || body.pickupWindowStart),
        pickupWindowEnd: new Date(body.pickup_window_end || body.pickupWindowEnd),
      },
    })

    const matches = await findMatches(donation.id, 5)

    return NextResponse.json(
      { id: donation.id, status: donation.status, match_count: matches.length, created_at: donation.createdAt },
      { status: 201 }
    )
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
