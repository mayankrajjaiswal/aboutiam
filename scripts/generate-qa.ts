import { writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// Import all datasets directly!
import { ENCYCLOPEDIA_TERMS } from '../src/data/encyclopediaData.ts'
import { STANDARDS } from '../src/data/standardsData.ts'
import { BULLETINS } from '../src/data/bulletinsData.ts'
import { BREACHES } from '../src/data/breachesData.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function generateQaFeed(): string {
  const lines: string[] = []

  lines.push(`# AboutIAM High-Density Q&A RAG Index`)
  lines.push(`This file contains pre-compiled, structured Q&A pairs representing the core concepts, standards, and playbooks of AboutIAM, optimized for semantic RAG answer retrieval.\n`)

  // 1. Encyclopedia
  lines.push(`## Section 1: Identity & Access Management Glossary Q&A\n`)
  ENCYCLOPEDIA_TERMS.forEach(t => {
    lines.push(`Question: What is ${t.term} (${t.fullName || t.term}) in Identity Security?`)
    lines.push(`Answer: Analogy: ${t.analogy} Technical Specification: ${t.expert}\n`)
  })

  // 2. Standards
  lines.push(`## Section 2: Identity Standards & Protocols Q&A\n`)
  STANDARDS.forEach(s => {
    lines.push(`Question: What is the ${s.title} protocol and what security challenges does it resolve?`)
    lines.push(`Answer: Full Name: ${s.fullname}. Problem Resolved: ${s.problem}. Why it exists: ${s.whyExists} Key Best Practices: ${s.bestPractices.join(', ')}\n`)
  })

  // 3. Bulletins
  lines.push(`## Section 3: Incident Response & Mitigation Playbooks Q&A\n`)
  BULLETINS.forEach(b => {
    lines.push(`Question: How do security teams respond to and mitigate a ${b.title} attack?`)
    lines.push(`Answer: Mapped Category: ${b.category}. Attack Vector: ${b.vector}. Detailed Playbook Mitigation Steps: ${b.playbookSteps.join(' -> ')}\n`)
  })

  // 4. Breaches
  lines.push(`## Section 4: Real-World Identity Breaches Post-Mortems Q&A\n`)
  BREACHES.forEach(b => {
    lines.push(`Question: What was the root cause and mitigation for the ${b.title} breach?`)
    lines.push(`Answer: Root Cause: ${b.rootCause}. Remediation Step: ${b.remediation}\n`)
  })

  return lines.join('\n')
}

try {
  const qaContent = generateQaFeed()
  
  const publicPath = join(__dirname, '../public/qa.txt')
  writeFileSync(publicPath, qaContent, 'utf8')
  console.log(`✓ qa.txt generated successfully at: public/qa.txt`)

  const distDir = join(__dirname, '../dist')
  if (existsSync(distDir)) {
    const distPath = join(distDir, 'qa.txt')
    writeFileSync(distPath, qaContent, 'utf8')
    console.log(`✓ qa.txt copied to build output: dist/qa.txt`)
  }
} catch (error) {
  console.error('💥 Failed to generate qa.txt:', error)
  process.exit(1)
}
