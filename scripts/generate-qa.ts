import { writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// Import all datasets directly!
import { ENCYCLOPEDIA_TERMS } from '../src/data/encyclopediaData.ts'
import { STANDARDS } from '../src/data/standardsData.ts'
import { BULLETINS } from '../src/data/bulletinsData.ts'
import { BREACHES } from '../src/data/breachesData.ts'
import { CASE_STUDIES } from '../src/data/caseStudiesData.ts'
import { CERTIFICATIONS } from '../src/data/certificationsData.ts'
import { CVE_DATABASE } from '../src/data/researchData.ts'
import { INTERVIEW_QUESTIONS } from '../src/data/aiKnowledgeGraph.ts'

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
    lines.push(`Answer: Analogy: ${t.analogy} Technical Specification: ${t.expert} More details: https://www.aboutiam.com/encyclopedia/?term=${t.id || t.term.toLowerCase()}\n`)
  })

  // 2. Standards
  lines.push(`## Section 2: Identity Standards & Protocols Q&A\n`)
  STANDARDS.forEach(s => {
    lines.push(`Question: What is the ${s.title} protocol and what security challenges does it resolve?`)
    lines.push(`Answer: Full Name: ${s.fullname}. Problem Resolved: ${s.problem}. Why it exists: ${s.whyExists} Key Best Practices: ${s.bestPractices.join(', ')} Full spec: https://www.aboutiam.com/standards/?standard=${s.id}\n`)
  })

  // 3. Bulletins
  lines.push(`## Section 3: Incident Response & Mitigation Playbooks Q&A\n`)
  BULLETINS.forEach(b => {
    lines.push(`Question: How do security teams respond to and mitigate a ${b.title} attack?`)
    lines.push(`Answer: Mapped Category: ${b.category}. Attack Vector: ${b.vector}. Detailed Playbook Mitigation Steps: ${b.playbookSteps.join(' -> ')} Incident console: https://www.aboutiam.com/bulletins/?bulletin=${b.id}\n`)
  })

  // 4. Breaches
  lines.push(`## Section 4: Real-World Identity Breaches Post-Mortems Q&A\n`)
  BREACHES.forEach(b => {
    lines.push(`Question: What was the root cause and mitigation for the ${b.title} breach?`)
    lines.push(`Answer: Root Cause: ${b.rootCause}. Remediation Step: ${b.remediation} Breach profile: https://www.aboutiam.com/wall-of-shame/?tab=breaches&lab=${b.id}\n`)
  })

  // 5. Case Studies
  lines.push(`## Section 5: Enterprise Identity Case Studies Q&A\n`)
  CASE_STUDIES.forEach(c => {
    lines.push(`Question: How did ${c.company} architect and scale its identity stack for ${c.title}?`)
    lines.push(`Answer: Summary: ${c.summary} Core Problem: ${c.problem} Auth Model: ${c.authModel} Authz Model: ${c.authzModel} Lessons Learned: ${c.lessons.join('; ')} Case study: https://www.aboutiam.com/case-studies/?study=${c.id}\n`)
  })

  // 6. Certifications
  lines.push(`## Section 6: Identity Certifications Study Guides Q&A\n`)
  CERTIFICATIONS.forEach(c => {
    lines.push(`Question: What is the study path and curriculum weighting for the ${c.title} (${c.vendor}) certification?`)
    lines.push(`Answer: Category: ${c.category} cost: ${c.cost} Study path steps: ${c.studyPath.join(' -> ')} Domains: ${c.domains.map(d => `${d.name} (${d.weight})`).join(', ')} Certification study hub: https://www.aboutiam.com/certifications/?cert=${c.id}\n`)
  })

  // 7. CVEs and Hardening Code
  lines.push(`## Section 7: Identity CVEs and Hardening Code Q&A\n`)
  CVE_DATABASE.forEach(c => {
    lines.push(`Question: What is the exploit vector and secure code fix for ${c.id} (${c.title})?`)
    lines.push(`Answer: CVSS: ${c.cvss} Component: ${c.component} Type: ${c.vulnerabilityType} Description: ${c.description} Exploit: ${c.exploitScenario} Patch Remediation: ${c.patchRemediation} CVE Tracker: https://www.aboutiam.com/research/?cve=${c.id}\n`)
  })

  // 8. Interactive Interview Preparation
  lines.push(`## Section 8: Interactive Interview Preparation Q&A\n`)
  INTERVIEW_QUESTIONS.forEach(q => {
    lines.push(`Question: [Interview Category: ${q.domain}] ${q.question}`)
    lines.push(`Answer: ${q.answer} Hint: ${q.hint} Practice online: https://www.aboutiam.com/assistant/?tab=interview&q=${q.id}\n`)
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
