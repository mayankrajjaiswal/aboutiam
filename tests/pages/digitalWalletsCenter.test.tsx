import { describe, it, expect, afterEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { axe } from 'jest-axe'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import DigitalWalletsCenter from '../../src/pages/DigitalWalletsCenter'
import { BUSINESS_WALLET_USE_CASES } from '../../src/data/businessWalletUseCases'

const TAB_LABELS = [
  'Three Roles', 'Business Wallet', 'Lifecycle', 'Regulation', 'Programmes', 'Trust Models', 'Labs',
]

function clickTab(label: string) {
  const buttons = screen.getAllByRole('button', { name: new RegExp(`^${label}$`, 'i') })
  fireEvent.click(buttons[0])
}

describe('DigitalWalletsCenter page', () => {
  afterEach(() => {
    window.history.pushState({}, '', '/')
  })

  it('renders the heading and defaults to the "roles" tab', () => {
    renderWithProviders(<DigitalWalletsCenter />)
    expect(screen.getByRole('heading', { name: /digital wallets & verifiable credentials/i })).toBeInTheDocument()
    expect(screen.getByText(/the credential triangle/i)).toBeInTheDocument()
  })

  it('reads the ?tab= deep-link query param on mount', async () => {
    window.history.pushState({}, '', '/next-gen/digital-wallets?tab=business-wallet')
    renderWithProviders(<DigitalWalletsCenter />)
    expect(await screen.findByText(/organizations as credential holders/i)).toBeInTheDocument()
  })

  it('shows all 3 wallet roles on the roles tab', () => {
    renderWithProviders(<DigitalWalletsCenter />)
    expect(screen.getByText('Verifier / Relying Party')).toBeInTheDocument()
    expect(screen.getByText('Issuer')).toBeInTheDocument()
    expect(screen.getByText(/holder \(incl\. organizational wallet\)/i)).toBeInTheDocument()
  })

  it('shows all 8 business wallet use cases', () => {
    renderWithProviders(<DigitalWalletsCenter />)
    clickTab('Business Wallet')
    for (const u of BUSINESS_WALLET_USE_CASES) {
      expect(screen.getByText(u.title)).toBeInTheDocument()
    }
  })

  it('shows the credential lifecycle steps', () => {
    renderWithProviders(<DigitalWalletsCenter />)
    clickTab('Lifecycle')
    expect(screen.getByText(/issue \(openid4vci\)/i)).toBeInTheDocument()
    expect(screen.getByText(/revoke \/ refresh \(status list\)/i)).toBeInTheDocument()
  })

  it('shows the relying-party acceptance deadline on the regulation tab', () => {
    renderWithProviders(<DigitalWalletsCenter />)
    clickTab('Regulation')
    expect(screen.getByText(/relying-party wallet acceptance obligation/i)).toBeInTheDocument()
  })

  it('filters programmes by region', () => {
    renderWithProviders(<DigitalWalletsCenter />)
    clickTab('Programmes')
    expect(screen.getByText('Singpass (including Corppass for businesses)')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /^european union$/i }))
    expect(screen.getByText('European Digital Identity Wallet (EUDI Wallet)')).toBeInTheDocument()
  })

  it('shows all 3 trust models', () => {
    renderWithProviders(<DigitalWalletsCenter />)
    clickTab('Trust Models')
    expect(screen.getByText('Government')).toBeInTheDocument()
    expect(screen.getByText('Bank-Backed')).toBeInTheDocument()
    expect(screen.getByText('Private Federation')).toBeInTheDocument()
  })

  for (const label of TAB_LABELS) {
    it(`${label} tab has no critical axe violations`, async () => {
      const { container } = renderWithProviders(<DigitalWalletsCenter />)
      clickTab(label)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  }
})
