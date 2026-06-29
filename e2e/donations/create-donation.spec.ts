import { test, expect } from '@playwright/test'
import { registerViaApi, loginWithApi, cleanupTestUser } from '../auth-helpers'

const email = `donor_e2e_${Date.now()}@test.com`

test.afterEach(async ({ request }) => {
  await cleanupTestUser(request, email)
})

test('donor creates a donation and sees it in the table', async ({ page, request }) => {

  // Register & Login via API
  await registerViaApi(request, {
    name: 'Doador E2E',
    email,
    password: '123456',
    role: 'DONOR',
    document: '12345678901',
    zipCode: '01001000',
  })
  await loginWithApi(page, email, '123456')

  // Navigate to donor dashboard
  await page.goto('/dashboard/donor')

  // Create donation
  await page.click('text=+ Nova Doação')
  await page.fill('#donation-name', 'Arroz Doação')
  await page.selectOption('#donation-category', 'Mercearia')
  await page.fill('#donation-weight', '10')
  await page.fill('#donation-expires', '2030-12-31')
  await page.click('text=Salvar')

  // Wait for modal to close and table to update
  await expect(page.locator('.modal-overlay')).not.toBeVisible({ timeout: 5000 })
  await expect(page.locator('text=Arroz Doação')).toBeVisible()
  await expect(page.locator('text=Disponível')).toBeVisible()
})
