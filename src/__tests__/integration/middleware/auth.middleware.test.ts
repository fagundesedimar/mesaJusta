import { describe, it, expect } from 'vitest'
import { signToken } from '@/lib/auth/token'

const API_BASE = 'http://localhost:3000'

describe('Middleware auth protection', () => {
  it('redirects to /login for protected route without token', async () => {
    const res = await fetch(`${API_BASE}/dashboard`, { redirect: 'manual' })
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toBe('/login')
  })

  it('allows access to public /login without token', async () => {
    const res = await fetch(`${API_BASE}/login`)
    expect(res.status).toBe(200)
  })

  it('allows access to authenticated route with valid token', async () => {
    const token = await signToken({ sub: 'user-1', email: 'test@test.com', role: 'DONOR' })
    const res = await fetch(`${API_BASE}/dashboard`, {
      headers: { Cookie: `auth_token=${token}` },
      redirect: 'manual',
    })
    expect(res.status).toBe(200)
  })

  it('returns 403 for DONOR trying to access /admin', async () => {
    const token = await signToken({ sub: 'user-1', email: 'test@test.com', role: 'DONOR' })
    const res = await fetch(`${API_BASE}/admin`, {
      headers: { Cookie: `auth_token=${token}` },
      redirect: 'manual',
    })
    expect(res.status).toBe(403)
  })
})
