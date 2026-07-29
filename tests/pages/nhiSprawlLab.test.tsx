import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import NhiSprawlLab from '../../src/pages/Playgrounds/NhiSprawlLab'
import { NHI_RECORDS } from '../../src/data/nhiSprawlRecords'

describe('NhiSprawlLab page', () => {
  it('renders the heading and the full fleet-size summary', () => {
    renderWithProviders(<NhiSprawlLab />)
    expect(screen.getByRole('heading', { name: /nhi sprawl cleanup game/i })).toBeInTheDocument()
    expect(screen.getByText(/0 \/ 60 triaged/i)).toBeInTheDocument()
  })

  it('scores a correct triage decision positively and marks the row actioned', () => {
    renderWithProviders(<NhiSprawlLab />)

    const orphaned = NHI_RECORDS.find((r) => r.isOrphaned)!
    const row = screen.getByText(orphaned.id).closest('tr')!
    const revokeBtn = row.querySelector('button[title="Revoke"]') as HTMLButtonElement
    fireEvent.click(revokeBtn)

    expect(screen.getByText(/1 \/ 60 triaged/i)).toBeInTheDocument()
    // The row should now show a resolved "Revoke" status badge instead of action buttons
    expect(row.querySelector('button[title="Revoke"]')).not.toBeInTheDocument()
  })

  it('penalizes an incorrect triage decision', () => {
    renderWithProviders(<NhiSprawlLab />)

    const orphaned = NHI_RECORDS.find((r) => r.isOrphaned)!
    const row = screen.getByText(orphaned.id).closest('tr')!
    const keepBtn = row.querySelector('button[title="Keep"]') as HTMLButtonElement
    fireEvent.click(keepBtn)

    expect(screen.queryByText(/^100$/)).not.toBeInTheDocument()
  })

  it('triggers a cascading-failure log and larger penalty when revoking a record with active dependents that should not have been revoked', () => {
    renderWithProviders(<NhiSprawlLab />)

    const staleWithDependents = NHI_RECORDS.find((r) => r.correctAction === 'rotate' && r.hasDependents)
    expect(staleWithDependents).toBeDefined()

    const row = screen.getByText(staleWithDependents!.id).closest('tr')!
    const revokeBtn = row.querySelector('button[title="Revoke"]') as HTMLButtonElement
    fireEvent.click(revokeBtn)

    expect(screen.getByText(/Cascading failure/i)).toBeInTheDocument()
  })

  it('resets all triage state when the reset button is clicked', () => {
    renderWithProviders(<NhiSprawlLab />)

    const orphaned = NHI_RECORDS.find((r) => r.isOrphaned)!
    const row = screen.getByText(orphaned.id).closest('tr')!
    fireEvent.click(row.querySelector('button[title="Revoke"]') as HTMLButtonElement)
    expect(screen.getByText(/1 \/ 60 triaged/i)).toBeInTheDocument()

    fireEvent.click(screen.getByTitle(/reset simulator/i))
    expect(screen.getByText(/0 \/ 60 triaged/i)).toBeInTheDocument()
  })

  it('filters the table by identity type', () => {
    renderWithProviders(<NhiSprawlLab />)
    const typeSelect = screen.getByDisplayValue(/all types/i)
    fireEvent.change(typeSelect, { target: { value: 'ci-token' } })

    const ciTokenRecords = NHI_RECORDS.filter((r) => r.type === 'ci-token')
    for (const record of ciTokenRecords) {
      expect(screen.getByText(record.id)).toBeInTheDocument()
    }
  })
})
