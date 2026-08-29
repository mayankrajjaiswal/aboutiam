import { useEffect, useRef, useState } from 'react'
import { KNOWLEDGE_GRAPH } from '../../data/aiKnowledgeGraph'
import type { ResourceLink } from '../../data/aiKnowledgeGraph'
import type { WebllmConnector, WebllmProgress } from './webllmConnector'

export interface ChatMessage {
  sender: 'user' | 'assistant'
  text: string
  code?: string
  codeLang?: string
  resources?: ResourceLink[]
  source?: 'local-ai'
}

// Phase 2 C4 spike: opt-in, never-auto-loaded local LLM (see GEMINI.md §Z-spike
// and docs/webllm-spike-findings.md). `webllmConnector` is dynamically
// imported only after the user explicitly clicks "Download & Enable," so
// `@mlc-ai/web-llm` never lands in this hook's eagerly-loaded chunk.
export type LocalAiStatus = 'off' | 'loading' | 'ready' | 'error'

const WELCOME_MESSAGE: ChatMessage = {
  sender: 'assistant',
  text: "Hello! I am your **AI Knowledge Assistant 2.0**. I am fully integrated into the AboutIAM platform. You can ask me to explain identity protocols, and I will automatically fetch the relevant tools, playgrounds, and architectures for you. What would you like to learn about today?",
  resources: [
    { title: 'OAuth Visualizer', path: '/playground/oauth', type: 'playground', desc: 'Explore OAuth 2.0 visually' },
    { title: 'Passkey Internals', path: '/playground/passkey-internals', type: 'playground', desc: 'Learn how WebAuthn works' },
  ],
}

// Generate dynamic resources based on text — normalizes both the input and
// multi-word keys (e.g. "zero_trust") to spaces so a natural-language query
// like "explain zero trust" still matches.
function extractResources(text: string): ResourceLink[] {
  const textLower = text.toLowerCase()
  let foundResources: ResourceLink[] = []

  Object.keys(KNOWLEDGE_GRAPH).forEach((key) => {
    const normalizedKey = key.replace(/_/g, ' ')
    if (textLower.includes(key) || textLower.includes(normalizedKey)) {
      foundResources = [...foundResources, ...KNOWLEDGE_GRAPH[key]]
    }
  })

  const unique = foundResources.filter((v, i, a) => a.findIndex((t) => t.title === v.title) === i)
  return unique.slice(0, 4) // Max 4 recommendations
}

function getSimulatedResponse(query: string): ChatMessage {
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
      resources,
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
      resources,
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
      resources,
    }
  }

  if (q.includes('oauth') || q.includes('oidc')) {
    return {
      sender: 'assistant',
      text: `**OAuth 2.0** is an authorization framework allowing third-party applications to obtain limited access to an HTTP service. **OpenID Connect (OIDC)** adds an identity layer on top of OAuth 2.0 to authenticate users.\n\nI have attached some interactive playgrounds and tools below for you to explore these flows!`,
      resources,
    }
  }

  return {
    sender: 'assistant',
    text: `I have analyzed your query regarding **"${query}"**. Based on our identity framework, I recommend reviewing the contextual resources attached below to dive deeper into this topic.`,
    resources,
  }
}

/**
 * All Knowledge Chat state and behavior, extracted out of Assistant.tsx so it
 * can be mounted both as the full-page Knowledge Chat tab and inside the
 * site-wide FloatingAssistantLauncher without the two ever drifting into
 * different behavior (see KnowledgeChatPanel.tsx for the shared UI).
 */
export function useKnowledgeChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isCopied, setIsCopied] = useState<number | null>(null)
  const chatEndRef = useRef<HTMLDivElement | null>(null)

  const [localAiStatus, setLocalAiStatus] = useState<LocalAiStatus>('off')
  const [localAiProgress, setLocalAiProgress] = useState<WebllmProgress | null>(null)
  const [localAiError, setLocalAiError] = useState<string | null>(null)
  const connectorRef = useRef<WebllmConnector | null>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  useEffect(() => {
    return () => connectorRef.current?.dispose()
  }, [])

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text)
    setIsCopied(idx)
    setTimeout(() => setIsCopied(null), 1500)
  }

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return

    const userMsg: ChatMessage = { sender: 'user', text: textToSend }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    if (localAiStatus === 'ready' && connectorRef.current) {
      const connector = connectorRef.current
      let streamed = ''
      
      // Local RAG contextual augmentation (Phase 10 upgrade!)
      const matchedResources = extractResources(textToSend)
      let augmentedPrompt = textToSend
      if (matchedResources.length > 0) {
        augmentedPrompt = `Context: User is asking about: [${matchedResources.map(r => r.title).join(', ')}]. Related tools: [${matchedResources.map(r => r.path).join(', ')}]. Use this background context to formulate a highly accurate security expert answer: ${textToSend}`
      }

      setMessages((prev) => [...prev, { sender: 'assistant', text: '', source: 'local-ai' }])
      connector
        .generate(augmentedPrompt, (token) => {
          streamed += token
          setMessages((prev) => {
            const next = [...prev]
            next[next.length - 1] = { sender: 'assistant', text: streamed, source: 'local-ai' }
            return next
          })
        })
        .catch((err) => {
          const message = err instanceof Error ? err.message : 'Local generation failed.'
          setMessages((prev) => {
            const next = [...prev]
            next[next.length - 1] = { sender: 'assistant', text: `⚠️ ${message}`, source: 'local-ai' }
            return next
          })
        })
        .finally(() => setIsTyping(false))
      return
    }

    setTimeout(() => {
      const response = getSimulatedResponse(textToSend)
      setMessages((prev) => [...prev, response])
      setIsTyping(false)
    }, 1200)
  }

  const handleEnableLocalAi = async (modelId?: string) => {
    setLocalAiStatus('loading')
    setLocalAiError(null)
    setLocalAiProgress(null)
    try {
      const { createWebllmConnector, detectWebGpuSupport } = await import('./webllmConnector')
      if (!detectWebGpuSupport()) {
        setLocalAiError('WebGPU is not available in this browser. The WASM-only fallback path is not yet implemented in this spike.')
        setLocalAiStatus('error')
        return
      }
      const connector = createWebllmConnector(modelId)
      connectorRef.current = connector
      await connector.load((progress) => setLocalAiProgress(progress))
      setLocalAiStatus('ready')
    } catch (err) {
      setLocalAiError(err instanceof Error ? err.message : 'Failed to load the local model.')
      setLocalAiStatus('error')
    }
  }

  const handleDisableLocalAi = () => {
    connectorRef.current?.dispose()
    connectorRef.current = null
    setLocalAiStatus('off')
    setLocalAiProgress(null)
    setLocalAiError(null)
  }

  return {
    messages,
    input,
    setInput,
    isTyping,
    isCopied,
    chatEndRef,
    localAiStatus,
    localAiProgress,
    localAiError,
    copyToClipboard,
    handleSendMessage,
    handleEnableLocalAi,
    handleDisableLocalAi,
  }
}
