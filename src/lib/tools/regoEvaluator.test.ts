import { describe, it, expect } from 'vitest'
import { evaluateRego } from './regoEvaluator'

describe('OPA Rego Evaluator Engine', () => {
  const policyCode = `
    package play.authz
    
    default allow = false
    
    allow {
      input.user.roles[_] == "admin"
      input.env.network == "internal"
      input.user.mfa_active
    }
    
    allow {
      input.user.roles[_] == "compliance_manager"
    }
  `

  it('should deny if none of the allow blocks are satisfied', () => {
    const input = {
      user: {
        roles: ['developer'],
        mfa_active: false,
      },
      env: {
        network: 'external',
      },
    }

    const result = evaluateRego(policyCode, input)
    expect(result.allowed).toBe(false)
    expect(result.logs.some(l => l.includes('Block #1 unsatisfied'))).toBe(true)
    expect(result.logs.some(l => l.includes('Block #2 unsatisfied'))).toBe(true)
  })

  it('should authorize if the first allow block is fully satisfied (AND conditions)', () => {
    const input = {
      user: {
        roles: ['developer', 'admin'],
        mfa_active: true,
      },
      env: {
        network: 'internal',
      },
    }

    const result = evaluateRego(policyCode, input)
    expect(result.allowed).toBe(true)
    expect(result.logs.some(l => l.includes('Block #1 satisfied'))).toBe(true)
  })

  it('should authorize if the second allow block is satisfied (OR across blocks)', () => {
    const input = {
      user: {
        roles: ['compliance_manager'],
        mfa_active: false, // MFA not active, but block #2 does not require it
      },
      env: {
        network: 'external',
      },
    }

    const result = evaluateRego(policyCode, input)
    expect(result.allowed).toBe(true)
    expect(result.logs.some(l => l.includes('Block #2 satisfied'))).toBe(true)
  })
})
