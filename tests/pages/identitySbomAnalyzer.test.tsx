import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import IdentitySbomAnalyzer from '../../src/pages/Tools/IdentitySbomAnalyzer'

describe('IdentitySbomAnalyzer page', () => {
  it('shows an empty-state prompt before any input is entered', () => {
    renderWithProviders(<IdentitySbomAnalyzer />)
    expect(screen.getByText(/paste a manifest above/i)).toBeInTheDocument()
  })

  it('loading the sample manifest produces a categorized report with CVE deep links', () => {
    renderWithProviders(<IdentitySbomAnalyzer />)
    fireEvent.click(screen.getByRole('button', { name: /load sample/i }))

    expect(screen.getByText(/identity sbom report/i)).toBeInTheDocument()
    expect(screen.getByText('jsonwebtoken')).toBeInTheDocument()
    expect(screen.getByText('node-samlify')).toBeInTheDocument()

    const cveLink = screen.getByRole('link', { name: /CVE-2022-23529/i })
    expect(cveLink).toHaveAttribute('href', '/research?cve=CVE-2022-23529')
  })

  it('does not flag an unknown package pasted alongside a risky one', () => {
    renderWithProviders(<IdentitySbomAnalyzer />)
    const textarea = screen.getByLabelText(/dependency manifest/i)
    fireEvent.change(textarea, { target: { value: 'jsonwebtoken@8.5.1, totally-made-up-package@1.0.0' } })

    expect(screen.getByText('jsonwebtoken')).toBeInTheDocument()
    expect(screen.queryByText('totally-made-up-package')).not.toBeInTheDocument()
  })

  it('shows the no-findings state for a manifest with no risky matches', () => {
    renderWithProviders(<IdentitySbomAnalyzer />)
    const textarea = screen.getByLabelText(/dependency manifest/i)
    fireEvent.change(textarea, { target: { value: 'express@4.18.2, lodash@4.17.21' } })

    expect(screen.getByText(/no known auth-relevant risky dependencies detected/i)).toBeInTheDocument()
  })

  it('does not flag a patched version', () => {
    renderWithProviders(<IdentitySbomAnalyzer />)
    const textarea = screen.getByLabelText(/dependency manifest/i)
    fireEvent.change(textarea, { target: { value: 'jsonwebtoken@9.0.0' } })

    expect(screen.getByText(/no known auth-relevant risky dependencies detected/i)).toBeInTheDocument()
  })

  it('clears the input and report when Clear is clicked', () => {
    renderWithProviders(<IdentitySbomAnalyzer />)
    fireEvent.click(screen.getByRole('button', { name: /load sample/i }))
    expect(screen.getByText(/identity sbom report/i)).toBeInTheDocument()

    fireEvent.click(screen.getByTitle(/clear/i))
    expect(screen.getByText(/paste a manifest above/i)).toBeInTheDocument()
  })
})
