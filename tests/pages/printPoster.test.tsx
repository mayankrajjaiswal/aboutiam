import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import PrintablePoster from '../../src/pages/Tools/PrintablePoster'

describe('PrintablePoster tool page', () => {
  it('renders the poster with all required identity controls and sections', () => {
    renderWithProviders(<PrintablePoster />)
    
    // Check main headers
    expect(screen.getByText(/Identity & Access Management Security Controls/i)).toBeInTheDocument()
    
    // Check standard columns
    expect(screen.getByText(/1. OAuth 2.1 Flow/i)).toBeInTheDocument()
    expect(screen.getByText(/2. JWT Validation/i)).toBeInTheDocument()
    expect(screen.getByText(/3. SAML & Attestation/i)).toBeInTheDocument()
    
    // Check buttons
    expect(screen.getByRole('button', { name: /Print Poster/i })).toBeInTheDocument()
  })
})
