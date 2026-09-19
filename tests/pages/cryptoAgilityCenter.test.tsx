import { describe, it, expect, afterEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { axe } from 'jest-axe'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import CryptoAgilityCenter from '../../src/pages/CryptoAgilityCenter'
import { HSM_ROOT_OF_TRUST_CONCEPTS } from '../../src/data/hsmRootOfTrust'
import { CRYPTO_MIGRATION_WORKSTREAMS } from '../../src/data/cryptoAgilityRoadmap'

const TAB_LABELS = [
  'Crypto Agility', 'Inventory', 'PQC Standards', 'Root of Trust', 'Migration', 'Cross-Cutting', 'Labs',
]

function clickTab(label: string) {
  const buttons = screen.getAllByRole('button', { name: new RegExp(`^${label}$`, 'i') })
  fireEvent.click(buttons[0])
}

describe('CryptoAgilityCenter page', () => {
  afterEach(() => {
    window.history.pushState({}, '', '/')
  })

  it('renders the heading and defaults to the "agility" tab', () => {
    renderWithProviders(<CryptoAgilityCenter />)
    expect(screen.getByRole('heading', { name: /crypto agility & root of trust/i })).toBeInTheDocument()
    expect(screen.getByText(/crypto agility as a discipline/i)).toBeInTheDocument()
  })

  it('reads the ?tab= deep-link query param on mount', async () => {
    window.history.pushState({}, '', '/next-gen/crypto-agility?tab=root-of-trust')
    renderWithProviders(<CryptoAgilityCenter />)
    expect(await screen.findByText(/hardware root of trust/i)).toBeInTheDocument()
  })

  it('shows all 6 root-of-trust concepts', () => {
    renderWithProviders(<CryptoAgilityCenter />)
    clickTab('Root of Trust')
    for (const c of HSM_ROOT_OF_TRUST_CONCEPTS) {
      expect(screen.getByText(c.title)).toBeInTheDocument()
    }
  })

  it('shows all 10 migration workstreams with dependency info', () => {
    renderWithProviders(<CryptoAgilityCenter />)
    clickTab('Migration')
    for (const w of CRYPTO_MIGRATION_WORKSTREAMS) {
      expect(screen.getByText(w.title)).toBeInTheDocument()
    }
    expect(screen.getAllByText(/no dependencies — a root workstream/i).length).toBeGreaterThan(0)
  })

  it('shows the cross-cutting matrix linking all 4 dependent themes', () => {
    renderWithProviders(<CryptoAgilityCenter />)
    clickTab('Cross-Cutting')
    expect(screen.getByText('Agentic Identity & Governance')).toBeInTheDocument()
    expect(screen.getByText('Digital Wallets & Verifiable Credentials')).toBeInTheDocument()
  })

  it('links to the PQC FIPS standard on the pqc tab', () => {
    renderWithProviders(<CryptoAgilityCenter />)
    clickTab('PQC Standards')
    const link = screen.getAllByText(/nist fips 203\/204\/205/i)[0].closest('a')
    expect(link).toHaveAttribute('href', '/standards?standard=pqc-fips203-205')
  })

  it('renders the labs tab with lab links', () => {
    renderWithProviders(<CryptoAgilityCenter />)
    clickTab('Labs')
    expect(screen.getByText(/crypto migration planner/i)).toBeInTheDocument()
  })

  for (const label of TAB_LABELS) {
    it(`${label} tab has no critical axe violations`, async () => {
      const { container } = renderWithProviders(<CryptoAgilityCenter />)
      clickTab(label)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  }
})
