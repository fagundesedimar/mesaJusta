import { test, expect } from '@playwright/test'
import { loginWithApi, registerViaApi, cleanupTestUser } from '../auth-helpers'

const email = `donor_${Date.now()}@test.com`

test.beforeEach(async ({ request }) => {
  await registerViaApi(request, {
    name: 'Doador Teste',
    email,
    password: '123456',
    role: 'DONOR',
    document: '12345678901',
    zipCode: '01001000',
  })
})

test.afterEach(async ({ request }) => {
  await cleanupTestUser(request, email)
})

test('register donor and login', async ({ page }) => {

  // Login through auth API and keep cookies for session
  await loginWithApi(page, email, '123456')

  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/dashboard/)
})
