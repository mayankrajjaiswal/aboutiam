// Bundles a curated slice of AboutIAM's content into plain Markdown files for
// offline study or feeding into a personal notes/AI tool — pure string
// building only, no browser APIs, so it stays testable in the "unit" (node)
// project. See src/lib/studyPackExport.ts for the JSZip/download glue.

import { ENCYCLOPEDIA_TERMS } from '../data/encyclopediaData'
import { STANDARDS } from '../data/standardsData'
import { ARCHITECTURES } from '../data/architectureData'
import { CHEAT_SHEETS, SHEET_CATEGORIES } from '../data/cheatSheetsData'

export interface StudyPackFile {
  path: string
  content: string
}

const SITE_URL = 'https://www.aboutiam.com'

export function buildManifestMarkdown(): string {
  return `# AboutIAM Offline Study Pack

Generated from ${SITE_URL} — a free, open-source, browser-native Identity and
Access Management (IAM) learning platform.

This bundle is a plain-Markdown snapshot of AboutIAM's core reference
content, meant for offline reading or for feeding into your own notes app or
AI tool of choice. It does not include the interactive Playgrounds, Security
Tools, or simulators — visit the live site for those.

## Contents

- \`encyclopedia.md\` — the A-Z glossary of IAM terms
- \`standards.md\` — the Living Standards & RFC Explorer
- \`architectures.md\` — the Reference Architecture Center
- \`cheat-sheets.md\` — the Developer Playbooks checklist library

## License

AboutIAM's content and source code are released under the MIT License. See
${SITE_URL}/terms for full details.
`
}

export function buildEncyclopediaMarkdown(): string {
  const byCategory = new Map<string, typeof ENCYCLOPEDIA_TERMS>()
  for (const term of ENCYCLOPEDIA_TERMS) {
    const bucket = byCategory.get(term.category) ?? []
    bucket.push(term)
    byCategory.set(term.category, bucket)
  }

  const sections = [...byCategory.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([category, terms]) => {
      const entries = [...terms]
        .sort((a, b) => a.term.localeCompare(b.term))
        .map(
          (t) =>
            `### ${t.term}\n\n**${t.fullName}**\n\n> ${t.analogy}\n\n${t.expert}\n`
        )
        .join('\n')
      return `## ${category}\n\n${entries}`
    })

  return `# IAM Encyclopedia\n\n${sections.join('\n\n')}\n`
}

export function buildStandardsMarkdown(): string {
  const entries = [...STANDARDS]
    .sort((a, b) => a.title.localeCompare(b.title))
    .map((s) => {
      const rfcs = s.rfcs.join(', ')
      const bestPractices = s.bestPractices.map((b) => `- ${b}`).join('\n')
      return `## ${s.title}

*${s.fullname}* — ${s.category} — ${s.difficulty} — ${s.year}
RFCs/specs: ${rfcs}

${s.summary}

**The problem it solves:** ${s.problem}

**Why it exists:** ${s.whyExists}

**Best practices:**
${bestPractices}
`
    })

  return `# IAM Standards & RFC Explorer\n\n${entries.join('\n')}\n`
}

export function buildArchitecturesMarkdown(): string {
  const entries = [...ARCHITECTURES]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((a) => `## ${a.name}\n\n*${a.difficulty} — ${a.group}*\n\n${a.description}\n`)

  return `# Reference Architecture Center\n\n${entries.join('\n')}\n`
}

export function buildCheatSheetsMarkdown(): string {
  const sections = SHEET_CATEGORIES.map((category) => {
    const sheets = CHEAT_SHEETS.filter((s) => s.category === category)
      .sort((a, b) => a.title.localeCompare(b.title))
      .map((s) => {
        const checks = s.checks.map((c) => `- [ ] **${c.task}** — ${c.desc}`).join('\n')
        return `### ${s.title}\n\n*${s.difficulty} — ${s.target}*\n\n${checks}\n`
      })
      .join('\n')
    return `## ${category}\n\n${sheets}`
  })

  return `# Developer Playbooks\n\n${sections.join('\n\n')}\n`
}

export function buildStudyPackFiles(): StudyPackFile[] {
  return [
    { path: 'README.md', content: buildManifestMarkdown() },
    { path: 'encyclopedia.md', content: buildEncyclopediaMarkdown() },
    { path: 'standards.md', content: buildStandardsMarkdown() },
    { path: 'architectures.md', content: buildArchitecturesMarkdown() },
    { path: 'cheat-sheets.md', content: buildCheatSheetsMarkdown() },
  ]
}
