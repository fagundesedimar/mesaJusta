'use client'

import { useState, useEffect, useCallback } from 'react'
import DonorMetricsCards from '@/components/donor/DonorMetricsCards'
import DonationsTable from '@/components/donor/DonationsTable'
import GreenCoinsCard from '@/components/donor/GreenCoinsCard'
import ESGRankingTable from '@/components/donor/ESGRankingTable'
import '@/components/donor/DonorDashboard.css'
import '@/components/donor/Gamification.css'

export default function DonorDashboardPage() {
  const [donations, setDonations] = useState([])
  const [greenCoins, setGreenCoins] = useState(0)
  const [ranking, setRanking] = useState([])
  const [donorName, setDonorName] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchDonations = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/donations')
      if (res.ok) {
        const data = await res.json()
        setDonations(data.donations ?? data)
        setGreenCoins(data.greenCoins ?? 0)
        setDonorName(data.establishmentName ?? '')
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

  useEffect(() => {
    fetch('/api/v1/gamification/ranking')
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data) setRanking(data.data ?? [])
      })
      .catch(() => {})
  }, [])

  return (
    <div className="dashboard-container">
      <h1>Dashboard do Doador</h1>
      <GreenCoinsCard greenCoins={greenCoins} />
      <DonorMetricsCards donations={donations} />
      {loading ? (
        <p>Carregando...</p>
      ) : (
        <DonationsTable donations={donations} onRefresh={fetchDonations} />
      )}
      <ESGRankingTable data={ranking} currentDonorName={donorName} />
    </div>
  )
}
