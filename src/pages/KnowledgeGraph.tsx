import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Waypoints, Search, ArrowUpRight, X } from 'lucide-react'
import {
  KNOWLEDGE_GRAPH_NODES,
  KNOWLEDGE_GRAPH_EDGES,
  getKnowledgeGraphNode,
  getNeighborIds,
  type KnowledgeGraphNode,
  type KnowledgeGraphNodeType,
} from '../data/knowledgeGraphData'

type TypeFilter = 'all' | KnowledgeGraphNodeType

const TYPE_META: Record<KnowledgeGraphNodeType, { label: string; dot: string; fill: string; text: string; bg: string; border: string }> = {
  standard: { label: 'Standard', dot: 'bg-accent-primary', fill: 'fill-accent-primary', text: 'text-accent-primary', bg: 'bg-accent-primary/10', border: 'border-accent-primary/30' },
  term: { label: 'Term', dot: 'bg-accent-secondary', fill: 'fill-accent-secondary', text: 'text-accent-secondary', bg: 'bg-accent-secondary/10', border: 'border-accent-secondary/30' },
  architecture: { label: 'Architecture', dot: 'bg-status-warning', fill: 'fill-status-warning', text: 'text-status-warning', bg: 'bg-status-warning/10', border: 'border-status-warning/30' },
}

const FILTERS: { key: TypeFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'standard', label: 'Standards' },
  { key: 'term', label: 'Terms' },
  { key: 'architecture', label: 'Architectures' },
]

interface PositionedNode {
  node: KnowledgeGraphNode
  x: number
  y: number
}

const VIEWBOX_SIZE = 1000
const CENTER = VIEWBOX_SIZE / 2
const RING_RADIUS: Record<KnowledgeGraphNodeType, number> = {
  standard: 160,
  term: 320,
  architecture: 460,
}

function useGraphLayout(): { positions: Map<string, PositionedNode> } {
  return useMemo(() => {
    const byType: Record<KnowledgeGraphNodeType, KnowledgeGraphNode[]> = { standard: [], term: [], architecture: [] }
    for (const node of KNOWLEDGE_GRAPH_NODES) byType[node.type].push(node)
    for (const type of Object.keys(byType) as KnowledgeGraphNodeType[]) {
      byType[type].sort((a, b) => a.label.localeCompare(b.label))
    }

    const positions = new Map<string, PositionedNode>()
    for (const type of Object.keys(byType) as KnowledgeGraphNodeType[]) {
      const nodes = byType[type]
      const radius = RING_RADIUS[type]
      nodes.forEach((node, index) => {
        const angle = (index / nodes.length) * 2 * Math.PI - Math.PI / 2
        positions.set(node.id, {
          node,
          x: CENTER + radius * Math.cos(angle),
          y: CENTER + radius * Math.sin(angle),
        })
      })
    }
    return { positions }
  }, [])
}

export default function KnowledgeGraph() {
  const { positions } = useGraphLayout()
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const visibleIds = useMemo(() => {
    if (typeFilter === 'all') return new Set(KNOWLEDGE_GRAPH_NODES.map((n) => n.id))
    return new Set(KNOWLEDGE_GRAPH_NODES.filter((n) => n.type === typeFilter).map((n) => n.id))
  }, [typeFilter])

  const filteredNodes = useMemo(() => {
    const q = query.trim().toLowerCase()
    return KNOWLEDGE_GRAPH_NODES
      .filter((n) => visibleIds.has(n.id))
      .filter((n) => q === '' || n.label.toLowerCase().includes(q))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [visibleIds, query])

  const selectedNode = selectedId ? getKnowledgeGraphNode(selectedId) : undefined
  const neighborNodes = selectedId
    ? getNeighborIds(selectedId).map(getKnowledgeGraphNode).filter((n): n is KnowledgeGraphNode => Boolean(n))
    : []

  const activeId = hoveredId ?? selectedId
  const activeNeighbors = activeId ? new Set(getNeighborIds(activeId)) : null

  const selectNode = (id: string) => {
    setSelectedId(id)
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-accent-glow text-accent-primary border border-accent-primary/10">
            <Waypoints className="w-5 h-5" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-text-primary">Knowledge Graph</h1>
        </div>
        <p className="text-sm text-text-secondary leading-relaxed max-w-3xl">
          See how IAM concepts connect: Standards, Encyclopedia terms, and Architecture Center blueprints, mapped by
          relationship. Search or tap a node — or use the list below the map — to explore its neighbors and jump
          straight to the matching page.
        </p>
      </div>

      {/* Controls: search + type filter chips */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search concepts, e.g. JWT, SAML, Zero Trust..."
            aria-label="Search the knowledge graph"
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border-subtle bg-bg-card text-text-primary text-sm placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/40"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setTypeFilter(f.key)}
              aria-pressed={typeFilter === f.key}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                typeFilter === f.key
                  ? 'bg-accent-primary border-accent-primary text-white'
                  : 'bg-bg-card border-border-subtle text-text-secondary hover:bg-bg-nested'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        {/* Graph visualization */}
        <div className="rounded-2xl border border-border-subtle bg-bg-card p-2 sm:p-4">
          <svg
            viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
            className="w-full h-90 sm:h-115 lg:h-150"
            role="img"
            aria-label="Graph of connected IAM standards, terms, and architectures"
          >
            <g>
              {KNOWLEDGE_GRAPH_EDGES.map(([a, b]) => {
                if (!visibleIds.has(a) || !visibleIds.has(b)) return null
                const posA = positions.get(a)
                const posB = positions.get(b)
                if (!posA || !posB) return null
                const isActiveEdge = activeId !== null && (a === activeId || b === activeId)
                return (
                  <line
                    key={`${a}|${b}`}
                    x1={posA.x}
                    y1={posA.y}
                    x2={posB.x}
                    y2={posB.y}
                    className={isActiveEdge ? 'stroke-accent-primary' : 'stroke-border-subtle'}
                    strokeWidth={isActiveEdge ? 2.5 : 1}
                    opacity={activeId === null ? 0.5 : isActiveEdge ? 0.9 : 0.12}
                  />
                )
              })}
            </g>
            <g>
              {Array.from(positions.values())
                .filter((p) => visibleIds.has(p.node.id))
                .map(({ node, x, y }) => {
                  const meta = TYPE_META[node.type]
                  const isActive = node.id === activeId
                  const isDimmed = activeId !== null && !isActive && !activeNeighbors?.has(node.id)
                  return (
                    <g
                      key={node.id}
                      role="button"
                      tabIndex={0}
                      aria-label={`${node.label} node`}
                      onClick={() => selectNode(node.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          selectNode(node.id)
                        }
                      }}
                      onMouseEnter={() => setHoveredId(node.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      className="cursor-pointer focus:outline-none"
                      opacity={isDimmed ? 0.25 : 1}
                    >
                      <title>{node.label}</title>
                      <circle
                        cx={x}
                        cy={y}
                        r={isActive ? 13 : 8}
                        className={meta.fill}
                        stroke={node.id === selectedId ? 'white' : 'none'}
                        strokeWidth={node.id === selectedId ? 2 : 0}
                      />
                    </g>
                  )
                })}
            </g>
          </svg>
          <div className="flex flex-wrap gap-4 justify-center pt-2 border-t border-border-subtle mt-2">
            {(Object.keys(TYPE_META) as KnowledgeGraphNodeType[]).map((type) => (
              <span key={type} className="inline-flex items-center gap-1.5 text-[11px] text-text-secondary font-semibold">
                <span className={`w-2.5 h-2.5 rounded-full ${TYPE_META[type].dot}`} />
                {TYPE_META[type].label}
              </span>
            ))}
          </div>
        </div>

        {/* Search results + detail panel */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border-subtle bg-bg-card p-4 space-y-2">
            <span className="text-[10px] font-black text-text-muted uppercase tracking-wider">
              {filteredNodes.length} concept{filteredNodes.length === 1 ? '' : 's'}
            </span>
            <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
              {filteredNodes.length === 0 && (
                <p className="text-xs text-text-muted py-4 text-center">No concepts match your search.</p>
              )}
              {filteredNodes.map((node) => {
                const meta = TYPE_META[node.type]
                return (
                  <button
                    key={node.id}
                    type="button"
                    onClick={() => selectNode(node.id)}
                    aria-label={`Open ${node.label} details`}
                    className={`w-full flex items-center gap-2 text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      selectedId === node.id
                        ? 'bg-accent-glow text-accent-primary'
                        : 'text-text-secondary hover:bg-bg-nested'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${meta.dot}`} />
                    <span className="truncate">{node.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {selectedNode ? (
            <div className="rounded-2xl border border-border-subtle bg-bg-card p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <span
                    className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border inline-block ${TYPE_META[selectedNode.type].bg} ${TYPE_META[selectedNode.type].text} ${TYPE_META[selectedNode.type].border}`}
                  >
                    {TYPE_META[selectedNode.type].label}
                  </span>
                  <h2 className="text-base font-black text-text-primary">{selectedNode.label}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  aria-label="Clear selection"
                  className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-bg-nested transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">{selectedNode.description}</p>
              <Link
                to={selectedNode.path}
                className="inline-flex items-center gap-1 text-xs font-bold text-accent-primary hover:text-accent-hover"
              >
                Open full page
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>

              {neighborNodes.length > 0 && (
                <div className="pt-3 border-t border-border-subtle space-y-2">
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-wider">
                    Connected concepts
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {neighborNodes.map((neighbor) => (
                      <button
                        key={neighbor.id}
                        type="button"
                        onClick={() => selectNode(neighbor.id)}
                        aria-label={`Open ${neighbor.label} details`}
                        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-[11px] font-semibold transition-colors cursor-pointer ${TYPE_META[neighbor.type].bg} ${TYPE_META[neighbor.type].text} ${TYPE_META[neighbor.type].border} hover:opacity-80`}
                      >
                        {neighbor.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border-subtle p-6 text-center space-y-1">
              <p className="text-xs text-text-secondary">
                Select a concept from the map or the list above to see how it connects.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
