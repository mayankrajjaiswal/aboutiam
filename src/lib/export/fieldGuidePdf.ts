// Genuinely offline, printable "IAM Field Guide" PDF — a sibling to the
// existing Offline Study Pack (.zip of Markdown), for a different use case:
// polished, real/searchable/selectable PDF text via jsPDF's native text/table
// drawing APIs, not an html2canvas DOM screenshot (which produces
// non-searchable raster text and would defeat the point of a "field guide").
import type { jsPDF } from 'jspdf'
import { ENCYCLOPEDIA_TERMS } from '../../data/encyclopediaData'
import { STANDARDS } from '../../data/standardsData'
import { CHEAT_SHEETS } from '../../data/cheatSheetsData'

export interface FieldGuideSection {
  title: string
  rows: [string, string][]
}

/** Pure content builder — no jsPDF/browser dependency, so it stays trivially testable. */
export function buildFieldGuideSections(): FieldGuideSection[] {
  const encyclopediaRows: [string, string][] = [...ENCYCLOPEDIA_TERMS]
    .sort((a, b) => a.term.localeCompare(b.term))
    .map((t) => [`${t.term} — ${t.fullName}`, `${t.analogy}\n\n${t.expert}`])

  const standardsRows: [string, string][] = [...STANDARDS]
    .sort((a, b) => a.title.localeCompare(b.title))
    .map((s) => [s.title, s.summary])

  const cheatSheetRows: [string, string][] = [...CHEAT_SHEETS]
    .sort((a, b) => a.title.localeCompare(b.title))
    .map((s) => [s.title, s.checks.map((c) => `${c.task}: ${c.desc}`).join('\n')])

  return [
    { title: 'IAM Encyclopedia', rows: encyclopediaRows },
    { title: 'Living Standards & RFC Explorer', rows: standardsRows },
    { title: 'Developer Playbooks (Cheat Sheets)', rows: cheatSheetRows },
  ]
}

/**
 * Builds the jsPDF document itself (not yet serialized) — split out from the
 * Blob wrapper so tests can inspect its structure (page count, etc.) via
 * jsPDF's own API without needing to rasterize anything.
 */
export async function buildFieldGuideDoc(sections: FieldGuideSection[] = buildFieldGuideSections()): Promise<jsPDF> {
  // Lazy-loaded so jsPDF + autoTable (~500KB combined) only load when a
  // visitor actually clicks "Download IAM Field Guide," same bundle-discipline
  // pattern already used for JSZip in the Offline Study Pack.
  const { jsPDF: JsPdfCtor } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc = new JsPdfCtor({ unit: 'pt', format: 'a4' })

  doc.setFontSize(22)
  doc.text('AboutIAM — IAM Field Guide', 40, 60)
  doc.setFontSize(10)
  doc.text('Generated from https://www.aboutiam.com — MIT licensed content, offline printable reference.', 40, 80)

  for (const section of sections) {
    doc.addPage()
    doc.setFontSize(16)
    doc.text(section.title, 40, 40)
    autoTable(doc, {
      startY: 55,
      head: [['Item', 'Details']],
      body: section.rows,
      styles: { fontSize: 8 },
      columnStyles: { 0: { cellWidth: 140 }, 1: { cellWidth: 'auto' } },
    })
  }

  return doc
}

export async function buildFieldGuidePdfBlob(): Promise<Blob> {
  const doc = await buildFieldGuideDoc()
  return doc.output('blob')
}
