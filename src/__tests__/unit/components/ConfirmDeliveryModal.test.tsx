// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import React from 'react'
import ConfirmDeliveryModal from '@/components/donations/ConfirmDeliveryModal'

afterEach(() => {
  cleanup()
})

describe('ConfirmDeliveryModal', () => {
  const defaultProps = {
    donationId: 'test-id-123',
    onClose: vi.fn(),
    onSuccess: vi.fn(),
  }

  it('renders the modal with token input', () => {
    render(React.createElement(ConfirmDeliveryModal, defaultProps))
    expect(screen.getByText('Confirmar Entrega')).toBeDefined()
    expect(screen.getByLabelText('Token de Retirada')).toBeDefined()
    expect(screen.getByPlaceholderText('Ex: A94D3F')).toBeDefined()
  })

  it('shows error when token has fewer than 6 characters', () => {
    render(React.createElement(ConfirmDeliveryModal, defaultProps))
    const input = screen.getByLabelText('Token de Retirada')
    fireEvent.change(input, { target: { value: 'AB' } })
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }))
    expect(screen.getByText('O token deve ter exatamente 6 caracteres.')).toBeDefined()
  })

  it('calls onClose when cancel button is clicked', () => {
    render(React.createElement(ConfirmDeliveryModal, defaultProps))
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(defaultProps.onClose).toHaveBeenCalled()
  })
})
