import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import CertChainValidator from '../../src/pages/Playgrounds/CertChainValidator'

describe('CertChainValidator page', () => {
  it('renders in classical mode by default with the Harvest Now, Decrypt Later timeline visible', () => {
    renderWithProviders(<CertChainValidator />)
    expect(screen.getByRole('button', { name: 'Classical' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText(/harvest now, decrypt later/i)).toBeInTheDocument()
  })

  it('switching to Hybrid PQC mode updates the signature algorithm display and hides the timeline', () => {
    renderWithProviders(<CertChainValidator />)
    fireEvent.click(screen.getByRole('button', { name: 'Hybrid PQC' }))
    expect(screen.getByRole('button', { name: 'Hybrid PQC' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getAllByText(/ML-DSA-87/).length).toBeGreaterThan(0)
    expect(screen.queryByText(/harvest now, decrypt later/i)).not.toBeInTheDocument()
  })

  it('switching back to classical mode restores the timeline', () => {
    renderWithProviders(<CertChainValidator />)
    fireEvent.click(screen.getByRole('button', { name: 'Hybrid PQC' }))
    fireEvent.click(screen.getByRole('button', { name: 'Classical' }))
    expect(screen.getByText(/harvest now, decrypt later/i)).toBeInTheDocument()
  })
})
