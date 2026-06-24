'use client'

import { useState, useCallback } from 'react'
import ReservationCountdown from './ReservationCountdown'

interface Props {
  donationId: string
  name: string
  category: string
  weightKg: number
  reservationToken: string
  reservedAt: string
  expiresAt: string
  onCancel: (donationId: string) => void
  onError: (message: string) => void
}

export default function ReservationCard({
  donationId,
  name,
  category,
  weightKg,
  reservationToken,
  reservedAt,
  expiresAt,
  onCancel,
  onError,
}: Props) {
  const [cancelling, setCancelling] = useState(false)

  const handleCancel = useCallback(async () => {
    setCancelling(true)
    try {
      const res = await fetch('/api/v1/reservations/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donationId }),
      })

      if (!res.ok) {
        const data = await res.json()
        onError(data.error ?? 'Erro ao cancelar reserva.')
        setCancelling(false)
        return
      }

      onCancel(donationId)
    } catch {
      onError('Erro de conexão ao cancelar reserva.')
      setCancelling(false)
    }
  }, [donationId, onCancel, onError])

  return (
    <div className="reservation-card">
      <div className="reservation-card__header">
        <strong className="reservation-card__name">{name}</strong>
        <span className="reservation-card__status">Ativa</span>
      </div>

      <div className="reservation-card__info">
        <span>{category} &middot; {weightKg} kg</span>
      </div>

      <div className="reservation-card__token">
        <span className="reservation-card__token-label">Token de Retirada:</span>
        <code className="reservation-card__token-code">{reservationToken}</code>
      </div>

      <div className="reservation-card__time">
        Reservado em: {new Date(reservedAt).toLocaleString('pt-BR')}
      </div>

      <ReservationCountdown expiresAt={expiresAt} />

      <button
        className="reservation-card__cancel"
        onClick={handleCancel}
        disabled={cancelling}
      >
        {cancelling ? 'Cancelando...' : 'Cancelar Reserva'}
      </button>
    </div>
  )
}
