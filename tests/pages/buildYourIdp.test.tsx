import { describe, it, expect } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import BuildYourIdp from '../../src/pages/Playgrounds/BuildYourIdp'
import { verifyJwtRsa } from '../../src/lib/tools/jwt'

async function generateKeys() {
  fireEvent.click(screen.getByRole('button', { name: /generate rs256 keypair/i }))
  await waitFor(() => {
    expect(screen.getByText(/regenerate keypair/i)).toBeInTheDocument()
  })
}

describe('BuildYourIdp page', () => {
  it('renders the wizard step tabs and starts on Step 1', () => {
    renderWithProviders(<BuildYourIdp />)
    expect(screen.getByRole('heading', { name: /build-your-own-idp sandbox/i })).toBeInTheDocument()
    expect(screen.getByText(/Step 1 — Generate Signing Keys/i)).toBeInTheDocument()
  })

  it('generates a keypair and shows the public key as PEM and JWK', async () => {
    renderWithProviders(<BuildYourIdp />)
    await generateKeys()
    expect(screen.getByText(/-----BEGIN PUBLIC KEY-----/)).toBeInTheDocument()
    expect(screen.getByText(/"kty": "RSA"/)).toBeInTheDocument()
  })

  it('the discovery document reflects the configured issuer URL and scopes', async () => {
    renderWithProviders(<BuildYourIdp />)
    fireEvent.click(screen.getByRole('button', { name: /2\. discovery document/i }))

    const issuerInput = screen.getByDisplayValue('https://demo-idp.aboutiam.local')
    fireEvent.change(issuerInput, { target: { value: 'https://custom-issuer.example' } })

    const discoveryPreview = screen.getByText(/"issuer": "https:\/\/custom-issuer.example"/)
    expect(discoveryPreview).toBeInTheDocument()

    // Unchecking "email" should remove it from scopes_supported in the live preview
    fireEvent.click(screen.getByRole('checkbox', { name: /email/i }))
    expect(screen.queryByText(/"scopes_supported": \[\s*"openid",\s*"profile",\s*"email"/)).not.toBeInTheDocument()
  })

  it('the consent screen preview only lists scopes flagged as requiring consent', async () => {
    renderWithProviders(<BuildYourIdp />)
    fireEvent.click(screen.getByRole('button', { name: /4\. consent screen/i }))

    // Default: only "email" requires consent
    expect(screen.getByText(/is requesting:/i)).toBeInTheDocument()
    const previewList = screen.getByTestId('consent-preview-list')
    expect(previewList.textContent).toContain('email')
    expect(previewList.textContent).not.toContain('profile')

    // Flip "profile" on and "email" off
    fireEvent.click(screen.getByRole('checkbox', { name: /require consent for profile/i }))
    fireEvent.click(screen.getByRole('checkbox', { name: /require consent for email/i }))

    const updatedPreview = screen.getByTestId('consent-preview-list')
    expect(updatedPreview.textContent).toContain('profile')
    expect(updatedPreview.textContent).not.toContain('email')
  })

  it('running the flow mints an ID token that verifies against the session\'s own keypair, and exposes a JWT Decoder deep link', async () => {
    renderWithProviders(<BuildYourIdp />)
    await generateKeys()

    fireEvent.click(screen.getByRole('button', { name: /5\. run it/i }))
    fireEvent.click(screen.getByRole('button', { name: /run authorization code \+ pkce flow/i }))

    await waitFor(() => {
      expect(screen.getByText(/ID token signature verified against the JWKS/i)).toBeInTheDocument()
    })

    const decoderLink = screen.getByRole('link', { name: /send to jwt decoder/i })
    const token = decoderLink.getAttribute('href')!.replace('/tools/jwt-decoder?token=', '')
    expect(token.split('.')).toHaveLength(3)
  })

  it('a minted ID token fails verification against a different keypair (sanity check on the crypto, not just the UI flag)', async () => {
    renderWithProviders(<BuildYourIdp />)
    await generateKeys()
    fireEvent.click(screen.getByRole('button', { name: /5\. run it/i }))
    fireEvent.click(screen.getByRole('button', { name: /run authorization code \+ pkce flow/i }))

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /send to jwt decoder/i })).toBeInTheDocument()
    })

    const decoderLink = screen.getByRole('link', { name: /send to jwt decoder/i })
    const token = decoderLink.getAttribute('href')!.replace('/tools/jwt-decoder?token=', '')

    const { generateRsaKeyPair } = await import('../../src/lib/tools/jwt')
    const unrelatedKeyPair = await generateRsaKeyPair()
    expect(await verifyJwtRsa(token, unrelatedKeyPair.publicKey)).toBe(false)
  })

  it('disables Run It until a keypair has been generated', () => {
    renderWithProviders(<BuildYourIdp />)
    fireEvent.click(screen.getByRole('button', { name: /5\. run it/i }))
    expect(screen.getByRole('button', { name: /generate keys in step 1 first/i })).toBeDisabled()
  })

  it('captures request/response packet frames when the flow runs, viewable via the Packet Capture drawer', async () => {
    renderWithProviders(<BuildYourIdp />)
    await generateKeys()
    fireEvent.click(screen.getByRole('button', { name: /5\. run it/i }))
    fireEvent.click(screen.getByRole('button', { name: /run authorization code \+ pkce flow/i }))

    await waitFor(() => {
      expect(screen.getAllByText(/ID token signature verified/i).length).toBeGreaterThan(0)
    })

    fireEvent.click(screen.getByTitle(/toggle packet capture/i))
    expect(screen.getByText(/Packet Capture \(4\)/i)).toBeInTheDocument()
  })
})
