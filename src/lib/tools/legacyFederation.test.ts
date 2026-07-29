import { describe, it, expect } from 'vitest'
import { evaluateRadiusAccess, checkTacacsCommand, buildWayfAssertion } from './legacyFederation'
import { RADIUS_CORRECT_SHARED_SECRET, TACACS_COMMAND_RULES, EDUGAIN_INSTITUTIONS, SHIBBOLETH_SP_ENTITY_ID } from '../../data/legacyFederationData'

describe('evaluateRadiusAccess', () => {
  it('returns Access-Reject for a wrong shared secret', () => {
    const result = evaluateRadiusAccess('wrong-secret')
    expect(result.code).toBe('Access-Reject')
  })

  it('returns Access-Accept for the correct shared secret', () => {
    const result = evaluateRadiusAccess(RADIUS_CORRECT_SHARED_SECRET)
    expect(result.code).toBe('Access-Accept')
  })
})

describe('checkTacacsCommand', () => {
  it('separately authorizes a read-only command', () => {
    const result = checkTacacsCommand('show running-config', TACACS_COMMAND_RULES)
    expect(result?.allowed).toBe(true)
  })

  it('separately denies a privileged config command', () => {
    const result = checkTacacsCommand('configure terminal', TACACS_COMMAND_RULES)
    expect(result?.allowed).toBe(false)
  })

  it('returns null for a command with no defined rule', () => {
    expect(checkTacacsCommand('reload', TACACS_COMMAND_RULES)).toBeNull()
  })
})

describe('buildWayfAssertion', () => {
  it('builds a SAML-shaped assertion consumable by the mock SP for a valid institution', () => {
    const result = buildWayfAssertion('tu-berlin', EDUGAIN_INSTITUTIONS)
    expect(result).not.toBeNull()
    expect(result?.assertion.issuer).toBe('https://idp.tu-berlin.example/saml2/sso')
    expect(result?.assertion.audience).toBe(SHIBBOLETH_SP_ENTITY_ID)
  })

  it('returns null for an unknown institution id', () => {
    expect(buildWayfAssertion('does-not-exist', EDUGAIN_INSTITUTIONS)).toBeNull()
  })
})
