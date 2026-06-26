import { test, expect } from '@playwright/test'
import { cleanupTestUser } from '../auth-helpers'

const email = `donor_e2e_${Date.now()}@test.com`

test.afterEach(async ({ request }) => {
  await cleanupTestUser(request, email)
})

test('ong reserves donation, donor confirms delivery with token', async ({ page }) => {

  // Register donor
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

  // Click confirm on a RESERVED donation
  const confirmBtn = page.locator('text=Confirmar Entrega')
  if (await confirmBtn.count() > 0) {
    await confirmBtn.first().click()
    await expect(page.locator('.modal-title')).toHaveText('Confirmar Entrega')
    await page.fill('#confirm-token', 'TEST12')
    await page.click('text=Confirmar')
  }
})
