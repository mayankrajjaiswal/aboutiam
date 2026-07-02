import { describe, expect, it } from 'vitest'
import { createCondition, createEmptyGroup, escapeLdapValue, serializeLdapNode } from './ldapFilter'
import type { LdapCondition } from './ldapFilter'

describe('serializeLdapNode', () => {
  it('serializes a single condition', () => {
    const condition: LdapCondition = { type: 'condition', attribute: 'objectClass', operator: '=', value: 'user' }
    expect(serializeLdapNode(condition)).toBe('(objectClass=user)')
  })

  it('serializes an AND group of two conditions', () => {
    const group = createEmptyGroup('AND')
    group.children.push(
      { type: 'condition', attribute: 'objectClass', operator: '=', value: 'user' },
      { type: 'condition', attribute: 'memberOf', operator: '=', value: 'cn=Admins,ou=Groups,dc=corp,dc=com' }
    )
    expect(serializeLdapNode(group)).toBe('(&(objectClass=user)(memberOf=cn=Admins,ou=Groups,dc=corp,dc=com))')
  })

  it('serializes an OR group', () => {
    const group = createEmptyGroup('OR')
    group.children.push(
      { type: 'condition', attribute: 'mail', operator: '=', value: 'a@example.com' },
      { type: 'condition', attribute: 'mail', operator: '=', value: 'b@example.com' }
    )
    expect(serializeLdapNode(group)).toBe('(|(mail=a@example.com)(mail=b@example.com))')
  })

  it('serializes a NOT group around a single child', () => {
    const group = createEmptyGroup('NOT')
    group.children.push({ type: 'condition', attribute: 'accountDisabled', operator: '=', value: 'TRUE' })
    expect(serializeLdapNode(group)).toBe('(!(accountDisabled=TRUE))')
  })

  it('supports nested groups', () => {
    const inner = createEmptyGroup('OR')
    inner.children.push(
      { type: 'condition', attribute: 'department', operator: '=', value: 'Engineering' },
      { type: 'condition', attribute: 'department', operator: '=', value: 'Security' }
    )
    const outer = createEmptyGroup('AND')
    outer.children.push({ type: 'condition', attribute: 'objectClass', operator: '=', value: 'user' }, inner)
    expect(serializeLdapNode(outer)).toBe('(&(objectClass=user)(|(department=Engineering)(department=Security)))')
  })

  it('skips a condition with no attribute set yet', () => {
    expect(serializeLdapNode(createCondition())).toBe('')
  })
})

describe('escapeLdapValue', () => {
  it('escapes RFC 4515 special characters', () => {
    expect(escapeLdapValue('a*b(c)d\\e')).toBe('a\\2ab\\28c\\29d\\5ce')
  })
})
