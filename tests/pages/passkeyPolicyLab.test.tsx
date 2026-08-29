import { describe, it, expect } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import PasskeyPolicyLab from '../../src/pages/Playgrounds/PasskeyPolicyLab'

describe('PasskeyPolicyLab page', () => {
  it('renders correctly with default policy configs', () => {
    renderWithProviders(<PasskeyPolicyLab />)
    expect(screen.getByRole('heading', { name: /Advanced Passkey Policy & Attestation Workbench/i })).toBeInTheDocument()
    expect(screen.getByText(/Require Resident Key/i)).toBeInTheDocument()
  })

  it('can select policy requirements and trigger device registration', async () => {
    renderWithProviders(<PasskeyPolicyLab />)

    // Toggle the first checkbox (Resident Key)
    const checkboxes = screen.getAllByRole('checkbox')
    fireEvent.click(checkboxes[0])

    // Select Windows Hello and click register
    const windowsHelloBtn = screen.getAllByRole('button', { name: /Register Authenticator/i })[1]
    fireEvent.click(windowsHelloBtn)

    await waitFor(() => {
      expect(screen.getByText(/Initiating WebAuthn registration/i)).toBeInTheDocument()
    })
  })
})
