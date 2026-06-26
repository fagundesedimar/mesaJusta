import { NextResponse } from 'next/server'
import dns from 'node:dns'
import net from 'node:net'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const results: Record<string, any> = {}
  const host = 'db.nzxhdqrbdvfpfobluyxd.supabase.co'

  try {
    const addresses = await new Promise<any[]>((resolve, reject) => {
      dns.resolve4(host, (err, addresses) => {
        if (err) resolve([])
        else resolve(addresses)
      })
    })
    results['dns_ipv4'] = addresses
  } catch (e: any) {
    results['dns_ipv4'] = 'error: ' + e.message
  }

  try {
    const addresses = await new Promise<any[]>((resolve, reject) => {
      dns.resolve6(host, (err, addresses) => {
        if (err) resolve([])
        else resolve(addresses)
      })
    })
    results['dns_ipv6'] = addresses
  } catch (e: any) {
    results['dns_ipv6'] = 'error: ' + e.message
  }

  const ipv6 = results['dns_ipv6']?.[0]
  if (ipv6) {
    try {
      await new Promise<void>((resolve, reject) => {
        const socket = new net.Socket()
        socket.setTimeout(10000)
        socket.on('connect', () => { socket.destroy(); resolve() })
        socket.on('error', (err) => { socket.destroy(); reject(err) })
        socket.on('timeout', () => { socket.destroy(); reject(new Error('timeout')) })
        socket.connect(5432, ipv6)
      })
      results['tcp_ipv6_5432'] = 'ok'
    } catch (e: any) {
      results['tcp_ipv6_5432'] = 'error: ' + e.message
    }
  }

  try {
    const count = await prisma.user.count()
    results['prisma'] = 'ok, user count: ' + count
  } catch (e: any) {
    results['prisma'] = 'error: ' + e.message
  }

  return NextResponse.json(results)
}
