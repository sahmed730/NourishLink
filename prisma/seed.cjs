const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  const adminHash = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@nourishlink.com' },
    update: {},
    create: { email: 'admin@nourishlink.com', passwordHash: adminHash, fullName: 'Admin User', role: 'admin' },
  })
  console.log('✓ Admin:', admin.email)

  const restHash = await bcrypt.hash('password123', 12)
  const restUser = await prisma.user.upsert({
    where: { email: 'restaurant@demo.com' },
    update: {},
    create: { email: 'restaurant@demo.com', passwordHash: restHash, fullName: 'Demo Restaurant', role: 'restaurant' },
  })
  await prisma.restaurant.upsert({
    where: { userId: restUser.id },
    update: {},
    create: { userId: restUser.id, name: 'Green Kitchen', address: '123 Food Street', latitude: 28.6139, longitude: 77.2090, cuisine: 'Multi-Cuisine' },
  })
  console.log('✓ Restaurant:', restUser.email)

  const ngoHash = await bcrypt.hash('password123', 12)
  const ngoUser = await prisma.user.upsert({
    where: { email: 'ngo@demo.com' },
    update: {},
    create: { email: 'ngo@demo.com', passwordHash: ngoHash, fullName: 'Demo NGO', role: 'ngo' },
  })
  await prisma.nGO.upsert({
    where: { userId: ngoUser.id },
    update: {},
    create: { userId: ngoUser.id, name: 'Feed India', address: '456 Hope Ave', latitude: 28.6200, longitude: 77.2150, vehicleType: 'van', serviceRadiusKm: 15, capacityKg: 100 },
  })
  console.log('✓ NGO:', ngoUser.email)

  console.log('\n✅ Seed complete!')
  console.log('\nDemo credentials:')
  console.log('  Restaurant: restaurant@demo.com / password123')
  console.log('  NGO:        ngo@demo.com / password123')
  console.log('  Admin:      admin@nourishlink.com / admin123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
