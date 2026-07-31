export type IncidentOutcomeId = 'contained-fast' | 'contained-slow' | 'breach-escalated' | 'compliance-failure'

export interface IncidentDecision {
  label: string
  /** Either another node's `id`, or `outcome:<IncidentOutcomeId>` to terminate the scenario. */
  next: string
}

export interface IncidentNode {
  id: string
  prompt: string
  decisions: IncidentDecision[]
}

export interface IncidentOutcomeDef {
  title: string
  postMortem: string
}

export interface IncidentScenario {
  id: string
  title: string
  /** Cross-reference to the real-world incident this is built from (see src/data/bulletinsData.ts). */
  bulletinId: string
  briefing: string
  startNodeId: string
  nodes: IncidentNode[]
  outcomes: Record<IncidentOutcomeId, IncidentOutcomeDef>
}

/**
 * Branching-tree incident-commander scenarios built from existing BULLETINS
 * incidents (reuse discipline — same source data the Tabletop Exercise
 * Generator already consumes). Every node's decisions point at either
 * another node id or `outcome:<id>`, and every path terminates within 3
 * decisions — see incidentCommanderScenarios.test.ts for the connectivity
 * invariant.
 */
export const INCIDENT_COMMANDER_SCENARIOS: IncidentScenario[] = [
  {
    id: 'golden-saml',
    title: 'The 2 AM Break-Glass Login',
    bulletinId: 'golden_saml',
    briefing:
      'You are on-call SecOps. A SIEM alert fires: a break-glass admin account just completed SSO login outside business hours, with no MFA challenge recorded.',
    startNodeId: 'alert',
    nodes: [
      {
        id: 'alert',
        prompt: 'The break-glass admin session is active right now. What do you do first?',
        decisions: [
          { label: "Revoke the admin's active session and force a credential reset", next: 'more-logins' },
          { label: 'Assume the SIEM rule is noisy and log it for review during business hours', next: 'outcome:breach-escalated' },
        ],
      },
      {
        id: 'more-logins',
        prompt: 'The session is killed, but new SSO logins keep succeeding for other admin accounts — again with no MFA challenge.',
        decisions: [
          { label: "Investigate the SAML assertion issuance path — check the federation server's token-signing certificate", next: 'signing-key-compromised' },
          { label: 'Force a password reset for every user in the organization', next: 'outcome:contained-slow' },
        ],
      },
      {
        id: 'signing-key-compromised',
        prompt: "You confirm it: the on-prem federation server's private token-signing certificate has likely been exfiltrated — the attacker is forging valid SAML assertions offline (a Golden SAML forgery), completely bypassing MFA and conditional access.",
        decisions: [
          { label: 'Rotate the signing certificate immediately and force every relying party to re-establish federation trust', next: 'outcome:contained-fast' },
          { label: 'Disable the specific compromised admin accounts and keep monitoring', next: 'outcome:breach-escalated' },
        ],
      },
    ],
    outcomes: {
      'contained-fast': {
        title: 'Contained — Fast',
        postMortem:
          'Rotating the compromised signing certificate is the only action that actually stops a Golden SAML attack: as long as the old key is valid, the attacker can forge an assertion for any user, on any relying party, without ever touching a password or MFA prompt.',
      },
      'contained-slow': {
        title: 'Contained — Slow',
        postMortem:
          "Password resets do nothing against a Golden SAML forgery — the attacker never needed a password. The breach continues until someone eventually finds and rotates the signing key, which is exactly what happened in the real SolarWinds/Nobelium incident this scenario is based on.",
      },
      'breach-escalated': {
        title: 'Breach Escalated',
        postMortem:
          'Disabling individual accounts (or ignoring the alert entirely) leaves the real root cause — a stolen signing key — untouched. The attacker simply forges a fresh assertion for a different account and continues.',
      },
      'compliance-failure': {
        title: 'Compliance Failure',
        postMortem: 'Not reached in this scenario.',
      },
    },
  },
  {
    id: 'mfa-push-fatigue',
    title: 'Twenty Push Notifications Before Sunrise',
    bulletinId: 'mfa_fatigue',
    briefing:
      'Help desk escalates: a VIP executive received roughly 20 MFA push notifications between 2 AM and 2:10 AM, and finally approved one out of frustration to make them stop.',
    startNodeId: 'first-response',
    nodes: [
      {
        id: 'first-response',
        prompt: "The executive's account may already be compromised. What's your first move?",
        decisions: [
          { label: "Revoke the executive's active sessions and force re-authentication with a phishing-resistant factor", next: 'wider-pattern' },
          { label: 'Tell the executive to just ignore prompts they did not request and close the ticket', next: 'outcome:breach-escalated' },
        ],
      },
      {
        id: 'wider-pattern',
        prompt: 'Sessions are revoked. Digging into the logs, you find the same push-spam pattern hit 5 other accounts overnight.',
        decisions: [
          { label: 'Enable number-matching (require a code from the login screen inside the MFA app) organization-wide', next: 'rate-limit' },
          { label: 'Send an org-wide email reminding everyone not to approve prompts they do not recognize', next: 'outcome:contained-slow' },
        ],
      },
      {
        id: 'rate-limit',
        prompt: 'Number-matching is live — push-spam attempts against the other 5 accounts start failing immediately. One more decision to make.',
        decisions: [
          { label: 'Also cap push attempts (e.g. 3 per 10 minutes) and alert on-call SecOps on any rapid-fire burst, then file the incident report', next: 'outcome:contained-fast' },
          { label: 'Consider it resolved now that number-matching is on, and skip writing up a formal incident report', next: 'outcome:compliance-failure' },
        ],
      },
    ],
    outcomes: {
      'contained-fast': {
        title: 'Contained — Fast',
        postMortem:
          'Number-matching closes the "approve by accident" gap, and a rate limit plus real-time alerting catches the next burst before anyone gets fatigued into approving it — combined with a documented incident report for the audit trail.',
      },
      'contained-slow': {
        title: 'Contained — Slow',
        postMortem:
          'A reminder email relies entirely on human vigilance under exactly the kind of fatigue that caused this incident in the first place — it does not fix the structural gap that let a spammed push get approved by mistake.',
      },
      'breach-escalated': {
        title: 'Breach Escalated',
        postMortem:
          "Treating a real push-bombing incident as a nuisance leaves the executive's account (and MFA config) exactly as exploitable as it was ten minutes ago — the attacker just tries again.",
      },
      'compliance-failure': {
        title: 'Compliance Failure',
        postMortem:
          'The technical fix (number-matching) was correct, but skipping the incident report breaks the audit trail most compliance frameworks (SOC 2, ISO 27001) require for a confirmed authentication attack — the fix is real, the paperwork gap is not optional.',
      },
    },
  },
]
