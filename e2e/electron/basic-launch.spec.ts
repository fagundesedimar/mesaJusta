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

test('Electron app launches and loads login page', async () => {
  const electronApp = await _electron.launch({
    args: ['.'],
    env: ELECTRON_ENV,
  })

  const window = await getAppWindow(electronApp)
  await expect(window).toHaveTitle(/Mesa Justa/)

  const url = window.url()
  expect(url).toContain('localhost:3000')

  await electronApp.close()
})

test('Electron window has correct dimensions', async () => {
  const electronApp = await _electron.launch({
    args: ['.'],
    env: ELECTRON_ENV,
  })

  await getAppWindow(electronApp)
  const { width, height } = await electronApp.evaluate(({ BrowserWindow }) => {
    const bounds = BrowserWindow.getAllWindows()[0].getBounds()
    return { width: bounds.width, height: bounds.height }
  })

  expect(width).toBeGreaterThanOrEqual(1200)
  expect(width).toBeLessThanOrEqual(1920)
  expect(height).toBeGreaterThanOrEqual(700)
  expect(height).toBeLessThanOrEqual(1080)

  await electronApp.close()
})
