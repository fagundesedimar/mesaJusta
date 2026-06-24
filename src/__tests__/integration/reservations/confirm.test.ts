import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth/password'
import { signToken } from '@/lib/auth/token'

const API_BASE = 'http://localhost:3000/api/v1/reservations'

let donorToken: string
let donationId: string
let ongDonationId: string
let expiredDonationId: string

beforeAll(async () => {
  await prisma.auditLog.deleteMany()
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

  const ong = await prisma.user.create({
    data: {
      email: 'ong@test.com',
      passwordHash: ongHash,
      role: 'ONG',
      profile: { create: { name: 'Ong', document: '12345678901234', zipCode: '01001000', state: 'SP', profileType: 'ONG' } },
    },
  })

  donorToken = await signToken({ sub: donor.id, email: donor.email, role: 'DONOR' })

  const d1 = await prisma.donation.create({
    data: { name: 'Teste', category: 'Mercearia', weightKg: 5, expiresAt: new Date('2030-12-31'), status: 'RESERVED', token: 'ABC123', donorId: donor.id, ongId: ong.id },
  })
  donationId = d1.id

  const d2 = await prisma.donation.create({
    data: { name: 'Teste', category: 'Mercearia', weightKg: 5, expiresAt: new Date('2030-12-31'), status: 'AVAILABLE', token: null, donorId: donor.id },
  })
  ongDonationId = d2.id

  const d3 = await prisma.donation.create({
    data: { name: 'Teste', category: 'Mercearia', weightKg: 5, expiresAt: new Date('2030-12-31'), status: 'COLLECTED', token: null, donorId: donor.id, ongId: ong.id },
  })
  expiredDonationId = d3.id
})

afterAll(async () => {
  await prisma.auditLog.deleteMany()
  await prisma.donation.deleteMany()
  await prisma.profile.deleteMany()
  await prisma.user.deleteMany()
})

describe('POST /api/v1/reservations/confirm', () => {
  it('returns 200 and creates AuditLog for correct token with RESERVED donation', async () => {
    const res = await fetch(`${API_BASE}/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `auth_token=${donorToken}`,
      },
      body: JSON.stringify({ donationId, token: 'ABC123' }),
    })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.message).toBe('Entrega confirmada com sucesso.')

    const donation = await prisma.donation.findUnique({ where: { id: donationId } })
    expect(donation?.status).toBe('COLLECTED')

    const auditLog = await prisma.auditLog.findFirst({ where: { donationId } })
    expect(auditLog).not.toBeNull()
    expect(auditLog!.donationId).toBe(donationId)
    expect(auditLog!.donorId).toBeTruthy()
    expect(auditLog!.ongId).toBeTruthy()
    expect(auditLog!.executorId).toBeTruthy()
    expect(auditLog!.timestamp).toBeTruthy()
  })

  it('returns 400 for incorrect token', async () => {
    const res = await fetch(`${API_BASE}/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `auth_token=${donorToken}`,
      },
      body: JSON.stringify({ donationId, token: 'WRONG6' }),
    })
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Token inválido. Verifique com a ONG.')
  })

  it('returns 409 for donation not in RESERVED status', async () => {
    const res = await fetch(`${API_BASE}/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `auth_token=${donorToken}`,
      },
      body: JSON.stringify({ donationId: ongDonationId, token: 'ANY123' }),
    })
    expect(res.status).toBe(409)
    const data = await res.json()
    expect(data.error).toBe('Esta doação não está disponível para confirmação de entrega.')
  })
})
