import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword } from '@/lib/auth/password'

describe('hashPassword', () => {
  it('generates a hash different from the plain password', async () => {
    const hash = await hashPassword('mysecret123')
    expect(hash).not.toBe('mysecret123')
    expect(hash).toMatch(/^\$2[ab]\$/)
  })
})

describe('verifyPassword', () => {
  it('returns true for matching password', async () => {
    const hash = await hashPassword('mysecret123')
    const result = await verifyPassword('mysecret123', hash)
    expect(result).toBe(true)
  })

  it('returns false for wrong password', async () => {
    const hash = await hashPassword('mysecret123')
    const result = await verifyPassword('wrongpassword', hash)
    expect(result).toBe(false)
  })
})
