import { Award, Download, Plus, LineChart } from 'lucide-react'

export default function Assess() {
  const categories = [
    { name: "Identity Governance & Administration (IGA)", status: "Pending" },
    { name: "Privileged Access Management (PAM)", status: "Pending" },
    { name: "Customer Identity & Access (CIAM)", status: "Pending" },
    { name: "Workforce Access Management (AM)", status: "Pending" },
    { name: "Zero Trust Policy & Adaptive Risk", status: "Pending" },
  ]

  return (
    <div className="space-y-10 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
          <Award className="w-3.5 h-3.5" /> GRC Governance
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          IAM Maturity Assessment Wizard
        </h2>
        <p className="text-text-secondary">
          Take our 15-step expert survey to map your organization's core identity readiness. Auto-calculate scoring graphs and download dynamic SVG roadmap checklists.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 pt-4">
        {/* Survey Modules Tracker */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-xl bg-bg-card border border-border-subtle space-y-4">
            <h4 className="font-bold text-text-primary flex items-center gap-2">Assessment Dimensions</h4>
            <div className="divide-y divide-border-subtle">
              {categories.map((cat, i) => (
                <div key={i} className="py-4 flex items-center justify-between first:pt-0 last:pb-0">
                  <span className="text-sm font-semibold text-text-primary">{cat.name}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-text-muted/10 text-text-secondary border border-border-subtle">
                    {cat.status}
                  </span>
                </div>
              ))}
            </div>
            <button className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-accent-primary hover:bg-accent-hover text-white text-sm font-semibold transition-colors mt-2">
              Start Assessment Survey <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic PDF Export Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-xl bg-bg-card border border-border-subtle space-y-4">
            <h4 className="font-bold text-text-primary flex items-center gap-2">
              <LineChart className="w-4 h-4 text-accent-primary" /> Roadmap Exporter
            </h4>
            <p className="text-xs text-text-secondary">
              Calculate alignment scores based on NIST, SOC2, and ISO architectures and export vector maps.
            </p>
            <button className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-border-subtle bg-bg-sidebar hover:bg-bg-nested text-text-primary text-xs font-semibold transition-colors cursor-not-allowed" disabled>
              Export SVG Roadmap <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
