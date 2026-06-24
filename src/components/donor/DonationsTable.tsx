import { useState } from 'react'
import NewDonationModal from '@/components/donations/NewDonationModal'

interface Donation {
  id: string
  name: string
  status: string
  category: string
  weightKg: number
  expiresAt: string
}

interface Props {
  donations: Donation[]
  onRefresh: () => void
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

export default function DonationsTable({ donations, onRefresh }: Props) {
  const [showModal, setShowModal] = useState(false)

  return (
    <div>
      <div className="table-header">
        <h2>Meus Lotes</h2>
        <button className="btn-new" onClick={() => setShowModal(true)}>
          + Nova Doação
        </button>
      </div>

      <table className="donations-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Categoria</th>
            <th>Peso (kg)</th>
            <th>Validade</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {donations.map((d) => (
            <tr key={d.id}>
              <td>{d.name}</td>
              <td>{d.category}</td>
              <td>{Number(d.weightKg).toFixed(1)}</td>
              <td>{new Date(d.expiresAt).toLocaleDateString('pt-BR')}</td>
              <td>
                <span
                  className="status-badge"
                  style={{ backgroundColor: STATUS_COLOR[d.status] || '#888' }}
                >
                  {STATUS_LABEL[d.status] || d.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <NewDonationModal
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); onRefresh() }}
        />
      )}
    </div>
  )
}
