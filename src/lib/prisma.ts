import { PrismaClient } from '../../generated/prisma/client'
import type { Prisma } from '../../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as { prisma: InstanceType<typeof PrismaClient> }

const pgUrl = process.env.POSTGRES_URL || process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL
if (!pgUrl) {
  throw new Error('POSTGRES_URL or DATABASE_URL environment variable is required')
}

const cleanUrl = pgUrl.replace(/sslmode=[^&]*/, 'sslmode=no-verify')

const pool = new Pool({
  connectionString: cleanUrl,
  connectionTimeoutMillis: 15000,
  ssl: pgUrl.includes('supabase.co') ? { rejectUnauthorized: false } : undefined,
})

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter: new PrismaPg(pool),
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export type { Prisma }
