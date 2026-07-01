import { useState } from 'react'
import { Book, Search, Lightbulb, ShieldCheck, FileText, ChevronRight } from 'lucide-react'

interface Term {
  id: string
  term: string
  fullName: string
  analogy: string
  expert: string
  category: string
}

export default function Encyclopedia() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null)

  const encyclopedia: Term[] = [
    {
      id: 'abac',
      term: 'ABAC',
      fullName: 'Attribute-Based Access Control',
      category: 'Authorization',
      analogy: 'Like getting into a VIP club only if you are wearing red shoes (a user attribute), it is before midnight (an environment attribute), and the club isn\'t full (a resource attribute). Your actual name doesn\'t matter.',
      expert: 'An advanced access paradigm granting rights dynamically by combining policies against user attributes, environmental contexts (IP, time), and resource states, overriding flat hierarchical RBAC matrices.'
    },
    {
      id: 'caep',
      term: 'CAEP',
      fullName: 'Continuous Access Evaluation Protocol',
      category: 'Zero Trust',
      analogy: 'A security guard constantly walking with you inside the bank. If you suddenly pull out a camera (a context change), they escort you out immediately, rather than waiting for your visitor badge to expire at 5 PM.',
      expert: 'An active profile of the Shared Signals Framework (RFC 9396) enabling Identity Providers to push real-time session revocation events (e.g., password resets, location anomalies) directly to Relying Party APIs to terminate active access tokens.'
    },
    {
      id: 'jwe',
      term: 'JWE',
      fullName: 'JSON Web Encryption',
      category: 'Cryptography',
      analogy: 'Putting a letter inside a steel lockbox. Unlike a postcard (JWS) where anyone can read the text but cannot forge the signature, a JWE ensures only the recipient with the exact key can read the contents.',
      expert: 'RFC 7516 standard. A JWE encrypts the payload claims, hiding the data entirely from intermediaries. Typically uses hybrid encryption: symmetric CEK for the payload, wrapped asymmetrically for the recipient.'
    },
    {
      id: 'pkce',
      term: 'PKCE',
      fullName: 'Proof Key for Code Exchange',
      category: 'OAuth 2.0',
      analogy: 'Like leaving a secret half-torn dollar bill at the hotel front desk when checking in. When you return later to get your room key, you must present the exact matching torn half to prove you are the same person.',
      expert: 'RFC 7636 standard. Prevents authorization code interception attacks on public clients. The client generates a random `code_verifier`, hashes it to a `code_challenge` for the front-channel, and proves it on the back-channel token exchange.'
    },
    {
      id: 'saml',
      term: 'SAML 2.0',
      fullName: 'Security Assertion Markup Language',
      category: 'Federation',
      analogy: 'A physical passport. The border control (Service Provider) lets you in because they trust the visa stamp (XML Digital Signature) applied by your home government (Identity Provider).',
      expert: 'A heavyweight, XML-based open standard for exchanging authentication and authorization data between an IdP and an SP, heavily relying on XML Digital Signatures to prevent assertion tampering.'
    },
    {
      id: 'scim',
      term: 'SCIM 2.0',
      fullName: 'System for Cross-domain Identity Management',
      category: 'Provisioning',
      analogy: 'An automated megaphone. When HR hires you, the megaphone yells to Slack, AWS, and Salesforce simultaneously to create your accounts using the exact same standard form.',
      expert: 'RFC 7643. An open standard providing a common RESTful API schema (JSON) for managing user and group identities across cloud applications, eliminating custom API integration scripts.'
    }
  ].sort((a, b) => a.term.localeCompare(b.term))

  const filteredTerms = encyclopedia.filter(t => {
    const matchesSearch = t.term.toLowerCase().includes(search.toLowerCase()) || 
                          t.fullName.toLowerCase().includes(search.toLowerCase())
    const matchesCat = activeCategory === 'All' || t.category === activeCategory
    return matchesSearch && matchesCat
  })

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title */}
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
          <Book className="w-3.5 h-3.5" /> Encyclopedia
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          Master IAM Glossary
        </h2>
        <p className="text-text-secondary">
          Translate complex acronyms. Every standard from ABAC to Zero Trust is defined with a beginner-friendly analogy and a strict architectural specification.
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Left Side: Search and List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative w-full">
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-2.5 pl-10 rounded-lg bg-bg-sidebar border border-border-subtle text-sm text-text-primary focus:outline-none focus:border-accent-primary" 
              placeholder="Search terms (e.g. PKCE)..." 
            />
            <Search className="w-4 h-4 text-text-muted absolute left-3 top-3.5" />
          </div>

          <div className="flex flex-wrap gap-2">
            {['All', 'OAuth 2.0', 'Federation', 'Cryptography', 'Provisioning', 'Zero Trust', 'Authorization'].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all ${
                  activeCategory === cat
                    ? 'bg-accent-primary text-white border-accent-primary'
                    : 'bg-bg-sidebar text-text-muted border-border-subtle hover:text-text-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 mt-4">
            {filteredTerms.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTerm(t)}
                className={`w-full text-left p-3 rounded-xl border flex items-center justify-between transition-all ${
                  selectedTerm?.id === t.id
                    ? 'border-accent-primary bg-accent-glow shadow-sm'
                    : 'border-border-subtle bg-bg-card hover:border-accent-primary/30'
                }`}
              >
                <div className="space-y-0.5">
                  <span className={`block text-sm font-black ${selectedTerm?.id === t.id ? 'text-accent-primary' : 'text-text-primary'}`}>
                    {t.term}
                  </span>
                  <span className="block text-[10px] text-text-muted font-bold uppercase truncate max-w-[160px]">
                    {t.category}
                  </span>
                </div>
                <ChevronRight className={`w-4 h-4 ${selectedTerm?.id === t.id ? 'text-accent-primary' : 'text-text-muted'}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Term Detail View */}
        <div className="lg:col-span-3">
          {selectedTerm ? (
            <div className="p-8 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-8 animate-fadeIn h-full">
              <div className="space-y-2 border-b border-border-subtle pb-6">
                <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-accent-glow text-accent-primary border border-accent-primary/10">
                  {selectedTerm.category}
                </span>
                <h3 className="text-3xl font-black text-text-primary">{selectedTerm.term}</h3>
                <p className="text-lg text-text-secondary font-medium">{selectedTerm.fullName}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Analogy */}
                <div className="p-6 rounded-xl bg-bg-sidebar/50 border border-border-subtle space-y-4">
                  <span className="text-[11px] font-black text-accent-primary uppercase tracking-wider flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" /> The Beginner Analogy
                  </span>
                  <p className="text-sm text-text-secondary leading-relaxed font-medium">
                    "{selectedTerm.analogy}"
                  </p>
                </div>

                {/* Expert Detail */}
                <div className="p-6 rounded-xl bg-bg-sidebar/50 border border-border-subtle space-y-4">
                  <span className="text-[11px] font-black text-accent-secondary uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Architecture Blueprint
                  </span>
                  <p className="text-[13px] text-text-primary leading-relaxed font-mono bg-bg-nested p-3 rounded border border-border-subtle/50">
                    {selectedTerm.expert}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-bg-nested/30 border border-border-subtle/50 flex gap-3 text-xs text-text-muted font-semibold items-start">
                <FileText className="w-4 h-4 shrink-0 text-text-secondary" />
                <span>Need to see how {selectedTerm.term} fits into a real flow? Check the Playgrounds section to run live interactive simulations using this standard.</span>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 border border-dashed border-border-subtle rounded-2xl bg-bg-card/50">
              <Book className="w-12 h-12 text-text-muted mb-4" />
              <h4 className="text-lg font-bold text-text-primary">Select a Term</h4>
              <p className="text-sm text-text-secondary">Click on any acronym or standard on the left to reveal its deep-dive translation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
