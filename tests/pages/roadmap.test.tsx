import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import Roadmap from '../../src/pages/Roadmap'

describe('Roadmap page', () => {
  it('renders a Stage 6 entry in the sequence sidebar', () => {
    renderWithProviders(<Roadmap />)
    expect(screen.getByText('Stage 6')).toBeInTheDocument()
    expect(screen.getByText(/govern ai agents, phishing-resistant fleets, wallets, and crypto agility/i)).toBeInTheDocument()
  })

  it('shows the Next-Gen stage detail and its link to the Next-Gen IAM Center when selected', () => {
    renderWithProviders(<Roadmap />)
    fireEvent.click(screen.getByText('Stage 6'))
    expect(screen.getByRole('heading', { name: /stage 6: next-generation identity/i })).toBeInTheDocument()
    expect(screen.getByText('Open the Next-Gen IAM Center')).toBeInTheDocument()
    const links = screen.getAllByRole('link').filter((el) => el.getAttribute('href') === '/next-gen')
    expect(links.length).toBeGreaterThan(0)
  })

  it('renders no certifications section for a stage with an empty certifications list', () => {
    renderWithProviders(<Roadmap />)
    fireEvent.click(screen.getByText('Stage 6'))
    expect(screen.queryByText(/target cybersecurity certification/i)).not.toBeInTheDocument()
  })

  it('still renders a certifications section for a stage with certifications', () => {
    renderWithProviders(<Roadmap />)
    fireEvent.click(screen.getByText('Stage 1'))
    expect(screen.getByText(/target cybersecurity certification/i)).toBeInTheDocument()
  })
})
