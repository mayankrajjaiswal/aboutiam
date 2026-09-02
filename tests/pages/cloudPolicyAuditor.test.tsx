import { describe, it, expect } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import CloudPolicyAuditor from '../../src/pages/Tools/CloudPolicyAuditor'

describe('CloudPolicyAuditor page', () => {
  it('renders correctly and has a policy scan button', async () => {
    renderWithProviders(<CloudPolicyAuditor />)
    expect(screen.getByRole('heading', { name: /Configure Access Policy/i })).toBeInTheDocument()
    
    const scanBtn = screen.getByRole('button', { name: /Run Static Compliance Scan/i })
    expect(scanBtn).toBeInTheDocument()
  })

  it('can scan a policy and show findings', async () => {
    renderWithProviders(<CloudPolicyAuditor />)
    const scanBtn = screen.getByRole('button', { name: /Run Static Compliance Scan/i })
    
    fireEvent.click(scanBtn)
    
    await waitFor(() => {
      expect(screen.getByText(/Wildcard Action Scope Detected/i)).toBeInTheDocument()
      expect(screen.getByText(/Hardened Least-Privilege Policy/i)).toBeInTheDocument()
    })
  })
})
