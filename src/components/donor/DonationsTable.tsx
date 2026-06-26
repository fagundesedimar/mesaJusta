'use client'

import { useState } from 'react'
import NewDonationModal from '@/components/donations/NewDonationModal'
import '@/components/donations/NewDonationModal.css'

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
  const [deleteTarget, setDeleteTarget] = useState<Donation | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)

    try {
      const res = await fetch(`/api/v1/donations/${deleteTarget.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setDeleteTarget(null)
        onRefresh()
      } else {
        const data = await res.json()
        alert(data.error || 'Erro ao excluir doação.')
      }
    } catch {
      alert('Erro de conexão. Tente novamente.')
    } finally {
      setDeleting(false)
    }
  }

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
            <th>Ações</th>
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
              <td>
                {d.status === 'AVAILABLE' && (
                  <button
                    className="btn-delete"
                    onClick={() => setDeleteTarget(d)}
                  >
                    Excluir
                  </button>
                )}
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

      {deleteTarget && (
        <div className="modal-overlay" onClick={() => !deleting && setDeleteTarget(null)} role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 id="delete-modal-title" className="modal-title">Excluir Doação</h2>
            <p>Tem certeza que deseja excluir o lote <strong>{deleteTarget.name}</strong>?</p>
            <p className="delete-warning">Esta ação não pode ser desfeita.</p>

            <div className="modal-actions">
              <button
                type="button"
                className="modal-btn modal-btn--cancel"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="modal-btn modal-btn--danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Excluindo...' : 'Confirmar Exclusão'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
