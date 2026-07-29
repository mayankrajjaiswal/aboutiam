import { describe, it, expect } from 'vitest'
import { createRootTree, createOuNode, addChild } from './ldapSchemaTree'
import { exportTreeToLdif } from './ldifExport'

const DN_LINE = /^dn: [a-zA-Z0-9]+=[^,\n]+(,[a-zA-Z0-9]+=[^,\n]+)*$/

function buildSampleTree() {
  const root = createRootTree()
  const offices = createOuNode('Offices', 'ou')
  let tree = addChild(root, root.id, offices)
  const engineering = createOuNode('Engineering', 'ou')
  tree = addChild(tree, offices.id, engineering)
  const alice = createOuNode('alice', 'user')
  tree = addChild(tree, engineering.id, alice)
  const group = createOuNode('Engineering_Grp', 'group')
  tree = addChild(tree, offices.id, group)
  return tree
}

describe('exportTreeToLdif', () => {
  it('produces one blank-line-separated block per non-root node', () => {
    const tree = buildSampleTree()
    const ldif = exportTreeToLdif(tree)
    const blocks = ldif.split('\n\n')
    expect(blocks).toHaveLength(4)
  })

  it('every block starts with a syntactically valid dn: line', () => {
    const tree = buildSampleTree()
    const ldif = exportTreeToLdif(tree)
    const blocks = ldif.split('\n\n')
    for (const block of blocks) {
      const firstLine = block.split('\n')[0]
      expect(firstLine).toMatch(DN_LINE)
    }
  })

  it('every block declares at least one objectClass', () => {
    const tree = buildSampleTree()
    const ldif = exportTreeToLdif(tree)
    const blocks = ldif.split('\n\n')
    for (const block of blocks) {
      expect(block).toContain('objectClass:')
    }
  })

  it('OU blocks use "ou:" and user/group blocks use "cn:" as the naming attribute', () => {
    const tree = buildSampleTree()
    const ldif = exportTreeToLdif(tree)
    expect(ldif).toContain('ou: Offices')
    expect(ldif).toContain('ou: Engineering')
    expect(ldif).toContain('cn: alice')
    expect(ldif).toContain('cn: Engineering_Grp')
  })

  it('excludes the synthetic root node from the export', () => {
    const tree = buildSampleTree()
    const ldif = exportTreeToLdif(tree)
    expect(ldif).not.toContain('dn: ou=aboutiam')
  })

  it('produces an empty string for a tree with no children', () => {
    const root = createRootTree()
    expect(exportTreeToLdif(root)).toBe('')
  })
})
