// @vitest-environment jsdom
// Zipping/downloading is genuinely browser-dependent (Blob, URL, document),
// unlike the pure builders in studyPack.ts — see googleDrive.test.ts for the
// same per-file jsdom-override pattern.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import JSZip from 'jszip'
import { buildStudyPackZipBlob, downloadBlob } from './studyPackExport'
import { buildStudyPackFiles } from './studyPack'

describe('buildStudyPackZipBlob', () => {
  it('produces a zip blob containing every study pack file with its original content', async () => {
    const blob = await buildStudyPackZipBlob()
    expect(blob).toBeInstanceOf(Blob)

    const zip = await JSZip.loadAsync(blob)
    const expectedFiles = buildStudyPackFiles()
    expect(Object.keys(zip.files).sort()).toEqual(expectedFiles.map((f) => f.path).sort())

    for (const file of expectedFiles) {
      const zipEntry = zip.file(file.path)
      expect(zipEntry).not.toBeNull()
      const content = await zipEntry!.async('string')
      expect(content).toBe(file.content)
    }
  })
})

describe('downloadBlob', () => {
  const originalCreateObjectURL = URL.createObjectURL
  const originalRevokeObjectURL = URL.revokeObjectURL

  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => 'blob:mock-url')
    URL.revokeObjectURL = vi.fn()
  })

  afterEach(() => {
    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
    vi.restoreAllMocks()
  })

  it('creates a temporary anchor, clicks it with the right filename, and cleans up the object URL', () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    const blob = new Blob(['test'], { type: 'application/zip' })

    downloadBlob(blob, 'aboutiam-study-pack.zip')

    expect(URL.createObjectURL).toHaveBeenCalledWith(blob)
    expect(clickSpy).toHaveBeenCalledTimes(1)
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
    expect(document.body.querySelector('a[download="aboutiam-study-pack.zip"]')).toBeNull()
  })
})
