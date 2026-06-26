import type { Page } from '@playwright/test'

type CookieInput = {
  name: string
  value: string
  url: string
  path?: string
  secure?: boolean
  httpOnly?: boolean
  sameSite?: 'Strict' | 'Lax' | 'None'
}

const DEFAULT_BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${process.env.FRONTEND_PORT ?? '3000'}`

function parseSetCookieHeader(header: string, url: string): CookieInput {
  const parts = header.split(';').map((part) => part.trim())
  const [nameValue, ...attrs] = parts
  const [name, ...valueParts] = nameValue.split('=')
  const value = valueParts.join('=')

  const cookie: CookieInput = {
    name,
    value,
    url,
    path: '/',
  }

  for (const attr of attrs) {
    const [attrName, attrValue] = attr.split('=')
    const normalized = attrName.toLowerCase()

    if (normalized === 'path' && attrValue) {
      cookie.path = attrValue
    }
    if (normalized === 'secure') {
      cookie.secure = true
    }
    if (normalized === 'httponly') {
      cookie.httpOnly = true
    }
    if (normalized === 'samesite' && attrValue) {
      const value = attrValue.trim()
      if (value === 'Strict' || value === 'Lax' || value === 'None') {
        cookie.sameSite = value
      }
    }
  }

  return cookie
}

export async function loginWithApi(page: Page, email: string, password: string) {
  const response = await page.request.post('/api/v1/auth/login', {
    data: { email, password },
  })

  if (response.status() !== 200) {
    throw new Error(`Login API failed with status ${response.status()}`)
  }

  const cookieHeaders = response.headersArray().filter((header) => header.name.toLowerCase() === 'set-cookie')
  if (!cookieHeaders.length) {
    throw new Error('Login response did not return set-cookie headers')
  }

  const cookies = cookieHeaders.map((header) => parseSetCookieHeader(header.value, DEFAULT_BASE_URL))
  await page.context().addCookies(cookies)

  return response
}
