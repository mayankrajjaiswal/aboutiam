import { useState } from 'react'
import { ShieldCheck, Copy, Check, Eye } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import { useClipboardCopy } from '../../components/Tools/useClipboardCopy'
import { getToolBySlug } from '../../data/toolsRegistry'

export default function LogAnonymizer() {
  const tool = getToolBySlug('log-anonymizer')!
  const { copy, copiedId } = useClipboardCopy()
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')

  const handleAnonymize = () => {
    let text = inputText

    // Redact Bearer tokens
    text = text.replace(/Bearer\s+[a-zA-Z0-9\-._~+/]+=*/g, 'Bearer [REDACTED_ACCESS_TOKEN]')
    
    // Redact client_secret parameter
    text = text.replace(/client_secret=[a-zA-Z0-9\-._~+/]+/g, 'client_secret=[REDACTED_CLIENT_SECRET]')
    
    // Redact password parameters
    text = text.replace(/"password":\s*"[^"]+"/g, '"password": "[REDACTED_PASSWORD]"')
    text = text.replace(/password=[a-zA-Z0-9\-._~+/]+/g, 'password=[REDACTED_PASSWORD]')
    
    // Redact SAML Signature values
    text = text.replace(/<ds:SignatureValue>[a-zA-Z0-9+/=\s]+<\/ds:SignatureValue>/g, '<ds:SignatureValue>[REDACTED_SAML_SIGNATURE]</ds:SignatureValue>')

    setOutputText(text)
  }

  const loadSample = () => {
    setInputText(`POST /oauth/token HTTP/1.1
Host: identity.service.com
Content-Type: application/x-www-form-urlencoded
Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=

grant_type=password&username=alice&password=secretPassword123&client_id=myclient&client_secret=superSecretKey456`)
  }

  return (
    <ToolPageShell tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-bg-card border border-border-subtle p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-accent-primary" /> Raw Trace Log Input
              </h2>
              <button
                onClick={loadSample}
                className="text-[10px] bg-bg-nested hover:bg-border-subtle border border-border-subtle px-2 py-1 rounded text-text-secondary transition"
              >
                Load Sample Log
              </button>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste raw HTTP headers, curl request, SAML XML assertion, or JSON HAR logs here..."
              className="w-full h-40 p-3 rounded-xl bg-bg-nested border border-border-subtle text-xs font-mono text-text-primary focus:outline-none focus:border-accent-primary"
            />

            <button
              onClick={handleAnonymize}
              className="w-full py-2.5 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-colors"
            >
              Scrub and Redact Log
            </button>
          </div>

          {outputText && (
            <div className="bg-bg-card border border-border-subtle p-6 rounded-2xl shadow-sm space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                  <Eye className="w-4 h-4 text-accent-secondary" /> Anonymized Safe Log
                </h3>
                <button
                  onClick={() => copy(outputText, 'log-copy')}
                  className="text-xs bg-bg-nested hover:bg-border-subtle border border-border-subtle px-3 py-1.5 rounded-lg text-text-secondary flex items-center gap-1.5 transition"
                >
                  {copiedId === 'log-copy' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-accent-secondary" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Log
                    </>
                  )}
                </button>
              </div>

              <pre className="p-3 bg-bg-nested border border-border-subtle rounded-xl text-xs font-mono text-text-primary overflow-x-auto whitespace-pre-wrap">
                {outputText}
              </pre>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <BeginnerExpertExplainer tool={tool} />
        </div>
      </div>
    </ToolPageShell>
  )
}
