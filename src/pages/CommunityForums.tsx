import { useState, useEffect } from 'react'
import { Users, CheckCircle2, ArrowRight, User, Award, Plus, Trash2, Heart } from 'lucide-react'

interface ForumThread {
  id: string
  title: string
  author: string
  role: string
  date: string
  likes: number
  body: string
  solution: string
  code: string
}

interface ShowcaseItem {
  id: string
  title: string
  creator: string
  scope: string
  desc: string
  likes: number
  isUserAdded?: boolean
}

export default function CommunityForums() {
  const [activeTab, setActiveTab] = useState<'forums' | 'showcase'>('forums')
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>('t1')

  // Showcase state
  const [showcase, setShowcase] = useState<ShowcaseItem[]>([
    { id: 'sc1', title: 'Workforce Zero Trust Perimeter', creator: 'Mayank (Lead Dev)', scope: 'Workforce', desc: 'Enterprise hybrid configuration connecting local Active Directory trees to Okta with device posture validations.', likes: 44 },
    { id: 'sc2', title: 'B2B Multi-Tenant SaaS Gateway', creator: 'Rajat (Contributor)', scope: 'CIAM', desc: 'Secure B2B multi-tenant OIDC federation router mapping corporate claims dynamically to downstream gateways.', likes: 28 }
  ])

  // Track if they have designed in the Reference Builder
  const [builderConfigured, setBuilderConfigured] = useState(false)
  const [userPublished, setUserPublished] = useState(false)

  // Audit Logs
  const [logsTerminal, setLogsTerminal] = useState<string[]>([
    `[GATEWAY] Community connection active.`,
    `[GATEWAY] Federated Showcase directory indexed.`
  ])

  useEffect(() => {
    setBuilderConfigured(localStorage.getItem('aboutiam-builder-configured') === 'true')
    setUserPublished(localStorage.getItem('aboutiam-showcase-published') === 'true')

    if (localStorage.getItem('aboutiam-showcase-published') === 'true') {
      const userItem: ShowcaseItem = {
        id: 'user_sc',
        title: 'My Custom Federated Architecture',
        creator: 'You (Local Student)',
        scope: 'Hybrid Enterprise',
        desc: 'Custom multi-tier identity topology designed and exported inside the Enterprise Blueprint Designer.',
        likes: 1,
        isUserAdded: true
      }
      setShowcase(prev => prev.some(i => i.id === 'user_sc') ? prev : [userItem, ...prev])
    }
  }, [])

  const handlePublishUserArchitecture = () => {
    if (!builderConfigured) return

    localStorage.setItem('aboutiam-showcase-published', 'true')
    setUserPublished(true)

    const userItem: ShowcaseItem = {
      id: 'user_sc',
      title: 'My Custom Federated Architecture',
      creator: 'You (Local Student)',
      scope: 'Hybrid Enterprise',
      desc: 'Custom multi-tier identity topology designed and exported inside the Enterprise Blueprint Designer.',
      likes: 1,
      isUserAdded: true
    }

    setShowcase(prev => [userItem, ...prev])
    setLogsTerminal(prev => [
      ...prev,
      `[SOC] Broadcasting custom Reference Architecture JSON coordinates...`,
      `[SOC] SUCCESS: Custom topology published to local showcase federation! 🎉`
    ])
  }

  const handleLikeShowcase = (id: string) => {
    setShowcase(prev => prev.map(item => item.id === id ? { ...item, likes: item.likes + 1 } : item))
    setLogsTerminal(prev => [...prev, `[SOC] Registered endorsement like for showcase: '${id}'`])
  }

  const handleDeleteUserShowcase = () => {
    localStorage.removeItem('aboutiam-showcase-published')
    setUserPublished(false)
    setShowcase(prev => prev.filter(i => i.id !== 'user_sc'))
    setLogsTerminal(prev => [...prev, `[SOC] Custom Reference Architecture un-published from showcase.`])
  }

  const threads: ForumThread[] = [
    {
      id: 't1',
      title: 'Keycloak SCIM Sync Conflict: HTTP 409 duplicate email',
      author: 'dev_alex_99',
      role: 'CIAM Developer',
      date: 'July 2, 2026',
      likes: 12,
      body: 'Our Okta provisioning loop is continuously failing on user creation when syncing to Keycloak, reporting HTTP 409 Conflict because the user email already exists. How do we configure Keycloak to reconcile or link existing users automatically?',
      solution: 'This happens because Keycloak standard SCIM endpoints do not have duplicate-attribute linking active. Before throwing a POST user error, your SCIM controller must perform an active GET /Users query filtering on emails, and if matched, execute a SCIM PATCH reconciliation call to link external IDs instead.',
      code: `// Best practice: Intercept POST and resolve via GET/PATCH
async function handleUserProvision(userPayload) {
  const email = userPayload.emails[0].value;
  const existingUser = await getScimUserByEmail(email);
  
  if (existingUser) {
    // Reconcile and link existing record via PATCH (RFC 7644)
    return await sendScimPatch(existingUser.id, {
      op: "replace",
      path: "externalId",
      value: userPayload.externalId
    });
  }
  
  // Safe to proceed with creation
  return await sendScimPost(userPayload);
}`
    },
    {
      id: 't2',
      title: 'SAML Signature wrapping (SSW): Assertion-level verification',
      author: 'audit_chief_77',
      role: 'Identity Auditor',
      date: 'June 28, 2026',
      likes: 24,
      body: 'During an external penetration check, our SAML Service Provider (SP) gateway was flagged as vulnerable to SAML assertion signature wrapping. We are already verifying the signature of the top-level <saml:Response> envelope. Is that insufficient?',
      solution: 'Yes, envelope-only signing is extremely vulnerable. Attackers can copy the valid digital signature block, nest the signed assertion deep inside an unsigned element, and inject their own spoofed admin assertion under the root. You MUST rigidly enforce assertion-level signature verifications (Response AND Assertion structures).',
      code: `<saml:Response xmlns:saml="urn:oasis:names:tc:SAML:2.0:protocol">
  <!-- 1. Verify Response envelope signature -->
  <ds:Signature>...</ds:Signature>
  
  <saml:Assertion xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ID="_assert_99">
    <!-- 2. MANDATORY: Verify Assertion-level signature -->
    <ds:Signature>...</ds:Signature>
    <saml:Subject>...</saml:Subject>
  </saml:Assertion>
</saml:Response>`
    }
  ]

  const activeThread = threads.find(t => t.id === selectedThreadId)

  return (
    <div className="space-y-12 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Info */}
      <div className="space-y-3 max-w-4xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
          <Users className="w-3.5 h-3.5" /> Community Forums
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          Community Forums & Showcase
        </h2>
        <p className="text-text-secondary">
          Browse expert architectural discussion boards, deconstruct hardened IAM code snippets, and federate your own custom designed Reference Architectures directly into our community showcase.
        </p>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-border-subtle gap-2">
        <button
          onClick={() => setActiveTab('forums')}
          className={`py-2.5 px-4 text-xs font-bold uppercase border-b-2 transition-all ${
            activeTab === 'forums'
              ? 'border-accent-primary text-accent-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          SecOps Discussion Forums
        </button>
        <button
          onClick={() => setActiveTab('showcase')}
          className={`py-2.5 px-4 text-xs font-bold uppercase border-b-2 transition-all ${
            activeTab === 'showcase'
              ? 'border-accent-primary text-accent-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          Architecture Showcase
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'forums' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Threads list (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-[10px] font-black text-text-muted uppercase tracking-wider block mb-2">Active Dev Boards</h4>
            {threads.map(t => (
             <button
               key={t.id}
               onClick={() => setSelectedThreadId(t.id)}
               className={`w-full p-4 rounded-xl border text-left transition-all block space-y-2.5 ${
                  selectedThreadId === t.id
                    ? 'bg-accent-glow/5 border-accent-primary shadow-sm'
                    : 'border-border-subtle bg-bg-nested hover:bg-bg-sidebar'
                }`}
              >
                <div>
                  <span className="text-[9px] text-text-muted font-bold block mb-1">{t.date} • {t.author}</span>
                  <span className={`text-xs font-extrabold leading-snug block ${
                    selectedThreadId === t.id ? 'text-text-primary' : 'text-text-secondary'
                  }`}>
                    {t.title}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-text-muted">
                  <span className="font-semibold uppercase text-[8px]">{t.role}</span>
                  <span className="flex items-center gap-1">♥ {t.likes}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Thread Deep Dive (lg:col-span-8) */}
          {activeThread && (
            <div className="lg:col-span-8 p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-6">
              {/* Question */}
              <div className="space-y-3 border-b border-border-subtle/50 pb-5">
                <div className="flex items-center gap-2 text-xs text-text-muted font-semibold">
                  <User className="w-3.5 h-3.5" />
                  <span>{activeThread.author} ({activeThread.role}) • {activeThread.date}</span>
                </div>
                <h3 className="text-lg font-black text-text-primary leading-tight">{activeThread.title}</h3>
                <p className="text-xs text-text-secondary leading-relaxed font-medium bg-bg-nested/60 p-3.5 rounded-xl border border-border-subtle/40">
                  "{activeThread.body}"
                </p>
              </div>

              {/* Solution */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Hardened Solution Profile
                </h4>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {activeThread.solution}
                </p>

                {/* Best Practice code block */}
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-text-muted uppercase font-mono block">Remediation Snippet</span>
                  <pre className="p-4 rounded-xl bg-bg-nested border border-border-subtle font-mono text-[9px] text-text-secondary overflow-x-auto leading-relaxed select-text">
                    {activeThread.code}
                  </pre>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {activeTab === 'showcase' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Showcase Feed (lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-6">
            <h4 className="text-[10px] font-black text-text-muted uppercase tracking-wider block">Federated Blueprint Directory</h4>
            
            <div className="grid sm:grid-cols-2 gap-6">
              {showcase.map(item => (
                <div key={item.id} className="p-6 rounded-xl bg-bg-card border border-border-subtle hover:border-accent-primary/20 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[180px]">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] uppercase font-black tracking-wider px-2 py-0.5 rounded bg-bg-nested text-text-muted border border-border-subtle">
                        {item.scope}
                      </span>
                      {item.isUserAdded && (
                        <span className="text-[9px] uppercase font-black tracking-wider px-2 py-0.5 rounded bg-accent-primary text-white animate-pulse">
                          My design
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-black text-text-primary mt-1 leading-snug">{item.title}</h4>
                    <p className="text-xs text-text-secondary leading-relaxed">{item.desc}</p>
                  </div>

                  <div className="pt-4 border-t border-border-subtle/50 mt-4 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-text-muted uppercase">By {item.creator}</span>
                    <div className="flex items-center gap-2">
                      {item.isUserAdded && (
                        <button
                          onClick={handleDeleteUserShowcase}
                          className="p-1 hover:bg-bg-nested rounded text-status-danger hover:text-status-danger-hover transition-all"
                          title="Delete from showcase"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleLikeShowcase(item.id)}
                        className="px-2.5 py-1 bg-bg-nested hover:bg-bg-sidebar border border-border-subtle text-text-secondary rounded text-[10px] font-bold flex items-center gap-1 transition-all group"
                      >
                        <Heart className="w-3 h-3 text-status-danger group-hover:scale-110 fill-current" /> {item.likes} Endorse
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel: Publish My reference topology (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Local federation publisher card */}
            <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border-subtle pb-2 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-accent-primary" /> Showcase Publisher
              </h4>

              {builderConfigured ? (
                userPublished ? (
                  <div className="space-y-3.5 text-center py-6">
                    <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto animate-pulse-slow" />
                    <div>
                      <span className="block text-xs font-black text-text-primary">Topology Published!</span>
                      <p className="text-[10px] text-text-secondary mt-1 leading-normal">Your reference architecture designed in the Enterprise Builder is successfully federated inside the showcase registry.</p>
                    </div>
                    <button
                      onClick={handleDeleteUserShowcase}
                      className="w-full py-1.5 bg-status-danger/10 hover:bg-status-danger/20 border border-status-danger/20 rounded-lg text-status-danger text-[10px] font-bold transition-all"
                    >
                      Un-Publish from Showcase
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    <p className="text-[11px] text-text-secondary leading-normal">
                      We detected custom identity topologies saved inside your browser. Click below to federate your blueprint into the community showcase ledger:
                    </p>
                    <button
                      onClick={handlePublishUserArchitecture}
                      className="w-full py-2 bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Publish My Topology
                    </button>
                  </div>
                )
              ) : (
                <div className="space-y-3.5">
                  <p className="text-[11px] text-text-secondary leading-normal font-medium bg-bg-nested p-3 rounded-lg border border-border-subtle/50">
                    ⚠️ AWAITING DESIGN: You haven't designed or exported any custom identity topologies yet.
                  </p>
                  <p className="text-[11px] text-text-muted leading-relaxed">
                    Open our visual drag-and-drop designer, place and link components, and return here to publish your custom reference architectures.
                  </p>
                  <a
                    href="/playground/reference-builder"
                    className="w-full py-2 bg-bg-nested hover:bg-bg-sidebar border border-border-subtle rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1"
                  >
                    Open Reference Builder <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Audit Logs Console */}
            <div className="p-4 rounded-xl bg-black border border-zinc-800 space-y-2 font-mono text-[10px]">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5 text-zinc-500 uppercase tracking-wider font-bold">
                <span>Showcase Audit Logger</span>
                <span>STATE: ACTIVE</span>
              </div>
              <div className="h-24 overflow-y-auto text-emerald-400 space-y-1">
                {logsTerminal.map((log, idx) => (
                  <div key={idx} className={
                    log.startsWith('[SOC]') ? 'text-blue-400' : ''
                  }>
                    {log}
                  </div>
                ))}
              </div>
            </div>
          </div>
          </div>
          )}

          </div>
          )
          }

