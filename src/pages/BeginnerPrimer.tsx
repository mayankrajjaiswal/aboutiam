import { useState } from 'react'
import { 
  GraduationCap, HelpCircle, Key, Users, 
  ArrowRight, ShieldCheck, Terminal, Compass, Info
} from 'lucide-react'
import { Link } from 'react-router-dom'

export default function BeginnerPrimer() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null)

  const faqs = [
    {
      q: "1. Why can't we just use passwords anymore?",
      a: "Passwords have major flaws: people reuse them, they can be stolen in data leaks, or guessed via software guessing tricks. More than 80% of corporate data breaches are caused by weak or stolen passwords. Modern IAM uses secure Multi-Factor Authentication (MFA) or biometric 'Passkeys' to completely bypass passwords."
    },
    {
      q: "2. What is the difference between Workforce IAM and Customer IAM (CIAM)?",
      a: "Workforce IAM manages your employees. The priority is maximum security, strict directory hierarchies (like Active Directory), and audit logging. Customer IAM (CIAM) manages your customers. The priority is friction-free signing up, social login button shortcuts (e.g. Sign in with Google), progressive profiles, and brand trust."
    },
    {
      q: "3. What is a 'Passkey' and how does it work?",
      a: "A Passkey replaces passwords by using the security chip inside your smartphone or computer. When you log in, the device asks for your face or fingerprint locally. If approved, the chip signs a cryptographic challenge and sends the signature to the website. Your biometric details never leave your device, and there is no password on the website server to be leaked!"
    },
    {
      q: "4. What is 'Federation' or Single Sign-On (SSO)?",
      a: "Federation is a trust agreement between different companies. When you click 'Sign in with Google' on Spotify, Spotify trusts Google to authenticate you. Google handles the login and securely tells Spotify: 'Yes, this is Alex, and their email is alex@gmail.com'. This allows you to log in with one master key across the entire internet."
    }
  ]

  const pillars = [
    {
      title: "1. Identification",
      sub: "Claiming who you are",
      desc: "Like walking up to a bouncer and typing in your username or email address. You are telling the system: 'My name is Alex.'",
      icon: Users,
      badgeColor: "bg-accent-glow text-accent-primary border-accent-primary/20"
    },
    {
      title: "2. Authentication",
      sub: "Proving your claim",
      desc: "Providing secrets only the true owner possesses. This could be typing a password, receiving a mobile push notification, or scanning your face.",
      icon: Key,
      badgeColor: "bg-status-warning/5 text-status-warning border-status-warning/20"
    },
    {
      title: "3. Authorization",
      sub: "Mapping your permissions",
      desc: "The system checks its policy registry to determine what doors you can unlock. E.g., 'Alex is a reader, but cannot edit billing details.'",
      icon: ShieldCheck,
      badgeColor: "bg-status-success/5 text-status-success border-status-success/20"
    },
    {
      title: "4. Accounting & Audit",
      sub: "Recording your footprint",
      desc: "Every action, login time, and resource modification is stamped and saved inside a secure, unalterable log file for forensic auditors.",
      icon: Terminal,
      badgeColor: "bg-status-info/5 text-status-info border-status-info/20"
    }
  ]

  return (
    <div className="space-y-12 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Welcome */}
      <section className="relative p-8 rounded-2xl bg-bg-card border border-border-subtle overflow-hidden shadow-sm flex flex-col md:flex-row items-center gap-8">
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-4 md:w-2/3 relative z-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1.5 rounded-full border border-accent-primary/10">
            <GraduationCap className="w-4 h-4 animate-bounce" /> Layman's Onboarding Portal
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-text-primary leading-tight">
            New to Identity? <br />
            <span className="bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
              Start Your Journey Here
            </span>
          </h2>
          <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-2xl font-medium">
            Welcome, students, interns, and future security architects! Identity and Access Management (IAM) is the fundamental cornerstone of modern cyber security. Think of it as the **digital bouncer of the internet**. Let's break down how it secures our digital universe.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              to="/learn"
              className="inline-flex items-center gap-1 text-xs font-bold text-accent-primary hover:text-accent-hover transition-colors"
            >
              Browse Academy Courses <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <div className="md:w-1/3 shrink-0 flex items-center justify-center relative z-10">
          <Compass className="w-36 h-36 text-accent-primary/20 stroke-[1.2px] animate-spin-slow" />
        </div>
      </section>

      {/* What is IAM? Simple Analogy */}
      <section className="grid md:grid-cols-2 gap-8 items-center pt-4">
        <div className="space-y-4">
          <h3 className="text-2xl font-extrabold text-text-primary">What is Identity & Access Management?</h3>
          <p className="text-sm text-text-secondary leading-relaxed font-semibold">
            In the physical world, your house has a front door lock. Your car has a physical key. Your office has a plastic badge. 
          </p>
          <p className="text-sm text-text-secondary leading-relaxed font-semibold">
            In the digital world, websites, mobile apps, and databases don't have physical doors. Instead, they use **IAM** as their software bouncer. Every time you log into Spotify, check your bank account, or download a file at work, an IAM engine verifies **who you are** and determines **what resources you are allowed to see**.
          </p>
          <div className="p-4 bg-bg-sidebar rounded-xl border border-border-subtle flex gap-3">
            <Info className="w-5 h-5 text-accent-primary shrink-0 mt-0.5" />
            <p className="text-xs text-text-muted leading-relaxed font-bold">
              "Without IAM, there is no boundary on the internet. Anyone could read your personal messages, edit bank balances, or take down power grids."
            </p>
          </div>
        </div>

        {/* Bouncer Graphic Simulation */}
        <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4 font-mono">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block border-b border-border-subtle/50 pb-2">The Digital Bouncer Lifecycle</span>
          <div className="p-4 bg-bg-sidebar rounded-xl border border-border-subtle space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-secondary font-bold">👤 User: "I want to see my viewing list."</span>
              <span className="text-status-warning font-bold">Access: Restricted</span>
            </div>
            <div className="h-0.5 bg-border-subtle/50 border-dashed"></div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-accent-primary font-bold">🛡️ Bouncer: "Who are you?"</span>
              <span className="text-text-muted">Username Prompt</span>
            </div>
            <div className="h-0.5 bg-border-subtle/50 border-dashed"></div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-accent-secondary font-bold">🔑 Bouncer: "Prove it!"</span>
              <span className="text-text-muted">Biometric FaceID Scan</span>
            </div>
            <div className="h-0.5 bg-border-subtle/50 border-dashed"></div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-status-success font-bold">🔓 Bouncer: "Welcome back, Alex. Access Approved."</span>
              <span className="text-status-success font-bold">Open Session</span>
            </div>
          </div>
        </div>
      </section>

      {/* The 4 Pillars of IAM */}
      <section className="space-y-6 pt-4">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">The 4 Pillars of the Bouncer Lifecycle</h3>
          <p className="text-sm text-text-secondary">
            No matter how advanced or corporate an identity system is, it always breaks down into these 4 simple chronological steps.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((p, idx) => (
            <div key={idx} className="p-5 rounded-xl bg-bg-card border border-border-subtle flex flex-col justify-between shadow-sm">
              <div className="space-y-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${p.badgeColor}`}>
                  <p.icon className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-black text-text-primary">{p.title}</h4>
                  <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{p.sub}</span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed font-semibold pt-1">
                  {p.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Onboarding FAQ Accordion */}
      <section className="grid lg:grid-cols-3 gap-8 pt-4">
        {/* Intro */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-2xl font-extrabold text-text-primary">Beginner FAQs</h3>
          <p className="text-sm text-text-secondary leading-relaxed font-semibold">
            Common questions that college students, interns, and laymen ask when first exploring identity architectures. Click on any question to slide open the simplified explanation.
          </p>
        </div>

        {/* FAQs */}
        <div className="lg:col-span-2 space-y-3">
          {faqs.map((f, idx) => {
            const isOpen = activeFaq === idx
            return (
              <div 
                key={idx} 
                className={`rounded-xl border transition-all ${
                  isOpen ? 'border-accent-primary bg-bg-card' : 'border-border-subtle bg-bg-card/50'
                }`}
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full text-left p-4 flex justify-between items-center gap-4 focus:outline-none"
                >
                  <span className={`text-sm font-black transition-colors ${isOpen ? 'text-accent-primary' : 'text-text-primary'}`}>
                    {f.q}
                  </span>
                  <HelpCircle className={`w-4 h-4 shrink-0 transition-colors ${isOpen ? 'text-accent-primary' : 'text-text-muted'}`} />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs sm:text-sm text-text-secondary leading-relaxed font-semibold border-t border-border-subtle/30 pt-3 animate-fadeIn">
                    {f.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Graduation Call to Action */}
      <section className="p-8 rounded-2xl bg-bg-sidebar border border-border-subtle text-center space-y-4 max-w-4xl mx-auto">
        <h4 className="text-xl font-bold text-text-primary">Ready to Test Your New Knowledge?</h4>
        <p className="text-xs text-text-secondary max-w-xl mx-auto font-medium">
          You are no longer a layman! You understand the bouncer concept, the 4 chronological pillars, and why weak passwords are dying. Let's start practice!
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/encyclopedia"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-all shadow-md shadow-accent-primary/10"
          >
            Explore Acronyms (A-Z Glossary) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/playground"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-border-subtle bg-bg-card hover:bg-bg-sidebar text-text-primary text-xs font-bold transition-all"
          >
            Open Interactive Simulators
          </Link>
        </div>
      </section>
    </div>
  )
}
