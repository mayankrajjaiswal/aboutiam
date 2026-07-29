export type IssuerStatus = 'active' | 'revoked' | 'suspended'

export interface RegisteredIssuer {
  /** Cross-references `OpenId4VcScenario.issuerName` from src/data/openId4VcScenarios.ts. */
  issuerName: string
  status: IssuerStatus
}

export interface TrustRegistry {
  id: string
  name: string
  country: string
  issuers: RegisteredIssuer[]
  /** Ids of other registries this registry's verifiers also trust (one level of cross-recognition). */
  recognizes: string[]
}

export const TRUST_REGISTRIES: TrustRegistry[] = [
  {
    id: 'de-registry',
    name: 'German Federal Trust Registry (DE)',
    country: 'Germany',
    issuers: [
      { issuerName: 'State University Registrar', status: 'active' },
    ],
    recognizes: ['de-registry'],
  },
  {
    id: 'fr-registry',
    name: 'French National Trust Registry (FR)',
    country: 'France',
    issuers: [],
    recognizes: ['fr-registry'],
  },
  {
    id: 'us-registry',
    name: 'US State Trust Registry (US)',
    country: 'United States',
    issuers: [
      { issuerName: 'Digital Motor Authority', status: 'active' },
    ],
    recognizes: ['us-registry'],
  },
  {
    id: 'eudi-recognized-registry',
    name: 'EUDI Wallet Cross-Recognition Registry',
    country: 'European Union',
    issuers: [],
    recognizes: ['de-registry', 'fr-registry'],
  },
]

export interface VerificationOutcome {
  authorized: boolean
  reason: string
}

function findIssuerRecord(issuerName: string, registry: TrustRegistry): RegisteredIssuer | undefined {
  return registry.issuers.find((i) => i.issuerName === issuerName)
}

/**
 * Checks whether a credential's issuer is currently authorized from the
 * perspective of a specific verifier's trusted registry — independent of
 * whether the credential's signature is cryptographically valid. Only
 * looks one level into registries the verifier's registry recognizes,
 * matching the EUDI-style cross-border recognition model this scenario set
 * demonstrates.
 */
export function verifyIssuerAuthorization(
  issuerName: string,
  verifierRegistryId: string,
  registries: TrustRegistry[],
): VerificationOutcome {
  const verifierRegistry = registries.find((r) => r.id === verifierRegistryId)
  if (!verifierRegistry) {
    return { authorized: false, reason: `Verifier trust registry "${verifierRegistryId}" was not found.` }
  }

  const directRecord = findIssuerRecord(issuerName, verifierRegistry)
  if (directRecord) {
    return directRecord.status === 'active'
      ? { authorized: true, reason: `Issuer is directly authorized in ${verifierRegistry.name}.` }
      : { authorized: false, reason: `Issuer is listed in ${verifierRegistry.name} but its status is "${directRecord.status}".` }
  }

  for (const recognizedId of verifierRegistry.recognizes) {
    if (recognizedId === verifierRegistry.id) continue
    const recognizedRegistry = registries.find((r) => r.id === recognizedId)
    if (!recognizedRegistry) continue
    const record = findIssuerRecord(issuerName, recognizedRegistry)
    if (record) {
      return record.status === 'active'
        ? { authorized: true, reason: `Issuer is authorized in ${recognizedRegistry.name}, which ${verifierRegistry.name} recognizes.` }
        : { authorized: false, reason: `Issuer is listed in ${recognizedRegistry.name} (recognized by ${verifierRegistry.name}) but its status is "${record.status}".` }
    }
  }

  return { authorized: false, reason: `Issuer "${issuerName}" is not listed in ${verifierRegistry.name} or any registry it recognizes.` }
}
