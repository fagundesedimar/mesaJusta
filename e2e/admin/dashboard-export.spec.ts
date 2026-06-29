import { test, expect } from '@playwright/test'
import { registerViaApi, loginWithApi, cleanupTestUser } from '../auth-helpers'

const email = `admin_e2e_${Date.now()}@test.com`

test.afterEach(async ({ request }) => {
  await cleanupTestUser(request, email)
})

test('admin views dashboard with KPI cards', async ({ page, request }) => {

  // Register & Login via API
  await registerViaApi(request, {
    name: 'Admin E2E',
    email,
    password: '123456',
    role: 'ADMIN',
    document: '12345678901234',
    zipCode: '01001000',
  })
  await loginWithApi(page, email, '123456')

  // Navigate to admin dashboard
  await page.goto('/admin/dashboard')

  // Verify KPI cards are visible
  await expect(page.locator('.kpi-card')).toHaveCount(4)
  await expect(page.locator('text=Kg Salvos')).toBeVisible()
  await expect(page.locator('text=Famílias Atendidas')).toBeVisible()
  await expect(page.locator('text=CO₂ Evitado')).toBeVisible()
  await expect(page.locator('text=Doações Coletadas')).toBeVisible()
})
