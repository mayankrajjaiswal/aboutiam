import { describe, it, expect, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../../test/renderWithProviders'
import Sidebar from './Sidebar'

describe('Sidebar', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('renders a sub-group header for a large group split into sub-groups', () => {
    renderWithProviders(<Sidebar />)
    fireEvent.click(screen.getByText(/Enterprise Ecosystem/))
    expect(screen.getByText('Vendor & Threat Intel')).toBeInTheDocument()
    expect(screen.getByText('Reference & AI')).toBeInTheDocument()
  })

  it('renders a flat list with no sub-group header for a small group', () => {
    renderWithProviders(<Sidebar />)
    fireEvent.click(screen.getByText(/Cryptographic Tools/))
    expect(screen.getByText('Security Utilities')).toBeInTheDocument()
    expect(screen.queryByText('Other')).not.toBeInTheDocument()
  })

  it('entries with no assigned subGroup still render (nothing silently disappears)', () => {
    renderWithProviders(<Sidebar />)
    fireEvent.click(screen.getByText(/Core Academy/))
    expect(screen.getByText('Overview Dashboard')).toBeInTheDocument()
    expect(screen.getByText("Beginner's Primer")).toBeInTheDocument()
  })

  it('filtering by a substring hides non-matching entries and keeps matching ones visible across sub-groups', () => {
    renderWithProviders(<Sidebar />)
    fireEvent.change(screen.getByLabelText('Filter sidebar navigation'), { target: { value: 'bulletin' } })

    expect(screen.getByText('Security Bulletins & Crisis Game')).toBeInTheDocument()
    expect(screen.queryByText('Overview Dashboard')).not.toBeInTheDocument()
    expect(screen.queryByText('Security Utilities')).not.toBeInTheDocument()
  })

  it('clearing the filter restores the previous (collapsed) accordion state', async () => {
    renderWithProviders(<Sidebar />)
    const filter = screen.getByLabelText('Filter sidebar navigation')
    fireEvent.change(filter, { target: { value: 'vendor' } })
    expect(screen.getByText('Vendor Knowledge Center')).toBeInTheDocument()

    fireEvent.change(filter, { target: { value: '' } })
    await waitFor(() => {
      expect(screen.queryByText('Vendor Knowledge Center')).not.toBeInTheDocument()
    })
  })

  it('a sub-group toggle collapses its own items independently of the others', () => {
    renderWithProviders(<Sidebar />)
    fireEvent.click(screen.getByText(/Enterprise Ecosystem/))
    expect(screen.getByText('Vendor Knowledge Center')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Vendor & Threat Intel'))
    expect(screen.queryByText('Vendor Knowledge Center')).not.toBeInTheDocument()
    expect(screen.getByText('Developer Playbooks')).toBeInTheDocument()
  })
})
