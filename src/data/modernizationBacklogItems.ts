export interface ModernizationItem {
  id: string
  title: string
  riskScore: number
  cost: number
  dependsOn?: string[]
}

export const MODERNIZATION_BACKLOG_ITEMS: ModernizationItem[] = [
  { id: 'ldap_hardcoded_binds', title: 'Hardcoded LDAP bind credentials in app config', riskScore: 9, cost: 8 },
  { id: 'unrotated_service_passwords', title: 'Un-rotated service account passwords', riskScore: 8, cost: 6 },
  { id: 'saml_only_sso', title: 'SAML-only SSO with no modern OIDC path', riskScore: 6, cost: 10 },
  { id: 'no_step_up_mfa', title: 'No step-up MFA for high-risk transactions', riskScore: 8, cost: 7 },
  { id: 'shared_admin_accounts', title: 'Shared/generic admin accounts with no attribution', riskScore: 9, cost: 5 },
  { id: 'plaintext_secrets_in_code', title: 'Plaintext secrets committed in source code', riskScore: 9, cost: 6 },
  { id: 'no_password_rotation_policy', title: 'No enforced password rotation policy', riskScore: 5, cost: 4 },
  { id: 'legacy_basic_auth_apis', title: 'Legacy APIs still accepting HTTP Basic Auth', riskScore: 7, cost: 7, dependsOn: ['saml_only_sso'] },
  { id: 'no_mfa_for_admins', title: 'No mandatory MFA for administrative accounts', riskScore: 9, cost: 6 },
  { id: 'directory_sync_spof', title: 'Single point of failure in directory sync pipeline', riskScore: 6, cost: 9 },
  { id: 'no_jit_provisioning', title: 'No just-in-time provisioning from the directory', riskScore: 4, cost: 5, dependsOn: ['directory_sync_spof'] },
  { id: 'over_privileged_service_accounts', title: 'Over-privileged, rarely-audited service accounts', riskScore: 8, cost: 6 },
  { id: 'no_access_reviews', title: 'No periodic user access certification reviews', riskScore: 5, cost: 4 },
  { id: 'no_session_timeout_policy', title: 'No enforced idle-session timeout policy', riskScore: 4, cost: 3 },
  { id: 'no_centralized_logging', title: 'No centralized authentication/authorization logging', riskScore: 6, cost: 7 },
  { id: 'no_conditional_access', title: 'No conditional access policies for admin sign-in', riskScore: 7, cost: 8, dependsOn: ['no_mfa_for_admins'] },
  { id: 'weak_password_policy', title: 'Weak minimum password-complexity policy', riskScore: 5, cost: 3 },
  { id: 'no_privileged_access_workstations', title: 'No dedicated privileged access workstations (PAWs)', riskScore: 7, cost: 9 },
  { id: 'no_break_glass_accounts', title: 'No tested break-glass emergency access accounts', riskScore: 5, cost: 4 },
  { id: 'no_federation_for_b2b_partners', title: 'No federated SSO for B2B partner access (shared local accounts instead)', riskScore: 6, cost: 8, dependsOn: ['saml_only_sso'] }
]

export const MAX_POSSIBLE_RISK_REDUCTION = MODERNIZATION_BACKLOG_ITEMS.reduce((sum, item) => sum + item.riskScore, 0)
export const TOTAL_BACKLOG_COST = MODERNIZATION_BACKLOG_ITEMS.reduce((sum, item) => sum + item.cost, 0)
