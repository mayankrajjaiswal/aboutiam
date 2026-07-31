// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders as render } from '../test/renderWithProviders'
import PortfolioExport from './PortfolioExport'

describe('PortfolioExport', () => {
  beforeEach(() => {
    window.localStorage.clear()
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn() },
      writable: true,
      configurable: true,
    })
    vi.stubGlobal('print', vi.fn())
  })

  it('shows the empty-state message when there is no progress at all', () => {
    render(<PortfolioExport />)
    expect(screen.getByText(/nothing is fabricated/i)).toBeInTheDocument()
  })

  it('renders an academy bullet reflecting real localStorage progress', () => {
    window.localStorage.setItem('aboutiam-academy-progress', JSON.stringify({ 'track-1-mod-1': true, 'track-1-mod-2': true }))
    render(<PortfolioExport />)
    expect(screen.getByText(/completed 2 of 36 iam academy modules/i)).toBeInTheDocument()
  })

  it('excludes playground checkpoint keys (containing "_step_") from the academy module count', () => {
    window.localStorage.setItem('aboutiam-academy-progress', JSON.stringify({
      'track-1-mod-1': true,
      'agent_identity_step_0': true,
      'agent_identity_step_1': true,
    }))
    render(<PortfolioExport />)
    expect(screen.getByText(/completed 1 of 36 iam academy modules/i)).toBeInTheDocument()
  })

  it('renders a labs bullet reflecting completed playground labs', () => {
    window.localStorage.setItem('aboutiam_labs_completed', JSON.stringify(['lab-oauth', 'lab-jwt', 'lab-saml']))
    render(<PortfolioExport />)
    expect(screen.getByText(/completed 3 interactive identity-security labs/i)).toBeInTheDocument()
  })

  it('does not show the badge callout below the completion threshold', () => {
    window.localStorage.setItem('aboutiam-academy-progress', JSON.stringify({ 'a': true, 'b': true }))
    render(<PortfolioExport />)
    expect(screen.queryByText(/badge earned/i)).not.toBeInTheDocument()
  })

  it('shows the badge callout once the module-completion threshold is reached', () => {
    const progress: Record<string, boolean> = {}
    for (let i = 0; i < 20; i++) progress[`mod-${i}`] = true
    window.localStorage.setItem('aboutiam-academy-progress', JSON.stringify(progress))
    render(<PortfolioExport />)
    expect(screen.getByText(/badge earned/i)).toBeInTheDocument()
  })

  it('copies a bullet to the clipboard when its copy button is clicked', () => {
    window.localStorage.setItem('aboutiam_labs_completed', JSON.stringify(['lab-oauth']))
    render(<PortfolioExport />)
    fireEvent.click(screen.getByLabelText(/copy bullet/i))
    expect(navigator.clipboard.writeText).toHaveBeenCalledOnce()
  })

  it('offers the signed certificate download with the mandatory honesty caveat and a link to the verifier', () => {
    window.localStorage.setItem('aboutiam_labs_completed', JSON.stringify(['lab-oauth']))
    render(<PortfolioExport />)
    expect(screen.getByRole('button', { name: /certificate/i })).toBeInTheDocument()
    expect(screen.getByText(/not a substitute for third-party-issued professional certification/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /certificate verifier/i })).toHaveAttribute('href', '/tools/certificate-verifier')
  })
})
