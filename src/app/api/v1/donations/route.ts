import { NextResponse, type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { CreateDonationSchema } from '@/lib/schemas/donation.schema'
import { verifyToken } from '@/lib/auth/token'
import { COOKIE_NAME } from '@/lib/auth/cookie'
import { calcMoedasVerdes } from '@/lib/esg/formulas'
import { geocodeAddress } from '@/lib/geo/nominatim'

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

    const profile = await prisma.profile.findUnique({
      where: { userId: payload.sub },
    })

    let latitude: number | null = null
    let longitude: number | null = null

    if (profile?.zipCode) {
      const address = `${profile.zipCode}, ${profile.state ?? 'Brasil'}`
      const coords = await geocodeAddress(address).catch(() => null)
      if (coords) {
        latitude = coords.lat
        longitude = coords.lng
      } else {
        console.error(`Geocode failed for address: ${address}`)
      }
    }

    const donation = await prisma.donation.create({
      data: {
        name,
        category,
        weightKg,
        expiresAt: new Date(expiresAt),
        notes: notes ?? null,
        moedasVerdes,
        donorId: payload.sub,
        latitude,
        longitude,
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
    if (!payload) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
    }

    const { searchParams } = request.nextUrl
    const latParam = searchParams.get('lat')
    const lngParam = searchParams.get('lng')
    const radiusParam = searchParams.get('radius')

    const hasSpatialParams = latParam !== null && lngParam !== null && radiusParam !== null

    if (hasSpatialParams) {
      if (payload.role !== 'ONG') {
        return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 })
      }

      const lat = parseFloat(latParam)
      const lng = parseFloat(lngParam)
      const radius = parseFloat(radiusParam)

      if (isNaN(lat) || isNaN(lng) || isNaN(radius) || radius <= 0) {
        return NextResponse.json({ error: 'Parâmetros inválidos.' }, { status: 422 })
      }

      await prisma.donation.updateMany({
        where: {
          status: 'AVAILABLE',
          expiresAt: { lt: new Date() },
        },
        data: { status: 'EXPIRED' },
      })

      const donations = await prisma.$queryRaw<Array<Record<string, unknown>>>`
        SELECT
          d.*,
          ROUND(
            CAST(ST_Distance(
              ST_MakePoint(d.longitude, d.latitude)::geography,
              ST_MakePoint(${lng}, ${lat})::geography
            ) / 1000 AS numeric), 1
          )::float AS "distanceKm"
        FROM "Donation" d
        WHERE
          d.latitude IS NOT NULL
          AND d.longitude IS NOT NULL
          AND d.status = 'AVAILABLE'
          AND ST_DWithin(
            ST_MakePoint(d.longitude, d.latitude)::geography,
            ST_MakePoint(${lng}, ${lat})::geography,
            ${radius * 1000}
          )
        ORDER BY ST_Distance(
          ST_MakePoint(d.longitude, d.latitude)::geography,
          ST_MakePoint(${lng}, ${lat})::geography
        ) ASC
        LIMIT 100
      `

      return NextResponse.json({ donations })
    }

    await prisma.donation.updateMany({
      where: {
        status: { in: ['AVAILABLE', 'RESERVED'] },
        expiresAt: { lt: new Date() },
      },
      data: { status: 'EXPIRED' },
    })

    if (payload.role === 'DONOR') {
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
    }

    const donations = await prisma.donation.findMany({
      where: { status: 'AVAILABLE', latitude: { not: null }, longitude: { not: null } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json({ donations })
  } catch (error) {
    console.error('List donations error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor.' }, { status: 500 })
  }
}
