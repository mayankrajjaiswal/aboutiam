export interface PatentTimelineMilestone {
  id: string
  year: string
  date: string
  title: string
  disputeType: 'Patent Expiry' | 'Antitrust' | 'Non-Assert Covenant' | 'Patent Issued'
  description: string
  legalStandard: string
  impact: string
}

export const PATENT_MILESTONES: PatentTimelineMilestone[] = [
  {
    id: 'rsa-issued',
    year: '1983',
    date: '1983-09-20',
    title: 'RSA Patent Issued (US 4,405,829)',
    disputeType: 'Patent Issued',
    description: 'MIT patents the RSA public-key algorithm, creating an absolute monopoly on asymmetric cryptography. For the next 17 years, commercial entities are forced into restrictive licensing agreements, heavily stalling the native adoption of secure web protocols (SSL).',
    legalStandard: 'RSA Algorithm',
    impact: 'Stalled the widespread adoption of cryptographic identity verification on the early web.'
  },
  {
    id: 'kerberos-open',
    year: '1988',
    date: '1988-10-15',
    title: 'Project Athena & Kerberos Licensing',
    disputeType: 'Non-Assert Covenant',
    description: 'MIT releases Kerberos V4 under a permissive open-source license. However, concerns regarding intersecting symmetric cryptography patents and export-control cryptography restrictions haunted enterprise adoptions.',
    legalStandard: 'Kerberos Protocol',
    impact: 'Pioneered the concept that security infrastructure must be open-source to gain standard enterprise trust.'
  },
  {
    id: 'rsa-expires',
    year: '2000',
    date: '2000-09-20',
    title: 'RSA Patent Expires (Crypto Liberation)',
    disputeType: 'Patent Expiry',
    description: 'The expiration of the RSA patent immediately triggered the modern cryptographic renaissance. Open-source libraries (OpenSSL) could now freely implement public key cryptography, paving the way for SSL/TLS ubiquity and eventual asymmetric token signing (JWT RS256).',
    legalStandard: 'Public Key Cryptography',
    impact: 'Unlocked modern secure web protocols and the foundation for asymmetric identity federation.'
  },
  {
    id: 'samba-antitrust',
    year: '2004',
    date: '2004-12-01',
    title: 'Samba AD Reverse Engineering & EC Antitrust',
    disputeType: 'Antitrust',
    description: 'Microsoft maintained absolute proprietary control over NT Directory Services and NTLM. The open-source Samba team undertook a massive blind reverse-engineering effort to allow Linux systems to join AD domains. This culminated in the European Commission forcing Microsoft to release protocol interoperability specifications under non-discriminatory terms.',
    legalStandard: 'Active Directory / NTLM',
    impact: 'Set the legal precedent that core identity directories must support documented, interoperable protocol boundaries.'
  },
  {
    id: 'owf-oauth',
    year: '2009',
    date: '2009-11-01',
    title: 'OAuth & The Open Web Foundation Agreement',
    disputeType: 'Non-Assert Covenant',
    description: 'Federated identity frameworks were historically plagued by patent thickets (Standard Essential Patents). To prevent patent trolls from destroying OAuth, the Open Web Foundation (OWF) drafted the OWFa 1.0 agreement. Every company contributing to the OAuth standard (Google, Yahoo, Twitter) signed a perpetual, royalty-free non-assert covenant, guaranteeing they will never sue developers for implementing the protocol.',
    legalStandard: 'OAuth 1.0 / 2.0 / OIDC',
    impact: 'The single legal mechanism that allowed OAuth to become the undisputed, universally adopted open standard of the modern web.'
  }
]
