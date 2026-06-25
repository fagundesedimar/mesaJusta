import { describe, it, expect, beforeAll } from 'vitest'
import { signToken } from '@/lib/auth/token'
import { COOKIE_NAME } from '@/lib/auth/cookie'

const API_BASE = 'http://localhost:3000/api/v1/admin/audit-logs'

let adminToken: string

beforeAll(async () => {
  adminToken = await signToken({ sub: 'admin-test', email: 'admin@test.com', role: 'ADMIN' })
})

describe('GET /api/v1/admin/audit-logs', () => {
  it('returns 200 with pagination structure', async () => {
    const res = await fetch(`${API_BASE}`, {
      headers: { Cookie: `${COOKIE_NAME}=${adminToken}` },
    })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty('data')
    expect(data).toHaveProperty('total')
    expect(data).toHaveProperty('page')
    expect(data).toHaveProperty('totalPages')
    expect(data.page).toBe(1)
  })

  it('returns filtered results when date params provided', async () => {
    const res = await fetch(`${API_BASE}?startDate=2025-01-01&endDate=2025-12-31`, {
      headers: { Cookie: `${COOKIE_NAME}=${adminToken}` },
    })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty('data')
    expect(data).toHaveProperty('totalPages')
  })

  it('returns 401 without token', async () => {
    const res = await fetch(`${API_BASE}`)
    expect(res.status).toBe(401)
  })
})
