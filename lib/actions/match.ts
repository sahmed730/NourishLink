'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function acceptMatchAction(matchId: number, ngoUserId: number) {
  try {
    const ngo = await prisma.nGO.findUnique({ where: { userId: ngoUserId } });
    if (!ngo) return { error: 'NGO profile not found.' };

    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match || match.ngoId !== ngo.id) {
      return { error: 'Match not found or unauthorized.' };
    }
    if (match.status !== 'pending') {
      return { error: 'Match is no longer pending.' };
    }

    // Atomic transaction
    await prisma.$transaction([
      prisma.match.update({
        where: { id: matchId },
        data: { status: 'accepted' }
      }),
      prisma.donation.update({
        where: { id: match.donationId },
        data: { status: 'matched' }
      }),
      prisma.match.updateMany({
        where: {
          donationId: match.donationId,
          id: { not: matchId },
          status: 'pending'
        },
        data: { status: 'expired' }
      }),
      prisma.pickup.create({
        data: {
          matchId: matchId,
          status: 'accepted'
        }
      })
    ]);

    // TODO: Send notification to Restaurant

    revalidatePath('/dashboard/ngo');
    return { success: true };
  } catch (error: any) {
    return { error: error.message || 'Failed to accept match' };
  }
}
