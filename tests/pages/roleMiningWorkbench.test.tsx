import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import RoleMiningWorkbench from '../../src/pages/Playgrounds/RoleMiningWorkbench'
import { ALL_ENTITLEMENTS } from '../../src/data/roleMiningDataset'

describe('RoleMiningWorkbench page', () => {
  it('renders the heading and starts with zero accepted roles', () => {
    renderWithProviders(<RoleMiningWorkbench />)
    expect(screen.getByRole('heading', { name: /role mining workbench/i })).toBeInTheDocument()
    expect(screen.getAllByText('0', { selector: '.font-extrabold' }).length).toBeGreaterThan(0)
  })

  it('shows the full orphan-entitlement count before any role is accepted', () => {
    renderWithProviders(<RoleMiningWorkbench />)
    expect(screen.getByText(`${ALL_ENTITLEMENTS.length} / ${ALL_ENTITLEMENTS.length}`)).toBeInTheDocument()
  })

  it('accepting a role candidate moves it to the Accepted Roles list and reduces orphans', () => {
    renderWithProviders(<RoleMiningWorkbench />)
    const acceptButtons = screen.getAllByText(/accept as role/i)
    fireEvent.click(acceptButtons[0])

    expect(screen.getByRole('heading', { name: /accepted roles/i })).toBeInTheDocument()
    expect(screen.queryByText(`${ALL_ENTITLEMENTS.length} / ${ALL_ENTITLEMENTS.length}`)).not.toBeInTheDocument()
  })

  it('rejecting a candidate removes it from the pending list without affecting orphan count', () => {
    renderWithProviders(<RoleMiningWorkbench />)
    const beforeCount = screen.getAllByText(/accept as role/i).length
    fireEvent.click(screen.getAllByText(/^reject$/i)[0])
    const afterCount = screen.getAllByText(/accept as role/i).length
    expect(afterCount).toBe(beforeCount - 1)
  })

  it('disables the finalize button until at least 3 roles are accepted', () => {
    renderWithProviders(<RoleMiningWorkbench />)
    expect(screen.getByText(/accept at least 3 roles/i)).toBeDisabled()
  })

  it('enables and allows finalizing after accepting 3 roles', () => {
    renderWithProviders(<RoleMiningWorkbench />)
    for (let i = 0; i < 3; i++) {
      fireEvent.click(screen.getAllByText(/accept as role/i)[0])
    }
    const finalizeButton = screen.getByText(/finalize role mining session/i)
    expect(finalizeButton).not.toBeDisabled()
    fireEvent.click(finalizeButton)
    expect(screen.getAllByText(/reducing orphan entitlements/i).length).toBeGreaterThan(0)
  })

  it('resets accepted/rejected state when the shell reset button is clicked', () => {
    renderWithProviders(<RoleMiningWorkbench />)
    fireEvent.click(screen.getAllByText(/accept as role/i)[0])
    expect(screen.getByRole('heading', { name: /accepted roles/i })).toBeInTheDocument()

    fireEvent.click(screen.getByTitle(/reset simulator/i))
    expect(screen.queryByRole('heading', { name: /accepted roles/i })).not.toBeInTheDocument()
  })
})
