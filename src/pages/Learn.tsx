import { BookOpen, Compass, Key, Lock, Fingerprint, Users, Server } from 'lucide-react'

export default function Learn() {
  const tracks = [
    {
      title: "Foundations of Identity",
      desc: "Identity Lifecycles, standard credentials, and differences between authentication and authorization.",
      modules: 6,
      icon: Compass,
    },
    {
      title: "Directory Services & Legacy SSO",
      desc: "LDAP structures, Active Directory schemas, and Kerberos Ticket exchanges.",
      modules: 6,
      icon: Server,
    },
    {
      title: "Modern Federation & APIs",
      desc: "OAuth 2.0 grant types, OIDC specifications, JWKS key configurations, and SCIM provisioning.",
      modules: 8,
      icon: Key,
    },
    {
      title: "Customer IAM (CIAM)",
      desc: "Multi-tenancy isolation, progressive profiles, social login flow, and privacy consent tracking.",
      modules: 6,
      icon: Users,
    },
    {
      title: "Enterprise Governance & Privilege",
      desc: "IGA governance metrics, PAM vault controls, and session recording patterns.",
      modules: 5,
      icon: Lock,
    },
    {
      title: "Zero Trust & Future Identity",
      desc: "Continuous Adaptive Trust, Shared Signals (CAEP/SSF), and Decentralized Identity DIDs.",
      modules: 5,
      icon: Fingerprint,
    }
  ]

  return (
    <div className="space-y-10 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
          <BookOpen className="w-3.5 h-3.5" /> AboutIAM Academy
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          Structured Learning Curriculum
        </h2>
        <p className="text-text-secondary">
          Bridge the gap from 1990s directory trees to future decentralized verifiable credentials. Fully structured courses designed for developers and security architects alike.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tracks.map((track, i) => (
          <div key={i} className="p-6 rounded-xl bg-bg-card border border-border-subtle hover:border-accent-primary/30 hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-lg bg-accent-glow text-accent-primary flex items-center justify-center border border-accent-primary/10">
                <track.icon className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-text-primary">{track.title}</h4>
              <p className="text-sm text-text-secondary leading-relaxed">{track.desc}</p>
            </div>
            <div className="flex items-center justify-between pt-6 border-t border-border-subtle/50 mt-6">
              <span className="text-xs font-semibold text-text-muted">{track.modules} Learning Modules</span>
              <button className="text-xs font-bold text-accent-primary hover:text-accent-hover transition-colors">
                Start Track →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
