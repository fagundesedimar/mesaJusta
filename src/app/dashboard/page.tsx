'use client'

import { useState, useEffect } from 'react'
import ConfirmDeliveryModal from '@/components/donations/ConfirmDeliveryModal'

interface Donation {
  id: string
  name: string
  status: string
  category: string
  weightKg: number
  expiresAt: string
  token?: string
}

export default function DonorDashboard() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [confirmDonationId, setConfirmDonationId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/v1/donations')
      .then((res) => res.ok ? res.json() : [])
      .then((data) => setDonations(Array.isArray(data) ? data : (data.donations ?? [])))
      .catch(() => {})
  }, [])

  function handleConfirmSuccess() {
    setDonations((prev) =>
      prev.map((d) =>
        d.id === confirmDonationId ? { ...d, status: 'COLLECTED' } : d
      )
    )
    setConfirmDonationId(null)
  }

  const STATUS_LABEL: Record<string, string> = {
    AVAILABLE: 'Disponível',
    RESERVED: 'Reservada',
    COLLECTED: 'Retirada',
    EXPIRED: 'Expirada',
  }

  const STATUS_COLOR: Record<string, string> = {
    AVAILABLE: '#28a745',
    RESERVED: '#ffc107',
    COLLECTED: '#0070f3',
    EXPIRED: '#dc3545',
  }

  return (
    <div className="dashboard-container">
      <h1>Minhas Doações</h1>

      <table className="donations-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Categoria</th>
            <th>Peso (kg)</th>
            <th>Validade</th>
            <th>Status</th>
            <th>Ação</th>
          </tr>
        </thead>
        <tbody>
          {donations.map((donation) => (
            <tr key={donation.id}>
              <td>{donation.name}</td>
              <td>{donation.category}</td>
              <td>{Number(donation.weightKg).toFixed(1)}</td>
              <td>{new Date(donation.expiresAt).toLocaleDateString('pt-BR')}</td>
              <td>
                <span
                  className="status-badge"
                  style={{ backgroundColor: STATUS_COLOR[donation.status] || '#888' }}
                >
                  {STATUS_LABEL[donation.status] || donation.status}
                </span>
              </td>
              <td>
                {donation.status === 'RESERVED' && (
                  <button
                    className="btn-confirm"
                    onClick={() => setConfirmDonationId(donation.id)}
                  >
                    Confirmar Entrega
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {confirmDonationId && (
        <ConfirmDeliveryModal
          donationId={confirmDonationId}
          onClose={() => setConfirmDonationId(null)}
          onSuccess={handleConfirmSuccess}
        />
      )}
    </div>
  )
}
