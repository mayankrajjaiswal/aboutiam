import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../test/renderWithProviders'
import BreadcrumbNav from './BreadcrumbNav'

describe('BreadcrumbNav', () => {
  it('renders nothing on the homepage (no trail)', () => {
    const { container } = renderWithProviders(<BreadcrumbNav />, '/')
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing for a top-level single-segment route', () => {
    const { container } = renderWithProviders(<BreadcrumbNav />, '/learn/')
    expect(container).toBeEmptyDOMElement()
  })

  it('renders a Home -> hub -> leaf trail for a nested route, with the leaf non-linked', () => {
    renderWithProviders(<BreadcrumbNav />, '/tools/jwt-decoder/')

    expect(screen.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(screen.getByRole('link', { name: 'Security Tools' })).toHaveAttribute('href', '/tools/')

    const leaf = screen.getByText(/JWT Decoder/)
    expect(leaf).toHaveAttribute('aria-current', 'page')
    expect(leaf.tagName).toBe('SPAN')
  })
})
