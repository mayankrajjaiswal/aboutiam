import { describe, it, expect, afterEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import Assess from '../../src/pages/Assess'

function withSharedReport(param: string) {
  window.history.pushState({}, '', `/assess?a=${param}`)
}

describe('Assess maturity benchmark overlay', () => {
  afterEach(() => {
    window.history.pushState({}, '', '/')
  })

  it('shows Level 5 Transformational for a perfect shared report', () => {
    withSharedReport('55555')
    renderWithProviders(<Assess />)
    expect(screen.getByText('Level 5 of 5')).toBeInTheDocument()
    expect(screen.getAllByText('Transformational').length).toBeGreaterThan(0)
    expect(screen.getByText('100th percentile')).toBeInTheDocument()
  })

  it('shows Level 1 Initial for a minimal shared report', () => {
    withSharedReport('11111')
    renderWithProviders(<Assess />)
    expect(screen.getByText('Level 1 of 5')).toBeInTheDocument()
    expect(screen.getAllByText('Initial').length).toBeGreaterThan(0)
    expect(screen.getByText('9th percentile')).toBeInTheDocument()
  })

  it('shows the peer-benchmark source disclaimer', () => {
    withSharedReport('33333')
    renderWithProviders(<Assess />)
    expect(screen.getByText(/directional estimate aggregated from published/i)).toBeInTheDocument()
  })

  it('highlights the mapped level in the level ladder', () => {
    withSharedReport('33333')
    renderWithProviders(<Assess />)
    expect(screen.getByText('Level 3 of 5')).toBeInTheDocument()
    expect(screen.getAllByText('Defined').length).toBeGreaterThan(0)
  })
})
