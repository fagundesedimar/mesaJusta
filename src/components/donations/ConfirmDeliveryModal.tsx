'use client'

import { useState, type FormEvent } from 'react'
import './ConfirmDeliveryModal.css'

interface Props {
  donationId: string
  onClose: () => void
  onSuccess: () => void
}

export default function ConfirmDeliveryModal({ donationId, onClose, onSuccess }: Props) {
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function validateToken(value: string): string | null {
    if (value.length < 6) return 'O token deve ter exatamente 6 caracteres.'
    return null
  }

  function handleTokenChange(value: string) {
    const cleaned = value.replace(/\s/g, '')
    setToken(cleaned)
    if (error) setError('')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const validationError = validateToken(token)
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/v1/reservations/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donationId, token }),
      })

      if (res.ok) {
        onSuccess()
      } else {
        const data = await res.json()
        setError(typeof data.error === 'string' ? data.error : 'Erro ao confirmar entrega.')
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
        <h2 className="modal-title">Confirmar Entrega</h2>
        <p className="modal-description">
          Insira o token de 6 caracteres fornecido pela ONG no momento da retirada.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="modal-field">
            <label htmlFor="confirm-token">Token de Retirada</label>
            <input
              id="confirm-token"
              type="text"
              value={token}
              onChange={(e) => handleTokenChange(e.target.value)}
              maxLength={6}
              placeholder="Ex: A94D3F"
              autoFocus
            />
          </div>

          {error && <div className="modal-error">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="modal-btn modal-btn--cancel" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="modal-btn modal-btn--confirm" disabled={loading}>
              {loading ? 'Confirmando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
