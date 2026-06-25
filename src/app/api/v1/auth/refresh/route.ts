import { NextResponse, type NextRequest } from 'next/server'
import { verifyRefreshToken, signToken, signRefreshToken } from '@/lib/auth/token'
import { REFRESH_COOKIE_NAME } from '@/lib/auth/cookie'
import { setAuthCookie, setRefreshCookie } from '@/lib/auth/cookie'

export async function POST(request: NextRequest) {
  try {
    const refreshTokenValue = request.cookies.get(REFRESH_COOKIE_NAME)?.value
    if (!refreshTokenValue) {
      return NextResponse.json({ error: 'Refresh token não encontrado.' }, { status: 401 })
    }

    const payload = await verifyRefreshToken(refreshTokenValue)
    if (!payload) {
      return NextResponse.json({ error: 'Refresh token inválido ou expirado.' }, { status: 401 })
    }

    const tokenPayload = { sub: payload.sub, email: payload.email, role: payload.role }
    const newToken = await signToken(tokenPayload)
    const newRefreshToken = await signRefreshToken(tokenPayload)

    const response = NextResponse.json({ message: 'Token renovado com sucesso.' }, { status: 200 })
    setAuthCookie(response, newToken)
    setRefreshCookie(response, newRefreshToken)
    return response
  } catch {
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
  }
}
