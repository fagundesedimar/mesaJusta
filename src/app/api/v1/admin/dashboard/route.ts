import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth/token'
import { COOKIE_NAME } from '@/lib/auth/cookie'
import { calcMeals, calcCO2eq, calcTons } from '@/lib/esg/formulas'

export async function GET(request: NextRequest) {
  try {
    const tokenCookie = request.cookies.get(COOKIE_NAME)?.value
    if (!tokenCookie) {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 })
    }

    const payload = await verifyToken(tokenCookie)
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 })
    }

    const aggregation = await prisma.donation.aggregate({
      _sum: { weightKg: true },
      _count: true,
      where: { status: 'COLLECTED' },
    })

    const totalKgSaved = Number(aggregation._sum.weightKg ?? 0)

    const totalONGs = await prisma.donation.groupBy({
      by: ['ongId'],
      where: { status: 'COLLECTED', ongId: { not: null } },
    })

    return NextResponse.json({
      totalKgSaved,
      totalTonsSaved: calcTons(totalKgSaved),
      totalMeals: calcMeals(totalKgSaved),
      totalCO2eqKg: calcCO2eq(totalKgSaved),
      totalDonations: aggregation._count,
      totalONGs: totalONGs.length,
    })
  } catch (error) {
    console.error('Dashboard metrics error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
  }
}
