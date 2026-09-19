import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import VendorCenter from '../../src/pages/VendorCenter'

function openThalesVendor() {
  fireEvent.click(screen.getByRole('button', { name: /thales/i }))
}

describe('VendorCenter Next-Gen IAM Thales product tabs', () => {
  it('lists Luna HSM and AI Security Fabric as Thales product tabs', () => {
    renderWithProviders(<VendorCenter />)
    openThalesVendor()
    expect(screen.getByRole('button', { name: /luna hsm/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ai security fabric/i })).toBeInTheDocument()
  })

  it('shows the Luna HSM product profile with its Next-Gen IAM capability and source link', () => {
    renderWithProviders(<VendorCenter />)
    openThalesVendor()
    fireEvent.click(screen.getByRole('button', { name: /luna hsm/i }))
    expect(screen.getByText('Thales Luna Network HSM')).toBeInTheDocument()
    expect(screen.getByText('crypto-agility')).toBeInTheDocument()
    expect(screen.getByText(/source \(verified/i)).toBeInTheDocument()
  })

  it('shows the AI Security Fabric product profile with its Next-Gen IAM capability', () => {
    renderWithProviders(<VendorCenter />)
    openThalesVendor()
    fireEvent.click(screen.getByRole('button', { name: /ai security fabric/i }))
    expect(screen.getByText('Thales AI Security Fabric')).toBeInTheDocument()
    expect(screen.getByText('ai-security-fabric')).toBeInTheDocument()
  })

  it('shows the phishing-resistant-auth capability on the existing SafeNet STA tab', () => {
    renderWithProviders(<VendorCenter />)
    openThalesVendor()
    fireEvent.click(screen.getByRole('button', { name: /safenet sta/i }))
    expect(screen.getByText('phishing-resistant-auth')).toBeInTheDocument()
  })

  it('shows the digital-wallets capability on the existing IdCloud tab', () => {
    renderWithProviders(<VendorCenter />)
    openThalesVendor()
    fireEvent.click(screen.getByRole('button', { name: /idcloud/i }))
    expect(screen.getByText('digital-wallets')).toBeInTheDocument()
  })
})
