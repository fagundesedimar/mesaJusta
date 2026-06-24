import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth/token'
import { COOKIE_NAME } from '@/lib/auth/cookie'

const PAGE_SIZE = 50

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
    const page = Math.max(1, Number(searchParams.get('page')) || 1)

    const where: Record<string, unknown> = {}
    if (startDate || endDate) {
      const timestamp: Record<string, Date> = {}
      if (startDate) timestamp.gte = new Date(startDate)
      if (endDate) timestamp.lte = new Date(endDate)
      where.timestamp = timestamp
    }

    const [data, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.auditLog.count({ where }),
    ])

    return NextResponse.json({
      data,
      total,
      page,
      totalPages: Math.ceil(total / PAGE_SIZE),
    })
  } catch (error) {
    console.error('Audit logs error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
  }
}
