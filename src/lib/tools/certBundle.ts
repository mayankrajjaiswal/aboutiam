// Splits a multi-certificate PEM bundle (e.g. a fullchain.pem) into individual
// certs and checks leaf-to-root chain ordering, reusing the same ASN.1/X.509
// field extraction already built for the X.509 Certificate Decoder rather than
// duplicating DN parsing here.
import { parseCertificateOrCsr } from './x509'
import type { ParsedCertificate } from './x509'

export function splitPemBundle(bundle: string): string[] {
  const matches = bundle.match(/-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/g)
  return matches ?? []
}

export interface BundleEntry {
  pem: string
  index: number
  parsed: ParsedCertificate | { kind: 'error'; message: string }
}

export interface ChainOrderIssue {
  fromIndex: number
  toIndex: number
  message: string
}

export interface BundleAnalysis {
  entries: BundleEntry[]
  chainIssues: ChainOrderIssue[]
}

export async function analyzeBundle(bundleText: string): Promise<BundleAnalysis> {
  const pemBlocks = splitPemBundle(bundleText)
  const entries: BundleEntry[] = []

  for (let i = 0; i < pemBlocks.length; i++) {
    const parsed = await parseCertificateOrCsr(pemBlocks[i])
    entries.push({
      pem: pemBlocks[i],
      index: i,
      parsed: parsed.kind === 'certificate' ? parsed : { kind: 'error', message: parsed.kind === 'csr' ? 'This entry is a CSR, not a certificate.' : parsed.message },
    })
  }

  const chainIssues: ChainOrderIssue[] = []
  for (let i = 0; i < entries.length - 1; i++) {
    const current = entries[i].parsed
    const next = entries[i + 1].parsed
    if (current.kind === 'error' || next.kind === 'error') continue
    if (current.issuer.display !== next.subject.display) {
      chainIssues.push({
        fromIndex: i,
        toIndex: i + 1,
        message: `Certificate ${i + 1}'s issuer ("${current.issuer.display}") does not match certificate ${i + 2}'s subject ("${next.subject.display}") — the chain is broken or out of order at this point.`,
      })
    }
  }

  return { entries, chainIssues }
}
