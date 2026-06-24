import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const databaseUrl = process.env.DATABASE_URL!
if (!databaseUrl) throw new Error('DATABASE_URL is required')

async function seed() {
  const prisma = new PrismaClient({ adapter: new PrismaPg(databaseUrl) })

  await prisma.auditLog.deleteMany()
  await prisma.donation.deleteMany()
  await prisma.profile.deleteMany()
  await prisma.user.deleteMany()

  const hash = await bcrypt.hash('123456', 10)

  const donor = await prisma.user.create({
    data: {
      email: 'doador@teste.com',
      passwordHash: hash,
      role: 'DONOR',
      greenCoins: 750,
      profile: { create: { name: 'Doador Teste', document: '12345678901', zipCode: '01001000', state: 'SP', profileType: 'DONOR' } },
    },
  })

  const ong = await prisma.user.create({
    data: {
      email: 'ong@teste.com',
      passwordHash: hash,
      role: 'ONG',
      profile: { create: { name: 'ONG Teste', document: '12345678901234', zipCode: '01001000', state: 'SP', profileType: 'ONG' } },
    },
  })

  for (let i = 1; i <= 5; i++) {
    await prisma.donation.create({
      data: {
        name: 'Doação Teste ' + i,
        category: i % 2 === 0 ? 'Proteínas' : 'Refeições Prontas',
        weightKg: 10 + i,
        expiresAt: new Date('2030-12-31'),
        status: 'AVAILABLE',
        donorId: donor.id,
        latitude: -23.5505 + (Math.random() - 0.5) * 0.1,
        longitude: -46.6333 + (Math.random() - 0.5) * 0.1,
      },
    })
  }

  console.log('=== Usuários criados ===')
  console.log('Doador: doador@teste.com / 123456')
  console.log('ONG:    ong@teste.com / 123456')
  console.log('5 doações criadas com geolocalização.')

  await prisma.$disconnect()
}

seed().catch((e) => { console.error(e); process.exit(1) })
