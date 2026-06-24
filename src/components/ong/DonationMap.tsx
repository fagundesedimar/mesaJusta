'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface Donation {
  id: string
  name: string
  category: string
  weightKg: number
  latitude: number
  longitude: number
  distanceKm?: number
}

interface Props {
  centerLat: number
  centerLng: number
  donations: Donation[]
  onReserve: (donationId: string) => void
}

const DEFAULT_ZOOM = 13

const ongIcon = L.divIcon({
  className: 'map-pin map-pin--ong',
  html: '<div class="map-pin__circle map-pin__circle--ong"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
})

const donationIcon = L.divIcon({
  className: 'map-pin map-pin--donation',
  html: '<div class="map-pin__circle map-pin__circle--donation"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
})

export default function DonationMap({ centerLat, centerLng, donations, onReserve }: Props) {
  const mapRef = useRef<L.Map | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return

    const map = L.map(containerRef.current, {
      center: [centerLat, centerLng],
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    L.marker([centerLat, centerLng], { icon: ongIcon })
      .addTo(map)
      .bindPopup('Minha Sede')

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [centerLat, centerLng])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const markers = donations
      .filter((d) => d.latitude != null && d.longitude != null)
      .map((d) => {
        const popupContent = `
          <div class="map-popup">
            <strong>${d.name}</strong><br/>
            Categoria: ${d.category}<br/>
            Peso: ${d.weightKg} kg<br/>
            ${d.distanceKm != null ? `Distância: ${d.distanceKm.toFixed(1)} km<br/>` : ''}
            <button class="map-popup__btn" data-id="${d.id}">Reservar Lote</button>
          </div>
        `

        const marker = L.marker([d.latitude, d.longitude], { icon: donationIcon })
          .addTo(map)
          .bindPopup(popupContent)

        marker.on('popupopen', () => {
          const btn = document.querySelector(`.map-popup__btn[data-id="${d.id}"]`)
          btn?.addEventListener('click', () => onReserve(d.id))
        })

        return marker
      })

    return () => {
      markers.forEach((m) => m.remove())
    }
  }, [donations, onReserve])

  return <div ref={containerRef} className="geo-map__container" />
}
