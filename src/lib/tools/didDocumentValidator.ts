// Structural validation of a W3C DID Core 1.0 DID Document JSON — checks the
// same contract a real resolver relies on (id shape, verificationMethod key
// material, relationship arrays pointing at a declared verificationMethod)
// without resolving anything over the network.
const RELATIONSHIP_FIELDS = ['authentication', 'assertionMethod', 'keyAgreement', 'capabilityInvocation', 'capabilityDelegation'] as const
type RelationshipField = (typeof RELATIONSHIP_FIELDS)[number]

const KNOWN_VERIFICATION_METHOD_TYPES = [
  'Ed25519VerificationKey2020',
  'Ed25519VerificationKey2018',
  'JsonWebKey2020',
  'EcdsaSecp256k1VerificationKey2019',
  'X25519KeyAgreementKey2020',
  'Multikey',
]

const KNOWN_PUBLIC_KEY_FIELDS = ['publicKeyMultibase', 'publicKeyJwk', 'publicKeyBase58']

export interface ValidationIssue {
  severity: 'error' | 'warning'
  message: string
}

export interface VerificationMethodSummary {
  id: string
  type: string
  controller: string
  hasKeyMaterial: boolean
}

export interface DidDocumentValidationResult {
  valid: boolean
  issues: ValidationIssue[]
  id: string | null
  verificationMethods: VerificationMethodSummary[]
  relationships: Partial<Record<RelationshipField, string[]>>
}

function isDidUri(value: unknown): value is string {
  return typeof value === 'string' && /^did:[a-z0-9]+:.+/.test(value)
}

export function validateDidDocument(json: unknown): DidDocumentValidationResult {
  const issues: ValidationIssue[] = []

  if (typeof json !== 'object' || json === null || Array.isArray(json)) {
    return { valid: false, issues: [{ severity: 'error', message: 'The input must be a single JSON object, not an array or a primitive.' }], id: null, verificationMethods: [], relationships: {} }
  }

  const doc = json as Record<string, unknown>

  const id = isDidUri(doc.id) ? doc.id : null
  if (!id) {
    issues.push({ severity: 'error', message: '"id" is missing or is not a well-formed DID URI (expected "did:<method>:<method-specific-id>").' })
  }

  if (!doc['@context']) {
    issues.push({ severity: 'warning', message: '"@context" is missing — most real resolvers expect at least "https://www.w3.org/ns/did/v1".' })
  }

  const rawMethods = Array.isArray(doc.verificationMethod) ? doc.verificationMethod : []
  if (rawMethods.length === 0) {
    issues.push({ severity: 'error', message: '"verificationMethod" is missing or empty — a DID Document needs at least one key to be useful for authentication.' })
  }

  const verificationMethods: VerificationMethodSummary[] = []
  const knownIds = new Set<string>()

  rawMethods.forEach((raw, index) => {
    if (typeof raw !== 'object' || raw === null) {
      issues.push({ severity: 'error', message: `verificationMethod[${index}] is not an object.` })
      return
    }
    const vm = raw as Record<string, unknown>
    const vmId = typeof vm.id === 'string' ? vm.id : `(missing id at index ${index})`
    const vmType = typeof vm.type === 'string' ? vm.type : ''
    const vmController = typeof vm.controller === 'string' ? vm.controller : ''
    const hasKeyMaterial = KNOWN_PUBLIC_KEY_FIELDS.some((field) => field in vm)

    if (typeof vm.id !== 'string') issues.push({ severity: 'error', message: `verificationMethod[${index}] is missing a string "id".` })
    else knownIds.add(vm.id)

    if (!vmType) issues.push({ severity: 'error', message: `verificationMethod[${index}] is missing "type".` })
    else if (!KNOWN_VERIFICATION_METHOD_TYPES.includes(vmType)) issues.push({ severity: 'warning', message: `verificationMethod[${index}] has an unrecognized type "${vmType}" — this tool may not fully understand it, but it isn't necessarily invalid.` })

    if (!vmController) issues.push({ severity: 'error', message: `verificationMethod[${index}] is missing "controller".` })

    if (!hasKeyMaterial) issues.push({ severity: 'error', message: `verificationMethod[${index}] has no recognized public key field (expected one of ${KNOWN_PUBLIC_KEY_FIELDS.join(', ')}).` })

    verificationMethods.push({ id: vmId, type: vmType || '(missing)', controller: vmController || '(missing)', hasKeyMaterial })
  })

  const relationships: Partial<Record<RelationshipField, string[]>> = {}
  RELATIONSHIP_FIELDS.forEach((field) => {
    const raw = doc[field]
    if (raw === undefined) return
    if (!Array.isArray(raw)) {
      issues.push({ severity: 'error', message: `"${field}" must be an array.` })
      return
    }
    const refs: string[] = []
    raw.forEach((entry) => {
      if (typeof entry === 'string') {
        refs.push(entry)
        if (!knownIds.has(entry)) {
          issues.push({ severity: 'error', message: `"${field}" references "${entry}", which is not declared in "verificationMethod".` })
        }
      } else if (typeof entry === 'object' && entry !== null && typeof (entry as Record<string, unknown>).id === 'string') {
        // Embedded verification method (inline object) rather than a string reference — valid per spec.
        refs.push((entry as Record<string, unknown>).id as string)
      } else {
        issues.push({ severity: 'error', message: `"${field}" contains an entry that is neither a string reference nor an embedded verification method object.` })
      }
    })
    relationships[field] = refs
  })

  if (!relationships.authentication) {
    issues.push({ severity: 'warning', message: 'No "authentication" relationship declared — the document has keys but doesn\'t say which one proves control of the DID.' })
  }

  const valid = issues.every((i) => i.severity !== 'error')

  return { valid, issues, id, verificationMethods, relationships }
}
