// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, fireEvent, cleanup } from '@testing-library/react'
import React from 'react'
import DonationMap from '@/components/ong/DonationMap'

const state = vi.hoisted(() => {
  return {
    mapCalls: [] as Array<{ el: any; opts: any }>,
    mapInstances: [] as Array<{ remove: ReturnType<typeof vi.fn> }>,
    tileLayerCalls: [] as Array<{ url: string; opts: any }>,
    markers: [] as Array<{
      center: [number, number]
      opts: any
      handlers: Record<string, (...args: any[]) => void>
      bindPopup: ReturnType<typeof vi.fn>
    }>,
  }
})

vi.mock('leaflet', () => {
  return {
    default: {
      map: vi.fn((el: any, opts: any) => {
        state.mapCalls.push({ el, opts })
        const instance = { remove: vi.fn(), setView: vi.fn(), on: vi.fn(), off: vi.fn() }
        state.mapInstances.push(instance)
        return instance
      }),
      tileLayer: vi.fn((url: string, opts: any) => {
        state.tileLayerCalls.push({ url, opts })
        return { addTo: vi.fn() }
      }),
      marker: vi.fn((center: [number, number], opts: any) => {
        const handlers: Record<string, (...args: any[]) => void> = {}
        const marker = {
          center,
          opts,
          handlers,
          bindPopup: vi.fn(() => marker),
          addTo: vi.fn(() => marker),
          on: vi.fn((evt: string, cb: (...args: any[]) => void) => {
            handlers[evt] = cb
            return marker
          }),
          remove: vi.fn(),
        }
        state.markers.push(marker)
        return marker
      }),
      divIcon: vi.fn(() => ({})),
    },
  }
})

beforeEach(() => {
  state.mapCalls.length = 0
  state.mapInstances.length = 0
  state.tileLayerCalls.length = 0
  state.markers.length = 0
})

afterEach(() => {
  cleanup()
})

describe('DonationMap', () => {
  it('inicializa o mapa centralizado na sede da ONG com zoom padrão 13 e tiles OSM', () => {
    render(
      React.createElement(DonationMap, {
        centerLat: -23.55,
        centerLng: -46.63,
        donations: [],
        onReserve: vi.fn(),
      })
    )

    expect(state.mapCalls).toHaveLength(1)
    const { el, opts } = state.mapCalls[0]
    expect(el.className).toBe('geo-map__container')
    expect(opts.center).toEqual([-23.55, -46.63])
    expect(opts.zoom).toBe(13)
    expect(opts.zoomControl).toBe(true)

    expect(state.tileLayerCalls).toHaveLength(1)
    expect(state.tileLayerCalls[0].url).toContain('tile.openstreetmap.org')

    // Pin da sede (1 marcador) e nenhum marcador de doação
    expect(state.markers).toHaveLength(1)
    expect(state.markers[0].center).toEqual([-23.55, -46.63])
  })

  it('cria um marcador por doação com popup detalhado e dispara onReserve ao clicar em Reservar Lote', () => {
    const onReserve = vi.fn()
    render(
      React.createElement(DonationMap, {
        centerLat: -23.55,
        centerLng: -46.63,
        donations: [
          {
            id: 'don-1',
            name: 'Arroz',
            category: 'Grãos',
            weightKg: 5,
            latitude: -23.5,
            longitude: -46.6,
            distanceKm: 3.25,
          },
          {
            id: 'don-2',
            name: 'Feijão',
            category: 'Leguminosas',
            weightKg: 2,
            latitude: -23.51,
            longitude: -46.61,
            distanceKm: undefined,
          },
        ],
        onReserve,
      })
    )

    // Sede + 2 doações = 3 marcadores
    expect(state.markers).toHaveLength(3)

    const donationMarker = state.markers.find(
      (m) => m.center[0] === -23.5 && m.center[1] === -46.6
    )
    expect(donationMarker).toBeDefined()

    const popup = donationMarker!.bindPopup.mock.calls[0][0] as string
    expect(popup).toContain('Arroz')
    expect(popup).toContain('Categoria: Grãos')
    expect(popup).toContain('Peso: 5 kg')
    expect(popup).toContain('Distância: 3.3 km')
    expect(popup).toContain('data-id="don-1"')

    // Popup de doação sem distância não exibe a linha "Distância"
    const noDistanceMarker = state.markers.find(
      (m) => m.center[0] === -23.51 && m.center[1] === -46.61
    )
    const noDistancePopup = noDistanceMarker!.bindPopup.mock.calls[0][0] as string
    expect(noDistancePopup).not.toContain('Distância:')

    // Simula a abertura do popup (Leaflet emite 'popupopen') e o clique no botão real
    const popupBtn = document.createElement('button')
    popupBtn.className = 'map-popup__btn'
    popupBtn.dataset.id = 'don-1'
    document.body.appendChild(popupBtn)

    donationMarker!.handlers['popupopen']!()
    fireEvent.click(popupBtn)
    popupBtn.remove()

    expect(onReserve).toHaveBeenCalledTimes(1)
    expect(onReserve).toHaveBeenCalledWith('don-1')
  })

  it('remove o mapa e os marcadores ao desmontar o componente', () => {
    const { unmount } = render(
      React.createElement(DonationMap, {
        centerLat: -23.55,
        centerLng: -46.63,
        donations: [
          {
            id: 'don-1',
            name: 'Arroz',
            category: 'Grãos',
            weightKg: 5,
            latitude: -23.5,
            longitude: -46.6,
          },
        ],
        onReserve: vi.fn(),
      })
    )

    expect(state.mapInstances).toHaveLength(1)

    unmount()

    expect(state.mapInstances[0].remove).toHaveBeenCalledTimes(1)
    // Marcadores de doação são removidos no cleanup do efeito de doações
    const donationMarkers = state.markers.filter((m) => m.center[0] !== -23.55)
    donationMarkers.forEach((m) => {
      expect(m.remove).toHaveBeenCalled()
    })
  })

  it('escapa o conteúdo do doador no popup para evitar XSS', () => {
    render(
      React.createElement(DonationMap, {
        centerLat: -23.55,
        centerLng: -46.63,
        donations: [
          {
            id: '<img onerror=alert(1)>',
            name: '<script>alert("x")</script>',
            category: '<b>Roupa</b>',
            weightKg: 1,
            latitude: -23.5,
            longitude: -46.6,
          },
        ],
        onReserve: vi.fn(),
      })
    )

    const donationMarker = state.markers.find((m) => m.center[0] === -23.5)
    const popup = donationMarker!.bindPopup.mock.calls[0][0] as string

    expect(popup).not.toContain('<script>')
    expect(popup).toContain('&lt;script&gt;')
    expect(popup).not.toContain('<b>Roupa</b>')
    expect(popup).toContain('&lt;b&gt;Roupa&lt;/b&gt;')
    expect(popup).not.toContain('<img onerror')
    expect(popup).toContain('data-id="&lt;img onerror=alert(1)&gt;"')
  })
})