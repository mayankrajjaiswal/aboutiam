import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Map, BookOpen, Cpu, CheckCircle2, Star
} from 'lucide-react'

interface Stage {
  id: string
  title: string
  subtitle: string
  desc: string
  milestones: string[]
  academyTrackLink: string
  playgroundLink?: string
  playgroundLabel?: string
  certifications: string[]
}

export default function Roadmap() {
  const [activeStage, setActiveStage] = useState('stage-1')

  const stages: Stage[] = [
    {
      id: 'stage-1',
      title: 'Stage 1: Layman Foundations (The "Zero" State)',
      subtitle: 'Understand core metaphors and security blocks',
      desc: 'Before reading dry RFC specifications, you must grasp the baseline vocabulary. Master the difference between identifying yourself and proving your claim, and learn why passwords are being deprecated.',
      milestones: [
        'Understand the "Digital Bouncer" analogy (Identify vs Authenticate)',
        'Differentiate Authentication (AuthN) from Authorization (AuthZ)',
        'Explore Multi-Factor Authentication (MFA) parameters'
      ],
      academyTrackLink: '/primer',
      certifications: ['CompTIA Security+ (Core Foundations)']
    },
    {
      id: 'stage-2',
      title: 'Stage 2: Enterprise Directories (Corporate Heritage)',
      subtitle: 'Understand how corporations organize resources and employees',
      desc: 'Master the legacy building blocks of enterprise networks. Learn how thousands of employees, office groups, and hardware nodes are organized hierarchically and authenticated in centralized domains.',
      milestones: [
        'Master LDAP trees, Distinguished Names (DNs), and Schemas',
        'Learn Active Directory Domain Controller and Group Policy (GPO) architectures',
        'Deconstruct the Kerberos triple-handshake (TGT, KDC, tickets)'
      ],
      academyTrackLink: '/learn',
      playgroundLink: '/playground/ldap',
      playgroundLabel: 'Launch LDAP Tree Simulator',
      certifications: ['Active Directory / Windows Server Administrator Certs']
    },
    {
      id: 'stage-3',
      title: 'Stage 3: Modern Web Federation & APIs (The Developer)',
      subtitle: 'Connect separate cloud applications and secure APIs',
      desc: 'Step into the modern web. Learn how single-page applications and mobile backends share secure access sessions using lightweight JSON tokens and federate logins across company boundaries.',
      milestones: [
        'Master the 4 OAuth 2.0 roles (Owner, Client, Auth Server, API)',
        'Understand OAuth 2.1 S256 PKCE cryptographic verifications',
        'Deconstruct OIDC id_tokens and JSON Web Token (JWT) signature checks'
      ],
      academyTrackLink: '/learn',
      playgroundLink: '/playground/oauth',
      playgroundLabel: 'Launch OAuth Handshake Visualizer',
      certifications: ['Okta Certified Professional / Developer']
    },
    {
      id: 'stage-4',
      title: 'Stage 4: Identity Governance & Administration (The Architect)',
      subtitle: 'Audit enterprise access and enforce least-privilege',
      desc: 'Transition to enterprise management. Learn how to prevent internal fraud via segregation of duties (SoD), secure administrative accounts inside vaults (PAM), and automate user lifecycles (SCIM).',
      milestones: [
        'Understand Identity Governance (IGA) attestation reviews',
        'Implement Privileged Access Management (PAM) Just-in-Time (JIT) sessions',
        'Automate user CRUD operations using standardized SCIM 2.0 JSONs'
      ],
      academyTrackLink: '/assess',
      playgroundLink: '/playground/access',
      playgroundLabel: 'Launch ABAC Access Control Engine',
      certifications: ['CISSP (Domain 5: Identity and Access Management)']
    },
    {
      id: 'stage-5',
      title: 'Stage 5: Zero Trust & Decentralized Cryptography (The "Hero")',
      subtitle: 'Build phishing-proof continuous trust architectures',
      desc: 'Reach the cutting edge. Transition from one-time login events to continuous ambient evaluation. Explore phishing-proof biometric Passkeys and decentralized zero-knowledge proof wallets.',
      milestones: [
        'Model NIST SP 800-207 Zero Trust PDP/PEP score evaluation algorithms',
        'Implement FIDO2 / WebAuthn cryptographic Passkey registrations',
        'Explore Zero-Knowledge Proofs (ZKP) and W3C Verifiable Credentials'
      ],
      academyTrackLink: '/learn',
      playgroundLink: '/playground/zta',
      playgroundLabel: 'Launch Zero Trust Planner',
      certifications: ['CCSP (Certified Cloud Security Professional)', 'FIDO Alliance Certifications']
    }
  ]

  const active = stages.find(s => s.id === activeStage) || stages[0]

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
          <Map className="w-3.5 h-3.5" /> Learning Pathway
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          The "Zero to Hero" IAM Roadmap
        </h2>
        <p className="text-text-secondary">
          A highly structured, sequential blueprint mapping out your exact learning path. Complete academy modules, test matching playgrounds, and prepare for industry cybersecurity certifications.
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar Stepper Timeline */}
        <div className="lg:col-span-1 space-y-4">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Recommended Sequence</span>
          <div className="space-y-3 border-l-2 border-border-subtle ml-3 pl-4">
            {stages.map((s) => {
              const isActive = activeStage === s.id
              return (
                <div key={s.id} className="relative">
                  <div className={`absolute -left-[23px] top-4 w-3 h-3 rounded-full border-2 transition-all ${
                    isActive ? 'bg-accent-primary border-accent-primary shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-bg-base border-border-subtle'
                  }`}></div>
                  <button
                    onClick={() => setActiveStage(s.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-accent-glow border-accent-primary/30 shadow-sm'
                        : 'bg-bg-card border-border-subtle hover:border-accent-primary/20'
                    }`}
                  >
                    <span className={`block font-black text-xs ${isActive ? 'text-accent-primary' : 'text-text-primary'}`}>{s.title.split(':')[0]}</span>
                    <span className="block text-[10px] text-text-muted font-semibold mt-1 leading-normal">{s.subtitle}</span>
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Active Stage Detail Dashboard */}
        <div className="lg:col-span-3">
          <div className="p-8 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-8 animate-fadeIn h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-accent-primary/5 rounded-full blur-3xl pointer-events-none"></div>

            {/* Header */}
            <div className="space-y-2 border-b border-border-subtle pb-6 relative z-10">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Active Quest Plan</span>
              <h3 className="text-2xl sm:text-3xl font-black text-text-primary">{active.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed font-semibold max-w-2xl">
                {active.desc}
              </p>
            </div>

            {/* Checklist & Actions */}
            <div className="grid md:grid-cols-2 gap-6 relative z-10 text-xs sm:text-sm">
              {/* Milestones Checklist */}
              <div className="p-6 bg-bg-sidebar/50 rounded-xl border border-border-subtle space-y-4">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Required Milestones</span>
                <div className="space-y-3">
                  {active.milestones.map((m, i) => (
                    <div key={i} className="flex gap-2.5 items-start text-xs font-semibold text-text-secondary leading-relaxed">
                      <CheckCircle2 className="w-4.5 h-4.5 text-accent-primary shrink-0 mt-0.5" />
                      <span>{m}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Targets */}
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Action Targets</span>
                
                {/* Academy Link */}
                <div className="p-4 bg-bg-sidebar/30 border border-border-subtle rounded-xl flex justify-between items-center gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold text-accent-primary uppercase tracking-wider block">Theoretical Study</span>
                    <span className="text-xs font-bold text-text-primary">Complete matching Academy modules</span>
                  </div>
                  <Link
                    to={active.academyTrackLink}
                    className="p-2 rounded-lg bg-accent-primary hover:bg-accent-hover text-white transition-colors"
                  >
                    <BookOpen className="w-4 h-4" />
                  </Link>
                </div>

                {/* Optional Simulator Link */}
                {active.playgroundLink && (
                  <div className="p-4 bg-bg-sidebar/30 border border-border-subtle rounded-xl flex justify-between items-center gap-4 animate-fadeIn">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-bold text-accent-secondary uppercase tracking-wider block">Interactive Practice</span>
                      <span className="text-xs font-bold text-text-primary">{active.playgroundLabel}</span>
                    </div>
                    <Link
                      to={active.playgroundLink}
                      className="p-2 rounded-lg bg-accent-secondary hover:bg-accent-primary hover:text-white text-accent-secondary transition-colors"
                    >
                      <Cpu className="w-4 h-4" />
                    </Link>
                  </div>
                )}

                {/* Target Certifications */}
                <div className="p-4 bg-status-warning/5 border border-status-warning/25 rounded-xl space-y-2">
                  <span className="text-[10px] font-bold text-status-warning uppercase tracking-wider flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-current" /> Target Cybersecurity Certification
                  </span>
                  <ul className="list-disc pl-4 text-xs text-text-secondary leading-relaxed font-semibold space-y-1">
                    {active.certifications.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
