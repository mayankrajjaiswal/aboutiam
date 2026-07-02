import { describe, expect, it } from 'vitest'
import {
  buildSampleScimGroup,
  buildSampleScimUser,
  validateScimGroup,
  validateScimUser,
} from './scimSchema'

// Payload shapes drawn from RFC 7643 §8's own examples.
describe('validateScimUser', () => {
  it('accepts a minimal, spec-correct User payload', () => {
    expect(validateScimUser(buildSampleScimUser())).toEqual([])
  })

  it('flags a missing schemas array', () => {
    const errors = validateScimUser({ userName: 'jdoe' })
    expect(errors.some((e) => e.path === 'schemas')).toBe(true)
  })

  it('flags a missing userName', () => {
    const errors = validateScimUser({ schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'] })
    expect(errors.some((e) => e.path === 'userName')).toBe(true)
  })

  it('flags a malformed emails array', () => {
    const errors = validateScimUser({
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
      userName: 'jdoe',
      emails: ['not-an-object'],
    })
    expect(errors.some((e) => e.path === 'emails[0]')).toBe(true)
  })

  it('rejects a non-object payload', () => {
    expect(validateScimUser('not json')[0].path).toBe('$')
  })
})

describe('validateScimGroup', () => {
  it('accepts a minimal, spec-correct Group payload', () => {
    expect(validateScimGroup(buildSampleScimGroup())).toEqual([])
  })

  it('flags a missing displayName', () => {
    const errors = validateScimGroup({ schemas: ['urn:ietf:params:scim:schemas:core:2.0:Group'] })
    expect(errors.some((e) => e.path === 'displayName')).toBe(true)
  })

  it('flags malformed members', () => {
    const errors = validateScimGroup({
      schemas: ['urn:ietf:params:scim:schemas:core:2.0:Group'],
      displayName: 'Engineering',
      members: [{ id: 'missing-value-field' }],
    })
    expect(errors.some((e) => e.path === 'members[0]')).toBe(true)
  })
})
