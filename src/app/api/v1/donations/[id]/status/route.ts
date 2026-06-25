import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth/token'
import { COOKIE_NAME } from '@/lib/auth/cookie'
import { z } from 'zod'

const VALID_TRANSITIONS: Record<string, string[]> = {
  AVAILABLE: ['RESERVED', 'EXPIRED'],
  RESERVED: ['COLLECTED', 'EXPIRED'],
  COLLECTED: [],
  EXPIRED: [],
}

const StatusUpdateSchema = z.object({
  status: z.enum(['AVAILABLE', 'RESERVED', 'COLLECTED', 'EXPIRED']),
})

async function authenticate(request: NextRequest) {
  const tokenCookie = request.cookies.get(COOKIE_NAME)?.value
  if (!tokenCookie) return null
  return verifyToken(tokenCookie)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const payload = await authenticate(request)
    if (!payload) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    if (payload.role !== 'ADMIN' && payload.role !== 'DONOR') {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 })
    }

    const { id } = await params

    const body = await request.json()
    const parsed = StatusUpdateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Status inválido.', details: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    const { status: newStatus } = parsed.data

    const donation = await prisma.donation.findUnique({ where: { id } })
    if (!donation) {
      return NextResponse.json({ error: 'Doação não encontrada.' }, { status: 404 })
    }

    if (payload.role === 'DONOR' && donation.donorId !== payload.sub) {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 })
    }

    const allowedTransitions = VALID_TRANSITIONS[donation.status] ?? []
    if (!allowedTransitions.includes(newStatus)) {
      return NextResponse.json(
        { error: `Transição inválida: ${donation.status} → ${newStatus}` },
        { status: 422 }
      )
    }

    const updated = await prisma.donation.update({
      where: { id },
      data: { status: newStatus },
    })

    await prisma.auditLog.create({
      data: {
        donationId: id,
        ongId: donation.reservedByOngId ?? '',
        donorId: donation.donorId,
        executorId: payload.sub,
        timestamp: new Date(),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Update donation status error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
  }
}
