import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../test/renderWithProviders'
import * as studyPackExport from '../lib/studyPackExport'
import StudyPackDownload from './StudyPackDownload'

vi.mock('../lib/studyPackExport', () => ({
  buildStudyPackZipBlob: vi.fn(),
  downloadBlob: vi.fn(),
}))

const mocked = vi.mocked(studyPackExport)

describe('StudyPackDownload', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders the download button', () => {
    renderWithProviders(<StudyPackDownload />)
    expect(screen.getByRole('button', { name: /download study pack/i })).toBeInTheDocument()
  })

  it('builds the zip and triggers a download on click', async () => {
    const fakeBlob = new Blob(['zip'])
    mocked.buildStudyPackZipBlob.mockResolvedValue(fakeBlob)

    renderWithProviders(<StudyPackDownload />)
    fireEvent.click(screen.getByRole('button', { name: /download study pack/i }))

    await waitFor(() => expect(mocked.downloadBlob).toHaveBeenCalledWith(fakeBlob, 'aboutiam-study-pack.zip'))
  })

  it('shows an error message if building the zip fails', async () => {
    mocked.buildStudyPackZipBlob.mockRejectedValue(new Error('zip build failed'))

    renderWithProviders(<StudyPackDownload />)
    fireEvent.click(screen.getByRole('button', { name: /download study pack/i }))

    await waitFor(() => expect(screen.getByText('zip build failed')).toBeInTheDocument())
    expect(mocked.downloadBlob).not.toHaveBeenCalled()
  })
})
