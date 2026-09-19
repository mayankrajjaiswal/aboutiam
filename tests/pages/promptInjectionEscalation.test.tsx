import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { axe } from 'jest-axe'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import PromptInjectionEscalation from '../../src/pages/Playgrounds/PromptInjectionEscalation'

describe('PromptInjectionEscalation playground', () => {
  it('renders the title and all 6 chain stages', () => {
    renderWithProviders(<PromptInjectionEscalation />)
    expect(screen.getByRole('heading', { name: /prompt injection.*privilege escalation lab/i })).toBeInTheDocument()
    expect(screen.getByText(/injected instruction in retrieved content/i)).toBeInTheDocument()
    expect(screen.getByText(/^6\. exfiltration/i)).toBeInTheDocument()
  })

  it('running the chain with no controls active reports full compromise', () => {
    renderWithProviders(<PromptInjectionEscalation />)
    fireEvent.click(screen.getByRole('button', { name: /run the attack chain/i }))
    expect(screen.getAllByText(/full chain succeeded/i).length).toBeGreaterThan(0)
  })

  it('enabling the earliest control (content provenance tagging) breaks the chain at stage 1', () => {
    renderWithProviders(<PromptInjectionEscalation />)
    const toggles = screen.getAllByRole('button', { name: /inactive/i })
    fireEvent.click(toggles[0]) // stage 1's control
    fireEvent.click(screen.getByRole('button', { name: /run the attack chain/i }))
    expect(screen.getAllByText(/chain neutralized at stage 1/i).length).toBeGreaterThan(0)
  })

  it('enabling only a late-stage control (egress DLP) still breaks the chain, at stage 6', () => {
    renderWithProviders(<PromptInjectionEscalation />)
    const toggles = screen.getAllByRole('button', { name: /inactive/i })
    fireEvent.click(toggles[toggles.length - 1]) // stage 6's control
    fireEvent.click(screen.getByRole('button', { name: /run the attack chain/i }))
    expect(screen.getAllByText(/chain neutralized at stage 6/i).length).toBeGreaterThan(0)
  })

  it('toggling a control back off restores it to inactive', () => {
    renderWithProviders(<PromptInjectionEscalation />)
    const toggles = screen.getAllByRole('button', { name: /inactive/i })
    fireEvent.click(toggles[0])
    expect(screen.getAllByRole('button', { name: /^active$/i }).length).toBe(1)
    fireEvent.click(screen.getByRole('button', { name: /^active$/i }))
    expect(screen.queryByRole('button', { name: /^active$/i })).not.toBeInTheDocument()
  })

  it('reveals a hint and reflects the score penalty', () => {
    renderWithProviders(<PromptInjectionEscalation />)
    expect(screen.getByText(/100 \/ 100/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /reveal next hint/i }))
    expect(screen.getByText(/85 \/ 100/i)).toBeInTheDocument()
  })

  it('resets the playground state', () => {
    renderWithProviders(<PromptInjectionEscalation />)
    fireEvent.click(screen.getByRole('button', { name: /run the attack chain/i }))
    expect(screen.getAllByText(/full chain succeeded/i).length).toBeGreaterThan(0)
    fireEvent.click(screen.getByTitle(/reset simulator/i))
    expect(screen.queryByText(/full chain succeeded/i)).not.toBeInTheDocument()
  })

  it('has no critical axe violations before running the chain', async () => {
    const { container } = renderWithProviders(<PromptInjectionEscalation />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has no critical axe violations after running the chain', async () => {
    const { container } = renderWithProviders(<PromptInjectionEscalation />)
    fireEvent.click(screen.getByRole('button', { name: /run the attack chain/i }))
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
