import { test, expect } from '@playwright/test'

test('registration blocked for RJ zip code', async ({ page }) => {
  await page.goto('/register')

  await page.fill('#name', 'Bloqueado RJ')
  await page.fill('#email', `blocked_${Date.now()}@test.com`)
  await page.fill('#password', '123456')
  await page.selectOption('#role', 'DONOR')
  await page.click('text=Próximo')

  await page.fill('#document', '12345678901')
  await page.click('text=Próximo')

  await page.fill('#zipCode', '20040000')

  await expect(page.locator('.auth-form__field-error')).toContainText('Cadastro restrito aos estados de SP e MG')
})
