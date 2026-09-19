import { describe, it, expect, afterEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { axe } from 'jest-axe'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import AiSecurityFabricCenter from '../../src/pages/AiSecurityFabricCenter'
import { AI_CONTROL_PLANE_FUNCTIONS } from '../../src/data/aiControlPlaneFunctions'
import { AGENT_THREAT_CATALOG } from '../../src/data/agentThreatCatalog'

const TAB_LABELS = [
  'The Control Plane', 'Discovery', 'Guardrails', 'Egress',
  'Observability', 'Intervene', 'Threat Catalogue', 'Labs',
]

function clickTab(label: string) {
  const buttons = screen.getAllByRole('button', { name: new RegExp(`^${label}$`, 'i') })
  fireEvent.click(buttons[0])
}

describe('AiSecurityFabricCenter page', () => {
  afterEach(() => {
    window.history.pushState({}, '', '/')
  })

  it('renders the heading and defaults to the "concept" tab', () => {
    renderWithProviders(<AiSecurityFabricCenter />)
    expect(screen.getByRole('heading', { name: /ai security fabric center/i })).toBeInTheDocument()
    expect(screen.getByText(/what is an ai control plane/i)).toBeInTheDocument()
  })

  it('reads the ?tab= deep-link query param on mount', async () => {
    window.history.pushState({}, '', '/next-gen/ai-security-fabric?tab=threats')
    renderWithProviders(<AiSecurityFabricCenter />)
    expect(await screen.findByText(/agent-specific threat catalogue/i)).toBeInTheDocument()
  })

  it('shows all 4 control-plane functions on the concept tab', () => {
    renderWithProviders(<AiSecurityFabricCenter />)
    for (const fn of AI_CONTROL_PLANE_FUNCTIONS) {
      expect(screen.getByText(fn.title)).toBeInTheDocument()
    }
  })

  it('shows the 7-rung intervention ladder on the intervene tab', () => {
    renderWithProviders(<AiSecurityFabricCenter />)
    clickTab('Intervene')
    expect(screen.getByText('Log')).toBeInTheDocument()
    expect(screen.getByText('Decommission Agent')).toBeInTheDocument()
  })

  it('shows all 12 threats on the threat catalogue tab and filters by category', () => {
    renderWithProviders(<AiSecurityFabricCenter />)
    clickTab('Threat Catalogue')
    for (const threat of AGENT_THREAT_CATALOG) {
      expect(screen.getByText(threat.title)).toBeInTheDocument()
    }
    fireEvent.click(screen.getByRole('button', { name: /^supply chain$/i }))
    const supplyChainThreats = AGENT_THREAT_CATALOG.filter((t) => t.category === 'Supply Chain')
    for (const threat of supplyChainThreats) {
      expect(screen.getByText(threat.title)).toBeInTheDocument()
    }
  })

  it('links to discovery tools', () => {
    renderWithProviders(<AiSecurityFabricCenter />)
    clickTab('Discovery')
    const link = screen.getByText(/mcp manifest & tool-permission auditor/i).closest('a')
    expect(link).toHaveAttribute('href', '/tools/mcp-manifest-auditor')
  })

  it('renders the labs tab with lab links', () => {
    renderWithProviders(<AiSecurityFabricCenter />)
    clickTab('Labs')
    expect(screen.getByText(/ai guardrail policy studio/i)).toBeInTheDocument()
  })

  for (const label of TAB_LABELS) {
    it(`${label} tab has no critical axe violations`, async () => {
      const { container } = renderWithProviders(<AiSecurityFabricCenter />)
      clickTab(label)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  }
})
