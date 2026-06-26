import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth/token'
import { COOKIE_NAME } from '@/lib/auth/cookie'

async function authenticate(request: NextRequest) {
  const tokenCookie = request.cookies.get(COOKIE_NAME)?.value
  if (!tokenCookie) return null
  return verifyToken(tokenCookie)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await authenticate(_request)
    if (!payload) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const { id } = await params

    const donation = await prisma.donation.findUnique({ where: { id } })
    if (!donation) {
      return NextResponse.json({ error: 'Doação não encontrada.' }, { status: 404 })
    }

    if (payload.role !== 'ADMIN' && donation.donorId !== payload.sub) {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 })
    }

    if (donation.status !== 'AVAILABLE') {
      return NextResponse.json(
        { error: 'Apenas doações com status "Disponível" podem ser excluídas.' },
        { status: 422 }
      )
    }

    await prisma.auditLog.deleteMany({ where: { donationId: id } })
    await prisma.donation.delete({ where: { id } })

    return NextResponse.json({ message: 'Doação excluída com sucesso.' })
  } catch (error) {
    console.error('Delete donation error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
  }
}
