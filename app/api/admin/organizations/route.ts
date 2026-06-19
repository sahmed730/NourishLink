import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromHeader } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const token = getTokenFromHeader(req.headers.get('authorization'))
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try { 
    const payload = await verifyToken(token) 
    if (payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  } catch { 
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) 
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        role: {
          in: ['restaurant', 'ngo']
        }
      },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        restaurant: {
          select: {
            name: true,
          }
        },
        ngo: {
          select: {
            name: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedOrgs = users.map(u => ({
      id: `ORG-${u.id}`,
      name: u.role === 'restaurant' ? u.restaurant?.name : u.ngo?.name,
      type: u.role === 'restaurant' ? 'Restaurant' : 'NGO',
      status: u.isActive ? 'Active' : 'Inactive',
      joined: u.createdAt.toISOString().split('T')[0]
    }));

    return NextResponse.json({ items: formattedOrgs });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
