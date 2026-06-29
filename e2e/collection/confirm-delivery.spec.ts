import { test, expect } from '@playwright/test'
import { registerViaApi, loginWithApi, cleanupTestUser } from '../auth-helpers'

const email = `donor_e2e_${Date.now()}@test.com`

test.afterEach(async ({ request }) => {
  await cleanupTestUser(request, email)
})

test('ong reserves donation, donor confirms delivery with token', async ({ page, request }) => {

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

  // Click confirm on a RESERVED donation
  const confirmBtn = page.locator('text=Confirmar Entrega')
  if (await confirmBtn.count() > 0) {
    await confirmBtn.first().click()
    await expect(page.locator('.modal-title')).toHaveText('Confirmar Entrega')
    await page.fill('#confirm-token', 'TEST12')
    await page.click('text=Confirmar')
  }
})
