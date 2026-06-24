import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'

const API_BASE = 'http://localhost:3000/api/v1/auth'

beforeAll(async () => {
  await prisma.profile.deleteMany()
  await prisma.user.deleteMany()
})

afterAll(async () => {
  await prisma.profile.deleteMany()
  await prisma.user.deleteMany()
})

describe('POST /api/v1/auth/register', () => {
  it('returns 201 for successful DONOR registration', async () => {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'João Doador',
        email: 'joao@test.com',
        password: '123456',
        role: 'DONOR',
        document: '12345678901',
        zipCode: '01001000',
      }),
    })
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data).toHaveProperty('id')
    expect(data.email).toBe('joao@test.com')
    expect(data.role).toBe('DONOR')
    expect(data).not.toHaveProperty('password')
    expect(data).not.toHaveProperty('passwordHash')
  })

  it('returns 409 for duplicate email', async () => {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'João Duplicado',
        email: 'joao@test.com',
        password: '123456',
        role: 'DONOR',
        document: '98765432101',
        zipCode: '01001000',
      }),
    })
    expect(res.status).toBe(409)
    const data = await res.json()
    expect(data.error).toBe('E-mail já cadastrado.')
  })

  it('returns 400 for invalid CEP (non SP/MG)', async () => {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Maria RJ',
        email: 'maria@test.com',
        password: '123456',
        role: 'DONOR',
        document: '11111111111',
        zipCode: '20040000',
      }),
    })
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Cadastro restrito aos estados de SP e MG.')
  })

  it('returns 422 for invalid CPF format', async () => {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Carlos Inválido',
        email: 'carlos@test.com',
        password: '123456',
        role: 'DONOR',
        document: '123',
        zipCode: '01001000',
      }),
    })
    expect(res.status).toBe(422)
  })
})
