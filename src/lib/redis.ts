const REDIS_URL = process.env.REDIS_URL || ''

type CacheValue = string | number | boolean | Record<string, unknown>

let client: ReturnType<typeof createRedisClient> | null = null

function createRedisClient() {
  try {
    const { createClient } = require('redis') as typeof import('redis')
    const c = createClient({ url: REDIS_URL })
    c.on('error', (err: Error) => console.error('[redis]', err.message))
    return c
  } catch {
    return null
  }
}

async function getClient() {
  if (!REDIS_URL) return null
  if (!client) client = createRedisClient()
  if (client && !client.isReady) {
    try { await client.connect() } catch { return null }
  }
  return client
}

export async function cacheGet(key: string): Promise<CacheValue | null> {
  const c = await getClient()
  if (!c) return null
  try {
    const val = await c.get(key)
    return val ? JSON.parse(val) : null
  } catch {
    return null
  }
}

export async function cacheSet(key: string, value: CacheValue, ttlSec = 300): Promise<void> {
  const c = await getClient()
  if (!c) return
  try {
    await c.setEx(key, ttlSec, JSON.stringify(value))
  } catch {
    /* ignore */
  }
}

export async function cacheDel(key: string): Promise<void> {
  const c = await getClient()
  if (!c) return
  try { await c.del(key) } catch { /* ignore */ }
}

export async function cacheFlush(): Promise<void> {
  const c = await getClient()
  if (!c) return
  try { await c.flushAll() } catch { /* ignore */ }
}
