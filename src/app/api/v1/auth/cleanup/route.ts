import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Não disponível em produção.' }, { status: 403 })
    }

    const body = await request.json()
    const { email } = body as { email?: string }

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email é obrigatório.' }, { status: 422 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ message: 'Usuário não encontrado, nenhuma ação necessária.' })
    }

    const donationIds = await prisma.donation.findMany({
      where: { donorId: user.id },
      select: { id: true },
    })

    const ids = donationIds.map((d) => d.id)
    if (ids.length > 0) {
      await prisma.auditLog.deleteMany({ where: { donationId: { in: ids } } })
      await prisma.donation.deleteMany({ where: { donorId: user.id } })
      await prisma.donation.deleteMany({ where: { ongId: user.id } })
    }

    await prisma.profile.deleteMany({ where: { userId: user.id } })
    await prisma.user.delete({ where: { id: user.id } })

    return NextResponse.json({ message: `Usuário ${email} e seus dados foram removidos.` })
  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
  }
}
