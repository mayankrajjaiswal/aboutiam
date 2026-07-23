import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../test/renderWithProviders'
import { usePreferenceStore } from '../store/preferenceStore'
import PersonalizationSelector from './PersonalizationSelector'

describe('PersonalizationSelector', () => {
  it('renders nothing when closed', () => {
    const { container } = renderWithProviders(<PersonalizationSelector isOpen={false} onClose={() => {}} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('updates the shared preferenceStore depthMode on click', () => {
    renderWithProviders(<PersonalizationSelector isOpen onClose={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: /expert only/i }))
    expect(usePreferenceStore.getState().depthMode).toBe('expert')
  })

  it('updates the shared preferenceStore roleTrack on select', () => {
    renderWithProviders(<PersonalizationSelector isOpen onClose={() => {}} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'architect' } })
    expect(usePreferenceStore.getState().roleTrack).toBe('architect')
  })

  it('calls onClose on an outside click', () => {
    const onClose = vi.fn()
    renderWithProviders(
      <div>
        <div data-testid="outside">outside</div>
        <PersonalizationSelector isOpen onClose={onClose} />
      </div>
    )
    fireEvent.mouseDown(screen.getByTestId('outside'))
    expect(onClose).toHaveBeenCalled()
  })
})
