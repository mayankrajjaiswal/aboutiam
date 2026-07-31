export type GamingScenarioId = 'account_linking' | 'smurf_detection' | 'wagering_kyc'

export interface GamingSignal {
  id: string
  label: string
  description: string
}

export interface GamingScenario {
  id: GamingScenarioId
  title: string
  narrative: string
  signals: GamingSignal[]
}

export const GAMING_IDENTITY_SCENARIOS: GamingScenario[] = [
  {
    id: 'account_linking',
    title: 'Cross-Platform Account Linking & Ban Propagation',
    narrative:
      'A player links a console account, a PC launcher account, and a mobile account into one persistent underlying identity. When that identity is banned, the ban should propagate to every linked platform account at once — "ban the person, not just the account."',
    signals: [
      { id: 'console_linked', label: 'Console account linked', description: 'A PlayStation/Xbox account is linked to the underlying identity.' },
      { id: 'pc_linked', label: 'PC launcher account linked', description: 'A Steam/Epic-style launcher account is linked to the underlying identity.' },
      { id: 'mobile_linked', label: 'Mobile account linked', description: 'A mobile platform account is linked to the underlying identity.' },
      { id: 'ban_issued', label: 'Ban issued on the underlying identity', description: 'A moderator bans the persistent identity itself, not one platform account.' },
    ],
  },
  {
    id: 'smurf_detection',
    title: 'Smurf & Ban-Evasion Detection',
    narrative:
      'A fresh account appears shortly after a ban. Device-fingerprint and behavioral-pattern signals (hardware ID, mouse/input cadence) are correlated against the banned account to produce a confidence score that the new account is the same person evading the ban.',
    signals: [
      { id: 'device_fingerprint_match', label: 'Device fingerprint matches a banned account', description: 'Hardware ID / GPU-canvas fingerprint matches a previously banned account.' },
      { id: 'behavioral_pattern_match', label: 'Behavioral pattern matches a banned account', description: 'Mouse/input cadence and timing pattern statistically matches a banned account.' },
      { id: 'fresh_account_after_ban', label: 'Account created shortly after a ban', description: 'This account was created within a short window after a related ban.' },
    ],
  },
  {
    id: 'wagering_kyc',
    title: 'Continuous Wagering KYC',
    narrative:
      'A real-money wagering platform cannot rely on a one-time identity check at signup. Risk signals occurring later in the session (a large withdrawal, a new device, a geolocation change) each independently re-trigger identity verification.',
    signals: [
      { id: 'large_withdrawal', label: 'Large withdrawal requested', description: 'A withdrawal well above the account\'s typical pattern was requested.' },
      { id: 'new_device', label: 'New / unrecognized device', description: 'The session is from a device never seen on this account before.' },
      { id: 'geo_change', label: 'Geolocation change', description: 'The session\'s geolocation changed materially since the last verified session.' },
    ],
  },
]

export interface GamingOutcome {
  triggered: boolean
  headline: string
  detail: string
  /** Only populated for the smurf_detection scenario. */
  confidence?: number
}

/** Per-signal contribution toward the smurf/ban-evasion confidence score (0-100). */
const SMURF_SIGNAL_WEIGHTS: Record<string, number> = {
  device_fingerprint_match: 45,
  behavioral_pattern_match: 35,
  fresh_account_after_ban: 20,
}
const SMURF_CONFIDENCE_THRESHOLD = 55

const LINKABLE_PLATFORM_SIGNALS = ['console_linked', 'pc_linked', 'mobile_linked']
const WAGERING_RISK_SIGNALS = ['large_withdrawal', 'new_device', 'geo_change']

/**
 * Deterministic outcome evaluator — every documented signal combination always
 * produces the same outcome, no randomness. See gamingIdentityScenarios.test.ts
 * for the planted signal sets and their expected outcomes.
 */
export function evaluateGamingScenario(scenarioId: GamingScenarioId, enabledSignalIds: string[]): GamingOutcome {
  const enabled = new Set(enabledSignalIds)

  if (scenarioId === 'account_linking') {
    const linkedCount = LINKABLE_PLATFORM_SIGNALS.filter((id) => enabled.has(id)).length
    const banIssued = enabled.has('ban_issued')

    if (banIssued && linkedCount > 0) {
      return {
        triggered: true,
        headline: `Ban propagated to ${linkedCount} linked platform account${linkedCount > 1 ? 's' : ''}`,
        detail: 'The underlying identity is banned, not just one account — every linked platform account is banned in the same action.',
      }
    }
    if (banIssued) {
      return {
        triggered: false,
        headline: 'Ban issued, but no accounts are linked',
        detail: 'Nothing to propagate to yet — only the single unlinked account is affected.',
      }
    }
    return {
      triggered: false,
      headline: 'No ban issued',
      detail: 'Linking is in effect, but there is nothing to enforce until a ban is actually issued.',
    }
  }

  if (scenarioId === 'smurf_detection') {
    const confidence = Object.entries(SMURF_SIGNAL_WEIGHTS).reduce(
      (sum, [id, weight]) => sum + (enabled.has(id) ? weight : 0),
      0
    )
    const triggered = confidence >= SMURF_CONFIDENCE_THRESHOLD
    return {
      triggered,
      confidence,
      headline: triggered
        ? `Flagged as likely ban evasion (${confidence}% confidence)`
        : `Not flagged as evasion (${confidence}% confidence)`,
      detail: triggered
        ? 'Enough independent signals correlate with the banned account to flag this as a likely evasion attempt.'
        : 'Too few independent signals correlate with a banned account to confidently flag this as evasion.',
    }
  }

  // wagering_kyc
  const triggeringSignals = WAGERING_RISK_SIGNALS.filter((id) => enabled.has(id))
  const triggered = triggeringSignals.length > 0
  return {
    triggered,
    headline: triggered ? 'Re-verification required' : 'No re-verification required',
    detail: triggered
      ? `${triggeringSignals.length} risk signal(s) detected — continuous KYC re-triggers verification instead of trusting the original one-time check.`
      : 'No risk signals detected since the last verified session — no re-check required yet.',
  }
}
