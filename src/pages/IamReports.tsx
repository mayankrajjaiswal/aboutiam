import { Link } from 'react-router-dom'
import { FileBarChart, ArrowUpRight, TrendingUp, ShieldAlert, BadgeCheck, Trophy } from 'lucide-react'
import { getReportsByPublisher, getVendorLeaderboard, canonicalLeaderName, LEADER_VENDOR_LINKS, IAM_REPORTS } from '../data/reportsRegistry'

const PUBLISHER_ACCENT: Record<string, string> = {
  Gartner: 'text-[#7B00FF] bg-[#7B00FF]/10 border-[#7B00FF]/20',
  Forrester: 'text-[#00549A] bg-[#00549A]/10 border-[#00549A]/20',
  KuppingerCole: 'text-accent-primary bg-accent-glow border-accent-primary/20',
  Thales: 'text-status-success bg-status-success/10 border-status-success/20',
}

function LeaderChip({ leader }: { leader: string }) {
  const name = canonicalLeaderName(leader)
  const vendorKey = LEADER_VENDOR_LINKS[name]
  const className = 'text-[11px] font-semibold px-2 py-0.5 rounded-full bg-status-success/10 text-status-success border border-status-success/20 hover:bg-status-success/20 transition-colors'

  if (vendorKey) {
    return (
      <Link to={`/vendor?v=${vendorKey}`} onClick={(e) => e.stopPropagation()} className={className}>
        {name}
      </Link>
    )
  }
  return <span className={className}>{name}</span>
}

function buildReportsJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': 'https://www.aboutiam.com/reports/',
    'name': 'AboutIAM Analyst Reports & Research',
    'description': 'Publisher-grouped directory of trusted third-party IAM research from Gartner, Forrester, KuppingerCole, and Thales.',
    'hasPart': IAM_REPORTS.map((r) => ({
      '@type': 'Report',
      '@id': `https://www.aboutiam.com/reports/#${r.slug}`,
      'headline': r.title,
      'publisher': { '@type': 'Organization', 'name': r.publisher },
      'datePublished': r.year,
      'description': r.summary,
      'url': r.link
    }))
  }
}

export default function IamReports() {
  const groups = getReportsByPublisher()
  const statsReport = IAM_REPORTS.find((r) => r.keyStats && r.keyStats.length > 0)
  const leaderboard = getVendorLeaderboard()

  return (
    <div className="space-y-10 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildReportsJsonLd()).replace(/</g, '\\u003c') }}
      />
      <section className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-glow text-accent-primary text-xs font-semibold tracking-wider uppercase border border-accent-primary/20">
          <FileBarChart className="w-4 h-4" /> Trusted Industry Research
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          IAM Analyst Reports & Research
        </h1>
        <p className="text-text-secondary text-lg">
          The market-defining reports from Gartner, Forrester, KuppingerCole, and Thales — Magic Quadrants, Waves, Leadership Compasses, and annual threat research, with abstracts, named leaders, and cross-analyst comparisons.
        </p>
      </section>

      {statsReport && statsReport.keyStats && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent-primary" />
            <h2 className="text-lg font-bold text-text-primary">By the Numbers — {statsReport.title} ({statsReport.year})</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsReport.keyStats.map((stat, i) => (
              <div key={i} className="p-5 rounded-xl bg-bg-card border border-border-subtle shadow-sm">
                <p className="text-sm font-semibold text-text-primary leading-snug">{stat}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {leaderboard.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-accent-primary" />
            <h2 className="text-lg font-bold text-text-primary">Cross-Analyst Leaderboard</h2>
          </div>
          <p className="text-sm text-text-secondary max-w-3xl">
            Vendors named a Leader by two or more of Gartner, Forrester, and KuppingerCole independently — the strongest public signal of sustained market leadership.
          </p>
          <div className="overflow-x-auto rounded-xl border border-border-subtle bg-bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle text-left">
                  <th className="px-4 py-3 font-bold text-text-primary">Vendor</th>
                  <th className="px-4 py-3 font-bold text-text-primary text-center">Reports</th>
                  <th className="px-4 py-3 font-bold text-text-primary">Recognized In</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry) => {
                  const vendorKey = LEADER_VENDOR_LINKS[entry.vendor]
                  return (
                    <tr key={entry.vendor} className="border-b border-border-subtle/50 last:border-0">
                      <td className="px-4 py-3 font-semibold text-text-primary whitespace-nowrap">
                        {vendorKey ? (
                          <Link to={`/vendor?v=${vendorKey}`} className="hover:text-accent-primary transition-colors">
                            {entry.vendor}
                          </Link>
                        ) : entry.vendor}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-accent-glow text-accent-primary text-xs font-black">
                          {entry.count}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        <div className="flex flex-wrap gap-1.5">
                          {entry.reports.map((r) => (
                            <span key={r.slug} className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${PUBLISHER_ACCENT[r.publisher]}`}>
                              {r.publisher} · {r.year}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {groups.map((group) => (
        <section key={group.publisher} className="space-y-5">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${PUBLISHER_ACCENT[group.publisher]}`}>
              {group.publisher}
            </span>
            <span className="text-sm text-text-secondary">{group.reports.length} report{group.reports.length > 1 ? 's' : ''}</span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {group.reports.map((report) => {
              const Icon = report.icon
              return (
                <div
                  key={report.slug}
                  className="group p-6 rounded-xl bg-bg-card border border-border-subtle hover:border-accent-primary/30 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-lg bg-accent-glow text-accent-primary flex items-center justify-center border border-accent-primary/10">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border bg-text-muted/10 border-border-subtle text-text-secondary">
                        {report.reportType} · {report.year}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold text-text-primary group-hover:text-accent-primary transition-colors">
                      {report.title}
                    </h4>
                    <p className="text-sm text-text-secondary leading-relaxed">{report.summary}</p>
                    {report.leaders && report.leaders.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Named Leaders</span>
                        <div className="flex flex-wrap gap-1.5">
                          {report.leaders.map((leader) => (
                            <LeaderChip key={leader} leader={leader} />
                          ))}
                        </div>
                      </div>
                    )}
                    <p className={`flex items-start gap-1.5 text-[10px] leading-snug font-medium ${report.confidence === 'confirmed' ? 'text-status-success' : 'text-status-danger'}`}>
                      {report.confidence === 'confirmed'
                        ? <BadgeCheck className="w-3.5 h-3.5 shrink-0 mt-px" />
                        : <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-px" />}
                      <span>{report.verifiedVia} Verified {report.verifiedDate}.</span>
                    </p>
                  </div>
                  <a
                    href={report.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pt-6 mt-6 border-t border-border-subtle/50 flex items-center gap-1 text-xs font-semibold text-accent-primary hover:text-accent-hover transition-colors w-fit"
                  >
                    View Source <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
