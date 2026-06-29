import { test, expect } from '@playwright/test'
import { registerViaApi, loginWithApi, cleanupTestUser } from '../auth-helpers'

const email = `ong_geo_${Date.now()}@test.com`

test.afterEach(async ({ request }) => {
  await cleanupTestUser(request, email)
})

test('ONG sees map and sidebar with donation filters', async ({ page, request }) => {

  // Register & Login via API
  await registerViaApi(request, {
    name: 'ONG Geográfica',
    email,
    password: '123456',
    role: 'ONG',
    document: '11111111111111',
    zipCode: '01001000',
  })
  await loginWithApi(page, email, '123456')

  // Navigate to ONG dashboard (if redirected elsewhere)
  await page.goto('/ong/dashboard')
  await page.waitForLoadState('networkidle')

  // Check sidebar is visible
  await expect(page.locator('.geo-sidebar')).toBeVisible()
  await expect(page.locator('.geo-sidebar__filters')).toBeVisible()

  // Check map container is present
  await expect(page.locator('.geo-map__container')).toBeVisible()
})
