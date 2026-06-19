'use server';

import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { findMatches } from '@/lib/services/matching';

// Define the validation schema using Zod
const createDonationSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().max(500).optional(),
  foodType: z.enum(['cooked', 'raw', 'packaged', 'bakery']),
  quantityKg: z.number().positive("Quantity must be greater than 0"),
  servings: z.number().int().positive().optional(),
  expiresAt: z.string().refine((date) => new Date(date) > new Date(), { message: "Expiry must be in the future" }),
  pickupWindowStart: z.string(),
  pickupWindowEnd: z.string(),
}).refine((data) => new Date(data.pickupWindowEnd) > new Date(data.pickupWindowStart), {
  message: "Pickup window end must be after start",
  path: ["pickupWindowEnd"]
});

export async function createDonationAction(userId: number, formData: any) {
  try {
    // 1. Validate Input
    const parsedData = createDonationSchema.parse(formData);

    // 2. Get Restaurant Profile
    const restaurant = await prisma.restaurant.findUnique({
      where: { userId }
    });

    if (!restaurant) {
      return { error: 'Restaurant profile not found.' };
    }

    // 3. Create Donation
    const donation = await prisma.donation.create({
      data: {
        restaurantId: restaurant.id,
        title: parsedData.title,
        description: parsedData.description,
        foodType: parsedData.foodType,
        quantityKg: parsedData.quantityKg,
        servings: parsedData.servings,
        expiresAt: new Date(parsedData.expiresAt),
        pickupWindowStart: new Date(parsedData.pickupWindowStart),
        pickupWindowEnd: new Date(parsedData.pickupWindowEnd),
        latitude: restaurant.latitude, // Denormalized for fast geo queries
        longitude: restaurant.longitude,
        status: 'available'
      }
    });

    // 4. Trigger Matching Engine Asynchronously
    // We don't await this so the UI response is fast
    findMatches(donation.id).catch(err => console.error("Matching error:", err));

    revalidatePath('/dashboard/restaurant');
    
    return { data: donation };

  } catch (error) {
    if (error instanceof z.ZodError) {
      // Map Zod errors to a simple message or object
      return { error: (error as any).issues[0].message };
    }
    return { error: 'An unexpected error occurred while creating the donation.' };
  }
}
