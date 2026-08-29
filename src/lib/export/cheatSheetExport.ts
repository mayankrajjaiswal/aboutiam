import { type CheatSheet } from '../../data/cheatSheetsData'

export function buildCheatSheetMarkdown(sheet: CheatSheet, checkedIds: Set<string>): string {
  const lines: string[] = [
    '---',
    `title: "${sheet.title} - Security Audit Report"`,
    'published: true',
    'tags: "security, compliance, audit"',
    `canonical_url: "https://www.aboutiam.com/cheat-sheets?sheet=${sheet.id}"`,
    '---',
    '',
    `# 🛡️ Audit Report: ${sheet.title}`,
    '',
    `**Target Audience:** ${sheet.target}`,
    `**Category:** ${sheet.category}`,
    `**Difficulty Tier:** ${sheet.difficulty}`,
    `**Completion:** ${checkedIds.size} / ${sheet.checks.length} (${Math.round((checkedIds.size / sheet.checks.length) * 100)}%)`,
    '',
    '## ✅ Implemented Controls',
  ]

  const passed = sheet.checks.filter(c => checkedIds.has(c.id))
  const failed = sheet.checks.filter(c => !checkedIds.has(c.id))

  if (passed.length === 0) {
    lines.push('*No controls verified yet.*')
  } else {
    passed.forEach((c) => {
      lines.push(`- **[PASS]** ${c.task}`)
      lines.push(`  - *Details:* ${c.desc}`)
    })
  }

  lines.push('', '## ❌ Pending Gaps (Action Required)')
  if (failed.length === 0) {
    lines.push('*All controls fully verified. System is compliant.*')
  } else {
    failed.forEach((c) => {
      lines.push(`- **[GAP]** ${c.task}`)
      lines.push(`  - *Remediation:* ${c.desc}`)
    })
  }

  lines.push(
    '',
    '## ✍️ Corporate Sign-Off',
    '',
    '**Auditor Name:** ___________________________',
    '',
    '**Date of Audit:** ___________________________',
    '',
    '**Signature:** ___________________________',
    '',
    '---',
    '*Generated autonomously via the [AboutIAM Developer Playbooks](https://www.aboutiam.com/cheat-sheets) — Sovereign Identity Security Playground.*'
  )

  return lines.join('\n')
}
