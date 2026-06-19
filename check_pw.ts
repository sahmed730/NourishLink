import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function check() {
  const user = await prisma.user.findUnique({where: {email: 'admin@nourishlink.com'}});
  if(!user) return console.log('no user');
  
  const isValid = await bcrypt.compare('password', user.passwordHash);
  console.log('Admin password is password:', isValid);
}

check();
