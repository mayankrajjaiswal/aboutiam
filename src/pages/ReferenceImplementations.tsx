import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldCheck, Clipboard, Check, Terminal, Code,
  ArrowLeft, ShieldAlert
} from 'lucide-react'
import { PROJECTS, LEVEL_LABELS, LEVEL_ORDER } from '../data/referenceProjects'

export default function ReferenceImplementations() {
  const [activeProjectId, setActiveProjectId] = useState<string>('springboot-keycloak')
  const [copiedCode, setCopiedCode] = useState<boolean>(false)
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})

  // Deep-link support: /references?ref=<id> lands directly on that project (GEMINI §4I convention)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const id = params.get('ref')
      if (id && PROJECTS.some((p) => p.id === id)) {
        setTimeout(() => {
          setActiveProjectId(id)
        }, 0)
      }
    }
  }, [])

  // Active Project Selector
  const activeProject = useMemo(() => {
    return PROJECTS.find(p => p.id === activeProjectId) || PROJECTS[0]
  }, [activeProjectId])

  // Copy code utility
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  // Toggle checklist check
  const toggleChecklist = (id: string) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  return (
    <div className="min-h-screen bg-bg-base text-text-primary font-sans">
      
      {/* HEADER BAR */}
      <div className="border-b border-border-subtle bg-bg-card px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Code className="text-accent-primary w-7 h-7 animate-pulse shrink-0" />
          <div>
            <h1 className="text-xl font-black tracking-tight flex items-center gap-1.5">
              Enterprise Reference Implementations <span className="text-[10px] bg-accent-glow text-accent-primary px-2 py-0.5 rounded font-bold font-mono tracking-wider uppercase">Production-Ready</span>
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">Bridge the gap between theoretical standards and real-world microservice code. Production-quality, verified snippets across core platforms.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/" className="text-xs bg-bg-nested hover:bg-border-subtle px-3 py-2 rounded-lg text-text-secondary flex items-center gap-1.5 transition shrink-0">
            <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
          </Link>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        
        {/* PORTAL BODY SPLIT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT SELECTOR AND BLUEPRINTS (col-span-4) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            
            <div className="bg-bg-card border border-border-subtle rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <h3 className="text-xs font-black text-text-secondary uppercase tracking-wider">Reference Implementations</h3>
                <p className="text-[11px] text-text-muted mt-0.5">Select a pre-verified core technology framework to review source files and deployment guides.</p>
              </div>

              <div className="flex flex-col gap-4">
                {LEVEL_ORDER.map((level) => {
                  const projectsForLevel = PROJECTS.filter((p) => p.level === level)
                  if (projectsForLevel.length === 0) return null
                  return (
                    <div key={level} className="flex flex-col gap-2">
                      <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider px-1">
                        {LEVEL_LABELS[level]}
                      </span>
                      {projectsForLevel.map((proj) => (
                        <button
                          key={proj.id}
                          onClick={() => {
                            setActiveProjectId(proj.id)
                            setCheckedItems({})
                          }}
                          className={`w-full py-3 px-4 rounded-xl border text-left flex flex-col gap-1 transition ${activeProjectId === proj.id ? 'bg-accent-glow border-accent-primary text-accent-primary font-bold shadow-sm' : 'border-border-subtle bg-bg-nested/40 hover:bg-bg-nested text-text-secondary cursor-pointer'}`}
                        >
                          <span className="text-xs font-black block">{proj.shortLabel}</span>
                          <span className="text-[10px] text-text-muted font-normal block font-mono">{proj.category} · {proj.tech}</span>
                        </button>
                      ))}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* FLOW DIAGRAM VIEW */}
            <div className="bg-bg-card border border-border-subtle rounded-2xl p-5 shadow-sm space-y-3">
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block border-b border-border-subtle/50 pb-2">SSO Handshake Flow Map</span>
              <pre className="text-[10px] font-mono text-text-secondary bg-bg-nested p-3.5 rounded-lg overflow-x-auto whitespace-pre leading-relaxed select-none">
                <code>{activeProject.diagram}</code>
              </pre>
            </div>

          </div>

          {/* RIGHT DETAILED FILES VIEW (col-span-8) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* OVERVIEW PANEL */}
            <div className="bg-bg-card border border-border-subtle rounded-2xl p-6 shadow-sm space-y-4">
              <div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[9px] bg-bg-nested border border-border-subtle px-2 py-0.5 rounded font-mono font-bold text-text-secondary uppercase">{activeProject.rfc}</span>
                  <span className="text-[9px] bg-accent-glow border border-accent-primary/20 text-accent-primary px-2 py-0.5 rounded font-mono font-bold uppercase">{activeProject.category} · {LEVEL_LABELS[activeProject.level]}</span>
                </div>
                <h2 className="text-base font-black text-text-primary mt-2">{activeProject.title}</h2>
                <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">{activeProject.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border-subtle/50 pt-4">
                {/* Folder Structure */}
                <div className="space-y-2">
                  <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider block">Recommended Directory Tree</span>
                  <pre className="text-[10px] font-mono text-text-secondary bg-bg-nested p-4 rounded-xl border border-border-subtle/40 overflow-x-auto leading-relaxed select-text">
                    <code>{activeProject.folderStructure}</code>
                  </pre>
                </div>

                {/* Deployment */}
                <div className="space-y-2">
                  <span className="text-[9px] text-text-muted font-bold uppercase tracking-wider block">Quick Deployment Steps</span>
                  <div className="space-y-2">
                    {activeProject.deployment.map((step, idx) => (
                      <div key={idx} className="flex gap-2.5 items-start text-xs text-text-secondary bg-bg-nested/40 border border-border-subtle/40 p-2.5 rounded-lg">
                        <span className="w-5 h-5 rounded bg-bg-nested border border-border-subtle flex items-center justify-center font-mono text-[10px] font-bold text-text-primary shrink-0">{idx + 1}</span>
                        <span className="leading-normal">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* CORE INTERACTIVE SOURCE FILE CODE VIEWER */}
            <div className="border border-slate-800 rounded-2xl overflow-hidden shadow-2xl bg-slate-950">
              <div className="flex items-center justify-between bg-[#0b0f19] px-4 py-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                  <Terminal className="w-4 h-4 text-accent-primary animate-pulse" /> {activeProject.codeFile}
                </div>
                <button
                  onClick={() => copyToClipboard(activeProject.code)}
                  className="text-[10px] bg-slate-900/60 hover:bg-slate-900 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-800 transition cursor-pointer flex items-center gap-1 focus:outline-none"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Clipboard className="w-3.5 h-3.5" />}
                  {copiedCode ? 'Copied!' : 'Copy Source'}
                </button>
              </div>
              <pre className="p-5 overflow-x-auto text-[11px] font-mono text-slate-300 whitespace-pre max-h-[380px] custom-scrollbar text-left leading-relaxed">
                <code>{activeProject.code}</code>
              </pre>
            </div>

            {/* SECURITY HARDENING AUDIT CHECKLIST */}
            <div className="bg-bg-card border border-border-subtle rounded-2xl p-5 shadow-sm space-y-4">
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block border-b border-border-subtle/50 pb-2">Production Security Hardening Audit Checklist</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {activeProject.securityChecklist.map((item, idx) => {
                  const checkId = `${activeProject.id}-sec-${idx}`
                  return (
                    <button
                      key={idx}
                      onClick={() => toggleChecklist(checkId)}
                      className="text-left flex items-start gap-2.5 p-3 rounded-xl border border-border-subtle/50 hover:bg-bg-nested/60 transition cursor-pointer text-xs text-text-secondary leading-snug"
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${checkedItems[checkId] ? 'bg-status-success border-status-success text-white' : 'border-border-subtle bg-bg-card'}`}>
                        {checkedItems[checkId] && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className={checkedItems[checkId] ? 'line-through text-text-muted font-normal' : 'font-bold'}>{item}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ARCHITECTURAL PITFALLS & MITIGATIONS */}
            <div className="bg-bg-card border border-border-subtle rounded-2xl p-5 shadow-sm space-y-4">
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block border-b border-border-subtle/50 pb-2 flex items-center gap-1.5 text-status-danger">
                <ShieldAlert className="w-4 h-4 text-status-danger" /> Common Pitfalls & Secure Remediations
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeProject.pitfalls.map((item, idx) => (
                  <div key={idx} className="border border-border-subtle p-4 rounded-xl space-y-3 bg-bg-nested/30 flex flex-col justify-between">
                    <div className="space-y-1">
                      <span className="text-[9px] bg-status-danger/10 text-status-danger px-1.5 py-0.5 rounded font-bold uppercase tracking-wider font-mono">Anti-Pattern / Mistake</span>
                      <p className="text-xs font-black text-text-primary mt-1.5 leading-snug">"{item.mistake}"</p>
                    </div>
                    <div className="pt-3 border-t border-border-subtle/40 text-[11px] text-status-success font-bold font-mono flex items-start gap-1">
                      <ShieldCheck className="w-4 h-4 text-status-success shrink-0" />
                      <span>Remediation: {item.fix}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  )
}
