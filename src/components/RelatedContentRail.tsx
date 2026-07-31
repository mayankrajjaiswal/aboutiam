import { Link } from 'react-router-dom'
import { Waypoints, ArrowUpRight } from 'lucide-react'
import { getKnowledgeGraphNode, getNeighborIds, type KnowledgeGraphNodeType } from '../data/knowledgeGraphData'

interface RelatedContentRailProps {
  /** Knowledge Graph node id, e.g. `term:oauth`, `standard:oauth21`, `architecture:zero_trust`. */
  nodeId: string
  /** Max neighbors to show (default 4). */
  limit?: number
}

const TYPE_LABEL: Record<KnowledgeGraphNodeType, string> = {
  standard: 'Standard',
  term: 'Term',
  architecture: 'Architecture',
}

/**
 * "You might also like" strip populated from the hand-curated Knowledge Graph
 * relationship edges (src/data/knowledgeGraphData.ts) — surfaces them
 * contextually on the content pages themselves, instead of only on the
 * standalone /knowledge-graph view. Renders nothing if `nodeId` has no graph
 * entry yet (graceful degradation — not every page needs to be in the graph).
 */
export default function RelatedContentRail({ nodeId, limit = 4 }: RelatedContentRailProps) {
  const node = getKnowledgeGraphNode(nodeId)
  if (!node) return null

  const neighbors = getNeighborIds(nodeId)
    .map(getKnowledgeGraphNode)
    .filter((n): n is NonNullable<typeof n> => Boolean(n))
    .slice(0, limit)

  if (neighbors.length === 0) return null

  return (
    <section className="space-y-3 pt-4 border-t border-border-subtle">
      <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
        <Waypoints className="w-4 h-4 text-accent-primary" /> You Might Also Like
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {neighbors.map((neighbor) => (
          <Link
            key={neighbor.id}
            to={neighbor.path}
            className="group p-3 rounded-xl border border-border-subtle bg-bg-nested/30 hover:border-accent-primary/30 hover:bg-bg-nested transition-all flex flex-col justify-between"
          >
            <span className="text-[9px] font-black text-accent-primary uppercase tracking-wider">{TYPE_LABEL[neighbor.type]}</span>
            <span className="text-xs font-bold text-text-primary group-hover:text-accent-primary truncate">{neighbor.label}</span>
            <span className="inline-flex items-center gap-1 text-[10px] text-text-muted mt-1">
              Open <ArrowUpRight className="w-3 h-3" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
