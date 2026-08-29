import type { TaskTag } from './taskTags'

/**
 * "I want to…" task tags for PlaygroundCatalog.tsx, keyed by each playground's
 * `link` path rather than baked into the catalog's inline entry objects — additive
 * and backfillable incrementally without touching the (large) existing array.
 * Untagged playgrounds simply don't appear under any task filter.
 */
export const PLAYGROUND_TASK_TAGS: Record<string, TaskTag[]> = {
  '/playground/oauth': ['simulate-attack'],
  '/playground/jwt': ['decode', 'generate'],
  '/playground/saml': ['simulate-attack'],
  '/playground/fido2': ['generate'],
  '/playground/access': ['validate-policy'],
  '/playground/ldap': ['validate-policy'],
  '/playground/scim': ['simulate-attack'],
  '/playground/oauth-attack': ['simulate-attack'],
  '/playground/kerberos': ['simulate-attack'],
  '/playground/ctf': ['simulate-attack'],
  '/playground/identity-architect': ['build-diagram'],
  '/playground/reference-builder': ['build-diagram'],
  '/playground/session-hijacking': ['simulate-attack'],
  '/playground/conditional-access': ['validate-policy'],
  '/playground/opa': ['validate-policy'],
  '/playground/ldap-schema-designer': ['build-diagram'],
  '/playground/jwt-cracker': ['simulate-attack'],
  '/playground/cert-chain': ['validate-policy'],
  '/playground/attack-path-graph': ['simulate-attack', 'build-diagram'],
  '/playground/ciem-explorer': ['check-compliance', 'build-diagram'],
  '/playground/xacml': ['validate-policy'],
  '/playground/vc-did': ['generate'],
  '/playground/access-certification': ['check-compliance'],
  '/playground/role-mining': ['build-diagram'],
  '/playground/identity-fabric': ['build-diagram'],
  '/playground/credential-stuffing': ['simulate-attack'],
  '/playground/pqc-handshake': ['validate-policy'],
  '/playground/passkey-policy': ['validate-policy'],
  '/playground/workload-identity': ['validate-policy'],
  '/playground/cloud-policy-evaluator': ['validate-policy'],
  '/playground/federated-vp': ['validate-policy'],
  '/playground/autonomous-agent': ['validate-policy'],
}
