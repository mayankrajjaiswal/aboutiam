import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { axe } from 'jest-axe'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import AgentIdentityRecordGenerator from '../../src/pages/Tools/AgentIdentityRecordGenerator'

describe('AgentIdentityRecordGenerator tool page', () => {
  it('renders the title and completeness indicator', () => {
    renderWithProviders(<AgentIdentityRecordGenerator />)
    expect(screen.getByRole('heading', { name: /agent identity record generator/i })).toBeInTheDocument()
    expect(screen.getByText(/completeness:/i)).toBeInTheDocument()
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  it('shows critical owner and expiry warnings by default', () => {
    renderWithProviders(<AgentIdentityRecordGenerator />)
    expect(screen.getByText(/no human owner is named/i)).toBeInTheDocument()
    expect(screen.getByText(/no expiry is set/i)).toBeInTheDocument()
  })

  it('updates the JSON output and completeness when a field is filled', () => {
    renderWithProviders(<AgentIdentityRecordGenerator />)
    const ownerInput = screen.getByLabelText(/^human owner/i)
    fireEvent.change(ownerInput, { target: { value: 'jane.doe@example.com' } })
    expect(screen.queryByText(/no human owner is named/i)).not.toBeInTheDocument()
    expect(screen.getByText(/"owner": "jane.doe@example.com"/)).toBeInTheDocument()
  })

  it('switches to YAML output format', () => {
    renderWithProviders(<AgentIdentityRecordGenerator />)
    fireEvent.change(screen.getByLabelText(/^agent id/i), { target: { value: 'agent-test-1' } })
    fireEvent.click(screen.getByRole('button', { name: /yaml/i }))
    expect(screen.getByText(/agent_id: agent-test-1/)).toBeInTheDocument()
  })

  it('switches to job description output format', () => {
    renderWithProviders(<AgentIdentityRecordGenerator />)
    fireEvent.change(screen.getByLabelText(/^display name/i), { target: { value: 'Refund Sub-Agent' } })
    fireEvent.click(screen.getByRole('button', { name: /job description/i }))
    expect(screen.getByText(/Agent Job Description: Refund Sub-Agent/)).toBeInTheDocument()
  })

  it('flags an over-broad permitted-tools grant', () => {
    renderWithProviders(<AgentIdentityRecordGenerator />)
    fireEvent.change(screen.getByLabelText(/^permitted tools/i), { target: { value: '*' } })
    expect(screen.getByText(/permitted tools looks over-broad/i)).toBeInTheDocument()
  })

  it('resets all values and warnings on reset', () => {
    renderWithProviders(<AgentIdentityRecordGenerator />)
    const ownerInput = screen.getByLabelText(/^human owner/i) as HTMLInputElement
    fireEvent.change(ownerInput, { target: { value: 'jane.doe@example.com' } })
    expect(ownerInput.value).toBe('jane.doe@example.com')
    fireEvent.click(screen.getByRole('button', { name: /^reset$/i }))
    expect(ownerInput.value).toBe('')
    expect(screen.getByText(/no human owner is named/i)).toBeInTheDocument()
  })

  it('has no critical axe violations with default (empty) state', async () => {
    const { container } = renderWithProviders(<AgentIdentityRecordGenerator />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has no critical axe violations after filling in fields and switching format', async () => {
    const { container } = renderWithProviders(<AgentIdentityRecordGenerator />)
    fireEvent.change(screen.getByLabelText(/^human owner/i), { target: { value: 'jane.doe@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: /yaml/i }))
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
