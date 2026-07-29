export type RfpCategory = 'Security & Compliance' | 'Integration' | 'TCO' | 'Implementation Risk'

export interface RfpQuestion {
  id: string
  category: RfpCategory
  question: string
  /** Capability tags that pull this question in (e.g. 'sso', 'mfa', 'pam', 'iga', 'ciam'). Empty array = always included (a baseline/mandatory question). */
  applicableCapabilities: string[]
  /** If set, only included when the answered org size is in this list. Omitted = applies to every org size. */
  applicableOrgSizes?: ('Small' | 'Mid-Market' | 'Enterprise')[]
  /** EXPLORE_PRODUCTS ids known to support this capability — cross-referenced in tests to catch typos/removed products. */
  relatedVendorIds?: string[]
}

export const RFP_QUESTION_BANK: RfpQuestion[] = [
  // --- Security & Compliance (baseline, always included) ---
  {
    id: 'sec-baseline-cert',
    category: 'Security & Compliance',
    question: 'Which independent security certifications does your platform currently hold (SOC 2 Type II, ISO 27001, FedRAMP)?',
    applicableCapabilities: [],
  },
  {
    id: 'sec-baseline-breach-notify',
    category: 'Security & Compliance',
    question: 'What is your contractual breach-notification SLA, and has it been formally tested during an actual incident?',
    applicableCapabilities: [],
  },
  {
    id: 'sec-baseline-data-residency',
    category: 'Security & Compliance',
    question: 'What data residency and cross-border data transfer guarantees can you provide in writing?',
    applicableCapabilities: [],
  },
  // --- Security & Compliance (capability-specific) ---
  {
    id: 'sec-mfa-phishing-resistant',
    category: 'Security & Compliance',
    question: 'Do you support phishing-resistant authentication (FIDO2/WebAuthn passkeys), and can it be enforced org-wide via policy?',
    applicableCapabilities: ['mfa'],
    relatedVendorIds: ['okta-workforce', 'entra-id', 'ping-identity'],
  },
  {
    id: 'sec-pam-session-recording',
    category: 'Security & Compliance',
    question: 'Do you support session recording and just-in-time credential checkout for privileged access, with tamper-evident audit logs?',
    applicableCapabilities: ['pam'],
    relatedVendorIds: ['cyberark', 'beyondtrust', 'teleport'],
  },
  {
    id: 'sec-iga-sod',
    category: 'Security & Compliance',
    question: 'Can the platform detect and enforce Separation-of-Duties (SoD) conflicts automatically during access certification campaigns?',
    applicableCapabilities: ['iga'],
  },
  {
    id: 'sec-ciam-consent',
    category: 'Security & Compliance',
    question: 'How is customer consent tracked and revocable in a way that satisfies GDPR/CCPA data-subject-rights requests?',
    applicableCapabilities: ['ciam'],
    relatedVendorIds: ['workos', 'frontegg'],
  },

  // --- Integration (baseline) ---
  {
    id: 'int-baseline-protocols',
    category: 'Integration',
    question: 'Which standard protocols (OIDC, SAML 2.0, SCIM 2.0) do you support natively without a custom connector?',
    applicableCapabilities: [],
  },
  {
    id: 'int-baseline-api',
    category: 'Integration',
    question: 'Do you expose a documented, rate-limited management API for programmatic user/policy administration?',
    applicableCapabilities: [],
  },
  // --- Integration (capability-specific) ---
  {
    id: 'int-sso-legacy',
    category: 'Integration',
    question: 'Can you front a legacy, non-federation-aware application (header-based or basic-auth) with SSO without requiring app code changes?',
    applicableCapabilities: ['sso'],
    relatedVendorIds: ['ping-identity', 'entra-id'],
  },
  {
    id: 'int-iga-hr-source',
    category: 'Integration',
    question: 'Which HR-of-record systems (Workday, SAP SuccessFactors) do you have a certified, pre-built connector for?',
    applicableCapabilities: ['iga'],
  },

  // --- TCO (baseline) ---
  {
    id: 'tco-baseline-pricing',
    category: 'TCO',
    question: 'Provide a complete, itemized pricing model including per-seat cost, implementation fees, and any premium-feature add-on costs.',
    applicableCapabilities: [],
  },
  {
    id: 'tco-baseline-overage',
    category: 'TCO',
    question: 'What happens contractually if actual seat/API-call usage exceeds the contracted volume mid-term?',
    applicableCapabilities: [],
  },
  {
    id: 'tco-enterprise-volume',
    category: 'TCO',
    question: 'What volume-discount tiers are available at our organization\'s scale, and are they contractually locked for the full term?',
    applicableCapabilities: [],
    applicableOrgSizes: ['Enterprise'],
  },

  // --- Implementation Risk (baseline) ---
  {
    id: 'impl-baseline-timeline',
    category: 'Implementation Risk',
    question: 'What is a realistic, referenceable implementation timeline for an organization of our size and complexity?',
    applicableCapabilities: [],
  },
  {
    id: 'impl-baseline-migration',
    category: 'Implementation Risk',
    question: 'What is your standard approach and tooling for migrating existing users/credentials without forcing a mass password reset?',
    applicableCapabilities: [],
  },
  {
    id: 'impl-small-support',
    category: 'Implementation Risk',
    question: 'What implementation support is included at no extra cost for a team without a dedicated identity engineering function?',
    applicableCapabilities: [],
    applicableOrgSizes: ['Small'],
  },
]
