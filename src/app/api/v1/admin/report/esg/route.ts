import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth/token'
import { COOKIE_NAME } from '@/lib/auth/cookie'
import { calcMeals, calcCO2eq, calcTons } from '@/lib/esg/formulas'
import { generateESGReport } from '@/lib/pdf/esg-report'

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

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: Record<string, unknown> = { status: 'COLLECTED' }
    if (startDate || endDate) {
      const createdAt: Record<string, Date> = {}
      if (startDate) createdAt.gte = new Date(startDate)
      if (endDate) createdAt.lte = new Date(endDate)
      where.createdAt = createdAt
    }

    const aggregation = await prisma.donation.aggregate({
      _sum: { weightKg: true },
      _count: true,
      where,
    })

    const totalKgSaved = Number(aggregation._sum.weightKg ?? 0)

    const totalONGs = await prisma.donation.groupBy({
      by: ['ongId'],
      where: { ...where, ongId: { not: null } },
    })

    const metrics = {
      totalKgSaved,
      totalTonsSaved: calcTons(totalKgSaved),
      totalMeals: calcMeals(totalKgSaved),
      totalCO2eqKg: calcCO2eq(totalKgSaved),
      totalDonations: aggregation._count,
      totalONGs: totalONGs.length,
    }

    const period = { start: startDate ?? undefined, end: endDate ?? undefined }
    const pdfBuffer = await generateESGReport(metrics, period)

    const filename = startDate && endDate
      ? `relatorio-esg-${startDate}-${endDate}.pdf`
      : 'relatorio-esg.pdf'

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('ESG report error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
  }
}
