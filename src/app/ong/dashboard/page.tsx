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
  const [selectedRadius, setSelectedRadius] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

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

  const handleReserve = useCallback((donationId: string) => {
    window.location.href = `/donations/${donationId}/reserve`
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
