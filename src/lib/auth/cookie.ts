import { NextResponse } from 'next/server'

const COOKIE_NAME = 'auth_token'
const REFRESH_COOKIE_NAME = 'refresh_token'
const MAX_AGE = 28800
const REFRESH_MAX_AGE = 604800

export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: MAX_AGE,
    path: '/',
  })
}

export function setRefreshCookie(response: NextResponse, token: string): void {
  response.cookies.set(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: REFRESH_MAX_AGE,
    path: '/api/v1/auth/refresh',
  })
}

export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  })
  response.cookies.set(REFRESH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 0,
    path: '/api/v1/auth/refresh',
  })
}

export { COOKIE_NAME, REFRESH_COOKIE_NAME }
