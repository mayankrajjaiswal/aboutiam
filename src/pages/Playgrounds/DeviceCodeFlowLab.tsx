import { useState, useEffect } from 'react'
import { Monitor, Smartphone, CheckCircle2, AlertTriangle, Timer, Link as LinkIcon, RefreshCw, Key } from 'lucide-react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'

export default function DeviceCodeFlowLab() {
  const { score, currentStep, isCompleted, logs, hintsRevealed, log, revealHint, completeStep, resetPlayground } = usePlayground({
    moduleId: 'device-code-flow',
    initialScore: 100,
    maxHints: 3
  })

  // Device Code Flow State
  const [deviceCode, setDeviceCode] = useState<string | null>(null)
  const [userCode, setUserCode] = useState<string | null>(null)
  const [verificationUri, setVerificationUri] = useState<string | null>(null)
  const [expiresIn, setExpiresIn] = useState<number>(0)
  const [isPolling, setIsPolling] = useState(false)
  const [pollCount, setPollCount] = useState(0)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [mobileInputCode, setMobileInputCode] = useState('')
  const [mobileStatus, setMobileStatus] = useState<'idle' | 'authorizing' | 'success' | 'error'>('idle')
  const [isAuthorized, setIsAuthorized] = useState(false)

  // Simulation parameters
  const POLLING_INTERVAL = 3000 // 3 seconds
  const CODE_EXPIRY = 60 // 60 seconds

  const startFlow = () => {
    log('info', '[Smart TV] POST /device_authorization requested.')
    const dCode = 'device_' + Math.random().toString(36).substring(2, 10)
    const uCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    const vUri = 'https://aboutiam.com/activate'
    
    setDeviceCode(dCode)
    setUserCode(uCode)
    setVerificationUri(vUri)
    setExpiresIn(CODE_EXPIRY)
    setAccessToken(null)
    setIsAuthorized(false)
    setMobileStatus('idle')
    setMobileInputCode('')
    setPollCount(0)

    log('success', `[IdP] 200 OK. Device Code: ${dCode}, User Code: ${uCode}`)
    setIsPolling(true)
    if (currentStep === 0) completeStep(0)
  }

  // Timer countdown
  useEffect(() => {
    if (expiresIn > 0 && isPolling && !accessToken) {
      const timer = setTimeout(() => setExpiresIn(prev => prev - 1), 1000)
      return () => clearTimeout(timer)
    } else if (expiresIn === 0 && isPolling && !accessToken) {
      setTimeout(() => {
        setIsPolling(false)
        log('error', '[Smart TV] Device code expired. User took too long to authorize.')
      }, 0)
    }
  }, [expiresIn, isPolling, accessToken, log])

  // Polling simulator
  useEffect(() => {
    if (isPolling && !accessToken && expiresIn > 0) {
      const pollTimer = setTimeout(() => {
        setPollCount(prev => prev + 1)
        if (isAuthorized) {
          log('success', '[Smart TV] POST /token - 200 OK. Received Access Token!')
          setAccessToken('eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ0di11c2VyIn0.sig')
          setIsPolling(false)
          if (currentStep === 2) completeStep(2)
        } else {
          log('warning', `[Smart TV] POST /token - 400 Bad Request (authorization_pending) [Poll #${pollCount + 1}]`)
        }
      }, POLLING_INTERVAL)
      return () => clearTimeout(pollTimer)
    }
  }, [isPolling, isAuthorized, accessToken, expiresIn, pollCount, currentStep, completeStep, log])

  const handleMobileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!mobileInputCode) return
    
    setMobileStatus('authorizing')
    log('info', `[Smartphone] User submitted code: ${mobileInputCode}`)
    
    setTimeout(() => {
      if (mobileInputCode === userCode && expiresIn > 0) {
        log('success', '[IdP] User authenticated and consented to device.')
        setMobileStatus('success')
        setIsAuthorized(true)
        if (currentStep === 1) completeStep(1)
      } else {
        log('error', '[IdP] Invalid or expired user code.')
        setMobileStatus('error')
        setTimeout(() => setMobileStatus('idle'), 2000)
      }
    }, 1500)
  }

  const handleReset = () => {
    resetPlayground()
    setDeviceCode(null)
    setUserCode(null)
    setVerificationUri(null)
    setExpiresIn(0)
    setIsPolling(false)
    setPollCount(0)
    setAccessToken(null)
    setMobileInputCode('')
    setMobileStatus('idle')
    setIsAuthorized(false)
  }

  return (
    <PlaygroundShell
      title="IoT Device Code Flow (RFC 8628)"
      description="Simulate OAuth 2.0 on input-constrained devices (like Smart TVs). Watch asynchronous polling between the device and IdP while the user authenticates out-of-band on a smartphone."
      score={score}
      hintsRevealed={hintsRevealed}
      currentStep={currentStep}
      totalSteps={3}
      isCompleted={isCompleted}
      onRevealHint={() => {
        if (currentStep === 0) revealHint('Start the flow on the Smart TV to generate the device and user codes.')
        else if (currentStep === 1) revealHint('Type the exact User Code displayed on the TV into the smartphone browser.')
        else revealHint('Wait for the TV to poll the IdP and receive the access token.')
      }}
      onReset={handleReset}
      sidebarContent={<TraceTerminal logs={logs} />}
    >
      <div className="grid md:grid-cols-2 gap-8 relative">
        
        {/* Device 1: Smart TV (Client) */}
        <div className="p-6 rounded-2xl bg-[#0b0f19] border-2 border-slate-800 shadow-xl flex flex-col items-center justify-center min-h-[400px] text-center relative overflow-hidden group hover-cyber-glow">
          <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <Monitor className="w-3.5 h-3.5" /> Smart TV App (Client)
          </div>

          {!deviceCode ? (
            <div className="space-y-6 flex flex-col items-center">
              <Monitor className="w-16 h-16 text-slate-600" />
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-text-primary">Welcome to StreamApp</h3>
                <p className="text-xs text-slate-400 max-w-xs">To continue, please sign in. Since you don't have a keyboard, we will use a secondary device.</p>
              </div>
              <button
                onClick={startFlow}
                className="px-6 py-2.5 rounded-lg bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-all shadow-lg hover-cyber-glow"
              >
                Sign In
              </button>
            </div>
          ) : !accessToken ? (
            <div className="space-y-6 flex flex-col items-center w-full px-4">
              <div className="space-y-1">
                <h3 className="text-xl font-black text-text-primary">Activation Required</h3>
                <p className="text-xs text-slate-400">Visit the URL below on your smartphone and enter the code.</p>
              </div>
              
              <div className="w-full p-4 rounded-xl bg-slate-900 border border-slate-700 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase">
                  <span>URL</span>
                  <span className="flex items-center gap-1"><LinkIcon className="w-3.5 h-3.5" /> {verificationUri}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase mt-2">
                  <span>Code</span>
                  <span className="text-2xl text-accent-primary tracking-widest bg-slate-950 px-3 py-1 rounded border border-accent-primary/30 font-mono select-all">
                    {userCode}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-bold text-slate-400 w-full justify-center">
                <span className="flex items-center gap-1.5"><Timer className="w-4 h-4 text-status-warning" /> Expires in {expiresIn}s</span>
                {isPolling && <span className="flex items-center gap-1.5 text-accent-secondary"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Polling IdP... ({pollCount})</span>}
              </div>
            </div>
          ) : (
            <div className="space-y-6 flex flex-col items-center w-full px-4 animate-in fade-in zoom-in">
              <CheckCircle2 className="w-16 h-16 text-status-success animate-bounce" />
              <div className="space-y-2">
                <h3 className="text-xl font-black text-status-success">Successfully Signed In!</h3>
                <p className="text-xs text-slate-400">The TV successfully polled the access token.</p>
              </div>
              <div className="w-full text-left p-3 bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
                <span className="text-[10px] text-slate-500 font-bold uppercase block mb-1">Access Token (Fragment)</span>
                <span className="text-xs font-mono text-emerald-400 break-all">{accessToken}</span>
              </div>
            </div>
          )}
        </div>

        {/* Device 2: Smartphone (Authorization) */}
        <div className="p-6 rounded-[3rem] bg-bg-card border-8 border-border-subtle shadow-2xl flex flex-col items-center min-h-[400px] relative overflow-hidden group hover-cyber-glow">
          <div className="absolute top-2 w-16 h-1.5 bg-border-subtle rounded-full"></div>
          
          <div className="absolute top-8 left-0 right-0 px-6 flex justify-between items-center text-[10px] font-bold text-text-muted">
            <span>9:41</span>
            <span className="flex items-center gap-1"><Smartphone className="w-3.5 h-3.5" /> 5G</span>
          </div>

          <div className="w-full h-full flex flex-col pt-12 pb-6 px-2">
            <div className="flex-1 bg-bg-sidebar rounded-xl border border-border-subtle p-4 flex flex-col shadow-inner overflow-y-auto custom-scrollbar">
              
              <div className="text-center space-y-4 mb-6">
                <div className="w-12 h-12 bg-accent-glow rounded-full mx-auto flex items-center justify-center text-accent-primary border border-accent-primary/20">
                  <Key className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-text-primary">Connect Device</h4>
                  <p className="text-[10px] text-text-secondary mt-1">Enter the code displayed on your TV screen to grant access.</p>
                </div>
              </div>

              {mobileStatus === 'success' ? (
                <div className="flex flex-col items-center justify-center text-center space-y-3 mt-4 animate-in fade-in">
                  <CheckCircle2 className="w-12 h-12 text-status-success" />
                  <p className="text-xs font-bold text-text-primary">Device Connected!</p>
                  <p className="text-[10px] text-text-muted">You can close this window. Your TV will log in automatically.</p>
                </div>
              ) : (
                <form onSubmit={handleMobileSubmit} className="space-y-4">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="ENTER CODE"
                    value={mobileInputCode}
                    onChange={(e) => setMobileInputCode(e.target.value.toUpperCase())}
                    disabled={mobileStatus === 'authorizing' || !deviceCode}
                    className="w-full text-center text-xl tracking-widest font-mono p-3 rounded-lg border border-border-subtle bg-bg-card text-text-primary focus:outline-none focus:border-accent-primary disabled:opacity-50 uppercase placeholder:text-text-muted/50 placeholder:tracking-normal placeholder:text-sm"
                  />
                  
                  {mobileStatus === 'error' && (
                    <div className="flex items-center gap-1.5 text-[10px] text-status-danger font-bold bg-status-danger/10 p-2 rounded">
                      <AlertTriangle className="w-3.5 h-3.5" /> Invalid or expired code.
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={mobileStatus === 'authorizing' || !mobileInputCode || !deviceCode}
                    className="w-full py-2.5 rounded-lg bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow flex justify-center"
                  >
                    {mobileStatus === 'authorizing' ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Authorize Device'}
                  </button>
                </form>
              )}
            </div>
          </div>
          <div className="absolute bottom-2 w-32 h-1 bg-border-subtle rounded-full"></div>
        </div>

      </div>
    </PlaygroundShell>
  )
}
