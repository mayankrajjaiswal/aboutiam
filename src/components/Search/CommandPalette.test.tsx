import { describe, it, expect, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../../test/renderWithProviders'
import { useSearchHistoryStore } from '../../lib/search/useSearchHistory'
import { CURATED_POPULAR_SEARCHES } from '../../data/curatedPopularSearches'
import CommandPalette from './CommandPalette'

describe('CommandPalette', () => {
  beforeEach(() => {
    useSearchHistoryStore.setState({ recentQueries: [] })
  })

  it('renders nothing when closed', () => {
    const { container } = renderWithProviders(<CommandPalette isOpen={false} onClose={() => {}} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('shows the Popular section with every curated entry on empty-query open', () => {
    renderWithProviders(<CommandPalette isOpen={true} onClose={() => {}} />)
    expect(screen.getByText('Popular')).toBeInTheDocument()
    for (const entry of CURATED_POPULAR_SEARCHES) {
      expect(screen.getByText(entry.label)).toBeInTheDocument()
    }
  })

  it('shows Recent Queries above Popular when history exists', () => {
    useSearchHistoryStore.setState({ recentQueries: ['oauth'] })
    renderWithProviders(<CommandPalette isOpen={true} onClose={() => {}} />)
    expect(screen.getByText('Recent Queries')).toBeInTheDocument()
    expect(screen.getByText('oauth')).toBeInTheDocument()
  })

  it('closes when a Popular entry is clicked', () => {
    let closed = false
    renderWithProviders(<CommandPalette isOpen={true} onClose={() => { closed = true }} />)
    fireEvent.click(screen.getByText(CURATED_POPULAR_SEARCHES[0].label))
    expect(closed).toBe(true)
  })
})
