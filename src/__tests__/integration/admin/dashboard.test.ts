import { describe, it, expect } from 'vitest'
import { signToken } from '@/lib/auth/token'
import { COOKIE_NAME } from '@/lib/auth/cookie'

const API_BASE = 'http://localhost:3000/api/v1/admin/dashboard'

const adminToken = await signToken({ sub: 'admin-test', email: 'admin@test.com', role: 'ADMIN' })
const donorToken = await signToken({ sub: 'donor-test', email: 'donor@test.com', role: 'DONOR' })

describe('GET /api/v1/admin/dashboard', () => {
  it('returns 200 with valid metrics structure', async () => {
    const res = await fetch(`${API_BASE}`, {
      headers: { Cookie: `${COOKIE_NAME}=${adminToken}` },
    })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty('totalKgSaved')
    expect(data).toHaveProperty('totalTonsSaved')
    expect(data).toHaveProperty('totalMeals')
    expect(data).toHaveProperty('totalCO2eqKg')
    expect(data).toHaveProperty('totalDonations')
    expect(data).toHaveProperty('totalONGs')
  })

  it('returns 403 for DONOR role', async () => {
    const res = await fetch(`${API_BASE}`, {
      headers: { Cookie: `${COOKIE_NAME}=${donorToken}` },
    })
    expect(res.status).toBe(403)
  })

  it('returns 401 without token', async () => {
    const res = await fetch(`${API_BASE}`)
    expect(res.status).toBe(401)
  })
})
