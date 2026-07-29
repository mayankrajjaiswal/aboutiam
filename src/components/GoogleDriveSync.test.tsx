import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../test/renderWithProviders'
import { useGoogleDriveSyncStore } from '../store/googleDriveSyncStore'
import * as googleDrive from '../lib/googleDrive'
import GoogleDriveSync from './GoogleDriveSync'

vi.mock('../lib/googleDrive', async (importOriginal) => {
  const actual = await importOriginal<typeof googleDrive>()
  return {
    ...actual,
    getGoogleClientId: vi.fn(),
    requestAccessToken: vi.fn(),
    collectLocalBackupPayload: vi.fn(),
    applyRestoredPayload: vi.fn(),
    uploadBackupToDrive: vi.fn(),
    downloadBackupFromDrive: vi.fn(),
    reloadPage: vi.fn(),
  }
})

const mocked = vi.mocked(googleDrive)

describe('GoogleDriveSync', () => {
  beforeEach(() => {
    useGoogleDriveSyncStore.setState({ lastBackupAt: null })
    vi.clearAllMocks()
  })

  it('shows a disabled notice when no Google Client ID is configured', () => {
    mocked.getGoogleClientId.mockReturnValue(null)
    renderWithProviders(<GoogleDriveSync />)
    expect(screen.getByText(/isn't configured for this deployment/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /back up to google drive/i })).not.toBeInTheDocument()
  })

  it('backs up successfully and records the last backup time', async () => {
    mocked.getGoogleClientId.mockReturnValue('test-client-id')
    mocked.requestAccessToken.mockResolvedValue('fake-token')
    mocked.collectLocalBackupPayload.mockReturnValue({ 'aboutiam-bookmarks': '{}' })
    mocked.uploadBackupToDrive.mockResolvedValue(undefined)

    renderWithProviders(<GoogleDriveSync />)
    fireEvent.click(screen.getByRole('button', { name: /back up to google drive/i }))

    await waitFor(() => expect(mocked.uploadBackupToDrive).toHaveBeenCalledWith('fake-token', { 'aboutiam-bookmarks': '{}' }))
    await waitFor(() => expect(screen.getByText(/last backed up/i)).toBeInTheDocument())
  })

  it('shows an error message when backup fails', async () => {
    mocked.getGoogleClientId.mockReturnValue('test-client-id')
    mocked.requestAccessToken.mockRejectedValue(new Error('popup closed'))

    renderWithProviders(<GoogleDriveSync />)
    fireEvent.click(screen.getByRole('button', { name: /back up to google drive/i }))

    await waitFor(() => expect(screen.getByText('popup closed')).toBeInTheDocument())
  })

  it('requires confirmation before restoring, and does nothing on cancel', async () => {
    mocked.getGoogleClientId.mockReturnValue('test-client-id')
    renderWithProviders(<GoogleDriveSync />)

    fireEvent.click(screen.getByRole('button', { name: /restore from google drive/i }))
    expect(screen.getByText(/overwrite your current progress/i)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(screen.queryByText(/overwrite your current progress/i)).not.toBeInTheDocument()
    expect(mocked.requestAccessToken).not.toHaveBeenCalled()
  })

  it('restores a found backup and reloads the page', async () => {
    mocked.getGoogleClientId.mockReturnValue('test-client-id')
    mocked.requestAccessToken.mockResolvedValue('fake-token')
    mocked.downloadBackupFromDrive.mockResolvedValue({ 'aboutiam-bookmarks': '{"restored":true}' })

    renderWithProviders(<GoogleDriveSync />)
    fireEvent.click(screen.getByRole('button', { name: /restore from google drive/i }))
    fireEvent.click(screen.getByRole('button', { name: /confirm restore/i }))

    await waitFor(() =>
      expect(mocked.applyRestoredPayload).toHaveBeenCalledWith({ 'aboutiam-bookmarks': '{"restored":true}' })
    )
    expect(mocked.reloadPage).toHaveBeenCalledTimes(1)
  })

  it('shows a "no backup found" message and does not restore when Drive has no backup', async () => {
    mocked.getGoogleClientId.mockReturnValue('test-client-id')
    mocked.requestAccessToken.mockResolvedValue('fake-token')
    mocked.downloadBackupFromDrive.mockResolvedValue(null)

    renderWithProviders(<GoogleDriveSync />)
    fireEvent.click(screen.getByRole('button', { name: /restore from google drive/i }))
    fireEvent.click(screen.getByRole('button', { name: /confirm restore/i }))

    await waitFor(() => expect(screen.getByText(/no backup was found/i)).toBeInTheDocument())
    expect(mocked.applyRestoredPayload).not.toHaveBeenCalled()
    expect(mocked.reloadPage).not.toHaveBeenCalled()
  })
})
