import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth/password'

const API_BASE = 'http://localhost:3000/api/v1/auth'

beforeAll(async () => {
  await prisma.profile.deleteMany()
  await prisma.user.deleteMany()

  const passwordHash = await hashPassword('correctpw')
  await prisma.user.create({
    data: {
      email: 'login@test.com',
      passwordHash,
      role: 'DONOR',
      profile: { create: { name: 'Login User', document: '12345678901', zipCode: '01001000', state: 'SP', profileType: 'DONOR' } },
    },
  })

  const deletedHash = await hashPassword('deletedpw')
  await prisma.user.create({
    data: {
      email: 'deleted@test.com',
      passwordHash: deletedHash,
      role: 'DONOR',
      deletedAt: new Date(),
      profile: { create: { name: 'Deleted User', document: '98765432101', zipCode: '01001000', state: 'SP', profileType: 'DONOR' } },
    },
  })
})

afterAll(async () => {
  await prisma.profile.deleteMany()
  await prisma.user.deleteMany()
})

describe('POST /api/v1/auth/login', () => {
  it('returns 200 and sets cookie for valid credentials', async () => {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'login@test.com', password: 'correctpw' }),
    })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty('id')
    expect(data.email).toBe('login@test.com')
    expect(data.role).toBe('DONOR')
    expect(data.name).toBe('Login User')
    expect(res.headers.getSetCookie()).toHaveLength(1)
    expect(res.headers.getSetCookie()[0]).toContain('auth_token')
    expect(res.headers.getSetCookie()[0]).toContain('HttpOnly')
  })

  it('returns 401 for wrong password', async () => {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'login@test.com', password: 'wrongpw' }),
    })
    expect(res.status).toBe(401)
    const data = await res.json()
    expect(data.error).toBe('Credenciais inválidas.')
  })

  it('returns 401 for non-existent user', async () => {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent@test.com', password: 'anypw' }),
    })
    expect(res.status).toBe(401)
    const data = await res.json()
    expect(data.error).toBe('Credenciais inválidas.')
  })

  it('returns 401 for soft-deleted user', async () => {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'deleted@test.com', password: 'deletedpw' }),
    })
    expect(res.status).toBe(401)
    const data = await res.json()
    expect(data.error).toBe('Credenciais inválidas.')
  })
})
