import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromHeader } from '@/lib/auth'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = getTokenFromHeader(req.headers.get('authorization'))
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let payload
  try { payload = await verifyToken(token) } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  if (payload.role !== 'ngo') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const matchId = parseInt(id)

  const ngo = await prisma.nGO.findUnique({ where: { userId: Number(payload.sub) } })
  if (!ngo) return NextResponse.json({ error: 'NGO profile not found' }, { status: 400 })

  const match = await prisma.match.findFirst({ where: { id: matchId, ngoId: ngo.id } })
  if (!match) return NextResponse.json({ error: 'Match not found' }, { status: 404 })
  if (match.status !== 'pending') return NextResponse.json({ error: 'Match is not pending' }, { status: 409 })

  const donation = await prisma.donation.findUnique({ where: { id: match.donationId } })
  if (!donation || donation.status !== 'available') {
    return NextResponse.json({ error: 'Donation no longer available' }, { status: 409 })
  }

  await prisma.$transaction([
    prisma.match.update({ where: { id: matchId }, data: { status: 'accepted' } }),
    prisma.donation.update({ where: { id: donation.id }, data: { status: 'matched' } }),
    prisma.match.updateMany({
      where: { donationId: donation.id, id: { not: matchId } },
      data: { status: 'expired' },
    }),
    prisma.pickup.create({ data: { matchId, status: 'accepted' } }),
  ])

  return new NextResponse(null, { status: 204 })
}
