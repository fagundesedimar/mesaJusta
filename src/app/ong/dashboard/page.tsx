'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import DonationListSidebar from '@/components/ong/DonationListSidebar'
import '@/components/ong/GeoMap.css'

const DonationMap = dynamic(
  () => import('@/components/ong/DonationMap'),
  { ssr: false }
)

interface Donation {
  id: string
  name: string
  category: string
  weightKg: number
  latitude: number
  longitude: number
  distanceKm?: number
}

export default function OngDashboardPage() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [ongLat, setOngLat] = useState<number>(-23.5505)
  const [ongLng, setOngLng] = useState<number>(-46.6333)
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedRadius, setSelectedRadius] = useState<number | null>(15)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/v1/auth/me')
        if (res.ok) {
          const data = await res.json()
          if (data.user?.latitude != null && data.user?.longitude != null) {
            setOngLat(data.user.latitude)
            setOngLng(data.user.longitude)
          }
        }
      } catch {
        // keep fallback coordinates
      }
    })()
  }, [])

  const fetchDonations = useCallback(async () => {
    setLoading(true)
    try {
      let url = '/api/v1/donations'

      if (selectedRadius != null) {
        url += `?lat=${ongLat}&lng=${ongLng}&radius=${selectedRadius}`
      }

      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setDonations(data.donations ?? [])
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [ongLat, ongLng, selectedRadius])

  useEffect(() => {
    fetchDonations()
  }, [fetchDonations])

  const filteredDonations = selectedCategory
    ? donations.filter((d) => d.category === selectedCategory)
    : donations

  const handleReserve = useCallback(async (donationId: string) => {
    try {
      const res = await fetch('/api/v1/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donationId }),
      })
      if (res.ok) {
        window.location.href = '/ong/reservations'
      } else {
        const data = await res.json()
        alert(data.error ?? 'Erro ao reservar lote.')
      }
    } catch {
      alert('Erro de conexão ao reservar lote.')
    }
  }, [])

  return (
    <div className="geo-dashboard">
      <DonationListSidebar
        donations={filteredDonations}
        selectedCategory={selectedCategory}
        selectedRadius={selectedRadius}
        onCategoryChange={setSelectedCategory}
        onRadiusChange={setSelectedRadius}
        onReserve={handleReserve}
      />
      <div className="geo-map__wrapper">
        <DonationMap
          centerLat={ongLat}
          centerLng={ongLng}
          donations={filteredDonations}
          onReserve={handleReserve}
        />
      </div>
    </div>
  )
}
