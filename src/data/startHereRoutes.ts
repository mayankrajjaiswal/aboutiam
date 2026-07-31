export interface StartHereStep {
  path: string
  label: string
}

export type StartHereGoalId = 'learn-fundamentals' | 'prep-interview' | 'explore-labs' | 'assess-org'

export interface StartHereGoal {
  id: StartHereGoalId
  question: string
  steps: StartHereStep[]
}

/**
 * Static mapping from a "what brings you here today?" goal answer to an
 * ordered sequence of already-existing pages. Purely a routing/checklist
 * layer — every step is a real page a visitor could also reach directly via
 * search or the sidebar.
 */
export const START_HERE_GOALS: StartHereGoal[] = [
  {
    id: 'learn-fundamentals',
    question: 'Learn IAM fundamentals',
    steps: [
      { path: '/primer', label: 'Read the Beginner Primer' },
      { path: '/learn?track=foundations', label: 'Start the Foundations of Identity track' },
      { path: '/encyclopedia', label: 'Bookmark terms as you go in the A-Z Encyclopedia' },
      { path: '/daily-puzzle', label: 'Try the Daily Identity Puzzle to test what you learned' },
    ],
  },
  {
    id: 'prep-interview',
    question: 'Prep for an interview',
    steps: [
      { path: '/career-center', label: 'Pick your role track in the Career Center' },
      { path: '/certifications', label: 'Check the certification study blueprints' },
      { path: '/career-center?tab=interview', label: 'Run a timed mock interview' },
      { path: '/career-center?tab=resume', label: 'Draft your resume with the Portfolio Builder' },
    ],
  },
  {
    id: 'explore-labs',
    question: 'Explore hands-on labs',
    steps: [
      { path: '/playground', label: 'Browse the Playground Catalog' },
      { path: '/playground/oauth', label: 'Start with the OAuth 2.0 / OIDC Flow Visualizer' },
      { path: '/playground/jwt', label: 'Decode and sign tokens in the JWT Studio' },
      { path: '/playground/ctf', label: 'Test your skills in the Identity CTF Arena' },
    ],
  },
  {
    id: 'assess-org',
    question: 'Assess my org',
    steps: [
      { path: '/assess', label: 'Run the GRC Maturity Wizard' },
      { path: '/standards?view=deadlines', label: 'Check upcoming Compliance Deadlines' },
      { path: '/playground/modernization-backlog', label: 'Sequence remediation in the Modernization Backlog Game' },
      { path: '/tools/risk-register-builder', label: 'Track specific risks in the Risk Register Builder' },
    ],
  },
]
