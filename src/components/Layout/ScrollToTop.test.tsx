import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import ScrollToTop from './ScrollToTop'

function Navigator() {
  const navigate = useNavigate()
  return <button onClick={() => navigate('/other')}>go</button>
}

describe('ScrollToTop', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn()
  })

  it('renders nothing', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <ScrollToTop />
      </MemoryRouter>
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('scrolls to the top on every pathname change', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <ScrollToTop />
        <Routes>
          <Route path="*" element={<Navigator />} />
        </Routes>
      </MemoryRouter>
    )
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0)
    vi.mocked(window.scrollTo).mockClear()

    fireEvent.click(screen.getByRole('button', { name: 'go' }))
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0)
  })
})
