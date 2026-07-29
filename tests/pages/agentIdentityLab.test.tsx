import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import AgentIdentityLab from '../../src/pages/Playgrounds/AgentIdentityLab'

// Mock browser alert to prevent blocking the test runner
vi.spyOn(window, 'alert').mockImplementation(() => {})

describe('AgentIdentityLab page', () => {
  it('renders the heading, description, and root human principal card', () => {
    renderWithProviders(<AgentIdentityLab />)
    expect(screen.getByRole('heading', { name: /agentic identity & mcp trust simulator/i })).toBeInTheDocument()
    expect(screen.getByText(/Human User \(Principal\)/i)).toBeInTheDocument()
  })

  it('allows switching scenarios and updates starting scopes', () => {
    renderWithProviders(<AgentIdentityLab />)
    // Find the second scenario button (AI DevOps CI/CD Pipeline)
    const devopsBtn = screen.getByText(/AI DevOps CI\/CD Pipeline/i)
    fireEvent.click(devopsBtn)

    expect(screen.getAllByText(/Production Kubernetes Cluster/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/repo:read/i).length).toBeGreaterThan(0)
  })

  it('can toggle compromise simulation', () => {
    renderWithProviders(<AgentIdentityLab />)
    // Initially, compromise toggle is disabled because delegation chain is too short
    const compromiseBtn = screen.getByRole('button', { name: /simulate compromise/i })
    expect(compromiseBtn).toBeDisabled()
  })

  it('allows adding a sub-agent delegation hop and configuring it', async () => {
    renderWithProviders(<AgentIdentityLab />)
    
    // Open add hop modal
    const addHopBtn = screen.getByRole('button', { name: /add delegation hop/i })
    fireEvent.click(addHopBtn)

    // Modal elements should be in the document
    expect(screen.getByText(/configure delegation token & sub-agent/i)).toBeInTheDocument()

    // Fill out form
    const nameInput = screen.getByPlaceholderText(/e\.g\. Orchestrator Assistant/i)
    fireEvent.change(nameInput, { target: { value: 'My Test Sub-Agent' } })

    // Select/deselect scopes
    const checkboxes = screen.getAllByRole('checkbox')
    // Uncheck the trap scope if we want least privilege (for customer_support_refund, trapScope is admin:all)
    // Find checkbox with 'admin:all' label
    const adminCheckbox = checkboxes.find(c => {
      const parent = c.parentElement
      return parent && parent.textContent?.includes('admin:all')
    })
    
    if (adminCheckbox) {
      fireEvent.click(adminCheckbox) // Uncheck it
    }

    // Submit the form
    const issueBtn = screen.getByRole('button', { name: /issue delegate token/i })
    fireEvent.click(issueBtn)

    // Verify sub-agent card is now rendered in the topology
    await waitFor(() => {
      expect(screen.getByText('My Test Sub-Agent')).toBeInTheDocument()
    })
  })

  it('blocks privilege escalation if a non-human agent attempts to request scope not present in parent', async () => {
    renderWithProviders(<AgentIdentityLab />)

    const addHopBtn = screen.getByRole('button', { name: /add delegation hop/i })
    fireEvent.click(addHopBtn)

    // The scopes available to select should be exactly: support:read, support:write, refund:request, admin:all
    expect(screen.getAllByText(/support:read/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/refund:request/i).length).toBeGreaterThan(0)
    expect(screen.queryByText(/secrets:read/i)).not.toBeInTheDocument() // secrets:read doesn't exist for support scenario
  })

  it('captures a packet frame when a delegation token is issued, viewable via the Packet Capture drawer', async () => {
    renderWithProviders(<AgentIdentityLab />)

    fireEvent.click(screen.getByRole('button', { name: /add delegation hop/i }))
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /issue delegate token/i })).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: /issue delegate token/i }))

    await waitFor(() => {
      expect(screen.getByTitle(/toggle packet capture/i)).toBeInTheDocument()
    })
    fireEvent.click(screen.getByTitle(/toggle packet capture/i))
    expect(screen.getByText(/Packet Capture \(1\)/i)).toBeInTheDocument()
  })
})
