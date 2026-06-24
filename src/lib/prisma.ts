import { PrismaClient } from '../../generated/prisma/client'
import type { Prisma } from '../../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as { prisma: InstanceType<typeof PrismaClient> }

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is required')
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter: new PrismaPg(),
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export type { Prisma }
