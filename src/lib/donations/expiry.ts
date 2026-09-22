import type { Prisma } from '@/lib/prisma'

export interface DonationUpdater {
  donation: {
    updateMany(
      args: Prisma.DonationUpdateManyArgs
    ): Promise<Prisma.BatchPayload>
  }
}

export interface ExpireDueDonationsOptions {
  includeReserved?: boolean
}

export async function expireDueDonations(
  client: DonationUpdater,
  options: ExpireDueDonationsOptions = {}
): Promise<number> {
  const { includeReserved = true } = options

  const status: Prisma.DonationWhereInput['status'] = includeReserved
    ? { in: ['AVAILABLE', 'RESERVED'] }
    : 'AVAILABLE'

  const result = await client.donation.updateMany({
    where: {
      status,
      expiresAt: { lt: new Date() },
    },
    data: { status: 'EXPIRED' },
  })

  return result.count
}