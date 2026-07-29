import { CLASSICAL_ECDSA_SIGNATURE_BYTES, HYBRID_ML_DSA_87_SIGNATURE_BYTES } from './pqcReadiness'

export type PqcChainMode = 'classical' | 'hybrid'

export interface PqcSignatureDisplay {
  algorithm: string
  bytesPerHop: number
}

export const CHAIN_HOP_COUNT = 3

export function getPqcSignatureDisplay(mode: PqcChainMode): PqcSignatureDisplay {
  return mode === 'hybrid'
    ? { algorithm: 'ECDSA P-256 + ML-DSA-87 (hybrid)', bytesPerHop: CLASSICAL_ECDSA_SIGNATURE_BYTES + HYBRID_ML_DSA_87_SIGNATURE_BYTES }
    : { algorithm: 'ECDSA P-256 (classical)', bytesPerHop: CLASSICAL_ECDSA_SIGNATURE_BYTES }
}

export function computeChainSizeBytes(mode: PqcChainMode, hops = CHAIN_HOP_COUNT): number {
  return getPqcSignatureDisplay(mode).bytesPerHop * hops
}
