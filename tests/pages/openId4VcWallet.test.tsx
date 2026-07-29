import { describe, it, expect } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import OpenId4VcWallet from '../../src/pages/Playgrounds/OpenId4VcWallet'
import { OPENID4VC_SCENARIOS } from '../../src/data/openId4VcScenarios'

const mdlScenario = OPENID4VC_SCENARIOS.find((s) => s.id === 'mdl-age-check')!

async function issueCredential() {
  fireEvent.click(screen.getByRole('button', { name: /issue credential/i }))
  await waitFor(() => {
    expect(screen.getByText(/re-issue credential/i)).toBeInTheDocument()
  })
}

describe('OpenId4VcWallet page', () => {
  it('renders the heading and scenario selector', () => {
    renderWithProviders(<OpenId4VcWallet />)
    expect(screen.getByRole('heading', { name: /openid4vc wallet studio/i })).toBeInTheDocument()
    expect(screen.getByText(mdlScenario.title)).toBeInTheDocument()
  })

  it('issuing a credential shows the compact SD-JWT and lists every claim in the wallet step', async () => {
    renderWithProviders(<OpenId4VcWallet />)
    await issueCredential()

    fireEvent.click(screen.getByRole('button', { name: /2\. wallet storage/i }))
    for (const claimName of Object.keys(mdlScenario.issuedClaims)) {
      expect(screen.getByText(claimName)).toBeInTheDocument()
    }
  })

  it('a minimal, correct presentation reveals exactly the requested claim and nothing else', async () => {
    renderWithProviders(<OpenId4VcWallet />)
    await issueCredential()

    fireEvent.click(screen.getByRole('button', { name: /2\. wallet storage/i }))
    // Default scenario (mdl-age-check) requests only "age_over_21" — uncheck every other claim
    for (const claimName of Object.keys(mdlScenario.issuedClaims)) {
      if (!mdlScenario.requestedClaims.includes(claimName)) {
        const row = screen.getByText(claimName).closest('label')!
        fireEvent.click(row.querySelector('input[type="checkbox"]')!)
      }
    }

    fireEvent.click(screen.getByRole('button', { name: /3\. presentation/i }))
    fireEvent.click(screen.getByRole('button', { name: /send presentation to verifier/i }))

    await waitFor(() => {
      expect(screen.getByText(/— received/i)).toBeInTheDocument()
    })
    expect(screen.queryByText(/over-disclosed/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/missing!/i)).not.toBeInTheDocument()
  })

  it('the verifier flags over-disclosure when the wallet reveals a claim it never asked for', async () => {
    renderWithProviders(<OpenId4VcWallet />)
    await issueCredential()

    // Leave every claim checked (default) and present directly — over-discloses everything not requested
    fireEvent.click(screen.getByRole('button', { name: /3\. presentation/i }))
    fireEvent.click(screen.getByRole('button', { name: /send presentation to verifier/i }))

    await waitFor(() => {
      expect(screen.getAllByText(/over-disclosed/i).length).toBeGreaterThan(0)
    })
  })

  it('the verifier flags a missing claim when the wallet withholds something it was asked for', async () => {
    renderWithProviders(<OpenId4VcWallet />)
    await issueCredential()

    fireEvent.click(screen.getByRole('button', { name: /2\. wallet storage/i }))
    // Uncheck the one requested claim ("age_over_21") so the verifier never receives it
    const row = screen.getByText('age_over_21').closest('label')!
    fireEvent.click(row.querySelector('input[type="checkbox"]')!)

    fireEvent.click(screen.getByRole('button', { name: /3\. presentation/i }))
    fireEvent.click(screen.getByRole('button', { name: /send presentation to verifier/i }))

    await waitFor(() => {
      expect(screen.getByText(/missing!/i)).toBeInTheDocument()
    })
  })

  it('never leaks a withheld claim value into the trace log', async () => {
    renderWithProviders(<OpenId4VcWallet />)
    await issueCredential()

    fireEvent.click(screen.getByRole('button', { name: /2\. wallet storage/i }))
    for (const claimName of Object.keys(mdlScenario.issuedClaims)) {
      if (!mdlScenario.requestedClaims.includes(claimName)) {
        const row = screen.getByText(claimName).closest('label')!
        fireEvent.click(row.querySelector('input[type="checkbox"]')!)
      }
    }

    fireEvent.click(screen.getByRole('button', { name: /3\. presentation/i }))
    fireEvent.click(screen.getByRole('button', { name: /send presentation to verifier/i }))

    await waitFor(() => {
      expect(screen.getByText(/— received/i)).toBeInTheDocument()
    })

    // The withheld raw birthdate must never appear anywhere on the page (log or presentation preview)
    expect(screen.queryByText(/1998-04-12/)).not.toBeInTheDocument()
    expect(screen.queryByText(/221B Baker Street/)).not.toBeInTheDocument()
  })
})
