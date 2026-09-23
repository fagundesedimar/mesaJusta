import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) throw new Error('DATABASE_URL is required')

const dbUrl = new URL(databaseUrl)
dbUrl.searchParams.delete('sslmode')
const pool = new Pool({ connectionString: dbUrl.toString(), ssl: { rejectUnauthorized: false } })
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

interface SeedUser {
  email: string
  role: 'DONOR' | 'ONG' | 'ADMIN'
  greenCoins: number
  latitude?: number
  longitude?: number
  profile: {
    name: string
    document: string
    zipCode: string
    state: string
    profileType: string
  }
}

async function upsertUser(hash: string, u: SeedUser) {
  return prisma.user.upsert({
    where: { email: u.email },
    create: {
      email: u.email,
      passwordHash: hash,
      role: u.role,
      greenCoins: u.greenCoins,
      latitude: u.latitude,
      longitude: u.longitude,
      profile: { create: u.profile },
    },
    update: {
      role: u.role,
      greenCoins: u.greenCoins,
      latitude: u.latitude,
      longitude: u.longitude,
      profile: {
        upsert: {
          create: u.profile,
          update: u.profile,
        },
      },
    },
  })
}

async function seed() {
  const hash = await bcrypt.hash('123456', 10)

  console.log('Upsert de usuários de teste (idempotente)...')

  await upsertUser(hash, {
    email: 'admin@mesajusta.com',
    role: 'ADMIN',
    greenCoins: 0,
    profile: { name: 'Administrador', document: '00000000000', zipCode: '01001000', state: 'SP', profileType: 'ADMIN' },
  })

  const donor1 = await upsertUser(hash, {
    email: 'doador@teste.com',
    role: 'DONOR',
    greenCoins: 750,
    latitude: -23.5505,
    longitude: -46.6333,
    profile: { name: 'Doador Teste', document: '12345678901', zipCode: '01001000', state: 'SP', profileType: 'DONOR' },
  })

  const donor2 = await upsertUser(hash, {
    email: 'maria@teste.com',
    role: 'DONOR',
    greenCoins: 320,
    latitude: -23.5610,
    longitude: -46.6560,
    profile: { name: 'Maria Silva', document: '98765432100', zipCode: '01311000', state: 'SP', profileType: 'DONOR' },
  })

  await upsertUser(hash, {
    email: 'ong@teste.com',
    role: 'ONG',
    greenCoins: 0,
    latitude: -23.5400,
    longitude: -46.6200,
    profile: { name: 'ONG Teste', document: '12345678901234', zipCode: '01001000', state: 'SP', profileType: 'ONG' },
  })

  await upsertUser(hash, {
    email: 'ongsolidaria@teste.com',
    role: 'ONG',
    greenCoins: 0,
    latitude: -23.5700,
    longitude: -46.6500,
    profile: { name: 'ONG Solidária', document: '43210987654321', zipCode: '01501000', state: 'SP', profileType: 'ONG' },
  })

  const now = new Date()

  const donationsData = [
    { donorId: donor1.id, name: 'Arroz 5kg', category: 'Mercearia', weightKg: 5, expiresDays: 180, latitude: -23.5505, longitude: -46.6333 },
    { donorId: donor1.id, name: 'Feijão 2kg', category: 'Mercearia', weightKg: 2, expiresDays: 365, latitude: -23.5510, longitude: -46.6340 },
    { donorId: donor1.id, name: 'Pão Francês (30 unid)', category: 'Panificados', weightKg: 1.5, expiresDays: 1, latitude: -23.5498, longitude: -46.6325 },
    { donorId: donor1.id, name: 'Leite 1L (6 unid)', category: 'Laticínios', weightKg: 6, expiresDays: 7, latitude: -23.5520, longitude: -46.6350 },
    { donorId: donor1.id, name: 'Macarrão 500g (10 pacotes)', category: 'Refeições Prontas', weightKg: 5, expiresDays: 365, latitude: -23.5490, longitude: -46.6310 },
    { donorId: donor2.id, name: 'Tomate (5kg)', category: 'Hortifrúti', weightKg: 5, expiresDays: 5, latitude: -23.5610, longitude: -46.6560 },
    { donorId: donor2.id, name: 'Frango Congelado (3kg)', category: 'Proteínas', weightKg: 3, expiresDays: 60, latitude: -23.5615, longitude: -46.6570 },
    { donorId: donor2.id, name: 'Iogurte Natural (12 unid)', category: 'Laticínios', weightKg: 3, expiresDays: 14, latitude: -23.5600, longitude: -46.6550 },
  ]

  console.log('Garantindo doações de teste (idempotente, sem apagar existentes)...')

  for (const d of donationsData) {
    const existing = await prisma.donation.findFirst({
      where: { donorId: d.donorId, name: d.name },
    })

    if (existing) continue

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
        latitude: d.latitude,
        longitude: d.longitude,
      },
    })
  }

  console.log('')
  console.log('=== USUÁRIOS DE TESTE (senha: 123456) ===')
  console.log('Admin: admin@mesajusta.com')
  console.log('Doador: doador@teste.com')
  console.log('Doador: maria@teste.com')
  console.log('ONG:    ong@teste.com')
  console.log('ONG:    ongsolidaria@teste.com')
  console.log(`${donationsData.length} doações garantidas (doadores de teste).`)
  console.log('')

  await prisma.$disconnect()
}

seed().catch((e) => {
  console.error('Erro no seed:', e)
  process.exit(1)
})
