import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import { IAM_HALL_OF_FAME } from '../../src/data/iamHallOfFame'
import IdentityTimeline from '../../src/pages/IdentityTimeline'

describe('IdentityTimeline Hall of Fame tab', () => {
  it('defaults to the timeline view', () => {
    renderWithProviders(<IdentityTimeline />)
    expect(screen.getByText('The Historical Path')).toBeInTheDocument()
  })

  it('switches to the Hall of Fame and lists every profile', () => {
    renderWithProviders(<IdentityTimeline />)
    fireEvent.click(screen.getByRole('button', { name: /hall of fame/i }))
    for (const profile of IAM_HALL_OF_FAME) {
      expect(screen.getByText(profile.name)).toBeInTheDocument()
    }
  })

  it('each profile deep-links to its cross-referenced standard', () => {
    renderWithProviders(<IdentityTimeline />)
    fireEvent.click(screen.getByRole('button', { name: /hall of fame/i }))
    const links = screen.getAllByText('View the standard →')
    expect(links.length).toBe(IAM_HALL_OF_FAME.length)
    expect(links[0]).toHaveAttribute('href', expect.stringMatching(/^\/standards\?standard=/))
  })
})
