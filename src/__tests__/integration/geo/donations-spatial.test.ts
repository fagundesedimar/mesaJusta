import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth/password'
import { signToken } from '@/lib/auth/token'

const API_BASE = 'http://localhost:3000/api/v1/donations'

let ongToken: string
let ongId: string

beforeAll(async () => {
  await prisma.donation.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.profile.deleteMany()
  await prisma.user.deleteMany()

  const hash = await hashPassword('ong123')

  const ong = await prisma.user.create({
    data: {
      email: 'ong-geo@test.com',
      passwordHash: hash,
      role: 'ONG',
      latitude: -23.5505,
      longitude: -46.6333,
      profile: {
        create: {
          name: 'ONG Geo',
          document: '11111111111111',
          zipCode: '01001000',
          state: 'SP',
          profileType: 'ONG',
        },
      },
    },
  })
  ongId = ong.id

  const donorHash = await hashPassword('donor123')
  const donor = await prisma.user.create({
    data: {
      email: 'donor-geo@test.com',
      passwordHash: donorHash,
      role: 'DONOR',
      profile: {
        create: {
          name: 'Donor Geo',
          document: '22222222222',
          zipCode: '01001000',
          state: 'SP',
          profileType: 'DONOR',
        },
      },
    },
  })

  await prisma.donation.createMany({
    data: [
      {
        name: 'Próximo',
        category: 'Hortifrúti',
        weightKg: 5,
        expiresAt: new Date('2030-12-31'),
        status: 'AVAILABLE',
        donorId: donor.id,
        latitude: -23.55,
        longitude: -46.63,
      },
      {
        name: 'Distante',
        category: 'Mercearia',
        weightKg: 10,
        expiresAt: new Date('2030-12-31'),
        status: 'AVAILABLE',
        donorId: donor.id,
        latitude: -23.65,
        longitude: -46.73,
      },
      {
        name: 'Fora do raio',
        category: 'Proteínas',
        weightKg: 3,
        expiresAt: new Date('2030-12-31'),
        status: 'AVAILABLE',
        donorId: donor.id,
        latitude: -24.0,
        longitude: -47.0,
      },
    ],
  })

  ongToken = await signToken({ sub: ong.id, email: ong.email, role: 'ONG' })
})

afterAll(async () => {
  await prisma.donation.deleteMany()
  await prisma.auditLog.deleteMany()
  await prisma.profile.deleteMany()
  await prisma.user.deleteMany()
})

describe('GET /api/v1/donations?lat&lng&radius', () => {
  it('returns donations ordered by distance within radius', async () => {
    const res = await fetch(
      `${API_BASE}?lat=-23.5505&lng=-46.6333&radius=10`,
      { headers: { Cookie: `auth_token=${ongToken}` } }
    )
    expect(res.status).toBe(200)
    const body = await res.json()

    expect(body.donations.length).toBeGreaterThanOrEqual(2)
    expect(body.donations.length).toBeLessThanOrEqual(3)

    for (const d of body.donations) {
      expect(d).toHaveProperty('distanceKm')
      expect(typeof d.distanceKm).toBe('number')
    }

    for (let i = 1; i < body.donations.length; i++) {
      expect(body.donations[i].distanceKm).toBeGreaterThanOrEqual(
        body.donations[i - 1].distanceKm
      )
    }
  })

  it('excludes donations outside the radius', async () => {
    const res = await fetch(
      `${API_BASE}?lat=-23.5505&lng=-46.6333&radius=2`,
      { headers: { Cookie: `auth_token=${ongToken}` } }
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.donations.length).toBe(1)
  })

  it('returns all donations without spatial params', async () => {
    const res = await fetch(API_BASE, {
      headers: { Cookie: `auth_token=${ongToken}` },
    })
    expect(res.status).toBe(403)
  })

  it('returns 403 for DONOR role with spatial params', async () => {
    const donorHash = await hashPassword('test123')
    const donor = await prisma.user.create({
      data: {
        email: `donor-spatial-${Date.now()}@test.com`,
        passwordHash: donorHash,
        role: 'DONOR',
        profile: {
          create: {
            name: 'Donor Spatial',
            document: '33333333333',
            zipCode: '01001000',
            state: 'SP',
            profileType: 'DONOR',
          },
        },
      },
    })
    const donorToken = await signToken({
      sub: donor.id,
      email: donor.email,
      role: 'DONOR',
    })

    const res = await fetch(
      `${API_BASE}?lat=-23.5505&lng=-46.6333&radius=10`,
      { headers: { Cookie: `auth_token=${donorToken}` } }
    )
    expect(res.status).toBe(403)
  })
})
