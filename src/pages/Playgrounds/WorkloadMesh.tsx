import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Network, Server, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react'

export default function WorkloadMesh() {
  const [step, setStep] = useState(0)

  const steps = [
    {
      title: "1. Node Attestation (Platform Proof)",
      node: "Service A (Payment API)",
      action: "Calls local SPIRE Agent",
      payload: "Node Kernel ID: k8s-pod-1a2b\nNamespace: payments-prod\nSignature: platform_kernel_sig...",
      result: "The platform verifies Service A is exactly what it claims to be based on the kernel/OS footprint."
    },
    {
      title: "2. Issuing the SVID Certificate",
      node: "SPIRE Server",
      action: "Issues Cryptographic Identity",
      payload: "Subject: spiffe://aboutiam.com/ns/payments/sa/payment-api\nValid For: 1 hour\nFormat: X.509 Certificate",
      result: "Service A receives a short-lived cryptographic identity document (SVID). No static API keys were exchanged!"
    },
    {
      title: "3. mTLS Backend Call",
      node: "Service A -> Service B",
      action: "Requests Data with SVID",
      payload: "GET /internal/db/records HTTP/1.1\nTLS Client Cert: [SVID_Certificate_Blob]",
      result: "Service A calls Service B. Service B verifies the SVID instantly against the SPIFFE trust bundle."
    },
    {
      title: "4. Authorization & Completion",
      node: "Service B (Database Broker)",
      action: "Validates and Responds",
      payload: "Check SPIFFE ID == 'spiffe://aboutiam.com/ns/payments/...'\nHTTP/1.1 200 OK\n{ \"data\": \"secure_records\" }",
      result: "Zero Trust achieved. Microservices authenticate dynamically. If a hacker steals the SVID, it self-destructs in 1 hour."
    }
  ]

  const nextStep = () => {
    if (step < steps.length - 1) setStep(step + 1)
  }

  const reset = () => setStep(0)

  const active = steps[step]

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-secondary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-secondary/10">
          <Network className="w-3.5 h-3.5 text-accent-secondary" /> DevSecOps Identity
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          NHI Workload Mesh (SPIFFE/SPIRE)
        </h2>
        <p className="text-text-secondary">
          Non-Human Identities (NHI) heavily outnumber users. See how microservices leverage the SPIFFE standard to dynamically attest their platform state and exchange short-lived certificates without relying on static, stealable API keys.
        </p>
        <Link to="/tools/x509-certificate-decoder" className="text-xs font-semibold text-accent-primary hover:text-accent-hover transition-colors inline-block">
          Decode a real X.509 SVID certificate (with spiffe:// SAN detection) →
        </Link>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Network Diagram View */}
        <div className="p-8 rounded-2xl bg-bg-card border border-border-subtle shadow-sm flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(rgba(13,148,136,0.02)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

          {/* Visual Mesh */}
          <div className="relative w-full max-w-sm h-64 z-10">
            {/* SVG lines */}
            <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
              {/* SPIRE to A */}
              <path d="M 192,40 L 64,180" fill="none" className={`stroke-border-subtle stroke-[2px] transition-all duration-500 ${step === 1 ? 'stroke-accent-secondary animate-pulse stroke-[4px]' : ''}`} />
              {/* A to B */}
              <path d="M 64,220 L 320,220" fill="none" className={`stroke-border-subtle stroke-[2px] transition-all duration-500 ${step === 2 || step === 3 ? 'stroke-accent-primary stroke-dasharray-[5,5] animate-dash stroke-[4px]' : ''}`} />
            </svg>

            {/* SPIRE Server */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center border transition-all ${step === 1 ? 'bg-accent-secondary text-white border-accent-secondary shadow-lg shadow-accent-secondary/30 scale-110' : 'bg-bg-sidebar border-border-subtle text-text-muted'}`}>
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-text-primary uppercase tracking-wider">SPIRE Server</span>
            </div>

            {/* Service A */}
            <div className="absolute bottom-0 left-0 flex flex-col items-center gap-2">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all ${step === 0 || step === 2 ? 'bg-accent-primary text-white border-accent-primary shadow-lg shadow-accent-primary/30 scale-110' : 'bg-bg-sidebar border-border-subtle text-text-muted'}`}>
                <Server className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-text-primary uppercase tracking-wider">Service A</span>
            </div>

            {/* Service B */}
            <div className="absolute bottom-0 right-0 flex flex-col items-center gap-2">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center border transition-all ${step === 3 ? 'bg-status-success text-white border-status-success shadow-lg shadow-status-success/30 scale-110' : 'bg-bg-sidebar border-border-subtle text-text-muted'}`}>
                <Server className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-text-primary uppercase tracking-wider">Service B</span>
            </div>
          </div>
        </div>

        {/* Stepper Details */}
        <div className="flex flex-col space-y-6">
          <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm flex-grow flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-border-subtle pb-4">
                <h4 className="font-black text-lg text-text-primary flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent-secondary" /> {active.title}
                </h4>
                <span className="text-[10px] font-bold text-text-muted uppercase">Step {step + 1} of 4</span>
              </div>
              
              <div className="space-y-4 text-xs font-mono">
                <div className="p-4 bg-bg-sidebar rounded-xl border border-border-subtle space-y-1.5">
                  <span className="text-[9px] text-accent-secondary font-bold uppercase block">Active Node</span>
                  <p className="text-text-primary font-bold">{active.node}</p>
                </div>
                <div className="p-4 bg-bg-sidebar rounded-xl border border-border-subtle space-y-1.5">
                  <span className="text-[9px] text-text-muted font-bold uppercase block">Payload / Action</span>
                  <pre className="text-text-primary font-medium whitespace-pre-wrap">{active.payload}</pre>
                </div>
              </div>
              
              <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                {active.result}
              </p>
            </div>

            <div className="pt-6 border-t border-border-subtle mt-6 flex gap-3">
              {step < steps.length - 1 ? (
                <button
                  onClick={nextStep}
                  className="flex-grow py-3 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-all shadow-md shadow-accent-primary/20 flex items-center justify-center gap-2"
                >
                  Execute Next Step <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={reset}
                  className="flex-grow py-3 rounded-xl border border-border-subtle bg-bg-sidebar hover:bg-bg-nested text-text-primary text-xs font-bold transition-all"
                >
                  Restart Mesh Sequence
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
