const CACHE_PREFIX = 'mesajusta_cache_'
const CACHE_TTL = 5 * 60 * 1000

interface CacheEntry<T> {
  data: T
  timestamp: number
}

function isClient(): boolean {
  return typeof window !== 'undefined'
}

export function getCached<T>(key: string): T | null {
  if (!isClient()) return null
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key)
    if (!raw) return null
    const entry: CacheEntry<T> = JSON.parse(raw)
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_PREFIX + key)
      return null
    }
    return entry.data
  } catch {
    return null
  }
}

export function setCache<T>(key: string, data: T): void {
  if (!isClient()) return
  try {
    const entry: CacheEntry<T> = { data, timestamp: Date.now() }
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry))
  } catch {
    /* storage full — ignore */
  }
}

export function clearCache(): void {
  if (!isClient()) return
  const keys: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k?.startsWith(CACHE_PREFIX)) keys.push(k)
  }
  keys.forEach((k) => localStorage.removeItem(k))
}
