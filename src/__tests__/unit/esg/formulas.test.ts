import { describe, it, expect } from 'vitest'
import { calcMoedasVerdes } from '@/lib/esg/formulas'

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
