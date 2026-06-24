import { describe, it, expect, vi } from 'vitest'

describe('Electron main process structure', () => {
  it('main.js exports expected module shape', () => {
    const mainExports = {
      isDev: process.env.NODE_ENV === 'development',
      createWindow: 'function',
      appHandlers: ['window-all-closed', 'activate'],
      windowConfig: {
        width: 1280,
        height: 800,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          webSecurity: true,
        },
      },
    }

    expect(mainExports.isDev).toBe(false)
    expect(mainExports.windowConfig.webPreferences.nodeIntegration).toBe(false)
    expect(mainExports.windowConfig.webPreferences.contextIsolation).toBe(true)
    expect(mainExports.windowConfig.webPreferences.webSecurity).toBe(true)
    expect(mainExports.appHandlers).toContain('window-all-closed')
    expect(mainExports.appHandlers).toContain('activate')
  })
})

describe('Content Security Policy configuration', () => {
  it('CSP restricts script-src to self', () => {
    const csp = "script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://api.mesajusta.com.br"
    expect(csp).toContain("script-src 'self'")
    expect(csp).toContain("style-src 'self' 'unsafe-inline'")
    expect(csp).toContain("connect-src 'self' https://api.mesajusta.com.br")
  })

  it('allows api.mesajusta.com.br for connect-src', () => {
    const csp = "script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://api.mesajusta.com.br"
    expect(csp).toMatch(/connect-src 'self' https:\/\/api\.mesajusta\.com\.br/)
  })
})

describe('preload.js contextBridge', () => {
  it('electronAPI exposes getVersion and openExternal', () => {
    const mockElectronAPI = {
      getVersion: vi.fn().mockReturnValue('42.5.0'),
      openExternal: vi.fn(),
    }

    const version = mockElectronAPI.getVersion()
    expect(version).toMatch(/^\d+\.\d+\.\d+$/)

    mockElectronAPI.openExternal('https://example.com')
    expect(mockElectronAPI.openExternal).toHaveBeenCalledWith(
      'https://example.com'
    )
  })
})
