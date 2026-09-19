import { describe, it, expect, afterEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { axe } from 'jest-axe'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import AgenticIdentityCenter from '../../src/pages/AgenticIdentityCenter'
import { AGENTIC_QUADRANTS } from '../../src/data/agenticEcosystemQuadrants'

const TAB_LABELS = [
  'Why Agents Break IAM', 'Four Ecosystems', 'Job Description',
  'Design vs Runtime', 'Standards', 'Hands-On Path', 'Vendor Landscape',
]

function clickTab(label: string) {
  const buttons = screen.getAllByRole('button', { name: new RegExp(label, 'i') })
  fireEvent.click(buttons[0])
}

describe('AgenticIdentityCenter page', () => {
  afterEach(() => {
    window.history.pushState({}, '', '/')
  })

  it('renders the heading and defaults to the "why" tab', () => {
    renderWithProviders(<AgenticIdentityCenter />)
    expect(screen.getByRole('heading', { name: /agentic identity center/i })).toBeInTheDocument()
    expect(screen.getByText(/why agents break classic iam/i)).toBeInTheDocument()
  })

  it('reads the ?tab= deep-link query param on mount', async () => {
    window.history.pushState({}, '', '/next-gen/agentic-identity?tab=quadrants')
    renderWithProviders(<AgenticIdentityCenter />)
    expect(await screen.findByText(/the four agentic ecosystems/i)).toBeInTheDocument()
  })

  it('switches to the quadrants tab and renders all 4 quadrants', () => {
    renderWithProviders(<AgenticIdentityCenter />)
    clickTab('Four Ecosystems')
    for (const q of AGENTIC_QUADRANTS) {
      expect(screen.getByText(q.title)).toBeInTheDocument()
    }
  })

  it('switches to the job-description tab and shows all 8 field groups', () => {
    renderWithProviders(<AgenticIdentityCenter />)
    clickTab('Job Description')
    for (const group of ['Identity', 'Ownership', 'Principal', 'Intent', 'Authority', 'Conditions', 'Provenance', 'Lifecycle']) {
      expect(screen.getByText(group)).toBeInTheDocument()
    }
  })

  it('switches to the governance tab and shows both identity and fabric columns', () => {
    renderWithProviders(<AgenticIdentityCenter />)
    clickTab('Design vs Runtime')
    expect(screen.getByText(/agent identity \(design-time\)/i)).toBeInTheDocument()
    expect(screen.getByText(/ai security fabric \(run-time\)/i)).toBeInTheDocument()
  })

  it('switches to the standards tab and links to standards pages', () => {
    renderWithProviders(<AgenticIdentityCenter />)
    clickTab('Standards')
    const mcpLink = screen.getByText('MCP').closest('a')
    expect(mcpLink).toHaveAttribute('href', '/standards?standard=mcp')
  })

  it('switches to the labs tab and shows the 9-step hands-on path', () => {
    renderWithProviders(<AgenticIdentityCenter />)
    clickTab('Hands-On Path')
    expect(screen.getByText(/agent registry & lifecycle studio/i)).toBeInTheDocument()
    expect(screen.getByText(/ai swarm orchestrator/i)).toBeInTheDocument()
  })

  it('switches to the vendors tab and shows Thales as flagship alongside peers', () => {
    renderWithProviders(<AgenticIdentityCenter />)
    clickTab('Vendor Landscape')
    expect(screen.getAllByText(/flagship/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/thales/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/okta/i)).toBeInTheDocument()
  })

  for (const label of TAB_LABELS) {
    it(`${label} tab has no critical axe violations`, async () => {
      const { container } = renderWithProviders(<AgenticIdentityCenter />)
      clickTab(label)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  }
})
