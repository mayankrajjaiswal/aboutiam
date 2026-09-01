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
  sections.push(`## Living Standards & RFC Explorer\n*Read the live specifications at:* https://www.aboutiam.com/standards/\n`)
  STANDARDS.forEach(s => {
    sections.push(`### Standard: ${s.title} (${s.fullname}) {#standard-${s.id}}
- **Year:** ${s.year} | **Difficulty:** ${s.difficulty} | **Category:** ${s.category}
- **Vulnerabilities:** ${s.vulnerabilities.join(', ')}
- **Best Practices:** ${s.bestPractices.join(', ')}
- **Summary:** ${s.summary}
- **Problem Solved:** ${s.problem}
- **Why It Exists:** ${s.whyExists}
- **View Live Standard Details:** https://www.aboutiam.com/standards/?standard=${s.id}
`)
  })

  // 2. Encyclopedia Terms
  sections.push(`## Master A-Z Glossary & Acronyms\n*Read the live glossary at:* https://www.aboutiam.com/encyclopedia/\n`)
  ENCYCLOPEDIA_TERMS.forEach(t => {
    sections.push(`### Term: ${t.term} (${t.fullName || t.term}) {#term-${t.id || t.term.toLowerCase()}}
- **Category:** ${t.category}
- **Analogy:** ${t.analogy}
- **Expert Spec:** ${t.expert}
- **View Live Term Details:** https://www.aboutiam.com/encyclopedia/?term=${t.id || t.term.toLowerCase()}
`)
  })

  // 3. Security Bulletins & Incident Playbooks
  sections.push(`## Incident Bulletins & Playbooks\n*Read the live incident playbooks at:* https://www.aboutiam.com/bulletins/\n`)
  BULLETINS.forEach(b => {
    sections.push(`### Incident: ${b.title} {#bulletin-${b.id}}
- **Severity:** ${b.severity} | **Category:** ${b.category} | **Vector:** ${b.vector}
- **Description:** ${b.description}
- **Playbook Steps:**
${b.playbookSteps.map((step, idx) => `  ${idx + 1}. ${step}`).join('\n')}
- **View Live Incident Console:** https://www.aboutiam.com/bulletins/?bulletin=${b.id}
`)
  })

  // 4. Historical Identity Breaches (Wall of Shame)
  sections.push(`## Historical Identity Security Breaches\n*Read the live breach museum at:* https://www.aboutiam.com/wall-of-shame/\n`)
  BREACHES.forEach(b => {
    sections.push(`### Breach: ${b.title} (${b.company} - ${b.year}) {#breach-${b.id}}
- **Category:** ${b.category} | **Difficulty:** ${b.difficulty}
- **Attack Vector:** ${b.attackVector}
- **Summary:** ${b.summary}
- **Root Cause:** ${b.rootCause}
- **Remediation:** ${b.remediation}
- **View Live Breach Details:** https://www.aboutiam.com/wall-of-shame/?tab=breaches&lab=${b.id}
`)
  })

  // 5. Reference Implementations
  sections.push(`## Reference Architectures & Code Implementations\n*Read the live reference implementations at:* https://www.aboutiam.com/references/\n`)
  REFERENCE_PROJECTS.forEach(p => {
    sections.push(`### Reference: ${p.title} (${p.tech}) {#reference-${p.id}}
- **Level:** ${p.level} | **Category:** ${p.category} | **RFC:** ${p.rfc}
- **Description:** ${p.description}
- **Code Highlights:**
\`\`\`${p.codeLang || 'text'}
${p.code.substring(0, 1000)}${p.code.length > 1000 ? '\n// ... [Truncated for brevity]' : ''}
\`\`\`
- **View Live Reference Code:** https://www.aboutiam.com/references/?ref=${p.id}
`)
  })

  // 6. Enterprise Case Studies
  sections.push(`## Enterprise Case Studies\n*Read the live case studies at:* https://www.aboutiam.com/case-studies/\n`)
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
- **View Live Case Study Details:** https://www.aboutiam.com/case-studies/?study=${c.id}
`)
  })

  // 7. Identity Certifications Study Guides
  sections.push(`## Certifications Study Blueprints\n*Read the live certifications study hub at:* https://www.aboutiam.com/certifications/\n`)
  CERTIFICATIONS.forEach(c => {
    sections.push(`### Certification: ${c.title} (${c.vendor}) {#cert-${c.id}}
- **Category:** ${c.category} | **Difficulty:** ${c.difficulty} | **Price/Cost:** ${c.cost} ${c.examCode ? `| **Exam Code:** ${c.examCode}` : ''}
- **Official Study Outline URL:** ${c.officialLink}
- **Curated Study Blueprint Paths:**
${c.studyPath.map((step, idx) => `  ${idx + 1}. ${step}`).join('\n')}
- **Key Domain Weightings:**
${c.domains.map(d => `  - **Domain:** ${d.name} (${d.weight})`).join('\n')}
- **View Live Certification Details:** https://www.aboutiam.com/certifications/?cert=${c.id}
`)
  })

  // 8. Identity CVEs Vulnerabilities Database
  sections.push(`## Critical Identity CVEs & Code-Level Patches\n*Read the live research center at:* https://www.aboutiam.com/research/\n`)
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
- **View Live CVE Details:** https://www.aboutiam.com/research/?cve=${c.id}
`)
  })

  // 9. Standard RFCs & Protocols Registry
  sections.push(`## Protocols & Core RFCs Registry\n*Read the live protocol registry at:* https://www.aboutiam.com/research/\n`)
  RFC_DATABASE.forEach(r => {
    sections.push(`### RFC Profile: ${r.number} — ${r.title} {#rfc-${rfcSlug(r.number)}}
- **Status:** ${r.status} | **Category:** ${r.category} | **Difficulty:** ${r.difficulty}
- **RFC Protocol Overview:** ${r.description}
- **Actionable Developer Security Takeaway:** ${r.keyTakeaway}
- **View Live RFC Details:** https://www.aboutiam.com/research/?rfc=${rfcSlug(r.number)}
`)
  })

  // 10. Product Landscape Directory
  sections.push(`## Enterprise Identity Landscape Directory\n*Read the live landscape directory at:* https://www.aboutiam.com/explore/\n`)
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
- **View Live Product Profile Details:** https://www.aboutiam.com/explore/?product=${p.id}
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
