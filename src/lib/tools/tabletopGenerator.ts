import type { Bulletin } from '../../data/bulletinsData'
import { CONTROL_TITLES } from '../../data/bulletinsData'

export interface TabletopAnswers {
  industry: string
  idpType: string
  teamSize: string
}

export interface TabletopInject {
  timeOffset: string
  description: string
}

export interface RubricArea {
  area: string
  description: string
}

export interface TabletopScript {
  bulletinId: string
  title: string
  industry: string
  idpType: string
  teamSize: string
  objectives: string[]
  injects: TabletopInject[]
  discussionPrompts: string[]
  rubric: RubricArea[]
}

const RUBRIC_AREAS: Omit<RubricArea, 'description'>[] = [
  { area: 'Identity Detection' },
  { area: 'Incident Communications' },
  { area: 'Remediation Execution' },
]

export function generateTabletopScript(bulletin: Bulletin, answers: TabletopAnswers): TabletopScript {
  const objectives = [
    `Walk a ${answers.teamSize} team at a ${answers.industry} organization running ${answers.idpType} through a realistic "${bulletin.title}" scenario.`,
    `Practice detecting a ${bulletin.category.toLowerCase()} incident within your own identity stack.`,
    `Decide between the correct containment action and the tempting-but-wrong shortcut, and understand why the difference matters.`,
  ]

  const injects: TabletopInject[] = [
    { timeOffset: 'T+0', description: bulletin.simulator.step1Log },
    { timeOffset: 'T+15', description: bulletin.simulator.step2Log },
    { timeOffset: 'T+30', description: `Containment decision point: choose between the standards-compliant remediation and the faster-but-incomplete shortcut. Correct path: ${bulletin.simulator.containmentHighLog.split('\n')[0]}` },
  ]

  const discussionPrompts = bulletin.playbookSteps.map(
    (step, idx) => `Step ${idx + 1} — did your team consider: "${step}"? What would have happened if this step were skipped?`
  )

  const mappedControlTitles = bulletin.controlsMapped.map((id) => CONTROL_TITLES[id]).filter(Boolean)

  const rubric: RubricArea[] = RUBRIC_AREAS.map(({ area }) => {
    if (area === 'Identity Detection') {
      return { area, description: `How quickly and accurately the team identified the "${bulletin.vector}" attack vector from available signals.` }
    }
    if (area === 'Incident Communications') {
      return { area, description: 'Clarity and speed of internal/external communications during the incident, including stakeholder escalation.' }
    }
    return {
      area,
      description: mappedControlTitles.length > 0
        ? `Whether the chosen remediation satisfies the mapped compliance controls: ${mappedControlTitles.join('; ')}.`
        : `Whether the chosen remediation matches the standards-compliant containment path, not the tempting shortcut.`,
    }
  })

  return {
    bulletinId: bulletin.id,
    title: `Tabletop Exercise: ${bulletin.title}`,
    industry: answers.industry,
    idpType: answers.idpType,
    teamSize: answers.teamSize,
    objectives,
    injects,
    discussionPrompts,
    rubric,
  }
}

export function scriptToMarkdown(script: TabletopScript): string {
  const lines = [
    `# ${script.title}`,
    '',
    `**Industry:** ${script.industry} | **IdP Type:** ${script.idpType} | **Team Size:** ${script.teamSize}`,
    '',
    '## Objectives',
    ...script.objectives.map((o) => `- ${o}`),
    '',
    '## Timed Injects',
    ...script.injects.map((i) => `- **${i.timeOffset}:** ${i.description}`),
    '',
    '## Discussion Prompts',
    ...script.discussionPrompts.map((p) => `- ${p}`),
    '',
    '## Scoring Rubric',
    ...script.rubric.map((r) => `- **${r.area}:** ${r.description}`),
  ]
  return lines.join('\n')
}
