import { NextResponse } from 'next/server'
import { clearAuthCookie } from '@/lib/auth/cookie'

export async function POST() {
  const response = NextResponse.json(
    { message: 'Logout realizado.' },
    { status: 200 }
  )
  clearAuthCookie(response)
  return response
}
