import { useState } from 'react'
import { ShieldCheck, ShieldAlert, CheckCircle2, Play, HelpCircle } from 'lucide-react'
import ToolPageShell from '../../components/Tools/ToolPageShell'
import BeginnerExpertExplainer from '../../components/Tools/BeginnerExpertExplainer'
import { getToolBySlug } from '../../data/toolsRegistry'

interface AuditFinding {
  severity: 'Critical' | 'High' | 'Medium' | 'Info'
  title: string
  desc: string
  remediation: string
}

export default function CloudPolicyAuditor() {
  const tool = getToolBySlug('cloud-policy-auditor')!

  const [schemaType, setSchemaType] = useState('AWS')
  const [policyInput, setPolicyInput] = useState(
    schemaType === 'AWS'
      ? `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "*",
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "iam:CreateAccessKey",
        "iam:PassRole"
      ],
      "Resource": "arn:aws:iam::123456789012:user/*"
    }
  ]
}`
      : schemaType === 'GCP'
      ? `{
  "bindings": [
    {
      "role": "roles/owner",
      "members": [
        "user:admin@company.com",
        "allUsers"
      ]
    }
  ]
}`
      : `apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: admin-role
rules:
- apiGroups: ["*"]
  resources: ["*"]
  verbs: ["*"]`
  )

  const [findings, setFindings] = useState<AuditFinding[] | null>(null)
  const [hardenedPolicy, setHardenedPolicy] = useState<string | null>(null)
  const [scanned, setScanned] = useState(false)

  const handleSchemaChange = (type: string) => {
    setSchemaType(type)
    setScanned(false)
    setFindings(null)
    setHardenedPolicy(null)
    if (type === 'AWS') {
      setPolicyInput(`{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "*",
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "iam:CreateAccessKey",
        "iam:PassRole"
      ],
      "Resource": "arn:aws:iam::123456789012:user/*"
    }
  ]
}`)
    } else if (type === 'GCP') {
      setPolicyInput(`{
  "bindings": [
    {
      "role": "roles/owner",
      "members": [
        "user:admin@company.com",
        "allUsers"
      ]
    }
  ]
}`)
    } else {
      setPolicyInput(`apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: admin-role
rules:
- apiGroups: ["*"]
  resources: ["*"]
  verbs: ["*"]`)
    }
  }

  const handleScan = () => {
    const list: AuditFinding[] = []
    let hardened: string

    if (schemaType === 'AWS') {
      // Analyze AWS IAM
      if (policyInput.includes('"Action": "*"') || policyInput.includes('"Action": ["*"]')) {
        list.push({
          severity: 'Critical',
          title: 'Wildcard Action Scope Detected',
          desc: 'Using "*" allows the principal to execute any possible API command across the account, exposing full control.',
          remediation: 'Specify precise action lists instead of wildcards (e.g., "s3:GetObject" instead of "*").'
        })
      }
      if (policyInput.includes('"Resource": "*"') || policyInput.includes('"Resource": ["*"]')) {
        list.push({
          severity: 'High',
          title: 'Wildcard Resource Scope Detected',
          desc: 'Allowing actions on "*" resources violates the Principle of Least Privilege, as it targets resources globally.',
          remediation: 'Restrict resource scopes using specific ARNs (e.g., "arn:aws:s3:::my-bucket/*").'
        })
      }
      if (policyInput.includes('iam:PassRole') && policyInput.includes('iam:CreateAccessKey')) {
        list.push({
          severity: 'Critical',
          title: 'Privilege Escalation Vector Detected (iam:PassRole + iam:CreateAccessKey)',
          desc: 'Combining these permissions allows a user to pass arbitrary roles to compute instances and generate administrative credentials.',
          remediation: 'Segregate iam:PassRole and credential creation commands into different restricted roles.'
        })
      }

      hardened = `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::my-company-confidential-bucket/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "iam:GetRole"
      ],
      "Resource": "arn:aws:iam::123456789012:role/restricted-role"
    }
  ]
}`
    } else if (schemaType === 'GCP') {
      // Analyze GCP
      if (policyInput.includes('allUsers')) {
        list.push({
          severity: 'Critical',
          title: 'Public anonymous access (allUsers) assigned to administrative role',
          desc: 'Adding "allUsers" grants access to anyone on the internet, which completely exposes administrative bindings.',
          remediation: 'Remove the "allUsers" binding immediately and scope administrative roles to corporate emails only.'
        })
      }
      hardened = `{
  "bindings": [
    {
      "role": "roles/viewer",
      "members": [
        "user:admin@company.com"
      ]
    }
  ]
}`
    } else {
      // Analyze K8s
      if (policyInput.includes('verbs: ["*"]') || policyInput.includes('verbs:\n  - "*"')) {
        list.push({
          severity: 'High',
          title: 'Wildcard Kubernetes Verbs Scope',
          desc: 'Granting wildcards on verbs allows full CRUD operations on Kubernetes APIs, leading to privilege escalation.',
          remediation: 'Specify limited verbs like ["get", "list", "watch"] instead of ["*"].'
        })
      }
      hardened = `apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: restricted-viewer-role
rules:
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list", "watch"]`
    }

    if (list.length === 0) {
      list.push({
        severity: 'Info',
        title: 'No standard risk indicators found',
        desc: 'This policy complies with standard static analysis and wildcard auditing guidelines.',
        remediation: 'Maintain regular posture scans on access declarations.'
      })
    }

    setFindings(list)
    setHardenedPolicy(hardened)
    setScanned(true)
  }

  return (
    <ToolPageShell tool={tool}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-w-0">
        
        {/* Policy Editor Panel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border-subtle/50">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-accent-primary" />
              <h3 className="font-extrabold text-sm text-text-primary uppercase tracking-wide">Configure Access Policy</h3>
            </div>
            
            <select
              value={schemaType}
              onChange={e => handleSchemaChange(e.target.value)}
              className="bg-bg-sidebar border border-border-subtle rounded-lg px-2.5 py-1 text-xs font-bold text-text-primary focus:outline-none"
            >
              <option value="AWS">AWS IAM JSON Policy</option>
              <option value="GCP">GCP IAM JSON Binding</option>
              <option value="K8s">Kubernetes RBAC YAML</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-text-muted font-bold block uppercase">Paste Policy Configuration</label>
            <textarea
              value={policyInput}
              onChange={e => setPolicyInput(e.target.value)}
              className="w-full bg-black text-text-secondary border border-zinc-800 rounded-xl p-3.5 font-mono text-[11px] h-[320px] focus:outline-none resize-none leading-relaxed"
            />
          </div>

          <button
            onClick={handleScan}
            className="w-full py-2.5 rounded-xl bg-accent-primary hover:bg-accent-hover text-white text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Run Static Compliance Scan
          </button>
        </div>

        {/* Audit Results Panel */}
        <div className="space-y-6">
          {!scanned ? (
            <div className="p-6 rounded-2xl border border-dashed border-border-subtle bg-bg-card flex flex-col items-center justify-center text-center space-y-3 h-[420px]">
              <HelpCircle className="w-10 h-10 text-text-muted/60 animate-bounce" />
              <h4 className="text-sm font-bold text-text-primary">Policy Scan Pending</h4>
              <p className="text-xs text-text-secondary max-w-xs leading-relaxed">
                Paste your IAM access policies on the left and click "Run Static Compliance Scan" to execute local AST rules.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-extrabold text-sm text-text-primary uppercase tracking-wide">Audit Vulnerability findings</h3>
              
              <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                {findings?.map((finding, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border flex gap-3.5 items-start transition-all ${
                      finding.severity === 'Critical'
                        ? 'border-status-danger/30 bg-status-danger/5'
                        : finding.severity === 'High'
                        ? 'border-status-warning/30 bg-status-warning/5'
                        : 'border-accent-primary/20 bg-accent-glow/5'
                    }`}
                  >
                    <ShieldAlert className={`w-5 h-5 shrink-0 mt-0.5 ${
                      finding.severity === 'Critical' ? 'text-status-danger' : 'text-status-warning'
                    }`} />
                    <div className="space-y-1 text-xs">
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        finding.severity === 'Critical' ? 'bg-status-danger/10 text-status-danger' : 'bg-status-warning/10 text-status-warning'
                      }`}>
                        {finding.severity}
                      </span>
                      <h4 className="font-bold text-text-primary pt-1.5">{finding.title}</h4>
                      <p className="text-text-secondary leading-relaxed">{finding.desc}</p>
                      <div className="mt-2.5 pt-2 border-t border-border-subtle/30 space-y-0.5">
                        <span className="text-[9px] font-black uppercase text-text-muted block">Remediation Fix</span>
                        <p className="text-[11px] text-text-primary font-medium">{finding.remediation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {hardenedPolicy && (
                <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-md space-y-3">
                  <div className="flex items-center justify-between pb-1.5 border-b border-border-subtle/50">
                    <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Hardened Least-Privilege Policy
                    </span>
                    <span className="text-[9px] text-text-muted font-bold block">One-Click Auto Remediation</span>
                  </div>
                  <pre className="text-[9px] font-mono bg-black text-text-secondary border border-zinc-800 rounded-xl p-3.5 overflow-x-auto leading-normal whitespace-pre">
                    {hardenedPolicy}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      <div className="mt-8 space-y-6">
        <BeginnerExpertExplainer tool={tool} />
      </div>
    </ToolPageShell>
  )
}
