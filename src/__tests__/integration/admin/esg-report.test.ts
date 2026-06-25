import { describe, it, expect, beforeAll } from 'vitest'
import { signToken } from '@/lib/auth/token'
import { COOKIE_NAME } from '@/lib/auth/cookie'

const API_BASE = 'http://localhost:3000/api/v1/admin/report/esg'

let adminToken: string

beforeAll(async () => {
  adminToken = await signToken({ sub: 'admin-test', email: 'admin@test.com', role: 'ADMIN' })
})

describe('GET /api/v1/admin/report/esg', () => {
  it('returns PDF with correct headers when no data', async () => {
    const res = await fetch(`${API_BASE}?startDate=2025-01-01&endDate=2030-12-31`, {
      headers: { Cookie: `${COOKIE_NAME}=${adminToken}` },
    })
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toBe('application/pdf')
    expect(res.headers.get('Content-Disposition')).toContain('attachment')
    expect(res.headers.get('Content-Disposition')).toContain('.pdf')
  })

  it('returns 401 without token', async () => {
    const res = await fetch(`${API_BASE}`)
    expect(res.status).toBe(401)
  })
})
