import { describe, it, expect, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../test/renderWithProviders'
import { TASK_TAG_LABELS } from '../data/taskTags'
import TaskFilterRow from './TaskFilterRow'

describe('TaskFilterRow', () => {
  it('renders every task tag plus an All option', () => {
    renderWithProviders(<TaskFilterRow selected={null} onSelect={() => {}} />)
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
    for (const label of Object.values(TASK_TAG_LABELS)) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
    }
  })

  it('calls onSelect with the clicked tag', () => {
    const onSelect = vi.fn()
    renderWithProviders(<TaskFilterRow selected={null} onSelect={onSelect} />)
    fireEvent.click(screen.getByRole('button', { name: TASK_TAG_LABELS.decode }))
    expect(onSelect).toHaveBeenCalledWith('decode')
  })

  it('clicking the already-selected tag deselects it (calls onSelect with null)', () => {
    const onSelect = vi.fn()
    renderWithProviders(<TaskFilterRow selected="decode" onSelect={onSelect} />)
    fireEvent.click(screen.getByRole('button', { name: TASK_TAG_LABELS.decode }))
    expect(onSelect).toHaveBeenCalledWith(null)
  })

  it('marks the selected tag as pressed', () => {
    renderWithProviders(<TaskFilterRow selected="generate" onSelect={() => {}} />)
    expect(screen.getByRole('button', { name: TASK_TAG_LABELS.generate })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'false')
  })
})
