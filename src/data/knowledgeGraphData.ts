import { ENCYCLOPEDIA_TERMS } from './encyclopediaData'
import { STANDARDS } from './standardsData'
import { ARCHITECTURES } from './architectureData'

export type KnowledgeGraphNodeType = 'term' | 'standard' | 'architecture'

export interface KnowledgeGraphNode {
  /** `${type}:${underlying id}`, e.g. `standard:oauth21`. */
  id: string
  type: KnowledgeGraphNodeType
  label: string
  description: string
  category: string
  path: string
}

/**
 * Hand-curated relationships between Standards, Encyclopedia terms, and
 * Architecture Center entries. None of the three underlying datasets share a
 * key today, so edges are authored by hand rather than derived — see
 * src/data/knowledgeGraphData.test.ts for the invariant that every id
 * referenced here must resolve to a real record in its source dataset.
 */
export const KNOWLEDGE_GRAPH_EDGES: [string, string][] = [
  // Standard <-> Standard
  ['standard:oauth21', 'standard:oidc'],
  ['standard:oidc', 'standard:jose'],
  ['standard:oauth21', 'standard:dpop'],
  ['standard:oauth21', 'standard:gnap'],
  ['standard:oauth21', 'standard:rfc8693'],
  ['standard:saml2', 'standard:nist80063'],
  ['standard:kerberos', 'standard:ldapv3'],
  ['standard:webauthn', 'standard:nist80063'],
  ['standard:scim20', 'standard:oidc'],
  ['standard:x509-pki', 'standard:jose'],
  ['standard:vc-did', 'standard:webauthn'],
  ['standard:caep-ssf', 'standard:oauth21'],
  ['standard:spiffe-spire', 'standard:x509-pki'],
  ['standard:xacml3', 'standard:gnap'],
  ['standard:totp-hotp', 'standard:nist80063'],
  ['standard:radius', 'standard:ldapv3'],

  // Standard <-> Term
  ['standard:oauth21', 'term:oauth'],
  ['standard:oauth21', 'term:access_token'],
  ['standard:oauth21', 'term:pkce'],
  ['standard:oauth21', 'term:bearer_token'],
  ['standard:oidc', 'term:oidc'],
  ['standard:oidc', 'term:id_token'],
  ['standard:oidc', 'term:sso'],
  ['standard:jose', 'term:jwt'],
  ['standard:jose', 'term:jws'],
  ['standard:jose', 'term:jwe'],
  ['standard:jose', 'term:jwks'],
  ['standard:saml2', 'term:saml'],
  ['standard:saml2', 'term:sso'],
  ['standard:saml2', 'term:federation'],
  ['standard:scim20', 'term:scim'],
  ['standard:scim20', 'term:jit_provisioning'],
  ['standard:webauthn', 'term:passkey'],
  ['standard:webauthn', 'term:fido2'],
  ['standard:webauthn', 'term:passwordless'],
  ['standard:ldapv3', 'term:ldap'],
  ['standard:ldapv3', 'term:directory'],
  ['standard:ldapv3', 'term:active_directory'],
  ['standard:kerberos', 'term:kerberos'],
  ['standard:totp-hotp', 'term:totp'],
  ['standard:totp-hotp', 'term:mfa'],
  ['standard:x509-pki', 'term:mtls'],
  ['standard:x509-pki', 'term:ocsp'],
  ['standard:x509-pki', 'term:crl'],
  ['standard:x509-pki', 'term:kms'],
  ['standard:rfc8693', 'term:access_token'],
  ['standard:nist80063', 'term:mfa'],
  ['standard:nist80063', 'term:passwordless'],
  ['standard:xacml3', 'term:abac'],
  ['standard:xacml3', 'term:rbac'],
  ['standard:xacml3', 'term:abac_policy_engine'],
  ['standard:gnap', 'term:gnap'],
  ['standard:caep-ssf', 'term:caep'],
  ['standard:caep-ssf', 'term:ssf'],
  ['standard:caep-ssf', 'term:zero_trust'],
  ['standard:vc-did', 'term:did'],
  ['standard:vc-did', 'term:vc'],
  ['standard:vc-did', 'term:zkp'],
  ['standard:vc-did', 'term:mdl'],
  ['standard:spiffe-spire', 'term:spiffe_spire'],
  ['standard:spiffe-spire', 'term:zero_trust'],
  ['standard:dpop', 'term:dpop'],
  ['standard:dpop', 'term:token_binding'],
  ['standard:radius', 'term:radius'],

  // Term <-> Term
  ['term:jwt', 'term:jws'],
  ['term:jwt', 'term:jwe'],
  ['term:jwt', 'term:access_token'],
  ['term:oauth', 'term:oidc'],
  ['term:oauth', 'term:pkce'],
  ['term:sso', 'term:federation'],
  ['term:rbac', 'term:abac'],
  ['term:abac', 'term:rebac'],
  ['term:passkey', 'term:fido2'],
  ['term:passkey', 'term:passwordless'],
  ['term:zero_trust', 'term:rba'],
  ['term:pam', 'term:least_privilege'],
  ['term:iga', 'term:access_recertification'],
  ['term:iga', 'term:entitlement_management'],
  ['term:idp', 'term:relying_party'],
  ['term:idp', 'term:service_provider'],
  ['term:authn', 'term:authz'],
  ['term:bearer_token', 'term:opaque_token'],
  ['term:token_introspection', 'term:token_revocation'],
  ['term:consent_management', 'term:ciam'],

  // Term <-> Architecture
  ['term:zero_trust', 'architecture:zero_trust'],
  ['term:pam', 'architecture:pam'],
  ['term:ldap', 'architecture:ldap_onprem'],
  ['term:kerberos', 'architecture:ldap_onprem'],
  ['term:rbac', 'architecture:rbac_basic'],
  ['term:jwt', 'architecture:jwt_stateless_api'],
  ['term:sso', 'architecture:sso_reverse_proxy'],
  ['term:mfa', 'architecture:mfa_stepup'],
  ['term:iga', 'architecture:iga_access_review'],
  ['term:api_key', 'architecture:api_key_auth'],
  ['term:ciam', 'architecture:ciam_social'],
  ['term:spiffe_spire', 'architecture:multi_cloud'],
  ['term:mtls', 'architecture:pki'],
  ['term:session', 'architecture:basic_session_auth'],
  ['term:cookie', 'architecture:basic_session_auth'],

  // Standard <-> Architecture
  ['standard:oauth21', 'architecture:oauth_oidc'],
  ['standard:oidc', 'architecture:oauth_oidc'],
  ['standard:oidc', 'architecture:b2b_saas'],
  ['standard:saml2', 'architecture:saml'],
  ['standard:webauthn', 'architecture:mfa_stepup'],
  ['standard:xacml3', 'architecture:rbac_basic'],
  ['standard:spiffe-spire', 'architecture:multi_cloud'],
  ['standard:x509-pki', 'architecture:pki'],
  ['standard:x509-pki', 'architecture:k8s_identity'],
  ['standard:nist80063', 'architecture:zero_trust'],
  ['standard:rfc8693', 'architecture:b2b_saas'],
  ['standard:kerberos', 'architecture:ldap_onprem'],
  ['standard:ldapv3', 'architecture:ldap_onprem'],
  ['standard:totp-hotp', 'architecture:mfa_stepup'],

  // Architecture <-> Architecture (natural progression)
  ['architecture:basic_session_auth', 'architecture:jwt_stateless_api'],
  ['architecture:rbac_basic', 'architecture:iga_access_review'],
  ['architecture:mfa_stepup', 'architecture:zero_trust'],
  ['architecture:oauth_oidc', 'architecture:b2b_saas'],
  ['architecture:saml', 'architecture:sso_reverse_proxy'],
]

function resolveNode(id: string): KnowledgeGraphNode | null {
  const separatorIndex = id.indexOf(':')
  if (separatorIndex === -1) return null
  const type = id.slice(0, separatorIndex) as KnowledgeGraphNodeType
  const rawId = id.slice(separatorIndex + 1)

  if (type === 'standard') {
    const standard = STANDARDS.find((s) => s.id === rawId)
    if (!standard) return null
    return {
      id,
      type,
      label: standard.title,
      description: standard.summary,
      category: standard.category,
      path: `/standards?standard=${standard.id}`,
    }
  }

  if (type === 'architecture') {
    const architecture = ARCHITECTURES.find((a) => a.id === rawId)
    if (!architecture) return null
    return {
      id,
      type,
      label: architecture.name,
      description: architecture.description,
      category: architecture.group,
      path: `/architecture?arch=${architecture.id}`,
    }
  }

  if (type === 'term') {
    const term = ENCYCLOPEDIA_TERMS.find((t) => t.id === rawId)
    if (!term) return null
    return {
      id,
      type,
      label: term.term,
      description: term.analogy,
      category: term.category,
      path: `/encyclopedia?term=${term.id}`,
    }
  }

  return null
}

/** Every node referenced by at least one edge, resolved against its source dataset. Nodes that fail to resolve (a typo'd id) are silently dropped rather than crashing the graph. */
export const KNOWLEDGE_GRAPH_NODES: KnowledgeGraphNode[] = (() => {
  const ids = new Set<string>()
  for (const [a, b] of KNOWLEDGE_GRAPH_EDGES) {
    ids.add(a)
    ids.add(b)
  }
  const nodes: KnowledgeGraphNode[] = []
  for (const id of ids) {
    const node = resolveNode(id)
    if (node) nodes.push(node)
  }
  return nodes
})()

const nodesById = new Map(KNOWLEDGE_GRAPH_NODES.map((n) => [n.id, n]))

export function getKnowledgeGraphNode(id: string): KnowledgeGraphNode | undefined {
  return nodesById.get(id)
}

/** All nodes directly connected to `id`, in edge-declaration order. */
export function getNeighborIds(id: string): string[] {
  const neighbors: string[] = []
  for (const [a, b] of KNOWLEDGE_GRAPH_EDGES) {
    if (a === id && !neighbors.includes(b)) neighbors.push(b)
    else if (b === id && !neighbors.includes(a)) neighbors.push(a)
  }
  return neighbors
}
