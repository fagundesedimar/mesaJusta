'use client'

import { useState, useEffect, useCallback } from 'react'
import ReservationCard from '@/components/ong/ReservationCard'
import '@/components/ong/Reservations.css'

interface DonorInfo {
  email: string
  profile: {
    name: string
    zipCode: string
    state: string
  } | null
}

interface Reservation {
  id: string
  name: string
  category: string
  weightKg: number
  reservationToken: string
  reservedAt: string
  expiresAt: string
  donor: DonorInfo | null
}

export default function OngReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReservations = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/v1/reservations')
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Erro ao carregar reservas.')
        return
      }
      const data = await res.json()
      setReservations(data.reservations ?? [])
    } catch {
      setError('Erro de conexão ao carregar reservas.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReservations()
  }, [fetchReservations])

  const handleCancel = useCallback((donationId: string) => {
    setReservations((prev) => prev.filter((r) => r.id !== donationId))
  }, [])

  const handleError = useCallback((message: string) => {
    setError(message)
  }, [])

  return (
    <div className="reservations-page">
      <h1 className="reservations-page__title">Minhas Reservas</h1>
      <p className="reservations-page__subtitle">
        Gerencie suas reservas ativas de lotes de doação.
      </p>

      {error && (
        <div className="reservations-page__error">{error}</div>
      )}

      {loading ? (
        <div className="reservations-page__empty">Carregando...</div>
      ) : reservations.length === 0 ? (
        <div className="reservations-page__empty">
          Nenhuma reserva ativa no momento.
          <br />
          Explore o mapa para encontrar lotes disponíveis.
        </div>
      ) : (
        reservations.map((r) => (
          <ReservationCard
            key={r.id}
            donationId={r.id}
            name={r.name}
            category={r.category}
            weightKg={r.weightKg}
            reservationToken={r.reservationToken}
            reservedAt={r.reservedAt}
            expiresAt={r.expiresAt}
            donor={r.donor}
            onCancel={handleCancel}
            onError={handleError}
          />
        ))
      )}
    </div>
  )
}
