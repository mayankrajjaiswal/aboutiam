export type SalaryRole = 'Engineer' | 'Architect' | 'Analyst' | 'Manager'
export type SalarySeniority = 'Junior' | 'Mid' | 'Senior' | 'Staff/Principal'
export type SalarySpecialization = 'Workforce IAM' | 'CIAM' | 'PAM' | 'IGA'

export interface SalaryEntry {
  id: string
  role: SalaryRole
  seniority: SalarySeniority
  specialization: SalarySpecialization
  regionMultiplier: number
  /** Base-case (US national average, multiplier 1.0) annual total-compensation percentile range in USD. */
  p25: number
  p50: number
  p75: number
  citation: string
  lastVerifiedDate: string
}

// Directional dataset aggregated from publicly-available identity/security compensation
// survey summaries (e.g. published salary-band ranges referenced by IDPro, (ISC)2, and
// general tech-compensation aggregators). Illustrative and educational — not a substitute
// for real local market research.
export const REGION_MULTIPLIERS: { region: string; multiplier: number }[] = [
  { region: 'US — Major Tech Hub (SF/NYC/Seattle)', multiplier: 1.25 },
  { region: 'US — National Average', multiplier: 1.0 },
  { region: 'US — Lower Cost-of-Living Market', multiplier: 0.82 },
  { region: 'Western Europe', multiplier: 0.78 },
  { region: 'India', multiplier: 0.32 },
]

export const IAM_SALARY_DATA: SalaryEntry[] = [
  { id: 'engineer-junior-workforce', role: 'Engineer', seniority: 'Junior', specialization: 'Workforce IAM', regionMultiplier: 1.0, p25: 85000, p50: 98000, p75: 112000, citation: 'Aggregated from public identity-engineering compensation survey summaries.', lastVerifiedDate: '2026-07-29' },
  { id: 'engineer-mid-workforce', role: 'Engineer', seniority: 'Mid', specialization: 'Workforce IAM', regionMultiplier: 1.0, p25: 115000, p50: 135000, p75: 155000, citation: 'Aggregated from public identity-engineering compensation survey summaries.', lastVerifiedDate: '2026-07-29' },
  { id: 'engineer-senior-workforce', role: 'Engineer', seniority: 'Senior', specialization: 'Workforce IAM', regionMultiplier: 1.0, p25: 150000, p50: 175000, p75: 205000, citation: 'Aggregated from public identity-engineering compensation survey summaries.', lastVerifiedDate: '2026-07-29' },
  { id: 'engineer-staff-workforce', role: 'Engineer', seniority: 'Staff/Principal', specialization: 'Workforce IAM', regionMultiplier: 1.0, p25: 195000, p50: 230000, p75: 270000, citation: 'Aggregated from public identity-engineering compensation survey summaries.', lastVerifiedDate: '2026-07-29' },

  { id: 'engineer-mid-pam', role: 'Engineer', seniority: 'Mid', specialization: 'PAM', regionMultiplier: 1.0, p25: 125000, p50: 148000, p75: 170000, citation: 'PAM specialization commands a premium over generalist IAM engineering per public compensation aggregator summaries.', lastVerifiedDate: '2026-07-29' },
  { id: 'engineer-senior-pam', role: 'Engineer', seniority: 'Senior', specialization: 'PAM', regionMultiplier: 1.0, p25: 165000, p50: 192000, p75: 225000, citation: 'PAM specialization commands a premium over generalist IAM engineering per public compensation aggregator summaries.', lastVerifiedDate: '2026-07-29' },

  { id: 'engineer-mid-ciam', role: 'Engineer', seniority: 'Mid', specialization: 'CIAM', regionMultiplier: 1.0, p25: 118000, p50: 138000, p75: 158000, citation: 'Aggregated from public identity-engineering compensation survey summaries.', lastVerifiedDate: '2026-07-29' },
  { id: 'engineer-senior-ciam', role: 'Engineer', seniority: 'Senior', specialization: 'CIAM', regionMultiplier: 1.0, p25: 152000, p50: 178000, p75: 208000, citation: 'Aggregated from public identity-engineering compensation survey summaries.', lastVerifiedDate: '2026-07-29' },

  { id: 'engineer-mid-iga', role: 'Engineer', seniority: 'Mid', specialization: 'IGA', regionMultiplier: 1.0, p25: 112000, p50: 132000, p75: 152000, citation: 'Aggregated from public identity-engineering compensation survey summaries.', lastVerifiedDate: '2026-07-29' },
  { id: 'engineer-senior-iga', role: 'Engineer', seniority: 'Senior', specialization: 'IGA', regionMultiplier: 1.0, p25: 145000, p50: 170000, p75: 198000, citation: 'Aggregated from public identity-engineering compensation survey summaries.', lastVerifiedDate: '2026-07-29' },

  { id: 'architect-senior-workforce', role: 'Architect', seniority: 'Senior', specialization: 'Workforce IAM', regionMultiplier: 1.0, p25: 175000, p50: 205000, p75: 240000, citation: 'Architect-level compensation aggregated from public identity-leadership survey summaries.', lastVerifiedDate: '2026-07-29' },
  { id: 'architect-staff-workforce', role: 'Architect', seniority: 'Staff/Principal', specialization: 'Workforce IAM', regionMultiplier: 1.0, p25: 215000, p50: 255000, p75: 300000, citation: 'Architect-level compensation aggregated from public identity-leadership survey summaries.', lastVerifiedDate: '2026-07-29' },
  { id: 'architect-senior-pam', role: 'Architect', seniority: 'Senior', specialization: 'PAM', regionMultiplier: 1.0, p25: 190000, p50: 222000, p75: 260000, citation: 'PAM architect specialization commands a premium per public compensation aggregator summaries.', lastVerifiedDate: '2026-07-29' },
  { id: 'architect-senior-ciam', role: 'Architect', seniority: 'Senior', specialization: 'CIAM', regionMultiplier: 1.0, p25: 178000, p50: 208000, p75: 245000, citation: 'Architect-level compensation aggregated from public identity-leadership survey summaries.', lastVerifiedDate: '2026-07-29' },
  { id: 'architect-senior-iga', role: 'Architect', seniority: 'Senior', specialization: 'IGA', regionMultiplier: 1.0, p25: 172000, p50: 200000, p75: 235000, citation: 'Architect-level compensation aggregated from public identity-leadership survey summaries.', lastVerifiedDate: '2026-07-29' },

  { id: 'analyst-junior-workforce', role: 'Analyst', seniority: 'Junior', specialization: 'Workforce IAM', regionMultiplier: 1.0, p25: 65000, p50: 76000, p75: 88000, citation: 'IAM/GRC analyst compensation aggregated from public survey summaries.', lastVerifiedDate: '2026-07-29' },
  { id: 'analyst-mid-workforce', role: 'Analyst', seniority: 'Mid', specialization: 'Workforce IAM', regionMultiplier: 1.0, p25: 82000, p50: 96000, p75: 112000, citation: 'IAM/GRC analyst compensation aggregated from public survey summaries.', lastVerifiedDate: '2026-07-29' },
  { id: 'analyst-senior-iga', role: 'Analyst', seniority: 'Senior', specialization: 'IGA', regionMultiplier: 1.0, p25: 108000, p50: 126000, p75: 148000, citation: 'IGA analyst/access-review specialization compensation aggregated from public survey summaries.', lastVerifiedDate: '2026-07-29' },

  { id: 'manager-senior-workforce', role: 'Manager', seniority: 'Senior', specialization: 'Workforce IAM', regionMultiplier: 1.0, p25: 165000, p50: 195000, p75: 228000, citation: 'IAM engineering/program manager compensation aggregated from public survey summaries.', lastVerifiedDate: '2026-07-29' },
  { id: 'manager-staff-workforce', role: 'Manager', seniority: 'Staff/Principal', specialization: 'Workforce IAM', regionMultiplier: 1.0, p25: 200000, p50: 238000, p75: 280000, citation: 'Director-level IAM program leadership compensation aggregated from public survey summaries.', lastVerifiedDate: '2026-07-29' },
  { id: 'manager-senior-pam', role: 'Manager', seniority: 'Senior', specialization: 'PAM', regionMultiplier: 1.0, p25: 182000, p50: 214000, p75: 250000, citation: 'PAM program leadership commands a premium per public compensation aggregator summaries.', lastVerifiedDate: '2026-07-29' },
]

export function estimateCompensation(entry: SalaryEntry, regionMultiplier: number) {
  return {
    p25: Math.round(entry.p25 * regionMultiplier),
    p50: Math.round(entry.p50 * regionMultiplier),
    p75: Math.round(entry.p75 * regionMultiplier),
  }
}
