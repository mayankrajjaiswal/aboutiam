import { Link } from 'react-router-dom'
import { BookOpen, ShieldAlert, Award, Compass, ArrowRight, ShieldCheck, Cpu, Terminal, Users, Layers } from 'lucide-react'

export default function Home() {
  return (
    <div className="space-y-16 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="text-center space-y-6 pt-8 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-glow text-accent-primary text-xs font-semibold tracking-wider uppercase border border-accent-primary/20 animate-pulse-slow">
          <ShieldCheck className="w-4 h-4" /> The Unified Interactive IAM Workspace
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-text-primary leading-tight">
          Master Identity & Access <br />
          <span className="bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
            Management, Client-Side
          </span>
        </h1>
        <p className="text-lg sm:text-xl text-text-secondary max-w-2xl mx-auto font-normal">
          An open-source, interactive playground and curriculum designed for both developers and architects. Deconstruct OAuth handshakes, debug JWTs, and test access policies completely in your browser.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/playground"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-accent-primary hover:bg-accent-hover text-white font-medium transition-colors shadow-lg shadow-accent-primary/20"
          >
            Enter Playgrounds <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/learn"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-bg-card hover:bg-bg-sidebar text-text-primary border border-border-subtle font-medium transition-colors"
          >
            Browse Academy
          </Link>
        </div>
      </section>

      {/* Dual-Track Visual Map (Beginner vs. Expert) */}
      <section className="grid md:grid-cols-2 gap-8 pt-6">
        {/* Beginner's Track Card */}
        <div className="relative group p-8 rounded-2xl bg-bg-card border border-border-subtle shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-primary/5 rounded-full blur-2xl group-hover:bg-accent-primary/10 transition-all"></div>
          <div className="space-y-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-accent-glow text-accent-primary flex items-center justify-center border border-accent-primary/10">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-text-primary">Beginner Track</h3>
            <p className="text-text-secondary leading-relaxed">
              New to Identity or confused by the complex alphabet soup (OIDC, SAML, JWKS, SCIM)? Step onto our visual guided path with plain-English analogies, interactive glossaries, and clean sandbox workflows.
            </p>
            <ul className="space-y-2 text-sm text-text-muted">
              <li className="flex items-center gap-2">✔ Conceptual OAuth & SAML analogies</li>
              <li className="flex items-center gap-2">✔ Interactive acronym glossary tooltips</li>
              <li className="flex items-center gap-2">✔ Guided, one-click playground simulations</li>
            </ul>
          </div>
          <div className="pt-6 relative z-10">
            <Link
              to="/learn?track=foundations"
              className="inline-flex items-center gap-1.5 text-accent-primary hover:text-accent-hover font-semibold transition-colors group"
            >
              Start Learning <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Expert's Track Card */}
        <div className="relative group p-8 rounded-2xl bg-bg-card border border-border-subtle shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent-secondary/5 rounded-full blur-2xl group-hover:bg-accent-secondary/10 transition-all"></div>
          <div className="space-y-4 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-accent-glow text-accent-secondary flex items-center justify-center border border-accent-secondary/10">
              <Terminal className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-text-primary">Architect's Workbench</h3>
            <p className="text-text-secondary leading-relaxed">
              Are you a seasoned enterprise security architect or developer? Dive directly into in-browser cryptographic decoders, live custom OPA Rego policy compilers, raw LDAP directories, and OAuth vulnerability tests.
            </p>
            <ul className="space-y-2 text-sm text-text-muted">
              <li className="flex items-center gap-2">✔ WASM-compiled policy compilations</li>
              <li className="flex items-center gap-2">✔ Cryptographic signature wrapping vulnerability sandboxes</li>
              <li className="flex items-center gap-2">✔ Complete multi-tenant CIAM & PAM configurations</li>
            </ul>
          </div>
          <div className="pt-6 relative z-10">
            <Link
              to="/playground"
              className="inline-flex items-center gap-1.5 text-accent-secondary hover:text-accent-primary font-semibold transition-colors group"
            >
              Explore Sandbox <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Main Pillars Grid */}
      <section className="space-y-8 pt-6">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl font-bold tracking-tight text-text-primary">A Unified Security Workspace</h2>
          <p className="text-text-secondary">
            Every section of AboutIAM is integrated to bridge theory (Academy) directly with practice (Simulators).
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Academy Card */}
          <Link
            to="/learn"
            className="group p-6 rounded-xl bg-bg-card border border-border-subtle hover:border-accent-primary/30 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-10 h-12 rounded-lg bg-accent-glow text-accent-primary flex items-center justify-center border border-accent-primary/10">
                <BookOpen className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-text-primary group-hover:text-accent-primary transition-colors">
                IAM Academy
              </h4>
              <p className="text-sm text-text-secondary leading-relaxed">
                6 progressive tracks and 36 learning modules starting from LDAP and Kerberos to modern Passkeys and continuous adaptive zero trust.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-accent-primary pt-4 group">
              Browse Modules <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Playgrounds Card */}
          <Link
            to="/playground"
            className="group p-6 rounded-xl bg-bg-card border border-border-subtle hover:border-accent-primary/30 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-10 h-12 rounded-lg bg-accent-glow text-accent-primary flex items-center justify-center border border-accent-primary/10">
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-text-primary group-hover:text-accent-primary transition-colors">
                Interactive Playgrounds
              </h4>
              <p className="text-sm text-text-secondary leading-relaxed">
                Hands-on protocol sandboxes including OAuth 2.0 flow charting, JWT Studios, WebAuthn credential builders, and OPA Rego blocks.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-accent-primary pt-4 group">
              Open Simulators <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* GRC Assessments Card */}
          <Link
            to="/assess"
            className="group p-6 rounded-xl bg-bg-card border border-border-subtle hover:border-accent-primary/30 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-10 h-12 rounded-lg bg-accent-glow text-accent-primary flex items-center justify-center border border-accent-primary/10">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-text-primary group-hover:text-accent-primary transition-colors">
                Maturity assessments
              </h4>
              <p className="text-sm text-text-secondary leading-relaxed">
                Evaluate enterprise identity readiness across standard matrices. Graph interactive roadmaps and download exportable vectors.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-accent-primary pt-4 group">
              Start Assessment <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* AI Architect Assistant Card */}
          <Link
            to="/assistant"
            className="group p-6 rounded-xl bg-bg-card border border-border-subtle hover:border-accent-primary/30 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-10 h-12 rounded-lg bg-accent-glow text-accent-primary flex items-center justify-center border border-accent-primary/10">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-text-primary group-hover:text-accent-primary transition-colors">
                AI IAM Architect
              </h4>
              <p className="text-sm text-text-secondary leading-relaxed">
                RAG-powered conversational AI bot that helps you write secure AWS policies, OPA Rego assertions, and offers standard architectures.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-accent-primary pt-4 group">
              Chat with AI <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </section>

      {/* Informational Guidelines Trust Grid */}
      <section className="p-8 rounded-2xl bg-bg-sidebar border border-border-subtle grid sm:grid-cols-3 gap-8">
        <div className="flex gap-4">
          <div className="text-accent-primary mt-1 shrink-0"><Users className="w-6 h-6" /></div>
          <div className="space-y-1">
            <h5 className="font-bold text-text-primary">100% Client-Side</h5>
            <p className="text-xs text-text-secondary">All cryptography, compilation, and assessment scoring run secure and private inside your local browser.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="text-accent-primary mt-1 shrink-0"><Layers className="w-6 h-6" /></div>
          <div className="space-y-1">
            <h5 className="font-bold text-text-primary">Open-Source & Free</h5>
            <p className="text-xs text-text-secondary">Fully open-source under MIT, built for developers to customize and extend for standard environments.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="text-accent-primary mt-1 shrink-0"><ShieldCheck className="w-6 h-6" /></div>
          <div className="space-y-1">
            <h5 className="font-bold text-text-primary">Zero Setup Cost</h5>
            <p className="text-xs text-text-secondary">Run simulations without needing paid cloud subscription tokens or heavy hardware. Simply explore.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
