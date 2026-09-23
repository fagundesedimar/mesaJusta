import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth/password'
import { signToken } from '@/lib/auth/token'
import { removeTestUsersByEmail } from '@/__tests__/integration/helpers/cleanup'

const API_BASE = 'http://localhost:3000/api/v1/donations'

let ongToken: string
let ongId: string
const TEST_EMAILS = ['ong-geo@test.com', 'donor-geo@test.com', 'donor-spatial-extra@test.com']

const ORIGIN_LAT = -19.9190
const ORIGIN_LNG = -43.9381

beforeAll(async () => {
  await removeTestUsersByEmail(TEST_EMAILS)

  const hash = await hashPassword('ong123')

  const ong = await prisma.user.create({
    data: {
      email: 'ong-geo@test.com',
      passwordHash: hash,
      role: 'ONG',
      latitude: ORIGIN_LAT,
      longitude: ORIGIN_LNG,
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
        latitude: -19.9190,
        longitude: -43.9381,
      },
      {
        name: 'Distante',
        category: 'Mercearia',
        weightKg: 10,
        expiresAt: new Date('2030-12-31'),
        status: 'AVAILABLE',
        donorId: donor.id,
        latitude: -19.9400,
        longitude: -43.9600,
      },
      {
        name: 'Fora do raio',
        category: 'Proteínas',
        weightKg: 3,
        expiresAt: new Date('2030-12-31'),
        status: 'AVAILABLE',
        donorId: donor.id,
        latitude: -21.0,
        longitude: -46.0,
      },
      {
        name: 'Reservada vencida',
        category: 'Hortifrúti',
        weightKg: 2,
        expiresAt: new Date('2020-01-01'),
        status: 'RESERVED',
        donorId: donor.id,
        latitude: -19.9192,
        longitude: -43.9385,
      },
    ],
  })

  ongToken = await signToken({ sub: ong.id, email: ong.email, role: 'ONG' })
})

afterAll(async () => {
  await removeTestUsersByEmail(TEST_EMAILS).catch(() => {})
})

describe('GET /api/v1/donations?lat&lng&radius', () => {
  it('returns donations ordered by distance within radius', async () => {
    const res = await fetch(
      `${API_BASE}?lat=${ORIGIN_LAT}&lng=${ORIGIN_LNG}&radius=10`,
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
      `${API_BASE}?lat=${ORIGIN_LAT}&lng=${ORIGIN_LNG}&radius=2`,
      { headers: { Cookie: `auth_token=${ongToken}` } }
    )
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.donations.length).toBe(1)
  })

  it('expires overdue RESERVED donations before returning the map result', async () => {
    const res = await fetch(
      `${API_BASE}?lat=${ORIGIN_LAT}&lng=${ORIGIN_LNG}&radius=10`,
      { headers: { Cookie: `auth_token=${ongToken}` } }
    )
    expect(res.status).toBe(200)

    const expired = await prisma.donation.findFirst({
      where: { name: 'Reservada vencida' },
    })
    expect(expired?.status).toBe('EXPIRED')
  })

  it('returns all donations without spatial params', async () => {
    const res = await fetch(API_BASE, {
      headers: { Cookie: `auth_token=${ongToken}` },
    })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.donations.length).toBeGreaterThanOrEqual(1)
    for (const d of body.donations) {
      expect(d.status).toBe('AVAILABLE')
    }
  })

  it('returns 403 for DONOR role with spatial params', async () => {
    const donorHash = await hashPassword('test123')
    const donor = await prisma.user.create({
      data: {
        email: 'donor-spatial-extra@test.com',
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
      `${API_BASE}?lat=${ORIGIN_LAT}&lng=${ORIGIN_LNG}&radius=10`,
      { headers: { Cookie: `auth_token=${donorToken}` } }
    )
    expect(res.status).toBe(403)
  })
})
