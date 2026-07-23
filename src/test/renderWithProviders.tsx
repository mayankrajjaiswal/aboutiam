import type { ReactElement } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, type RenderResult } from '@testing-library/react'

/**
 * Nearly every page/component under test reaches for `react-router-dom`
 * (links, `useNavigate`, deep-link query params) even when the test itself
 * doesn't care about routing — this wraps that boilerplate once instead of
 * every test file hand-rolling its own `<MemoryRouter>`.
 */
export function renderWithProviders(ui: ReactElement, route = '/'): RenderResult {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>)
}
