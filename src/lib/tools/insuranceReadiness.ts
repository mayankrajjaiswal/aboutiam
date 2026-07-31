// Directional cyber-insurance underwriting readiness scorer. Weights and premium-impact
// bands are illustrative, informed by publicly-reported 2024-2026 underwriting trends
// (universal phishing-resistant MFA, documented PAM, Zero Trust/conditional access are
// now explicitly asked about on most cyber applications) — not a licensed actuarial model
// and not a quote. Always disclosed as directional in the UI.

export interface InsuranceControl {
  id: string
  label: string
  description: string
  points: number
}

export const INSURANCE_CONTROLS: InsuranceControl[] = [
  {
    id: 'mfa_privileged',
    label: 'Phishing-resistant MFA on all privileged/admin accounts',
    description: 'FIDO2/WebAuthn or PKI-based MFA (not SMS/OTP) enforced for every account with domain admin, cloud admin, or PAM vault access.',
    points: 25,
  },
  {
    id: 'mfa_remote',
    label: 'MFA on all remote network access (VPN/RDP)',
    description: 'Every remote access path into the corporate network requires MFA, with no standing exceptions for legacy or vendor accounts.',
    points: 20,
  },
  {
    id: 'mfa_email',
    label: 'MFA on all email and cloud-admin accounts',
    description: 'Every mailbox and cloud tenant admin console (M365/Google Workspace/AWS/Azure) requires MFA, since business-email-compromise is the most common initial-access vector insurers cite.',
    points: 20,
  },
  {
    id: 'pam_governance',
    label: 'Documented PAM governance with session recording',
    description: 'Privileged sessions route through a vault with just-in-time elevation and recorded/audited sessions, not standing local-admin rights.',
    points: 15,
  },
  {
    id: 'zero_trust_posture',
    label: 'Zero Trust / conditional-access posture',
    description: 'Access decisions incorporate device posture, location, and risk signals rather than a network-perimeter-only trust model.',
    points: 10,
  },
  {
    id: 'offline_backups',
    label: 'Immutable, tested offline backups',
    description: 'Backups are isolated from the production identity domain (so a compromised admin account cannot delete them) and restore is tested at least annually.',
    points: 10,
  },
]

export const MAX_INSURANCE_READINESS_SCORE = INSURANCE_CONTROLS.reduce((sum, c) => sum + c.points, 0)

export type InsuranceControlInputs = Record<string, boolean>

export interface PremiumImpactBand {
  minScore: number
  label: string
  description: string
}

// Ordered highest-score-first; computePremiumImpact picks the first band the score qualifies for.
export const PREMIUM_IMPACT_BANDS: PremiumImpactBand[] = [
  {
    minScore: 85,
    label: 'Typically favorable (directional -10% to -20% vs. market average)',
    description: 'This posture covers the controls most 2024-2026 cyber applications ask about explicitly and often qualifies for preferred-tier pricing or broader sublimits.',
  },
  {
    minScore: 60,
    label: 'Typically neutral to modest surcharge (directional 0% to +15%)',
    description: 'Core controls are present but with gaps underwriters increasingly flag — expect follow-up application questions before binding.',
  },
  {
    minScore: 30,
    label: 'Typically surcharged or sublimited (directional +20% to +50%)',
    description: 'Missing controls this widespread put a renewal at real risk of reduced sublimits (especially for ransomware) even if coverage is offered.',
  },
  {
    minScore: 0,
    label: 'Coverage or claim risk — many carriers now decline or rescind on this profile',
    description: 'Several carriers have moved to decline binding, or have pursued post-breach rescission, when an application materially overstates MFA/PAM coverage this thin — see the case studies below.',
  },
]

export interface InsuranceReadinessResult {
  score: number
  maxScore: number
  percent: number
  premiumImpact: PremiumImpactBand
  gaps: InsuranceControl[]
}

export function computeInsuranceReadiness(inputs: InsuranceControlInputs): InsuranceReadinessResult {
  const gaps = INSURANCE_CONTROLS.filter((control) => !inputs[control.id])
  const score = INSURANCE_CONTROLS.reduce((sum, control) => sum + (inputs[control.id] ? control.points : 0), 0)
  const percent = Math.round((score / MAX_INSURANCE_READINESS_SCORE) * 100)
  const premiumImpact = PREMIUM_IMPACT_BANDS.find((band) => score >= band.minScore) ?? PREMIUM_IMPACT_BANDS[PREMIUM_IMPACT_BANDS.length - 1]

  return { score, maxScore: MAX_INSURANCE_READINESS_SCORE, percent, premiumImpact, gaps }
}

export interface InsuranceDenialCaseStudy {
  id: string
  caseName: string
  citation: string
  summary: string
  sourceUrl: string
  lastVerified: string
}

export const INSURANCE_DENIAL_CASE_STUDIES: InsuranceDenialCaseStudy[] = [
  {
    id: 'cottage-health',
    caseName: 'Columbia Casualty Co. v. Cottage Health System',
    citation: 'No. 2:15-cv-03432 (C.D. Cal., filed May 2015)',
    summary: 'After a data breach exposed unencrypted patient records on an internet-accessible server, the insurer sought to deny coverage by invoking the policy\'s "failure to follow minimum required practices" exclusion — the same category of clause that now underlies most cyber applications\' detailed MFA/PAM control questionnaires.',
    sourceUrl: 'https://www.courtlistener.com/?q=%22Cottage+Health+System%22+%22Columbia+Casualty%22',
    lastVerified: '2026-07-31',
  },
  {
    id: 'travelers-ics',
    caseName: 'Travelers Property Casualty Co. of America v. International Control Services, Inc.',
    citation: 'No. 1:22-cv-02145 (C.D. Ill., filed 2022)',
    summary: 'Travelers sought to rescind a cyber policy, alleging the insured\'s application represented that multi-factor authentication was implemented on all remote access and email accounts when it allegedly was not — ahead of a ransomware incident. The dispute is widely cited as the case that made MFA attestations on the application itself, not just having MFA somewhere, underwriting-critical.',
    sourceUrl: 'https://www.courtlistener.com/?q=%22International+Control+Services%22+Travelers+multi-factor',
    lastVerified: '2026-07-31',
  },
]
