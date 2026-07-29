export interface HrField {
  id: string
  label: string
}

export interface TargetAttribute {
  id: string
  label: string
  required: boolean
}

export interface HrMappingScenario {
  id: string
  name: string
  hrFields: HrField[]
  targetAttributes: TargetAttribute[]
  sampleRecord: Record<string, string>
  /** Pre-authored lookup tables keyed by source HR field id, offered as a starting point when a target is set to the "lookup" transform. */
  suggestedLookupTables: Record<string, Record<string, string>>
}

export const HR_MAPPING_SCENARIOS: HrMappingScenario[] = [
  {
    id: 'workday-entra',
    name: 'Workday → Microsoft Entra ID',
    hrFields: [
      { id: 'legal_first_name', label: 'Legal_First_Name' },
      { id: 'legal_last_name', label: 'Legal_Last_Name' },
      { id: 'cost_center', label: 'Cost_Center' },
      { id: 'manager_employee_id', label: 'Manager_Employee_ID' },
      { id: 'work_email', label: 'Work_Email' },
      { id: 'employee_id', label: 'Employee_ID' },
    ],
    targetAttributes: [
      { id: 'givenName', label: 'givenName', required: true },
      { id: 'surname', label: 'surname', required: true },
      { id: 'displayName', label: 'displayName', required: false },
      { id: 'department', label: 'department', required: false },
      { id: 'manager', label: 'manager', required: false },
      { id: 'mail', label: 'mail', required: true },
      { id: 'employeeId', label: 'employeeId', required: true },
    ],
    sampleRecord: {
      legal_first_name: 'Priya',
      legal_last_name: 'Sharma',
      cost_center: 'CC-100',
      manager_employee_id: 'E-4821',
      work_email: 'priya.sharma@example.com',
      employee_id: 'E-9931',
    },
    suggestedLookupTables: {
      cost_center: { 'CC-100': 'Engineering', 'CC-200': 'Finance', 'CC-300': 'Sales' },
    },
  },
  {
    id: 'sap-ad',
    name: 'SAP SuccessFactors → Active Directory',
    hrFields: [
      { id: 'vorname', label: 'Vorname' },
      { id: 'nachname', label: 'Nachname' },
      { id: 'kostenstelle', label: 'Kostenstelle' },
      { id: 'personalnummer', label: 'Personalnummer' },
      { id: 'email_adresse', label: 'Email_Adresse' },
    ],
    targetAttributes: [
      { id: 'givenName', label: 'givenName', required: true },
      { id: 'sn', label: 'sn', required: true },
      { id: 'displayName', label: 'displayName', required: false },
      { id: 'department', label: 'department', required: false },
      { id: 'employeeID', label: 'employeeID', required: true },
      { id: 'mail', label: 'mail', required: true },
    ],
    sampleRecord: {
      vorname: 'Lukas',
      nachname: 'Weber',
      kostenstelle: 'KST-01',
      personalnummer: 'P-55210',
      email_adresse: 'lukas.weber@example.de',
    },
    suggestedLookupTables: {
      kostenstelle: { 'KST-01': 'Engineering', 'KST-02': 'Vertrieb', 'KST-03': 'Personalwesen' },
    },
  },
]
