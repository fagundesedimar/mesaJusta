import { test, expect } from '@playwright/test'
import { loginWithApi, cleanupTestUser } from '../auth-helpers'

const email = `donor_${Date.now()}@test.com`

test.afterEach(async ({ request }) => {
  await cleanupTestUser(request, email)
})

test('register donor and login', async ({ page }) => {

  await page.goto('/register')

  // Step 1: Personal data
  await page.fill('#name', 'Doador Teste')
  await page.fill('#email', email)
  await page.fill('#password', '123456')
  await page.selectOption('#role', 'DONOR')
  await page.click('text=Próximo')

  // Step 2: Document
  await page.fill('#document', '12345678901')
  await page.click('text=Próximo')

  // Step 3: ZIP code
  await page.fill('#zipCode', '01001000')
  await page.click('text=Cadastrar')

  await expect(page).toHaveURL('/login')

  // Login through auth API and keep cookies for session
  await loginWithApi(page, email, '123456')

  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/dashboard/)
})
