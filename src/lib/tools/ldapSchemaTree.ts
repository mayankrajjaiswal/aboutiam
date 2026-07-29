export type OuNodeType = 'ou' | 'group' | 'user'

export interface OuNode {
  id: string
  name: string
  type: OuNodeType
  /** GPO applied directly at this node (only meaningful for 'ou' nodes). */
  gpoApplied?: string
  /** When true, GPOs inherited from ancestor OUs stop cascading past this node (only meaningful for 'ou' nodes). */
  blockInheritance?: boolean
  children: OuNode[]
}

export const ROOT_DOMAIN_DN = 'dc=aboutiam,dc=local'

let idCounter = 0

export function createOuNode(name: string, type: OuNodeType): OuNode {
  idCounter += 1
  return { id: `${type}-${idCounter}-${name.toLowerCase().replace(/\s+/g, '-')}`, name, type, children: [] }
}

export function createRootTree(): OuNode {
  return { id: 'root', name: 'aboutiam', type: 'ou', children: [] }
}

function mapNode(tree: OuNode, id: string, transform: (node: OuNode) => OuNode): OuNode {
  if (tree.id === id) return transform(tree)
  return { ...tree, children: tree.children.map((child) => mapNode(child, id, transform)) }
}

export function addChild(tree: OuNode, parentId: string, child: OuNode): OuNode {
  return mapNode(tree, parentId, (node) => ({ ...node, children: [...node.children, child] }))
}

export function removeNode(tree: OuNode, id: string): OuNode {
  return {
    ...tree,
    children: tree.children.filter((child) => child.id !== id).map((child) => removeNode(child, id)),
  }
}

export function applyGpo(tree: OuNode, id: string, gpoName: string): OuNode {
  return mapNode(tree, id, (node) => (node.type === 'ou' ? { ...node, gpoApplied: gpoName } : node))
}

export function removeGpo(tree: OuNode, id: string): OuNode {
  return mapNode(tree, id, (node) => {
    const rest = { ...node }
    delete rest.gpoApplied
    return rest
  })
}

export function toggleBlockInheritance(tree: OuNode, id: string): OuNode {
  return mapNode(tree, id, (node) => (node.type === 'ou' ? { ...node, blockInheritance: !node.blockInheritance } : node))
}

export function findNode(tree: OuNode, id: string): OuNode | null {
  if (tree.id === id) return tree
  for (const child of tree.children) {
    const found = findNode(child, id)
    if (found) return found
  }
  return null
}

/**
 * Walks every node and computes the GPOs that are actually in effect there —
 * every ancestor's directly-applied GPO, cascading down, EXCEPT that an OU
 * with blockInheritance=true stops GPOs from ITS ancestors from reaching it
 * (or anything below it), while a GPO applied directly on that same OU still
 * takes effect (mirrors real AD Group Policy inheritance/blocking semantics).
 */
export function computeEffectiveGpos(tree: OuNode): Map<string, string[]> {
  const result = new Map<string, string[]>()

  function walk(node: OuNode, inheritedFromAncestors: string[]) {
    const ownGpo = node.gpoApplied ? [node.gpoApplied] : []
    const effective = node.blockInheritance ? ownGpo : [...inheritedFromAncestors, ...ownGpo]
    result.set(node.id, effective)
    const passedToChildren = node.blockInheritance ? ownGpo : effective
    for (const child of node.children) walk(child, passedToChildren)
  }

  walk(tree, [])
  return result
}

export function buildDn(tree: OuNode, id: string): string | null {
  function search(node: OuNode, ancestry: string[]): string[] | null {
    const prefix = node.type === 'ou' ? `ou=${node.name}` : `cn=${node.name}`
    const nextAncestry = node.id === 'root' ? ancestry : [prefix, ...ancestry]
    if (node.id === id) return nextAncestry
    for (const child of node.children) {
      const found = search(child, nextAncestry)
      if (found) return found
    }
    return null
  }

  const parts = search(tree, [])
  if (!parts) return null
  return [...parts, ROOT_DOMAIN_DN].join(',')
}
