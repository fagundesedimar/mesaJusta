import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CancelReservationSchema } from '@/lib/schemas/reservation.schema'
import { verifyToken } from '@/lib/auth/token'
import { COOKIE_NAME } from '@/lib/auth/cookie'

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

    if (payload.role !== 'ONG') {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = CancelReservationSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    const { donationId } = parsed.data

    const donation = await prisma.donation.findUnique({
      where: { id: donationId },
    })

    if (!donation || donation.status !== 'RESERVED') {
      return NextResponse.json(
        { error: 'Esta doação não está reservada.' },
        { status: 409 }
      )
    }

    if (donation.reservedByOngId !== payload.sub) {
      return NextResponse.json(
        { error: 'Você não pode cancelar uma reserva de outra ONG.' },
        { status: 403 }
      )
    }

    await prisma.$transaction([
      prisma.donation.update({
        where: { id: donationId },
        data: {
          status: 'AVAILABLE',
          reservationToken: null,
          reservedAt: null,
          reservedByOngId: null,
        },
      }),
      prisma.auditLog.create({
        data: {
          donationId,
          ongId: donation.ongId ?? payload.sub,
          donorId: donation.donorId,
          executorId: payload.sub,
          timestamp: new Date(),
        },
      }),
    ])

    return NextResponse.json(
      { message: 'Reserva cancelada com sucesso.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Cancel reservation error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    )
  }
}
