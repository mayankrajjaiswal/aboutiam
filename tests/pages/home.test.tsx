import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import Home from '../../src/pages/Home'
import { NEXT_GEN_THEMES } from '../../src/data/nextGenThemes'

describe('Home page', () => {
  it('renders the Next-Gen IAM strip with a card per theme, linking to each hub', () => {
    renderWithProviders(<Home />)
    expect(screen.getByRole('heading', { name: /^next-gen iam$/i })).toBeInTheDocument()

    for (const theme of NEXT_GEN_THEMES) {
      const link = screen.getByRole('link', { name: new RegExp(theme.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') })
      expect(link).toHaveAttribute('href', theme.route)
    }
  })

  it('renders exactly one Next-Gen strip card per theme registry entry', () => {
    renderWithProviders(<Home />)
    const exploreLinks = screen.getAllByText('Explore')
    expect(exploreLinks.length).toBe(NEXT_GEN_THEMES.length)
  })
})
