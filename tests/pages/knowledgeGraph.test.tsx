import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import KnowledgeGraph from '../../src/pages/KnowledgeGraph'

// Colocated inside src/pages/ would collide with allPagesRender.test.tsx's
// `import.meta.glob('../../src/pages/**/*.tsx')` smoke test, which treats
// every matched .tsx file as a page module — hence this lives under tests/
// alongside the other page-level suites instead.
describe('KnowledgeGraph page', () => {
  it('renders the heading and the graph', () => {
    renderWithProviders(<KnowledgeGraph />)
    expect(screen.getByRole('heading', { name: /knowledge graph/i })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /graph of connected/i })).toBeInTheDocument()
  })

  it('shows a placeholder when nothing is selected', () => {
    renderWithProviders(<KnowledgeGraph />)
    expect(screen.getByText(/select a concept/i)).toBeInTheDocument()
  })

  it('selecting a node from the list opens its detail panel with a link to its full page', () => {
    renderWithProviders(<KnowledgeGraph />)
    fireEvent.click(screen.getByRole('button', { name: /open oauth 2.1 details/i }))

    expect(screen.getByRole('heading', { name: 'OAuth 2.1' })).toBeInTheDocument()
    const link = screen.getByRole('link', { name: /open full page/i })
    expect(link).toHaveAttribute('href', '/standards?standard=oauth21')
  })

  it('shows connected concepts as clickable chips, and clicking one re-selects it', () => {
    renderWithProviders(<KnowledgeGraph />)
    fireEvent.click(screen.getByRole('button', { name: /open oauth 2.1 details/i }))

    const oidcChip = screen.getByRole('button', { name: /open oidc details/i })
    expect(oidcChip).toBeInTheDocument()

    fireEvent.click(oidcChip)
    expect(screen.getByRole('heading', { name: 'OIDC' })).toBeInTheDocument()
  })

  it('the "Clear selection" button returns to the placeholder state', () => {
    renderWithProviders(<KnowledgeGraph />)
    fireEvent.click(screen.getByRole('button', { name: /open oauth 2.1 details/i }))
    fireEvent.click(screen.getByRole('button', { name: /clear selection/i }))
    expect(screen.getByText(/select a concept/i)).toBeInTheDocument()
  })

  it('filters the visible list by search query', () => {
    renderWithProviders(<KnowledgeGraph />)
    fireEvent.change(screen.getByRole('textbox', { name: /search the knowledge graph/i }), {
      target: { value: 'zzz-no-such-concept' },
    })
    expect(screen.getByText(/no concepts match your search/i)).toBeInTheDocument()

    fireEvent.change(screen.getByRole('textbox', { name: /search the knowledge graph/i }), {
      target: { value: 'JWT' },
    })
    expect(screen.getByRole('button', { name: /open jwt details/i })).toBeInTheDocument()
  })

  it('filtering by type hides nodes of other types from the list', () => {
    renderWithProviders(<KnowledgeGraph />)
    fireEvent.click(screen.getByRole('button', { name: 'Standards' }))
    expect(screen.queryByRole('button', { name: /open jwt details/i })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /open oauth 2\.1 details/i })).toBeInTheDocument()
  })
})
