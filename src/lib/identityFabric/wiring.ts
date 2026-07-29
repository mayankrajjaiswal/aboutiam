import type { FabricScenario } from '../../data/identityFabricScenarios'

export type FabricNodeId = 'app' | 'orchestration' | 'idp'

export interface FabricEdge {
  fromId: FabricNodeId
  toId: FabricNodeId
}

export interface WiringResult {
  success: boolean
  message: string
  translationLog: string[]
}

function hasEdgeBetween(edges: FabricEdge[], a: FabricNodeId, b: FabricNodeId): boolean {
  return edges.some((e) => (e.fromId === a && e.toId === b) || (e.fromId === b && e.toId === a))
}

/**
 * Evaluates the current set of wires a user has drawn between the fixed
 * App / Orchestration / IdP nodes against the active scenario. A direct
 * App<->IdP wire that bypasses the orchestration node always fails, since
 * the two ends speak different protocols and nothing translates between
 * them -- mirroring the real reason an orchestration/identity-fabric layer
 * exists at all.
 */
export function attemptWiring(edges: FabricEdge[], scenario: FabricScenario): WiringResult {
  const appToOrchestration = hasEdgeBetween(edges, 'app', 'orchestration')
  const orchestrationToIdp = hasEdgeBetween(edges, 'orchestration', 'idp')
  const directAppToIdp = hasEdgeBetween(edges, 'app', 'idp')

  if (directAppToIdp) {
    return {
      success: false,
      message: `Direct connection failed: "${scenario.appName}" speaks ${scenario.appProtocol}, but "${scenario.idpName}" only speaks ${scenario.idpProtocol}. An Orchestration Node is required to translate between the two protocols.`,
      translationLog: [],
    }
  }

  if (appToOrchestration && orchestrationToIdp) {
    return {
      success: true,
      message: 'Wiring complete — the orchestration node bridges the protocol mismatch.',
      translationLog: scenario.translationSteps,
    }
  }

  const missing: string[] = []
  if (!appToOrchestration) missing.push(`${scenario.appName} → Orchestration Node`)
  if (!orchestrationToIdp) missing.push(`Orchestration Node → ${scenario.idpName}`)

  return {
    success: false,
    message: `Incomplete wiring — still missing: ${missing.join(', ')}.`,
    translationLog: [],
  }
}
