/**
 * Organizations as credential holders -- the largest single content gap
 * identified in NextGenIAM.md §4.4: the portal's existing wallet labs are
 * all holder-as-a-person or verifier-centric; nothing teaches an
 * organization holding, delegating, and presenting its own credentials.
 * Feeds the Digital Wallets Center hub (`/next-gen/digital-wallets`, tab
 * `business-wallet`) and the Business Wallet Studio playground.
 * Standards context: eIDAS 2.0 / Regulation (EU) 2024/1183 explicitly
 * expands qualified electronic attestations of attributes (QEAA), which
 * extend naturally to organizational attributes, not just personal ones --
 * see https://eur-lex.europa.eu/eli/reg/2024/1183/oj/eng (verified
 * 2026-09-19, NextGenIAM.md §15).
 * Last reviewed: 2026-09-19.
 */
export type BusinessWalletRole = 'holder' | 'issuer' | 'verifier' | 'multiple'

export interface BusinessWalletUseCase {
  id: string
  title: string
  sector: string
  role: BusinessWalletRole
  problemToday: string
  walletApproach: string
  credentialTypes: string[]
  standardsProfile: string[]
  governanceChallenges: string[]
  businessValue: string
  relatedLabs: string[]
}

export const BUSINESS_WALLET_USE_CASES: BusinessWalletUseCase[] = [
  {
    id: 'company-registration-credential',
    title: 'Company Registration / Legal Entity Credential',
    sector: 'Cross-industry (B2B onboarding)',
    role: 'holder',
    problemToday: 'Proving a company\'s legal existence, registration number, and authorized signatories to a counterparty today means emailing PDF certificates that the counterparty must manually verify against a national registry -- slow, and easy to forge convincingly.',
    walletApproach: 'The company holds a verifiable legal-entity credential in an organizational wallet, issued by (or attested against) the national business registry, and presents it directly to a counterparty\'s verification system.',
    credentialTypes: ['Legal Entity Identifier (LEI)-linked credential', 'National business registration attestation'],
    standardsProfile: ['openid4vc', 'vc-did'],
    governanceChallenges: ['Who within the company controls the wallet holding this credential?', 'How is the credential re-verified as company status changes (e.g. deregistration, ownership change)?'],
    businessValue: 'Cuts B2B onboarding verification time from days of manual checking to a real-time cryptographic presentation.',
    relatedLabs: ['/playground/business-wallet', '/playground/vc-did'],
  },
  {
    id: 'trade-licence-attestation',
    title: 'Trade & Regulatory Licence Attestation',
    sector: 'Regulated industries (finance, healthcare, construction)',
    role: 'holder',
    problemToday: 'A regulated business must repeatedly prove it holds a valid trade licence to every partner, marketplace, or public body it deals with, often via manually-uploaded scanned certificates that go stale the moment the licence is renewed or revoked.',
    walletApproach: 'The regulator issues a verifiable licence credential directly into the business\'s organizational wallet; the business presents a live, freshness-checkable credential rather than a static document.',
    credentialTypes: ['Trade licence credential', 'Professional/regulatory authorization attestation'],
    standardsProfile: ['openid4vci', 'openid4vc'],
    governanceChallenges: ['Revocation must propagate immediately if a licence is suspended -- a stale cached credential is a compliance risk for whoever relies on it.', 'Multiple licences across jurisdictions need a consistent presentation model.'],
    businessValue: 'Removes manual licence-verification steps from every partner and marketplace relationship, and gives regulators a real-time channel for suspension/revocation.',
    relatedLabs: ['/playground/business-wallet', '/playground/credential-issuance'],
  },
  {
    id: 'employee-delegated-authority',
    title: 'Employee Delegated-Authority Credential',
    sector: 'Cross-industry',
    role: 'multiple',
    problemToday: 'When an employee needs to act "on behalf of the company" with a partner or public body (e.g. signing a shipment release, submitting a regulatory filing), authority today is usually proven with an email from a manager or a paper power-of-attorney -- neither of which is cryptographically verifiable or easy to revoke.',
    walletApproach: 'The organization issues a scoped, time-bound delegated-authority credential from its business wallet to a specific employee\'s personal or work wallet, naming exactly what that employee may do on the company\'s behalf.',
    credentialTypes: ['Delegated signing authority credential', 'Role-scoped authorization attestation'],
    standardsProfile: ['openid4vci', 'vc-did'],
    governanceChallenges: ['What happens to a live delegation when the employee leaves or changes role mid-task?', 'Multi-signer thresholds for high-value delegations need a model beyond a single credential.'],
    businessValue: 'Makes "who is actually authorized to act for the company right now" independently verifiable by any counterparty, instead of resting on trust in an email.',
    relatedLabs: ['/playground/business-wallet', '/playground/delegation-chain'],
  },
  {
    id: 'partner-supplier-onboarding',
    title: 'Partner / Supplier Onboarding Attestation',
    sector: 'Supply chain, manufacturing, retail',
    role: 'multiple',
    problemToday: 'Onboarding a new supplier or partner requires collecting and manually re-verifying the same set of compliance documents (insurance, certifications, security attestations) that the supplier has usually already proven to other customers.',
    walletApproach: 'A supplier holds reusable compliance credentials in its organizational wallet, issued once by a certifying body or a prior customer\'s verification process, and presents them to each new partner without re-proving from scratch.',
    credentialTypes: ['Insurance-coverage attestation', 'Security/compliance certification credential', 'ESG or quality-standard attestation'],
    standardsProfile: ['openid4vc', 'vc-did'],
    governanceChallenges: ['Trust in the original issuer must transfer meaningfully to a new relying party -- a trust registry is needed to avoid every verifier re-inventing its own trust list.'],
    businessValue: 'Turns onboarding compliance verification from a repeated, per-relationship manual process into a reusable, cryptographically-checkable one.',
    relatedLabs: ['/playground/business-wallet', '/playground/trust-registry'],
  },
  {
    id: 'supply-chain-provenance',
    title: 'Supply-Chain Provenance Attestation',
    sector: 'Manufacturing, pharmaceuticals, food & beverage',
    role: 'multiple',
    problemToday: 'Proving where a component or ingredient actually came from, and that every intermediate handler was authorized and compliant, today depends on a paper trail that is difficult to verify end-to-end and easy to break at any single weak link.',
    walletApproach: 'Each organization in the chain issues and holds a verifiable provenance credential for the goods it handles, chained together so a final verifier can check the entire custody path cryptographically rather than trusting the last party\'s word.',
    credentialTypes: ['Chain-of-custody attestation', 'Origin/authenticity credential'],
    standardsProfile: ['openid4vc', 'vc-did'],
    governanceChallenges: ['Every organization in the chain must actually operate a wallet and issue credentials consistently -- a single non-participating link breaks the chain\'s verifiability.'],
    businessValue: 'Gives an end verifier (a retailer, a regulator, a consumer-facing app) a cryptographically checkable provenance chain instead of an unverifiable paper trail.',
    relatedLabs: ['/playground/business-wallet', '/playground/vc-did'],
  },
  {
    id: 'b2b-know-your-business',
    title: 'B2B Know-Your-Business (KYB) Verification',
    sector: 'Financial services, marketplaces, payment platforms',
    role: 'verifier',
    problemToday: 'Onboarding a new business customer for banking or payment services requires the bank to independently verify beneficial ownership, registration, and standing -- a slow, manual due-diligence process repeated by every institution the business deals with.',
    walletApproach: 'The business presents verifiable credentials (legal-entity, beneficial-ownership attestation) directly from its organizational wallet, letting the relying financial institution verify cryptographically rather than re-run manual checks from scratch.',
    credentialTypes: ['Beneficial-ownership attestation', 'Legal Entity Identifier (LEI)-linked credential'],
    standardsProfile: ['openid4vc', 'vc-did'],
    governanceChallenges: ['The verifier must be confident the issuer of the beneficial-ownership attestation is itself trustworthy and current -- stale ownership data is a real compliance risk.'],
    businessValue: 'Reduces KYB onboarding time and duplicated due-diligence cost across every financial relationship a business maintains.',
    relatedLabs: ['/playground/business-wallet', '/playground/federated-vp'],
  },
  {
    id: 'workforce-professional-qualification',
    title: 'Workforce Professional Qualification Credential',
    sector: 'Healthcare, engineering, skilled trades',
    role: 'issuer',
    problemToday: 'An employer or licensing body issuing professional qualifications to its workforce (e.g. certified welders, licensed clinicians) has no efficient way for that qualification to be independently verified by a different employer or a regulator without contacting the original issuer directly.',
    walletApproach: 'The certifying organization issues a verifiable professional-qualification credential directly into each qualified worker\'s wallet, checkable by any relying party without contacting the issuer for every verification.',
    credentialTypes: ['Professional certification credential', 'Continuing-education/renewal attestation'],
    standardsProfile: ['openid4vci', 'openid4vc'],
    governanceChallenges: ['Renewal and continuing-education requirements must be reflected as credential updates or expirations, not left as a one-time issuance.'],
    businessValue: 'Lets a qualified worker\'s credentials travel with them across employers without each new employer re-verifying from the original issuer manually.',
    relatedLabs: ['/playground/credential-issuance', '/playground/business-wallet'],
  },
  {
    id: 'cross-border-org-identity',
    title: 'Cross-Border Organizational Identity',
    sector: 'Multinational enterprises, cross-border trade',
    role: 'multiple',
    problemToday: 'A multinational organization must prove its identity and standing differently in every jurisdiction it operates in, with no single credential recognized across borders, forcing duplicated registration and verification effort per country.',
    walletApproach: 'An organization holds jurisdiction-specific credentials in a single business wallet, presenting the correct one per relying party while maintaining one coherent internal identity record across all of them -- directly relevant to the EUDI Wallet\'s explicit cross-border design goal under eIDAS 2.0.',
    credentialTypes: ['Jurisdiction-specific legal-entity credential', 'Cross-border trade authorization attestation'],
    standardsProfile: ['openid4vc', 'eidas2-arf'],
    governanceChallenges: ['Reconciling different national trust frameworks and credential formats within a single organizational wallet.'],
    businessValue: 'Reduces the operational overhead of maintaining separate, disconnected identity proofs per jurisdiction.',
    relatedLabs: ['/playground/business-wallet', '/playground/federated-vp'],
  },
]

export function getUseCasesByRole(role: BusinessWalletRole): BusinessWalletUseCase[] {
  return BUSINESS_WALLET_USE_CASES.filter((u) => u.role === role)
}

export function getUseCaseById(id: string): BusinessWalletUseCase | undefined {
  return BUSINESS_WALLET_USE_CASES.find((u) => u.id === id)
}
