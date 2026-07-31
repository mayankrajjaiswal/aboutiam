import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../test/renderWithProviders'
import { getNeighborIds, getKnowledgeGraphNode } from '../data/knowledgeGraphData'
import RelatedContentRail from './RelatedContentRail'

describe('RelatedContentRail', () => {
  it('renders the correct neighbor set for a node with edges', () => {
    const nodeId = 'standard:oauth21'
    const { container } = renderWithProviders(<RelatedContentRail nodeId={nodeId} />)

    const expectedNeighbors = getNeighborIds(nodeId).map(getKnowledgeGraphNode).filter(Boolean).slice(0, 4)
    expect(expectedNeighbors.length).toBeGreaterThan(0)
    for (const neighbor of expectedNeighbors) {
      expect(screen.getByText(neighbor!.label)).toBeInTheDocument()
    }
    expect(container.querySelectorAll('a').length).toBe(expectedNeighbors.length)
  })

  it('renders nothing (not an empty box) for a node with no graph entry', () => {
    const { container } = renderWithProviders(<RelatedContentRail nodeId="tool:jwt-decoder" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('respects the limit prop', () => {
    const { container } = renderWithProviders(<RelatedContentRail nodeId="standard:oauth21" limit={1} />)
    expect(container.querySelectorAll('a').length).toBe(1)
  })
})
