import { describe, it, expect } from 'vitest'
import { evaluateCloudPolicies } from './cloudPolicyScenarios'

describe('Cloud Policy Evaluator Rules', () => {
  it('should explicitly deny DeleteBucket on production S3', () => {
    const context = {
      action: 's3:DeleteBucket',
      resource: 'arn:aws:s3:::production-financial-data',
      clientIp: '192.168.10.25',
      region: 'us-east-1',
      mfaAuthenticated: true
    }

    const result = evaluateCloudPolicies(context)
    expect(result.allowed).toBe(false)
    expect(result.steps.some(s => s.policy === 'Organization SCP' && s.decision === 'DENY')).toBe(true)
  })

  it('should allow ReadObject from authorized Corporate Subnet', () => {
    const context = {
      action: 's3:GetObject',
      resource: 'arn:aws:s3:::production-financial-data/ledger.csv',
      clientIp: '192.168.10.25',
      region: 'us-east-1',
      mfaAuthenticated: false
    }

    const result = evaluateCloudPolicies(context)
    expect(result.allowed).toBe(true)
  })
})
