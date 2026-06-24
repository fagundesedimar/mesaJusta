import { describe, it, expect } from 'vitest'
import { validateCPF, validateCNPJ } from '@/lib/validators/document'

describe('validateCPF', () => {
  it('returns true for valid CPF (11 digits)', () => {
    expect(validateCPF('12345678901')).toBe(true)
  })

  it('returns false for CPF with fewer than 11 digits', () => {
    expect(validateCPF('123456789')).toBe(false)
  })

  it('returns false for CPF with letters', () => {
    expect(validateCPF('1234567890a')).toBe(false)
  })
})

describe('validateCNPJ', () => {
  it('returns true for valid CNPJ (14 digits)', () => {
    expect(validateCNPJ('12345678901234')).toBe(true)
  })

  it('returns false for CNPJ with fewer than 14 digits', () => {
    expect(validateCNPJ('12345678901')).toBe(false)
  })

  it('returns false for CNPJ with letters', () => {
    expect(validateCNPJ('1234567890123a')).toBe(false)
  })
})
