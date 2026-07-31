import { useMemo, useState } from 'react'
import { Network, Eye, Undo2, Users, Server, KeyRound, Crown, UsersRound } from 'lucide-react'
import { usePlayground } from '../../lib/sdk/usePlayground'
import { PlaygroundShell } from '../../lib/sdk/components/PlaygroundShell'
import { TraceTerminal } from '../../lib/sdk/components/TraceTerminal'
import { ATTACK_PATH_SCENARIOS, type GraphNodeType } from '../../data/attackPathScenarios'
import { computeForceLayout, findShortestPath } from '../../lib/graph/forcePath'
import CoachMark from '../../components/CoachMark'

const GRAPH_WIDTH = 720
const GRAPH_HEIGHT = 460

const NODE_STYLE: Record<GraphNodeType, { fill: string; icon: typeof Users; label: string }> = {
  user: { fill: '#3b82f6', icon: Users, label: 'User' },
  group: { fill: '#a855f7', icon: UsersRound, label: 'Group' },
  'service-account': { fill: '#f59e0b', icon: KeyRound, label: 'Service Account' },
  machine: { fill: '#64748b', icon: Server, label: 'Machine' },
  target: { fill: '#ef4444', icon: Crown, label: 'Target' }
}

function edgeKey(source: string, target: string) {
  return `${source}->${target}`
}

export default function AttackPathGraph() {
  const {
    score,
    hintsRevealed,
    logs,
    currentStep,
    isCompleted,
    log,
    revealHint,
    adjustScore,
    completeStep,
    finishPlayground,
    resetPlayground
  } = usePlayground({
    moduleId: 'attack_path_graph',
    initialScore: 100,
    maxHints: 3
  })

  const [scenarioIndex, setScenarioIndex] = useState(0)
  const [hypothesisPath, setHypothesisPath] = useState<string[]>([])
  const [isRevealed, setIsRevealed] = useState(false)
  const [reachedTarget, setReachedTarget] = useState(false)

  const scenario = ATTACK_PATH_SCENARIOS[scenarioIndex]

  const nodeIds = useMemo(() => scenario.nodes.map((n) => n.id), [scenario])

  const positions = useMemo(
    () => computeForceLayout(nodeIds, scenario.edges, GRAPH_WIDTH, GRAPH_HEIGHT),
    [nodeIds, scenario]
  )

  const computedShortestPath = useMemo(
    () => findShortestPath(nodeIds, scenario.edges, scenario.startNodeId, scenario.targetNodeId) ?? [],
    [nodeIds, scenario]
  )

  const hypothesisEdgeKeys = useMemo(() => {
    const keys = new Set<string>()
    for (let i = 0; i < hypothesisPath.length - 1; i++) {
      keys.add(edgeKey(hypothesisPath[i], hypothesisPath[i + 1]))
    }
    return keys
  }, [hypothesisPath])

  const shortestPathEdgeKeys = useMemo(() => {
    const keys = new Set<string>()
    for (let i = 0; i < computedShortestPath.length - 1; i++) {
      keys.add(edgeKey(computedShortestPath[i], computedShortestPath[i + 1]))
    }
    return keys
  }, [computedShortestPath])

  const resetLocalPathState = () => {
    setHypothesisPath([])
    setIsRevealed(false)
    setReachedTarget(false)
  }

  const handleScenarioChange = (index: number) => {
    setScenarioIndex(index)
    resetLocalPathState()
    log('info', `Loaded scenario: "${ATTACK_PATH_SCENARIOS[index].title}".`)
  }

  const handleNodeClick = (nodeId: string) => {
    if (isCompleted || reachedTarget) return

    if (hypothesisPath.length === 0) {
      if (nodeId !== scenario.startNodeId) {
        log('warning', `Start your trace from the highlighted start node, not "${nodeId}".`)
        return
      }
      setHypothesisPath([nodeId])
      log('info', `Trace started at "${nodeId}".`)
      return
    }

    const last = hypothesisPath[hypothesisPath.length - 1]
    if (hypothesisPath.includes(nodeId)) {
      log('warning', `"${nodeId}" is already part of your trace — no cycles allowed.`)
      return
    }

    const hasEdge = scenario.edges.some((e) => e.source === last && e.target === nodeId)
    if (!hasEdge) {
      adjustScore(-5, `Invalid hop: there is no edge from "${last}" to "${nodeId}".`)
      return
    }

    const nextPath = [...hypothesisPath, nodeId]
    setHypothesisPath(nextPath)

    const edge = scenario.edges.find((e) => e.source === last && e.target === nodeId)!
    log('success', `Hop confirmed: ${last} → ${nodeId} (${edge.type}: ${edge.technique}).`)

    if (currentStep === 0) {
      completeStep(0, 'Checkpoint 1 verified: made your first valid hop along an edge.')
    }

    if (nodeId === scenario.targetNodeId) {
      setReachedTarget(true)
      const isOptimal = nextPath.length === computedShortestPath.length

      if (currentStep <= 1) {
        completeStep(1, `Checkpoint 2 verified: reached "${scenario.targetNodeId}" via a valid ${nextPath.length - 1}-hop path.`)
      }

      if (isOptimal) {
        adjustScore(20, 'Optimal path found — this is the shortest possible escalation route!')
        finishPlayground(
          `🎉 You traced the shortest privilege-escalation path from "${scenario.startNodeId}" to "${scenario.targetNodeId}" in exactly ${nextPath.length - 1} hops.`
        )
      } else {
        adjustScore(5, `Target reached in ${nextPath.length - 1} hops, but the shortest path is only ${computedShortestPath.length - 1} hops — try "Clear Trace" and look for a shorter route.`)
      }
    }
  }

  const handleRevealShortestPath = () => {
    if (!isRevealed) {
      adjustScore(-15, 'Shortest path revealed — score penalized for using the solution.')
    }
    setIsRevealed((prev) => !prev)
  }

  const handleRevealHint = () => {
    const hints = [
      `Click the highlighted start node first, then click nodes one hop at a time — you can only move along an existing arrow (edge).`,
      `Edge type matters: "AdminTo" and "HasSession" edges usually represent the most direct way to pivot to a new principal or machine.`,
      `Not every branch leads anywhere — some groups and machines are dead ends. If you reach a node with no further outgoing edges toward the target, use "Clear Trace" and try a different branch.`
    ]
    revealHint(hints[hintsRevealed])
  }

  return (
    <PlaygroundShell
      title="Identity Attack-Path Graph Visualizer"
      description="A BloodHound-style force-directed graph. Click the start node, then trace a hop-by-hop privilege-escalation path to the target by following the directed edges — MemberOf, AdminTo, HasSession, CanRDP, and Owns."
      score={score}
      hintsRevealed={hintsRevealed}
      currentStep={currentStep}
      totalSteps={2}
      isCompleted={isCompleted}
      onRevealHint={handleRevealHint}
      onReset={() => {
        resetLocalPathState()
        resetPlayground()
        log('info', 'Graph trace cleared.')
      }}
      sidebarContent={<TraceTerminal logs={logs} />}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {ATTACK_PATH_SCENARIOS.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => handleScenarioChange(idx)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                idx === scenarioIndex
                  ? 'bg-accent-glow border-accent-primary/40 text-accent-primary'
                  : 'bg-bg-nested border-border-subtle text-text-secondary hover:text-text-primary'
              }`}
            >
              {s.title} <span className="opacity-70">({s.difficulty})</span>
            </button>
          ))}
        </div>

        <p className="text-xs text-text-secondary leading-relaxed">{scenario.description}</p>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <Network className="w-4 h-4 text-accent-primary" />
            <span>
              Trace: <span className="font-mono font-bold text-text-primary">{hypothesisPath.join(' → ') || '(click start node)'}</span>
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={resetLocalPathState}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border-subtle bg-bg-nested text-text-secondary hover:text-text-primary text-xs font-bold"
            >
              <Undo2 className="w-3.5 h-3.5" /> Clear Trace
            </button>
            <button
              onClick={handleRevealShortestPath}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                isRevealed
                  ? 'bg-accent-glow border-accent-primary/40 text-accent-primary'
                  : 'bg-bg-nested border-border-subtle text-text-secondary hover:text-text-primary'
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> {isRevealed ? 'Hide Shortest Path' : 'Reveal Shortest Path'}
            </button>
          </div>
        </div>

        <div className="relative rounded-2xl border border-border-subtle bg-bg-nested overflow-x-auto">
          <CoachMark
            featureId="attack-path-graph"
            message="Click a start node, then click a connected node to extend the trace — follow directed edges (MemberOf, AdminTo, HasSession, CanRDP, Owns) toward the red target node."
          />
          <svg
            viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
            className="w-full min-w-[560px]"
            style={{ height: GRAPH_HEIGHT }}
            role="img"
            aria-label={`Attack path graph for scenario ${scenario.title}`}
          >
            {scenario.edges.map((edge) => {
              const a = positions[edge.source]
              const b = positions[edge.target]
              if (!a || !b) return null
              const key = edgeKey(edge.source, edge.target)
              const isHypothesis = hypothesisEdgeKeys.has(key)
              const isRevealedShortest = isRevealed && shortestPathEdgeKeys.has(key)
              const stroke = isRevealedShortest ? '#22c55e' : isHypothesis ? '#3b82f6' : '#94a3b8'
              const strokeWidth = isRevealedShortest || isHypothesis ? 2.5 : 1
              return (
                <line
                  key={edge.id}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  strokeOpacity={isRevealedShortest || isHypothesis ? 0.9 : 0.35}
                  data-testid={`graph-edge-${edge.id}`}
                />
              )
            })}

            {scenario.nodes.map((node) => {
              const pos = positions[node.id]
              if (!pos) return null
              const style = NODE_STYLE[node.type]
              const isStart = node.id === scenario.startNodeId
              const isTarget = node.id === scenario.targetNodeId
              const isInHypothesis = hypothesisPath.includes(node.id)
              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onClick={() => handleNodeClick(node.id)}
                  style={{ cursor: 'pointer' }}
                  data-testid={`graph-node-${node.id}`}
                >
                  <circle
                    r={isTarget ? 16 : 12}
                    fill={style.fill}
                    stroke={isStart ? '#facc15' : isInHypothesis ? '#3b82f6' : 'white'}
                    strokeWidth={isStart || isInHypothesis ? 3 : 1.5}
                    opacity={0.92}
                  />
                  <text
                    y={isTarget ? 28 : 24}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="700"
                    fill="currentColor"
                    className="text-text-primary select-none"
                  >
                    {node.label}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        <div className="flex flex-wrap gap-3 text-[10px] text-text-secondary">
          {(Object.entries(NODE_STYLE) as [GraphNodeType, typeof NODE_STYLE[GraphNodeType]][]).map(([type, style]) => (
            <span key={type} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: style.fill }} />
              {style.label}
            </span>
          ))}
        </div>

        {isRevealed && (
          <div className="p-4 rounded-2xl bg-bg-card border border-border-subtle space-y-2">
            <h4 className="text-xs font-bold text-text-primary uppercase tracking-wider">Real-World Technique Breakdown</h4>
            <ol className="space-y-1.5 text-xs text-text-secondary">
              {computedShortestPath.slice(0, -1).map((nodeId, idx) => {
                const nextId = computedShortestPath[idx + 1]
                const edge = scenario.edges.find((e) => e.source === nodeId && e.target === nextId)
                return (
                  <li key={`${nodeId}-${nextId}`} className="flex gap-2">
                    <span className="font-mono font-bold text-text-primary shrink-0">{nodeId} → {nextId}</span>
                    <span>
                      <span className="font-semibold text-accent-primary">{edge?.type}</span>: {edge?.technique}
                    </span>
                  </li>
                )
              })}
            </ol>
          </div>
        )}

        <div className="p-4 rounded-2xl bg-bg-nested border border-border-subtle text-xs text-text-secondary leading-relaxed">
          This mirrors the real workflow of tools like BloodHound: enumerate a small identity graph, then trace the
          shortest privilege-escalation path from a low-privilege principal to a high-value target. Cross-reference{' '}
          <span className="font-semibold text-text-primary">Kerberoasting</span> and credential-dumping techniques with the{' '}
          <span className="font-semibold text-text-primary">Kerberos Attack Lab</span> and the{' '}
          <span className="font-semibold text-text-primary">Wall of Shame</span> for deeper real-breach context.
        </div>
      </div>
    </PlaygroundShell>
  )
}
