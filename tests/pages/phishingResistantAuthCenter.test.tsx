import { describe, it, expect, afterEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { axe } from 'jest-axe'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import PhishingResistantAuthCenter from '../../src/pages/PhishingResistantAuthCenter'
import { FIDO_FORM_FACTORS } from '../../src/data/fidoFormFactors'
import { FIDO_FLEET_LIFECYCLE } from '../../src/data/fidoFleetLifecycle'

const TAB_LABELS = [
  'Why Phishing-Resistant', 'Form Factors', 'Fleet Lifecycle', 'Attestation',
  'Economics', 'Sustainability', 'Crypto Agility', 'Labs',
]

function clickTab(label: string) {
  const buttons = screen.getAllByRole('button', { name: new RegExp(`^${label}$`, 'i') })
  fireEvent.click(buttons[0])
}

describe('PhishingResistantAuthCenter page', () => {
  afterEach(() => {
    window.history.pushState({}, '', '/')
  })

  it('renders the heading and defaults to the "why" tab', () => {
    renderWithProviders(<PhishingResistantAuthCenter />)
    expect(screen.getByRole('heading', { name: /phishing-resistant auth & device fleets/i })).toBeInTheDocument()
    expect(screen.getByText(/why phishing-resistant, why now/i)).toBeInTheDocument()
  })

  it('reads the ?tab= deep-link query param on mount', async () => {
    window.history.pushState({}, '', '/next-gen/phishing-resistant-auth?tab=form-factors')
    renderWithProviders(<PhishingResistantAuthCenter />)
    expect(await screen.findByText(/fido form factors — a fleet decision/i)).toBeInTheDocument()
  })

  it('shows all 6 form factors on the form-factors tab', () => {
    renderWithProviders(<PhishingResistantAuthCenter />)
    clickTab('Form Factors')
    for (const f of FIDO_FORM_FACTORS) {
      expect(screen.getByText(f.name)).toBeInTheDocument()
    }
  })

  it('expands a fleet-lifecycle stage to show its KPIs', () => {
    renderWithProviders(<PhishingResistantAuthCenter />)
    clickTab('Fleet Lifecycle')
    const firstStage = FIDO_FLEET_LIFECYCLE[0]
    const summary = screen.getByText(firstStage.title)
    fireEvent.click(summary)
    expect(screen.getByText(firstStage.kpis[0].name)).toBeInTheDocument()
  })

  it('links to the AAGUID and attestation policy lab', () => {
    renderWithProviders(<PhishingResistantAuthCenter />)
    clickTab('Attestation')
    const link = screen.getByText(/aaguid & attestation policy lab/i).closest('a')
    expect(link).toHaveAttribute('href', '/playground/attestation-policy')
  })

  it('links to the passwordless ROI calculator on the economics tab', () => {
    renderWithProviders(<PhishingResistantAuthCenter />)
    clickTab('Economics')
    const link = screen.getByText(/passwordless roi & helpdesk cost calculator/i).closest('a')
    expect(link).toHaveAttribute('href', '/tools/passwordless-roi-calculator')
  })

  it('shows sustainability notes for every form factor', () => {
    renderWithProviders(<PhishingResistantAuthCenter />)
    clickTab('Sustainability')
    for (const f of FIDO_FORM_FACTORS) {
      expect(screen.getByText(f.name)).toBeInTheDocument()
    }
  })

  it('renders the labs tab with lab links', () => {
    renderWithProviders(<PhishingResistantAuthCenter />)
    clickTab('Labs')
    expect(screen.getByText(/fido fleet operations simulator/i)).toBeInTheDocument()
  })

  for (const label of TAB_LABELS) {
    it(`${label} tab has no critical axe violations`, async () => {
      const { container } = renderWithProviders(<PhishingResistantAuthCenter />)
      clickTab(label)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  }
})
