export type CaepEventType = 'session-revoked' | 'device-compliance-changed' | 'ip-address-changed' | 'token-claims-changed'

export interface CaepEventDefinition {
  type: CaepEventType
  label: string
  schemaUri: string
  description: string
}

export const CAEP_EVENT_TYPES: CaepEventDefinition[] = [
  {
    type: 'session-revoked',
    label: 'Session Revoked',
    schemaUri: 'https://schemas.openid.net/secevent/caep/event-type/session-revoked',
    description: 'The IdP has terminated the user\'s session (logout, admin action, or a detected compromise) and every relying party should end its own local session immediately.'
  },
  {
    type: 'device-compliance-changed',
    label: 'Device Compliance Changed',
    schemaUri: 'https://schemas.openid.net/secevent/caep/event-type/device-compliance-changed',
    description: 'The device the user is signed in from just fell out of compliance (disk encryption disabled, jailbroken, EDR agent stopped reporting).'
  },
  {
    type: 'ip-address-changed',
    label: 'IP Address Changed',
    schemaUri: 'https://schemas.openid.net/secevent/caep/event-type/ip-address-changed',
    description: 'The session\'s observed IP address changed mid-session — potentially a sign of session hijacking or a legitimate network change.'
  },
  {
    type: 'token-claims-changed',
    label: 'Token Claims Changed',
    schemaUri: 'https://schemas.openid.net/secevent/caep/event-type/token-claims-change',
    description: 'A claim the relying party relied on (e.g. group membership, role) changed at the IdP and previously-issued tokens no longer reflect reality.'
  }
]

export interface CaepSubscriber {
  id: string
  name: string
  subscribedEventTypes: CaepEventType[]
  simulatedLatencyMs: number
  enforcement: Partial<Record<CaepEventType, string>>
}

export const CAEP_SUBSCRIBERS: CaepSubscriber[] = [
  {
    id: 'rp-slack',
    name: 'Slack (RP-1)',
    subscribedEventTypes: ['session-revoked', 'device-compliance-changed'],
    simulatedLatencyMs: 220,
    enforcement: {
      'session-revoked': 'Revoked the active session and forced re-authentication.',
      'device-compliance-changed': 'Blocked file downloads until the device is compliant again.'
    }
  },
  {
    id: 'rp-salesforce',
    name: 'Salesforce (RP-2)',
    subscribedEventTypes: ['session-revoked', 'ip-address-changed'],
    simulatedLatencyMs: 340,
    enforcement: {
      'session-revoked': 'Revoked the active session immediately.',
      'ip-address-changed': 'Flagged the session as high-risk and required step-up MFA.'
    }
  },
  {
    id: 'rp-aws',
    name: 'AWS Console (RP-3)',
    subscribedEventTypes: ['session-revoked'],
    simulatedLatencyMs: 180,
    enforcement: {
      'session-revoked': 'Revoked all active IAM role sessions for the user.'
    }
  },
  {
    id: 'rp-github',
    name: 'GitHub (RP-4)',
    subscribedEventTypes: ['token-claims-changed', 'ip-address-changed'],
    simulatedLatencyMs: 260,
    enforcement: {
      'token-claims-changed': 'Re-evaluated org/team membership before allowing the next API call.',
      'ip-address-changed': 'Sent a "new sign-in location" security alert email.'
    }
  }
]
