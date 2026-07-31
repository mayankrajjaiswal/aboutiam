import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../test/renderWithProviders'
import { CHORDED_SHORTCUTS } from '../data/chordedShortcuts'
import ShortcutsOverlay from './ShortcutsOverlay'

describe('ShortcutsOverlay', () => {
  it('renders nothing when closed', () => {
    const { container } = renderWithProviders(<ShortcutsOverlay isOpen={false} onClose={() => {}} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('lists every chorded shortcut when open', () => {
    renderWithProviders(<ShortcutsOverlay isOpen={true} onClose={() => {}} />)
    for (const s of CHORDED_SHORTCUTS) {
      expect(screen.getByText(s.label)).toBeInTheDocument()
    }
  })

  it('calls onClose when the close button is clicked', () => {
    const onClose = vi.fn()
    renderWithProviders(<ShortcutsOverlay isOpen={true} onClose={onClose} />)
    fireEvent.click(screen.getByLabelText('Close shortcuts overlay'))
    expect(onClose).toHaveBeenCalled()
  })
})
