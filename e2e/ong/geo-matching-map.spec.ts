import { test, expect } from '@playwright/test'
import { cleanupTestUser } from '../auth-helpers'

const email = `ong_geo_${Date.now()}@test.com`

test.afterEach(async ({ request }) => {
  await cleanupTestUser(request, email)
})

test('ONG sees map and sidebar with donation filters', async ({ page }) => {
  // Register ONG

  await page.goto('/register')
  await page.fill('#name', 'ONG Geográfica')
  await page.fill('#email', email)
  await page.fill('#password', '123456')
  await page.selectOption('#role', 'ONG')
  await page.click('text=Próximo')
  await page.fill('#document', '11111111111111')
  await page.click('text=Próximo')
  await page.fill('#zipCode', '01001000')
  await page.click('text=Cadastrar')
  await expect(page).toHaveURL('/login')

  // Login
  await page.goto('/login')
  await page.fill('#email', email)
  await page.fill('#password', '123456')
  await page.click('text=Entrar')
  await expect(page).toHaveURL(/\/dashboard/)

  // Navigate to ONG dashboard (if redirected elsewhere)
  await page.goto('/ong/dashboard')
  await page.waitForLoadState('networkidle')

  // Check sidebar is visible
  await expect(page.locator('.geo-sidebar')).toBeVisible()
  await expect(page.locator('.geo-sidebar__filters')).toBeVisible()

  // Check map container is present
  await expect(page.locator('.geo-map__container')).toBeVisible()
})
