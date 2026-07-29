import { describe, it, expect } from 'vitest'
import {
  createRootTree,
  createOuNode,
  addChild,
  removeNode,
  applyGpo,
  toggleBlockInheritance,
  computeEffectiveGpos,
  buildDn,
  findNode,
} from './ldapSchemaTree'

describe('ldapSchemaTree mutations', () => {
  it('adds a child OU under the root and can find it', () => {
    const root = createRootTree()
    const engineering = createOuNode('Engineering', 'ou')
    const tree = addChild(root, root.id, engineering)
    expect(findNode(tree, engineering.id)?.name).toBe('Engineering')
  })

  it('removes a node and its descendants', () => {
    const root = createRootTree()
    const engineering = createOuNode('Engineering', 'ou')
    let tree = addChild(root, root.id, engineering)
    const alice = createOuNode('alice', 'user')
    tree = addChild(tree, engineering.id, alice)

    tree = removeNode(tree, engineering.id)
    expect(findNode(tree, engineering.id)).toBeNull()
    expect(findNode(tree, alice.id)).toBeNull()
  })

  it('does not mutate the original tree (immutable updates)', () => {
    const root = createRootTree()
    const engineering = createOuNode('Engineering', 'ou')
    const tree = addChild(root, root.id, engineering)
    expect(root.children).toHaveLength(0)
    expect(tree.children).toHaveLength(1)
  })
})

describe('buildDn', () => {
  it('builds a correct DN for a nested OU', () => {
    const root = createRootTree()
    const offices = createOuNode('Offices', 'ou')
    let tree = addChild(root, root.id, offices)
    const engineering = createOuNode('Engineering', 'ou')
    tree = addChild(tree, offices.id, engineering)

    expect(buildDn(tree, engineering.id)).toBe('ou=Engineering,ou=Offices,dc=aboutiam,dc=local')
  })

  it('builds a correct DN for a user leaf using cn=', () => {
    const root = createRootTree()
    const engineering = createOuNode('Engineering', 'ou')
    let tree = addChild(root, root.id, engineering)
    const alice = createOuNode('alice', 'user')
    tree = addChild(tree, engineering.id, alice)

    expect(buildDn(tree, alice.id)).toBe('cn=alice,ou=Engineering,dc=aboutiam,dc=local')
  })

  it('returns null for an id not present in the tree', () => {
    const root = createRootTree()
    expect(buildDn(root, 'does-not-exist')).toBeNull()
  })
})

describe('computeEffectiveGpos (inheritance and blocking)', () => {
  it('cascades a GPO applied at a parent OU down to child OUs', () => {
    const root = createRootTree()
    const parent = createOuNode('Parent', 'ou')
    let tree = addChild(root, root.id, parent)
    const child = createOuNode('Child', 'ou')
    tree = addChild(tree, parent.id, child)

    tree = applyGpo(tree, parent.id, 'Baseline Security Policy')
    const effective = computeEffectiveGpos(tree)

    expect(effective.get(parent.id)).toEqual(['Baseline Security Policy'])
    expect(effective.get(child.id)).toEqual(['Baseline Security Policy'])
  })

  it('blocking inheritance at a child stops the parent GPO from reaching it', () => {
    const root = createRootTree()
    const parent = createOuNode('Parent', 'ou')
    let tree = addChild(root, root.id, parent)
    const child = createOuNode('Child', 'ou')
    tree = addChild(tree, parent.id, child)

    tree = applyGpo(tree, parent.id, 'Baseline Security Policy')
    tree = toggleBlockInheritance(tree, child.id)
    const effective = computeEffectiveGpos(tree)

    expect(effective.get(child.id)).toEqual([])
  })

  it('a GPO applied directly on a blocking OU still applies to that OU', () => {
    const root = createRootTree()
    const parent = createOuNode('Parent', 'ou')
    let tree = addChild(root, root.id, parent)
    const child = createOuNode('Child', 'ou')
    tree = addChild(tree, parent.id, child)

    tree = applyGpo(tree, parent.id, 'Baseline Security Policy')
    tree = toggleBlockInheritance(tree, child.id)
    tree = applyGpo(tree, child.id, 'Child-Specific Policy')
    const effective = computeEffectiveGpos(tree)

    expect(effective.get(child.id)).toEqual(['Child-Specific Policy'])
  })

  it('a blocked OU does not pass the blocked-out ancestor GPO further down either', () => {
    const root = createRootTree()
    const parent = createOuNode('Parent', 'ou')
    let tree = addChild(root, root.id, parent)
    const child = createOuNode('Child', 'ou')
    tree = addChild(tree, parent.id, child)
    const grandchild = createOuNode('Grandchild', 'ou')
    tree = addChild(tree, child.id, grandchild)

    tree = applyGpo(tree, parent.id, 'Baseline Security Policy')
    tree = toggleBlockInheritance(tree, child.id)
    const effective = computeEffectiveGpos(tree)

    expect(effective.get(grandchild.id)).toEqual([])
  })
})
