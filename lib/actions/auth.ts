'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_for_dev_only');

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function loginAction(formData: FormData) {
  try {
    const parsedData = loginSchema.parse(Object.fromEntries(formData));

    const user = await prisma.user.findUnique({ where: { email: parsedData.email } });
    if (!user || !user.isActive) {
      return { error: 'Invalid email or password' };
    }

    const isValid = await bcrypt.compare(parsedData.password, user.passwordHash);
    if (!isValid) {
      return { error: 'Invalid email or password' };
    }

    const token = await new SignJWT({ sub: String(user.id), role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    // Set HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/'
    });

    return { 
      data: { 
        id: user.id,
        fullName: user.fullName,
        role: user.role,
        token: token
      } 
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: 'Invalid input' };
    }
    return { error: 'An unexpected error occurred' };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  return { success: true };
}

export async function registerAction(formData: any) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: formData.email }
    });
    
    if (existingUser) {
      return { error: 'Email already exists' };
    }

    const passwordHash = await bcrypt.hash(formData.password, 12);
    
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: formData.email,
          passwordHash,
          fullName: formData.fullName,
          phone: formData.phone,
          role: formData.role
        }
      });
      
      if (formData.role === 'restaurant') {
        await tx.restaurant.create({
          data: {
            userId: newUser.id,
            name: formData.profile.name,
            address: formData.profile.address,
            latitude: formData.profile.latitude,
            longitude: formData.profile.longitude,
            cuisine: formData.profile.cuisine
          }
        });
      } else if (formData.role === 'ngo') {
        await tx.nGO.create({
          data: {
            userId: newUser.id,
            name: formData.profile.name,
            address: formData.profile.address,
            latitude: formData.profile.latitude,
            longitude: formData.profile.longitude,
            capacityKg: formData.profile.capacityKg,
            vehicleType: formData.profile.vehicleType,
            serviceRadiusKm: formData.profile.serviceRadiusKm
          }
        });
      }
      
      return newUser;
    });

    const token = await new SignJWT({ sub: String(user.id), role: user.role })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET);

    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/'
    });

    return { 
      data: { 
        id: user.id,
        fullName: user.fullName,
        role: user.role,
        token: token
      } 
    };
  } catch (error: any) {
    return { error: error.message || 'Registration failed' };
  }
}
