import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { LoginSchema } from '@/lib/schemas/auth.schema'
import { verifyPassword } from '@/lib/auth/password'
import { signToken, signRefreshToken } from '@/lib/auth/token'
import { setAuthCookie, setRefreshCookie } from '@/lib/auth/cookie'

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

    const user = await prisma.user.findFirst({
      where: { email, deletedAt: null },
      include: { profile: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciais inválidas.' },
        { status: 401 }
      )
    }

    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) {
      return NextResponse.json(
        { error: 'Credenciais inválidas.' },
        { status: 401 }
      )
    }

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
