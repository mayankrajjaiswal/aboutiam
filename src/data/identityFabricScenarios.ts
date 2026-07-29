export type FabricProtocol = 'SAML' | 'OIDC' | 'LDAP'

export interface FabricScenario {
  id: string
  name: string
  description: string
  appProtocol: FabricProtocol
  appName: string
  idpProtocol: FabricProtocol
  idpName: string
  /** Ordered narration steps the orchestration node performs once wired correctly. */
  translationSteps: string[]
}

export const IDENTITY_FABRIC_SCENARIOS: FabricScenario[] = [
  {
    id: 'idp-migration-no-rewrite',
    name: 'IdP Migration Without App Rewrite',
    description: 'A legacy SAML-only application keeps working unchanged even after the company migrates its identity provider to a modern OIDC-only IdP.',
    appProtocol: 'SAML',
    appName: 'Legacy Expense Reporting App',
    idpProtocol: 'OIDC',
    idpName: 'Modern Cloud IdP',
    translationSteps: [
      'SAML AuthnRequest received from Legacy Expense Reporting App',
      'Orchestration node translates the AuthnRequest into an OIDC authorization request',
      'OIDC authorization request sent to Modern Cloud IdP',
      'ID token and access token received from Modern Cloud IdP',
      'Orchestration node translates the ID token claims into a SAML assertion',
      'SAML assertion returned to Legacy Expense Reporting App, which authenticates the user normally',
    ],
  },
  {
    id: 'consistent-mfa-heterogeneous-idps',
    name: 'Consistent MFA Policy Across Heterogeneous IdPs',
    description: 'One app enforces the same phishing-resistant MFA policy regardless of which of three different-protocol IdPs actually authenticated the user.',
    appProtocol: 'OIDC',
    appName: 'Customer Support Portal',
    idpProtocol: 'SAML',
    idpName: 'Acquired Subsidiary IdP (SAML-only)',
    translationSteps: [
      'OIDC authorization request received from Customer Support Portal',
      'Orchestration node translates the request into a SAML AuthnRequest for the subsidiary IdP',
      'SAML assertion received from Acquired Subsidiary IdP',
      'Orchestration node inspects the assertion\'s authentication-method claim against the central MFA policy',
      'Orchestration node normalizes the result into a standard OIDC ID token with a consistent "mfa: true" claim',
      'OIDC ID token returned to Customer Support Portal — the same policy is enforced regardless of which IdP authenticated the user',
    ],
  },
  {
    id: 'dual-protocol-single-orchestrator',
    name: 'One Orchestration Node, Two Legacy Protocols',
    description: 'A single orchestration node simultaneously fronts a legacy LDAP-bind application and a modern OIDC application against the same backend identity source.',
    appProtocol: 'LDAP',
    appName: 'Legacy On-Prem File Server (LDAP bind)',
    idpProtocol: 'OIDC',
    idpName: 'Modern Cloud IdP',
    translationSteps: [
      'LDAP simple bind request received from Legacy On-Prem File Server',
      'Orchestration node translates the bind credentials into an OIDC Resource Owner Password Credentials-style backend check',
      'Credential validity confirmed against Modern Cloud IdP',
      'Orchestration node translates the OIDC result back into an LDAP bind success response',
      'LDAP bind success returned to Legacy On-Prem File Server, unaware the backend is now a modern cloud IdP',
    ],
  },
]
