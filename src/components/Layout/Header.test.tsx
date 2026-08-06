import { describe, it, expect, beforeEach } from 'vitest'
import { screen, fireEvent, act } from '@testing-library/react'
import { renderWithProviders } from '../../test/renderWithProviders'
import { useThemeStore } from '../../store/themeStore'
import { useCommandPaletteStore } from '../../store/commandPaletteStore'
import { useAirplaneModeStore } from '../../store/airplaneModeStore'
import Header from './Header'

describe('Header', () => {
  beforeEach(() => {
    // index.html ships a real <link rel="canonical"> that Header's effect
    // updates in place — jsdom starts with an empty <head>, so add one here.
    const link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  })

  it('renders the current route title and updates document.title/canonical link on mount', () => {
    renderWithProviders(<Header />, '/tools/jwt-decoder/')
    expect(screen.getAllByText(/JWT Decoder/)[0]).toBeInTheDocument()
    expect(document.title).toContain('JWT Decoder')
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://www.aboutiam.com/tools/jwt-decoder/'
    )
  })

  it('uses the special home title on "/"', () => {
    renderWithProviders(<Header />, '/')
    expect(document.title).toBe('AboutIAM | The Interactive Identity Workspace')
  })

  it('embeds BreadcrumbList JSON-LD for a nested route, and omits it on the homepage', () => {
    renderWithProviders(<Header />, '/tools/jwt-decoder/')
    const script = document.querySelector('script[type="application/ld+json"]')
    expect(script).toBeInTheDocument()
    const json = JSON.parse(script!.innerHTML)
    expect(json['@type']).toBe('BreadcrumbList')
    expect(json.itemListElement.at(-1).name).toBe('JWT Decoder')

    document.querySelector('script[type="application/ld+json"]')?.remove()
    renderWithProviders(<Header />, '/')
    expect(document.querySelector('script[type="application/ld+json"]')).not.toBeInTheDocument()
  })

  it('cycles the theme light -> dark -> system -> light on repeated clicks', () => {
    useThemeStore.setState({ theme: 'light' })
    renderWithProviders(<Header />)
    const themeButton = screen.getByTitle('Cycle appearance theme (Light -> Dark -> System)')

    fireEvent.click(themeButton)
    expect(useThemeStore.getState().theme).toBe('dark')
    fireEvent.click(themeButton)
    expect(useThemeStore.getState().theme).toBe('system')
    fireEvent.click(themeButton)
    expect(useThemeStore.getState().theme).toBe('light')
  })

  it('toggles the command palette via the Search button', () => {
    useCommandPaletteStore.setState({ isOpen: false })
    renderWithProviders(<Header />)
    fireEvent.click(screen.getByTitle('Search / Command Console (⌘K)'))
    expect(useCommandPaletteStore.getState().isOpen).toBe(true)
  })

  it('toggles the command palette via the Cmd/Ctrl+K global shortcut', () => {
    useCommandPaletteStore.setState({ isOpen: false })
    renderWithProviders(<Header />)
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
    expect(useCommandPaletteStore.getState().isOpen).toBe(true)
  })

  it('opens the Airplane resilience console and reflects the enabled state on the button', () => {
    useAirplaneModeStore.setState({ isEnabled: false })
    renderWithProviders(<Header />)
    expect(screen.queryByText('Offline')).not.toBeInTheDocument()

    act(() => {
      useAirplaneModeStore.setState({ isEnabled: true })
    })
    expect(screen.getByText('Offline')).toBeInTheDocument()

    fireEvent.click(screen.getByTitle('✈️ Air-Gap & Resilience Console (Verify 100% offline privacy)'))
    expect(screen.getByText('Inject Latency')).toBeInTheDocument()
  })

  it('opens the personalization dropdown', () => {
    renderWithProviders(<Header />)
    fireEvent.click(screen.getByTitle('Personalize content depth and career track'))
    expect(screen.getByText('Content Depth')).toBeInTheDocument()
  })
})
