import { describe, it, expect } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../../src/test/renderWithProviders'
import AttackPathGraph from '../../src/pages/Playgrounds/AttackPathGraph'
import { ATTACK_PATH_SCENARIOS } from '../../src/data/attackPathScenarios'

const BEGINNER = ATTACK_PATH_SCENARIOS.find((s) => s.id === 'obvious-path')!

function traceShortestPath() {
  for (const nodeId of BEGINNER.shortestPath) {
    fireEvent.click(screen.getByTestId(`graph-node-${nodeId}`))
  }
}

describe('AttackPathGraph page', () => {
  it('renders the heading and the beginner scenario by default', () => {
    renderWithProviders(<AttackPathGraph />)
    expect(screen.getByRole('heading', { name: /identity attack-path graph visualizer/i })).toBeInTheDocument()
    expect(screen.getByTestId(`graph-node-${BEGINNER.startNodeId}`)).toBeInTheDocument()
  })

  it('rejects clicking a non-start node before the trace has begun', () => {
    renderWithProviders(<AttackPathGraph />)
    const nonStartNode = BEGINNER.nodes.find((n) => n.id !== BEGINNER.startNodeId)!
    fireEvent.click(screen.getByTestId(`graph-node-${nonStartNode.id}`))
    expect(screen.getByText(/click start node/i)).toBeInTheDocument()
  })

  it('builds a trace by clicking valid consecutive hops and shows it in the trace readout', () => {
    renderWithProviders(<AttackPathGraph />)
    fireEvent.click(screen.getByTestId(`graph-node-${BEGINNER.startNodeId}`))
    fireEvent.click(screen.getByTestId(`graph-node-${BEGINNER.shortestPath[1]}`))
    expect(screen.getAllByText(new RegExp(`${BEGINNER.startNodeId} → ${BEGINNER.shortestPath[1]}`)).length).toBeGreaterThan(0)
  })

  it('penalizes an invalid (non-adjacent) hop', () => {
    renderWithProviders(<AttackPathGraph />)
    fireEvent.click(screen.getByTestId(`graph-node-${BEGINNER.startNodeId}`))
    // domain_admins is not directly reachable from alice
    fireEvent.click(screen.getByTestId(`graph-node-${BEGINNER.targetNodeId}`))
    expect(screen.getByText(/invalid hop/i)).toBeInTheDocument()
    expect(screen.getByText('95 / 100')).toBeInTheDocument()
  })

  it('reaching the target via the true shortest path completes the module', () => {
    renderWithProviders(<AttackPathGraph />)
    traceShortestPath()
    expect(screen.getByText(/shortest possible escalation route/i)).toBeInTheDocument()
  })

  it('reveals the shortest path with a score penalty and shows technique breakdown', () => {
    renderWithProviders(<AttackPathGraph />)
    fireEvent.click(screen.getByText(/reveal shortest path/i))
    expect(screen.getByText(/score penalized for using the solution/i)).toBeInTheDocument()
    expect(screen.getByText('85 / 100')).toBeInTheDocument()
    expect(screen.getByText(/real-world technique breakdown/i)).toBeInTheDocument()
  })

  it('switching scenarios clears the in-progress trace', () => {
    renderWithProviders(<AttackPathGraph />)
    fireEvent.click(screen.getByTestId(`graph-node-${BEGINNER.startNodeId}`))
    const advanced = ATTACK_PATH_SCENARIOS.find((s) => s.id === 'multiple-false-paths')!
    fireEvent.click(screen.getByText(new RegExp(advanced.title)))
    expect(screen.getByTestId(`graph-node-${advanced.startNodeId}`)).toBeInTheDocument()
  })

  it('clears the trace when "Clear Trace" is clicked', () => {
    renderWithProviders(<AttackPathGraph />)
    fireEvent.click(screen.getByTestId(`graph-node-${BEGINNER.startNodeId}`))
    fireEvent.click(screen.getByText(/clear trace/i))
    expect(screen.getByText(/\(click start node\)/i)).toBeInTheDocument()
  })

  it('resets score and trace when the shell reset button is clicked', () => {
    renderWithProviders(<AttackPathGraph />)
    fireEvent.click(screen.getByText(/reveal shortest path/i))
    expect(screen.getByText('85 / 100')).toBeInTheDocument()
    fireEvent.click(screen.getByTitle(/reset simulator/i))
    expect(screen.getByText('100 / 100')).toBeInTheDocument()
  })
})
