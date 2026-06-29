import { test, expect, _electron } from '@playwright/test'

const ELECTRON_ENV = { ...process.env, NODE_ENV: 'development' }

async function getAppWindow(electronApp: import('playwright').ElectronApplication) {
  const existing = electronApp.windows().filter((w: { url: () => string }) => !w.url().includes('devtools'))
  if (existing.length > 0) return existing[0]
  return new Promise((resolve) => {
    electronApp.on('window', (page: { url: () => string }) => {
      if (!page.url().includes('devtools')) resolve(page)
    })
  })
}

test('login flow works inside Electron wrapper', async () => {
  const electronApp = await _electron.launch({
    args: ['.'],
    env: ELECTRON_ENV,
  })

  const window = await getAppWindow(electronApp)
  await expect(window.locator('h1')).toContainText(/Entrar|Login/)

  await window.fill('#email', 'test@mesajusta.com.br')
  await window.fill('#password', 'password123')
  await window.click('button[type="submit"]')

  await expect(window).toHaveURL(/\/dashboard|\/login/)

  await electronApp.close()
})
