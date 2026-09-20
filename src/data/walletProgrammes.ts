/**
 * Global national/regional digital wallet programmes -- complements the
 * existing US-only `walletAdoptionTracker.ts` (state-by-state mDL rollout)
 * with a worldwide view, per NextGenIAM.md §4.4 / §6.5. Deliberately kept as
 * a separate file: `walletAdoptionTracker.ts` is imported by
 * StandardsExplorer.tsx and has its own test; this registry does not modify
 * or replace it. Feeds the Digital Wallets Center hub
 * (`/next-gen/digital-wallets`, tab `programmes`).
 * Each entry's `sourceLink` points at the programme's own official site or
 * government page. `confidence: 'partial'` marks entries corroborated only
 * by the programme operator's own reporting rather than an independent
 * second source. Refresh cadence: quarterly. Last reviewed: 2026-09-19.
 */
export type ProgrammeStatus = 'live' | 'pilot' | 'announced' | 'paused'
export type WalletTrustModel = 'government' | 'bank-backed' | 'private-federation' | 'mixed'
export type WalletRegion = 'EU' | 'North America' | 'APAC' | 'LATAM' | 'MEA' | 'Global'

export interface WalletProgramme {
  id: string
  name: string
  jurisdiction: string
  region: WalletRegion
  status: ProgrammeStatus
  trustModel: WalletTrustModel
  standardsProfile: string[]
  credentialTypes: string[]
  /** What a relying party must do to accept credentials from this programme. */
  relyingPartyNotes: string
  sourceLink: string
  verifiedDate: string
  confidence: 'confirmed' | 'partial'
}

export const WALLET_PROGRAMMES: WalletProgramme[] = [
  {
    id: 'eudi-wallet-eu',
    name: 'European Digital Identity Wallet (EUDI Wallet)',
    jurisdiction: 'European Union (all 27 member states)',
    region: 'EU',
    status: 'pilot',
    trustModel: 'government',
    standardsProfile: ['OpenID4VCI', 'OpenID4VP', 'ISO/IEC 18013-5 (mdoc)'],
    credentialTypes: ['Personal Identification Data (PID)', 'Qualified Electronic Attestations of Attributes (QEAA)', 'mobile Driving Licence'],
    relyingPartyNotes: 'Under Regulation (EU) 2024/1183, every member state must offer a compliant wallet by December 2026; regulated private-sector relying parties (banking, healthcare, telecoms, large platforms) must accept it from late 2027.',
    sourceLink: 'https://eur-lex.europa.eu/eli/reg/2024/1183/oj/eng',
    verifiedDate: '2026-09-19',
    confidence: 'confirmed',
  },
  {
    id: 'itsme-belgium',
    name: 'itsme',
    jurisdiction: 'Belgium',
    region: 'EU',
    status: 'live',
    trustModel: 'bank-backed',
    standardsProfile: ['OpenID Connect', 'eIDAS-notified scheme'],
    credentialTypes: ['National eID-linked identity assertion', 'Qualified electronic signature'],
    relyingPartyNotes: 'A bank-consortium-backed identity app widely used for both public and private sector authentication in Belgium; expected to evolve toward EUDI Wallet compatibility under eIDAS 2.0.',
    sourceLink: 'https://www.itsme-id.com/',
    verifiedDate: '2026-09-19',
    confidence: 'partial',
  },
  {
    id: 'bankid-nordics',
    name: 'BankID',
    jurisdiction: 'Sweden (and related national schemes in Norway, Denmark, Finland)',
    region: 'EU',
    status: 'live',
    trustModel: 'bank-backed',
    standardsProfile: ['SAML/OIDC federation (national profile)'],
    credentialTypes: ['Bank-issued identity assertion', 'Qualified electronic signature'],
    relyingPartyNotes: 'Bank-consortium-operated, extremely high domestic adoption for both banking and public-service authentication; a long-running example of bank-backed trust operating at national scale.',
    sourceLink: 'https://www.bankid.com/en/',
    verifiedDate: '2026-09-19',
    confidence: 'partial',
  },
  {
    id: 'singpass-singapore',
    name: 'Singpass (including Corppass for businesses)',
    jurisdiction: 'Singapore',
    region: 'APAC',
    status: 'live',
    trustModel: 'government',
    standardsProfile: ['OIDC-based national profile', 'Document Wallet (national scheme)'],
    credentialTypes: ['National digital identity assertion', 'MyInfo consented data-sharing attributes', 'Digital document wallet credentials', 'Corppass business identity (for organizations)'],
    relyingPartyNotes: 'Over 700 organizations and 2,000+ services integrate Singpass; Corppass is the direct organizational/business-wallet analogue within the same national scheme.',
    sourceLink: 'https://www.singpass.gov.sg/main/singpass-our-ndi/',
    verifiedDate: '2026-09-19',
    confidence: 'confirmed',
  },
  {
    id: 'digilocker-india',
    name: 'DigiLocker',
    jurisdiction: 'India',
    region: 'APAC',
    status: 'live',
    trustModel: 'government',
    standardsProfile: ['National issuer/requester gateway API (India Stack)'],
    credentialTypes: ['Government-issued document credentials (driving licence, vehicle registration, educational certificates)', 'Aadhaar-linked identity documents'],
    relyingPartyNotes: 'Legally equivalent to the original physical document under IT Act Rule 9A; document auto-fetch reliability varies significantly by issuer, so relying parties should verify specific document-type coverage before depending on it.',
    sourceLink: 'https://www.digilocker.gov.in/',
    verifiedDate: '2026-09-19',
    confidence: 'confirmed',
  },
  {
    id: 'e-estonia',
    name: 'e-Estonia / Estonian e-ID',
    jurisdiction: 'Estonia',
    region: 'EU',
    status: 'live',
    trustModel: 'government',
    standardsProfile: ['eIDAS-notified scheme', 'National PKI-based e-ID'],
    credentialTypes: ['National e-ID card / Mobile-ID', 'Qualified electronic signature'],
    relyingPartyNotes: 'One of the longest-running national digital identity programmes; a frequently-cited reference architecture for government-backed PKI identity at national scale.',
    sourceLink: 'https://e-estonia.com/',
    verifiedDate: '2026-09-19',
    confidence: 'partial',
  },
  {
    id: 'digital-id-australia',
    name: 'Digital ID (myGovID / Australian Digital ID System)',
    jurisdiction: 'Australia',
    region: 'APAC',
    status: 'live',
    trustModel: 'government',
    standardsProfile: ['Trusted Digital Identity Framework (TDIF)-accredited scheme'],
    credentialTypes: ['Government-verified identity assertion'],
    relyingPartyNotes: 'Operates under the national Digital ID legislative framework, with accreditation required for both government and eligible private-sector identity providers.',
    sourceLink: 'https://www.mygovid.gov.au/',
    verifiedDate: '2026-09-19',
    confidence: 'partial',
  },
  {
    id: 'nemid-mitid-denmark',
    name: 'MitID (successor to NemID)',
    jurisdiction: 'Denmark',
    region: 'EU',
    status: 'live',
    trustModel: 'government',
    standardsProfile: ['eIDAS-notified scheme'],
    credentialTypes: ['National digital identity assertion', 'Qualified electronic signature'],
    relyingPartyNotes: 'Near-universal domestic adoption for both public services and private-sector authentication (banking, e-commerce).',
    sourceLink: 'https://www.mitid.dk/en-gb/',
    verifiedDate: '2026-09-19',
    confidence: 'partial',
  },
  {
    id: 'aadhaar-india',
    name: 'Aadhaar',
    jurisdiction: 'India',
    region: 'APAC',
    status: 'live',
    trustModel: 'government',
    standardsProfile: ['Biometric + demographic national identity register (India Stack)'],
    credentialTypes: ['Aadhaar number-linked identity assertion', 'e-KYC authentication'],
    relyingPartyNotes: 'The identity substrate underlying DigiLocker and much of India\'s Digital Public Infrastructure stack; the world\'s largest biometric identity system by enrollment.',
    sourceLink: 'https://uidai.gov.in/',
    verifiedDate: '2026-09-19',
    confidence: 'confirmed',
  },
  {
    id: 'id-wallet-japan-mynumber',
    name: 'My Number Card digital ID (including smartphone-embedded credential)',
    jurisdiction: 'Japan',
    region: 'APAC',
    status: 'pilot',
    trustModel: 'government',
    standardsProfile: ['National PKI-based e-ID', 'Smartphone-embedded credential (in rollout)'],
    credentialTypes: ['National identity card credential', 'Health-insurance-linked credential'],
    relyingPartyNotes: 'Rollout of a smartphone-embedded version of the My Number Card credential (rather than the physical card alone) has been in progressive expansion; relying parties should confirm current coverage before depending on smartphone-based presentation.',
    sourceLink: 'https://www.digital.go.jp/en/policies/mynumber',
    verifiedDate: '2026-09-19',
    confidence: 'partial',
  },
  {
    id: 'us-mdl-multistate',
    name: 'US State Mobile Driver\'s License (mDL) Programmes',
    jurisdiction: 'United States (multiple states -- see walletAdoptionTracker.ts for the state-by-state detail)',
    region: 'North America',
    status: 'live',
    trustModel: 'government',
    standardsProfile: ['ISO/IEC 18013-5 (mdoc)'],
    credentialTypes: ['Mobile driver\'s license', 'State-issued digital ID'],
    relyingPartyNotes: 'Coverage and TSA acceptance vary by state; see walletAdoptionTracker.ts for the current state-by-state rollout status this registry deliberately does not duplicate.',
    sourceLink: 'https://www.aamva.org/topics/mobile-driver-license',
    verifiedDate: '2026-09-19',
    confidence: 'confirmed',
  },
  {
    id: 'digital-id-brazil-govbr',
    name: 'gov.br Digital Identity',
    jurisdiction: 'Brazil',
    region: 'LATAM',
    status: 'live',
    trustModel: 'government',
    standardsProfile: ['National single-sign-on identity platform'],
    credentialTypes: ['National digital identity assertion', 'CPF-linked identity credential'],
    relyingPartyNotes: 'Brazil\'s unified government digital-identity and service-access platform, widely used for both public services and increasingly for private-sector identity verification.',
    sourceLink: 'https://www.gov.br/governodigital/pt-br',
    verifiedDate: '2026-09-19',
    confidence: 'partial',
  },
]

export function getProgrammesByRegion(region: WalletRegion): WalletProgramme[] {
  return WALLET_PROGRAMMES.filter((p) => p.region === region)
}

export function getProgrammeById(id: string): WalletProgramme | undefined {
  return WALLET_PROGRAMMES.find((p) => p.id === id)
}
