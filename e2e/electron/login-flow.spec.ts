import { test, expect, _electron } from '@playwright/test'

test('login flow works inside Electron wrapper', async () => {
  const electronApp = await _electron.launch({
    args: ['.'],
  })

  const window = await electronApp.firstWindow()

  await window.goto('http://localhost:3000/login')
  await expect(window.locator('h1')).toContainText(/Entrar|Login/)

  await window.fill('input[name="email"]', 'test@mesajusta.com.br')
  await window.fill('input[name="password"]', 'password123')
  await window.click('button[type="submit"]')

  await expect(window).toHaveURL(/\/dashboard|\/login/)

  await electronApp.close()
})
