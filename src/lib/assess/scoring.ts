export interface Question {
  dimension: string
  title: string
  q: string
  options: {
    score: number
    label: string
    desc: string
    remediation: string
  }[]
}

export const questions: Question[] = [
  {
    dimension: 'Identity Governance (IGA)',
    title: 'User Lifecycle Management',
    q: 'How are employee lifecycles (Joiner-Mover-Leaver events) managed across corporate applications?',
    options: [
      {
        score: 1,
        label: 'Tier 1: Ad-hoc & Manual',
        desc: 'Manual email tickets, spreadsheets, and manual account creations by IT administrators.',
        remediation: 'Migrate manual tickets to a centralized directory sync schema and automate basic scripting.'
      },
      {
        score: 3,
        label: 'Tier 2: Defined & Scripted',
        desc: 'Accounts are provisioned via scheduled scripts parsing active directory templates or CSV file loads.',
        remediation: 'Upgrade to automatic API-driven provisioning (SCIM 2.0) triggered from a single source of truth.'
      },
      {
        score: 5,
        label: 'Tier 3: Automated & Continuous',
        desc: 'Real-time API provisioning (SCIM) triggered natively by HR events (e.g. Workday), with immediate, automated de-provisioning on leaver detection.',
        remediation: 'Review and audit SCIM group mappings quarterly to identify privilege drift.'
      }
    ]
  },
  {
    dimension: 'Privileged Access (PAM)',
    title: 'Infrastructure & Key Secrets',
    q: 'How are administrative passwords, server credentials, and cloud secrets protected?',
    options: [
      {
        score: 1,
        label: 'Tier 1: Shared Passwords',
        desc: 'Shared administrative passwords or static SSH keys kept in text files or unencrypted vaults.',
        remediation: 'Enforce individual admin accounts and transition all keys to an encrypted shared vault immediately.'
      },
      {
        score: 3,
        label: 'Tier 2: Centralized Vaulting',
        desc: 'Secrets are stored in an encrypted vault (e.g. HashiCorp Vault) with individual logging but standing permanent privileges.',
        remediation: 'Adopt Just-In-Time (JIT) access, issuing short-lived SSH keys or session cookies that auto-expire.'
      },
      {
        score: 5,
        label: 'Tier 3: Just-in-Time (JIT) Access',
        desc: 'No standing permanent administrative accounts. Ephemeral, short-lived certificates or keys are generated dynamically and auto-expire within minutes, with session audit recording.',
        remediation: 'Integrate PAM alerts directly into your Security Operations Center (SIEM/SOC) for real-time bypass audits.'
      }
    ]
  },
  {
    dimension: 'Customer Identity (CIAM)',
    title: 'Customer Registration & Login',
    q: 'What authentication standards are used for customer-facing interfaces or social federation?',
    options: [
      {
        score: 1,
        label: 'Tier 1: Local DB Passwords',
        desc: 'Homegrown SQL tables storing hashed passwords. No federated identity standard or social login support.',
        remediation: 'Outsource password management to an external OIDC Identity Provider (e.g., Keycloak, Auth0).'
      },
      {
        score: 3,
        label: 'Tier 2: Standard Federated SSO',
        desc: 'Built on standardized OAuth 2.0 / OpenID Connect (OIDC) protocols with social login integration and basic MFA.',
        remediation: 'Implement passwordless login methods (FIDO2 / WebAuthn Passkeys) and progressive user profiling.'
      },
      {
        score: 5,
        label: 'Tier 3: Passwordless & Risk-Adaptive',
        desc: 'Mandatory passwordless login utilizing WebAuthn / Passkeys. Progressive profiling limits friction, and dynamic anomaly detection terminates suspect connections.',
        remediation: 'Enforce synced vs. device-bound passkey policy auditing depending on user data risk profiles.'
      }
    ]
  },
  {
    dimension: 'Workforce Access (AM)',
    title: 'Employee Authentication & MFA',
    q: 'What Multi-Factor Authentication (MFA) standards apply to employees accessing internal systems?',
    options: [
      {
        score: 1,
        label: 'Tier 1: Basic Passwords',
        desc: 'Passwords only, or MFA is only enforced on select administrative boundaries.',
        remediation: 'Enforce mandatory MFA across all user boundaries using mobile authentication apps.'
      },
      {
        score: 3,
        label: 'Tier 2: Push & TOTP Apps',
        desc: 'Mandatory MFA using mobile push notifications, SMS texts, or timed authenticator apps (TOTP).',
        remediation: 'Enforce phishing-resistant MFA (FIDO2 Security Keys or Passkeys) to bypass interception tricks.'
      },
      {
        score: 5,
        label: 'Tier 3: Phishing-Resistant MFA',
        desc: 'Mandatory phishing-resistant authentication (FIDO2 or platform passkeys), enforced globally under context-based conditional rules.',
        remediation: 'Review device compliance rules to ensure access is denied if local firewalls or system patches fail.'
      }
    ]
  },
  {
    dimension: 'Zero Trust and Dynamic Risk',
    title: 'Session Verification Engine',
    q: 'How is user authorization evaluated after initial login has occurred?',
    options: [
      {
        score: 1,
        label: 'Tier 1: Permanent Session Cookies',
        desc: 'Sessions remain valid indefinitely or require manual timeouts. No context validation after login.',
        remediation: 'Configure absolute session timeouts (e.g., maximum 8 to 12 hours) and implement IP geofence audits.'
      },
      {
        score: 3,
        label: 'Tier 2: Fixed Timeout Windows',
        desc: 'Access tokens expire and refresh after a fixed, standard timeframe (e.g. 1 hour access, 24 hours refresh).',
        remediation: 'Transition to Continuous Adaptive Trust, setting up Shared Signals (CAEP/SSF) to capture security events.'
      },
      {
        score: 5,
        label: 'Tier 3: Continuous Adaptive Trust',
        desc: 'Real-time session monitoring using Continuous Access Evaluation Protocol (CAEP / SSF). IP shifts or compliance failures instantly trigger revocation.',
        remediation: 'Establish joint threat-sharing circles with key partners using unified SSF event feeds.'
      }
    ]
  }
]

export interface MaturityTier {
  label: string
  color: string
  desc: string
}

export function computeScores(answers: Record<number, number>) {
  const totalScore = Object.values(answers).reduce((a, b) => a + b, 0)
  const maxScore = questions.length * 5
  const percentage = Math.round((totalScore / maxScore) * 100)
  const averageScore = Number((totalScore / questions.length).toFixed(1))
  return { totalScore, maxScore, percentage, averageScore }
}

export function getMaturityTier(averageScore: number): MaturityTier {
  if (averageScore <= 1.8) {
    return {
      label: 'Tier 1: Ad-Hoc & Siloed',
      color: 'text-status-danger bg-status-danger/5 border-status-danger/20',
      desc: 'Your IAM systems are highly fragmented, rely on manual tasks, and are vulnerable to password interception or shared-secret leakages.'
    }
  }
  if (averageScore <= 3.4) {
    return {
      label: 'Tier 2: Standardized & Defined',
      color: 'text-status-warning bg-status-warning/5 border-status-warning/20',
      desc: 'You have established central directory controls and standard SSO patterns. Security is defined but vulnerable to standing privileges and push-fatigue attacks.'
    }
  }
  return {
    label: 'Tier 3: Adaptive Zero Trust',
    color: 'text-status-success bg-status-success/5 border-status-success/20',
    desc: 'Outstanding! Your environment is driven by automated SCIM loops, Just-In-Time access controls, phishing-resistant Passkeys, and continuous CAEP session audits.'
  }
}

const VALID_DIGITS = new Set(['1', '3', '5'])

export function encodeAnswers(answers: Record<number, number>): string {
  return questions.map((_, i) => String(answers[i] ?? 1)).join('')
}

export function decodeAnswers(param: string | null): Record<number, number> | null {
  if (!param || param.length !== questions.length) return null
  if (![...param].every((ch) => VALID_DIGITS.has(ch))) return null
  const answers: Record<number, number> = {}
  for (let i = 0; i < param.length; i++) {
    answers[i] = Number(param[i])
  }
  return answers
}
