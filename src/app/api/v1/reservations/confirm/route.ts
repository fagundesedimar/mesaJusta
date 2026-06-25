import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ConfirmDeliverySchema } from '@/lib/schemas/reservation.schema'
import { verifyToken } from '@/lib/auth/token'
import { COOKIE_NAME } from '@/lib/auth/cookie'
import { calcGreenCoins } from '@/lib/gamification/formulas'

export async function POST(request: NextRequest) {
  try {
    const tokenCookie = request.cookies.get(COOKIE_NAME)?.value
    if (!tokenCookie) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const payload = await verifyToken(tokenCookie)
    if (!payload) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = ConfirmDeliverySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    const { donationId, token } = parsed.data

    const donation = await prisma.donation.findUnique({
      where: { id: donationId },
    })

    if (!donation) {
      return NextResponse.json(
        { error: 'Doação não encontrada.' },
        { status: 404 }
      )
    }

    if (donation.status === 'COLLECTED') {
      return NextResponse.json(
        { error: 'Esta doação já foi coletada.' },
        { status: 409 }
      )
    }

    if (donation.status !== 'RESERVED') {
      return NextResponse.json(
        { error: 'Esta doação não está disponível para confirmação de entrega.' },
        { status: 409 }
      )
    }

    if (donation.reservationToken !== token) {
      return NextResponse.json(
        { error: 'Token inválido. Verifique com a ONG.' },
        { status: 400 }
      )
    }

    const coins = calcGreenCoins(Number(donation.weightKg), donation.category)

    await prisma.$transaction([
      prisma.donation.update({
        where: { id: donationId },
        data: { status: 'COLLECTED' },
      }),
      prisma.auditLog.create({
        data: {
          donationId,
          ongId: donation.reservedByOngId ?? donation.ongId ?? '',
          donorId: donation.donorId,
          executorId: payload.sub,
        },
      }),
      prisma.user.update({
        where: { id: donation.donorId },
        data: { greenCoins: { increment: coins } },
      }),
    ])

    return NextResponse.json(
      { message: 'Entrega confirmada com sucesso.', greenCoins: coins },
      { status: 200 }
    )
  } catch (error) {
    console.error('Confirm error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    )
  }
}
