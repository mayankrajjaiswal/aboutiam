import { describe, it, expect, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import CommunityHub from '../../src/pages/CommunityHub'

function seedCompletedLabs(labModuleIds: string[]) {
  window.localStorage.setItem('aboutiam_labs_completed', JSON.stringify(labModuleIds))
}

describe('CommunityHub Next-Gen IAM achievement badges', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('lists Agent Governor, Fleet Commander, and Crypto Agile as locked by default', () => {
    renderWithProviders(<CommunityHub />)
    expect(screen.getByText('Agent Governor')).toBeInTheDocument()
    expect(screen.getByText('Fleet Commander')).toBeInTheDocument()
    expect(screen.getByText('Crypto Agile')).toBeInTheDocument()
    expect(screen.queryAllByText('Unlocked')).toHaveLength(0)
  })

  it('unlocks Fleet Commander once the FIDO fleet sim lab is completed', () => {
    seedCompletedLabs(['fido_fleet_ops'])
    renderWithProviders(<CommunityHub />)
    const fleetCommanderCard = screen.getByText('Fleet Commander').closest('div[class*="rounded-xl"]')!
    expect(fleetCommanderCard.textContent).toContain('Unlocked')
  })

  it('unlocks Agent Governor only once all 5 agentic-identity/AI-fabric labs are completed', () => {
    seedCompletedLabs([
      'agent_registry_studio',
      'delegation_chain_auditor',
      'ai_guardrail_studio',
      'prompt_injection_escalation',
      'agent_observability_lab',
    ])
    renderWithProviders(<CommunityHub />)
    const agentGovernorCard = screen.getByText('Agent Governor').closest('div[class*="rounded-xl"]')!
    expect(agentGovernorCard.textContent).toContain('Unlocked')
  })

  it('unlocks Crypto Agile once the crypto migration planner lab is completed', () => {
    seedCompletedLabs(['crypto_migration_planner'])
    renderWithProviders(<CommunityHub />)
    const cryptoAgileCard = screen.getByText('Crypto Agile').closest('div[class*="rounded-xl"]')!
    expect(cryptoAgileCard.textContent).toContain('Unlocked')
  })
})
