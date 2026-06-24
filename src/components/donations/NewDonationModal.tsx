'use client'

import { useState, type FormEvent } from 'react'
import { CATEGORIES } from '@/lib/schemas/donation.schema'
import './NewDonationModal.css'

interface Props {
  onClose: () => void
  onSuccess: () => void
}

function todayStr(): string {
  const d = new Date()
  return d.toISOString().split('T')[0]
}

function isToday(dateStr: string): boolean {
  return dateStr === todayStr()
}

export default function NewDonationModal({ onClose, onSuccess }: Props) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const showExpiryAlert = expiresAt.length > 0 && isToday(expiresAt)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/v1/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          category,
          weightKg: parseFloat(weightKg),
          expiresAt,
          notes: notes || undefined,
        }),
      })

      if (res.ok) {
        onSuccess()
      } else {
        const data = await res.json()
        const msg = typeof data.error === 'string'
          ? data.error
          : JSON.stringify(data.error)
        setError(msg)
      }
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Nova Doação</h2>

        {showExpiryAlert && (
          <div className="alert-orange">
            Atenção: Este lote expira hoje. A retirada deve ser imediata!
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="modal-field">
            <label htmlFor="donation-name">Nome do Alimento</label>
            <input
              id="donation-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="modal-field">
            <label htmlFor="donation-category">Categoria</label>
            <select
              id="donation-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Selecione...</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="modal-field">
            <label htmlFor="donation-weight">Peso (kg)</label>
            <input
              id="donation-weight"
              type="number"
              step="0.1"
              min="0.1"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              required
            />
          </div>

          <div className="modal-field">
            <label htmlFor="donation-expires">Data de Validade</label>
            <input
              id="donation-expires"
              type="date"
              min={todayStr()}
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              required
            />
          </div>

          <div className="modal-field">
            <label htmlFor="donation-notes">Observações</label>
            <textarea
              id="donation-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {error && <div className="modal-error">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="modal-btn modal-btn--cancel" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="modal-btn modal-btn--confirm" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
