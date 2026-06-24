import { describe, it, expect } from 'vitest'
import { calcMoedasVerdes, calcMeals, calcCO2eq, calcTons } from '@/lib/esg/formulas'

describe('calcMoedasVerdes', () => {
  const categories = ['Hortifrúti', 'Panificados', 'Laticínios', 'Mercearia', 'Proteínas', 'Refeições Prontas']

  it.each(categories)('calculates for category %s with 10kg', (category) => {
    const result = calcMoedasVerdes(10, category)
    if (category === 'Proteínas' || category === 'Refeições Prontas') {
      expect(result).toBe(150)
    } else {
      expect(result).toBe(100)
    }
  })

  it('returns 0 for 0kg', () => {
    expect(calcMoedasVerdes(0, 'Hortifrúti')).toBe(0)
  })

  it('handles fractional weight', () => {
    expect(calcMoedasVerdes(2.5, 'Proteínas')).toBe(37.5)
  })
})

describe('calcMeals', () => {
  it('returns 0 for 0kg', () => expect(calcMeals(0)).toBe(0))
  it('returns 2 for 1kg', () => expect(calcMeals(1)).toBe(2))
  it('returns 200 for 100kg', () => expect(calcMeals(100)).toBe(200))
  it('handles decimal', () => expect(calcMeals(2.5)).toBe(5))
})

describe('calcCO2eq', () => {
  it('returns 0 for 0kg', () => expect(calcCO2eq(0)).toBe(0))
  it('returns 2.5 for 1kg', () => expect(calcCO2eq(1)).toBe(2.5))
  it('returns 250 for 100kg', () => expect(calcCO2eq(100)).toBe(250))
  it('handles decimal', () => expect(calcCO2eq(2.5)).toBe(6.25))
})

describe('calcTons', () => {
  it('returns 0 for 0kg', () => expect(calcTons(0)).toBe(0))
  it('returns 0.001 for 1kg', () => expect(calcTons(1)).toBe(0.001))
  it('returns 0.1 for 100kg', () => expect(calcTons(100)).toBe(0.1))
  it('returns 1 for 1000kg', () => expect(calcTons(1000)).toBe(1))
})
