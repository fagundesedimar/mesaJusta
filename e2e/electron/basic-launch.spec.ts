import { test, expect, _electron } from '@playwright/test'

test('Electron app launches and loads login page', async () => {
  const electronApp = await _electron.launch({
    args: ['.'],
  })

  const window = await electronApp.firstWindow()
  await expect(window).toHaveTitle(/Mesa Justa/)

  const url = window.url()
  expect(url).toContain('localhost:3000')

  await electronApp.close()
})

test('Electron window has correct dimensions', async () => {
  const electronApp = await _electron.launch({
    args: ['.'],
  })

  const window = await electronApp.firstWindow()
  const { width, height } = await window.evaluate(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }))

  expect(width).toBe(1280)
  expect(height).toBe(800)

  await electronApp.close()
})
