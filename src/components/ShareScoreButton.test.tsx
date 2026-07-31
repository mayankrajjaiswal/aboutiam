import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../test/renderWithProviders'
import ShareScoreButton from './ShareScoreButton'

describe('ShareScoreButton', () => {
  it('opens a pre-filled GitHub Discussions URL when clicked', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)
    renderWithProviders(<ShareScoreButton moduleName="GRC Maturity Wizard" score="84%" date="2026-07-31" />)

    fireEvent.click(screen.getByRole('button', { name: /share your score/i }))

    expect(openSpy).toHaveBeenCalledOnce()
    const [url, , features] = openSpy.mock.calls[0]
    expect(String(url)).toMatch(/^https:\/\/github\.com\/.+\/discussions\/new\?/)
    expect(features).toContain('noopener')
    openSpy.mockRestore()
  })

  it('links to the community leaderboard discussions category on GitHub', () => {
    renderWithProviders(<ShareScoreButton moduleName="GRC Maturity Wizard" score="84%" date="2026-07-31" />)
    expect(screen.getByRole('link', { name: /browse the community leaderboard/i })).toHaveAttribute(
      'href',
      'https://github.com/mayankrajjaiswal/aboutiam/discussions/categories/leaderboard'
    )
  })
})
