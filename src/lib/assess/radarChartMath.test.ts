import { describe, it, expect } from 'vitest'

// Helper function equivalent to what Assess.tsx uses
export function generateSpiderChartPolygon(answers: Record<number, number>, totalQuestions: number, radius: number = 80, center: number = 100): string {
  return Array.from({ length: totalQuestions }).map((_, i) => {
    const score = answers[i] || 1
    const r = (score / 5) * radius
    const angle = (Math.PI * 2 * i) / totalQuestions - Math.PI / 2
    const x = center + r * Math.cos(angle)
    const y = center + r * Math.sin(angle)
    return `${x},${y}`
  }).join(' ')
}

describe('Spider Radar Chart Math', () => {
  it('generates correct polygon points for a perfect score (5.0)', () => {
    const answers = { 0: 5, 1: 5, 2: 5, 3: 5, 4: 5 }
    const pointsStr = generateSpiderChartPolygon(answers, 5)
    const points = pointsStr.split(' ')

    expect(points.length).toBe(5)
    // Point 1 (Top): angle = -PI/2 -> cos = 0, sin = -1 -> x = 100, y = 100 - 80 = 20
    const [x1, y1] = points[0].split(',').map(Number)
    expect(x1).toBeCloseTo(100, 4)
    expect(y1).toBeCloseTo(20, 4)
  })

  it('generates correct polygon points for a base score (1.0)', () => {
    const answers = { 0: 1, 1: 1, 2: 1, 3: 1, 4: 1 }
    const pointsStr = generateSpiderChartPolygon(answers, 5)
    const points = pointsStr.split(' ')

    // Point 1 (Top): angle = -PI/2 -> r = (1/5)*80 = 16 -> y = 100 - 16 = 84
    const [, y1] = points[0].split(',').map(Number)
    expect(y1).toBeCloseTo(84, 4)
  })

  it('handles missing answers by defaulting to score 1.0', () => {
    const answers = { 0: 5 } // Missing 1, 2, 3, 4
    const pointsStr = generateSpiderChartPolygon(answers, 5)
    const points = pointsStr.split(' ')

    // Point 1 should be radius 80 (y=20)
    const [, y1] = points[0].split(',').map(Number)
    expect(y1).toBeCloseTo(20, 4)

    // Point 2 should be radius 16
    const [x2, y2] = points[1].split(',').map(Number)
    // Angle = 72 deg - 90 deg = -18 deg. r = 16.
    expect(Math.sqrt(Math.pow(x2 - 100, 2) + Math.pow(y2 - 100, 2))).toBeCloseTo(16, 4)
  })
})
