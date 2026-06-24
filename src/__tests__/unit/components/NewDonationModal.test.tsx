// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import React from 'react'
import NewDonationModal from '@/components/donations/NewDonationModal'

afterEach(() => {
  cleanup()
})

describe('NewDonationModal', () => {
  const defaultProps = {
    onClose: vi.fn(),
    onSuccess: vi.fn(),
  }

  it('renders the form with all fields', () => {
    render(React.createElement(NewDonationModal, defaultProps))
    expect(screen.getByLabelText('Nome do Alimento')).toBeDefined()
    expect(screen.getByLabelText('Categoria')).toBeDefined()
    expect(screen.getByLabelText('Peso (kg)')).toBeDefined()
    expect(screen.getByLabelText('Data de Validade')).toBeDefined()
  })

  it('shows orange alert when expiresAt is today', () => {
    render(React.createElement(NewDonationModal, defaultProps))
    const today = new Date().toISOString().split('T')[0]
    const input = screen.getByLabelText('Data de Validade')
    fireEvent.change(input, { target: { value: today } })
    expect(screen.getByText(/Atenção: Este lote expira hoje/)).toBeDefined()
  })

  it('does not show alert for future dates', () => {
    render(React.createElement(NewDonationModal, defaultProps))
    const future = '2030-12-31'
    const input = screen.getByLabelText('Data de Validade')
    fireEvent.change(input, { target: { value: future } })
    expect(screen.queryByText(/Atenção: Este lote expira hoje/)).toBeNull()
  })

  it('has min date attribute set to today', () => {
    const today = new Date().toISOString().split('T')[0]
    render(React.createElement(NewDonationModal, defaultProps))
    const input = screen.getByLabelText('Data de Validade') as HTMLInputElement
    expect(input.min).toBe(today)
  })
})
