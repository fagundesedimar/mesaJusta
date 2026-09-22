import { describe, it, expect, vi } from 'vitest'
import { expireDueDonations } from '@/lib/donations/expiry'
import type { DonationUpdater } from '@/lib/donations/expiry'

function makeUpdater(count = 2): {
  client: DonationUpdater
  updateMany: ReturnType<typeof vi.fn>
} {
  const updateMany = vi.fn().mockResolvedValue({ count })
  const client = { donation: { updateMany } } as unknown as DonationUpdater
  return { client, updateMany }
}

describe('expireDueDonations', () => {
  it('expires AVAILABLE and RESERVED overdue donations by default', async () => {
    const { client, updateMany } = makeUpdater()

    const count = await expireDueDonations(client)

    expect(count).toBe(2)
    expect(updateMany).toHaveBeenCalledTimes(1)

    const [args] = updateMany.mock.calls[0]
    expect(args.where.expiresAt.lt).toBeInstanceOf(Date)
    expect(args.where.status).toEqual({ in: ['AVAILABLE', 'RESERVED'] })
    expect(args.data).toEqual({ status: 'EXPIRED' })
  })

  it('expires only AVAILABLE when includeReserved is false', async () => {
    const { client, updateMany } = makeUpdater()

    await expireDueDonations(client, { includeReserved: false })

    const [args] = updateMany.mock.calls[0]
    expect(args.where.status).toBe('AVAILABLE')
  })

  it('returns the number of updated donations', async () => {
    const { client } = makeUpdater(5)

    const count = await expireDueDonations(client)

    expect(count).toBe(5)
  })
})