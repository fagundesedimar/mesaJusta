import { describe, it, expect } from 'vitest'
import { prisma } from '@/lib/prisma'

describe('Prisma debug', () => {
  it('should find profiles', async () => {
    const profiles = await prisma.profile.findMany()
    expect(Array.isArray(profiles)).toBe(true)
    console.log('Profiles:', profiles.length)
  })

  it('should delete profiles', async () => {
    const result = await prisma.profile.deleteMany()
    console.log('Deleted profiles:', result)
    expect(result).toBeDefined()
  })

  it('should delete users', async () => {
    const result = await prisma.user.deleteMany()
    console.log('Deleted users:', result)
    expect(result).toBeDefined()
  })
})
