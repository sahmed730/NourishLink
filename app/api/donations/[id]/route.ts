import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromHeader } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = getTokenFromHeader(req.headers.get('authorization'))
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try { await verifyToken(token) } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }

  const { id } = await params
  const donation = await prisma.donation.findUnique({
    where: { id: parseInt(id) },
    include: { restaurant: true },
  })
  if (!donation) return NextResponse.json({ error: 'Donation not found' }, { status: 404 })
  return NextResponse.json(donation)
}
