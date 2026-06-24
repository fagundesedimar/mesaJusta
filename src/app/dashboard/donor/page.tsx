'use client'

import { useState, useEffect, useCallback } from 'react'
import DonorMetricsCards from '@/components/donor/DonorMetricsCards'
import DonationsTable from '@/components/donor/DonationsTable'
import '@/components/donor/DonorDashboard.css'

export default function DonorDashboardPage() {
  const [donations, setDonations] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchDonations = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/donations')
      if (res.ok) {
        setDonations(await res.json())
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDonations()
  }, [fetchDonations])

  return (
    <div className="dashboard-container">
      <h1>Dashboard do Doador</h1>
      <DonorMetricsCards donations={donations} />
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <DonationsTable donations={donations} onRefresh={fetchDonations} />
      )}
    </div>
  )
}
