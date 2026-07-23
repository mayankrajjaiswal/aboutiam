import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../test/renderWithProviders'
import { feedbackStorageKey } from '../lib/contentFeedback'
import ContentFeedback from './ContentFeedback'

describe('ContentFeedback', () => {
  beforeEach(() => {
    vi.spyOn(window, 'open').mockImplementation(() => null)
  })

  it('renders Helpful/Flag with no prior vote', () => {
    renderWithProviders(<ContentFeedback id="term-oauth" title="OAuth 2.0" />)
    expect(screen.getByRole('button', { name: /helpful/i })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: /flag/i })).toHaveAttribute('aria-pressed', 'false')
  })

  it('persists a Helpful vote to localStorage and opens a prefilled GitHub issue', () => {
    renderWithProviders(<ContentFeedback id="term-oauth" title="OAuth 2.0" />)
    fireEvent.click(screen.getByRole('button', { name: /helpful/i }))

    expect(localStorage.getItem(feedbackStorageKey('term-oauth'))).toBe('helpful')
    expect(window.open).toHaveBeenCalledWith(
      expect.stringContaining('github.com'),
      '_blank',
      'noopener,noreferrer'
    )
    expect(screen.getByRole('button', { name: /helpful/i })).toHaveAttribute('aria-pressed', 'true')
  })

  it('reads a previously-saved vote back from localStorage on mount', () => {
    localStorage.setItem(feedbackStorageKey('term-saml'), 'flag')
    renderWithProviders(<ContentFeedback id="term-saml" title="SAML 2.0" />)
    expect(screen.getByRole('button', { name: /flag/i })).toHaveAttribute('aria-pressed', 'true')
  })
})
