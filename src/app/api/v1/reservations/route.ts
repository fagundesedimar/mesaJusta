import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CreateReservationSchema } from '@/lib/schemas/reservation.schema'
import { verifyToken } from '@/lib/auth/token'
import { COOKIE_NAME } from '@/lib/auth/cookie'
import { generateReservationToken } from '@/lib/reservation/token'

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

    if (payload.role !== 'ONG') {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 })
    }

    const reservations = await prisma.donation.findMany({
      where: {
        reservedByOngId: payload.sub,
        status: 'RESERVED',
      },
      select: {
        id: true,
        name: true,
        category: true,
        weightKg: true,
        reservationToken: true,
        reservedAt: true,
        expiresAt: true,
      },
      orderBy: { reservedAt: 'desc' },
    })

    return NextResponse.json({ reservations })
  } catch (error) {
    console.error('List reservations error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    )
  }
}

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
    const parsed = CreateReservationSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    const { donationId } = parsed.data
    const now = new Date()

    let reservationToken: string | undefined
    let created = false

    for (let attempt = 0; attempt < 3; attempt++) {
      const token = generateReservationToken()

      const result = await prisma.$transaction(async (tx) => {
        const donation = await tx.donation.findUnique({
          where: { id: donationId },
        })

        if (!donation || donation.status !== 'AVAILABLE') {
          return { conflict: true }
        }

        const existing = await tx.donation.findUnique({
          where: { reservationToken: token },
        })

        if (existing) {
          return { retry: true }
        }

        await tx.donation.update({
          where: { id: donationId },
          data: {
            status: 'RESERVED',
            reservationToken: token,
            reservedAt: now,
            reservedByOngId: payload.sub,
          },
        })

        return { conflict: false, retry: false }
      })

      if (result.conflict) {
        return NextResponse.json(
          { error: 'Este lote não está mais disponível.' },
          { status: 409 }
        )
      }

      if (!result.retry) {
        reservationToken = token
        created = true
        break
      }
    }

    const expiresAt = await prisma.donation.findUnique({
      where: { id: donationId },
      select: { expiresAt: true },
    })

    return NextResponse.json(
      {
        donationId,
        reservationToken,
        reservedAt: now.toISOString(),
        expiresAt: expiresAt?.expiresAt.toISOString(),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Reservation error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    )
  }
}
