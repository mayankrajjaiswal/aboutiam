import { describe, it, expect } from 'vitest'
import { generateLocalAiResponse } from './localAiEngine'

describe('Local AI Inference Simulator Engine', () => {
  it('should compile an OIDC federated SSO design when prompting about federation/OIDC', () => {
    const result = generateLocalAiResponse('Create an OIDC login flow')
    expect(result.answer).toContain('Bespoke OIDC B2B SaaS SSO')
    expect(result.sequenceDiagram).toBeDefined()
    expect(result.policyCode).toContain('authorization_code')
    expect(result.threatModel?.length).toBe(2)
  })

  it('should compile an OPA Rego policy design when prompting about authorization/Rego', () => {
    const result = generateLocalAiResponse('Write a fine-grained ABAC Rego policy')
    expect(result.answer).toContain('Fine-Grained Attribute-Based Access Control')
    expect(result.policyCode).toContain('package play.authz')
  })

  it('should fall back to a zero-trust baseline design for generic prompts', () => {
    const result = generateLocalAiResponse('Some random client-server database connection')
    expect(result.answer).toContain('Specialized IAM Security Architecture Design')
    expect(result.policyCode).toContain('NIST SP 800-207 Zero Trust')
  })
})
