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

    const userIds = new Set<string>()
    const donationIds = new Set<string>()
    for (const log of data) {
      if (log.donorId) userIds.add(log.donorId)
      if (log.ongId) userIds.add(log.ongId)
      if (log.executorId) userIds.add(log.executorId)
      donationIds.add(log.donationId)
    }

    const [users, donations] = await Promise.all([
      prisma.user.findMany({
        where: { id: { in: Array.from(userIds) } },
        include: { profile: true },
      }),
      prisma.donation.findMany({
        where: { id: { in: Array.from(donationIds) } },
        select: { id: true, name: true },
      }),
    ])

    const userMap = new Map(users.map(u => [u.id, u.profile?.name ?? u.email]))
    const donationMap = new Map(donations.map(d => [d.id, d.name]))

    const enriched = data.map(log => ({
      ...log,
      donorName: userMap.get(log.donorId) ?? log.donorId,
      ongName:   userMap.get(log.ongId) ?? log.ongId,
      executorName: userMap.get(log.executorId) ?? log.executorId,
      donationName: donationMap.get(log.donationId) ?? log.donationId,
    }))

    return NextResponse.json({
      data: enriched,
      total,
      page,
      totalPages: Math.ceil(total / PAGE_SIZE),
    })
  } catch (error) {
    console.error('Audit logs error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
  }
}
