import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../test/renderWithProviders'
import { useBookmarksStore } from '../store/bookmarksStore'
import { touchAcademyModule, touchLabCompletion } from '../lib/home/lastTouched'
import { ACADEMY_TRACKS } from '../data/academyTracks'
import ContinueLearningCard from './ContinueLearningCard'

describe('ContinueLearningCard', () => {
  beforeEach(() => {
    window.localStorage.clear()
    useBookmarksStore.setState({ bookmarks: [] })
  })

  it('renders nothing for a brand-new visitor with no progress', () => {
    const { container } = renderWithProviders(<ContinueLearningCard />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders a resumable academy module with a working deep link', () => {
    const firstModule = ACADEMY_TRACKS[0].modules[0]
    touchAcademyModule(firstModule.id)

    renderWithProviders(<ContinueLearningCard />)
    expect(screen.getByText(firstModule.title)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: new RegExp(firstModule.title) })).toHaveAttribute(
      'href',
      `/learn?track=${ACADEMY_TRACKS[0].id}`
    )
  })

  it('renders a resumable bookmark added via the store', () => {
    useBookmarksStore.getState().toggleBookmark({ id: 'term-oidc', title: 'OIDC', link: '/encyclopedia?term=oidc' })

    renderWithProviders(<ContinueLearningCard />)
    expect(screen.getByText('OIDC')).toBeInTheDocument()
  })

  it('renders a resumable playground completion', () => {
    touchLabCompletion('role_mining_workbench')

    renderWithProviders(<ContinueLearningCard />)
    expect(screen.getByText('Role Mining Workbench')).toBeInTheDocument()
  })
})
