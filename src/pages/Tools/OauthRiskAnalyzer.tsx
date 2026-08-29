import { useState } from 'react'
import { Link2, ShieldAlert, ShieldCheck, Info } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import { TOOLS } from '../../data/toolsRegistry'

export default function OauthRiskAnalyzer() {
  const tool = TOOLS.find((t) => t.slug === 'oauth-risk-analyzer')!
  const [urlInput, setUrlInput] = useState('')
  
  const analyzeUrl = (url: string) => {
    try {
      const parsedUrl = new URL(url)
      const params = new URLSearchParams(parsedUrl.search)
      
      const responseType = params.get('response_type')
      const redirectUri = params.get('redirect_uri')
      const state = params.get('state')
      const codeChallenge = params.get('code_challenge')
      
      const risks = []
      
      if (!url.startsWith('https://')) {
        risks.push({ level: 'critical', msg: 'Authorization URL is not using HTTPS. Credentials and tokens will be intercepted in transit.' })
      }
      
      if (responseType?.includes('token')) {
        risks.push({ level: 'critical', msg: 'Implicit Flow (response_type=token) detected. This is deprecated by OAuth 2.1 BCP. Access tokens will be exposed in the browser URI fragment.' })
      } else if (responseType !== 'code') {
        risks.push({ level: 'warning', msg: `Unrecognized response_type (${responseType}). Standard Authorization Code flow uses response_type=code.` })
      }
      
      if (!state) {
        risks.push({ level: 'high', msg: 'Missing state parameter. Flow is vulnerable to Cross-Site Request Forgery (CSRF).' })
      }
      
      if (!codeChallenge && responseType === 'code') {
        risks.push({ level: 'high', msg: 'Missing PKCE (code_challenge). Flow is vulnerable to Authorization Code Interception on public clients.' })
      }
      
      if (!redirectUri) {
        risks.push({ level: 'warning', msg: 'Missing redirect_uri. While technically optional if pre-registered, omitting it often leads to open redirect vulnerabilities if the IdP enforces weak matching.' })
      }
      
      return { parsedUrl, params, risks }
      } catch {
      return null
      }
  }

  const analysis = urlInput.trim() ? analyzeUrl(urlInput.trim()) : undefined

  return (
    <ToolPageShell tool={tool}>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="bg-bg-card border border-border-subtle p-6 rounded-2xl shadow-sm hover-cyber-glow">
          <label className="block text-sm font-bold text-text-primary mb-2 flex items-center gap-2">
            <Link2 className="w-4 h-4 text-accent-primary" /> Paste OAuth 2.0 / OIDC Authorization URL
          </label>
          <textarea
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="w-full bg-slate-950 border border-border-subtle rounded-xl p-4 text-xs font-mono text-slate-300 focus:outline-none focus:border-accent-primary custom-scrollbar transition break-all"
            rows={4}
            placeholder="https://accounts.google.com/o/oauth2/v2/auth?client_id=...&response_type=code&scope=openid%20profile..."
            spellCheck={false}
          />
        </div>

        {analysis === null && (
          <div className="p-4 bg-status-danger/10 border border-status-danger/20 rounded-xl text-status-danger text-sm font-bold flex items-center gap-2 animate-pulse">
            <ShieldAlert className="w-5 h-5" /> Invalid URL Format
          </div>
        )}

        {analysis && (
          <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2">
            {/* Parsed Parameters Table */}
            <div className="bg-bg-card border border-border-subtle rounded-2xl p-6 shadow-sm hover-cyber-glow">
              <h3 className="text-sm font-bold text-text-primary mb-4 border-b border-border-subtle pb-2">URL Parameters</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <tbody>
                    <tr className="border-b border-border-subtle/50">
                      <td className="py-2 font-bold text-text-muted">Base URL</td>
                      <td className="py-2 font-mono text-accent-primary truncate max-w-[200px]" title={analysis.parsedUrl.origin + analysis.parsedUrl.pathname}>
                        {analysis.parsedUrl.origin}{analysis.parsedUrl.pathname}
                      </td>
                    </tr>
                    {Array.from(analysis.params.entries()).map(([key, val], i) => (
                      <tr key={i} className="border-b border-border-subtle/50 hover:bg-bg-sidebar transition">
                        <td className="py-2 font-bold text-text-secondary">{key}</td>
                        <td className="py-2 font-mono text-slate-300 break-all">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="bg-bg-card border border-border-subtle rounded-2xl p-6 shadow-sm hover-cyber-glow flex flex-col">
              <h3 className="text-sm font-bold text-text-primary mb-4 border-b border-border-subtle pb-2">Security Risk Assessment</h3>
              
              <div className="flex-1 space-y-3">
                {analysis.risks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-80">
                    <ShieldCheck className="w-12 h-12 text-emerald-500" />
                    <span className="font-bold text-emerald-500">Secure Architecture</span>
                    <span className="text-xs text-text-muted">No immediate client-side flow risks detected.</span>
                  </div>
                ) : (
                  analysis.risks.map((risk, i) => (
                    <div key={i} className={`p-3 rounded-lg border text-xs leading-relaxed flex items-start gap-2.5 ${
                      risk.level === 'critical' ? 'bg-status-danger/10 border-status-danger/30 text-status-danger' : 
                      risk.level === 'high' ? 'bg-orange-500/10 border-orange-500/30 text-orange-500' :
                      'bg-status-warning/10 border-status-warning/30 text-status-warning'
                    }`}>
                      {risk.level === 'critical' || risk.level === 'high' ? <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" /> : <Info className="w-4 h-4 shrink-0 mt-0.5" />}
                      <span className="font-semibold">{risk.msg}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolPageShell>
  )
}
