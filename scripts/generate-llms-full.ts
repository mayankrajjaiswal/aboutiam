import { writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// Import all datasets directly!
import { ENCYCLOPEDIA_TERMS } from '../src/data/encyclopediaData.ts'
import { STANDARDS } from '../src/data/standardsData.ts'
import { BULLETINS } from '../src/data/bulletinsData.ts'
import { BREACHES } from '../src/data/breachesData.ts'
import { PROJECTS as REFERENCE_PROJECTS } from '../src/data/referenceProjects.ts'
import { CASE_STUDIES } from '../src/data/caseStudiesData.ts'
import { CERTIFICATIONS } from '../src/data/certificationsData.ts'
import { CVE_DATABASE, RFC_DATABASE } from '../src/data/researchData.ts'
import { EXPLORE_PRODUCTS } from '../src/data/exploreData.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Slugifies an RFC/draft "number" field (e.g. "RFC 6749" -> "rfc-6749")
function rfcSlug(number: string): string {
  return number.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

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
\`\`\`${p.codeLang || 'text'}
${p.code.substring(0, 1000)}${p.code.length > 1000 ? '\n// ... [Truncated for brevity]' : ''}
\`\`\`
`)
  })

  // 6. Enterprise Case Studies (New SEO/LLM Section)
  sections.push(`## Enterprise Case Studies\n`)
  CASE_STUDIES.forEach(c => {
    sections.push(`### Case Study: ${c.company} — ${c.title} {#case-study-${c.id}}
- **Category:** ${c.category} | **Difficulty:** ${c.difficulty}
- **Summary:** ${c.summary}
- **Core Security Problem:** ${c.problem}
- **Requirements:** ${c.requirements.join('; ')}
- **Key Implementation Challenges:** ${c.challenges.join('; ')}
- **Authentication Model:** ${c.authModel}
- **Authorization Model:** ${c.authzModel}
- **Lifecycle Management:** ${c.lifecycle}
- **Federation Strategy:** ${c.federation}
- **Architecture Flow:**
\`\`\`text
${c.architecture}
\`\`\`
- **Sequence Flow Diagram:**
\`\`\`text
${c.sequence}
\`\`\`
- **STRIDE Threat Modeling Matrix:**
${c.threatModel.map(t => `  - **Risk:** ${t.risk} -> **Mitigation:** ${t.mitigation}`).join('\n')}
- **Remediation Lessons Learned:** ${c.lessons.join('; ')}
- **Common Implementation Mistakes:** ${c.mistakes.join('; ')}
- **Architectural Best Practices:** ${c.bestPractices.join('; ')}
`)
  })

  // 7. Identity Certifications Study Guides (New SEO/LLM Section)
  sections.push(`## Certifications Study Blueprints\n`)
  CERTIFICATIONS.forEach(c => {
    sections.push(`### Certification: ${c.title} (${c.vendor}) {#cert-${c.id}}
- **Category:** ${c.category} | **Difficulty:** ${c.difficulty} | **Price/Cost:** ${c.cost} ${c.examCode ? `| **Exam Code:** ${c.examCode}` : ''}
- **Official Study Outline URL:** ${c.officialLink}
- **Curated Study Blueprint Paths:**
${c.studyPath.map((step, idx) => `  ${idx + 1}. ${step}`).join('\n')}
- **Key Domain Weightings:**
${c.domains.map(d => `  - **Domain:** ${d.name} (${d.weight})`).join('\n')}
`)
  })

  // 8. Identity CVEs Vulnerabilities Database (New SEO/LLM Section)
  sections.push(`## Critical Identity CVEs & Code-Level Patches\n`)
  CVE_DATABASE.forEach(c => {
    sections.push(`### CVE Record: ${c.id} — ${c.title} {#cve-${c.id.toLowerCase()}}
- **CVSS Score Rating:** ${c.cvss} | **Difficulty Level:** ${c.difficulty} | **Affected Component:** ${c.component}
- **Vulnerability VulnerabilityType:** ${c.vulnerabilityType}
- **Vulnerability Description:** ${c.description}
- **Exploitation Scenario Attack Vectors:** ${c.exploitScenario}
- **Insecure Vulnerable Code Snippet:**
\`\`\`text
${c.vulnerableCode}
\`\`\`
- **Secure Hardened Code Remediation:**
\`\`\`text
${c.secureCode}
\`\`\`
- **Detailed Remediation & Patch Guidelines:** ${c.patchRemediation}
`)
  })

  // 9. Standard RFCs & Protocols Registry (New SEO/LLM Section)
  sections.push(`## Protocols & Core RFCs Registry\n`)
  RFC_DATABASE.forEach(r => {
    sections.push(`### RFC Profile: ${r.number} — ${r.title} {#rfc-${rfcSlug(r.number)}}
- **Status:** ${r.status} | **Category:** ${r.category} | **Difficulty:** ${r.difficulty}
- **RFC Protocol Overview:** ${r.description}
- **Actionable Developer Security Takeaway:** ${r.keyTakeaway}
`)
  })

  // 10. Product Landscape Directory (New SEO/LLM Section)
  sections.push(`## Enterprise Identity Landscape Directory\n`)
  EXPLORE_PRODUCTS.forEach(p => {
    sections.push(`### Product Profile: ${p.name} {#product-${p.id}}
- **Product Type:** ${p.type} | **Difficulty Level:** ${p.difficulty} | **License:** ${p.license}
- **Standard Deployment Formats:** ${p.deployment}
- **Optimal System Use Cases:** ${p.bestUse}
- **Supported Identity Standards:** OIDC: ${p.protocols.oidc ? 'Yes' : 'No'} | SAML: ${p.protocols.saml ? 'Yes' : 'No'} | SCIM: ${p.protocols.scim ? 'Yes' : 'No'} | FIDO2: ${p.protocols.fido2 ? 'Yes' : 'No'} | LDAP: ${p.protocols.ldap ? 'Yes' : 'No'}
- **Search Keywords:** ${p.tags.join(', ')}
- **Sample Integration Code Block:**
\`\`\`text
${p.integrationSnippet}
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
