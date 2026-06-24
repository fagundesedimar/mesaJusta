import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth/password'
import { signToken } from '@/lib/auth/token'

const API_BASE = 'http://localhost:3000/api/v1/donations'

let donorToken: string
let donorId: string
let otherDonorToken: string

beforeAll(async () => {
  await prisma.donation.deleteMany()
  await prisma.profile.deleteMany()
  await prisma.user.deleteMany()

  const hash = await hashPassword('pw123')

  const donor = await prisma.user.create({
    data: {
      email: 'donor@test.com',
      passwordHash: hash,
      role: 'DONOR',
      profile: { create: { name: 'Donor', document: '12345678901', zipCode: '01001000', state: 'SP', profileType: 'DONOR' } },
    },
  })
  donorId = donor.id

  const otherDonor = await prisma.user.create({
    data: {
      email: 'other@test.com',
      passwordHash: hash,
      role: 'DONOR',
      profile: { create: { name: 'Other', document: '98765432101', zipCode: '01001000', state: 'SP', profileType: 'DONOR' } },
    },
  })

  donorToken = await signToken({ sub: donor.id, email: donor.email, role: 'DONOR' })
  otherDonorToken = await signToken({ sub: otherDonor.id, email: otherDonor.email, role: 'DONOR' })

  // Create expired donation
  await prisma.donation.create({
    data: {
      name: 'Vencido',
      category: 'Mercearia',
      weightKg: 5,
      expiresAt: new Date('2020-01-01'),
      status: 'AVAILABLE',
      donorId,
    },
  })

  // Create active donation
  await prisma.donation.create({
    data: {
      name: 'Ativo',
      category: 'Hortifrúti',
      weightKg: 10,
      expiresAt: new Date('2030-12-31'),
      status: 'AVAILABLE',
      donorId,
    },
  })

  // Create donation for other donor
  await prisma.donation.create({
    data: {
      name: 'Outro',
      category: 'Panificados',
      weightKg: 3,
      expiresAt: new Date('2030-12-31'),
      status: 'AVAILABLE',
      donorId: otherDonor.id,
    },
  })
})

afterAll(async () => {
  await prisma.donation.deleteMany()
  await prisma.profile.deleteMany()
  await prisma.user.deleteMany()
})

describe('GET /api/v1/donations', () => {
  it('expires overdue donations before returning', async () => {
    const res = await fetch(`${API_BASE}`, {
      headers: { Cookie: `auth_token=${donorToken}` },
    })
    expect(res.status).toBe(200)
    const data = await res.json()

    const expired = data.find((d: any) => d.name === 'Vencido')
    expect(expired.status).toBe('EXPIRED')
  })

  it('returns only the authenticated donor donations', async () => {
    const res = await fetch(`${API_BASE}`, {
      headers: { Cookie: `auth_token=${donorToken}` },
    })
    const data = await res.json()
    data.forEach((d: any) => {
      expect(d.donorId).toBe(donorId)
    })
    expect(data.some((d: any) => d.name === 'Outro')).toBe(false)
  })

  it('returns donations ordered by createdAt desc', async () => {
    const res = await fetch(`${API_BASE}`, {
      headers: { Cookie: `auth_token=${donorToken}` },
    })
    const data = await res.json()
    for (let i = 1; i < data.length; i++) {
      expect(new Date(data[i].createdAt) <= new Date(data[i - 1].createdAt)).toBe(true)
    }
  })
})
