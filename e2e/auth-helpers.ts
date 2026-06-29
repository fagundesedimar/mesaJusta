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

function parseSetCookieHeader(header: string): CookieInput {
  const parts = header.split(';').map((part) => part.trim())
  const [nameValue, ...attrs] = parts
  const [name, ...valueParts] = nameValue.split('=')
  const value = valueParts.join('=')

  const cookie: CookieInput = {
    name,
    value,
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

export async function cleanupTestUser(
  api: { post: (url: string, options?: { data?: unknown }) => Promise<{ status: () => number; json: () => Promise<unknown> }> },
  email: string
) {
  try {
    const response = await api.post('/api/v1/auth/cleanup', {
      data: { email },
    })
    const data = await response.json() as { message?: string; error?: string }
    console.log(`[cleanup] ${email}: ${data.message ?? data.error ?? ''}`)
  } catch (err) {
    console.error(`[cleanup] Failed to delete ${email}:`, err)
  }
}

export async function registerViaApi(
  api: { post: (url: string, options?: { data?: unknown }) => Promise<{ status: () => number; json: () => Promise<unknown> }> },
  data: {
    name: string
    email: string
    password: string
    role: string
    document: string
    zipCode: string
  }
) {
  const response = await api.post('/api/v1/auth/register', { data })
  if (response.status() !== 201) {
    const body = await response.json() as { error?: unknown }
    throw new Error(`Register API failed: ${JSON.stringify(body)}`)
  }
}

export async function registerViaUI(
  page: Page,
  data: {
    name: string
    email: string
    password: string
    role: string
    document: string
    zipCode: string
  }
) {
  await page.goto('/login')
  await page.click('text=Criar Conta')
  await page.fill('#name', data.name)
  await page.fill('#reg-email', data.email)
  await page.fill('#reg-password', data.password)
  await page.selectOption('#role', data.role)
  await page.click('text=Próximo')
  await page.fill('#document', data.document)
  await page.click('text=Próximo')
  await page.fill('#zipCode', data.zipCode)
  await page.click('text=Confirmar Cadastro')
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

  const cookies = cookieHeaders.map((header) => parseSetCookieHeader(header.value))
  await page.context().addCookies(cookies.map((c) => ({ ...c, domain: 'localhost' })))

  return response
}
