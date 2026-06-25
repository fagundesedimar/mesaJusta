import { describe, it, expect } from 'vitest'
import { generateReservationToken } from '@/lib/reservation/token'

describe('generateReservationToken', () => {
  it('returns token in format XXXXXX (6 uppercase alphanumeric)', () => {
    const token = generateReservationToken()
    expect(token).toMatch(/^[A-Z0-9]{6}$/)
  })

  it('generates unique tokens across 100 calls', () => {
    const tokens = new Set<string>()
    for (let i = 0; i < 100; i++) {
      tokens.add(generateReservationToken())
    }
    expect(tokens.size).toBe(100)
  })

  it('has exactly 6 characters', () => {
    for (let i = 0; i < 100; i++) {
      expect(generateReservationToken()).toHaveLength(6)
    }
  })
})
