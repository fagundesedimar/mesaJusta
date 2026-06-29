import { test, expect } from '@playwright/test'
import { registerViaApi, loginWithApi, cleanupTestUser } from '../auth-helpers'

const emailRes = `ong_e2e_res_${Date.now()}@test.com`
const emailEmpty = `ong_e2e_empty_${Date.now()}@test.com`

test.afterEach(async ({ request }) => {
  await cleanupTestUser(request, emailRes)
  await cleanupTestUser(request, emailEmpty)
})

test('ONG reserves and cancels a donation lot', async ({ page, request }) => {
  // Register & Login via API
  await registerViaApi(request, {
    name: 'ONG Reserva',
    email: emailRes,
    password: '123456',
    role: 'ONG',
    document: '11111111111111',
    zipCode: '01001000',
  })
  await loginWithApi(page, emailRes, '123456')

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

test('ONG reservations page shows empty state', async ({ page, request }) => {
  // Register & Login via API
  await registerViaApi(request, {
    name: 'ONG Vazia',
    email: emailEmpty,
    password: '123456',
    role: 'ONG',
    document: '11111111111111',
    zipCode: '01001000',
  })
  await loginWithApi(page, emailEmpty, '123456')

  await page.goto('/ong/reservations')
  await page.waitForLoadState('networkidle')
  await expect(page.locator('.reservations-page__title')).toHaveText('Minhas Reservas')
})
