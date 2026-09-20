import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { axe } from 'jest-axe'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import CredentialIssuanceStudio from '../../src/pages/Playgrounds/CredentialIssuanceStudio'
import { OPENID4VC_SCENARIOS } from '../../src/data/openId4VcScenarios'

describe('CredentialIssuanceStudio playground', () => {
  it('renders the title and credential type selector', () => {
    renderWithProviders(<CredentialIssuanceStudio />)
    expect(screen.getByRole('heading', { name: /credential issuance studio/i })).toBeInTheDocument()
    const select = screen.getByLabelText(/select a credential type to issue/i) as HTMLSelectElement
    for (const s of OPENID4VC_SCENARIOS) {
      expect(select.querySelector(`option[value="${s.id}"]`)).toBeTruthy()
    }
  })

  it('full lifecycle: issue -> verify -> revoke, with the revoke button initially disabled', () => {
    renderWithProviders(<CredentialIssuanceStudio />)
    const revokeButton = screen.getByRole('button', { name: /revoke credential/i })
    expect(revokeButton).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: /issue to wallet/i }))
    expect(screen.getAllByText(/issues.*via openid4vci/i).length).toBeGreaterThan(0)

    const verifyButton = screen.getByRole('button', { name: /verify presentation/i })
    expect(verifyButton).not.toBeDisabled()
    fireEvent.click(verifyButton)
    expect(screen.getAllByText(/verifies the presentation via openid4vp/i).length).toBeGreaterThan(0)

    expect(revokeButton).not.toBeDisabled()
    fireEvent.click(revokeButton)
    expect(screen.getAllByText(/updates the status list, marking this credential revoked/i).length).toBeGreaterThan(0)
  })

  it('issuing without holder binding warns about the presentation risk', () => {
    renderWithProviders(<CredentialIssuanceStudio />)
    fireEvent.click(screen.getByLabelText(/require holder-binding proof/i))
    fireEvent.click(screen.getByRole('button', { name: /issue to wallet/i }))
    expect(screen.getAllByText(/this credential can be presented by anyone/i).length).toBeGreaterThan(0)
  })

  it('attempting to revoke without a status list configured fails with an explanation', () => {
    renderWithProviders(<CredentialIssuanceStudio />)
    fireEvent.click(screen.getByLabelText(/enable status-list revocation/i))
    fireEvent.click(screen.getByRole('button', { name: /issue to wallet/i }))
    fireEvent.click(screen.getByRole('button', { name: /verify presentation/i }))
    fireEvent.click(screen.getByRole('button', { name: /revoke credential/i }))
    expect(screen.getAllByText(/this credential cannot be revoked/i).length).toBeGreaterThan(0)
  })

  it('switching credential type resets the lifecycle stage', () => {
    renderWithProviders(<CredentialIssuanceStudio />)
    fireEvent.click(screen.getByRole('button', { name: /issue to wallet/i }))
    expect(screen.getByRole('button', { name: /verify presentation/i })).not.toBeDisabled()

    const secondScenario = OPENID4VC_SCENARIOS[1]
    fireEvent.change(screen.getByLabelText(/select a credential type to issue/i), { target: { value: secondScenario.id } })
    expect(screen.getByRole('button', { name: /verify presentation/i })).toBeDisabled()
  })

  it('links to the crypto agility root-of-trust tab', () => {
    renderWithProviders(<CredentialIssuanceStudio />)
    const link = screen.getByText(/hardware root-of-trust protection/i).closest('a')
    expect(link).toHaveAttribute('href', '/next-gen/crypto-agility?tab=root-of-trust')
  })

  it('reveals a hint and reflects the score penalty', () => {
    renderWithProviders(<CredentialIssuanceStudio />)
    expect(screen.getByText(/100 \/ 100/i)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /reveal next hint/i }))
    expect(screen.getByText(/85 \/ 100/i)).toBeInTheDocument()
  })

  it('resets the playground state', () => {
    renderWithProviders(<CredentialIssuanceStudio />)
    fireEvent.click(screen.getByRole('button', { name: /issue to wallet/i }))
    expect(screen.getByRole('button', { name: /verify presentation/i })).not.toBeDisabled()
    fireEvent.click(screen.getByTitle(/reset simulator/i))
    expect(screen.getByRole('button', { name: /verify presentation/i })).toBeDisabled()
  })

  it('has no critical axe violations at the define stage', async () => {
    const { container } = renderWithProviders(<CredentialIssuanceStudio />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('has no critical axe violations after a full issue-verify-revoke cycle', async () => {
    const { container } = renderWithProviders(<CredentialIssuanceStudio />)
    fireEvent.click(screen.getByRole('button', { name: /issue to wallet/i }))
    fireEvent.click(screen.getByRole('button', { name: /verify presentation/i }))
    fireEvent.click(screen.getByRole('button', { name: /revoke credential/i }))
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
