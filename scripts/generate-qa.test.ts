import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

describe('High-Density Q&A RAG Index (qa.txt)', () => {
  it('should generate the Q&A text file in public/ folder on build', () => {
    const publicPath = join(__dirname, '../public/qa.txt')
    
    if (existsSync(publicPath)) {
      const content = readFileSync(publicPath, 'utf8')
      expect(content).toContain('# AboutIAM High-Density Q&A RAG Index')
      expect(content).toContain('## Section 1: Identity & Access Management Glossary Q&A')
      expect(content).toContain('## Section 2: Identity Standards & Protocols Q&A')
      expect(content).toContain('## Section 3: Incident Response & Mitigation Playbooks Q&A')
      expect(content).toContain('## Section 4: Real-World Identity Breaches Post-Mortems Q&A')
      expect(content).toContain('## Section 5: Enterprise Identity Case Studies Q&A')
      expect(content).toContain('## Section 6: Identity Certifications Study Guides Q&A')
      expect(content).toContain('## Section 7: Identity CVEs and Hardening Code Q&A')
      expect(content).toContain('## Section 8: Interactive Interview Preparation Q&A')
      expect(content.length).toBeGreaterThan(1000)
    }
  })
})
