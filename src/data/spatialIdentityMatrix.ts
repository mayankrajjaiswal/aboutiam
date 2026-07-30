// A10: Avatar & Spatial Identity Verification Lab. A headset-only VR/AR
// context has no front-facing camera and is often a shared device, so the
// liveness techniques modeled in livenessAttackMatrix.ts don't map cleanly.
// This matrix contrasts two very different verification strategies against
// the risk scenarios unique to that context: a one-time wallet-based
// cryptographic attestation (proves a *credential claim*, e.g. age, but not
// who is physically wearing the headset right now) versus passive continuous
// behavioral/gesture telemetry (proves *continuous physical presence*, but a
// pure signature-similarity check can itself be fooled by replaying a
// legitimate user's own recorded motion capture — the same "replay" gap
// livenessAttackMatrix.ts documents for flash-challenge liveness).

export type SpatialIdentityRisk =
  | 'shared-headset-handoff'
  | 'unattended-session-takeover'
  | 'motion-capture-replay-bot'
  | 'credential-lending'

export type SpatialIdentityDefense =
  | 'none'
  | 'wallet-attestation'
  | 'continuous-behavioral'
  | 'challenge-response'

export interface SpatialIdentityRiskInfo {
  id: SpatialIdentityRisk
  label: string
  description: string
}

export interface SpatialIdentityDefenseInfo {
  id: SpatialIdentityDefense
  label: string
  description: string
}

export interface SpatialIdentityOutcome {
  risk: SpatialIdentityRisk
  defense: SpatialIdentityDefense
  stopped: boolean
  explanation: string
}

export const SPATIAL_IDENTITY_RISKS: SpatialIdentityRiskInfo[] = [
  {
    id: 'shared-headset-handoff',
    label: 'Mid-Session Handoff',
    description: 'An adult authenticates, then hands the shared headset to a minor partway through the session.',
  },
  {
    id: 'unattended-session-takeover',
    label: 'Unattended Session Takeover',
    description: 'A headset is left logged in and idle in a public VR lounge; a stranger puts it on and continues the session.',
  },
  {
    id: 'motion-capture-replay-bot',
    label: 'Motion-Capture Replay Bot',
    description: "A scripted bot replays a legitimate user's previously recorded hand/head motion capture to mimic their gesture signature with no live human present.",
  },
  {
    id: 'credential-lending',
    label: 'Credential Lending',
    description: 'A user deliberately hands their headset — already holding a validly issued age/identity credential — to someone else, e.g. an older sibling logging in for a younger one.',
  },
]

export const SPATIAL_IDENTITY_DEFENSES: SpatialIdentityDefenseInfo[] = [
  {
    id: 'none',
    label: 'No Verification',
    description: 'Baseline: the headset trusts whoever is wearing it for the entire session.',
  },
  {
    id: 'wallet-attestation',
    label: 'Wallet-Based Age Attestation',
    description: 'A verifiable credential (e.g. mobile driving license / age-over-18 VC) is presented once at session start via a cryptographic wallet.',
  },
  {
    id: 'continuous-behavioral',
    label: 'Continuous Behavioral Telemetry',
    description: "Passive gait, hand-tremor, and head-motion signature matching against an enrolled baseline, re-checked throughout the session.",
  },
  {
    id: 'challenge-response',
    label: 'Wallet Attestation + Live Challenge-Response',
    description: 'Combines the one-time wallet attestation with periodic randomized live physical prompts (e.g. "mirror this gesture") that recorded motion cannot answer.',
  },
]

export const SPATIAL_IDENTITY_MATRIX: SpatialIdentityOutcome[] = [
  // shared-headset-handoff
  {
    risk: 'shared-headset-handoff',
    defense: 'none',
    stopped: false,
    explanation: 'No control exists to notice the wearer changed.',
  },
  {
    risk: 'shared-headset-handoff',
    defense: 'wallet-attestation',
    stopped: false,
    explanation: 'The credential was checked once at login. Nothing re-validates who is wearing the headset after that — the minor inherits the already-attested session.',
  },
  {
    risk: 'shared-headset-handoff',
    defense: 'continuous-behavioral',
    stopped: true,
    explanation: "The new wearer's gait/hand-tremor/head-motion signature drifts from the enrolled baseline immediately, triggering a re-authentication prompt.",
  },
  {
    risk: 'shared-headset-handoff',
    defense: 'challenge-response',
    stopped: true,
    explanation: 'Even if passive drift detection is slow to trigger, the next randomized "mirror this gesture" prompt catches the new wearer at the following challenge interval.',
  },
  // unattended-session-takeover
  {
    risk: 'unattended-session-takeover',
    defense: 'none',
    stopped: false,
    explanation: 'No control exists to notice the wearer changed.',
  },
  {
    risk: 'unattended-session-takeover',
    defense: 'wallet-attestation',
    stopped: false,
    explanation: 'The credential check happened at login, long before the takeover. A one-time check has no visibility into what happens mid-session.',
  },
  {
    risk: 'unattended-session-takeover',
    defense: 'continuous-behavioral',
    stopped: true,
    explanation: "The stranger's motion signature diverges from the enrolled baseline, and the session is paused pending re-authentication.",
  },
  {
    risk: 'unattended-session-takeover',
    defense: 'challenge-response',
    stopped: true,
    explanation: 'The stranger cannot satisfy the enrolled physical response pattern to a randomized live prompt.',
  },
  // motion-capture-replay-bot
  {
    risk: 'motion-capture-replay-bot',
    defense: 'none',
    stopped: false,
    explanation: 'No control exists to notice the motion is a replay.',
  },
  {
    risk: 'motion-capture-replay-bot',
    defense: 'wallet-attestation',
    stopped: false,
    explanation: 'Attestation proves a credential claim, not that a live human is currently in control. A bot replaying motion never has to touch the wallet layer at all.',
  },
  {
    risk: 'motion-capture-replay-bot',
    defense: 'continuous-behavioral',
    stopped: false,
    explanation: "The doc's central contrast case: a passive signature-similarity model matches the enrolled user's own recorded motion capture just fine when it is replayed — the same 'replay defeats a static check' gap flash-challenge liveness has against camera-injection.",
  },
  {
    risk: 'motion-capture-replay-bot',
    defense: 'challenge-response',
    stopped: true,
    explanation: "The bot cannot predict or answer an unpredictable, randomized live prompt from a fixed pre-recorded motion track.",
  },
  // credential-lending
  {
    risk: 'credential-lending',
    defense: 'none',
    stopped: false,
    explanation: 'No control exists to notice the wearer changed.',
  },
  {
    risk: 'credential-lending',
    defense: 'wallet-attestation',
    stopped: false,
    explanation: 'The credential itself is valid and was legitimately issued to the original holder. A presentation check has no way to know who is physically wearing the headset when it is presented.',
  },
  {
    risk: 'credential-lending',
    defense: 'continuous-behavioral',
    stopped: true,
    explanation: "The borrower's gesture/gait signature does not match the credential holder's enrolled baseline, flagging the mismatch even though the credential itself checks out.",
  },
  {
    risk: 'credential-lending',
    defense: 'challenge-response',
    stopped: true,
    explanation: 'The borrower fails to reproduce the enrolled physical response pattern to the live challenge.',
  },
]

export function getSpatialIdentityOutcome(
  risk: SpatialIdentityRisk,
  defense: SpatialIdentityDefense,
): SpatialIdentityOutcome | undefined {
  return SPATIAL_IDENTITY_MATRIX.find((o) => o.risk === risk && o.defense === defense)
}
