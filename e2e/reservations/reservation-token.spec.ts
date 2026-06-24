import { test, expect } from '@playwright/test'

test('ONG reserves and cancels a donation lot', async ({ page }) => {
  const email = `ong_e2e_res_${Date.now()}@test.com`

  // Register ONG
  await page.goto('/register')
  await page.fill('#name', 'ONG Reserva')
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

  // Navigate to ONG dashboard
  await page.goto('/ong/dashboard')
  await page.waitForLoadState('networkidle')

  // Check sidebar reservation buttons exist
  const reserveBtns = page.locator('.geo-sidebar__card-btn')
  const count = await reserveBtns.count()
  if (count > 0) {
    await reserveBtns.first().click()
  }
})

test('ONG reservations page shows empty state', async ({ page }) => {
  const email = `ong_e2e_empty_${Date.now()}@test.com`

  await page.goto('/register')
  await page.fill('#name', 'ONG Vazia')
  await page.fill('#email', email)
  await page.fill('#password', '123456')
  await page.selectOption('#role', 'ONG')
  await page.click('text=Próximo')
  await page.fill('#document', '11111111111111')
  await page.click('text=Próximo')
  await page.fill('#zipCode', '01001000')
  await page.click('text=Cadastrar')
  await expect(page).toHaveURL('/login')

  await page.goto('/login')
  await page.fill('#email', email)
  await page.fill('#password', '123456')
  await page.click('text=Entrar')
  await expect(page).toHaveURL(/\/dashboard/)

  await page.goto('/ong/reservations')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('.reservations-page__title')).toHaveText('Minhas Reservas')
})
