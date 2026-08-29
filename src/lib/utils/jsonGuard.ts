export interface SignedCertificatePayload {
  recipientName: string
  completedModuleCount: number
  totalModuleCount: number
  completedLabCount: number
  issuedOn: string
  certificateId: string
}

export interface SignedCertificate {
  payload: SignedCertificatePayload
  signature: string
  publicKeyJwk: {
    kty: string
    [key: string]: unknown
  }
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function isSignedCertificate(obj: unknown): obj is SignedCertificate {
  if (!isObject(obj)) return false
  
  const { payload, signature, publicKeyJwk } = obj
  
  if (typeof signature !== 'string') return false
  if (!isObject(publicKeyJwk) || typeof publicKeyJwk.kty !== 'string') return false
  if (!isObject(payload)) return false
  
  const { recipientName, completedModuleCount, totalModuleCount, completedLabCount, issuedOn, certificateId } = payload
  
  return (
    typeof recipientName === 'string' &&
    typeof completedModuleCount === 'number' &&
    typeof totalModuleCount === 'number' &&
    typeof completedLabCount === 'number' &&
    typeof issuedOn === 'string' &&
    typeof certificateId === 'string'
  )
}
