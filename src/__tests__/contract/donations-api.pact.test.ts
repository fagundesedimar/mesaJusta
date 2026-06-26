import { PactV3, MatchersV3 } from '@pact-foundation/pact'
import { describe, it, expect } from 'vitest'

const { eachLike, like, string, number } = MatchersV3

const provider = new PactV3({
  consumer: 'MesaJustaWeb',
  provider: 'MesaJustaApi',
  dir: './pact/pacts',
})

describe('Donations API contract', () => {
  it('returns a list of available donations', async () => {
    provider
      .given('existing donations')
      .uponReceiving('a request for available donations')
      .withRequest({
        method: 'GET',
        path: '/api/v1/donations',
        query: { lat: '-23.5', lng: '-46.6', radius: '15' },
        headers: { Accept: 'application/json' },
      })
      .willRespondWith({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: {
          donations: eachLike({
            id: string('uuid-123'),
            name: string('Arroz'),
            category: string('Mercearia'),
            weightKg: number(10),
            latitude: number(-23.5),
            longitude: number(-46.6),
            distanceKm: number(3.2),
          }),
        },
      })

    await provider.executeTest(async (mockServer) => {
      const res = await fetch(`${mockServer.url}/api/v1/donations?lat=-23.5&lng=-46.6&radius=15`, {
        headers: { Accept: 'application/json' },
      })
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body.donations).toBeDefined()
      expect(Array.isArray(body.donations)).toBe(true)
    })
  })

  it('rejects unauthenticated requests', async () => {
    provider
      .given('no auth token')
      .uponReceiving('a request without authentication')
      .withRequest({
        method: 'GET',
        path: '/api/v1/donations',
        headers: { Accept: 'application/json' },
      })
      .willRespondWith({
        status: 401,
        headers: { 'Content-Type': 'application/json' },
        body: { error: string('Não autorizado.') },
      })

    await provider.executeTest(async (mockServer) => {
      const res = await fetch(`${mockServer.url}/api/v1/donations`, {
        headers: { Accept: 'application/json' },
      })
      expect(res.status).toBe(401)
    })
  })
})
