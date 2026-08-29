import { Printer, Shield, HelpCircle } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import { getToolBySlug } from '../../data/toolsRegistry'

const tool = getToolBySlug('print-poster')!

export default function PrintablePoster() {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  return (
    <ToolPageShell tool={tool}>
      <div className="space-y-6 print:p-0">
        
        {/* Actions header (Hidden on print) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm print:hidden select-none">
          <div className="space-y-1">
            <span className="text-[10px] bg-accent-glow text-accent-primary border border-accent-primary/20 px-2.5 py-0.5 rounded-full font-bold font-mono">
              OFFICE DECORATION &amp; DEV REFERENCE
            </span>
            <h3 className="text-sm font-black text-text-primary">Print &amp; Hang Your Field Reference Guide</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Click the print button to render an A4-optimized high-contrast cheat sheet grid for your workspace walls.
            </p>
          </div>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-lg bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-all shadow-md shadow-accent-primary/20 flex items-center gap-1.5 shrink-0"
          >
            <Printer className="w-4 h-4" /> Print Poster (A4)
          </button>
        </div>

        {/* The Poster Block */}
        <div className="p-8 rounded-3xl bg-[#030712] border-2 border-slate-800 text-slate-100 font-sans shadow-lg max-w-4xl mx-auto space-y-6 print:border-0 print:bg-white print:text-black print:p-4">
          
          {/* Poster Header */}
          <div className="flex justify-between items-center border-b-2 border-slate-800 pb-4 print:border-black">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-bold text-accent-primary uppercase tracking-widest">
                AboutIAM Operational Reference Guide
              </span>
              <h1 className="text-2xl font-black text-white print:text-black">
                Identity &amp; Access Management Security Controls
              </h1>
            </div>
            <Shield className="w-8 h-8 text-accent-primary shrink-0" />
          </div>

          {/* 3-Column Checklist Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs print:text-[10px] print:grid-cols-3">
            
            {/* Column 1: OAuth 2.1 */}
            <div className="space-y-3 bg-[#0d1222]/40 p-4 rounded-xl border border-slate-800 print:bg-transparent print:border-black">
              <h2 className="text-sm font-black text-accent-primary border-b border-slate-800/60 pb-1.5 uppercase tracking-wider print:text-black print:border-black">
                1. OAuth 2.1 Flow
              </h2>
              <ul className="space-y-3">
                <li>
                  <span className="font-bold block">✓ Mandate PKCE (S256)</span>
                  Enforce code_verifier and SHA-256 code_challenge verification on all authorization queries.
                </li>
                <li>
                  <span className="font-bold block">✓ Exact Redirect Matches</span>
                  Explicitly reject wildcard (*) characters in registered redirect URIs to prevent token leakage.
                </li>
                <li>
                  <span className="font-bold block">✓ Restrict Access Tokens</span>
                  Keep access tokens short-lived (e.g. 15 minutes) and issue refresh tokens with strict rotation.
                </li>
              </ul>
            </div>

            {/* Column 2: JWT Validation */}
            <div className="space-y-3 bg-[#0d1222]/40 p-4 rounded-xl border border-slate-800 print:bg-transparent print:border-black">
              <h2 className="text-sm font-black text-accent-primary border-b border-slate-800/60 pb-1.5 uppercase tracking-wider print:text-black print:border-black">
                2. JWT Validation
              </h2>
              <ul className="space-y-3">
                <li>
                  <span className="font-bold block">✓ Cryptographic Signatures</span>
                  Always verify signatures against registered public JWKS keys. Never trust headers blindly.
                </li>
                <li>
                  <span className="font-bold block">✓ Ban &quot;alg: none&quot;</span>
                  Explicitly reject tokens advertising non-signed profiles to defend against bypass attacks.
                </li>
                <li>
                  <span className="font-bold block">✓ Assert Claims Strictly</span>
                  Verify standard claims: expiration (exp), active lifetime (nbf/iat), issuer (iss), and audience (aud).
                </li>
              </ul>
            </div>

            {/* Column 3: SAML & Attestation */}
            <div className="space-y-3 bg-[#0d1222]/40 p-4 rounded-xl border border-slate-800 print:bg-transparent print:border-black">
              <h2 className="text-sm font-black text-accent-primary border-b border-slate-800/60 pb-1.5 uppercase tracking-wider print:text-black print:border-black">
                3. SAML &amp; Attestation
              </h2>
              <ul className="space-y-3">
                <li>
                  <span className="font-bold block">✓ Assert Assertion Signatures</span>
                  Force IdPs to sign both the assertion and response envelopes to defeat signature-wrapping (SSW).
                </li>
                <li>
                  <span className="font-bold block">✓ Hardware Passkeys Only</span>
                  Mandate hardware-backed direct packed attestation blocks to prevent cloud-synchronized credential leaks.
                </li>
                <li>
                  <span className="font-bold block">✓ One-Time Nonces</span>
                  Track XML message nonces locally inside cache registries to completely prevent replay attacks.
                </li>
              </ul>
            </div>

          </div>

          {/* Poster Footer */}
          <div className="pt-4 border-t-2 border-slate-800 flex justify-between items-center text-[9px] text-slate-500 font-mono print:border-black print:text-black">
            <span>PRINTED COPIES ARE UNCONTROLLED — VERIFY CURRENT SPECS AT WWW.ABOUTIAM.COM</span>
            <span>SECURE SCHEMAS BY CONSTRUCTION</span>
          </div>

        </div>

        {/* Explanation Card (Hidden on print) */}
        <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-3 print:hidden select-none">
          <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-accent-primary" /> Visual Identity Engineering Reference Poster
          </h4>
          <p className="text-xs text-text-secondary leading-relaxed">
            Identity architecture is complex. Pinning this high-fidelity field poster in your office, lab, or development workspace keeps standard security baselines top-of-mind for your team. Print directly to any standard laser or inkjet printer.
          </p>
        </div>

      </div>

      <BeginnerExpertExplainer tool={tool} />
    </ToolPageShell>
  )
}
