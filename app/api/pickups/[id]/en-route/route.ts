import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromHeader } from '@/lib/auth'

async function requireNgo(req: NextRequest) {
  const token = getTokenFromHeader(req.headers.get('authorization'))
  if (!token) return null
  try {
    const p = await verifyToken(token)
    if (p.role !== 'ngo') return null
    return p
  } catch { return null }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const payload = await requireNgo(req)
  if (!payload) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const pickup = await prisma.pickup.findUnique({ where: { id: parseInt(id) } })
  if (!pickup || pickup.status !== 'accepted') {
    return NextResponse.json({ error: 'Pickup not found or invalid state' }, { status: 404 })
  }

  const updated = await prisma.pickup.update({
    where: { id: pickup.id },
    data: { status: 'en_route' },
  })
  return NextResponse.json(updated)
}
