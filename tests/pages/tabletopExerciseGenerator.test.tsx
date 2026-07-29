import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import TabletopExerciseGenerator from '../../src/pages/Tools/TabletopExerciseGenerator'
import { BULLETIN_CATEGORIES, BULLETINS } from '../../src/data/bulletinsData'

describe('TabletopExerciseGenerator page', () => {
  it('renders the heading and a generated script for the default bulletin', () => {
    renderWithProviders(<TabletopExerciseGenerator />)
    expect(screen.getByRole('heading', { name: /tabletop exercise generator/i })).toBeInTheDocument()
    expect(screen.getAllByText(/timed injects/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/scoring rubric/i).length).toBeGreaterThan(0)
  })

  it('changing the scenario theme updates the available source incidents', () => {
    renderWithProviders(<TabletopExerciseGenerator />)
    const categorySelect = screen.getByLabelText(/scenario theme/i)
    const otherCategory = BULLETIN_CATEGORIES.find((c) => c !== BULLETIN_CATEGORIES[0])!
    fireEvent.change(categorySelect, { target: { value: otherCategory } })

    const bulletinSelect = screen.getByLabelText(/source incident/i) as HTMLSelectElement
    const expectedFirst = BULLETINS.find((b) => b.category === otherCategory)!
    expect(bulletinSelect.value).toBe(expectedFirst.id)
  })

  it('selecting a different bulletin regenerates the script title', () => {
    renderWithProviders(<TabletopExerciseGenerator />)
    const bulletinsInFirstCategory = BULLETINS.filter((b) => b.category === BULLETIN_CATEGORIES[0])
    if (bulletinsInFirstCategory.length < 2) return

    const bulletinSelect = screen.getByLabelText(/source incident/i)
    fireEvent.change(bulletinSelect, { target: { value: bulletinsInFirstCategory[1].id } })
    const escapedTitle = bulletinsInFirstCategory[1].title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    expect(screen.getAllByText(new RegExp(escapedTitle, 'i')).length).toBeGreaterThan(0)
  })

  it('renders one discussion prompt per playbook step for the selected bulletin', () => {
    renderWithProviders(<TabletopExerciseGenerator />)
    const firstBulletin = BULLETINS.find((b) => b.category === BULLETIN_CATEGORIES[0])!
    expect(screen.getAllByRole('listitem').length).toBeGreaterThanOrEqual(firstBulletin.playbookSteps.length)
  })
})
