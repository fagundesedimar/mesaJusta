import { describe, it, expect } from 'vitest'
import { signToken, verifyToken } from '@/lib/auth/token'

describe('signToken', () => {
  it('generates a JWT string', async () => {
    const token = await signToken({
      sub: 'user-1',
      email: 'test@example.com',
      role: 'DONOR',
    })
    expect(typeof token).toBe('string')
    expect(token.split('.')).toHaveLength(3)
  })
})

describe('verifyToken', () => {
  it('returns payload for valid token', async () => {
    const token = await signToken({
      sub: 'user-1',
      email: 'test@example.com',
      role: 'DONOR',
    })
    const payload = await verifyToken(token)
    expect(payload).not.toBeNull()
    expect(payload!.sub).toBe('user-1')
    expect(payload!.email).toBe('test@example.com')
    expect(payload!.role).toBe('DONOR')
  })

  it('returns null for invalid token', async () => {
    const result = await verifyToken('invalid.token.here')
    expect(result).toBeNull()
  })
})
