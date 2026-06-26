import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const result = await prisma.user.count()
    return NextResponse.json({ status: 'ok', userCount: result })
  } catch (e: any) {
    return NextResponse.json({ error: 'prisma error', message: e.message, stack: e?.stack?.split('\n')?.slice(0,5)?.join(' | ') || 'N/A' }, { status: 500 })
  }
}
