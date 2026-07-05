import { useState, useMemo } from 'react'
import { ShieldCheck, ShieldAlert, AlertTriangle, FileJson, Terminal } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import { getToolBySlug } from '../../data/toolsRegistry'

const tool = getToolBySlug('policy-evaluator')!

// Dropdown Preconfigurations
const SCENARIOS = {
  abac_device: {
    name: 'ABAC Strict Device Compliance (Attribute-Based)',
    request: `{
  "subject": {
    "userName": "alice.dev",
    "department": "Engineering",
    "role": "Developer"
  },
  "resource": {
    "type": "database",
    "name": "production-billing-db",
    "classification": "restricted"
  },
  "environment": {
    "deviceState": "unmanaged",
    "network": "external",
    "requestIp": "198.51.100.4"
  }
}`,
    policy: `{
  "policyName": "Strict Database Protection Rule",
  "defaultEffect": "DENY",
  "rules": [
    {
      "ruleName": "Allow Engineers with Compliant Devices Internal Only",
      "effect": "ALLOW",
      "conditions": {
        "subject.department": "Engineering",
        "subject.role": "Developer",
        "environment.deviceState": "compliant",
        "environment.network": "internal"
      }
    }
  ]
}`
  },
  rbac_admin: {
    name: 'RBAC Multi-Role Access (Role-Based)',
    request: `{
  "subject": {
    "userName": "bob.audit",
    "role": "Auditor"
  },
  "resource": {
    "type": "ledger",
    "name": "q3-financials"
  },
  "action": "read"
}`,
    policy: `{
  "policyName": "Financial Ledger Access Policies",
  "defaultEffect": "DENY",
  "rules": [
    {
      "ruleName": "Read access for Auditor Role",
      "effect": "ALLOW",
      "conditions": {
        "subject.role": "Auditor",
        "action": "read"
      }
    },
    {
      "ruleName": "Full Access for Admin Role",
      "effect": "ALLOW",
      "conditions": {
        "subject.role": "Admin"
      }
    }
  ]
}`
  },
  geofence_denial: {
    name: 'Resource-Based Geofencing embargo check',
    request: `{
  "subject": {
    "userName": "charlie.ops",
    "role": "Operator",
    "country": "CN"
  },
  "resource": {
    "type": "infra",
    "name": "nuclear-cooling-pump"
  },
  "action": "write"
}`,
    policy: `{
  "policyName": "Embargo Country Lockdown",
  "defaultEffect": "ALLOW",
  "rules": [
    {
      "ruleName": "Deny High Risk Countries writing to Infra",
      "effect": "DENY",
      "conditions": {
        "subject.country": "CN",
        "resource.type": "infra",
        "action": "write"
      }
    }
  ]
}`
  }
}

interface EvaluationTrace {
  ruleName: string
  matched: boolean
  effect: 'ALLOW' | 'DENY'
  details: string
}

export default function PolicyEvaluator() {
  const [selectedScenario, setSelectedScenario] = useState<keyof typeof SCENARIOS>('abac_device')
  const [requestJson, setRequestJson] = useState(SCENARIOS.abac_device.request)
  const [policyJson, setPolicyJson] = useState(SCENARIOS.abac_device.policy)

  const handleScenarioChange = (key: keyof typeof SCENARIOS) => {
    setSelectedScenario(key)
    setRequestJson(SCENARIOS[key].request)
    setPolicyJson(SCENARIOS[key].policy)
  }

  // Pure JavaScript condition-matching evaluation engine
  const evaluationResult = useMemo(() => {
    const traces: EvaluationTrace[] = []
    let effect: 'ALLOW' | 'DENY'

    try {
      const request = JSON.parse(requestJson)
      const policy = JSON.parse(policyJson)

      if (typeof request !== 'object' || typeof policy !== 'object') {
        return { effect: 'DENY', traces: [], error: 'Both Request and Policy inputs must be valid JSON objects.' }
      }

      const defaultEffect = policy.defaultEffect || 'DENY'
      effect = defaultEffect // Initialize to default effect

      const rules = policy.rules || []

      // Helper to dynamically resolve nested attributes (e.g. "subject.role")
      const getNestedValue = (obj: unknown, path: string): unknown => {
        return path.split('.').reduce((acc: unknown, part) => acc && (acc as Record<string, unknown>)[part], obj)
      }

      for (const rule of rules) {
        let ruleMatches = true
        const conditions = rule.conditions || {}
        const conditionDetails: string[] = []

        for (const [path, expectedVal] of Object.entries(conditions)) {
          const actualVal = getNestedValue(request, path)
          if (actualVal === undefined) {
            ruleMatches = false
            conditionDetails.push(`❌ Key "${path}" is missing in incoming request.`)
          } else if (actualVal !== expectedVal) {
            ruleMatches = false
            conditionDetails.push(`❌ Attribute "${path}" evaluated: Expected "${expectedVal}", but got "${actualVal}".`)
          } else {
            conditionDetails.push(`✓ Attribute "${path}" matched: "${actualVal}".`)
          }
        }

        traces.push({
          ruleName: rule.ruleName || 'Unnamed Rule',
          matched: ruleMatches,
          effect: rule.effect || 'ALLOW',
          details: conditionDetails.join('\n')
        })

        // If a rule matches, evaluate its effect
        if (ruleMatches) {
          effect = rule.effect
          // In standard rule engines, first match wins or DENY-overrides applies. 
          // Here, we simulate simple first-matching active rule selection.
          break
        }
      }

      return { effect, traces, defaultEffect, error: null }

    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      return { effect: 'DENY', traces: [], error: `JSON syntax error: ${message}` }
    }
  }, [requestJson, policyJson])

  return (
    <ToolPageShell tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Code Config & Scenarios */}
        <div className="lg:col-span-6 space-y-4">
          
          {/* Scenario Selector dropdown */}
          <div className="p-4 rounded-xl bg-bg-card border border-border-subtle shadow-sm">
            <label className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Select Educational Scenario</label>
            <select
              value={selectedScenario}
              onChange={e => handleScenarioChange(e.target.value as keyof typeof SCENARIOS)}
              className="w-full bg-bg-sidebar border border-border-subtle/80 rounded px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent-primary font-bold"
            >
              {Object.entries(SCENARIOS).map(([key, item]) => (
                <option key={key} value={key}>{item.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Input Context JSON panel */}
            <div className="p-4 rounded-xl bg-bg-card border border-border-subtle flex flex-col justify-between shadow-sm min-h-[320px]">
              <div className="flex justify-between items-center mb-2 border-b border-border-subtle/50 pb-1.5">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                  <FileJson className="w-4 h-4 text-accent-primary" /> Request Context
                </span>
              </div>
              <textarea
                value={requestJson}
                onChange={e => setRequestJson(e.target.value)}
                className="flex-1 w-full bg-bg-sidebar border border-border-subtle/80 rounded-lg p-2.5 text-[10px] font-mono text-text-primary focus:outline-none resize-none h-[240px] leading-normal"
              />
            </div>

            {/* Policy JSON panel */}
            <div className="p-4 rounded-xl bg-bg-card border border-border-subtle flex flex-col justify-between shadow-sm min-h-[320px]">
              <div className="flex justify-between items-center mb-2 border-b border-border-subtle/50 pb-1.5">
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                  <FileJson className="w-4 h-4 text-accent-primary" /> Security Policy
                </span>
              </div>
              <textarea
                value={policyJson}
                onChange={e => setPolicyJson(e.target.value)}
                className="flex-1 w-full bg-bg-sidebar border border-border-subtle/80 rounded-lg p-2.5 text-[10px] font-mono text-text-primary focus:outline-none resize-none h-[240px] leading-normal"
              />
            </div>

          </div>

        </div>

        {/* Right column: Dynamic evaluation outputs */}
        <div className="lg:col-span-6 space-y-4 flex flex-col justify-between">
          
          <div>
            {/* Main Result Shield */}
            {evaluationResult.error ? (
              <div className="p-5 rounded-xl bg-status-danger/10 text-status-danger border border-status-danger/35 flex items-start gap-4 shadow-sm animate-fadeIn">
                <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-base block">Compilation Interrupted</span>
                  <span className="text-xs text-text-primary leading-normal">{evaluationResult.error}</span>
                </div>
              </div>
            ) : evaluationResult.effect === 'ALLOW' ? (
              <div className="p-5 rounded-xl bg-status-success/15 text-status-success border border-status-success/35 flex items-start gap-4 shadow-md animate-fadeIn">
                <ShieldCheck className="w-8 h-8 shrink-0 mt-0.5 text-status-success" />
                <div>
                  <span className="font-black text-lg tracking-wider block uppercase mb-1">Access Granted (ALLOW)</span>
                  <span className="text-xs text-text-primary leading-normal">
                    The policy engine matched active permit rule conditions successfully, validating all required subject and environmental boundaries.
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-5 rounded-xl bg-status-danger/10 text-status-danger border border-status-danger/35 flex items-start gap-4 shadow-md animate-fadeIn">
                <ShieldAlert className="w-8 h-8 shrink-0 mt-0.5 text-status-danger animate-pulse" />
                <div>
                  <span className="font-black text-lg tracking-wider block uppercase mb-1">Access Rejected (DENY)</span>
                  <span className="text-xs text-text-primary leading-normal">
                    Request does not satisfy authorization gates. Resolved to <strong className="font-bold text-status-danger">DENY</strong> (either explicitly blocked or failed default-deny fallback).
                  </span>
                </div>
              </div>
            )}

            {/* Trace logs terminal */}
            <div className="mt-4 border border-border-subtle bg-bg-card rounded-xl p-4 shadow flex-1">
              <div className="flex items-center gap-1.5 border-b border-border-subtle/50 pb-2 mb-3 text-[10px] text-text-secondary font-bold uppercase tracking-wider">
                <Terminal className="w-4 h-4 text-accent-primary" /> Execution Trace Logs
              </div>

              {evaluationResult.error ? (
                <p className="text-[11px] text-text-muted italic select-none py-4 text-center">Correct syntax errors on the left to review rule evaluations.</p>
              ) : (
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {evaluationResult.traces.map((trace, idx) => (
                    <div key={idx} className="p-3 bg-bg-sidebar/50 rounded-lg border border-border-subtle/60 text-[10px] font-mono leading-normal">
                      <div className="flex justify-between items-center mb-1.5 border-b border-border-subtle/30 pb-1">
                        <span className="font-bold text-text-primary">{trace.ruleName}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold ${trace.matched ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/30' : 'bg-bg-sidebar text-text-muted border border-border-subtle'}`}>
                          {trace.matched ? `MATCHED (${trace.effect})` : 'SKIPPED'}
                        </span>
                      </div>
                      <pre className="text-text-muted whitespace-pre-wrap font-mono leading-relaxed">
                        {trace.details}
                      </pre>
                    </div>
                  ))}
                  
                  {evaluationResult.traces.length === 0 && (
                    <div className="p-3 bg-bg-sidebar/50 rounded-lg border border-border-subtle/60 text-[10px] font-mono leading-normal text-text-muted">
                      ℹ️ Default Fallback Applied. No rules matched in policy set. Resolved directly to default effect: <strong className="font-bold">{evaluationResult.defaultEffect}</strong>.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-bg-sidebar/35 p-3 rounded-lg border border-border-subtle/60 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-accent-primary shrink-0 mt-0.5" />
            <span className="text-[10px] text-text-muted leading-relaxed">
              <strong>Security Guard:</strong> Under zero-trust standards, policy evaluation engines must collapse to **default-deny** (deny access if no rules explicitly grant it), protecting databases from unmapped endpoints.
            </span>
          </div>

        </div>

      </div>

      <BeginnerExpertExplainer tool={tool} />
    </ToolPageShell>
  )
}
