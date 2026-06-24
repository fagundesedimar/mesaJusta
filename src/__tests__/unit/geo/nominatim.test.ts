import { describe, it, expect, vi, beforeEach } from 'vitest'
import { geocodeAddress } from '@/lib/geo/nominatim'

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('geocodeAddress', () => {
  it('returns coordinates for a valid address', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify([{ lat: '-23.5505', lon: '-46.6333' }]))
    )

    const result = await geocodeAddress('São Paulo, SP')
    expect(result).toEqual({ lat: -23.5505, lng: -46.6333 })
  })

  it('returns null on network failure', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'))

    const result = await geocodeAddress('São Paulo, SP')
    expect(result).toBeNull()
  })

  it('returns null when address is not found', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify([]))
    )

    const result = await geocodeAddress('ASDFGHJKL123456')
    expect(result).toBeNull()
  })

  it('returns null on non-ok response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(null, { status: 429 })
    )

    const result = await geocodeAddress('São Paulo, SP')
    expect(result).toBeNull()
  })
})
