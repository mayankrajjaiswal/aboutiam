import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import CiemExplorer from '../../src/pages/Playgrounds/CiemExplorer'

describe('CiemExplorer page', () => {
  it('renders the heading and flags the direct toxic combination by default', () => {
    renderWithProviders(<CiemExplorer />)
    expect(screen.getByRole('heading', { name: /cloud entitlement graph explorer/i })).toBeInTheDocument()
    expect(screen.getByText(/toxic combinations detected/i)).toBeInTheDocument()
  })

  it('clicking the toxic role shows granted permissions and the toxic warning', () => {
    renderWithProviders(<CiemExplorer />)
    fireEvent.click(screen.getByTestId('ciem-node-dev-role'))
    expect(screen.getByText(/this role has a toxic combination reachable/i)).toBeInTheDocument()
    expect(screen.getByText(/granted permissions:/i)).toBeInTheDocument()
  })

  it('toggling effective permissions on the cross-account scenario reveals the chained permission', () => {
    renderWithProviders(<CiemExplorer />)
    fireEvent.click(screen.getByRole('button', { name: 'Cross-Account Toxic Combination' }))
    fireEvent.click(screen.getByTestId('ciem-node-readonly-role'))
    // Granted-only view: the role's own policy has no iam:PassRole.
    expect(screen.getByText((_, el) => el?.textContent === 'Granted Permissions: lambda:CreateFunction')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /showing granted permissions only/i }))
    // Effective view: assuming audit-role via CanAssume pulls in iam:PassRole too.
    expect(screen.getByText((_, el) => el?.textContent === 'Effective Permissions: lambda:CreateFunction, iam:PassRole')).toBeInTheDocument()
  })

  it('the clean scenario shows no toxic combination for its role', () => {
    renderWithProviders(<CiemExplorer />)
    fireEvent.click(screen.getByRole('button', { name: 'Clean, Least-Privilege Role' }))
    fireEvent.click(screen.getByTestId('ciem-node-reporting-role'))
    expect(screen.getByText(/no toxic combination reachable/i)).toBeInTheDocument()
  })

  it('shrinking to least privilege narrows the granted permission list', () => {
    renderWithProviders(<CiemExplorer />)
    fireEvent.click(screen.getByTestId('ciem-node-dev-role'))
    fireEvent.click(screen.getByRole('button', { name: /shrink to least privilege/i }))
    expect(screen.getAllByText(/shrunk "dev-role" to least privilege/i).length).toBeGreaterThan(0)
  })
})
