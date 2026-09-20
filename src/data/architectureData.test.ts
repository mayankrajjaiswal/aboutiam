import { describe, it, expect } from 'vitest'
import { ARCHITECTURES } from './architectureData'

describe('ARCHITECTURES', () => {
  it('has unique ids', () => {
    const ids = ARCHITECTURES.map((a) => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every architecture has at least 3 nodes, each with all required fields non-empty', () => {
    for (const arch of ARCHITECTURES) {
      const nodeEntries = Object.entries(arch.nodes)
      expect(nodeEntries.length).toBeGreaterThanOrEqual(3)
      for (const [, node] of nodeEntries) {
        expect(node.title.length).toBeGreaterThan(0)
        expect(node.role.length).toBeGreaterThan(0)
        expect(node.analogy.length).toBeGreaterThan(0)
        expect(node.spec.length).toBeGreaterThan(0)
        expect(node.threatModel.length).toBeGreaterThan(0)
        expect(node.bestPractice.length).toBeGreaterThan(0)
      }
    }
  })

  it('every architecture\'s defaultNode resolves to a real node key', () => {
    for (const arch of ARCHITECTURES) {
      expect(Object.keys(arch.nodes)).toContain(arch.defaultNode)
    }
  })

  it('every relatedResources entry, when present, has a root-relative path', () => {
    for (const arch of ARCHITECTURES) {
      for (const resource of arch.relatedResources ?? []) {
        expect(resource.path.startsWith('/')).toBe(true)
      }
    }
  })

  it('includes the 2 Next-Gen IAM reference architectures', () => {
    const ids = ['agentic_enterprise', 'wallet_relying_party']
    for (const id of ids) {
      const arch = ARCHITECTURES.find((a) => a.id === id)
      expect(arch).toBeTruthy()
      expect(arch?.difficulty).toBe('Advanced')
    }
  })
})
