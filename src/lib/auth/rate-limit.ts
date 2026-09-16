const WINDOW_MS = 15 * 60 * 1000
export const EMAIL_MAX_ATTEMPTS = 10
export const IP_MAX_ATTEMPTS = 30

const redisPrefix = 'mesajusta:rl'

interface RedisLike {
  on(event: string, listener: (...args: unknown[]) => void): unknown
  connect(): Promise<unknown>
  quit(): Promise<unknown>
  incr(key: string): Promise<number>
  get(key: string): Promise<string | number | null>
  expire(key: string, seconds: number): Promise<unknown>
  ttl(key: string): Promise<number>
  del(key: string): Promise<unknown>
}

interface SinkState {
  count: number
  retryAfterSeconds: number
}

type MemoryBucket = { count: number; resetAt: number }

const memoryBuckets = new Map<string, MemoryBucket>()
let redisClientPromise: Promise<RedisLike | null> | null = null

function keyFor(prefix: string, value: string): string {
  return `rl:${prefix}:${value.trim().toLowerCase()}`
}

function memorySink(key: string, windowMs: number, shouldIncrement: boolean): SinkState {
  const now = Date.now()
  const existing = memoryBuckets.get(key)
  if (existing && existing.resetAt > now) {
    if (shouldIncrement) existing.count += 1
    return {
      count: existing.count,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    }
  }

  const bucket: MemoryBucket = { count: shouldIncrement ? 1 : 0, resetAt: now + windowMs }
  memoryBuckets.set(key, bucket)

  if (memoryBuckets.size > 5000) {
    for (const [candidateKey, candidate] of memoryBuckets) {
      if (candidate.resetAt <= now) memoryBuckets.delete(candidateKey)
    }
  }

  return {
    count: bucket.count,
    retryAfterSeconds: Math.ceil(windowMs / 1000),
  }
}

async function getRedis(): Promise<RedisLike | null> {
  const url = process.env.REDIS_URL
  if (!url) return null

  if (!redisClientPromise) {
    redisClientPromise = (async () => {
      const { createClient } = await import('redis')
      const client = createClient({ url }) as RedisLike
      client.on('error', () => undefined)
      try {
        await client.connect()
        return client
      } catch {
        await client.quit().catch(() => undefined)
        return null
      }
    })()
  }

  return redisClientPromise
}

async function redisSink(
  redis: RedisLike,
  fullKey: string,
  windowMs: number,
  shouldIncrement: boolean
): Promise<SinkState> {
  const count = shouldIncrement
    ? await redis.incr(fullKey)
    : Number((await redis.get(fullKey)) ?? 0)

  const windowSeconds = Math.max(1, Math.ceil(windowMs / 1000))
  if (shouldIncrement && count === 1) {
    await redis.expire(fullKey, windowSeconds)
  }
  const ttl = await redis.ttl(fullKey)

  return {
    count,
    retryAfterSeconds: ttl > 0 ? ttl : windowSeconds,
  }
}

async function sink(
  prefix: string,
  value: string,
  windowMs: number,
  shouldIncrement: boolean
): Promise<SinkState> {
  const redis = await getRedis()
  if (redis) {
    return redisSink(redis, `${redisPrefix}:${keyFor(prefix, value)}`, windowMs, shouldIncrement)
  }
  return memorySink(keyFor(prefix, value), windowMs, shouldIncrement)
}

export interface LoginRateLimitState {
  allowed: boolean
  retryAfterSeconds: number
}

export async function assertLoginNotBlocked(
  email: string,
  ip: string
): Promise<LoginRateLimitState> {
  const [emailState, ipState] = await Promise.all([
    sink('email', email, WINDOW_MS, false),
    sink('ip', ip, WINDOW_MS, false),
  ])

  const allowed = emailState.count < EMAIL_MAX_ATTEMPTS && ipState.count < IP_MAX_ATTEMPTS
  return {
    allowed,
    retryAfterSeconds: Math.max(emailState.retryAfterSeconds, ipState.retryAfterSeconds),
  }
}

export async function recordLoginFailure(email: string, ip: string): Promise<void> {
  await Promise.all([
    sink('email', email, WINDOW_MS, true),
    sink('ip', ip, WINDOW_MS, true),
  ])
}

export async function clearLoginFailures(email: string): Promise<void> {
  const redis = await getRedis()
  const key = keyFor('email', email)
  if (redis) {
    await redis.del(`${redisPrefix}:${key}`)
    return
  }
  memoryBuckets.delete(key)
}