import { test, expect } from '@playwright/test'

test('direct access to /dashboard without session redirects to /login', async ({ page }) => {
  await page.goto('/dashboard', { waitUntil: 'networkidle' })

  await expect(page).toHaveURL(/\/login/)
})
