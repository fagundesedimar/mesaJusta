import { NextResponse } from 'next/server'
import { PrismaClient } from '../../../../../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

export async function GET() {
  try {
    const databaseUrl = process.env.DATABASE_URL
    if (!databaseUrl) {
      return NextResponse.json({ error: 'DATABASE_URL not set' }, { status: 500 })
    }

    let adapter
    try {
      adapter = new PrismaPg(databaseUrl)
    } catch (e: any) {
      return NextResponse.json({ error: 'Adapter init failed', message: e.message }, { status: 500 })
    }

    let prisma: any
    try {
      prisma = new PrismaClient({ adapter })
      await prisma.$connect()
    } catch (e: any) {
      return NextResponse.json({ error: 'Prisma connect failed', message: e.message, stack: e.stack }, { status: 500 })
    }

    const result = await prisma.user.count()
    await prisma.$disconnect()

    return NextResponse.json({ status: 'ok', userCount: result })
  } catch (e: any) {
    return NextResponse.json({ error: 'Unexpected error', message: e.message, stack: e.stack }, { status: 500 })
  }
}
