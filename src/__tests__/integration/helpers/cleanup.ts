import { prisma } from '@/lib/prisma'

export async function removeTestUsersByEmail(emails: string[]): Promise<void> {
  const users = await prisma.user.findMany({
    where: { email: { in: emails } },
    select: { id: true },
  })
  const ids = users.map((u) => u.id)
  if (ids.length === 0) return

  const donations = await prisma.donation.findMany({
    where: {
      OR: [
        { donorId: { in: ids } },
        { ongId: { in: ids } },
        { reservedByOngId: { in: ids } },
      ],
    },
    select: { id: true },
  })
  const donationIds = donations.map((d) => d.id)

  await prisma.auditLog.deleteMany({
    where: {
      OR: [
        { donationId: { in: donationIds } },
        { donorId: { in: ids } },
        { ongId: { in: ids } },
        { executorId: { in: ids } },
      ],
    },
  })

  await prisma.donation.deleteMany({
    where: {
      OR: [
        { donorId: { in: ids } },
        { ongId: { in: ids } },
        { reservedByOngId: { in: ids } },
      ],
    },
  })

  await prisma.profile.deleteMany({ where: { userId: { in: ids } } })
  await prisma.user.deleteMany({ where: { id: { in: ids } } })
}