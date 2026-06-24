import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) throw new Error('DATABASE_URL is required')

const prisma = new PrismaClient({ adapter: new PrismaPg(databaseUrl) })

async function seed() {
  console.log('Limpando banco de dados...')
  await prisma.auditLog.deleteMany()
  await prisma.donation.deleteMany()
  await prisma.profile.deleteMany()
  await prisma.user.deleteMany()

  const hash = await bcrypt.hash('123456', 10)

  console.log('Criando usuários de teste...')

  const admin = await prisma.user.create({
    data: {
      email: 'admin@mesajusta.com',
      passwordHash: hash,
      role: 'ADMIN',
      greenCoins: 0,
      profile: {
        create: {
          name: 'Administrador',
          document: '00000000000',
          zipCode: '01001000',
          state: 'SP',
          profileType: 'ADMIN',
        },
      },
    },
  })

  const donor1 = await prisma.user.create({
    data: {
      email: 'doador@teste.com',
      passwordHash: hash,
      role: 'DONOR',
      greenCoins: 750,
      latitude: -23.5505,
      longitude: -46.6333,
      profile: {
        create: {
          name: 'Doador Teste',
          document: '12345678901',
          zipCode: '01001000',
          state: 'SP',
          profileType: 'DONOR',
        },
      },
    },
  })

  const donor2 = await prisma.user.create({
    data: {
      email: 'maria@teste.com',
      passwordHash: hash,
      role: 'DONOR',
      greenCoins: 320,
      latitude: -23.5610,
      longitude: -46.6560,
      profile: {
        create: {
          name: 'Maria Silva',
          document: '98765432100',
          zipCode: '01311000',
          state: 'SP',
          profileType: 'DONOR',
        },
      },
    },
  })

  const ong1 = await prisma.user.create({
    data: {
      email: 'ong@teste.com',
      passwordHash: hash,
      role: 'ONG',
      greenCoins: 0,
      latitude: -23.5400,
      longitude: -46.6200,
      profile: {
        create: {
          name: 'ONG Teste',
          document: '12345678901234',
          zipCode: '01001000',
          state: 'SP',
          profileType: 'ONG',
        },
      },
    },
  })

  const ong2 = await prisma.user.create({
    data: {
      email: 'ongsolidaria@teste.com',
      passwordHash: hash,
      role: 'ONG',
      greenCoins: 0,
      latitude: -23.5700,
      longitude: -46.6500,
      profile: {
        create: {
          name: 'ONG Solidária',
          document: '43210987654321',
          zipCode: '01501000',
          state: 'SP',
          profileType: 'ONG',
        },
      },
    },
  })

  console.log('Criando doações...')

  const categories = ['Refeições Prontas', 'Proteínas', 'Grãos', 'Hortifrúti', 'Laticínios', 'Panificados']
  const now = new Date()

  const donationsData = [
    { donorId: donor1.id, name: 'Arroz 5kg', category: 'Grãos', weightKg: 5, expiresDays: 180 },
    { donorId: donor1.id, name: 'Feijão 2kg', category: 'Grãos', weightKg: 2, expiresDays: 365 },
    { donorId: donor1.id, name: 'Pão Francês (30 unid)', category: 'Panificados', weightKg: 1.5, expiresDays: 1 },
    { donorId: donor1.id, name: 'Leite 1L (6 unid)', category: 'Laticínios', weightKg: 6, expiresDays: 7 },
    { donorId: donor1.id, name: 'Macarrão 500g (10 pacotes)', category: 'Refeições Prontas', weightKg: 5, expiresDays: 365 },
    { donorId: donor2.id, name: 'Tomate (5kg)', category: 'Hortifrúti', weightKg: 5, expiresDays: 5 },
    { donorId: donor2.id, name: 'Frango Congelado (3kg)', category: 'Proteínas', weightKg: 3, expiresDays: 60 },
    { donorId: donor2.id, name: 'Iogurte Natural (12 unid)', category: 'Laticínios', weightKg: 3, expiresDays: 14 },
  ]

  for (const d of donationsData) {
    const expiresAt = new Date(now)
    expiresAt.setDate(expiresAt.getDate() + d.expiresDays)

    await prisma.donation.create({
      data: {
        name: d.name,
        category: d.category,
        weightKg: d.weightKg,
        expiresAt,
        status: 'AVAILABLE',
        donorId: d.donorId,
        latitude: -23.5505 + (Math.random() - 0.5) * 0.1,
        longitude: -46.6333 + (Math.random() - 0.5) * 0.1,
      },
    })
  }

  console.log('')
  console.log('=== USUÁRIOS CRIADOS (senha: 123456) ===')
  console.log('Admin: admin@mesajusta.com')
  console.log('Doador: doador@teste.com')
  console.log('Doador: maria@teste.com')
  console.log('ONG:    ong@teste.com')
  console.log('ONG:    ongsolidaria@teste.com')
  console.log(`${donationsData.length} doações criadas.`)
  console.log('')

  await prisma.$disconnect()
}

seed().catch((e) => {
  console.error('Erro no seed:', e)
  process.exit(1)
})
