import { Link } from 'react-router-dom'
import { BookOpen, ShieldAlert, Award, Compass, ArrowRight, ShieldCheck, Cpu, Terminal, Users, Layers, GraduationCap, Sparkles, Wrench, Network, Building, ScanSearch, History, CalendarDays, FileBarChart } from 'lucide-react'

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

        {/* Onboarding card banner specifically for absolute beginners/laymen */}
        <div className="p-4 rounded-xl bg-accent-glow/5 border border-accent-primary/20 max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-lg bg-accent-primary text-white flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5 animate-pulse-slow" />
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-text-primary">New to Identity Security?</span>
              <p className="text-[11px] text-text-secondary font-medium">Read our layman-friendly bouncer analogy guide, perfect for interns and students!</p>
            </div>
          </div>
          <Link
            to="/primer"
            className="w-full sm:w-auto text-center px-4 py-2 rounded-lg bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-all shrink-0 shadow"
          >
            Start Layman Primer →
          </Link>
        </div>

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

          {/* Security Tools Card */}
          <Link
            to="/tools"
            className="group p-6 rounded-xl bg-bg-card border border-border-subtle hover:border-accent-primary/30 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-10 h-12 rounded-lg bg-accent-glow text-accent-primary flex items-center justify-center border border-accent-primary/10">
                <Wrench className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-text-primary group-hover:text-accent-primary transition-colors">
                Security Tools
              </h4>
              <p className="text-sm text-text-secondary leading-relaxed">
                Free client-side utilities — JWT decoder, bcrypt generator, TOTP, PKCE, X.509 decoder, and more. No signup, nothing uploaded.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-accent-primary pt-4 group">
              Open Tools <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
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

          {/* Certification Hub Card */}
          <Link
            to="/certifications"
            className="group p-6 rounded-xl bg-bg-card border border-border-subtle hover:border-accent-primary/30 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-10 h-12 rounded-lg bg-accent-glow text-accent-primary flex items-center justify-center border border-accent-primary/10">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-text-primary group-hover:text-accent-primary transition-colors">
                Certification Hub
              </h4>
              <p className="text-sm text-text-secondary leading-relaxed">
                27 beginner-to-advanced credentials — Microsoft, Okta, CyberArk, AWS, CISSP, and more — with study blueprints and practice tests.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-accent-primary pt-4 group">
              Open Hub <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </section>

      {/* Architect & Reference Ecosystem */}
      <section className="space-y-8 pt-6">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl font-bold tracking-tight text-text-primary">Architect & Governance Ecosystem</h2>
          <p className="text-text-secondary">
            Deep-dive enterprise design patterns, clickable topologies, vendor platforms, and standards research.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Architecture Center */}
          <Link
            to="/architecture"
            className="group p-6 rounded-xl bg-bg-card border border-border-subtle hover:border-accent-primary/30 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-10 h-12 rounded-lg bg-accent-glow text-accent-primary flex items-center justify-center border border-accent-primary/10">
                <Network className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-text-primary group-hover:text-accent-primary transition-colors">
                Architecture Center
              </h4>
              <p className="text-sm text-text-secondary leading-relaxed">
                Clickable, interactive security architecture blueprints for Workforce Zero Trust (NIST SP 800-207), SaaS Tenancy, and Multi-Cloud.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-accent-primary pt-4 group">
              Open Center <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Design Patterns */}
          <Link
            to="/patterns"
            className="group p-6 rounded-xl bg-bg-card border border-border-subtle hover:border-accent-primary/30 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-10 h-12 rounded-lg bg-accent-glow text-accent-primary flex items-center justify-center border border-accent-primary/10">
                <Layers className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-text-primary group-hover:text-accent-primary transition-colors">
                Design Patterns
              </h4>
              <p className="text-sm text-text-secondary leading-relaxed">
                Hardened reference patterns, token exchange flows (RFC 8693), and integration checklists for multi-tenant SaaS and passwordless.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-accent-primary pt-4 group">
              Browse Patterns <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Identity Timeline */}
          <Link
            to="/timeline"
            className="group p-6 rounded-xl bg-bg-card border border-border-subtle hover:border-accent-primary/30 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-10 h-12 rounded-lg bg-accent-glow text-accent-primary flex items-center justify-center border border-accent-primary/10">
                <History className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-text-primary group-hover:text-accent-primary transition-colors">
                Identity Timeline
              </h4>
              <p className="text-sm text-text-secondary leading-relaxed">
                An immersive, interactive journey through the history of digital identity from 1961 mainframes to future ambient trust.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-accent-primary pt-4 group">
              Open Timeline <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Vendor Center */}
          <Link
            to="/vendor"
            className="group p-6 rounded-xl bg-bg-card border border-border-subtle hover:border-accent-primary/30 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-10 h-12 rounded-lg bg-accent-glow text-accent-primary flex items-center justify-center border border-accent-primary/10">
                <Building className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-text-primary group-hover:text-accent-primary transition-colors">
                Vendor Center
              </h4>
              <p className="text-sm text-text-secondary leading-relaxed">
                Checklists, licensed models, certified paths, and custom interview guides for Entra ID, Okta, Keycloak, Ping, and CyberArk.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-accent-primary pt-4 group">
              Browse Vendors <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Research & CVEs */}
          <Link
            to="/research"
            className="group p-6 rounded-xl bg-bg-card border border-border-subtle hover:border-accent-primary/30 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-10 h-12 rounded-lg bg-accent-glow text-accent-primary flex items-center justify-center border border-accent-primary/10">
                <ScanSearch className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-text-primary group-hover:text-accent-primary transition-colors">
                Research & CVEs
              </h4>
              <p className="text-sm text-text-secondary leading-relaxed">
                Search identity CVE directories (Log4Shell, Spring4Shell) with remediation code, and track active standard IETF RFC drafts.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-accent-primary pt-4 group">
              Open Database <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Threat Intel & Bulletins */}
          <Link
            to="/bulletins"
            className="group p-6 rounded-xl bg-bg-card border border-border-subtle hover:border-accent-primary/30 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-10 h-12 rounded-lg bg-accent-glow text-accent-primary flex items-center justify-center border border-accent-primary/10">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-text-primary group-hover:text-accent-primary transition-colors">
                Threat Intel & Advisories
              </h4>
              <p className="text-sm text-text-secondary leading-relaxed">
                Active incident response playbooks for high-profile breaches (Okta Support, SolarWinds) and interactive crisis response simulators.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-accent-primary pt-4 group">
              Open Bulletins <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Events & Conferences */}
          <Link
            to="/events"
            className="group p-6 rounded-xl bg-bg-card border border-border-subtle hover:border-accent-primary/30 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-10 h-12 rounded-lg bg-accent-glow text-accent-primary flex items-center justify-center border border-accent-primary/10">
                <CalendarDays className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-text-primary group-hover:text-accent-primary transition-colors">
                Events & Conferences
              </h4>
              <p className="text-sm text-text-secondary leading-relaxed">
                Upcoming IAM conferences and summits — EIC, Identiverse, Gartner IAM Summit, Authenticate, RSAC — with dates, locations, and official links.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-accent-primary pt-4 group">
              View Calendar <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>

          {/* Industry Reports */}
          <Link
            to="/reports"
            className="group p-6 rounded-xl bg-bg-card border border-border-subtle hover:border-accent-primary/30 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-10 h-12 rounded-lg bg-accent-glow text-accent-primary flex items-center justify-center border border-accent-primary/10">
                <FileBarChart className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-bold text-text-primary group-hover:text-accent-primary transition-colors">
                Industry Reports
              </h4>
              <p className="text-sm text-text-secondary leading-relaxed">
                Gartner Magic Quadrant, Forrester Wave, and KuppingerCole Leadership Compass abstracts, named leaders, and a cross-analyst vendor leaderboard, plus Thales's annual Data Threat Report research.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-accent-primary pt-4 group">
              Browse Reports <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        </div>
      </section>

      {/* Identity Trivia & Curious Cases */}
      <section className="space-y-6 pt-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent-primary animate-pulse-slow" />
          <h3 className="text-2xl font-extrabold text-text-primary">Identity Trivia & Curious Cases</h3>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Fact 1 */}
          <div className="p-5 rounded-xl bg-bg-card border border-border-subtle hover:border-accent-primary/20 transition-all space-y-3 shadow-sm">
            <span className="text-[9px] font-black text-accent-primary uppercase bg-accent-glow px-2 py-0.5 rounded border border-accent-primary/10 w-fit block">1961 | The First Password</span>
            <p className="text-xs text-text-secondary leading-relaxed font-semibold">
              MIT's CTSS introduced the first computer password to limit mainframe terminal use. Fernando Corbató's team bypassed it immediately by printing out the master password file to share game terminal hours!
            </p>
          </div>
          {/* Fact 2 */}
          <div className="p-5 rounded-xl bg-bg-card border border-border-subtle hover:border-accent-primary/20 transition-all space-y-3 shadow-sm">
            <span className="text-[9px] font-black text-accent-secondary uppercase bg-accent-glow px-2 py-0.5 rounded border border-accent-secondary/10 w-fit block">Mythology | Kerberos</span>
            <p className="text-xs text-text-secondary leading-relaxed font-semibold">
              Kerberos is named after Cerberus, the Greek three-headed dog guarding the underworld. The three heads represent the Client, Server, and KDC—all must trust each other for trusted entry!
            </p>
          </div>
          {/* Fact 3 */}
          <div className="p-5 rounded-xl bg-bg-card border border-border-subtle hover:border-accent-primary/20 transition-all space-y-3 shadow-sm">
            <span className="text-[9px] font-black text-status-danger uppercase bg-status-danger/5 px-2 py-0.5 rounded border border-status-danger/10 w-fit block">SolarWinds | Golden SAML</span>
            <p className="text-xs text-text-secondary leading-relaxed font-semibold">
              Attackers stole on-premises private token-signing certificates to forge SAML assertions offline, bypassing cloud-passwords, MFA, and conditional access policies completely undetected.
            </p>
          </div>
          {/* Fact 4 */}
          <div className="p-5 rounded-xl bg-bg-card border border-border-subtle hover:border-accent-primary/20 transition-all space-y-3 shadow-sm">
            <span className="text-[9px] font-black text-accent-primary uppercase bg-accent-glow px-2 py-0.5 rounded border border-accent-primary/10 w-fit block">1986 | RSA SecurID Token</span>
            <p className="text-xs text-text-secondary leading-relaxed font-semibold">
              Patented by RSA Security, the hardware token revolutionized MFA by generating numeric, time-syncing passcodes from local internal crystal oscillators, introducing seed key synchronization.
            </p>
          </div>
          {/* Fact 5 */}
          <div className="p-5 rounded-xl bg-bg-card border border-border-subtle hover:border-accent-primary/20 transition-all space-y-3 shadow-sm">
            <span className="text-[9px] font-black text-accent-secondary uppercase bg-accent-glow px-2 py-0.5 rounded border border-accent-secondary/10 w-fit block">1997 | CAPTCHA Invention</span>
            <p className="text-xs text-text-secondary leading-relaxed font-semibold">
              CMU researchers invented Completely Automated Public Turing tests to tell Computers and Humans Apart (CAPTCHA) to block automated bot crawler scripts from registering spam accounts.
            </p>
          </div>
          {/* Fact 6 */}
          <div className="p-5 rounded-xl bg-bg-card border border-border-subtle hover:border-accent-primary/20 transition-all space-y-3 shadow-sm">
            <span className="text-[9px] font-black text-status-success uppercase bg-status-success/5 px-2 py-0.5 rounded border border-status-success/10 w-fit block">1960 | Magnetic Stripe Badges</span>
            <p className="text-xs text-text-secondary leading-relaxed font-semibold">
              IBM engineer Forrest Parry struggled to adhere magnetic tape to plastic badges. His wife Dorothea suggested ironing the tape directly onto the plastic—inventing the universal security badge standard!
            </p>
          </div>
          {/* Fact 7 */}
          <div className="p-5 rounded-xl bg-bg-card border border-border-subtle hover:border-accent-primary/20 transition-all space-y-3 shadow-sm">
            <span className="text-[9px] font-black text-accent-primary uppercase bg-accent-glow px-2 py-0.5 rounded border border-accent-primary/10 w-fit block">1977 | The Smart Card</span>
            <p className="text-xs text-text-secondary leading-relaxed font-semibold">
              Patented by French inventor Roland Moreno, the smart card embedded a tiny silicon microchip into plastic, introducing tamper-resistant local cryptographic enclaves paving the way for SIM cards.
            </p>
          </div>
          {/* Fact 8 */}
          <div className="p-5 rounded-xl bg-bg-card border border-border-subtle hover:border-accent-primary/20 transition-all space-y-3 shadow-sm">
            <span className="text-[9px] font-black text-accent-secondary uppercase bg-accent-glow px-2 py-0.5 rounded border border-accent-secondary/10 w-fit block">2014 | STS Broker Inception</span>
            <p className="text-xs text-text-secondary leading-relaxed font-semibold">
              The Security Token Service (STS) broker decoupled identity federation, enabling enterprises to swap legacy AD Kerberos tickets for web-friendly cloud SAML/OIDC assertions on-the-fly.
            </p>
          </div>
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
