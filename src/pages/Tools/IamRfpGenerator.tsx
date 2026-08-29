import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardCheck, Download, ShieldCheck, Link2, DollarSign, AlertTriangle, Check, BookOpen } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import { getToolBySlug } from '../../data/toolsRegistry'
import { EXPLORE_PRODUCTS } from '../../data/exploreData'
import { generateRfp, countTotalQuestions, type RfpAnswers, type OrgSize } from '../../lib/tools/rfpGenerator'
import type { RfpCategory } from '../../data/rfpQuestionBank'

const tool = getToolBySlug('iam-rfp-generator')!

const ORG_SIZES: OrgSize[] = ['Small', 'Mid-Market', 'Enterprise']
const CAPABILITIES = [
  { id: 'sso', label: 'SSO / Federation' },
  { id: 'mfa', label: 'Multi-Factor Authentication' },
  { id: 'pam', label: 'Privileged Access Management' },
  { id: 'iga', label: 'Identity Governance (IGA)' },
  { id: 'ciam', label: 'Customer IAM (CIAM)' },
]

const CATEGORY_ICONS: Record<RfpCategory, typeof ShieldCheck> = {
  'Security & Compliance': ShieldCheck,
  Integration: Link2,
  TCO: DollarSign,
  'Implementation Risk': AlertTriangle,
}

const COMPLIANCE_ANSWERS = [
  {
    id: 1,
    framework: 'SOC 2 Type II (CC6.1 - Access Control)',
    question: 'How does your organization restrict logical access to corporate resources and production buckets?',
    answer: 'We enforce strict identity-first single sign-on (SSO) integrated with phishing-resistant FIDO2/WebAuthn credentials across all internal staff. All access is governed via multi-layered Security Control Policies (SCPs) and resource-level bucket policies executing continuous, context-aware IP and network boundary verifications.'
  },
  {
    id: 2,
    framework: 'ISO/IEC 27001:2022 (A.8.20 - Privileged Access)',
    question: 'Describe your policy for provisioning and rotating privileged administrator session keys.',
    answer: 'Privileged operations require Just-In-Time (JIT) access approval workflows with explicit multi-person approval gates. Session credentials are automatically rotated upon task check-in and are locked to local enclaves using cryptographically signed ephemeral session tokens, preventing static access key leaks.'
  },
  {
    id: 3,
    framework: 'PCI-DSS v4.0 (Req 8.2 - Authentication Management)',
    question: 'How are cardholder data systems protected against automated credential stuffing and password spraying?',
    answer: 'Password authentication is fully mitigated in favor of hardware-bound passkeys. Legacy fallbacks utilize secure TOTP codes (RFC 6238) synchronized to on-device enclaves, with automated rate-limiting, IP-reputation blocking, and compromised-password checks active on all remaining login panels.'
  }
]

function vendorById(id: string) {
  return EXPLORE_PRODUCTS.find((p) => p.id === id)
}

export default function IamRfpGenerator() {
  const [activeTab, setActiveTab] = useState<'rfp' | 'grc'>('rfp')
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const [answers, setAnswers] = useState<RfpAnswers>({
    orgSize: 'Mid-Market',
    industry: '',
    existingIdp: '',
    priorityCapabilities: [],
  })

  const sections = useMemo(() => generateRfp(answers), [answers])
  const totalQuestions = countTotalQuestions(sections)

  const toggleCapability = (id: string) => {
    setAnswers((prev) => ({
      ...prev,
      priorityCapabilities: prev.priorityCapabilities.includes(id)
        ? prev.priorityCapabilities.filter((c) => c !== id)
        : [...prev.priorityCapabilities, id],
    }))
  }

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(idx)
    setTimeout(() => setCopiedIndex(null), 1500)
  }

  const downloadRfp = () => {
    const lines: string[] = [
      '# IAM Vendor RFP',
      '',
      `Org size: ${answers.orgSize} | Industry: ${answers.industry || 'Not specified'} | Existing IdP: ${answers.existingIdp || 'Not specified'}`,
      '',
    ]
    for (const section of sections) {
      lines.push(`## ${section.category}`, '')
      for (const q of section.questions) {
        lines.push(`- ${q.question}`)
        const vendors = (q.relatedVendorIds ?? []).map(vendorById).filter(Boolean)
        if (vendors.length > 0) {
          lines.push(`  - Vendors known to support this: ${vendors.map((v) => v!.name).join(', ')}`)
        }
      }
      lines.push('')
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'aboutiam_iam_rfp.md'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <ToolPageShell tool={tool}>
      {/* Tab Selectors */}
      <div className="flex gap-2 pb-2 select-none">
        <button
          onClick={() => setActiveTab('rfp')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
            activeTab === 'rfp'
              ? 'bg-accent-primary text-white border-accent-primary shadow-sm'
              : 'bg-bg-card border-border-subtle text-text-secondary hover:bg-bg-nested'
          }`}
        >
          <ClipboardCheck className="w-4 h-4" /> RFP Question Generator
        </button>
        <button
          onClick={() => setActiveTab('grc')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
            activeTab === 'grc'
              ? 'bg-accent-primary text-white border-accent-primary shadow-sm'
              : 'bg-bg-card border-border-subtle text-text-secondary hover:bg-bg-nested'
          }`}
        >
          <BookOpen className="w-4 h-4" /> GRC Compliance Answers
        </button>
      </div>

      {activeTab === 'rfp' ? (
        <>
          <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-text-primary">Tell us about your organization</h3>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="rfp-org-size" className="block text-xs font-bold text-text-secondary uppercase tracking-wider">Org Size</label>
                <select
                  id="rfp-org-size"
                  value={answers.orgSize}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, orgSize: e.target.value as OrgSize }))}
                  className="w-full text-sm p-2.5 rounded-lg border border-border-subtle bg-bg-nested text-text-primary outline-none"
                >
                  {ORG_SIZES.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="rfp-industry" className="block text-xs font-bold text-text-secondary uppercase tracking-wider">Industry</label>
                <input
                  id="rfp-industry"
                  type="text"
                  placeholder="e.g. Financial Services"
                  value={answers.industry}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, industry: e.target.value }))}
                  className="w-full text-sm p-2.5 rounded-lg border border-border-subtle bg-bg-nested text-text-primary outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="rfp-idp" className="block text-xs font-bold text-text-secondary uppercase tracking-wider">Existing IdP (if any)</label>
                <input
                  id="rfp-idp"
                  type="text"
                  placeholder="e.g. Active Directory"
                  value={answers.existingIdp}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, existingIdp: e.target.value }))}
                  className="w-full text-sm p-2.5 rounded-lg border border-border-subtle bg-bg-nested text-text-primary outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <span className="block text-xs font-bold text-text-secondary uppercase tracking-wider">Priority Capabilities</span>
              <div className="flex flex-wrap gap-2">
                {CAPABILITIES.map((cap) => {
                  const isSelected = answers.priorityCapabilities.includes(cap.id)
                  return (
                    <button
                      key={cap.id}
                      type="button"
                      onClick={() => toggleCapability(cap.id)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-accent-glow border-accent-primary/40 text-accent-primary'
                          : 'bg-bg-nested border-border-subtle text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      {cap.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border-subtle">
              <h4 className="font-bold text-text-primary text-sm flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-accent-primary" /> Your Tailored RFP ({totalQuestions} questions)
              </h4>
              <button
                onClick={downloadRfp}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-all"
              >
                <Download className="w-3.5 h-3.5" /> Download as Markdown
              </button>
            </div>

            <div className="space-y-6">
              {sections.map((section) => {
                const Icon = CATEGORY_ICONS[section.category]
                return (
                  <div key={section.category} className="space-y-3">
                    <h5 className="text-xs font-black text-text-primary uppercase tracking-wider flex items-center gap-2">
                      <Icon className="w-4 h-4 text-accent-secondary" /> {section.category}
                    </h5>
                    <ul className="space-y-3">
                      {section.questions.map((q) => {
                        const vendors = (q.relatedVendorIds ?? []).map(vendorById).filter(Boolean)
                        return (
                          <li key={q.id} className="p-3.5 rounded-xl bg-bg-nested border border-border-subtle/50 text-xs text-text-secondary leading-relaxed">
                            {q.question}
                            {vendors.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {vendors.map((v) => (
                                  <Link
                                    key={v!.id}
                                    to={`/explore?product=${v!.id}`}
                                    className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent-glow text-accent-primary border border-accent-primary/20 hover:bg-accent-glow/70"
                                  >
                                    {v!.name} →
                                  </Link>
                                ))}
                              </div>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      ) : (
        <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-6">
          <h4 className="font-bold text-text-primary text-sm flex items-center gap-2 border-b border-border-subtle pb-3">
            <BookOpen className="w-4 h-4 text-accent-primary" /> Corporate GRC Compliance Questionnaire Answer Key
          </h4>
          <p className="text-xs text-text-secondary leading-relaxed">
            Copy these pre-formulated, highly professional security questionnaire responses to describe your identity access controls in SOC 2, ISO 27001, and PCI audits.
          </p>

          <div className="space-y-5">
            {COMPLIANCE_ANSWERS.map((item) => (
              <div key={item.id} className="p-4 rounded-xl bg-bg-nested border border-border-subtle space-y-3">
                <div className="flex justify-between items-start gap-3">
                  <span className="text-[10px] font-mono font-bold text-accent-secondary bg-accent-glow/50 px-2 py-0.5 rounded-full border border-accent-secondary/15">
                    {item.framework}
                  </span>
                  <button
                    onClick={() => handleCopy(item.answer, item.id)}
                    className="px-2.5 py-1 rounded border border-border-subtle hover:bg-bg-card text-[10px] font-bold text-text-secondary hover:text-text-primary transition-all flex items-center gap-1 select-none"
                  >
                    {copiedIndex === item.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-status-success" /> Copied!
                      </>
                    ) : (
                      'Copy Response'
                    )}
                  </button>
                </div>
                <div className="space-y-1 leading-relaxed">
                  <p className="text-xs font-bold text-text-primary">Q: {item.question}</p>
                  <p className="text-xs text-text-secondary italic">A: {item.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <BeginnerExpertExplainer tool={tool} />
    </ToolPageShell>
  )
}
