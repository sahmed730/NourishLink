import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, fullName, phone, role, profile } = body

    if (!['restaurant', 'ngo'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 422 })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { email, passwordHash, fullName, phone, role },
    })

    if (role === 'restaurant' && profile) {
      await prisma.restaurant.create({ data: { userId: user.id, ...profile } })
    } else if (role === 'ngo' && profile) {
      await prisma.nGO.create({ data: { userId: user.id, ...profile } })
    }

    const token = await signToken({ sub: user.id, role: user.role })
    return NextResponse.json(
      { message: 'Registered successfully', token, user: { id: user.id, email: user.email, role: user.role, fullName: user.fullName } },
      { status: 201 }
    )
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
