import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Wallet, EyeOff, CheckCircle2, ShieldCheck, ArrowRight, Lock } from 'lucide-react'

export default function ZKPWallet() {
  const [proofGenerated, setProofGenerated] = useState(false)
  const [verified, setVerified] = useState(false)

  const credential = {
    holder: "Alex Security",
    dob: "1994-08-15",
    issuedBy: "Government DMV Identity Authority",
    signature: "sig_rsa_2048_ab88c9..."
  }

  const generateProof = () => {
    setProofGenerated(true)
    setVerified(false)
  }

  const verifyProof = () => {
    setVerified(true)
  }

  const reset = () => {
    setProofGenerated(false)
    setVerified(false)
  }

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="space-y-3 max-w-3xl">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary uppercase tracking-wider bg-accent-glow px-2.5 py-1 rounded-full border border-accent-primary/10">
          <EyeOff className="w-3.5 h-3.5" /> Privacy & Cryptography
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
          Zero-Knowledge Proof (ZKP) Wallet
        </h2>
        <p className="text-text-secondary">
          Self-Sovereign Identity (SSI) allows users to prove facts about themselves without revealing underlying raw data. Generate a Zero-Knowledge Proof to prove you are "Over 21" without sharing your actual birthdate.
        </p>
        <Link to="/tools/did-key-generator" className="text-xs font-semibold text-accent-primary hover:text-accent-hover transition-colors inline-block">
          Generate a real did:key decentralized identifier →
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* User Wallet State */}
        <div className="lg:col-span-1 p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-6">
          <div className="space-y-1 border-b border-border-subtle pb-4">
            <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Wallet className="w-4 h-4 text-accent-primary" /> User's Digital Wallet
            </h4>
            <p className="text-[10px] text-text-muted">Contains raw Verifiable Credentials (VCs).</p>
          </div>

          <div className="p-4 rounded-xl bg-bg-sidebar border border-border-subtle space-y-3 font-mono text-[10px] text-text-primary relative overflow-hidden">
            <div className="absolute top-0 right-0 px-2 py-0.5 bg-status-warning text-white font-bold text-[8px] rounded-bl-lg">RAW DATA (SENSITIVE)</div>
            <p><span className="text-text-muted">Name:</span> {credential.holder}</p>
            <p><span className="text-accent-primary">DOB:</span> {credential.dob}</p>
            <p><span className="text-text-muted">Issuer:</span> {credential.issuedBy}</p>
            <p className="truncate"><span className="text-text-muted">Sig:</span> {credential.signature}</p>
          </div>

          <button
            onClick={generateProof}
            disabled={proofGenerated}
            className="w-full py-2.5 rounded-lg bg-accent-primary hover:bg-accent-hover text-white text-xs font-bold transition-all disabled:opacity-50 shadow-md shadow-accent-primary/20"
          >
            Generate ZKP ("Over 21")
          </button>
        </div>

        {/* The Network transmission */}
        <div className="lg:col-span-1 flex flex-col items-center justify-center space-y-4 py-8 lg:py-0">
          <div className={`p-4 rounded-xl border text-xs font-mono text-center transition-all duration-500 ${
            proofGenerated ? 'bg-accent-glow/20 border-accent-primary text-accent-primary translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            <span className="block font-bold mb-1">Transmitting Proof...</span>
            <span className="text-[9px] text-text-secondary">Data Payload:</span>
            <div className="mt-1 p-2 bg-bg-card border border-border-subtle rounded text-[8px] break-all leading-relaxed">
              proof_type: "zkSnark",<br/>
              predicate: "age &gt;= 21",<br/>
              result: true,<br/>
              zk_signature: "0x88f9a2..."
            </div>
          </div>
          {proofGenerated && !verified && (
            <button
              onClick={verifyProof}
              className="mt-4 px-4 py-1.5 rounded-full border border-border-subtle bg-bg-card hover:bg-bg-sidebar text-xs font-bold text-text-primary flex items-center gap-1.5 transition-colors shadow-sm"
            >
              Verify Payload <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Verifier State */}
        <div className="lg:col-span-1 p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-6">
          <div className="space-y-1 border-b border-border-subtle pb-4">
            <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-accent-secondary" /> Service Verifier
            </h4>
            <p className="text-[10px] text-text-muted">e.g., A digital bar or age-restricted website.</p>
          </div>

          <div className={`p-6 rounded-xl border flex flex-col items-center justify-center text-center space-y-3 transition-all min-h-[140px] ${
            verified 
              ? 'bg-status-success/5 border-status-success text-status-success shadow-inner' 
              : 'bg-bg-sidebar border-border-subtle text-text-muted'
          }`}>
            {verified ? (
              <>
                <CheckCircle2 className="w-10 h-10" />
                <div>
                  <h5 className="text-sm font-black">ACCESS GRANTED</h5>
                  <p className="text-[10px] text-text-secondary mt-1">Math proves user is {'>'}21.<br/>(Birthdate remains unknown!)</p>
                </div>
              </>
            ) : (
              <>
                <Lock className="w-8 h-8 opacity-50" />
                <p className="text-xs font-semibold">Waiting for cryptographic proof...</p>
              </>
            )}
          </div>

          {verified && (
            <button
              onClick={reset}
              className="w-full py-2 border border-border-subtle rounded-lg text-xs font-bold text-text-secondary hover:text-text-primary transition-colors"
            >
              Reset Sandbox
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
