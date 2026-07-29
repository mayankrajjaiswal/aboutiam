import {
  RADIUS_CORRECT_SHARED_SECRET, SHIBBOLETH_SP_ENTITY_ID,
} from '../../data/legacyFederationData'
import type { FederationInstitution, TacacsCommandRule } from '../../data/legacyFederationData'

export interface RadiusEvaluation {
  code: 'Access-Accept' | 'Access-Reject'
  reason: string
}

export function evaluateRadiusAccess(sharedSecretGuess: string): RadiusEvaluation {
  if (sharedSecretGuess === RADIUS_CORRECT_SHARED_SECRET) {
    return {
      code: 'Access-Accept',
      reason: 'Shared secret matched — the User-Password attribute hash (RFC 2865 §5.2) validated correctly against the NAS-configured secret.',
    }
  }
  return {
    code: 'Access-Reject',
    reason: 'Shared secret mismatch — the RADIUS server could not validate the User-Password attribute hash against the configured NAS shared secret.',
  }
}

export function checkTacacsCommand(command: string, rules: TacacsCommandRule[]): TacacsCommandRule | null {
  return rules.find((r) => r.command === command) ?? null
}

export interface WayfAssertion {
  subject: string
  issuer: string
  audience: string
}

export interface WayfResult {
  institution: FederationInstitution
  assertion: WayfAssertion
}

export function buildWayfAssertion(institutionId: string, institutions: FederationInstitution[]): WayfResult | null {
  const institution = institutions.find((i) => i.id === institutionId)
  if (!institution) return null

  return {
    institution,
    assertion: {
      subject: `user@${institution.id}.edu`,
      issuer: institution.homeIdpEndpoint,
      audience: SHIBBOLETH_SP_ENTITY_ID,
    },
  }
}
