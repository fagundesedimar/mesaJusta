import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { LoginSchema } from '@/lib/schemas/auth.schema'
import { verifyPassword } from '@/lib/auth/password'
import { signToken, signRefreshToken } from '@/lib/auth/token'
import { setAuthCookie, setRefreshCookie } from '@/lib/auth/cookie'
import {
  assertLoginNotBlocked,
  recordLoginFailure,
  clearLoginFailures,
} from '@/lib/auth/rate-limit'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = LoginSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Credenciais inválidas.' },
        { status: 401 }
      )
    }

    const { email, password } = parsed.data

    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ip = forwarded?.split(',')[0]?.trim() || realIp || 'unknown'

    const rateLimit = await assertLoginNotBlocked(email, ip)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Muitas tentativas de login. Tente novamente em alguns minutos.' },
        { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
      )
    }

    const user = await prisma.user.findFirst({
      where: { email, deletedAt: null },
      include: { profile: true },
    })

    if (!user) {
      await recordLoginFailure(email, ip)
      return NextResponse.json(
        { error: 'Credenciais inválidas.' },
        { status: 401 }
      )
    }

    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) {
      await recordLoginFailure(email, ip)
      return NextResponse.json(
        { error: 'Credenciais inválidas.' },
        { status: 401 }
      )
    }

    await clearLoginFailures(email)

    const tokenPayload = { sub: user.id, email: user.email, role: user.role }
    const token = await signToken(tokenPayload)
    const refreshToken = await signRefreshToken(tokenPayload)

    const response = NextResponse.json(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.profile?.name,
      },
      { status: 200 }
    )

    setAuthCookie(response, token)
    setRefreshCookie(response, refreshToken)
    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    )
  }
}
