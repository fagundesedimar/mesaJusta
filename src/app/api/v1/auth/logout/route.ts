import { NextResponse, type NextRequest } from 'next/server'
import { clearAuthCookie } from '@/lib/auth/cookie'

export async function GET(request: NextRequest) {
  const loginUrl = new URL('/login', request.url)
  const response = NextResponse.redirect(loginUrl)
  clearAuthCookie(response)
  return response
}

export async function POST() {
  const response = NextResponse.json(
    { message: 'Logout realizado.' },
    { status: 200 }
  )
  clearAuthCookie(response)
  return response
}
