export interface VpClaim {
  key: string
  label: string
  value: string
  disclosed: boolean
}

export interface VpScenario {
  id: string
  name: string
  issuerName: string
  verifierName: string
  issuerRegistry: 'DE_Registry' | 'FR_Registry' | 'Unlisted'
  expectedClaims: string[]
  claims: VpClaim[]
  description: string
}

export const VP_SCENARIOS: VpScenario[] = [
  {
    id: 'student_exchange',
    name: 'German Student ID presented to French University',
    issuerName: 'Technical University of Munich (TUM)',
    verifierName: 'Sorbonne University (Paris)',
    issuerRegistry: 'DE_Registry', // Recognized by EU Trust Backbone
    expectedClaims: ['family_name', 'enrolled_status'],
    claims: [
      { key: 'given_name', label: 'Given Name', value: 'Lukas', disclosed: false },
      { key: 'family_name', label: 'Family Name', value: 'Müller', disclosed: true },
      { key: 'birthdate', label: 'Date of Birth', value: '2003-08-15', disclosed: false },
      { key: 'enrolled_status', label: 'Enrollment Status', value: 'Enrolled (Fall 2026)', disclosed: true },
      { key: 'student_id', label: 'Student Matriculation ID', value: 'TUM-90823', disclosed: false }
    ],
    description: 'A student exchanges academic credentials across EU boundaries. Sorbonne University verifies the academic standing of the student without requesting their full birthdate or private ID, using eIDAS 2.0 cross-registry trust frameworks.'
  },
  {
    id: 'untrusted_credentials',
    name: 'Faked Student ID presented to French University',
    issuerName: 'Rogue Mock College (Self-Signed)',
    verifierName: 'Sorbonne University (Paris)',
    issuerRegistry: 'Unlisted', // Rejected by EU Trust Backbone
    expectedClaims: ['family_name', 'enrolled_status'],
    claims: [
      { key: 'given_name', label: 'Given Name', value: 'Hacker', disclosed: true },
      { key: 'family_name', label: 'Family Name', value: 'Phantom', disclosed: true },
      { key: 'birthdate', label: 'Date of Birth', value: '1999-01-01', disclosed: false },
      { key: 'enrolled_status', label: 'Enrollment Status', value: 'Enrolled', disclosed: true }
    ],
    description: 'An attacker attempts to present a faked, self-signed student credential. The verifier validates the signature, but fails the exchange during the Trust Registry verification pass since the issuer is not recognized.'
  }
]
