import { useState } from 'react'
import { ShieldAlert, CheckCircle2, AlertTriangle, Upload, Eye } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import { useClipboardCopy } from '../../components/Tools/useClipboardCopy'
import { getToolBySlug } from '../../data/toolsRegistry'

interface ManifestAction {
  action: string
  software: string
}

interface ManifestData {
  issuer: string
  hardwareAttestation: string
  edited: boolean
  actions: ManifestAction[]
  certSubject: string
}

export default function C2paProvenance() {
  const tool = getToolBySlug('c2pa-provenance')!
  const { copy, copiedId } = useClipboardCopy()
  const [inputText, setInputText] = useState('')
  const [manifestData, setManifestData] = useState<ManifestData | null>(null)

  const handleSimulate = (scenario: 'camera' | 'photoshop' | 'manipulated') => {
    if (scenario === 'camera') {
      setInputText('Simulated Leica M11 C2PA Hardware-Signed Manifest')
      setManifestData({
        issuer: 'Leica Camera AG (Hardware Enclave)',
        hardwareAttestation: 'Secure enclave validated via TPM multicodec',
        edited: false,
        actions: [{ action: 'c2pa.created', software: 'Leica M11 Hardware v1.02' }],
        certSubject: 'C=DE, O=Leica Camera AG, CN=Leica Hardware Root CA'
      })
    } else if (scenario === 'photoshop') {
      setInputText('Simulated Photoshop-Signed Manifest (Chain-of-Custody Present)')
      setManifestData({
        issuer: 'Adobe Photoshop Content Authenticity Server',
        hardwareAttestation: 'Software-signed manifest representing digital edit history',
        edited: true,
        actions: [
          { action: 'c2pa.created', software: 'Sony ILCE-7M4 Hardware' },
          { action: 'c2pa.edited', software: 'Adobe Photoshop 2026' }
        ],
        certSubject: 'C=US, O=Adobe Inc., CN=Adobe Content Authenticity CA'
      })
    } else {
      setInputText('Simulated Untrusted/No Manifest (Metadata Stripped)')
      setManifestData({
        issuer: 'Unknown - Manifest missing or signature invalid',
        hardwareAttestation: 'Warning: Cryptographic seal broken or stripped',
        edited: true,
        actions: [],
        certSubject: 'N/A'
      })
    }
  }

  return (
    <ToolPageShell tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-bg-card border border-border-subtle p-6 rounded-2xl shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
              <Upload className="w-4 h-4 text-accent-primary" /> Simulate JUMBF Image Upload
            </h2>
            <p className="text-xs text-text-secondary">
              Upload an image containing standard JUMBF content provenance metadata or select a simulated scenario below:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => handleSimulate('camera')}
                className="p-3 text-xs font-bold rounded-xl border border-border-subtle bg-bg-sidebar hover:bg-bg-card transition flex flex-col items-center gap-2 text-center"
              >
                <CheckCircle2 className="w-5 h-5 text-accent-secondary" />
                Hardware-Signed
              </button>
              <button
                onClick={() => handleSimulate('photoshop')}
                className="p-3 text-xs font-bold rounded-xl border border-border-subtle bg-bg-sidebar hover:bg-bg-card transition flex flex-col items-center gap-2 text-center"
              >
                <AlertTriangle className="text-yellow-500 w-5 h-5" />
                Software-Edited
              </button>
              <button
                onClick={() => handleSimulate('manipulated')}
                className="p-3 text-xs font-bold rounded-xl border border-border-subtle bg-bg-sidebar hover:bg-bg-card transition flex flex-col items-center gap-2 text-center"
              >
                <ShieldAlert className="text-red-500 w-5 h-5" />
                Unsigned/Broken
              </button>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste raw manifest hex or JUMBF CBOR metadata..."
              className="w-full h-24 p-3 rounded-xl bg-bg-nested border border-border-subtle text-xs font-mono text-text-primary focus:outline-none focus:border-accent-primary"
            />
          </div>

          {manifestData && (
            <div className="bg-bg-card border border-border-subtle p-6 rounded-2xl shadow-sm space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-2">
                  <Eye className="w-4 h-4 text-accent-secondary" /> Decoded Manifest Details
                </h3>
                <button
                  onClick={() => copy(inputText, 'c2pa-manifest-copy')}
                  className="text-xs bg-bg-nested hover:bg-border-subtle border border-border-subtle px-3 py-1.5 rounded-lg text-text-secondary transition"
                >
                  {copiedId === 'c2pa-manifest-copy' ? 'Copied!' : 'Copy Raw Manifest'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-bg-nested p-3.5 rounded-xl border border-border-subtle space-y-1">
                  <span className="text-text-muted text-[10px] uppercase font-bold">Issuer / Authority</span>
                  <p className="font-bold text-text-primary">{manifestData.issuer}</p>
                </div>
                <div className="bg-bg-nested p-3.5 rounded-xl border border-border-subtle space-y-1">
                  <span className="text-text-muted text-[10px] uppercase font-bold">Hardware Attestation</span>
                  <p className="font-bold text-text-primary">{manifestData.hardwareAttestation}</p>
                </div>
                <div className="bg-bg-nested p-3.5 rounded-xl border border-border-subtle space-y-1 col-span-1 sm:col-span-2">
                  <span className="text-text-muted text-[10px] uppercase font-bold">Hardware Signing Certificate Subject DN</span>
                  <p className="font-bold text-text-primary font-mono">{manifestData.certSubject}</p>
                </div>
              </div>

              {manifestData.actions.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-text-primary uppercase tracking-wide">Historical Edit Timeline</h4>
                  <div className="space-y-2">
                    {manifestData.actions.map((act, idx: number) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-bg-nested border border-border-subtle rounded-xl text-xs">
                        <span className="bg-bg-card px-2.5 py-1 rounded-md text-[10px] font-black font-mono text-accent-secondary">
                          {act.action}
                        </span>
                        <span className="text-text-primary">{act.software}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <BeginnerExpertExplainer tool={tool} />
        </div>
      </div>
    </ToolPageShell>
  )
}
