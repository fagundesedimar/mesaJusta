import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth/token'
import { COOKIE_NAME } from '@/lib/auth/cookie'

const PUBLIC_ROUTES = ['/login', '/register']
const AUTH_API_PREFIX = '/api/v1/auth'
const DASHBOARD_PREFIX = '/dashboard'
const ADMIN_PREFIX = '/admin'
const API_PREFIX = '/api/v1'

const ROLE_LEVELS: Record<string, number> = {
  DONOR: 1,
  ONG: 2,
  ADMIN: 3,
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route))
  const isAuthApi = pathname.startsWith(AUTH_API_PREFIX)
  const isDashboardRoute = pathname.startsWith(DASHBOARD_PREFIX)
  const isAdminRoute = pathname.startsWith(ADMIN_PREFIX)
  const isApiRoute = pathname.startsWith(API_PREFIX)

  if (isPublicRoute || isAuthApi) {
    return NextResponse.next()
  }

  if (!isDashboardRoute && !isAdminRoute && !isApiRoute) {
    return NextResponse.next()
  }

  const token = request.cookies.get(COOKIE_NAME)?.value

  if (!token) {
    if (isApiRoute) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const payload = await verifyToken(token)

  if (!payload) {
    if (isApiRoute) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAdminRoute && ROLE_LEVELS[payload.role] < ROLE_LEVELS.ADMIN) {
    return NextResponse.json({ error: 'Acesso proibido.' }, { status: 403 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/api/v1/:path*',
  ],
}
