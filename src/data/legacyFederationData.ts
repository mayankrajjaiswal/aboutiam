export const RADIUS_CORRECT_SHARED_SECRET = 'RadiusSecret2026'

export interface RadiusAttribute {
  name: string
  value: string
}

export const RADIUS_SAMPLE_ATTRIBUTES: RadiusAttribute[] = [
  { name: 'User-Name', value: 'net-admin-01' },
  { name: 'NAS-IP-Address', value: '10.20.30.1' },
  { name: 'User-Password', value: '(encrypted with shared secret, RFC 2865 §5.2)' },
]

export interface TacacsCommandRule {
  command: string
  allowed: boolean
  description: string
}

export const TACACS_COMMAND_RULES: TacacsCommandRule[] = [
  { command: 'show running-config', allowed: true, description: 'Read-only visibility into device config — safe for any authenticated network admin.' },
  { command: 'configure terminal', allowed: false, description: 'Privileged config-mode entry — requires an elevated TACACS+ authorization level this admin does not hold.' },
]

export interface FederationInstitution {
  id: string
  name: string
  homeIdpEndpoint: string
}

export const EDUGAIN_INSTITUTIONS: FederationInstitution[] = [
  { id: 'tu-berlin', name: 'Technical University of Berlin', homeIdpEndpoint: 'https://idp.tu-berlin.example/saml2/sso' },
  { id: 'u-toronto', name: 'University of Toronto', homeIdpEndpoint: 'https://shibboleth.utoronto.example/idp/sso' },
  { id: 'anu', name: 'Australian National University', homeIdpEndpoint: 'https://idp.anu.example/saml2/sso' },
]

export const SHIBBOLETH_SP_ENTITY_ID = 'https://sp.aboutiam-library.example/shibboleth'
