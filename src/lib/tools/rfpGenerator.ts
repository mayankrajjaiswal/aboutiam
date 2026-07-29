import { RFP_QUESTION_BANK, type RfpQuestion, type RfpCategory } from '../../data/rfpQuestionBank'

export type OrgSize = 'Small' | 'Mid-Market' | 'Enterprise'

export interface RfpAnswers {
  orgSize: OrgSize
  industry: string
  existingIdp: string
  priorityCapabilities: string[]
}

export interface RfpSection {
  category: RfpCategory
  questions: RfpQuestion[]
}

const CATEGORY_ORDER: RfpCategory[] = ['Security & Compliance', 'Integration', 'TCO', 'Implementation Risk']

function isApplicable(question: RfpQuestion, answers: RfpAnswers): boolean {
  const isBaseline = question.applicableCapabilities.length === 0
  const matchesCapability = question.applicableCapabilities.some((cap) => answers.priorityCapabilities.includes(cap))
  if (!isBaseline && !matchesCapability) return false

  if (question.applicableOrgSizes && !question.applicableOrgSizes.includes(answers.orgSize)) return false

  return true
}

export function generateRfp(answers: RfpAnswers, bank: RfpQuestion[] = RFP_QUESTION_BANK): RfpSection[] {
  return CATEGORY_ORDER.map((category) => ({
    category,
    questions: bank.filter((q) => q.category === category && isApplicable(q, answers)),
  })).filter((section) => section.questions.length > 0)
}

export function countTotalQuestions(sections: RfpSection[]): number {
  return sections.reduce((sum, s) => sum + s.questions.length, 0)
}
