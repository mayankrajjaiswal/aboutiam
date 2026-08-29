import { describe, it, expect } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import WorkloadIdentityFederation from '../../src/pages/Playgrounds/WorkloadIdentityFederation'

describe('WorkloadIdentityFederation page', () => {
  it('renders correctly and defaults to GitHub Actions to AWS', () => {
    renderWithProviders(<WorkloadIdentityFederation />)
    expect(screen.getByRole('heading', { name: /Workload Identity Federation & OIDC Visualizer/i })).toBeInTheDocument()
    expect(screen.getByText(/GitHub Actions deploying to AWS/i)).toBeInTheDocument()
  })

  it('allows toggling attack parameters and stepping through exchange', async () => {
    renderWithProviders(<WorkloadIdentityFederation />)

    // Toggle Malicious Branch Push
    const attackCheckbox = screen.getAllByRole('checkbox')[0]
    fireEvent.click(attackCheckbox)

    // Run the first step
    const stepBtn = screen.getByText(/Step 1: Mint OIDC Identity Token/i)
    fireEvent.click(stepBtn)

    await waitFor(() => {
      expect(screen.getByText(/OIDC JWT successfully minted/i)).toBeInTheDocument()
      expect(screen.getByText(/CIPELINE MINTED OIDC ID TOKEN/i)).toBeInTheDocument()
    })
  })
})
