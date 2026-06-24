import { describe, it, expect } from 'vitest'
import { getESGBadge } from '@/lib/gamification/badges'

describe('getESGBadge', () => {
  it('returns BRONZE for 0 coins', () => {
    expect(getESGBadge(0)).toBe('BRONZE')
  })

  it('returns BRONZE for exactly 1000 coins (boundary)', () => {
    expect(getESGBadge(1000)).toBe('BRONZE')
  })

  it('returns SILVER for 1001 coins', () => {
    expect(getESGBadge(1001)).toBe('SILVER')
  })

  it('returns SILVER for exactly 5000 coins (boundary)', () => {
    expect(getESGBadge(5000)).toBe('SILVER')
  })

  it('returns GOLD for 5001 coins', () => {
    expect(getESGBadge(5001)).toBe('GOLD')
  })

  it('returns GOLD for very large values', () => {
    expect(getESGBadge(10000)).toBe('GOLD')
  })
})
