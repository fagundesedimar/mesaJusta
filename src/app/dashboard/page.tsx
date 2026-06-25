'use client'

import { useState, useEffect } from 'react'
import ConfirmDeliveryModal from '@/components/donations/ConfirmDeliveryModal'

interface Donation {
  id: string
  status: string
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

  const statusLabel: Record<string, string> = {
    AVAILABLE: 'Disponível',
    RESERVED: 'Reservada',
    COLLECTED: 'Retirada',
    EXPIRED: 'Expirada',
  }

  return (
    <div className="dashboard-container">
      <h1>Minhas Doações</h1>

      <table className="donations-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Status</th>
            <th>Ação</th>
          </tr>
        </thead>
        <tbody>
          {donations.map((donation) => (
            <tr key={donation.id}>
              <td>{donation.id.slice(0, 8)}...</td>
              <td>{statusLabel[donation.status] || donation.status}</td>
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
