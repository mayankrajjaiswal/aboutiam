import { describe, it, expect } from 'vitest'
import { evaluateAccessRequest } from './accessRequestApproval'
import { getCatalogItem } from '../../data/accessRequestCatalog'

describe('evaluateAccessRequest', () => {
  it('a clean, standard-level request auto-approves with only manager approval', () => {
    const result = evaluateAccessRequest([getCatalogItem('app-read')!])
    expect(result.autoApproved).toBe(true)
    expect(result.hasConflict).toBe(false)
    expect(result.steps).toHaveLength(1)
    expect(result.steps[0].approver).toBe('manager')
    expect(result.steps[0].status).toBe('approved')
  })

  it('a privileged item requires app-owner approval and is not auto-approved', () => {
    const result = evaluateAccessRequest([getCatalogItem('domain-admin')!])
    expect(result.autoApproved).toBe(false)
    expect(result.steps.some((s) => s.approver === 'app-owner')).toBe(true)
  })

  it('a conflicting combination within the cart is flagged and blocked pending compliance override', () => {
    const result = evaluateAccessRequest([getCatalogItem('invoice-approver')!, getCatalogItem('payment-issuer')!])
    expect(result.hasConflict).toBe(true)
    expect(result.autoApproved).toBe(false)
    const complianceStep = result.steps.find((s) => s.approver === 'compliance-officer')
    expect(complianceStep?.status).toBe('pending')
  })

  it('a conflict against existing access (not just the cart) is also detected', () => {
    const result = evaluateAccessRequest([getCatalogItem('payment-issuer')!], ['invoice-approver'])
    expect(result.hasConflict).toBe(true)
    expect(result.conflicts[0]).toEqual({ requestedId: 'payment-issuer', conflictsWithId: 'invoice-approver' })
  })

  it('does not flag a conflict for non-conflicting items', () => {
    const result = evaluateAccessRequest([getCatalogItem('app-read')!, getCatalogItem('vpn-access')!])
    expect(result.hasConflict).toBe(false)
  })

  it('manager approval is always the first step regardless of cart contents', () => {
    const result = evaluateAccessRequest([getCatalogItem('domain-admin')!, getCatalogItem('invoice-approver')!, getCatalogItem('payment-issuer')!])
    expect(result.steps[0].approver).toBe('manager')
  })

  it('handles an empty cart without throwing', () => {
    const result = evaluateAccessRequest([])
    expect(result.autoApproved).toBe(true)
    expect(result.steps).toHaveLength(1)
  })
})
