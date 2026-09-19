import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { axe } from 'jest-axe'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import AiGuardrailStudio from '../../src/pages/Playgrounds/AiGuardrailStudio'
import { AI_GUARDRAIL_REQUESTS } from '../../src/data/aiGuardrailScenarios'

describe('AiGuardrailStudio playground', () => {
  it('renders the title and strictness slider, defaulting to no results shown', () => {
    renderWithProviders(<AiGuardrailStudio />)
    expect(screen.getByRole('heading', { name: /ai guardrail policy studio/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/guardrail strictness/i)).toBeInTheDocument()
    expect(screen.queryByText(/semantic guardrail$/i)).not.toBeInTheDocument()
  })

  it('running the evaluation shows both confusion matrices', () => {
    renderWithProviders(<AiGuardrailStudio />)
    fireEvent.click(screen.getByRole('button', { name: /run evaluation/i }))
    expect(screen.getByText('Semantic Guardrail')).toBeInTheDocument()
    expect(screen.getByText(/classic policy \(abac\)/i)).toBeInTheDocument()
  })

  it('shows all 20 requests after running the evaluation', () => {
    renderWithProviders(<AiGuardrailStudio />)
    fireEvent.click(screen.getByRole('button', { name: /run evaluation/i }))
    for (const r of AI_GUARDRAIL_REQUESTS) {
      expect(screen.getByText(r.content)).toBeInTheDocument()
    }
  })

  it('expanding a request shows its declared intent and explanation', () => {
    renderWithProviders(<AiGuardrailStudio />)
    fireEvent.click(screen.getByRole('button', { name: /run evaluation/i }))
    const firstRequest = AI_GUARDRAIL_REQUESTS[0]
    fireEvent.click(screen.getByText(firstRequest.content))
    expect(screen.getByText(firstRequest.explanation)).toBeInTheDocument()
  })

  it('increasing strictness to maximum catches strictly more or equal hostile/drifting requests than minimum', () => {
    renderWithProviders(<AiGuardrailStudio />)
    const slider = screen.getByLabelText(/guardrail strictness/i) as HTMLInputElement

    fireEvent.change(slider, { target: { value: '0' } })
    fireEvent.click(screen.getByRole('button', { name: /run evaluation/i }))
    // Two "Caught: N" badges render (semantic + classic) -- the semantic one is first
    const lowStrictnessCaught = screen.getAllByText(/caught: \d+/i)[0].textContent

    fireEvent.change(slider, { target: { value: '100' } })
    fireEvent.click(screen.getByRole('button', { name: /run evaluation/i }))
    const highStrictnessCaught = screen.getAllByText(/caught: \d+/i)[0].textContent

    const lowCount = parseInt(lowStrictnessCaught!.match(/\d+/)![0], 10)
    const highCount = parseInt(highStrictnessCaught!.match(/\d+/)![0], 10)
    expect(highCount).toBeGreaterThanOrEqual(lowCount)
  })

  it('reveals a hint and reflects the score penalty', () => {
    renderWithProviders(<AiGuardrailStudio />)
    expect(screen.getByText(/100 \/ 100/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /reveal next hint/i }))
    expect(screen.getByText(/85 \/ 100/i)).toBeInTheDocument()
  })

  it('resets the playground state', () => {
    renderWithProviders(<AiGuardrailStudio />)
    fireEvent.click(screen.getByRole('button', { name: /run evaluation/i }))
    expect(screen.getByText('Semantic Guardrail')).toBeInTheDocument()
    fireEvent.click(screen.getByTitle(/reset simulator/i))
    expect(screen.queryByText('Semantic Guardrail')).not.toBeInTheDocument()
  })

  it('has no critical axe violations before running the evaluation', async () => {
    const { container } = renderWithProviders(<AiGuardrailStudio />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has no critical axe violations after running the evaluation', async () => {
    const { container } = renderWithProviders(<AiGuardrailStudio />)
    fireEvent.click(screen.getByRole('button', { name: /run evaluation/i }))
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
