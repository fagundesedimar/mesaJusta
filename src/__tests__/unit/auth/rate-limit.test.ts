import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  assertLoginNotBlocked,
  recordLoginFailure,
  clearLoginFailures,
  EMAIL_MAX_ATTEMPTS,
  IP_MAX_ATTEMPTS,
} from '@/lib/auth/rate-limit'

const WINDOW_MS = 15 * 60 * 1000

beforeEach(() => {
  vi.stubEnv('REDIS_URL', '')
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllEnvs()
})

describe('rate-limite de login (store em memória)', () => {
  it('permite tentativas abaixo do limite', async () => {
    await recordLoginFailure('usu1@test.com', '1.1.1.1')

    const result = await assertLoginNotBlocked('usu1@test.com', '1.1.1.1')

    expect(result.allowed).toBe(true)
  })

  it('bloqueia após exceder o limite de tentativas por e-mail', async () => {
    for (let i = 0; i < EMAIL_MAX_ATTEMPTS; i += 1) {
      await recordLoginFailure('usu2@test.com', '2.2.2.2')
    }

    const result = await assertLoginNotBlocked('usu2@test.com', '2.2.2.2')

    expect(result.allowed).toBe(false)
    expect(result.retryAfterSeconds).toBeGreaterThan(0)
  })

  it('libera novamente após o fim da janela de 15 minutos', async () => {
    for (let i = 0; i < EMAIL_MAX_ATTEMPTS; i += 1) {
      await recordLoginFailure('usu3@test.com', '3.3.3.3')
    }

    const blocked = await assertLoginNotBlocked('usu3@test.com', '3.3.3.3')
    expect(blocked.allowed).toBe(false)

    vi.advanceTimersByTime(WINDOW_MS + 1000)
    const released = await assertLoginNotBlocked('usu3@test.com', '3.3.3.3')
    expect(released.allowed).toBe(true)
  })

  it('mantém buckets independentes por IP (mesmo e-mail)', async () => {
    await recordLoginFailure('usu4@test.com', 'ip-a')
    await recordLoginFailure('usu4@test.com', 'ip-b')

    const result = await assertLoginNotBlocked('usu4@test.com', 'ip-b')

    expect(result.allowed).toBe(true)
  })

  it('bloqueia quando o mesmo IP excede o limite em vários e-mails', async () => {
    for (let i = 0; i < IP_MAX_ATTEMPTS; i += 1) {
      await recordLoginFailure(`share${i}@test.com`, 'shared-ip')
    }

    const result = await assertLoginNotBlocked('novo@test.com', 'shared-ip')

    expect(result.allowed).toBe(false)
  })

  it('sucesso no login limpa as falhas registradas daquele e-mail', async () => {
    for (let i = 0; i < EMAIL_MAX_ATTEMPTS; i += 1) {
      await recordLoginFailure('usu5@test.com', '5.5.5.5')
    }

    const before = await assertLoginNotBlocked('usu5@test.com', '5.5.5.5')
    expect(before.allowed).toBe(false)

    await clearLoginFailures('usu5@test.com')

    const after = await assertLoginNotBlocked('usu5@test.com', '5.5.5.5')
    expect(after.allowed).toBe(true)
  })
})