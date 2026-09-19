import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { axe } from 'jest-axe'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import AttestationPolicyLab from '../../src/pages/Playgrounds/AttestationPolicyLab'
import { REGISTRATION_ATTEMPTS } from '../../src/data/attestationPolicyScenarios'

describe('AttestationPolicyLab playground', () => {
  it('renders the title and policy authoring controls', () => {
    renderWithProviders(<AttestationPolicyLab />)
    expect(screen.getByRole('heading', { name: /aaguid & attestation policy lab/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/minimum certification level/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/minimum attestation conveyance/i)).toBeInTheDocument()
  })

  it('running the default policy shows results for all 8 attempts', () => {
    renderWithProviders(<AttestationPolicyLab />)
    fireEvent.click(screen.getByRole('button', { name: /run policy against registration attempts/i }))
    const uniqueVendorModels = new Set(REGISTRATION_ATTEMPTS.map((a) => a.vendorModel))
    for (const vendorModel of uniqueVendorModels) {
      expect(screen.getAllByText(vendorModel).length).toBeGreaterThan(0)
    }
    expect(screen.getByText(/policy accuracy/i)).toBeInTheDocument()
  })

  it('setting minimum certification to L3 rejects lower-certified attempts that would otherwise be accepted', () => {
    const { container } = renderWithProviders(<AttestationPolicyLab />)
    fireEvent.change(screen.getByLabelText(/minimum certification level/i), { target: { value: 'L3' } })
    fireEvent.click(screen.getByRole('button', { name: /run policy against registration attempts/i }))
    // Every L2-certified attempt ("Acme SecureKey Pro") should now render "Reject"
    // under an L3-minimum policy. Scope strictly to result cards (identified by the
    // "Policy verdict:" label unique to that markup) to avoid matching the
    // trace-terminal's own log lines, which repeat the same vendor name as text.
    const resultCards = Array.from(container.querySelectorAll('div')).filter(
      (el) => el.textContent?.includes('Policy verdict:') && el.textContent?.includes('Acme SecureKey Pro'),
    )
    expect(resultCards.length).toBeGreaterThan(0)
    for (const card of resultCards) {
      expect(card.textContent).toContain('Reject')
    }
  })

  it('setting minimum certification to uncertified accepts everything regardless of real-world expectation', () => {
    renderWithProviders(<AttestationPolicyLab />)
    fireEvent.change(screen.getByLabelText(/minimum certification level/i), { target: { value: 'uncertified' } })
    fireEvent.change(screen.getByLabelText(/minimum attestation conveyance/i), { target: { value: 'none' } })
    const userVerCheckbox = screen.getByLabelText(/require user verification/i)
    if ((userVerCheckbox as HTMLInputElement).checked) fireEvent.click(userVerCheckbox)
    fireEvent.click(screen.getByRole('button', { name: /run policy against registration attempts/i }))
    expect(screen.getByText(/policy accuracy/i)).toBeInTheDocument()
  })

  it('reveals a hint and reflects the score penalty', () => {
    renderWithProviders(<AttestationPolicyLab />)
    expect(screen.getByText(/100 \/ 100/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /reveal next hint/i }))
    expect(screen.getByText(/85 \/ 100/i)).toBeInTheDocument()
  })

  it('resets the playground state', () => {
    renderWithProviders(<AttestationPolicyLab />)
    fireEvent.click(screen.getByRole('button', { name: /run policy against registration attempts/i }))
    expect(screen.getByText(/policy accuracy/i)).toBeInTheDocument()
    fireEvent.click(screen.getByTitle(/reset simulator/i))
    expect(screen.queryByText(/policy accuracy/i)).not.toBeInTheDocument()
  })

  it('links to the WebAuthn decoder tool', () => {
    renderWithProviders(<AttestationPolicyLab />)
    const link = screen.getByText(/decode a sample webauthn attestation object/i).closest('a')
    expect(link).toHaveAttribute('href', '/tools/webauthn-decoder')
  })

  it('has no critical axe violations before running the evaluation', async () => {
    const { container } = renderWithProviders(<AttestationPolicyLab />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has no critical axe violations after running the evaluation', async () => {
    const { container } = renderWithProviders(<AttestationPolicyLab />)
    fireEvent.click(screen.getByRole('button', { name: /run policy against registration attempts/i }))
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
