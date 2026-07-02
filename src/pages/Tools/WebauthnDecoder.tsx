import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { CheckCircle2, Circle, FileWarning } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import { getToolBySlug } from '../../data/toolsRegistry'
import { base64UrlDecodeBytes } from '../../lib/tools/base64'
import {
  FLAG_LABELS, decodeClientDataJson, parseAttestationObject, parseAuthenticatorData,
} from '../../lib/tools/webauthn'
import type { AuthenticatorData } from '../../lib/tools/webauthn'

const tool = getToolBySlug('webauthn-decoder')!

// A locally-generated demo WebAuthn "create" ceremony (fake RP, fresh EC
// P-256 keypair, fmt "none") — not captured from any real device.
const SAMPLE_CLIENT_DATA_JSON =
  'eyJ0eXBlIjoid2ViYXV0aG4uY3JlYXRlIiwiY2hhbGxlbmdlIjoicUdWaHBPbkROWkpBT19DMi1OM0tLLURIRWVQMENza18xRHdiVHRubW5iUSIsIm9yaWdpbiI6Imh0dHBzOi8vYWJvdXRpYW0ubG9jYWwiLCJjcm9zc09yaWdpbiI6ZmFsc2V9'

const SAMPLE_ATTESTATION_OBJECT =
  'o2NmbXRkbm9uZWdhdHRTdG10oGhhdXRoRGF0YViUiw7F4GXLBJRgVpOIaVqqhWgeKnGP7zLAwgKKn3bUgDNFAAAAAQAAAAAAAAAAAAAAAAAAAAAAEGI93k5dozEDGPNOScN_rJylAQIDJiABIVggvQIiT8Dp7AurlFO_Mn0Pw0tLVyvTC5MOVWGLJVg8zoQiWCDB_ExSMvzy7kC6A8kfpaoCMsWOKZaNIxjJMHLwEpPg3Q'

type Attempt<T> = { ok: true; value: T } | { ok: false; error: string } | null

function tryParse<T>(input: string, parse: (s: string) => T): Attempt<T> {
  if (!input.trim()) return null
  try {
    return { ok: true, value: parse(input.trim()) }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Could not decode this value.' }
  }
}

export default function WebauthnDecoder() {
  const [clientDataInput, setClientDataInput] = useState(SAMPLE_CLIENT_DATA_JSON)
  const [authDataInput, setAuthDataInput] = useState('')
  const [attObjInput, setAttObjInput] = useState(SAMPLE_ATTESTATION_OBJECT)

  const clientData = useMemo(() => tryParse(clientDataInput, decodeClientDataJson), [clientDataInput])
  const authenticatorData = useMemo(
    () => tryParse(authDataInput, (s) => parseAuthenticatorData(base64UrlDecodeBytes(s))),
    [authDataInput]
  )
  const attestationObject = useMemo(() => tryParse(attObjInput, parseAttestationObject), [attObjInput])

  return (
    <ToolPageShell tool={tool}>
      <div className="grid lg:grid-cols-3 gap-4 min-w-0">
        <InputCard label="clientDataJSON (base64url)" value={clientDataInput} onChange={setClientDataInput} />
        <InputCard label="authenticatorData (base64url, standalone)" value={authDataInput} onChange={setAuthDataInput} placeholder="Paste a standalone authenticatorData value from an assertion…" />
        <InputCard label="attestationObject (base64url)" value={attObjInput} onChange={setAttObjInput} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 min-w-0">
        <ResultPane title="Client Data">
          {clientData?.ok === false && <ErrorMessage message={clientData.error} />}
          {clientData?.ok && (
            <div className="space-y-2 text-xs">
              <FieldRow label="type" value={clientData.value.type} />
              <FieldRow label="origin" value={clientData.value.origin} />
              <FieldRow label="challenge" value={clientData.value.challenge} />
              <FieldRow label="crossOrigin" value={String(clientData.value.crossOrigin ?? '—')} />
            </div>
          )}
        </ResultPane>

        <ResultPane title="Authenticator Data">
          {authenticatorData?.ok === false && <ErrorMessage message={authenticatorData.error} />}
          {authenticatorData?.ok && <AuthDataView data={authenticatorData.value} />}
          {!authenticatorData && <p className="text-xs text-text-muted">Paste a standalone authenticatorData value above, or one will be shown decoded from the attestationObject below.</p>}
        </ResultPane>

        <ResultPane title="Attestation Object">
          {attestationObject?.ok === false && <ErrorMessage message={attestationObject.error} />}
          {attestationObject?.ok && (
            <div className="space-y-3">
              <FieldRow label="fmt" value={attestationObject.value.fmt} />
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">attStmt</span>
                <pre className="text-[11px] font-mono text-text-primary break-all bg-bg-sidebar p-2.5 rounded border border-border-subtle/50 max-h-32 overflow-auto">
                  {JSON.stringify(attestationObject.value.attStmt, null, 2)}
                </pre>
              </div>
              <div className="pt-2 border-t border-border-subtle/50 space-y-2">
                <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">authData (nested)</span>
                <AuthDataView data={attestationObject.value.authData} />
              </div>
            </div>
          )}
        </ResultPane>
      </div>

      <BeginnerExpertExplainer tool={tool} />
    </ToolPageShell>
  )
}

function InputCard({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="p-4 rounded-xl bg-bg-card border border-border-subtle space-y-2 shadow-sm min-w-0">
      <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        placeholder={placeholder}
        className="w-full h-32 p-3 rounded-lg bg-bg-sidebar text-[10px] text-text-primary font-mono focus:outline-none focus:border-accent-primary border border-border-subtle resize-none break-all"
        spellCheck={false}
      />
    </div>
  )
}

function ResultPane({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="p-4 rounded-xl bg-bg-card border border-border-subtle shadow-sm space-y-3 min-w-0">
      <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">{title}</span>
      {children}
    </div>
  )
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <p className="text-xs text-status-danger font-semibold flex items-start gap-2">
      <FileWarning className="w-4 h-4 shrink-0 mt-0.5" /> {message}
    </p>
  )
}

function FieldRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null
  return (
    <div className="space-y-0.5">
      <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{label}</span>
      <p className="text-xs font-mono text-text-primary break-all">{value}</p>
    </div>
  )
}

function AuthDataView({ data }: { data: AuthenticatorData }) {
  return (
    <div className="space-y-3 text-xs">
      <div className="space-y-1.5">
        {(Object.keys(FLAG_LABELS) as (keyof typeof FLAG_LABELS)[]).map((key) => {
          const active = data.flags[key]
          const { short, description } = FLAG_LABELS[key]
          return (
            <div key={key} className="flex items-start gap-2" title={description}>
              {active ? <CheckCircle2 className="w-3.5 h-3.5 text-status-success shrink-0 mt-0.5" /> : <Circle className="w-3.5 h-3.5 text-text-muted shrink-0 mt-0.5" />}
              <div>
                <span className={`font-bold ${active ? 'text-text-primary' : 'text-text-muted'}`}>{short}</span>
                <span className="text-text-muted"> — {description}</span>
              </div>
            </div>
          )
        })}
      </div>
      <FieldRow label="rpIdHash" value={data.rpIdHashHex} />
      <FieldRow label="signCount" value={String(data.signCount)} />
      {data.attestedCredentialData && (
        <div className="pt-2 border-t border-border-subtle/50 space-y-1.5">
          <FieldRow label="aaguid" value={data.attestedCredentialData.aaguidHex} />
          <FieldRow label="credentialId" value={data.attestedCredentialData.credentialIdHex} />
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Public Key (COSE)</span>
            <pre className="text-[11px] font-mono text-text-primary break-all bg-bg-sidebar p-2.5 rounded border border-border-subtle/50 max-h-32 overflow-auto">
              {JSON.stringify(data.attestedCredentialData.publicKeyCose, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
