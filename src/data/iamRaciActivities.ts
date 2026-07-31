export interface RaciActivity {
  id: string
  name: string
}

/**
 * A curated starter list of common IAM program activities for the RACI
 * Builder tool — editable/extensible by the user (add a custom activity row);
 * not a mandatory fixed list.
 */
export const IAM_RACI_ACTIVITIES: RaciActivity[] = [
  { id: 'sso-onboarding', name: 'SSO onboarding for a new application' },
  { id: 'access-recertification', name: 'Quarterly access recertification campaign' },
  { id: 'pam-credential-rotation', name: 'PAM vaulted credential rotation' },
  { id: 'incident-response', name: 'Identity-related security incident response' },
  { id: 'vendor-risk-review', name: 'Third-party/vendor identity risk review' },
  { id: 'joiner-mover-leaver', name: 'Joiner-Mover-Leaver lifecycle processing' },
  { id: 'privileged-access-request', name: 'Privileged access request approval' },
  { id: 'mfa-policy-changes', name: 'MFA/conditional-access policy changes' },
  { id: 'audit-evidence-collection', name: 'Compliance audit evidence collection' },
  { id: 'orphaned-account-cleanup', name: 'Orphaned/stale account cleanup' },
]
