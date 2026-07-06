import { useState, useRef, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { 
  Bot, Send, Terminal, Copy, Check, Sparkles, 
  MessageSquare, ShieldCheck, 
  LayoutDashboard, GitCompare, GraduationCap,
  Wrench, Gamepad2, FlaskConical, BookOpen, Layers, Award
} from 'lucide-react'

// Import Knowledge Graph Data
import { 
  KNOWLEDGE_GRAPH, 
  COMPARISONS, 
  LEARNING_TRACKS
} from '../data/aiKnowledgeGraph'
import type { ResourceLink } from '../data/aiKnowledgeGraph'

interface Message {
  sender: 'user' | 'assistant'
  text: string
  code?: string
  codeLang?: string
  resources?: ResourceLink[]
}

type TabType = 'chat' | 'compare' | 'learn'

// Helper component for Resource Link Cards
const ResourceCard = ({ resource }: { resource: ResourceLink }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'tool': return <Wrench className="w-4 h-4 text-blue-500" />
      case 'playground': return <Gamepad2 className="w-4 h-4 text-purple-500" />
      case 'lab': return <FlaskConical className="w-4 h-4 text-green-500" />
      case 'encyclopedia': return <BookOpen className="w-4 h-4 text-orange-500" />
      case 'architecture': return <Layers className="w-4 h-4 text-teal-500" />
      case 'certification': return <Award className="w-4 h-4 text-yellow-500" />
      default: return <ShieldCheck className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <Link 
      to={resource.path} 
      className="flex items-start gap-3 p-3 rounded-xl bg-bg-sidebar border border-border-subtle hover:bg-bg-nested hover:border-accent-primary/50 transition-all group"
    >
      <div className="p-2 rounded-lg bg-bg-nested border border-border-subtle group-hover:bg-bg-sidebar">
        {getIcon(resource.type)}
      </div>
      <div>
        <h4 className="text-xs font-bold text-text-primary flex items-center gap-1.5">
          {resource.title}
          <span className="text-[9px] uppercase tracking-wider text-text-muted font-semibold bg-bg-nested px-1.5 py-0.5 rounded">
            {resource.type}
          </span>
        </h4>
        {resource.desc && (
          <p className="text-[11px] text-text-secondary mt-1">{resource.desc}</p>
        )}
      </div>
    </Link>
  )
}

export default function Assistant() {
  const [activeTab, setActiveTab] = useState<TabType>('chat')

  // --- CHAT STATE ---
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: "Hello! I am your **AI Knowledge Assistant 2.0**. I am fully integrated into the AboutIAM platform. You can ask me to explain identity protocols, and I will automatically fetch the relevant tools, playgrounds, and architectures for you. What would you like to learn about today?",
      resources: [
        { title: 'OAuth Visualizer', path: '/playground/oauth', type: 'playground', desc: 'Explore OAuth 2.0 visually' },
        { title: 'Passkey Internals', path: '/playground/passkey-internals', type: 'playground', desc: 'Learn how WebAuthn works' }
      ]
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isCopied, setIsCopied] = useState<number | null>(null)
  const chatEndRef = useRef<HTMLDivElement | null>(null)

  // --- COMPARE STATE ---
  const [activeComparisonId, setActiveComparisonId] = useState<string>('oauth_vs_oidc')
  
  // --- LEARN STATE ---
  const [learnLevel, setLearnLevel] = useState<string>('Beginner')
  const [learnGoal, setLearnGoal] = useState<string>('Security Engineer')

  // --- EFFECTS ---
  useEffect(() => {
    if (activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isTyping, activeTab])

  // --- HANDLERS ---
  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text)
    setIsCopied(idx)
    setTimeout(() => setIsCopied(null), 1500)
  }

  // Generate dynamic resources based on text
  const extractResources = (text: string): ResourceLink[] => {
    const textLower = text.toLowerCase()
    let foundResources: ResourceLink[] = []
    
    Object.keys(KNOWLEDGE_GRAPH).forEach(key => {
      if (textLower.includes(key)) {
        foundResources = [...foundResources, ...KNOWLEDGE_GRAPH[key]]
      }
    })

    // Deduplicate by title
    const unique = foundResources.filter((v, i, a) => a.findIndex(t => (t.title === v.title)) === i)
    return unique.slice(0, 4) // Max 4 recommendations
  }

  const getSimulatedResponse = (query: string): Message => {
    const q = query.toLowerCase()
    const resources = extractResources(query)

    if (q.includes('s3') || q.includes('aws')) {
      return {
        sender: 'assistant',
        text: `Here is a production-ready, least-privilege **AWS IAM S3 Read-Only JSON Policy**. This configuration explicitly isolates read access to a designated bucket, satisfying security audit guidelines.`,
        codeLang: 'json',
        code: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ListBucketContents",
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::aboutiam-data"
    }
  ]
}`,
        resources
      }
    }

    if (q.includes('rego') || q.includes('opa')) {
      return {
        sender: 'assistant',
        text: `Here is a secure **Open Policy Agent (OPA) Rego Policy** that evaluates Role-Based Access Control (RBAC) and matching workspace conditions.`,
        codeLang: 'rego',
        code: `package authz
default allow = false
allow { input.user.role == "admin" }`,
        resources
      }
    }

    if (q.includes('fido2') || q.includes('passkey') || q.includes('webauthn')) {
      return {
        sender: 'assistant',
        text: `Here is the JavaScript client-side blueprint to trigger a **WebAuthn Passkey Registration Challenge** natively in modern browsers.`,
        codeLang: 'javascript',
        code: `const credential = await navigator.credentials.create({
  publicKey: {
    challenge: new Uint8Array([1, 2, 3, 4]),
    rp: { name: "AboutIAM", id: "aboutiam.com" },
    user: { id: new Uint8Array([1]), name: "user", displayName: "User" },
    pubKeyCredParams: [{ alg: -7, type: "public-key" }]
  }
});`,
        resources
      }
    }

    if (q.includes('oauth') || q.includes('oidc')) {
       return {
         sender: 'assistant',
         text: `**OAuth 2.0** is an authorization framework allowing third-party applications to obtain limited access to an HTTP service. **OpenID Connect (OIDC)** adds an identity layer on top of OAuth 2.0 to authenticate users.\n\nI have attached some interactive playgrounds and tools below for you to explore these flows!`,
         resources
       }
    }

    return {
      sender: 'assistant',
      text: `I have analyzed your query regarding **"${query}"**. Based on our identity framework, I recommend reviewing the contextual resources attached below to dive deeper into this topic.`,
      resources
    }
  }

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return

    const userMsg: Message = { sender: 'user', text: textToSend }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      const response = getSimulatedResponse(textToSend)
      setMessages(prev => [...prev, response])
      setIsTyping(false)
    }, 1200)
  }

  // --- RENDER HELPERS ---
  const activeComparison = useMemo(() => {
    return COMPARISONS.find(c => c.id === activeComparisonId) || COMPARISONS[0]
  }, [activeComparisonId])

  const activeTrack = useMemo(() => {
    return LEARNING_TRACKS.find(t => t.level === learnLevel && t.goal === learnGoal) || LEARNING_TRACKS[0]
  }, [learnLevel, learnGoal])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 h-[calc(100svh-80px)] flex flex-col">
      
      {/* Header & Tabs */}
      <div className="shrink-0 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
              <Sparkles className="w-3.5 h-3.5" /> AI Knowledge Assistant 2.0
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">
              Identity Engineering Platform
            </h1>
            <p className="text-sm text-text-secondary">
              Your intelligent navigator for learning, designing, and validating IAM architectures.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto gap-2 pb-2 border-b border-border-subtle scrollbar-hide">
          {[
            { id: 'chat', label: 'Knowledge Chat', icon: MessageSquare },
            { id: 'compare', label: 'Comparison Engine', icon: GitCompare },
            { id: 'learn', label: 'Learning Planner', icon: GraduationCap }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg text-sm font-bold whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.id 
                  ? 'border-accent-primary text-accent-primary bg-accent-glow/50' 
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-bg-sidebar'
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow min-h-0 relative">
        
        {/* TAB 1: KNOWLEDGE CHAT */}
        {activeTab === 'chat' && (
          <div className="h-full flex flex-col lg:flex-row gap-6">
            {/* Chat Area */}
            <div className="flex-grow flex flex-col rounded-2xl bg-bg-card border border-border-subtle shadow-sm overflow-hidden relative">
              <div className="absolute inset-0 bg-[radial-gradient(rgba(59,130,246,0.01)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
              
              <div className="flex-grow overflow-y-auto p-5 space-y-6 scroll-smooth z-10">
                {messages.map((m, idx) => {
                  const isAI = m.sender === 'assistant'
                  return (
                    <div key={idx} className={`flex gap-4 items-start ${isAI ? 'justify-start' : 'justify-end'}`}>
                      {isAI && (
                        <div className="w-9 h-9 rounded-xl bg-accent-glow text-accent-primary flex items-center justify-center border border-accent-primary/15 shrink-0 shadow-sm">
                          <Bot className="w-5 h-5" />
                        </div>
                      )}
                      <div className={`space-y-4 max-w-[85%] text-sm leading-relaxed p-4 rounded-2xl border ${
                        isAI 
                          ? 'bg-bg-sidebar/50 border-border-subtle text-text-primary' 
                          : 'bg-accent-primary border-accent-primary text-white shadow-md'
                      }`}>
                        <span className={`text-[9px] font-bold uppercase tracking-wider block ${isAI ? 'text-accent-primary' : 'text-white/70'}`}>
                          {isAI ? 'AboutIAM AI Architect' : 'Your Query'}
                        </span>
                        <p className="whitespace-pre-line">{m.text}</p>
                        
                        {m.code && (
                          <div className="space-y-2 mt-4 font-mono relative">
                            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-text-secondary pb-1 border-b border-border-subtle/30">
                              <span className="flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5" /> {m.codeLang}</span>
                              <button onClick={() => copyToClipboard(m.code || '', idx)} className="inline-flex items-center gap-1 hover:text-text-primary">
                                {isCopied === idx ? <Check className="w-3 h-3 text-status-success" /> : <Copy className="w-3 h-3" />}
                                {isCopied === idx ? 'Copied' : 'Copy'}
                              </button>
                            </div>
                            <pre className="p-3.5 rounded-xl bg-bg-nested/80 border border-border-subtle text-xs text-text-primary overflow-x-auto">
                              {m.code}
                            </pre>
                          </div>
                        )}

                        {/* Inline Resources for Mobile (Hidden on Desktop, shown via flex-col order) */}
                        {isAI && m.resources && m.resources.length > 0 && (
                          <div className="lg:hidden mt-4 space-y-2 border-t border-border-subtle pt-3">
                            <span className="text-[10px] uppercase font-bold text-text-muted">Recommended Resources</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {m.resources.map((res, i) => <ResourceCard key={i} resource={res} />)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
                {isTyping && (
                  <div className="flex gap-4 items-start justify-start animate-pulse">
                    <div className="w-9 h-9 rounded-xl bg-bg-sidebar border border-border-subtle flex items-center justify-center shrink-0">
                      <Bot className="w-5 h-5 text-text-muted" />
                    </div>
                    <div className="p-4 rounded-2xl bg-bg-sidebar/30 border border-border-subtle/50 text-xs text-text-muted font-bold uppercase flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-bounce delay-100"></span>
                      <span className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-bounce delay-200"></span>
                      Analyzing Platform Context
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-border-subtle bg-bg-card z-10 shrink-0">
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(input)}
                    disabled={isTyping}
                    className="flex-grow p-3 rounded-xl bg-bg-sidebar border border-border-subtle text-sm text-text-primary focus:outline-none focus:border-accent-primary" 
                    placeholder="Ask about OAuth, JWT, Zero Trust, Passkeys..." 
                  />
                  <button 
                    onClick={() => handleSendMessage(input)}
                    disabled={isTyping || !input.trim()}
                    className="p-3 rounded-xl bg-accent-primary hover:bg-accent-hover text-white transition-all disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex gap-2 mt-3 overflow-x-auto scrollbar-hide pb-1">
                  {['Explain OAuth vs SAML', 'How do Passkeys work?', 'Write an OPA Rego policy'].map((p, i) => (
                     <button
                       key={i}
                       onClick={() => handleSendMessage(p)}
                       disabled={isTyping}
                       className="px-3 py-1.5 rounded-lg border border-border-subtle bg-bg-sidebar hover:bg-bg-nested text-text-secondary text-[11px] font-semibold whitespace-nowrap"
                     >
                       {p}
                     </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Desktop Context Sidebar */}
            <div className="hidden lg:flex w-80 flex-col gap-4 shrink-0">
              <div className="bg-bg-card border border-border-subtle rounded-2xl p-5 shadow-sm sticky top-0">
                <div className="flex items-center gap-2 mb-4 text-sm font-bold text-text-primary border-b border-border-subtle pb-3">
                  <LayoutDashboard className="w-4 h-4 text-accent-primary" />
                  Active Context Resources
                </div>
                <div className="space-y-3">
                  {messages.length > 0 && messages[messages.length - 1].resources ? (
                    messages[messages.length - 1].resources!.map((res, i) => (
                      <ResourceCard key={i} resource={res} />
                    ))
                  ) : (
                    <div className="text-xs text-text-muted text-center py-8">
                      Ask a question to dynamically load related tools and playgrounds here.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COMPARISON ENGINE */}
        {activeTab === 'compare' && (
          <div className="h-full overflow-y-auto space-y-6">
            <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm flex flex-col md:flex-row items-center gap-4">
              <div className="flex-grow w-full">
                <label className="block text-xs font-bold text-text-muted uppercase mb-2">Select Identity Protocol Pairing to Compare</label>
                <select 
                  className="w-full p-3 rounded-xl bg-bg-sidebar border border-border-subtle text-sm font-bold text-text-primary outline-none focus:border-accent-primary"
                  value={activeComparisonId}
                  onChange={(e) => setActiveComparisonId(e.target.value)}
                >
                  {COMPARISONS.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {activeComparison ? (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm">
                  <h3 className="text-lg font-bold text-text-primary mb-3">Architectural Summary</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{activeComparison.summary}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm">
                    <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2 border-b border-border-subtle pb-2">
                      {activeComparison.entityA}
                    </h3>
                    <ul className="space-y-3">
                      {activeComparison.useCasesA.map((uc, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                          <Check className="w-4 h-4 text-status-success shrink-0 mt-0.5" /> {uc}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm">
                    <h3 className="text-sm font-bold text-text-primary mb-4 flex items-center gap-2 border-b border-border-subtle pb-2">
                      {activeComparison.entityB}
                    </h3>
                    <ul className="space-y-3">
                      {activeComparison.useCasesB.map((uc, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                          <Check className="w-4 h-4 text-status-success shrink-0 mt-0.5" /> {uc}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-border-subtle shadow-sm">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-bg-sidebar border-b border-border-subtle">
                        <th className="p-4 text-xs font-bold text-text-muted uppercase">Feature</th>
                        <th className="p-4 text-xs font-bold text-text-primary">{activeComparison.entityA}</th>
                        <th className="p-4 text-xs font-bold text-text-primary">{activeComparison.entityB}</th>
                      </tr>
                    </thead>
                    <tbody className="bg-bg-card">
                      {activeComparison.table.map((row, i) => (
                        <tr key={i} className="border-b border-border-subtle last:border-0 hover:bg-bg-sidebar/50 transition-colors">
                          <td className="p-4 text-sm font-semibold text-text-secondary">{row.feature}</td>
                          <td className="p-4 text-sm text-text-primary">{row.a}</td>
                          <td className="p-4 text-sm text-text-primary">{row.b}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-text-muted bg-bg-card rounded-2xl border border-border-subtle border-dashed">
                Select a valid comparison pairing above to view the analysis.
              </div>
            )}
          </div>
        )}

        {/* TAB 3: LEARNING PLANNER */}
        {activeTab === 'learn' && (
          <div className="h-full overflow-y-auto space-y-6">
             <div className="flex flex-col sm:flex-row gap-4 p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm items-center">
              <div className="flex-grow w-full">
                <label className="block text-xs font-bold text-text-muted uppercase mb-2">Current Skill Level</label>
                <select 
                  className="w-full p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-sm font-bold text-text-primary outline-none"
                  value={learnLevel}
                  onChange={(e) => setLearnLevel(e.target.value)}
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                </select>
              </div>
              <div className="flex-grow w-full">
                <label className="block text-xs font-bold text-text-muted uppercase mb-2">Target Career Goal</label>
                <select 
                  className="w-full p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-sm font-bold text-text-primary outline-none"
                  value={learnGoal}
                  onChange={(e) => setLearnGoal(e.target.value)}
                >
                  <option>Security Engineer</option>
                  <option>IAM Architect</option>
                </select>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm">
               <h2 className="text-xl font-bold text-text-primary">{activeTrack.title}</h2>
               <p className="text-sm text-text-secondary mt-1 mb-8">{activeTrack.description}</p>
               
               <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-border-subtle">
                 {activeTrack.steps.map((step, i) => (
                   <div key={i} className="relative flex items-start justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                     <div className="flex items-center justify-center w-10 h-10 rounded-full border-[3px] border-bg-card bg-accent-primary text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                       <span className="text-sm font-bold">{i + 1}</span>
                     </div>
                     <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl bg-bg-sidebar border border-border-subtle shadow-sm group-hover:border-accent-primary/50 transition-colors ml-4 md:ml-0">
                       <h3 className="text-sm font-bold text-text-primary mb-1">{step.title}</h3>
                       <p className="text-xs text-text-secondary mb-4">{step.desc}</p>
                       <div className="space-y-2">
                         {step.resources.map((res, j) => <ResourceCard key={j} resource={res} />)}
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
