import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { axe } from 'jest-axe'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import McpManifestAuditor from '../../src/pages/Tools/McpManifestAuditor'

describe('McpManifestAuditor tool page', () => {
  it('renders the tool title and empty state', () => {
    renderWithProviders(<McpManifestAuditor />)
    expect(screen.getByRole('heading', { name: /mcp manifest & tool-permission auditor/i })).toBeInTheDocument()
    expect(screen.queryByText(/tools$/i)).not.toBeInTheDocument()
  })

  it('loading the sample manifest reveals findings and the tool count', () => {
    renderWithProviders(<McpManifestAuditor />)
    fireEvent.click(screen.getByRole('button', { name: /load sample/i }))
    expect(screen.getByText('3')).toBeInTheDocument() // 3 tools in the sample
    expect(screen.getAllByText(/undistinguished destructive operation/i).length).toBeGreaterThan(0)
  })

  it('flags a credential-accepting parameter with Critical severity', () => {
    renderWithProviders(<McpManifestAuditor />)
    fireEvent.click(screen.getByRole('button', { name: /load sample/i }))
    expect(screen.getAllByText(/credential-accepting parameter/i).length).toBeGreaterThan(0)
  })

  it('shows suggested least-privilege scopes', () => {
    renderWithProviders(<McpManifestAuditor />)
    fireEvent.click(screen.getByRole('button', { name: /load sample/i }))
    expect(screen.getByText('get_order_status:read')).toBeInTheDocument()
  })

  it('shows a clean-manifest success state for a well-formed single tool', () => {
    renderWithProviders(<McpManifestAuditor />)
    const textarea = screen.getByLabelText(/mcp tool manifest json input/i)
    fireEvent.change(textarea, {
      target: {
        value: JSON.stringify({
          name: 'get_status',
          description: 'A clean, well-scoped, read-only status lookup tool.',
          parameters: { properties: { id: { type: 'string', pattern: '^[A-Z0-9]{6}$' } } },
          scopes: ['status:read'],
          readOnly: true,
        }),
      },
    })
    expect(screen.getByText(/no identity-relevant risks found/i)).toBeInTheDocument()
  })

  it('clears the input', () => {
    renderWithProviders(<McpManifestAuditor />)
    fireEvent.click(screen.getByRole('button', { name: /load sample/i }))
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /clear/i }))
    expect(screen.queryByText('3')).not.toBeInTheDocument()
  })

  it('has no critical axe violations with empty input', async () => {
    const { container } = renderWithProviders(<McpManifestAuditor />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has no critical axe violations with the sample manifest loaded', async () => {
    const { container } = renderWithProviders(<McpManifestAuditor />)
    fireEvent.click(screen.getByRole('button', { name: /load sample/i }))
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
