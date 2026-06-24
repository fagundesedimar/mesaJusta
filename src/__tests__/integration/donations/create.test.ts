import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth/password'
import { signToken } from '@/lib/auth/token'

const API_BASE = 'http://localhost:3000/api/v1/donations'

let donorToken: string
let ongToken: string
let donorId: string

beforeAll(async () => {
  await prisma.donation.deleteMany()
  await prisma.profile.deleteMany()
  await prisma.user.deleteMany()

  const donorHash = await hashPassword('donor123')
  const ongHash = await hashPassword('ong123')

  const donor = await prisma.user.create({
    data: {
      email: 'donor@test.com',
      passwordHash: donorHash,
      role: 'DONOR',
      profile: { create: { name: 'Donor', document: '12345678901', zipCode: '01001000', state: 'SP', profileType: 'DONOR' } },
    },
  })
  donorId = donor.id

  const ong = await prisma.user.create({
    data: {
      email: 'ong@test.com',
      passwordHash: ongHash,
      role: 'ONG',
      profile: { create: { name: 'Ong', document: '12345678901234', zipCode: '01001000', state: 'SP', profileType: 'ONG' } },
    },
  })

  donorToken = await signToken({ sub: donor.id, email: donor.email, role: 'DONOR' })
  ongToken = await signToken({ sub: ong.id, email: ong.email, role: 'ONG' })
})

afterAll(async () => {
  await prisma.donation.deleteMany()
  await prisma.profile.deleteMany()
  await prisma.user.deleteMany()
})

describe('POST /api/v1/donations', () => {
  it('returns 201 with moedasVerdes for valid donation', async () => {
    const res = await fetch(`${API_BASE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `auth_token=${donorToken}`,
      },
      body: JSON.stringify({
        name: 'Arroz',
        category: 'Mercearia',
        weightKg: 10,
        expiresAt: '2030-12-31',
      }),
    })
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.name).toBe('Arroz')
    expect(data.status).toBe('AVAILABLE')
    expect(Number(data.moedasVerdes)).toBe(100)
  })

  it('returns 422 for past expiresAt', async () => {
    const res = await fetch(`${API_BASE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `auth_token=${donorToken}`,
      },
      body: JSON.stringify({
        name: 'Feijão',
        category: 'Mercearia',
        weightKg: 5,
        expiresAt: '2020-01-01',
      }),
    })
    expect(res.status).toBe(422)
  })

  it('returns 422 for invalid category', async () => {
    const res = await fetch(`${API_BASE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `auth_token=${donorToken}`,
      },
      body: JSON.stringify({
        name: 'Teste',
        category: 'Invalida',
        weightKg: 5,
        expiresAt: '2030-12-31',
      }),
    })
    expect(res.status).toBe(422)
  })

  it('returns 403 for ONG role', async () => {
    const res = await fetch(`${API_BASE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `auth_token=${ongToken}`,
      },
      body: JSON.stringify({
        name: 'Teste',
        category: 'Mercearia',
        weightKg: 5,
        expiresAt: '2030-12-31',
      }),
    })
    expect(res.status).toBe(403)
  })

  it('returns 401 without token', async () => {
    const res = await fetch(`${API_BASE}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Teste',
        category: 'Mercearia',
        weightKg: 5,
        expiresAt: '2030-12-31',
      }),
    })
    expect(res.status).toBe(401)
  })
})
