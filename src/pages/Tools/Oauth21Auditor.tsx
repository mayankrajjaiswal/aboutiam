import { useState } from 'react'
import { CheckCircle2, ShieldAlert } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import { getToolBySlug } from '../../data/toolsRegistry'

const tool = getToolBySlug('oauth-2-1-auditor')!

interface AuditRisk {
  level: 'critical' | 'high' | 'warning'
  msg: string
}

interface AnalysisResult {
  risks: AuditRisk[]
  isOAuth21Compliant: boolean
}

export default function Oauth21Auditor() {
  const [urlInput, setUrlInput] = useState('')
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleAudit = () => {
    setErrorMsg(null)
    setAnalysis(null)
    
    if (!urlInput.trim()) {
      setErrorMsg('Please paste a valid authorization request URL or client configuration object.')
      return
    }

    try {
      const risks: AuditRisk[] = []
      let parsedUrl: URL | null = null

      try {
        parsedUrl = new URL(urlInput)
      } catch {
        // Not a URL, checking if it's a JSON config
        if (!urlInput.includes('{') || !urlInput.includes('}')) {
          setErrorMsg('Input must be a valid URL or JSON client configuration.')
          return
        }
      }

      const queryParams = parsedUrl ? new URLSearchParams(parsedUrl.search) : new URLSearchParams()

      let responseType = ''
      let grantType = ''
      let hasPkce = false
      
      if (parsedUrl) {
        responseType = queryParams.get('response_type') || ''
        hasPkce = !!queryParams.get('code_challenge') && queryParams.get('code_challenge_method') === 'S256'
      } else {
        const jsonMatch = urlInput.match(/"response_types"\s*:\s*\[([^\]]+)\]/)
        if (jsonMatch) responseType = jsonMatch[1]
        
        const grantMatch = urlInput.match(/"grant_types"\s*:\s*\[([^\]]+)\]/)
        if (grantMatch) grantType = grantMatch[1]
      }

      // Check Implicit Flow (response_type=token)
      if (responseType.includes('token') || responseType.includes('id_token')) {
        risks.push({
          level: 'critical',
          msg: 'Implicit flow (response_type=token or id_token) is strictly deprecated in OAuth 2.1 due to token leakage risks in the browser fragment.'
        })
      }

      // Check ROPC
      if (grantType.includes('password')) {
        risks.push({
          level: 'critical',
          msg: 'Resource Owner Password Credentials (ROPC) grant is entirely removed from OAuth 2.1.'
        })
      }

      // Check PKCE
      if (parsedUrl && !hasPkce && responseType.includes('code')) {
        risks.push({
          level: 'high',
          msg: 'Missing PKCE (code_challenge and S256 code_challenge_method). OAuth 2.1 mandates PKCE for all clients using the authorization code flow, not just public clients.'
        })
      }

      setAnalysis({
        risks,
        isOAuth21Compliant: risks.length === 0
      })
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'Invalid input payload.')
    }
  }

  return (
    <ToolPageShell tool={tool}>
      <div className="grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-12 space-y-6">
          <div className="p-4 sm:p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-accent-primary" /> Transition Auditor
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed max-w-3xl">
              Paste an OAuth 2.0 Authorization URL or a JSON client metadata registration payload. 
              The auditor will flag insecure configurations deprecated by the OAuth 2.1 draft and Security BCP.
            </p>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-status-danger/10 border border-status-danger/30 text-status-danger text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <div className="space-y-2">
              <textarea
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder={'https://auth.company.com/authorize?response_type=token&client_id=... OR { "grant_types": ["password"] }'}
                className="w-full p-4 rounded-xl bg-bg-sidebar border border-border-subtle text-xs font-mono text-text-primary focus:outline-none focus:border-accent-primary resize-none min-h-[160px]"
                spellCheck={false}
              />
              <button
                onClick={handleAudit}
                disabled={!urlInput.trim()}
                className="w-full py-2.5 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                Run OAuth 2.1 Compliance Audit
              </button>
            </div>

            {analysis && (
              <div className="pt-4 border-t border-border-subtle/50 space-y-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-text-primary">Audit Results</h3>
                  {analysis.isOAuth21Compliant ? (
                    <span className="px-2 py-1 rounded bg-status-success/10 text-status-success text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> OAuth 2.1 Compliant
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded bg-status-danger/10 text-status-danger text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> Non-Compliant
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {analysis.risks.length === 0 ? (
                    <div className="p-4 rounded-xl bg-status-success/5 border border-status-success/20 text-status-success text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      No OAuth 2.1 deprecation risks found.
                    </div>
                  ) : (
                    analysis.risks.map((risk, i) => (
                      <div key={i} className={`p-3 rounded-lg border text-xs leading-relaxed flex items-start gap-2.5 ${
                        risk.level === 'critical' ? 'bg-status-danger/10 border-status-danger/30 text-status-danger' : 
                        risk.level === 'high' ? 'bg-orange-500/10 border-orange-500/30 text-orange-500' :
                        'bg-status-warning/10 border-status-warning/30 text-status-warning'
                      }`}>
                        <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                        <span className="font-semibold">{risk.msg}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ToolPageShell>
  )
}
