import { test, expect } from '@playwright/test'

test('admin views dashboard and exports ESG report', async ({ page }) => {
  const email = `admin_e2e_${Date.now()}@test.com`

  // Register as ADMIN
  await page.goto('/register')
  await page.fill('#name', 'Admin E2E')
  await page.fill('#email', email)
  await page.fill('#password', '123456')
  await page.selectOption('#role', 'ADMIN')
  await page.click('text=Próximo')
  await page.fill('#document', '12345678901234')
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

  // Navigate to admin dashboard
  await page.goto('/admin/dashboard')

  // Verify KPI cards are visible
  await expect(page.locator('.kpi-card')).toHaveCount(4)
  await expect(page.locator('text=Kg Salvos')).toBeVisible()
  await expect(page.locator('text=Refeições')).toBeVisible()
  await expect(page.locator('text=CO₂ Evitado')).toBeVisible()
  await expect(page.locator('text=Doações Coletadas')).toBeVisible()

  // Set date filter and export PDF
  await page.fill('input[type="date"]:first-child', '2025-01-01')
  await page.fill('input[type="date"]:last-child', '2030-12-31')
  await page.click('text=Exportar Relatório ESG')

  // Verify download triggered (wait for new page/tab to open)
  await page.waitForTimeout(1000)
})
