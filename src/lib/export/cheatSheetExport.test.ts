import { describe, it, expect } from 'vitest'
import { buildCheatSheetMarkdown } from './cheatSheetExport'
import { type CheatSheet } from '../../data/cheatSheetsData'

const mockSheet: CheatSheet = {
  id: 'test-sheet',
  title: 'Test Audit Checklist',
  target: 'Developers',
  category: 'Application Security',
  difficulty: 'Beginner',
  checks: [
    { id: 'check1', task: 'Task 1', desc: 'Desc 1' },
    { id: 'check2', task: 'Task 2', desc: 'Desc 2' },
  ],
}

describe('cheatSheetExport', () => {
  it('builds a markdown report with passed and failed checks', () => {
    const checked = new Set(['check1'])
    const result = buildCheatSheetMarkdown(mockSheet, checked)

    expect(result).toContain('title: "Test Audit Checklist - Security Audit Report"')
    expect(result).toContain('Completion:** 1 / 2 (50%)')
    expect(result).toContain('- **[PASS]** Task 1')
    expect(result).toContain('- *Details:* Desc 1')
    expect(result).toContain('- **[GAP]** Task 2')
    expect(result).toContain('- *Remediation:* Desc 2')
  })

  it('handles 100% completion cleanly', () => {
    const checked = new Set(['check1', 'check2'])
    const result = buildCheatSheetMarkdown(mockSheet, checked)
    
    expect(result).toContain('Completion:** 2 / 2 (100%)')
    expect(result).toContain('*All controls fully verified. System is compliant.*')
  })

  it('handles 0% completion cleanly', () => {
    const checked = new Set<string>()
    const result = buildCheatSheetMarkdown(mockSheet, checked)
    
    expect(result).toContain('Completion:** 0 / 2 (0%)')
    expect(result).toContain('*No controls verified yet.*')
  })
})
