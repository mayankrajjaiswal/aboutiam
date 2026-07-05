import { useState, useMemo } from 'react'
import { Check, Copy, RefreshCw, FileCode, AlertTriangle, RotateCcw } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import { useClipboardCopy } from '../../components/Tools/useClipboardCopy'
import { getToolBySlug } from '../../data/toolsRegistry'

const tool = getToolBySlug('scim-diff')!

const DEFAULT_IDP_PAYLOAD = `{
  "schemas": ["urn:ietf:params:scim:schemas:core:2.0:User"],
  "id": "2819c223-7f76-453a-919d-413861904646",
  "userName": "bjensen@example.com",
  "name": {
    "familyName": "Jensen",
    "givenName": "Barbara"
  },
  "emails": [
    {
      "value": "bjensen@example.com",
      "type": "work",
      "primary": true
    }
  ],
  "title": "Principal Security Engineer",
  "active": true
}`

const DEFAULT_SP_PAYLOAD = `{
  "schemas": ["urn:ietf:params:scim:schemas:core:2.0:User"],
  "id": "2819c223-7f76-453a-919d-413861904646",
  "userName": "bjensen@example.com",
  "name": {
    "familyName": "Jensen",
    "givenName": "Barbara"
  },
  "emails": [
    {
      "value": "barbara.j@example.com",
      "type": "work",
      "primary": true
    }
  ],
  "title": "Software Engineer",
  "active": false
}`

interface DiffItem {
  path: string
  idpVal: unknown
  spVal: unknown
  type: 'mismatch' | 'missing_in_sp' | 'missing_in_idp'
}

export default function ScimDiffTool() {
  const [idpJson, setIdpJson] = useState(DEFAULT_IDP_PAYLOAD)
  const [spJson, setSpJson] = useState(DEFAULT_SP_PAYLOAD)
  const { copy, copiedId } = useClipboardCopy()

  // Compare both JSON schemas dynamically
  const { diffItems, patchPayload, jsonError } = useMemo(() => {
    try {
      const idpObj = JSON.parse(idpJson)
      const spObj = JSON.parse(spJson)

      const diffs: DiffItem[] = []

      // Helper to trace primitive fields
      const compareField = (path: string, valIdp: unknown, valSp: unknown) => {
        if (JSON.stringify(valIdp) !== JSON.stringify(valSp)) {
          if (valSp === undefined) {
            diffs.push({ path, idpVal: valIdp, spVal: undefined, type: 'missing_in_sp' })
          } else if (valIdp === undefined) {
            diffs.push({ path, idpVal: undefined, spVal: valSp, type: 'missing_in_idp' })
          } else {
            diffs.push({ path, idpVal: valIdp, spVal: valSp, type: 'mismatch' })
          }
        }
      }

      // Check top-level primitive keys
      const keys = new Set([...Object.keys(idpObj), ...Object.keys(spObj)])
      keys.forEach(key => {
        if (key === 'schemas' || key === 'id') return // Ignore immutable IDs and core schema wrapper

        const idpVal = idpObj[key]
        const spVal = spObj[key]

        if (typeof idpVal === 'object' && idpVal !== null && !Array.isArray(idpVal)) {
          // Nested object like "name"
          const nestedKeys = new Set([...Object.keys(idpVal), ...Object.keys(spVal || {})])
          nestedKeys.forEach(nKey => {
            compareField(`${key}.${nKey}`, idpVal[nKey], (spVal || {})[nKey])
          })
        } else if (Array.isArray(idpVal)) {
          // Complex arrays like "emails"
          idpVal.forEach((item, index) => {
            if (item.type && item.value) {
              const spArr = Array.isArray(spVal) ? spVal : []
              const matchingSpItem = spArr.find((i: { type?: string; value?: unknown }) => i.type === item.type)
              if (!matchingSpItem) {
                diffs.push({
                  path: `${key}[type eq "${item.type}"].value`,
                  idpVal: item.value,
                  spVal: undefined,
                  type: 'missing_in_sp'
                })
              } else if (matchingSpItem.value !== item.value) {
                diffs.push({
                  path: `${key}[type eq "${item.type}"].value`,
                  idpVal: item.value,
                  spVal: matchingSpItem.value,
                  type: 'mismatch'
                })
              }
            } else {
              compareField(`${key}[${index}]`, item, (spVal || [])[index])
            }
          })
        } else {
          compareField(key, idpVal, spVal)
        }
      })

      // Build standard SCIM RFC 7644 PATCH Payload
      let patchPayload: string
      if (diffs.length > 0) {
        const operations = diffs
          .filter(d => d.type !== 'missing_in_idp') // IdP is source of truth, so we replace/add SP values
          .map(d => {
            const opType = d.type === 'missing_in_sp' ? 'add' : 'replace'
            return {
              op: opType,
              path: d.path,
              value: d.idpVal
            }
          })

        const patch = {
          schemas: ["urn:ietf:params:scim:api:messages:2.0:PatchOp"],
          Operations: operations
        }

        patchPayload = JSON.stringify(patch, null, 2)
      } else {
        patchPayload = JSON.stringify({
          schemas: ["urn:ietf:params:scim:api:messages:2.0:PatchOp"],
          Operations: [],
          status: "reconciled",
          message: "No sync drift detected. Both systems are fully in-sync!"
        }, null, 2)
      }

      return { diffItems: diffs, patchPayload, jsonError: null as string | null }

    } catch (e) {
      return {
        diffItems: [] as DiffItem[],
        patchPayload: '',
        jsonError: e instanceof Error ? e.message : 'Invalid JSON format. Check brackets and commas.'
      }
    }
  }, [idpJson, spJson])

  // Apply Reconciliation (forces SP to match IdP)
  const handleReconcile = () => {
    setSpJson(idpJson)
  }

  // Load defaults
  const handleReset = () => {
    setIdpJson(DEFAULT_IDP_PAYLOAD)
    setSpJson(DEFAULT_SP_PAYLOAD)
  }

  return (
    <ToolPageShell tool={tool}>
      <div className="space-y-6">
        {/* Dynamic Dual JSON Textarea editors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Identity Provider State (Source of Truth) */}
          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between border-b border-border-subtle pb-2">
              <span className="text-[10px] font-black text-accent-primary uppercase tracking-wider">
                1. IdP User Record (Source of Truth)
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 font-bold">
                Okta / Entra ID
              </span>
            </div>
            <textarea
              aria-label="Identity Provider JSON payload"
              value={idpJson}
              onChange={(e) => setIdpJson(e.target.value)}
              className="flex-grow w-full font-mono text-[10px] leading-relaxed bg-bg-nested border border-border-subtle rounded-xl p-3 h-64 focus:outline-none focus:border-accent-primary resize-none"
            />
          </div>

          {/* Service Provider State (Target App) */}
          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between border-b border-border-subtle pb-2">
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-wider">
                2. SP User Record (Target State)
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold">
                Salesforce / Slack
              </span>
            </div>
            <textarea
              aria-label="Service Provider JSON payload"
              value={spJson}
              onChange={(e) => setSpJson(e.target.value)}
              className="flex-grow w-full font-mono text-[10px] leading-relaxed bg-bg-nested border border-border-subtle rounded-xl p-3 h-64 focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>
        </div>

        {jsonError && (
          <div className="p-3.5 rounded-xl bg-status-danger/10 border border-status-danger/20 text-xs font-semibold text-status-danger flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>JSON Formatting Error: {jsonError}</span>
          </div>
        )}

        {/* Sync Drift Analysis & Reconciler Payloads */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left panel: Drift Analysis Ledger (lg:col-span-5) */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border-subtle pb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Synchronization Drift Analysis
            </h4>

            {diffItems.length === 0 ? (
              <div className="p-6 text-center space-y-2">
                <Check className="w-8 h-8 text-emerald-500 mx-auto" />
                <span className="block text-xs font-bold text-text-primary">Both Systems In-Sync!</span>
                <p className="text-[10px] text-text-muted">No difference or attribute drift detected between IdP and SP.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                {diffItems.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-bg-nested border border-border-subtle text-[10px] space-y-2 leading-relaxed">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-text-primary">{item.path}</span>
                      <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        item.type === 'mismatch' ? 'bg-amber-500/10 text-amber-500' : 'bg-status-danger/10 text-status-danger'
                      }`}>
                        {item.type.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[9px] font-mono bg-bg-card p-2 rounded">
                      <div>
                        <span className="block text-text-muted font-bold text-[8px] uppercase">IdP Value (Src)</span>
                        <span className="block text-blue-400 font-bold truncate mt-0.5">{JSON.stringify(item.idpVal)}</span>
                      </div>
                      <div>
                        <span className="block text-text-muted font-bold text-[8px] uppercase">SP Value (Tgt)</span>
                        <span className="block text-amber-400 font-bold truncate mt-0.5">
                          {item.spVal === undefined ? 'undefined (Missing)' : JSON.stringify(item.spVal)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t border-border-subtle/40">
              <button
                disabled={diffItems.length === 0}
                onClick={handleReconcile}
                className="flex-grow py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-45 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 shadow"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reconcile Drift Natively
              </button>
              <button
                onClick={handleReset}
                className="px-3 py-2 bg-bg-nested hover:bg-bg-sidebar border border-border-subtle text-text-secondary text-xs font-bold rounded-lg"
                title="Reset records"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right panel: SCIM PATCH Generator (lg:col-span-7) */}
          <div className="lg:col-span-7 p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm flex flex-col justify-between min-h-[380px]">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-accent-primary" />
                <div>
                  <span className="block text-xs font-black text-text-primary uppercase leading-tight">RFC 7644 SCIM PATCH Body</span>
                  <span className="block text-[9px] text-text-muted mt-0.5">Automated synchronization delta JSON payload</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!patchPayload}
                  onClick={() => copy(patchPayload, 'scim-patch')}
                  className="px-3 py-1.5 bg-bg-nested hover:bg-bg-sidebar text-text-secondary hover:text-text-primary rounded-lg border border-border-subtle text-xs font-bold flex items-center gap-1 transition-all disabled:opacity-40"
                  title="Copy to clipboard"
                >
                  {copiedId === 'scim-patch' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Payload
                    </>
                  )}
                </button>
              </div>
            </div>

            <textarea
              aria-label="Reconciliation SCIM PATCH Output"
              readOnly
              value={patchPayload}
              className="flex-grow w-full font-mono text-[10px] leading-relaxed bg-bg-nested border border-border-subtle rounded-xl p-3 focus:outline-none resize-none h-[280px] mt-4 text-text-secondary"
            />
          </div>

        </div>

      </div>

      <BeginnerExpertExplainer tool={tool} />
    </ToolPageShell>
  )
}
