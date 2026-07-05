import { useState, useRef, useEffect } from 'react'
import { 
  Bot, Send, Terminal, Copy, Check, Sparkles, 
  HelpCircle, MessageSquare, ShieldCheck, Key
} from 'lucide-react'

interface Message {
  sender: 'user' | 'assistant'
  text: string
  code?: string
  codeLang?: string
}

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: "Hello! I am your **AboutIAM AI Architect**, trained across core security blueprints (OAuth 2.1, OIDC, SAML, WebAuthn, SCIM). I can compile AWS IAM policies, write OPA Rego assertion rules, compare federated architectures, or suggest developer code. What are we designing today?"
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isCopied, setIsCopied] = useState<number | null>(null)
  const chatEndRef = useRef<HTMLDivElement | null>(null)

  // Auto scroll to latest chat messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text)
    setIsCopied(idx)
    setTimeout(() => setIsCopied(null), 1500)
  }

  // Pre-populate response logic to simulate high-fidelity expert RAG queries
  const getSimulatedResponse = (query: string): Message => {
    const q = query.toLowerCase()

    if (q.includes('s3') || q.includes('aws')) {
      return {
        sender: 'assistant',
        text: `Here is a production-ready, least-privilege **AWS IAM S3 Read-Only JSON Policy**. This configuration explicitly isolates read access to a designated bucket, satisfying security audit guidelines:
        
1. Enforces \`s3:GetObject\` permissions inside the specific bucket path.
2. Enforces \`s3:ListBucket\` permissions on the parent directory root.
3. Completely blocks critical write operations (\`s3:PutObject\`, \`s3:DeleteObject\`).`,
        codeLang: 'json',
        code: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ListBucketContents",
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket"
      ],
      "Resource": "arn:aws:s3:::aboutiam-corporate-data"
    },
    {
      "Sid": "ReadObjectsInBucket",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::aboutiam-corporate-data/*"
    }
  ]
}`
      }
    }

    if (q.includes('saml') || q.includes('oidc')) {
      return {
        sender: 'assistant',
        text: `Here is an expert architectural comparison between **SAML 2.0** and **OpenID Connect (OIDC)**:

| Feature | SAML 2.0 | OpenID Connect (OIDC) |
| :--- | :--- | :--- |
| **Data Format** | Heavy XML Assertions | Lightweight JSON (JWT Tokens) |
| **SSO Transport** | Browser Redirects (Post/Get) | Browser Redirects & Direct REST API (Backchannel) |
| **Typical Target** | Heritage Enterprise Workforce | Modern SPAs, Mobile Apps, APIs, CIAM |
| **Cryptography** | XML Digital Signatures (DSIG) | JSON Web Signatures (JWS - HMAC/RSA/ECDSA) |
| **Provisioning** | Separate WS-Trust / Profile exchanges | Standardized SCIM 2.0 payload syncs |

**Architectural Advice:** Standardize on **OIDC** for all new software integrations. Adopt **SAML 2.0** only when integrating with legacy enterprise federations (e.g. legacy ADFS or standard government ID agencies).`
      }
    }

    if (q.includes('rego') || q.includes('opa')) {
      return {
        sender: 'assistant',
        text: `Here is a secure **Open Policy Agent (OPA) Rego Policy** that evaluates Role-Based Access Control (RBAC) and matching workspace conditions. This policy can be compiled client-side in our future OPA WASM playground:`,
        codeLang: 'rego',
        code: `package aboutiam.authz

# By default, deny access
default allow = false

# Allow access if user is an admin
allow {
    input.user.role == "admin"
}

# Allow developers read-only access to their specific workspace
allow {
    input.user.role == "developer"
    input.action == "read"
    input.user.workspace_id == input.resource.workspace_id
}`
      }
    }

    if (q.includes('fido2') || q.includes('passkey') || q.includes('webauthn')) {
      return {
        sender: 'assistant',
        text: `Here is the JavaScript client-side blueprint to trigger a **WebAuthn Passkey Registration Challenge** natively in modern browsers. This API prompts the device's biometric sensor (Windows Hello, FaceID, or USB YubiKeys) to generate an asymmetric key pair:`,
        codeLang: 'javascript',
        code: `// Client-side WebAuthn Credential Creation API
const credentialOptions = {
  publicKey: {
    challenge: Uint8Array.from("aboutiam_secure_challenge_bits", c => c.charCodeAt(0)),
    rp: { name: "AboutIAM Platform", id: "aboutiam.com" },
    user: {
      id: Uint8Array.from("user_8891a", c => c.charCodeAt(0)),
      name: "alex.hacker@aboutiam.com",
      displayName: "Alex Hacker"
    },
    pubKeyCredParams: [
      { alg: -7, type: "public-key" }, // ES256
      { alg: -257, type: "public-key" } // RS256
    ],
    authenticatorSelection: {
      authenticatorAttachment: "platform", // FaceID, Fingerprint
      userVerification: "required"
    },
    timeout: 60000
  }
};

const credential = await navigator.credentials.create(credentialOptions);`
      }
    }

    // SmartFallback response
    return {
      sender: 'assistant',
      text: `I have analyzed your query regarding **"${query}"** against our identity RFC references. 

To secure this architecture, please ensure you enforce these three baseline guidelines:
1. **Never send credentials across channels:** If your query relates to API authentication, ensure client secrets are restricted strictly to secure backends, and public clients (SPAs/mobiles) leverage **OAuth 2.1 PKCE** configurations.
2. **Minimize session standing windows:** Force session cookies or JSON Web Token expiries to a maximum threshold ($le 1$ hour) and configure **CAEP Continuous Access Evaluations** to react to network shifts in real-time.
3. **Phishing Protection:** Transition your authentication gateways from legacy passwords or SMS TOTPs to **phishing-resistant FIDO2 Passkeys** using native WebAuthn challenges.

Please select one of the Quick-Start Prompts below to inspect specific production-grade JSON, Rego, or JavaScript code configurations!`
    }
  }

  // Handle message send
  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return

    const userMsg: Message = { sender: 'user', text: textToSend }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    // Simulate vector search latency
    setTimeout(() => {
      const response = getSimulatedResponse(textToSend)
      setMessages(prev => [...prev, response])
      setIsTyping(false)
    }, 1200)
  }

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[calc(100svh-120px)] flex flex-col justify-between">
      {/* Header */}
      <div className="space-y-3 shrink-0">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
          <Sparkles className="w-3.5 h-3.5" /> Client-Side RAG Assistant
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-text-primary leading-none">
          IAM AI Architect Chat
        </h2>
        <p className="text-text-secondary text-xs sm:text-sm">
          A security advisor trained to help you write secure cloud access configurations, compare identity protocols, and implement standard WebAuthn Passkeys.
        </p>
      </div>

      {/* Main Chat Framework Container */}
      <div className="flex-grow my-4 p-5 rounded-2xl bg-bg-card border border-border-subtle flex flex-col justify-between overflow-hidden shadow-sm relative">
        <div className="absolute inset-0 bg-[radial-gradient(rgba(59,130,246,0.01)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

        {/* Chat Messages Feed Scroll Window */}
        <div className="flex-grow overflow-y-auto space-y-6 pr-2 mb-4 relative z-10 scroll-smooth">
          {messages.map((m, idx) => {
            const isAI = m.sender === 'assistant'
            return (
              <div 
                key={idx} 
                className={`flex gap-4 items-start ${isAI ? 'justify-start' : 'justify-end'}`}
              >
                {/* AI Profile Avatar */}
                {isAI && (
                  <div className="w-9 h-9 rounded-xl bg-accent-glow text-accent-primary flex items-center justify-center border border-accent-primary/15 shrink-0 shadow-sm shadow-accent-primary/5">
                    <Bot className="w-5 h-5 animate-pulse-slow" />
                  </div>
                )}

                {/* Message Bubble */}
                <div className={`space-y-4 max-w-2xl text-xs sm:text-sm leading-relaxed p-4 rounded-2xl border ${
                  isAI 
                    ? 'bg-bg-sidebar/50 border-border-subtle text-text-primary' 
                    : 'bg-accent-primary border-accent-primary text-white shadow-md shadow-accent-primary/10'
                }`}>
                  {/* Sender Label */}
                  <span className={`text-[9px] font-bold uppercase tracking-wider block ${
                    isAI ? 'text-accent-primary' : 'text-white/70'
                  }`}>
                    {isAI ? 'AboutIAM AI Architect' : 'Your Query'}
                  </span>

                  {/* Body Text */}
                  <p className="font-semibold whitespace-pre-line">{m.text}</p>

                  {/* Integrated Copyable Code Block if present */}
                  {m.code && (
                    <div className="space-y-2 mt-4 font-mono relative">
                      <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-text-secondary pb-1 border-b border-border-subtle/30">
                        <span className="flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5" /> {m.codeLang} Code</span>
                        <button 
                          onClick={() => copyToClipboard(m.code || '', idx)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-bg-sidebar border border-border-subtle text-text-secondary hover:text-text-primary transition-all focus:outline-none"
                        >
                          {isCopied === idx ? <Check className="w-3 h-3 text-status-success" /> : <Copy className="w-3 h-3" />}
                          {isCopied === idx ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <pre className="p-3.5 rounded-xl bg-bg-nested/80 border border-border-subtle text-[10px] text-text-primary overflow-x-auto leading-normal whitespace-pre">
                        {m.code}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {/* Typing Indicator Bubble */}
          {isTyping && (
            <div className="flex gap-4 items-start justify-start animate-pulse">
              <div className="w-9 h-9 rounded-xl bg-bg-sidebar border border-border-subtle flex items-center justify-center shrink-0">
                <Bot className="w-5 h-5 text-text-muted" />
              </div>
              <div className="p-4 rounded-2xl bg-bg-sidebar/30 border border-border-subtle/50 text-xs text-text-muted font-bold uppercase tracking-wider flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-bounce delay-100"></span>
                <span className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-bounce delay-200"></span>
                Architect is designing
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Bottom Control Section */}
        <div className="border-t border-border-subtle/50 pt-4 space-y-4 shrink-0 relative z-10">
          {/* Quick-Start Prompt Suggestions */}
          <div className="space-y-1.5">
            <span className="text-[9px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-accent-primary" /> Quick-Start Prompt Blueprints
            </span>
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                { label: 'AWS S3 Read-Only JSON', icon: ShieldCheck },
                { label: 'SAML vs OIDC Comparison', icon: HelpCircle },
                { label: 'OPA Role-Based Access Rego', icon: Terminal },
                { label: 'FIDO2 Passkeys Integration', icon: Key }
              ].map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(p.label)}
                  disabled={isTyping}
                  className="px-3 py-1.5 rounded-lg border border-border-subtle bg-bg-sidebar hover:bg-bg-nested text-text-secondary hover:text-text-primary text-[10px] font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-sm"
                >
                  <p.icon className="w-3.5 h-3.5 text-accent-primary/70 shrink-0" />
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main User Message input */}
          <div className="flex gap-3">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage(input)
                }
              }}
              disabled={isTyping}
              className="flex-grow p-3 rounded-xl bg-bg-sidebar border border-border-subtle text-xs sm:text-sm text-text-primary focus:outline-none focus:border-accent-primary font-medium" 
              placeholder="Ask AI Architect (e.g. 'How does SAML SSO prevent replay attacks?')..." 
            />
            <button 
              onClick={() => handleSendMessage(input)}
              disabled={isTyping || !input.trim()}
              className="p-3 rounded-xl bg-accent-primary hover:bg-accent-hover text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-accent-primary/15"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
