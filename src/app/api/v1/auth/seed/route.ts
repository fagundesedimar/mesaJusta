import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const auth = request.headers.get('x-seed-key')
    if (auth !== 'mesa-justa-seed-2026') {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 })
    }

    const hash = await bcrypt.hash('123456', 10)

    await prisma.auditLog.deleteMany()
    await prisma.donation.deleteMany()
    await prisma.profile.deleteMany()
    await prisma.user.deleteMany()

    const admin = await prisma.user.create({
      data: {
        email: 'admin@mesajusta.com',
        passwordHash: hash,
        role: 'ADMIN',
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

    return NextResponse.json({
      message: 'Banco populado com dados de teste.',
      users: {
        admin: 'admin@mesajusta.com',
        donor: 'doador@teste.com',
        donor2: 'maria@teste.com',
        ong: 'ong@teste.com',
        ong2: 'ongsolidaria@teste.com',
      },
      password: '123456',
      donations: donationsData.length,
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
  }
}
