import { test, expect } from '@playwright/test'

test.describe('Login flow', () => {
  const validUser = {
    name: 'Login Test User',
    email: `login_e2e_${Date.now()}@test.com`,
    password: '123456',
    role: 'DONOR',
    document: '12345678901',
    zipCode: '01001000',
  }

  test.beforeEach(async ({ request }) => {
    await request.post('/api/v1/auth/register', {
      data: {
        name: validUser.name,
        email: validUser.email,
        password: validUser.password,
        role: validUser.role,
        document: validUser.document,
        zipCode: validUser.zipCode,
      },
    })
  })

  test('should log in successfully and persist session cookie', async ({ page }) => {
    await page.goto('/login')

    await page.fill('#email', validUser.email)
    await page.fill('#password', validUser.password)
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL(/\/dashboard/)

    const cookies = await page.context().cookies()
    expect(cookies.some((cookie) => cookie.name === 'auth_token')).toBeTruthy()
  })

  test('should show a generic error when credentials are invalid', async ({ page }) => {
    await page.goto('/login')

    await page.fill('#email', validUser.email)
    await page.fill('#password', 'wrong-password')
    await page.click('button[type="submit"]')

    const errorBanner = page.locator('.auth-form__error')
    await expect(errorBanner).toBeVisible()
    await expect(errorBanner).toContainText(/Credenciais inválidas\.?/)
    await expect(page).toHaveURL('/login')
  })
})
