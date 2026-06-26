import { test, expect } from '@playwright/test'
import { cleanupTestUser } from '../auth-helpers'

const email = `donor_gami_${Date.now()}@test.com`

test.afterEach(async ({ request }) => {
  await cleanupTestUser(request, email)
})

test('donor sees green coins card and ranking on dashboard', async ({ page }) => {

  // Register donor
  await page.goto('/register')
  await page.fill('#name', 'Doador Gamificação')
  await page.fill('#email', email)
  await page.fill('#password', '123456')
  await page.selectOption('#role', 'DONOR')
  await page.click('text=Próximo')
  await page.fill('#document', '12345678901')
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

  // Check that the green coins card is visible
  await expect(page.locator('.green-coins-card')).toBeVisible()
  await expect(page.locator('.green-coins-card__value')).toHaveText('0')

  // Check that the ranking section is visible
  await expect(page.locator('.ranking-table')).toBeVisible()
})
