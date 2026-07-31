import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../test/renderWithProviders'
import * as studyPackExport from '../lib/studyPackExport'
import * as fieldGuidePdf from '../lib/export/fieldGuidePdf'
import StudyPackDownload from './StudyPackDownload'

vi.mock('../lib/studyPackExport', () => ({
  buildStudyPackZipBlob: vi.fn(),
  downloadBlob: vi.fn(),
}))

vi.mock('../lib/export/fieldGuidePdf', () => ({
  buildFieldGuidePdfBlob: vi.fn(),
}))

const mocked = vi.mocked(studyPackExport)
const mockedPdf = vi.mocked(fieldGuidePdf)

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

  it('renders the PDF field guide download button', () => {
    renderWithProviders(<StudyPackDownload />)
    expect(screen.getByRole('button', { name: /download iam field guide/i })).toBeInTheDocument()
  })

  it('builds the PDF and triggers a download on click', async () => {
    const fakeBlob = new Blob(['pdf'])
    mockedPdf.buildFieldGuidePdfBlob.mockResolvedValue(fakeBlob)

    renderWithProviders(<StudyPackDownload />)
    fireEvent.click(screen.getByRole('button', { name: /download iam field guide/i }))

    await waitFor(() => expect(mocked.downloadBlob).toHaveBeenCalledWith(fakeBlob, 'aboutiam-field-guide.pdf'))
  })

  it('shows an error message if building the PDF fails', async () => {
    mockedPdf.buildFieldGuidePdfBlob.mockRejectedValue(new Error('pdf build failed'))

    renderWithProviders(<StudyPackDownload />)
    fireEvent.click(screen.getByRole('button', { name: /download iam field guide/i }))

    await waitFor(() => expect(screen.getByText('pdf build failed')).toBeInTheDocument())
  })
})
