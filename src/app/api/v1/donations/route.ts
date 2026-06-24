import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CreateDonationSchema } from '@/lib/schemas/donation.schema'
import { verifyToken } from '@/lib/auth/token'
import { COOKIE_NAME } from '@/lib/auth/cookie'
import { calcMoedasVerdes } from '@/lib/esg/formulas'

async function authenticate(request: NextRequest) {
  const tokenCookie = request.cookies.get(COOKIE_NAME)?.value
  if (!tokenCookie) return null
  return verifyToken(tokenCookie)
}

export async function POST(request: NextRequest) {
  try {
    const payload = await authenticate(request)
    if (!payload || payload.role !== 'DONOR') {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = CreateDonationSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    const { name, category, weightKg, expiresAt, notes } = parsed.data
    const moedasVerdes = calcMoedasVerdes(weightKg, category)

    const donation = await prisma.donation.create({
      data: {
        name,
        category,
        weightKg,
        expiresAt: new Date(expiresAt),
        notes: notes ?? null,
        moedasVerdes,
        donorId: payload.sub,
      },
    })

    return NextResponse.json(donation, { status: 201 })
  } catch (error) {
    console.error('Create donation error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const payload = await authenticate(request)
    if (!payload || payload.role !== 'DONOR') {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 })
    }

    await prisma.donation.updateMany({
      where: {
        status: { in: ['AVAILABLE', 'RESERVED'] },
        expiresAt: { lt: new Date() },
      },
      data: { status: 'EXPIRED' },
    })

    const [donations, user] = await Promise.all([
      prisma.donation.findMany({
        where: { donorId: payload.sub },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.findUnique({
        where: { id: payload.sub },
        include: { profile: true },
      }),
    ])

    return NextResponse.json({
      donations,
      greenCoins: user?.greenCoins ?? 0,
      establishmentName: user?.profile?.name ?? '',
    })
  } catch (error) {
    console.error('List donations error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
  }
}
