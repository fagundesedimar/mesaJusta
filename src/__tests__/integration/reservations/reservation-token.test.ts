import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth/password'
import { signToken } from '@/lib/auth/token'

const API_BASE = 'http://localhost:3000/api/v1/reservations'

let ongToken: string
let donorToken: string
let availableDonationId: string
let reservedDonationId: string
let ongId: string

beforeAll(async () => {
  await prisma.auditLog.deleteMany()
  await prisma.donation.deleteMany()
  await prisma.profile.deleteMany()
  await prisma.user.deleteMany()

  const donorHash = await hashPassword('donor123')
  const ongHash = await hashPassword('ong123')

  const donor = await prisma.user.create({
    data: {
      email: 'donor-res@test.com',
      passwordHash: donorHash,
      role: 'DONOR',
      profile: { create: { name: 'Donor Res', document: '22222222222', zipCode: '01001000', state: 'SP', profileType: 'DONOR' } },
    },
  })

  const ong = await prisma.user.create({
    data: {
      email: 'ong-res@test.com',
      passwordHash: ongHash,
      role: 'ONG',
      profile: { create: { name: 'ONG Res', document: '22222222222222', zipCode: '01001000', state: 'SP', profileType: 'ONG' } },
    },
  })
  ongId = ong.id

  const available = await prisma.donation.create({
    data: {
      name: 'Frango Congelado',
      category: 'Proteínas',
      weightKg: 15,
      expiresAt: new Date('2030-12-31'),
      status: 'AVAILABLE',
      donorId: donor.id,
    },
  })
  availableDonationId = available.id

  const reserved = await prisma.donation.create({
    data: {
      name: 'Arroz Doação',
      category: 'Refeições Prontas',
      weightKg: 5,
      expiresAt: new Date('2030-12-31'),
      status: 'RESERVED',
      donorId: donor.id,
      reservationToken: 'MJTEST',
      reservedAt: new Date(),
      reservedByOngId: ong.id,
    },
  })
  reservedDonationId = reserved.id

  ongToken = await signToken({ sub: ong.id, email: ong.email, role: 'ONG' })
  donorToken = await signToken({ sub: donor.id, email: donor.email, role: 'DONOR' })
})

afterAll(async () => {
  await prisma.auditLog.deleteMany()
  await prisma.donation.deleteMany()
  await prisma.profile.deleteMany()
  await prisma.user.deleteMany()
})

describe('POST /api/v1/reservations', () => {
  it('returns 201 and creates reservation for available donation', async () => {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `auth_token=${ongToken}`,
      },
      body: JSON.stringify({ donationId: availableDonationId }),
    })

    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.donationId).toBe(availableDonationId)
    expect(data.reservationToken).toMatch(/^[A-Z0-9]{6}$/)
    expect(data.reservedAt).toBeTruthy()
    expect(data.expiresAt).toBeTruthy()

    const donation = await prisma.donation.findUnique({ where: { id: availableDonationId } })
    expect(donation?.status).toBe('RESERVED')
    expect(donation?.reservationToken).toMatch(/^[A-Z0-9]{6}$/)
    expect(donation?.reservedByOngId).toBe(ongId)
  })

  it('returns 409 for already reserved donation', async () => {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `auth_token=${ongToken}`,
      },
      body: JSON.stringify({ donationId: reservedDonationId }),
    })

    expect(res.status).toBe(409)
    const data = await res.json()
    expect(data.error).toBe('Este lote não está mais disponível.')
  })

  it('returns 401 without auth', async () => {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ donationId: availableDonationId }),
    })

    expect(res.status).toBe(401)
  })

  it('returns 403 for DONOR role', async () => {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `auth_token=${donorToken}`,
      },
      body: JSON.stringify({ donationId: availableDonationId }),
    })

    expect(res.status).toBe(403)
  })

  it('returns 422 for missing donationId', async () => {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `auth_token=${ongToken}`,
      },
      body: JSON.stringify({}),
    })

    expect(res.status).toBe(422)
  })
})

describe('POST /api/v1/reservations/cancel', () => {
  it('returns 200 and reverts donation to AVAILABLE', async () => {
    const res = await fetch(`${API_BASE}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `auth_token=${ongToken}`,
      },
      body: JSON.stringify({ donationId: reservedDonationId }),
    })

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.message).toBe('Reserva cancelada com sucesso.')

    const donation = await prisma.donation.findUnique({ where: { id: reservedDonationId } })
    expect(donation?.status).toBe('AVAILABLE')
    expect(donation?.reservationToken).toBeNull()
    expect(donation?.reservedAt).toBeNull()
    expect(donation?.reservedByOngId).toBeNull()

    const auditLog = await prisma.auditLog.findFirst({
      where: { donationId: reservedDonationId },
    })
    expect(auditLog).not.toBeNull()
  })

  it('returns 409 for already AVAILABLE donation', async () => {
    const res = await fetch(`${API_BASE}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `auth_token=${ongToken}`,
      },
      body: JSON.stringify({ donationId: availableDonationId }),
    })

    expect(res.status).toBe(409)
  })
})

describe('GET /api/v1/reservations', () => {
  it('returns list of active reservations for the ONG', async () => {
    const res = await fetch(API_BASE, {
      method: 'GET',
      headers: { Cookie: `auth_token=${ongToken}` },
    })

    expect(res.status).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data.reservations)).toBe(true)
  })
})
