import { useState } from 'react'
import { Wand2, Code, Box, Server, Shield, CheckCircle2, Copy, Check } from 'lucide-react'

export default function AuthMatchmaker() {
  const [step, setStep] = useState(0)
  const [hosting, setHosting] = useState<'saas' | 'self'>('saas')
  const [compliance, setCompliance] = useState<'high' | 'standard'>('standard')
  const [stack, setStack] = useState<'react' | 'backend'>('react')
  const [isCopied, setIsCopied] = useState(false)

  const getRecommendation = () => {
    if (hosting === 'self') {
      if (compliance === 'high') {
        return {
          name: 'Keycloak',
          reason: 'You need strict self-hosted control for compliance with zero recurring SaaS costs. Keycloak provides a battle-tested, open-source Java/Wildfly identity provider.',
          snippet: `version: '3.8'\nservices:\n  keycloak:\n    image: quay.io/keycloak/keycloak:24.0\n    environment:\n      KC_DB: postgres\n      KC_HOSTNAME: auth.yourcompany.com\n    command: start`
        }
      }
      return {
        name: 'Authentik',
        reason: 'You want a modern, self-hosted solution that is easier to configure than Keycloak, with excellent unified proxy outposts for internal homelab or startup apps.',
        snippet: `version: '3.4'\nservices:\n  authentik-server:\n    image: ghcr.io/goauthentik/server:2024.2\n    environment:\n      AUTHENTIK_REDIS__HOST: redis\n      AUTHENTIK_POSTGRESQL__HOST: database\n      AUTHENTIK_SECRET_KEY: \${SECRET_KEY}`
      }
    } else {
      if (stack === 'react') {
        return {
          name: 'Clerk / Auth0',
          reason: 'You are building a modern React/Next.js frontend. You need dropping-in ready-made <SignIn /> components to achieve authentication in 5 minutes with zero backend hassle.',
          snippet: `import { ClerkProvider, SignIn } from "@clerk/clerk-react";\n\nfunction App() {\n  return (\n    <ClerkProvider publishableKey={clerkPubKey}>\n      <SignIn />\n    </ClerkProvider>\n  );\n}`
        }
      }
      return {
        name: 'Microsoft Entra ID (B2C)',
        reason: 'You need an enterprise-backed SaaS provider supporting massive workforce or consumer scale with standard OIDC flows for backend microservices.',
        snippet: `// MSAL Configuration\nconst msalConfig = {\n  auth: {\n    clientId: "YOUR_CLIENT_ID",\n    authority: "https://login.microsoftonline.com/YOUR_TENANT_ID"\n  }\n};`
      }
    }
  }

  const rec = getRecommendation()

  const copyCode = () => {
    navigator.clipboard.writeText(rec.snippet)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 1500)
  }

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
          <Wand2 className="w-3.5 h-3.5" /> Discovery Tool
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          The IAM Auth Matchmaker
        </h2>
        <p className="text-text-secondary">
          Stop wasting weeks deciding which identity provider to use. Answer 3 simple questions about your tech stack and compliance needs, and we'll calculate your perfect architectural match.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Wizard Controls */}
        <div className="lg:col-span-1 space-y-4">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Requirements Survey</span>
          
          <div className="space-y-3">
            {/* Q1 */}
            <div className={`p-4 rounded-xl border transition-all ${step >= 0 ? 'bg-bg-card border-accent-primary shadow-sm' : 'bg-bg-sidebar/50 border-border-subtle opacity-50'}`}>
              <h4 className="font-bold text-text-primary text-sm mb-3 flex items-center gap-2"><Server className="w-4 h-4 text-accent-primary" /> Hosting Model</h4>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <button 
                  onClick={() => { setHosting('saas'); setStep(1) }}
                  className={`p-2 rounded-lg border ${hosting === 'saas' ? 'bg-accent-primary text-white border-accent-primary' : 'bg-bg-sidebar border-border-subtle text-text-secondary hover:text-text-primary'}`}
                >SaaS (Cloud)</button>
                <button 
                  onClick={() => { setHosting('self'); setStep(1) }}
                  className={`p-2 rounded-lg border ${hosting === 'self' ? 'bg-accent-primary text-white border-accent-primary' : 'bg-bg-sidebar border-border-subtle text-text-secondary hover:text-text-primary'}`}
                >Self-Hosted</button>
              </div>
            </div>

            {/* Q2 */}
            <div className={`p-4 rounded-xl border transition-all ${step >= 1 ? 'bg-bg-card border-accent-secondary shadow-sm' : 'bg-bg-sidebar/50 border-border-subtle opacity-50 pointer-events-none'}`}>
              <h4 className="font-bold text-text-primary text-sm mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-accent-secondary" /> Compliance Need</h4>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <button 
                  onClick={() => { setCompliance('standard'); setStep(2) }}
                  className={`p-2 rounded-lg border ${compliance === 'standard' ? 'bg-accent-secondary text-white border-accent-secondary' : 'bg-bg-sidebar border-border-subtle text-text-secondary hover:text-text-primary'}`}
                >Standard</button>
                <button 
                  onClick={() => { setCompliance('high'); setStep(2) }}
                  className={`p-2 rounded-lg border ${compliance === 'high' ? 'bg-accent-secondary text-white border-accent-secondary' : 'bg-bg-sidebar border-border-subtle text-text-secondary hover:text-text-primary'}`}
                >High (SOC2/HIPAA)</button>
              </div>
            </div>

            {/* Q3 */}
            <div className={`p-4 rounded-xl border transition-all ${step >= 2 ? 'bg-bg-card border-status-success shadow-sm' : 'bg-bg-sidebar/50 border-border-subtle opacity-50 pointer-events-none'}`}>
              <h4 className="font-bold text-text-primary text-sm mb-3 flex items-center gap-2"><Code className="w-4 h-4 text-status-success" /> Primary Stack</h4>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <button 
                  onClick={() => { setStack('react'); setStep(3) }}
                  className={`p-2 rounded-lg border ${stack === 'react' ? 'bg-status-success text-white border-status-success' : 'bg-bg-sidebar border-border-subtle text-text-secondary hover:text-text-primary'}`}
                >React / SPA</button>
                <button 
                  onClick={() => { setStack('backend'); setStep(3) }}
                  className={`p-2 rounded-lg border ${stack === 'backend' ? 'bg-status-success text-white border-status-success' : 'bg-bg-sidebar border-border-subtle text-text-secondary hover:text-text-primary'}`}
                >Microservices</button>
              </div>
            </div>
          </div>
        </div>

        {/* Results Card */}
        <div className="lg:col-span-2">
          {step === 3 ? (
            <div className="p-8 rounded-2xl bg-bg-card border border-border-subtle shadow-lg animate-scaleUp h-full flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent-primary/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="space-y-2 border-b border-border-subtle pb-6 relative z-10">
                <span className="text-[10px] font-bold text-status-success uppercase tracking-wider flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4" /> Match Found</span>
                <h3 className="text-4xl font-black text-text-primary">{rec.name}</h3>
              </div>

              <div className="py-6 space-y-6 relative z-10 flex-grow">
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Why this fits your startup:</span>
                  <p className="text-sm text-text-secondary font-medium leading-relaxed">{rec.reason}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-text-muted uppercase tracking-wider">
                    <span>Integration Boilerplate</span>
                    <button onClick={copyCode} className="text-accent-primary hover:text-accent-hover flex items-center gap-1">
                      {isCopied ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />} Copy Setup
                    </button>
                  </div>
                  <pre className="p-4 rounded-xl bg-bg-sidebar border border-border-subtle text-[10px] text-text-primary overflow-x-auto font-mono leading-relaxed">
                    {rec.snippet}
                  </pre>
                </div>
              </div>

              <div className="pt-4 border-t border-border-subtle mt-auto relative z-10">
                <button onClick={() => setStep(0)} className="text-xs font-bold text-text-secondary hover:text-text-primary transition-colors">
                  ← Restart Matchmaker
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 border border-dashed border-border-subtle rounded-2xl bg-bg-card/50">
              <Box className="w-12 h-12 text-text-muted mb-4 animate-pulse-slow" />
              <h4 className="text-lg font-bold text-text-primary">Awaiting Inputs...</h4>
              <p className="text-sm text-text-secondary">Complete the 3-step survey on the left to reveal your bespoke IAM architecture blueprint.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
