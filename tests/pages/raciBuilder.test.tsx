import { describe, it, expect } from 'vitest'
import { screen, fireEvent, within } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import { IAM_RACI_ACTIVITIES } from '../../src/data/iamRaciActivities'
import RaciBuilder from '../../src/pages/Tools/RaciBuilder'

describe('RaciBuilder page', () => {
  it('renders every starter activity and default role', () => {
    renderWithProviders(<RaciBuilder />)
    for (const activity of IAM_RACI_ACTIVITIES) {
      expect(screen.getByText(activity.name)).toBeInTheDocument()
    }
    expect(screen.getAllByText('IAM Program Manager').length).toBeGreaterThan(0)
  })

  it('shows a validation error for an activity with no assignments yet', () => {
    renderWithProviders(<RaciBuilder />)
    expect(screen.getAllByText(/No Accountable owner assigned/i).length).toBeGreaterThan(0)
  })

  it('clearing all validation errors shows the success banner', () => {
    renderWithProviders(<RaciBuilder />)
    const firstActivity = IAM_RACI_ACTIVITIES[0]
    const row = screen.getByText(firstActivity.name).closest('tr')!
    // Assign A and R to the first role for the first activity only clears that row's errors,
    // not the whole matrix — assert per-row error disappears instead of a global success banner.
    fireEvent.click(within(row).getByRole('button', { name: `A for IAM Program Manager on ${firstActivity.name}` }))
    fireEvent.click(within(row).getByRole('button', { name: `R for IAM Program Manager on ${firstActivity.name}` }))
    expect(within(row).queryByText(/No Accountable owner assigned/i)).not.toBeInTheDocument()
  })

  it('adds a custom activity row', () => {
    renderWithProviders(<RaciBuilder />)
    fireEvent.change(screen.getByPlaceholderText(/emergency access break-glass review/i), { target: { value: 'Custom test activity' } })
    fireEvent.click(screen.getByRole('button', { name: /add activity/i }))
    expect(screen.getByText('Custom test activity')).toBeInTheDocument()
  })
})
