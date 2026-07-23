import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, Mail, Heart, Send, CheckCircle2, Globe, ShieldCheck, ExternalLink, Lock, GitBranch, Bot, FileCheck
} from 'lucide-react'
import mayankPhoto from '../assets/contributors/mayank.jpg'
import rajatPhoto from '../assets/contributors/rajat.jpg'

interface ContributorLink {
  type: 'github' | 'email' | 'linkedin' | 'website'
  href: string
  label: string
}

interface Contributor {
  name: string
  affiliation: string
  bio: string
  avatar: string
  photo?: string
  links: ContributorLink[]
}

const contributors: Contributor[] = [
  {
    name: 'Rajat Rastogi',
    affiliation: 'IAM Engineering - Thales Group',
    bio: "A Senior Engineering Manager leading IAM engineering at Thales Group, bringing enterprise-scale identity and access management expertise to AboutIAM's hands-on, real-world approach to security education.",
    avatar: '🧑‍💻',
    photo: rajatPhoto,
    links: [
      { type: 'github', href: 'https://github.com/thalesgroup', label: "Browse Thales Group's GitHub" },
      { type: 'linkedin', href: 'https://www.linkedin.com/in/rajat-rastogi-7b97619/', label: 'Connect with Rajat on LinkedIn' },
      { type: 'email', href: 'mailto:rajatthales@gmail.com', label: 'Email Rajat' },
    ],
  },
  {
    name: 'Mayank Raj Jaiswal',
    affiliation: 'IAM Engineering - Thales Group',
    bio: 'A cybersecurity innovator and identity engineering visionary dedicated to making complex protocols (OAuth 2.1, OIDC, WebAuthn, ZTA) accessible, visual, and secure for everyone.',
    avatar: '👨‍💻',
    photo: mayankPhoto,
    links: [
      { type: 'github', href: 'https://github.com/mayankrajjaiswal/', label: "Browse Mayank's GitHub" },
      { type: 'linkedin', href: 'https://www.linkedin.com/in/mayankrajjaiswal/', label: 'Connect with Mayank on LinkedIn' },
      { type: 'website', href: 'https://www.mayankrajjaiswal.com/', label: "Visit Mayank's website" },
      { type: 'email', href: 'mailto:mayankrajjaiswal@gmail.com', label: 'Email Mayank' },
    ],
  },
]

const CONTACT_EMAIL = 'mayankrajjaiswal@gmail.com'
const GITHUB_SECURITY_URL = 'https://github.com/mayankrajjaiswal/aboutiam/security'

interface SecurityControl {
  icon: typeof ShieldCheck
  title: string
  desc: string
}

const SECURITY_CONTROLS: SecurityControl[] = [
  { icon: Lock, title: 'Content-Security-Policy', desc: "Strict CSP with connect-src 'none' enforced via meta tag, since GitHub Pages serves no custom HTTP headers." },
  { icon: ShieldCheck, title: 'Referrer-Policy Hardening', desc: 'Restrictive referrer policy prevents leaking full URLs (including query params) to third-party destinations.' },
  { icon: GitBranch, title: 'SHA-Pinned GitHub Actions', desc: 'Every third-party Action in CI/CD is pinned to an immutable commit SHA, not a mutable tag, closing a supply-chain attack vector.' },
  { icon: Bot, title: 'Automated Dependabot Updates', desc: 'Dependabot keeps both npm packages and GitHub Actions pins current against newly disclosed CVEs.' },
  { icon: FileCheck, title: 'CI `npm audit` Gate', desc: 'Every build and deploy runs npm audit --audit-level=moderate, failing the pipeline on newly introduced moderate+ severity vulnerabilities.' },
]

function LinkIcon({ type }: { type: ContributorLink['type'] }) {
  if (type === 'github') {
    return (
      <svg className="w-4.5 h-4.5 fill-current text-text-secondary group-hover:text-text-primary" viewBox="0 0 24 24" aria-hidden="true">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
      </svg>
    )
  }
  if (type === 'linkedin') {
    return (
      <svg className="w-4.5 h-4.5 fill-current text-text-secondary group-hover:text-text-primary" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    )
  }
  if (type === 'website') return <Globe className="w-4.5 h-4.5" />
  return <Mail className="w-4.5 h-4.5" />
}

export default function Contributors() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [inquiry, setInquiry] = useState('General')
  const [message, setMessage] = useState('')
  const [formSent, setFormSent] = useState(false)
  const [sentMailto, setSentMailto] = useState('')

  const buildMailto = () => {
    const subject = `AboutIAM Inquiry: ${inquiry}`
    const body = `From: ${name} (${email})\n\n${message}`
    return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !message) return

    // No backend exists on this 100% client-side site — hand off to the
    // visitor's own email client instead of pretending to submit anywhere.
    const mailtoUrl = buildMailto()
    window.location.href = mailtoUrl

    setSentMailto(mailtoUrl)
    setFormSent(true)
    setTimeout(() => {
      setName('')
      setEmail('')
      setMessage('')
    }, 2000)
  }

  return (
    <div className="space-y-10 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
          <Users className="w-3.5 h-3.5" /> Team & Contact
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          Meet the Contributors & Contact Us
        </h2>
        <p className="text-text-secondary">
          Discover the visionaries behind the AboutIAM open-source platform, and submit inquiry questions, suggestions, or partnership requests directly to our core developers.
        </p>
      </div>

      {/* Core Team */}
      <div className="space-y-6">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Core Team</span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {contributors.map((person) => (
            <div
              key={person.name}
              className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm flex flex-col items-center text-center space-y-4 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent-primary/5 rounded-full blur-2xl group-hover:bg-accent-primary/10 transition-all"></div>

              <div className="w-20 h-20 rounded-full bg-accent-glow border border-accent-primary/20 flex items-center justify-center text-3xl shrink-0 shadow-inner overflow-hidden">
                {person.photo ? (
                  <img
                    src={person.photo}
                    alt={person.name}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  person.avatar
                )}
              </div>

              <div className="space-y-1">
                <h4 className="text-xl font-black text-text-primary">{person.name}</h4>
                <p className="text-xs font-bold uppercase tracking-wider text-accent-primary">{person.affiliation}</p>
              </div>

              <p className="text-xs text-text-secondary leading-relaxed font-semibold max-w-xs">
                {person.bio}
              </p>

              <div className="flex gap-2 pt-2">
                {person.links.map((link) => (
                  <a
                    key={link.type}
                    href={link.href}
                    target={link.type === 'email' ? undefined : '_blank'}
                    rel={link.type === 'email' ? undefined : 'noreferrer'}
                    className="p-2.5 rounded-lg border border-border-subtle bg-bg-sidebar hover:bg-bg-nested text-text-secondary hover:text-text-primary transition-colors focus:outline-none group"
                    title={link.label}
                  >
                    <LinkIcon type={link.type} />
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security & Transparency */}
      <div className="space-y-6">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Security & Transparency</span>

        <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-bold text-text-primary">
              <ShieldCheck className="w-4.5 h-4.5 text-accent-secondary" /> Shipped Hardening Controls
            </div>
            <a
              href={GITHUB_SECURITY_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-primary hover:text-accent-hover"
            >
              View on GitHub Security <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {SECURITY_CONTROLS.map((control) => (
              <div key={control.title} className="p-4 rounded-xl bg-bg-sidebar/50 border border-border-subtle space-y-2">
                <control.icon className="w-4 h-4 text-accent-primary" />
                <h5 className="text-xs font-bold text-text-primary">{control.title}</h5>
                <p className="text-[11px] text-text-secondary leading-relaxed font-semibold">{control.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Join Open Source invitation card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-2xl bg-bg-sidebar/50 border border-border-subtle space-y-3">
            <span className="text-[10px] font-bold text-accent-primary uppercase tracking-wider flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 fill-current" /> Community Contributions
            </span>
            <p className="text-xs text-text-secondary leading-relaxed font-semibold">
              AboutIAM is a fully open-source, MIT-licensed, community-driven project. We invite other developers, security architects, and interns to submit pull requests, audit code, or suggest new educational modules on our GitHub!
            </p>
          </div>
        </div>

        {/* Interactive Contact Form (2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Inquiry Inbox</span>

          <div className="p-8 rounded-2xl bg-bg-card border border-border-subtle shadow-sm relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(rgba(59,130,246,0.01)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none"></div>

            {formSent ? (
              /* Success dispatch screen */
              <div className="flex flex-col items-center justify-center text-center py-12 space-y-4 animate-scaleUp relative z-10">
                <CheckCircle2 className="w-16 h-16 text-status-success animate-pulse-slow" />
                <h3 className="text-2xl font-black text-text-primary">Opening Your Email App…</h3>
                <p className="text-xs text-text-secondary leading-relaxed max-w-sm font-semibold">
                  We've pre-filled a message to <span className="text-text-primary">{CONTACT_EMAIL}</span> in your default email app — just hit Send there to complete your inquiry.{' '}
                  <a href={sentMailto} className="text-accent-primary hover:text-accent-hover underline">
                    Didn't open? Click here.
                  </a>
                </p>
                <button
                  onClick={() => setFormSent(false)}
                  className="px-4 py-2 rounded-lg border border-border-subtle bg-bg-sidebar hover:bg-bg-nested text-text-primary text-xs font-bold transition-all"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              /* Main Form */
              <form onSubmit={handleFormSubmit} className="space-y-5 relative z-10 text-xs sm:text-sm font-semibold text-text-secondary">
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="block uppercase tracking-wider text-[10px]">Your Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary focus:outline-none focus:border-accent-primary"
                      placeholder="Alex Security"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="block uppercase tracking-wider text-[10px]">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary focus:outline-none focus:border-accent-primary"
                      placeholder="alex@security-firm.com"
                    />
                  </div>
                </div>

                {/* Inquiry Type */}
                <div className="space-y-1.5">
                  <label className="block uppercase tracking-wider text-[10px]">Inquiry Category</label>
                  <select
                    value={inquiry}
                    onChange={(e) => setInquiry(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary"
                  >
                    <option value="General">General Questions & Feedback</option>
                    <option value="Feature">Feature / Module Suggestion</option>
                    <option value="Bug">Bug Report / UI Audit</option>
                    <option value="Partnership">Business Partnership / Lecture Request</option>
                  </select>
                </div>

                {/* Message Body */}
                <div className="space-y-1.5">
                  <label className="block uppercase tracking-wider text-[10px]">Inquiry Message</label>
                  <textarea
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full h-32 p-4 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary focus:outline-none focus:border-accent-primary resize-none"
                    placeholder="Describe your suggestion or partnership request in detail..."
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-1.5 px-6 py-3 bg-accent-primary hover:bg-accent-hover text-white font-bold rounded-xl transition-all shadow-md shadow-accent-primary/10 cursor-pointer"
                >
                  Send Message <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <div className="text-center">
        <Link to="/terms" className="text-[11px] text-text-muted hover:text-text-secondary underline">
          Terms, License & Disclaimer
        </Link>
      </div>
    </div>
  )
}
