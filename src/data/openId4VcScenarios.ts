export interface OpenId4VcScenario {
  id: string
  title: string
  issuerName: string
  credentialType: string
  verifierName: string
  verifierPurpose: string
  /** Every claim the credential is issued with — each becomes an independent SD-JWT disclosure. */
  issuedClaims: Record<string, string | number | boolean>
  /** The subset of `issuedClaims` keys the verifier's presentation definition actually requests. */
  requestedClaims: string[]
}

export const OPENID4VC_SCENARIOS: OpenId4VcScenario[] = [
  {
    id: 'mdl-age-check',
    title: 'Mobile Driver\'s License — Age Check',
    issuerName: 'Digital Motor Authority',
    credentialType: 'Mobile Driver\'s License (mDL)',
    verifierName: 'Bar — Age Check Only',
    verifierPurpose: 'Confirm the holder is over 21 without learning their name, address, or exact birthdate.',
    issuedClaims: {
      given_name: 'Jordan',
      family_name: 'Rivera',
      birthdate: '1998-04-12',
      license_class: 'C',
      address: '221B Baker Street, Springfield',
      age_over_21: true
    },
    requestedClaims: ['age_over_21']
  },
  {
    id: 'university-diploma',
    title: 'University Diploma — Employer Verification',
    issuerName: 'State University Registrar',
    credentialType: 'Verifiable Academic Diploma',
    verifierName: 'Acme Corp — HR Onboarding',
    verifierPurpose: 'Confirm the candidate holds a real, conferred degree in the claimed field, without seeing their GPA or student ID.',
    issuedClaims: {
      given_name: 'Priya',
      family_name: 'Nandakumar',
      degree_type: 'Bachelor of Science',
      major: 'Computer Science',
      graduation_year: 2023,
      gpa: 3.7,
      student_id: 'SU-2019-04471'
    },
    requestedClaims: ['degree_type', 'major', 'graduation_year']
  },
  {
    id: 'employment-proof',
    title: 'Proof of Employment — Apartment Application',
    issuerName: 'Acme Corp — HR Department',
    credentialType: 'Verifiable Employment Credential',
    verifierName: 'Maple Ridge Apartments — Leasing Office',
    verifierPurpose: 'Confirm the applicant is currently employed with a sufficient salary, without learning their job title or manager.',
    issuedClaims: {
      given_name: 'Marcus',
      family_name: 'Okafor',
      employer_name: 'Acme Corp',
      job_title: 'Senior Identity Engineer',
      manager_name: 'Dana Whitfield',
      annual_salary: 128000,
      employment_status: 'active'
    },
    requestedClaims: ['employer_name', 'annual_salary', 'employment_status']
  },
  {
    id: 'pharmacy-eligibility',
    title: 'Health Plan Eligibility — Pharmacy Pickup',
    issuerName: 'Meridian Health Plan',
    credentialType: 'Verifiable Insurance Eligibility Credential',
    verifierName: 'Corner Pharmacy — Prescription Pickup',
    verifierPurpose: 'Confirm active coverage and copay tier, without learning the member\'s diagnosis history or full plan details.',
    issuedClaims: {
      given_name: 'Lena',
      family_name: 'Fischer',
      member_id: 'MH-88213-A',
      plan_tier: 'Gold',
      copay_tier: 2,
      coverage_active: true,
      primary_diagnosis_code: 'N/A'
    },
    requestedClaims: ['coverage_active', 'copay_tier']
  }
]
