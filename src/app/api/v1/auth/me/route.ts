import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth/token'
import { COOKIE_NAME } from '@/lib/auth/cookie'

export async function GET(request: NextRequest) {
  try {
    const tokenCookie = request.cookies.get(COOKIE_NAME)?.value
    if (!tokenCookie) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const payload = await verifyToken(tokenCookie)
    if (!payload) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        role: true,
        latitude: true,
        longitude: true,
        profile: {
          select: {
            name: true,
            zipCode: true,
            state: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Auth me error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    )
  }
}
