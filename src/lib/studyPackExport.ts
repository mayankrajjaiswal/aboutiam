// Browser-only glue for src/lib/studyPack.ts: zips the generated Markdown
// files with JSZip and triggers a client-side download. Split from
// studyPack.ts so the pure content builders stay testable without jsdom.
import { buildStudyPackFiles } from './studyPack'

export async function buildStudyPackZipBlob(): Promise<Blob> {
  // Dynamically imported so JSZip (~100KB) only loads when a visitor actually
  // clicks "Download Study Pack," instead of bloating the Home page's chunk.
  const { default: JSZip } = await import('jszip')
  const zip = new JSZip()
  for (const file of buildStudyPackFiles()) {
    zip.file(file.path, file.content)
  }
  return zip.generateAsync({ type: 'blob' })
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
