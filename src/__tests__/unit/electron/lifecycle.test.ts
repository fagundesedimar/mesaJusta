import { describe, it, expect, vi, beforeEach } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const MAIN_PATH = path.resolve(__dirname, '../../../../electron/main.js')

// Estado compartilhado capturado pelo require mockado (escopo do módulo do teste)
type HeaderHandler = (details: any, callback: (result: any) => void) => void

const windows: Array<{
  opts: any
  loadURL: ReturnType<typeof vi.fn>
  loadFile: ReturnType<typeof vi.fn>
  webContents: { openDevTools: ReturnType<typeof vi.fn> }
}> = []
const onEvents: Record<string, () => void> = {}
let quitCalls = 0
let readyCallback: (() => void) | null = null
let headersHandler: HeaderHandler | null = null

class MockBrowserWindow {
  opts: any
  loadURL = vi.fn()
  loadFile = vi.fn()
  webContents = { openDevTools: vi.fn() }

  constructor(opts: any) {
    this.opts = opts
    windows.push(this)
  }

  static getAllWindows() {
    return windows
  }
}

function mockRequire(id: string) {
  if (id === 'electron') {
    return {
      app: {
        whenReady: vi.fn(() => ({
          then: (cb: () => void) => {
            readyCallback = cb
          },
        })),
        on: vi.fn((evt: string, cb: () => void) => {
          onEvents[evt] = cb
        }),
        quit: vi.fn(() => {
          quitCalls += 1
        }),
      },
      BrowserWindow: MockBrowserWindow,
      session: {
        defaultSession: {
          webRequest: {
            onHeadersReceived: vi.fn((cb: HeaderHandler) => {
              headersHandler = cb
            }),
          },
        },
      },
    }
  }
  if (id === 'path') return path
  throw new Error(`Require não homologado no contexto do teste: "${id}"`)
}

// Executa o arquivo main.js REAL dentro de um wrapper CommonJS com require mockado
function loadMain() {
  const source = readFileSync(MAIN_PATH, 'utf-8')
  const moduleHandle: { exports: Record<string, unknown> } = { exports: {} }
  const wrapper = new Function(
    'require',
    'module',
    'exports',
    '__filename',
    '__dirname',
    source
  )
  wrapper(
    mockRequire,
    moduleHandle,
    moduleHandle.exports,
    MAIN_PATH,
    path.dirname(MAIN_PATH)
  )
}

loadMain()

const isMac = process.platform === 'darwin'

beforeEach(() => {
  windows.length = 0
  quitCalls = 0
})

describe('electron/main.js (módulo real)', () => {
  it('registra os handlers de ciclo de vida ao ser carregado', () => {
    expect(onEvents['window-all-closed']).toBeTypeOf('function')
    expect(readyCallback).toBeTypeOf('function')
  })

  it('cria a janela com webPreferences seguros e preload correto ao ficar pronto', () => {
    expect(windows).toHaveLength(0)
    readyCallback?.()

    expect(windows).toHaveLength(1)
    const windowOpts = windows[0].opts
    expect(windowOpts.webPreferences).toMatchObject({
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    })
    expect(windowOpts.webPreferences.preload).toMatch(/preload\.js$/)

    // Em NODE_ENV !== 'development' (não-dev) carrega o build local
    expect(windows[0].loadFile).toHaveBeenCalled()
    expect(windows[0].loadURL).not.toHaveBeenCalled()
  })

  it('injeta Content-Security-Policy restritiva nas respostas em produção (não-dev)', () => {
    readyCallback?.()

    let result: any = null
    headersHandler?.({ responseHeaders: { 'x-test': ['1'] } }, (r) => {
      result = r
    })

    const csp = (result?.responseHeaders?.['Content-Security-Policy'] ?? []).join('')
    expect(csp).toContain("script-src 'self'")
    expect(csp).toContain("style-src 'self' 'unsafe-inline'")
    expect(csp).toContain("connect-src 'self' https://api.mesajusta.com.br")
  })

  it('não abre DevTools por padrão no fluxo não-dev', () => {
    readyCallback?.()
    expect(windows[0].webContents.openDevTools).not.toHaveBeenCalled()
  })

  it('encerra a aplicação quando todas as janelas são fechadas (fora do macOS)', () => {
    onEvents['window-all-closed']?.()
    if (isMac) {
      expect(quitCalls).toBe(0)
    } else {
      expect(quitCalls).toBe(1)
    }
  })
})