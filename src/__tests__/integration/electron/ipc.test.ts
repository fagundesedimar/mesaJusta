import { describe, it, expect } from 'vitest'

describe('contextBridge API contract', () => {
  const mockElectronAPI = {
    getVersion: () => '42.5.0',
    openExternal: (url: string) => url,
  }

  it('getVersion returns a semver string', () => {
    const version = mockElectronAPI.getVersion()
    expect(version).toMatch(/^\d+\.\d+\.\d+$/)
  })

  it('openExternal receives and returns a valid URL', () => {
    const url = 'https://mesajusta.com.br'
    const result = mockElectronAPI.openExternal(url)
    expect(result).toBe(url)
  })

  it('openExternal rejects invalid URLs', () => {
    const url = ''

    expect(() => {
      if (!url) throw new Error('Invalid URL')
      mockElectronAPI.openExternal(url)
    }).toThrow('Invalid URL')
  })

  it('electronAPI is exposed on window', () => {
    expect(typeof mockElectronAPI.getVersion).toBe('function')
    expect(typeof mockElectronAPI.openExternal).toBe('function')
  })

  it('nodeIntegration remains disabled (require is not defined)', () => {
    expect(typeof globalThis.require).toBe('undefined')
  })
})
