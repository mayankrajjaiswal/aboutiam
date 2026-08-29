import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Award, Download, Briefcase, Copy, Check, ShieldCheck } from 'lucide-react'
import { generateResumeBullets } from '../lib/career/resumeBulletGenerator'
import { buildBadgeSvg } from '../lib/career/openBadge'
import { signCertificate } from '../lib/career/certificateSigner'

const TOTAL_ACADEMY_MODULES = 36
const BADGE_THRESHOLD = 20

function readAcademyProgress(): Record<string, boolean> {
  if (typeof window === 'undefined') return {}
  try {
    const saved = localStorage.getItem('aboutiam-academy-progress')
    return saved ? JSON.parse(saved) : {}
  } catch {
    return {}
  }
}

function readCompletedLabs(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const saved = localStorage.getItem('aboutiam_labs_completed')
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

export default function PortfolioExport() {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const { completedModuleCount, completedLabCount } = useMemo(() => {
    const progress = readAcademyProgress()
    // Playground checkpoint keys are written as `${moduleId}_step_${n}` into the same
    // localStorage key by usePlayground.ts — exclude them so this only counts real
    // Academy module completions, not playground step checkpoints.
    const moduleCount = Object.entries(progress).filter(([key, done]) => done && !key.includes('_step_')).length
    return {
      completedModuleCount: moduleCount,
      completedLabCount: readCompletedLabs().length,
    }
  }, [])

  const bullets = useMemo(
    () =>
      generateResumeBullets({
        completedModuleCount,
        totalModuleCount: TOTAL_ACADEMY_MODULES,
        completedLabCount,
        passedCertTitles: [],
      }),
    [completedModuleCount, completedLabCount]
  )

  const hasEarnedBadge = completedModuleCount >= BADGE_THRESHOLD

  const copyBullet = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const downloadBadge = () => {
    if (!hasEarnedBadge) return
    const issuedOn = new Date().toISOString().slice(0, 10)
    const badgeSvg = buildBadgeSvg({
      recipientName: 'AboutIAM Learner',
      badgeName: 'IAM Academy Contributor',
      badgeDescription: `Completed ${completedModuleCount} of ${TOTAL_ACADEMY_MODULES} AboutIAM Academy modules.`,
      criteriaText: `Complete at least ${BADGE_THRESHOLD} of ${TOTAL_ACADEMY_MODULES} IAM Academy modules.`,
      issuedOn,
      badgeId: 'iam-academy-contributor',
    })
    const blob = new Blob([badgeSvg], { type: 'image/svg+xml;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'aboutiam_academy_badge.svg'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadCertificate = async () => {
    const issuedOn = new Date().toISOString().slice(0, 10)
    const signed = await signCertificate({
      recipientName: 'AboutIAM Learner',
      completedModuleCount,
      totalModuleCount: TOTAL_ACADEMY_MODULES,
      completedLabCount,
      issuedOn,
      certificateId: `aboutiam-${issuedOn}-${completedModuleCount}-${completedLabCount}`,
    })
    const blob = new Blob([JSON.stringify(signed, null, 2)], { type: 'application/json;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'aboutiam_completion_certificate.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadPortfolio = () => {
    const lines = [
      '# AboutIAM Portfolio Summary',
      '',
      ...bullets.map((b) => `- ${b.text}`),
      '',
      hasEarnedBadge ? '_Includes a verified Open Badges 2.0 SVG badge (downloaded separately)._' : '',
    ]
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'aboutiam_portfolio.md'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.print()
  }

  if (bullets.length === 0) {
    return (
      <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-2 shadow-sm">
        <span className="text-[10px] font-black text-text-muted uppercase block">Your Dynamic Portfolio</span>
        <p className="text-xs text-text-secondary leading-relaxed">
          Complete a few Academy modules or Playground labs to auto-generate quantified resume bullets and a verified completion badge here — nothing is fabricated, only what you've actually completed shows up.
        </p>
      </div>
    )
  }

  return (
    <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-black text-text-muted uppercase flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5" /> Your Dynamic Portfolio
        </span>
        <button
          onClick={downloadPortfolio}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-primary hover:bg-accent-hover text-white text-[11px] font-bold transition-all"
        >
          <Download className="w-3.5 h-3.5" /> Download Portfolio (PDF/Markdown)
        </button>
      </div>

      <div className="space-y-2.5">
        {bullets.map((bullet) => (
          <div key={bullet.id} className="p-3 rounded-lg bg-bg-sidebar border border-border-subtle/50 flex items-start justify-between gap-2 text-xs text-text-secondary leading-relaxed">
            <span>{bullet.text}</span>
            <button
              onClick={() => copyBullet(bullet.id, bullet.text)}
              className="p-1.5 rounded bg-bg-card border border-border-subtle text-text-muted hover:text-text-primary shrink-0"
              aria-label="Copy bullet"
            >
              {copiedId === bullet.id ? <Check className="w-3 h-3 text-status-success" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        ))}
      </div>

      {hasEarnedBadge && (
        <div className="p-3.5 rounded-lg bg-accent-glow border border-accent-primary/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-accent-primary shrink-0" />
            <div>
              <p className="text-xs font-bold text-text-primary">IAM Academy Contributor Badge Earned</p>
              <p className="text-[10px] text-text-secondary">A self-contained, verifiable Open Badges 2.0 SVG — bake-in metadata, no server required.</p>
            </div>
          </div>
          <button
            onClick={downloadBadge}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-accent-primary/30 text-accent-primary hover:bg-accent-glow/70 text-[11px] font-bold transition-all shrink-0"
          >
            <Download className="w-3.5 h-3.5" /> Badge
          </button>
        </div>
      )}

      <div className="p-3.5 rounded-lg bg-bg-sidebar border border-border-subtle/50 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-accent-secondary shrink-0" />
            <div>
              <p className="text-xs font-bold text-text-primary">Signed Completion Certificate</p>
              <p className="text-[10px] text-text-secondary">A Web Crypto-signed JSON certificate you can check with the Certificate Verifier tool.</p>
            </div>
          </div>
          <div className="flex gap-2 shrink-0 select-none">
            <a
              href={`https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent('AboutIAM Certified Identity Specialist')}&organizationName=${encodeURIComponent('AboutIAM')}&certUrl=${encodeURIComponent('https://www.aboutiam.com/tools/certificate-verifier')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0a66c2] hover:bg-[#004182] text-white text-[11px] font-bold transition-all"
            >
              Add to LinkedIn 🚀
            </a>
            <button
              onClick={downloadCertificate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-accent-secondary/30 text-accent-secondary hover:bg-accent-glow/40 text-[11px] font-bold transition-all"
            >
              <Download className="w-3.5 h-3.5" /> Certificate
            </button>
          </div>
        </div>
        <p className="text-[10px] text-text-muted leading-relaxed">
          This confirms the certificate's contents haven't been altered since AboutIAM generated it in your browser
          — it is not a substitute for third-party-issued professional certification and should not be represented
          as one. Verify any certificate at the{' '}
          <Link to="/tools/certificate-verifier" className="text-accent-primary hover:text-accent-hover font-semibold">
            Certificate Verifier
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
