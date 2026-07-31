export type MdlStatus = 'live' | 'pilot' | 'paused' | 'none'

export interface WalletAdoptionEntry {
  state: string
  mdlStatus: MdlStatus
  tsaAccepted: boolean
  walletSupport: string[]
  sourceLink: string
  /** ISO date this entry was last checked against its source — refresh quarterly. */
  verifiedDate: string
}

/**
 * US state-by-state mobile driver's license (mDL) rollout status — a
 * hand-curated registry in the same spirit as complianceDeadlines.ts, but
 * tracking consumer *adoption* (who's actually live today) rather than
 * *regulatory dates*. Complements the OpenID4VC Wallet Studio playground's
 * issuance mechanics with real-world rollout context. Refresh quarterly.
 * Last reviewed: 2026-07-31.
 */
export const WALLET_ADOPTION_TRACKER: WalletAdoptionEntry[] = [
  {
    state: 'Arizona',
    mdlStatus: 'live',
    tsaAccepted: true,
    walletSupport: ['Apple Wallet', 'Google Wallet'],
    sourceLink: 'https://azdot.gov/mvd/services/mobile-id',
    verifiedDate: '2026-07-31',
  },
  {
    state: 'Colorado',
    mdlStatus: 'live',
    tsaAccepted: true,
    walletSupport: ['Apple Wallet', 'myColorado app'],
    sourceLink: 'https://mycolorado.state.co.us/',
    verifiedDate: '2026-07-31',
  },
  {
    state: 'Georgia',
    mdlStatus: 'live',
    tsaAccepted: true,
    walletSupport: ['Apple Wallet', 'Google Wallet', 'Georgia Digital ID app'],
    sourceLink: 'https://dds.georgia.gov/georgia-digital-drivers-license',
    verifiedDate: '2026-07-31',
  },
  {
    state: 'Maryland',
    mdlStatus: 'live',
    tsaAccepted: true,
    walletSupport: ['Apple Wallet', 'Google Wallet'],
    sourceLink: 'https://mva.maryland.gov/mdMOBILEID',
    verifiedDate: '2026-07-31',
  },
  {
    state: 'California',
    mdlStatus: 'pilot',
    tsaAccepted: false,
    walletSupport: ['CA DMV Wallet app'],
    sourceLink: 'https://www.dmv.ca.gov/portal/driver-licenses-identification-cards/california-mobile-id/',
    verifiedDate: '2026-07-31',
  },
  {
    state: 'New York',
    mdlStatus: 'pilot',
    tsaAccepted: false,
    walletSupport: ['NY Mobile ID app'],
    sourceLink: 'https://dmv.ny.gov/id-card/mobile-id',
    verifiedDate: '2026-07-31',
  },
  {
    state: 'Texas',
    mdlStatus: 'pilot',
    tsaAccepted: false,
    walletSupport: ['Texas by Texas (TxT) app'],
    sourceLink: 'https://txdps.texas.gov/DriverLicense/mobiledriverlicense',
    verifiedDate: '2026-07-31',
  },
  {
    state: 'Florida',
    mdlStatus: 'pilot',
    tsaAccepted: false,
    walletSupport: ['FL Smart ID app'],
    sourceLink: 'https://www.flhsmv.gov/mobile-drivers-license/',
    verifiedDate: '2026-07-31',
  },
  {
    state: 'Illinois',
    mdlStatus: 'none',
    tsaAccepted: false,
    walletSupport: [],
    sourceLink: 'https://www.ilsos.gov/departments/drivers/dl_id/home.html',
    verifiedDate: '2026-07-31',
  },
  {
    state: 'Pennsylvania',
    mdlStatus: 'none',
    tsaAccepted: false,
    walletSupport: [],
    sourceLink: 'https://www.dmv.pa.gov/',
    verifiedDate: '2026-07-31',
  },
]

export function getWalletAdoptionEntry(state: string): WalletAdoptionEntry | undefined {
  return WALLET_ADOPTION_TRACKER.find((e) => e.state === state)
}
