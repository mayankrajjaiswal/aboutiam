import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import GamingIdentityLab from '../../src/pages/Playgrounds/GamingIdentityLab'

describe('GamingIdentityLab page', () => {
  it('renders the heading and the account-linking scenario by default', () => {
    renderWithProviders(<GamingIdentityLab />)
    expect(screen.getByRole('heading', { name: /gaming & esports identity lab/i })).toBeInTheDocument()
    expect(screen.getByText('Console account linked')).toBeInTheDocument()
  })

  it('propagating a ban across all 3 linked platforms shows the triggered outcome', () => {
    renderWithProviders(<GamingIdentityLab />)
    fireEvent.click(screen.getByRole('checkbox', { name: /console account linked/i }))
    fireEvent.click(screen.getByRole('checkbox', { name: /pc launcher account linked/i }))
    fireEvent.click(screen.getByRole('checkbox', { name: /mobile account linked/i }))
    fireEvent.click(screen.getByRole('checkbox', { name: /ban issued/i }))

    expect(screen.getAllByText(/ban propagated to 3 linked platform accounts/i).length).toBeGreaterThan(0)
  })

  it('switches to the smurf-detection scenario and reflects a confidence score', () => {
    renderWithProviders(<GamingIdentityLab />)
    fireEvent.click(screen.getByRole('button', { name: /smurf & ban-evasion detection/i }))
    fireEvent.click(screen.getByRole('checkbox', { name: /device fingerprint matches a banned account/i }))
    fireEvent.click(screen.getByRole('checkbox', { name: /behavioral pattern matches a banned account/i }))

    expect(screen.getAllByText(/flagged as likely ban evasion \(80% confidence\)/i).length).toBeGreaterThan(0)
  })

  it('switches to the wagering-KYC scenario and requires re-verification on a single risk signal', () => {
    renderWithProviders(<GamingIdentityLab />)
    fireEvent.click(screen.getByRole('button', { name: /continuous wagering kyc/i }))
    fireEvent.click(screen.getByRole('checkbox', { name: /new \/ unrecognized device/i }))

    expect(screen.getAllByText(/re-verification required/i).length).toBeGreaterThan(0)
  })

  it('resets all signals back to their unchecked state', () => {
    renderWithProviders(<GamingIdentityLab />)
    const checkbox = screen.getByRole('checkbox', { name: /console account linked/i })
    fireEvent.click(checkbox)
    expect(checkbox).toBeChecked()

    fireEvent.click(screen.getByTitle(/reset simulator/i))
    expect(screen.getByRole('checkbox', { name: /console account linked/i })).not.toBeChecked()
  })
})
