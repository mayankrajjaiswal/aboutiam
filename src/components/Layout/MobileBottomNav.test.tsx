import { describe, it, expect, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../../test/renderWithProviders'
import { useCommandPaletteStore } from '../../store/commandPaletteStore'
import MobileBottomNav from './MobileBottomNav'

describe('MobileBottomNav', () => {
  beforeEach(() => {
    useCommandPaletteStore.setState({ isOpen: false })
  })

  it('marks the tab matching the current route as active', () => {
    renderWithProviders(<MobileBottomNav />, '/learn')
    expect(screen.getByRole('link', { name: 'Learn' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current')
  })

  it('marks no tab active for a route with no matching tab', () => {
    renderWithProviders(<MobileBottomNav />, '/some-other-page')
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current')
  })

  it('marks Playgrounds active for a nested playground route', () => {
    renderWithProviders(<MobileBottomNav />, '/playground/oauth')
    expect(screen.getByRole('link', { name: 'Playgrounds' })).toHaveAttribute('aria-current', 'page')
  })

  it('tapping Search opens the shared command palette store rather than a new menu', () => {
    renderWithProviders(<MobileBottomNav />)
    expect(useCommandPaletteStore.getState().isOpen).toBe(false)
    fireEvent.click(screen.getByRole('button', { name: 'Search' }))
    expect(useCommandPaletteStore.getState().isOpen).toBe(true)
  })

  it('renders all 5 fixed tabs', () => {
    renderWithProviders(<MobileBottomNav />)
    expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Learn' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Playgrounds' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Tools' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument()
  })
})
