import { describe, it, expect } from 'vitest'
import { calcGreenCoins } from '@/lib/gamification/formulas'

describe('calcGreenCoins', () => {
  it('applies 1x multiplier for standard category (Hortifrúti)', () => {
    expect(calcGreenCoins(5, 'Hortifrúti')).toBe(50)
  })

  it('applies 1.5x multiplier for Proteínas', () => {
    expect(calcGreenCoins(10, 'Proteínas')).toBe(150)
  })

  it('applies 1.5x multiplier for Refeições Prontas', () => {
    expect(calcGreenCoins(4, 'Refeições Prontas')).toBe(60)
  })

  it('returns 0 for zero weight', () => {
    expect(calcGreenCoins(0, 'Mercearia')).toBe(0)
  })

  it('handles decimal weight with floor rounding', () => {
    expect(calcGreenCoins(2.5, 'Proteínas')).toBe(37)
  })

  it('returns 0 for 0kg with bonus category', () => {
    expect(calcGreenCoins(0, 'Proteínas')).toBe(0)
  })
})
