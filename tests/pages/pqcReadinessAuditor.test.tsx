import { describe, it, expect } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import PqcReadinessAuditor from '../../src/pages/Tools/PqcReadinessAuditor'

describe('PqcReadinessAuditor page', () => {
  it('renders the heading and flags the default EC certificate sample as Critical', async () => {
    renderWithProviders(<PqcReadinessAuditor />)
    expect(screen.getByRole('heading', { name: /pqc readiness auditor/i })).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.getAllByText(/critical/i).length).toBeGreaterThan(0)
    })
  })

  it('loading the JWKS sample flags the classical RSA/EC keys but not the PQC key', async () => {
    renderWithProviders(<PqcReadinessAuditor />)
    fireEvent.click(screen.getByRole('button', { name: /load jwks sample/i }))
    await waitFor(() => {
      expect(screen.getByText('legacy-rsa-signing-key')).toBeInTheDocument()
      expect(screen.getByText('legacy-ec-signing-key')).toBeInTheDocument()
    })
    expect(screen.queryByText('pqc-hybrid-signing-key')).not.toBeInTheDocument()
  })

  it('loading the cipher-suite sample flags the classical suites and shows the handshake size comparison', async () => {
    renderWithProviders(<PqcReadinessAuditor />)
    fireEvent.click(screen.getByRole('button', { name: /load cipher-suite sample/i }))
    await waitFor(() => {
      expect(screen.getAllByText(/TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256/).length).toBeGreaterThan(0)
    })
    expect(screen.getByText(/handshake size growth/i)).toBeInTheDocument()
  })

  it('clearing the input shows the empty-state prompt instead of a report', async () => {
    renderWithProviders(<PqcReadinessAuditor />)
    const clearButton = screen.getByTitle('Clear')
    fireEvent.click(clearButton)
    await waitFor(() => {
      expect(screen.getByText(/paste an input above/i)).toBeInTheDocument()
    })
  })

  it('pasting an unrecognized payload shows the unrecognized-input message', async () => {
    renderWithProviders(<PqcReadinessAuditor />)
    const textarea = screen.getByLabelText(/certificate, jwks, or cipher-suite input/i)
    fireEvent.change(textarea, { target: { value: 'this is not a recognizable crypto payload' } })
    await waitFor(() => {
      expect(screen.getByText(/could not recognize this input/i)).toBeInTheDocument()
    })
  })
})
