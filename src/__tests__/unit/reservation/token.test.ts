import { describe, it, expect } from 'vitest'
import { generateReservationToken } from '@/lib/reservation/token'

describe('generateReservationToken', () => {
  it('returns token in format MJ-XXXX', () => {
    const token = generateReservationToken()
    expect(token).toMatch(/^MJ-[A-Z0-9]{4}$/)
  })

  it('generates unique tokens across 100 calls', () => {
    const tokens = new Set<string>()
    for (let i = 0; i < 100; i++) {
      tokens.add(generateReservationToken())
    }
    expect(tokens.size).toBe(100)
  })

  it('always starts with MJ- prefix', () => {
    for (let i = 0; i < 100; i++) {
      expect(generateReservationToken().startsWith('MJ-')).toBe(true)
    }
  })
})
