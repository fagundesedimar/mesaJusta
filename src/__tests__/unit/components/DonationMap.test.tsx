import { describe, it, expect, vi } from 'vitest'

vi.mock('leaflet', () => ({
  default: {
    map: vi.fn(() => ({ setView: vi.fn(), remove: vi.fn(), on: vi.fn(), off: vi.fn() })),
    tileLayer: vi.fn(() => ({ addTo: vi.fn() })),
    marker: vi.fn(() => ({ addTo: vi.fn(() => ({ bindPopup: vi.fn(), on: vi.fn(), remove: vi.fn() })) })),
    divIcon: vi.fn(() => ({})),
    Map: vi.fn(),
    Control: { Zoom: vi.fn() },
  },
  divIcon: vi.fn(() => ({})),
  map: vi.fn(() => ({ setView: vi.fn(), remove: vi.fn(), on: vi.fn(), off: vi.fn() })),
  tileLayer: vi.fn(() => ({ addTo: vi.fn() })),
  marker: vi.fn(() => ({ addTo: vi.fn(() => ({ bindPopup: vi.fn(), on: vi.fn(), remove: vi.fn() })) })),
}))

describe('DonationMap module', () => {
  it('exports a valid React component', async () => {
    const mod = await import('@/components/ong/DonationMap')
    expect(mod.default).toBeTypeOf('function')
  })
})
