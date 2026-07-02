import { useEffect, useState } from 'react'
import { AlertOctagon, Check, CheckCircle2, Copy, RefreshCw } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import { useClipboardCopy } from '../../components/Tools/useClipboardCopy'
import { getToolBySlug } from '../../data/toolsRegistry'
import {
  buildOtpAuthUri,
  generateRandomBase32Secret,
  generateTotp,
  secondsRemainingInStep,
  verifyTotp,
} from '../../lib/tools/totp'

const tool = getToolBySlug('totp-generator')!
const PERIOD = 30

export default function TotpGenerator() {
  const [secret, setSecret] = useState(generateRandomBase32Secret())
  const [code, setCode] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(secondsRemainingInStep(PERIOD))
  const [verifyCode, setVerifyCode] = useState('')
  const [verifyResult, setVerifyResult] = useState<'idle' | 'valid' | 'invalid'>('idle')
  const { copy, copiedId } = useClipboardCopy()

  useEffect(() => {
    let cancelled = false
    const tick = async () => {
      if (!cancelled) {
        setCode(await generateTotp(secret))
        setSecondsLeft(secondsRemainingInStep(PERIOD))
      }
    }
    tick()
    const interval = setInterval(tick, 1000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [secret])

  const handleVerify = async () => {
    setVerifyResult(await verifyTotp(secret, verifyCode) ? 'valid' : 'invalid')
  }

  const otpAuthUri = buildOtpAuthUri(secret, 'demo@aboutiam.com', 'AboutIAM')

  return (
    <ToolPageShell tool={tool}>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle space-y-4 shadow-sm text-center">
          <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Current Code</span>
          <div className="flex items-center justify-center gap-4">
            <CountdownRing secondsLeft={secondsLeft} period={PERIOD} />
            <p className="text-4xl font-black font-mono text-accent-primary tracking-widest">{code}</p>
          </div>
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => copy(code, 'code')}
              aria-label="Copy current code"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-sidebar hover:bg-bg-nested text-xs font-bold text-text-secondary border border-border-subtle"
            >
              {copiedId === 'code' ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />} Copy Code
            </button>
            <button
              type="button"
              onClick={() => setSecret(generateRandomBase32Secret())}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-primary text-white text-xs font-bold"
            >
              <RefreshCw className="w-3.5 h-3.5" /> New Secret
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-2 shadow-sm">
            <label htmlFor="totp-secret" className="block text-xs font-bold text-text-secondary uppercase tracking-wider">Base32 Secret</label>
            <input
              id="totp-secret"
              type="text"
              value={secret}
              onChange={(e) => setSecret(e.target.value.toUpperCase())}
              className="w-full p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary font-mono text-xs focus:outline-none focus:border-accent-primary"
            />
          </div>

          <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-2 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">otpauth:// URI</span>
              <button type="button" onClick={() => copy(otpAuthUri, 'uri')} aria-label="Copy otpauth URI" className="text-text-muted hover:text-text-primary">
                {copiedId === 'uri' ? <Check className="w-3.5 h-3.5 text-status-success" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[10px] font-mono text-text-primary break-all bg-bg-sidebar p-3 rounded border border-border-subtle/50 max-h-20 overflow-y-auto">{otpAuthUri}</p>
          </div>

          <div className="p-5 rounded-xl bg-bg-card border border-border-subtle space-y-2 shadow-sm">
            <label htmlFor="totp-verify" className="block text-xs font-bold text-text-secondary uppercase tracking-wider">Verify a 6-digit Code</label>
            <div className="flex gap-2">
              <input
                id="totp-verify"
                type="text"
                value={verifyCode}
                onChange={(e) => { setVerifyCode(e.target.value); setVerifyResult('idle') }}
                placeholder="123456"
                className="flex-1 p-2.5 rounded-lg bg-bg-sidebar border border-border-subtle text-text-primary font-mono text-sm focus:outline-none focus:border-accent-primary"
              />
              <button type="button" onClick={handleVerify} className="px-4 py-2 rounded-lg bg-accent-primary text-white text-xs font-bold shrink-0">Verify</button>
            </div>
            {verifyResult === 'valid' && <p className="text-[11px] text-status-success font-bold flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Valid — within the accepted time window.</p>}
            {verifyResult === 'invalid' && <p className="text-[11px] text-status-danger font-bold flex items-center gap-1.5"><AlertOctagon className="w-3.5 h-3.5" /> Invalid for the current ±1 step window.</p>}
          </div>
        </div>
      </div>

      <BeginnerExpertExplainer tool={tool} />
    </ToolPageShell>
  )
}

function CountdownRing({ secondsLeft, period }: { secondsLeft: number; period: number }) {
  const radius = 20
  const circumference = 2 * Math.PI * radius
  return (
    <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
      <svg className="absolute inset-0 w-full h-full transform -rotate-90">
        <circle cx="24" cy="24" r={radius} fill="none" className="stroke-border-subtle" strokeWidth="4" />
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          className="stroke-accent-primary transition-all duration-1000"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - secondsLeft / period)}
          strokeLinecap="round"
        />
      </svg>
      <span className="relative z-10 text-[10px] font-black text-text-primary">{secondsLeft}s</span>
    </div>
  )
}
