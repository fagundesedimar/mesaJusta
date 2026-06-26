import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth/password'
import { signToken } from '@/lib/auth/token'

const API_BASE = 'http://localhost:3000/api/v1/gamification/ranking'

let donorToken: string
let donorIds: string[]

beforeAll(async () => {
  await prisma.donation.deleteMany()
  await prisma.profile.deleteMany()
  await prisma.user.deleteMany()

  const hash = await hashPassword('test123')
  donorIds = []

  for (let i = 0; i < 12; i++) {
    const user = await prisma.user.create({
      data: {
        email: `donor${i}@test.com`,
        passwordHash: hash,
        role: 'DONOR',
        profile: {
          create: {
            name: `Doador ${i}`,
            document: `${String(i).padStart(11, '0')}`,
            zipCode: '01001000',
            state: 'SP',
            profileType: 'DONOR',
          },
        },
      },
    })
    donorIds.push(user.id)

    await prisma.donation.create({
      data: {
        name: `Doação ${i}`,
        category: 'Mercearia',
        weightKg: (i + 1) * 2,
        expiresAt: new Date('2030-12-31'),
        status: 'COLLECTED',
        donorId: user.id,
      },
    })
  }

  donorToken = await signToken({
    sub: donorIds[0],
    email: 'donor0@test.com',
    role: 'DONOR',
  })
}, 30000)

afterAll(async () => {
  await prisma.donation.deleteMany().catch(() => {})
  await prisma.profile.deleteMany().catch(() => {})
  await prisma.user.deleteMany().catch(() => {})
})

describe('GET /api/v1/gamification/ranking', () => {
  it('returns ordered ranking with max 10 items', async () => {
    const res = await fetch(API_BASE, {
      headers: { Cookie: `auth_token=${donorToken}` },
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.data).toHaveLength(10)

    for (let i = 1; i < body.data.length; i++) {
      expect(body.data[i].greenCoins).toBeLessThanOrEqual(body.data[i - 1].greenCoins)
    }
  })

  it('returns correct fields without sensitive data', async () => {
    const res = await fetch(API_BASE, {
      headers: { Cookie: `auth_token=${donorToken}` },
    })
    const body = await res.json()

    for (const entry of body.data) {
      expect(entry).toHaveProperty('rank')
      expect(entry).toHaveProperty('establishmentName')
      expect(entry).toHaveProperty('greenCoins')
      expect(entry).toHaveProperty('badge')
      expect(entry).not.toHaveProperty('email')
      expect(entry).not.toHaveProperty('document')
      expect(entry).not.toHaveProperty('cpf')
      expect(entry).not.toHaveProperty('cnpj')
    }
  })

  it('returns 401 without authentication', async () => {
    const res = await fetch(API_BASE)
    expect(res.status).toBe(401)
  })
})
