import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../test/renderWithProviders'
import * as profileBackup from '../lib/backup/profileBackup'
import ProfileExportImport from './ProfileExportImport'

vi.mock('../lib/backup/profileBackup', async (importOriginal) => {
  const actual = await importOriginal<typeof profileBackup>()
  return {
    ...actual,
    buildProfileBackup: vi.fn(actual.buildProfileBackup),
    buildProfileBackupBlob: vi.fn(actual.buildProfileBackupBlob),
    parseProfileBackup: vi.fn(actual.parseProfileBackup),
    applyProfileBackup: vi.fn(),
    reloadPage: vi.fn(),
  }
})

const mocked = vi.mocked(profileBackup)

function makeJsonFile(content: string, name = 'profile.json') {
  return new File([content], name, { type: 'application/json' })
}

describe('ProfileExportImport', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    if (!('createObjectURL' in URL)) {
      // jsdom doesn't implement this
      // @ts-expect-error test shim
      URL.createObjectURL = vi.fn(() => 'blob:mock')
    }
    if (!('revokeObjectURL' in URL)) {
      // @ts-expect-error test shim
      URL.revokeObjectURL = vi.fn()
    }
  })

  it('triggers an export download when clicking Export Profile', () => {
    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock')
    renderWithProviders(<ProfileExportImport />)

    fireEvent.click(screen.getByRole('button', { name: /export profile/i }))

    expect(createObjectURLSpy).toHaveBeenCalled()
  })

  it('requires confirmation before importing a selected file', async () => {
    renderWithProviders(<ProfileExportImport />)
    const input = screen.getByRole('button', { name: /import profile/i }).parentElement!.querySelector('input[type="file"]') as HTMLInputElement

    const file = makeJsonFile(JSON.stringify({ schemaVersion: 1, exportedAt: '2026-07-31T00:00:00.000Z', data: {} }))
    fireEvent.change(input, { target: { files: [file] } })

    await waitFor(() => expect(screen.getByText(/overwrite your current progress/i)).toBeInTheDocument())
    expect(mocked.applyProfileBackup).not.toHaveBeenCalled()
  })

  it('applies the backup and reloads on confirmed import', async () => {
    renderWithProviders(<ProfileExportImport />)
    const input = screen.getByRole('button', { name: /import profile/i }).parentElement!.querySelector('input[type="file"]') as HTMLInputElement

    const file = makeJsonFile(JSON.stringify({ schemaVersion: 1, exportedAt: '2026-07-31T00:00:00.000Z', data: { 'aboutiam-bookmarks': '{}' } }))
    fireEvent.change(input, { target: { files: [file] } })
    await waitFor(() => screen.getByRole('button', { name: /confirm import/i }))
    fireEvent.click(screen.getByRole('button', { name: /confirm import/i }))

    await waitFor(() => expect(mocked.applyProfileBackup).toHaveBeenCalledWith({ schemaVersion: 1, exportedAt: '2026-07-31T00:00:00.000Z', data: { 'aboutiam-bookmarks': '{}' } }))
    expect(mocked.reloadPage).toHaveBeenCalledTimes(1)
  })

  it('shows a clear error and does not reload on a malformed file', async () => {
    renderWithProviders(<ProfileExportImport />)
    const input = screen.getByRole('button', { name: /import profile/i }).parentElement!.querySelector('input[type="file"]') as HTMLInputElement

    const file = makeJsonFile('not json {{{')
    fireEvent.change(input, { target: { files: [file] } })
    await waitFor(() => screen.getByRole('button', { name: /confirm import/i }))
    fireEvent.click(screen.getByRole('button', { name: /confirm import/i }))

    await waitFor(() => expect(screen.getByText(/not valid JSON/i)).toBeInTheDocument())
    expect(mocked.reloadPage).not.toHaveBeenCalled()
  })

  it('cancelling the confirmation does not import anything', async () => {
    renderWithProviders(<ProfileExportImport />)
    const input = screen.getByRole('button', { name: /import profile/i }).parentElement!.querySelector('input[type="file"]') as HTMLInputElement

    const file = makeJsonFile(JSON.stringify({ schemaVersion: 1, exportedAt: '2026-07-31T00:00:00.000Z', data: {} }))
    fireEvent.change(input, { target: { files: [file] } })
    await waitFor(() => screen.getByRole('button', { name: /cancel/i }))
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))

    expect(screen.queryByText(/overwrite your current progress/i)).not.toBeInTheDocument()
    expect(mocked.applyProfileBackup).not.toHaveBeenCalled()
  })
})
