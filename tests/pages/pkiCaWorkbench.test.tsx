import { describe, it, expect } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import PkiCaWorkbench from '../../src/pages/Tools/PkiCaWorkbench'

describe('PkiCaWorkbench page', () => {
  it('renders correctly and has PKI generate buttons', async () => {
    renderWithProviders(<PkiCaWorkbench />)
    expect(screen.getByRole('heading', { name: /Web Crypto PKI Certificate Authority/i })).toBeInTheDocument()
    
    const generateRootBtn = screen.getByText(/Generate & Self-Sign Root CA/i)
    expect(generateRootBtn).toBeInTheDocument()
  })

  it('can generate a Root CA successfully', async () => {
    renderWithProviders(<PkiCaWorkbench />)
    const generateRootBtn = screen.getByText(/Generate & Self-Sign Root CA/i)
    
    fireEvent.click(generateRootBtn)
    
    await waitFor(() => {
      expect(screen.getByText(/Reset Root CA/i)).toBeInTheDocument()
    })
  })
})
