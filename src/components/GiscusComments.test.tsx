import { describe, it, expect, afterEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../test/renderWithProviders'
import GiscusComments from './GiscusComments'

describe('GiscusComments', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('shows the disabled notice instead of the embed when giscus is not configured', () => {
    vi.stubEnv('VITE_GISCUS_REPO', '')
    vi.stubEnv('VITE_GISCUS_REPO_ID', '')
    vi.stubEnv('VITE_GISCUS_CATEGORY', '')
    vi.stubEnv('VITE_GISCUS_CATEGORY_ID', '')

    renderWithProviders(<GiscusComments term="term-oidc" />)
    expect(screen.getByText(/comments aren't configured/i)).toBeInTheDocument()
    expect(screen.queryByTestId('giscus-container')).not.toBeInTheDocument()
  })

  it('renders its container div and does not crash when configured', () => {
    vi.stubEnv('VITE_GISCUS_REPO', 'owner/repo')
    vi.stubEnv('VITE_GISCUS_REPO_ID', 'R_kgD')
    vi.stubEnv('VITE_GISCUS_CATEGORY', 'Comments')
    vi.stubEnv('VITE_GISCUS_CATEGORY_ID', 'DIC_kwD')

    renderWithProviders(<GiscusComments term="term-oidc" />)
    expect(screen.getByTestId('giscus-container')).toBeInTheDocument()
  })

  it('shows a fallback message instead of crashing when the giscus embed script fails to load', async () => {
    vi.stubEnv('VITE_GISCUS_REPO', 'owner/repo')
    vi.stubEnv('VITE_GISCUS_REPO_ID', 'R_kgD')
    vi.stubEnv('VITE_GISCUS_CATEGORY', 'Comments')
    vi.stubEnv('VITE_GISCUS_CATEGORY_ID', 'DIC_kwD')

    renderWithProviders(<GiscusComments term="term-oidc" />)
    const container = screen.getByTestId('giscus-container')
    const script = container.querySelector('script')
    expect(script).not.toBeNull()
    script!.dispatchEvent(new Event('error'))

    await waitFor(() => {
      expect(screen.getByText(/comments failed to load/i)).toBeInTheDocument()
    })
  })
})
