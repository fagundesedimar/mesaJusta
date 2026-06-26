import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const results: Record<string, any> = {}

  try {
    const count = await prisma.user.count()
    results['status'] = 'ok'
    results['userCount'] = count
  } catch (e: any) {
    results['status'] = 'error'
    results['message'] = e.message
  }

  return NextResponse.json(results)
}
