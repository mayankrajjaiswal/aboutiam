import { describe, it, expect } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import CloudPolicyEvaluator from '../../src/pages/Playgrounds/CloudPolicyEvaluator'

describe('CloudPolicyEvaluator page', () => {
  it('renders correctly and lets user view overlapping SCP and IAM policies', () => {
    renderWithProviders(<CloudPolicyEvaluator />)
    expect(screen.getByRole('heading', { name: /Multi-Cloud Overlapping IAM Policy Evaluator/i })).toBeInTheDocument()
    expect(screen.getAllByText(/Organization SCP/i).length).toBeGreaterThan(0)
  })

  it('evaluates and shows outcomes for selected actions', async () => {
    renderWithProviders(<CloudPolicyEvaluator />)

    // Trigger policy evaluation
    const evaluateBtn = screen.getByRole('button', { name: /Evaluate Policies/i })
    fireEvent.click(evaluateBtn)

    await waitFor(() => {
      expect(screen.getByText(/Request APPROVED! Access was granted/i)).toBeInTheDocument()
    })
  })
})
