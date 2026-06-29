import { test, expect } from '@playwright/test'
import { registerViaApi, loginWithApi, cleanupTestUser } from '../auth-helpers'

const email = `donor_gami_${Date.now()}@test.com`

test.afterEach(async ({ request }) => {
  await cleanupTestUser(request, email)
})

test('donor sees green coins card and ranking on dashboard', async ({ page, request }) => {

  // Register & Login via API
  await registerViaApi(request, {
    name: 'Doador Gamificação',
    email,
    password: '123456',
    role: 'DONOR',
    document: '12345678901',
    zipCode: '01001000',
  })
  await loginWithApi(page, email, '123456')

  // Navigate to donor dashboard with gamification
  await page.goto('/dashboard/donor')

  // Check that the green coins card is visible
  await expect(page.locator('.green-coins-card')).toBeVisible()
  await expect(page.locator('.green-coins-card__value')).toHaveText('0')

  // Check that the ranking section is visible
  await expect(page.locator('.ranking-table')).toBeVisible()
})
