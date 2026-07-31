import { describe, it, expect } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import { signCertificate } from '../../src/lib/career/certificateSigner'
import CertificateVerifier from '../../src/pages/Tools/CertificateVerifier'

describe('CertificateVerifier page', () => {
  it('verifies a genuine certificate as valid', async () => {
    const signed = await signCertificate({
      recipientName: 'Ada Lovelace',
      completedModuleCount: 24,
      totalModuleCount: 36,
      completedLabCount: 8,
      issuedOn: '2026-07-31',
      certificateId: 'cert-0001',
    })

    renderWithProviders(<CertificateVerifier />)
    fireEvent.change(screen.getByLabelText(/paste certificate json/i), { target: { value: JSON.stringify(signed) } })
    fireEvent.click(screen.getByRole('button', { name: /verify certificate/i }))

    await waitFor(() => {
      expect(screen.getByText(/signature valid/i)).toBeInTheDocument()
    })
    expect(screen.getByText(/claimed: ada lovelace/i)).toBeInTheDocument()
  })

  it('flags a tampered certificate as invalid', async () => {
    const signed = await signCertificate({
      recipientName: 'Ada Lovelace',
      completedModuleCount: 24,
      totalModuleCount: 36,
      completedLabCount: 8,
      issuedOn: '2026-07-31',
      certificateId: 'cert-0001',
    })
    const tampered = { ...signed, payload: { ...signed.payload, completedModuleCount: 36 } }

    renderWithProviders(<CertificateVerifier />)
    fireEvent.change(screen.getByLabelText(/paste certificate json/i), { target: { value: JSON.stringify(tampered) } })
    fireEvent.click(screen.getByRole('button', { name: /verify certificate/i }))

    await waitFor(() => {
      expect(screen.getByText(/signature invalid/i)).toBeInTheDocument()
    })
  })

  it('flags malformed input instead of throwing', async () => {
    renderWithProviders(<CertificateVerifier />)
    fireEvent.change(screen.getByLabelText(/paste certificate json/i), { target: { value: 'not json at all' } })
    fireEvent.click(screen.getByRole('button', { name: /verify certificate/i }))

    await waitFor(() => {
      expect(screen.getByText(/malformed input/i)).toBeInTheDocument()
    })
  })

  it('disables the verify button when the input is empty', () => {
    renderWithProviders(<CertificateVerifier />)
    expect(screen.getByRole('button', { name: /verify certificate/i })).toBeDisabled()
  })

  it('states the honesty caveat about not being unforgeable', () => {
    renderWithProviders(<CertificateVerifier />)
    expect(screen.getByText(/cannot prove the certificate is/i)).toBeInTheDocument()
  })
})
