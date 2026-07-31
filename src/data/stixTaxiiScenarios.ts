// Teaches the STIX 2.1 object model and TAXII 2.1 collection/subscription
// exchange format for identity-relevant indicators of compromise — the format
// and protocol, not detection logic. Distinct from the CAEP Event Storm
// Visualizer (session-state propagation) and the ITDR Lab (log monitoring).

export type StixRelatedObjectType = 'malware' | 'threat-actor' | 'identity'

export interface StixIndicator {
  id: string
  /** STIX pattern language string, e.g. a file-hash or credential-hash comparison expression. */
  pattern: string
  label: string
  description: string
}

export interface StixRelatedObject {
  id: string
  type: StixRelatedObjectType
  name: string
  description: string
}

export interface StixBundleScenario {
  id: string
  title: string
  narrative: string
  indicator: StixIndicator
  relatedObject: StixRelatedObject
  relationshipType: string
  /** Topic tags used to match this bundle against a TAXII subscriber's filter — see matchesSubscriberFilter(). */
  tags: string[]
}

export const STIX_BUNDLE_SCENARIOS: StixBundleScenario[] = [
  {
    id: 'leaked-credential-hash',
    title: 'Leaked Credential Hash → Threat Actor',
    narrative:
      'A credential-stuffing list surfaces on a criminal marketplace. The leaked-credential hash pattern is published as a STIX Indicator and linked to the Threat Actor group known to operate that marketplace.',
    indicator: {
      id: 'indicator--c1a1b2c3-0001-4a11-9c11-000000000001',
      pattern: "[user-account:credential_hash = '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08']",
      label: 'Leaked credential hash (SHA-256)',
      description: 'A specific credential hash observed in a leaked-credential dump, expressed as a STIX pattern comparison expression.',
    },
    relatedObject: {
      id: 'threat-actor--c1a1b2c3-0002-4a11-9c11-000000000002',
      type: 'threat-actor',
      name: 'FIN-Credential-Broker',
      description: 'A financially-motivated group known to resell leaked-credential lists on criminal marketplaces.',
    },
    relationshipType: 'indicates',
    tags: ['credential-leak'],
  },
  {
    id: 'credential-stealer-malware',
    title: 'Leaked Credential Hash → Malware',
    narrative:
      'The same class of leaked-credential hash is also linked to the specific credential-stealer malware family observed harvesting it, so defenders can pivot from "this credential leaked" to "this is how it was likely stolen."',
    indicator: {
      id: 'indicator--c1a1b2c3-0003-4a11-9c11-000000000003',
      pattern: "[user-account:credential_hash = '2c624232cdd221771294dfbb310aca000a0df6ac8b66b696d90ef06fdefb64a']",
      label: 'Leaked credential hash (SHA-256)',
      description: 'A credential hash observed in a leaked-credential dump attributed to a known credential-stealer malware family.',
    },
    relatedObject: {
      id: 'malware--c1a1b2c3-0004-4a11-9c11-000000000004',
      type: 'malware',
      name: 'InfoStealer.SilentHarvest',
      description: 'A credential-harvesting malware family known to exfiltrate browser-stored and clipboard credentials.',
    },
    relationshipType: 'indicates',
    tags: ['credential-leak', 'malware'],
  },
  {
    id: 'compromised-token-identity',
    title: 'Compromised OAuth Token → Identity',
    narrative:
      'A specific OAuth refresh token is confirmed compromised (used from an unexpected IP after being issued). The Indicator is linked directly to the Identity SDO for the specific service account the token belongs to, so the receiving organization knows exactly which identity to revoke.',
    indicator: {
      id: 'indicator--c1a1b2c3-0005-4a11-9c11-000000000005',
      pattern: "[x-oauth-token:token_hash = 'a94a8fe5ccb19ba61c4c0873d391e987982fbbd3'] AND [x-oauth-token:status = 'compromised']",
      label: 'Compromised OAuth refresh token (hashed)',
      description: 'A hashed OAuth refresh token confirmed compromised via anomalous usage, expressed as a STIX pattern comparison expression.',
    },
    relatedObject: {
      id: 'identity--c1a1b2c3-0006-4a11-9c11-000000000006',
      type: 'identity',
      name: 'svc-billing-integration',
      description: 'The specific non-human service account identity the compromised token was issued to.',
    },
    relationshipType: 'indicates',
    tags: ['token-compromise'],
  },
]

export interface TaxiiSubscriber {
  id: string
  name: string
  /** A subscriber receives a bundle if it shares at least one tag with the bundle's `tags`. */
  filterTags: string[]
}

export const TAXII_SUBSCRIBERS: TaxiiSubscriber[] = [
  { id: 'soc-alpha', name: 'SOC-Alpha (credential intel)', filterTags: ['credential-leak'] },
  { id: 'soc-beta', name: 'SOC-Beta (token/session intel)', filterTags: ['token-compromise'] },
  { id: 'soc-gamma', name: 'SOC-Gamma (broad identity intel)', filterTags: ['credential-leak', 'token-compromise', 'malware'] },
]

/** A subscriber receives a bundle exactly when it shares at least one tag with the bundle. */
export function matchesSubscriberFilter(scenario: StixBundleScenario, subscriber: TaxiiSubscriber): boolean {
  return scenario.tags.some((tag) => subscriber.filterTags.includes(tag))
}

export interface StixBundleObject {
  type: string
  spec_version: '2.1'
  id: string
  [key: string]: unknown
}

export interface StixBundle {
  type: 'bundle'
  id: string
  objects: StixBundleObject[]
}

/** Assembles the minimal STIX 2.1 bundle (Indicator + related SDO + Relationship) this simulator supports. */
export function buildStixBundle(scenario: StixBundleScenario): StixBundle {
  const indicatorObject: StixBundleObject = {
    type: 'indicator',
    spec_version: '2.1',
    id: scenario.indicator.id,
    name: scenario.indicator.label,
    description: scenario.indicator.description,
    pattern: scenario.indicator.pattern,
    pattern_type: 'stix',
  }

  const relatedObject: StixBundleObject = {
    type: scenario.relatedObject.type,
    spec_version: '2.1',
    id: scenario.relatedObject.id,
    name: scenario.relatedObject.name,
    description: scenario.relatedObject.description,
  }

  const relationshipObject: StixBundleObject = {
    type: 'relationship',
    spec_version: '2.1',
    id: `relationship--${scenario.id}`,
    relationship_type: scenario.relationshipType,
    source_ref: scenario.indicator.id,
    target_ref: scenario.relatedObject.id,
  }

  return {
    type: 'bundle',
    id: `bundle--${scenario.id}`,
    objects: [indicatorObject, relatedObject, relationshipObject],
  }
}
