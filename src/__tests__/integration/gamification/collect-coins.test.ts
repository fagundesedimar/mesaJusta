import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth/password'
import { signToken } from '@/lib/auth/token'

const API_BASE = 'http://localhost:3000/api/v1/reservations/confirm'

let donorToken: string
let ongToken: string
let donationId: string
let donorId: string

const VALID_TOKEN = 'ABC123'

beforeAll(async () => {
  await prisma.donation.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.profile.deleteMany()
  await prisma.user.deleteMany()

  const donorHash = await hashPassword('donor123')
  const ongHash = await hashPassword('ong123')

  const donor = await prisma.user.create({
    data: {
      email: 'donor-coins@test.com',
      passwordHash: donorHash,
      role: 'DONOR',
      profile: {
        create: {
          name: 'Donor Coins',
          document: '11111111111',
          zipCode: '01001000',
          state: 'SP',
          profileType: 'DONOR',
        },
      },
    },
  })
  donorId = donor.id

  const ong = await prisma.user.create({
    data: {
      email: 'ong-coins@test.com',
      passwordHash: ongHash,
      role: 'ONG',
      profile: {
        create: {
          name: 'ONG Coins',
          document: '11111111111111',
          zipCode: '01001000',
          state: 'SP',
          profileType: 'ONG',
        },
      },
    },
  })

  const donation = await prisma.donation.create({
    data: {
      name: 'Peito de Frango',
      category: 'Proteínas',
      weightKg: 10,
      expiresAt: new Date('2030-12-31'),
      status: 'RESERVED',
      donorId: donor.id,
      ongId: ong.id,
      token: VALID_TOKEN,
    },
  })
  donationId = donation.id

  donorToken = await signToken({ sub: donor.id, email: donor.email, role: 'DONOR' })
  ongToken = await signToken({ sub: ong.id, email: ong.email, role: 'ONG' })
})

afterAll(async () => {
  await prisma.auditLog.deleteMany()
  await prisma.donation.deleteMany()
  await prisma.profile.deleteMany()
  await prisma.user.deleteMany()
})

describe('POST /api/v1/reservations/confirm — green coins', () => {
  it('credits green coins after successful collection', async () => {
    const userBefore = await prisma.user.findUnique({ where: { id: donorId } })
    expect(userBefore?.greenCoins).toBe(0)

    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `auth_token=${ongToken}`,
      },
      body: JSON.stringify({ donationId, token: VALID_TOKEN }),
    })

    expect(res.status).toBe(200)

    const userAfter = await prisma.user.findUnique({ where: { id: donorId } })
    expect(userAfter?.greenCoins).toBe(150)
  })

  it('returns 409 on second attempt (idempotency)', async () => {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `auth_token=${ongToken}`,
      },
      body: JSON.stringify({ donationId, token: VALID_TOKEN }),
    })

    expect(res.status).toBe(409)

    const userAfter = await prisma.user.findUnique({ where: { id: donorId } })
    expect(userAfter?.greenCoins).toBe(150)
  })
})
