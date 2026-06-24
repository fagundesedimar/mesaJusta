import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth/token'
import { COOKIE_NAME } from '@/lib/auth/cookie'
import { calcGreenCoins } from '@/lib/gamification/formulas'
import { getESGBadge } from '@/lib/gamification/badges'

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

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const donations = await prisma.donation.findMany({
      where: {
        status: 'COLLECTED',
        createdAt: { gte: startOfMonth },
      },
      include: {
        donor: {
          include: { profile: true },
        },
      },
    })

    const donorMap = new Map<string, { name: string; coins: number }>()

    for (const donation of donations) {
      const donorId = donation.donorId
      const coins = calcGreenCoins(Number(donation.weightKg), donation.category)
      const entry = donorMap.get(donorId)
      if (entry) {
        entry.coins += coins
      } else {
        donorMap.set(donorId, {
          name: donation.donor.profile?.name ?? 'Estabelecimento',
          coins,
        })
      }
    }

    const ranking = Array.from(donorMap.entries())
      .sort(([, a], [, b]) => b.coins - a.coins)
      .slice(0, 10)
      .map(([, entry], index) => ({
        rank: index + 1,
        establishmentName: entry.name,
        greenCoins: entry.coins,
        badge: getESGBadge(entry.coins),
      }))

    return NextResponse.json({ data: ranking })
  } catch (error) {
    console.error('Ranking error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor.' },
      { status: 500 }
    )
  }
}
