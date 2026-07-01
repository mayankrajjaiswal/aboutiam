import { Key, ShieldAlert, Cpu } from 'lucide-react'

export default function JWTStudio() {
  return (
    <div className="space-y-10 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
          <Key className="w-3.5 h-3.5" /> Security Playground
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          JWT Studio & Exploit Arena
        </h2>
        <p className="text-text-secondary">
          Draft JSON Web Tokens, encrypt headers, sign signatures in HS256/RS256, and trigger interactive exploits like the standard none-algorithm vulnerability.
        </p>
      </div>

      {/* Editor Skeleton Stub */}
      <div className="grid lg:grid-cols-3 gap-8 pt-4">
        {/* Sidebar Controls */}
        <div className="space-y-6 lg:col-span-1">
          <div className="p-6 rounded-xl bg-bg-card border border-border-subtle space-y-4">
            <h4 className="font-bold text-text-primary flex items-center gap-2">
              <Cpu className="w-4 h-4 text-accent-primary" /> Signature Configuration
            </h4>
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-text-secondary uppercase">Algorithm</label>
              <select className="w-full p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-sm text-text-primary focus:outline-none focus:border-accent-primary">
                <option value="HS256">HS256 (Symmetric HMAC)</option>
                <option value="RS256">RS256 (Asymmetric RSA)</option>
                <option value="ES256">ES256 (Asymmetric ECDSA)</option>
              </select>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-bg-card border border-border-subtle space-y-4">
            <h4 className="font-bold text-text-primary flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-status-danger" /> Exploit Arena
            </h4>
            <p className="text-xs text-text-secondary">
              Activate interactive parameters to test how security architectures fail when developers trust headers blindly.
            </p>
            <div className="space-y-3 pt-2">
              <button className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-status-danger/30 hover:bg-status-danger/10 text-status-danger text-xs font-semibold transition-colors">
                Toggle "none" Algorithm Attack
              </button>
              <button className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-status-warning/30 hover:bg-status-warning/10 text-status-warning text-xs font-semibold transition-colors">
                Toggle JWKS Spoofing Attack
              </button>
            </div>
          </div>
        </div>

        {/* Text Area & Code Editors */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-bg-card border border-border-subtle space-y-3">
              <span className="text-xs font-bold text-text-secondary uppercase">Header (JSON)</span>
              <pre className="p-4 rounded-lg bg-bg-nested text-xs text-text-primary overflow-x-auto font-mono">
{`{
  "alg": "HS256",
  "typ": "JWT"
}`}
              </pre>
            </div>
            <div className="p-6 rounded-xl bg-bg-card border border-border-subtle space-y-3">
              <span className="text-xs font-bold text-text-secondary uppercase">Payload (Claims)</span>
              <pre className="p-4 rounded-lg bg-bg-nested text-xs text-text-primary overflow-x-auto font-mono">
{`{
  "sub": "1234567890",
  "name": "John Doe",
  "role": "admin",
  "iat": 1516239022
}`}
              </pre>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-bg-card border border-border-subtle space-y-3">
            <span className="text-xs font-bold text-text-secondary uppercase">Generated Token (Encoded String)</span>
            <div className="p-4 rounded-lg bg-bg-nested text-xs text-text-primary break-all font-mono">
              <span className="text-status-danger">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9</span>.
              <span className="text-accent-primary">eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNTE2MjM5MDIyfQ</span>.
              <span className="text-accent-secondary">SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
