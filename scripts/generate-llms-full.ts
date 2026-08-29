import { writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// Import all datasets directly!
import { ENCYCLOPEDIA_TERMS } from '../src/data/encyclopediaData.ts'
import { STANDARDS } from '../src/data/standardsData.ts'
import { BULLETINS } from '../src/data/bulletinsData.ts'
import { BREACHES } from '../src/data/breachesData.ts'
import { PROJECTS as REFERENCE_PROJECTS } from '../src/data/referenceProjects.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function generateFullFeed(): string {
  const sections: string[] = []

  // Header
  sections.push(`# AboutIAM Complete Context Digest\n\nThis file contains the complete, dense technical knowledge base of AboutIAM for direct LLM ingestion. Every definition, specification, vulnerability, and reference pattern is aggregated here for zero-hallucination semantic answering.\n`)

  // 1. Living Standards
  sections.push(`## Living Standards & RFC Explorer\n`)
  STANDARDS.forEach(s => {
    sections.push(`### Standard: ${s.title} (${s.fullname}) {#standard-${s.id}}
- **Year:** ${s.year} | **Difficulty:** ${s.difficulty} | **Category:** ${s.category}
- **Vulnerabilities:** ${s.vulnerabilities.join(', ')}
- **Best Practices:** ${s.bestPractices.join(', ')}
- **Summary:** ${s.summary}
- **Problem Solved:** ${s.problem}
- **Why It Exists:** ${s.whyExists}
`)
  })

  // 2. Encyclopedia Terms
  sections.push(`## Master A-Z Glossary & Acronyms\n`)
  ENCYCLOPEDIA_TERMS.forEach(t => {
    sections.push(`### Term: ${t.term} (${t.fullName || t.term}) {#term-${t.id || t.term.toLowerCase()}}
- **Category:** ${t.category}
- **Analogy:** ${t.analogy}
- **Expert Spec:** ${t.expert}
`)
  })

  // 3. Security Bulletins & Incident Playbooks
  sections.push(`## Incident Bulletins & Playbooks\n`)
  BULLETINS.forEach(b => {
    sections.push(`### Incident: ${b.title} {#bulletin-${b.id}}
- **Severity:** ${b.severity} | **Category:** ${b.category} | **Vector:** ${b.vector}
- **Description:** ${b.description}
- **Playbook Steps:**
${b.playbookSteps.map((step, idx) => `  ${idx + 1}. ${step}`).join('\n')}
`)
  })

  // 4. Historical Identity Breaches (Wall of Shame)
  sections.push(`## Historical Identity Security Breaches\n`)
  BREACHES.forEach(b => {
    sections.push(`### Breach: ${b.title} (${b.company} - ${b.year}) {#breach-${b.id}}
- **Category:** ${b.category} | **Difficulty:** ${b.difficulty}
- **Attack Vector:** ${b.attackVector}
- **Summary:** ${b.summary}
- **Root Cause:** ${b.rootCause}
- **Remediation:** ${b.remediation}
`)
  })

  // 5. Reference Implementations
  sections.push(`## Reference Architectures & Code Implementations\n`)
  REFERENCE_PROJECTS.forEach(p => {
    sections.push(`### Reference: ${p.title} (${p.tech}) {#reference-${p.id}}
- **Level:** ${p.level} | **Category:** ${p.category} | **RFC:** ${p.rfc}
- **Description:** ${p.description}
- **Code Highlights:**
\`\`\`${p.codeLang}
${p.code.substring(0, 1000)}${p.code.length > 1000 ? '\n// ... [Truncated for brevity]' : ''}
\`\`\`
`)
  })

  return sections.join('\n')
}

try {
  const fullContent = generateFullFeed()
  
  const publicPath = join(__dirname, '../public/llms-full.txt')
  writeFileSync(publicPath, fullContent, 'utf8')
  console.log(`✓ llms-full.txt generated successfully at: public/llms-full.txt`)

  const distDir = join(__dirname, '../dist')
  if (existsSync(distDir)) {
    const distPath = join(distDir, 'llms-full.txt')
    writeFileSync(distPath, fullContent, 'utf8')
    console.log(`✓ llms-full.txt copied to build output: dist/llms-full.txt`)
  }
} catch (error) {
  console.error('💥 Failed to generate llms-full.txt:', error)
  process.exit(1)
}
