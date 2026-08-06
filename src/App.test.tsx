import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import App from './App'

// App.tsx wires its own BrowserRouter internally (unlike every other
// component in this codebase, which is why the test/renderWithProviders
// MemoryRouter helper doesn't apply here) — drive the route via the real
// jsdom history/location instead of a router prop.
function renderAppAt(path: string) {
  window.history.pushState({}, '', path)
  return render(<App />)
}

describe('App', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn() // jsdom doesn't implement it; ScrollToTop calls it on every route mount
  })

  afterEach(() => {
    window.history.pushState({}, '', '/')
  })

  it('renders the layout shell (sidebar + header) and the matched route at "/"', async () => {
    renderAppAt('/')
    expect(await screen.findByRole('heading', { name: /master identity & access/i }, { timeout: 5000 })).toBeInTheDocument()
    expect(document.title).toBe('AboutIAM | The Interactive Identity Workspace')
  })

  it('renders a different matched route based on the current location', async () => {
    renderAppAt('/tools/')
    await waitFor(() => expect(document.title).toContain('Security Tools'), { timeout: 5000 })
  })

  it('falls back to Home for an unknown path (the "*" catch-all route)', async () => {
    renderAppAt('/this-route-does-not-exist')
    expect(await screen.findByRole('heading', { name: /master identity & access/i }, { timeout: 5000 })).toBeInTheDocument()
  })
})
