import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import LegacyFederationLab from '../../src/pages/Playgrounds/LegacyFederationLab'

describe('LegacyFederationLab page', () => {
  it('renders the heading and the RADIUS tab by default', () => {
    renderWithProviders(<LegacyFederationLab />)
    expect(screen.getByRole('heading', { name: /legacy & academic federation playground/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/shared secret/i)).toBeInTheDocument()
  })

  it('a wrong RADIUS shared secret produces an Access-Reject', () => {
    renderWithProviders(<LegacyFederationLab />)
    fireEvent.change(screen.getByLabelText(/shared secret/i), { target: { value: 'wrong-secret' } })
    fireEvent.click(screen.getByRole('button', { name: /send access-request/i }))
    expect(screen.getAllByText(/access-reject/i).length).toBeGreaterThan(0)
  })

  it('the correct RADIUS shared secret produces an Access-Accept', () => {
    renderWithProviders(<LegacyFederationLab />)
    fireEvent.change(screen.getByLabelText(/shared secret/i), { target: { value: 'RadiusSecret2026' } })
    fireEvent.click(screen.getByRole('button', { name: /send access-request/i }))
    expect(screen.getAllByText(/access-accept/i).length).toBeGreaterThan(0)
  })

  it('the TACACS+ tab separately logs authentication, authorization, and accounting for a command', () => {
    renderWithProviders(<LegacyFederationLab />)
    fireEvent.click(screen.getByRole('button', { name: /tacacs\+/i }))
    fireEvent.click(screen.getByRole('button', { name: 'configure terminal' }))
    expect(screen.getByText(/authentication phase/i)).toBeInTheDocument()
    expect(screen.getByText(/authorization phase.*denied/i)).toBeInTheDocument()
    expect(screen.getByText(/accounting phase/i)).toBeInTheDocument()
  })

  it('the WAYF tab produces a SAML assertion consumable by the mock SP for a selected institution', () => {
    renderWithProviders(<LegacyFederationLab />)
    fireEvent.click(screen.getByRole('button', { name: /shibboleth \/ edugain/i }))
    fireEvent.change(screen.getByLabelText(/home institution/i), { target: { value: 'tu-berlin' } })
    expect(screen.getByText(/saml assertion consumed by sp/i)).toBeInTheDocument()
    expect(screen.getByText(/issuer: https:\/\/idp\.tu-berlin\.example/i)).toBeInTheDocument()
  })
})
