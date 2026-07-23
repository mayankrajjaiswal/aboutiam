import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../test/renderWithProviders'
import { useBookmarksStore } from '../store/bookmarksStore'
import BookmarkButton from './BookmarkButton'

const ITEM = { id: 'tool-jwt-decoder', title: 'JWT Decoder', link: '/tools/jwt-decoder' }

describe('BookmarkButton', () => {
  it('renders not-yet-bookmarked by default', () => {
    renderWithProviders(<BookmarkButton item={ITEM} />)
    expect(screen.getByRole('button', { name: /save jwt decoder for later/i })).toHaveAttribute('aria-pressed', 'false')
  })

  it('toggles the shared bookmarksStore on click, and reflects the new state', () => {
    renderWithProviders(<BookmarkButton item={ITEM} />)
    const button = screen.getByRole('button')

    fireEvent.click(button)
    expect(useBookmarksStore.getState().isBookmarked(ITEM.id)).toBe(true)
    expect(screen.getByRole('button', { name: /remove jwt decoder from bookmarks/i })).toHaveAttribute('aria-pressed', 'true')

    fireEvent.click(button)
    expect(useBookmarksStore.getState().isBookmarked(ITEM.id)).toBe(false)
  })

  it('stops the click from bubbling to a wrapping link/card', () => {
    const onParentClick = () => {
      throw new Error('parent click handler should not fire')
    }
    renderWithProviders(
      <div onClick={onParentClick}>
        <BookmarkButton item={ITEM} />
      </div>
    )
    expect(() => fireEvent.click(screen.getByRole('button'))).not.toThrow()
  })
})
