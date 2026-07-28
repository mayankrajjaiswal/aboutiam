import { describe, it, expect } from 'vitest'
import { scoreRoadmap, BUDGET_PER_QUARTER, type RoadmapAssignment } from './modernizationScoring'
import { MODERNIZATION_BACKLOG_ITEMS, MAX_POSSIBLE_RISK_REDUCTION } from '../../data/modernizationBacklogItems'

// A hand-built full schedule that respects every dependsOn ordering and stays
// within BUDGET_PER_QUARTER each quarter — used to prove the scoring model
// rewards a good plan with (close to) the maximum possible score.
const REFERENCE_OPTIMAL_ASSIGNMENT: RoadmapAssignment = {
  ldap_hardcoded_binds: 1,
  saml_only_sso: 1,
  shared_admin_accounts: 1,
  plaintext_secrets_in_code: 1,
  no_mfa_for_admins: 1,
  directory_sync_spof: 1,
  unrotated_service_passwords: 2,
  no_step_up_mfa: 2,
  legacy_basic_auth_apis: 2,
  no_jit_provisioning: 2,
  no_conditional_access: 2,
  no_federation_for_b2b_partners: 2,
  over_privileged_service_accounts: 3,
  no_centralized_logging: 3,
  no_privileged_access_workstations: 3,
  no_break_glass_accounts: 3,
  no_password_rotation_policy: 4,
  no_access_reviews: 4,
  no_session_timeout_policy: 4,
  weak_password_policy: 4
}

describe('scoreRoadmap', () => {
  it('schedules every item in the reference-optimal assignment (sanity check on the fixture itself)', () => {
    expect(Object.keys(REFERENCE_OPTIMAL_ASSIGNMENT).length).toBe(MODERNIZATION_BACKLOG_ITEMS.length)
  })

  it('the reference-optimal sequencing stays within budget every quarter and has zero dependency violations', () => {
    const result = scoreRoadmap(MODERNIZATION_BACKLOG_ITEMS, REFERENCE_OPTIMAL_ASSIGNMENT)
    expect(result.dependencyViolations).toBe(0)
    expect(result.budgetViolations).toBe(0)
  })

  it('the reference-optimal sequencing scores at the theoretical maximum (every item scheduled, no penalties)', () => {
    const result = scoreRoadmap(MODERNIZATION_BACKLOG_ITEMS, REFERENCE_OPTIMAL_ASSIGNMENT)
    expect(result.totalRiskReduced).toBe(MAX_POSSIBLE_RISK_REDUCTION)
    expect(result.score).toBe(MAX_POSSIBLE_RISK_REDUCTION)
  })

  it('a dependency violation (scheduling a dependent before its dependency) is penalized', () => {
    const violatingAssignment: RoadmapAssignment = {
      ...REFERENCE_OPTIMAL_ASSIGNMENT,
      // legacy_basic_auth_apis depends on saml_only_sso — schedule it earlier to violate the ordering
      legacy_basic_auth_apis: 1
    }

    const goodResult = scoreRoadmap(MODERNIZATION_BACKLOG_ITEMS, REFERENCE_OPTIMAL_ASSIGNMENT)
    const violatingResult = scoreRoadmap(MODERNIZATION_BACKLOG_ITEMS, violatingAssignment)

    expect(violatingResult.dependencyViolations).toBeGreaterThan(0)
    expect(violatingResult.score).toBeLessThan(goodResult.score)
  })

  it('exceeding the per-quarter budget cap is penalized', () => {
    const overBudgetAssignment: RoadmapAssignment = Object.fromEntries(
      MODERNIZATION_BACKLOG_ITEMS.map((item) => [item.id, 1])
    )

    const result = scoreRoadmap(MODERNIZATION_BACKLOG_ITEMS, overBudgetAssignment)
    expect(result.budgetViolations).toBeGreaterThan(0)
    expect(result.score).toBeLessThan(MAX_POSSIBLE_RISK_REDUCTION)
  })

  it('an unscheduled item contributes zero risk reduction and zero cost', () => {
    const partial: RoadmapAssignment = { ldap_hardcoded_binds: 1 }
    const result = scoreRoadmap(MODERNIZATION_BACKLOG_ITEMS, partial)
    const ldapItem = MODERNIZATION_BACKLOG_ITEMS.find((i) => i.id === 'ldap_hardcoded_binds')!
    expect(result.totalRiskReduced).toBe(ldapItem.riskScore)
    expect(result.totalCostSpent).toBe(ldapItem.cost)
  })

  it('an empty assignment scores zero with no violations', () => {
    const result = scoreRoadmap(MODERNIZATION_BACKLOG_ITEMS, {})
    expect(result).toEqual({
      totalRiskReduced: 0,
      totalCostSpent: 0,
      riskReductionPerDollar: 0,
      dependencyViolations: 0,
      budgetViolations: 0,
      score: 0
    })
  })

  it('BUDGET_PER_QUARTER is a sane positive cap', () => {
    expect(BUDGET_PER_QUARTER).toBeGreaterThan(0)
  })
})
