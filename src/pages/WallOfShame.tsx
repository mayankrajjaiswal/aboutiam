import { useState } from 'react'
import { AlertTriangle, ShieldAlert, Lock, CheckCircle2 } from 'lucide-react'

export default function WallOfShame() {
  const [activeBreach, setActiveBreach] = useState(0)

  const breaches = [
    {
      id: 1,
      title: 'The Implicit Flow Token Leak',
      year: '2012-2019',
      company: 'Generic SPA Implementations',
      attack: 'URL Fragment Interception',
      desc: 'Before OAuth 2.1, Single Page Applications (SPAs) were forced to use the "Implicit Grant". This returned live Access Tokens directly in the browser\'s URL hash fragment (e.g., `#access_token=xyz`). Rogue browser extensions, malicious analytics scripts, and proxy logs easily scraped these live tokens off the URL.',
      vulnCode: `GET /authorize?response_type=token&client_id=spa...
=>
HTTP/1.1 302 Found
Location: https://app.com/cb#access_token=LEAKED_TOKEN`,
      secureCode: `// Use Auth Code + PKCE instead!
GET /authorize?response_type=code&code_challenge=SHA256...
=>
HTTP/1.1 302 Found
Location: https://app.com/cb?code=SECURE_TEMP_CODE`,
      remediation: 'The OAuth 2.1 standard formally deprecated the Implicit Grant. All public clients must now use the Authorization Code Flow with PKCE, moving token exchanges entirely to the secure back-channel.'
    },
    {
      id: 2,
      title: 'MFA Push Fatigue (Prompt Bombing)',
      year: '2022-2023',
      company: 'Major Tech Corporations',
      attack: 'Social Engineering / MFA Fatigue',
      desc: 'Attackers compromised employee passwords and then repeatedly spammed their mobile phones with hundreds of Push Notification MFA requests at 2 AM. Frustrated and exhausted employees eventually clicked "Approve" just to stop their phones from buzzing, granting the attackers full VPN access.',
      vulnCode: `// Legacy MFA Logic
if (password_valid) {
  send_push_notification(user.phone);
  await user_approval();
  grant_access();
}`,
      secureCode: `// Number Matching MFA
if (password_valid) {
  code = generate_2_digit_code();
  show_code_on_screen(code);
  send_push(user.phone, require_number=true);
  // User MUST type the code shown on screen
}`,
      remediation: 'Implement "Number Matching" requiring the user to type a 2-digit number shown on the login screen into their phone, preventing blind approvals. Better yet, migrate to hardware FIDO2 Passkeys.'
    },
    {
      id: 3,
      title: 'JWT "none" Algorithm Bypass',
      year: '2015',
      company: 'Multiple JWT Libraries',
      attack: 'Cryptographic Signature Exclusion',
      desc: 'Attackers decoded a legitimate JWT, elevated their role claims to "admin", set the header algorithm (`"alg"`) to `"none"`, and stripped off the signature. Vulnerable backend libraries respected the `"none"` algorithm flag and bypassed the cryptographic signature verification entirely.',
      vulnCode: `// Vulnerable JWT Verification
function verifyJWT(token) {
  const header = parse(token.header);
  if (header.alg === 'none') {
    return true; // DANGEROUS BYPASS!
  }
  return crypto.verify(token.signature);
}`,
      secureCode: `// Secure JWT Verification
function verifyJWT(token) {
  const header = parse(token.header);
  // Strict Whitelist
  if (!['HS256', 'RS256'].includes(header.alg)) {
    throw new Error("Invalid Algorithm");
  }
  return crypto.verify(token.signature);
}`,
      remediation: 'Identity parsers must never dynamically trust the header algorithm. Backends must strictly whitelist allowed algorithms (e.g., `["RS256"]`) and reject any token signed with an unsupported algorithm.'
    }
  ]

  const active = breaches[activeBreach]

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-status-danger uppercase tracking-wider bg-status-danger/10 px-2.5 py-1 rounded-full border border-status-danger/20">
          <AlertTriangle className="w-3.5 h-3.5" /> Vulnerability Lab
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          The IAM Wall of Shame
        </h2>
        <p className="text-text-secondary">
          Analyze historic identity breaches and architectural failures. Step through the vulnerable code that caused the compromise, and inspect the modern remediations protecting systems today.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Timeline Menu */}
        <div className="lg:col-span-1 space-y-4">
          <div className="space-y-3 border-l-2 border-border-subtle ml-3 pl-4">
            {breaches.map((b, idx) => {
              const isActive = activeBreach === idx
              return (
                <div key={b.id} className="relative">
                  <div className={`absolute -left-[23px] top-4 w-3 h-3 rounded-full border-2 transition-all ${
                    isActive ? 'bg-status-danger border-status-danger shadow-[0_0_10px_rgba(220,38,38,0.5)]' : 'bg-bg-base border-border-subtle'
                  }`}></div>
                  <button
                    onClick={() => setActiveBreach(idx)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-status-danger/5 border-status-danger/30 shadow-sm'
                        : 'bg-bg-card border-border-subtle hover:border-status-danger/20'
                    }`}
                  >
                    <span className="text-[9px] font-black text-text-muted uppercase block pb-1">{b.year} | {b.company}</span>
                    <span className={`block font-bold text-sm ${isActive ? 'text-status-danger' : 'text-text-primary'}`}>{b.title}</span>
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        {/* Attack Analysis Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-8 rounded-2xl bg-bg-card border border-status-danger/20 shadow-lg shadow-status-danger/5 space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="space-y-2 border-b border-border-subtle pb-6">
              <div className="flex items-center gap-2 text-status-danger text-xs font-black uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4" /> {active.attack}
              </div>
              <h3 className="text-3xl font-black text-text-primary">{active.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed font-medium">
                {active.desc}
              </p>
            </div>

            {/* Code Comparison */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3 text-status-danger" /> Vulnerable Architecture
                </span>
                <pre className="p-4 rounded-xl bg-[#2a1a1a] border border-status-danger/30 text-[10px] text-[#ffb3b3] overflow-x-auto font-mono h-48">
                  {active.vulnCode}
                </pre>
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-status-success" /> Secure Remediation
                </span>
                <pre className="p-4 rounded-xl bg-[#1a2a22] border border-status-success/30 text-[10px] text-[#b3ffcc] overflow-x-auto font-mono h-48">
                  {active.secureCode}
                </pre>
              </div>
            </div>

            {/* Standard Fix */}
            <div className="p-4 rounded-xl bg-status-success/5 border border-status-success/20 flex gap-3 text-xs text-text-primary font-medium items-start">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-status-success" />
              <div className="space-y-1">
                <span className="font-bold uppercase tracking-wider text-[10px] text-status-success block">Modern Standard Fix</span>
                <p className="leading-relaxed text-text-secondary">
                  {active.remediation}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
