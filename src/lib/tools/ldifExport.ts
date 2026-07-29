import type { OuNode, OuNodeType } from './ldapSchemaTree'
import { buildDn } from './ldapSchemaTree'

const OBJECT_CLASSES: Record<OuNodeType, string[]> = {
  ou: ['top', 'organizationalUnit'],
  group: ['top', 'groupOfNames'],
  user: ['top', 'person', 'organizationalPerson', 'user'],
}

function nodeToLdifBlock(tree: OuNode, node: OuNode): string | null {
  const dn = buildDn(tree, node.id)
  if (!dn) return null

  const lines = [`dn: ${dn}`]
  for (const objectClass of OBJECT_CLASSES[node.type]) {
    lines.push(`objectClass: ${objectClass}`)
  }
  lines.push(node.type === 'ou' ? `ou: ${node.name}` : `cn: ${node.name}`)
  if (node.type === 'ou' && node.gpoApplied) {
    lines.push(`; linkedGPO: ${node.gpoApplied}`)
  }
  return lines.join('\n')
}

export function exportTreeToLdif(tree: OuNode): string {
  const blocks: string[] = []

  function walk(node: OuNode) {
    if (node.id !== 'root') {
      const block = nodeToLdifBlock(tree, node)
      if (block) blocks.push(block)
    }
    for (const child of node.children) walk(child)
  }

  walk(tree)
  return blocks.join('\n\n')
}
