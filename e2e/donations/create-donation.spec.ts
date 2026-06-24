import { test, expect } from '@playwright/test'

test('donor creates a donation and sees it in the table', async ({ page }) => {
  const email = `donor_e2e_${Date.now()}@test.com`

  // Register
  await page.goto('/register')
  await page.fill('#name', 'Doador E2E')
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
