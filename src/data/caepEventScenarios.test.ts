import { describe, it, expect } from 'vitest'
import { CAEP_EVENT_TYPES, CAEP_SUBSCRIBERS } from './caepEventScenarios'

describe('CAEP_EVENT_TYPES', () => {
  it('has unique event types', () => {
    const types = CAEP_EVENT_TYPES.map((e) => e.type)
    expect(new Set(types).size).toBe(types.length)
  })

  it('every event type has non-empty metadata', () => {
    for (const event of CAEP_EVENT_TYPES) {
      expect(event.label.length).toBeGreaterThan(0)
      expect(event.schemaUri.length).toBeGreaterThan(0)
      expect(event.description.length).toBeGreaterThan(0)
    }
  })
})

describe('CAEP_SUBSCRIBERS', () => {
  it('has at least 3 subscribers', () => {
    expect(CAEP_SUBSCRIBERS.length).toBeGreaterThanOrEqual(3)
  })

  it('has unique subscriber ids', () => {
    const ids = CAEP_SUBSCRIBERS.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every subscriber has a positive simulated latency', () => {
    for (const subscriber of CAEP_SUBSCRIBERS) {
      expect(subscriber.simulatedLatencyMs).toBeGreaterThan(0)
    }
  })

  it('every subscribedEventType has a matching enforcement entry, and vice versa', () => {
    for (const subscriber of CAEP_SUBSCRIBERS) {
      for (const eventType of subscriber.subscribedEventTypes) {
        expect(subscriber.enforcement[eventType]).toBeDefined()
        expect(subscriber.enforcement[eventType]!.length).toBeGreaterThan(0)
      }
      expect(Object.keys(subscriber.enforcement).length).toBe(subscriber.subscribedEventTypes.length)
    }
  })

  it('every event type has at least one subscriber behavior defined (the game is always meaningful to fire)', () => {
    for (const event of CAEP_EVENT_TYPES) {
      const hasSubscriber = CAEP_SUBSCRIBERS.some((s) => s.subscribedEventTypes.includes(event.type))
      expect(hasSubscriber).toBe(true)
    }
  })

  it('at least one event type has more than one subscriber (to exercise real fan-out) and at least one subscriber is not subscribed to every event type (to exercise "ignored" behavior)', () => {
    const subscriberCounts = CAEP_EVENT_TYPES.map(
      (event) => CAEP_SUBSCRIBERS.filter((s) => s.subscribedEventTypes.includes(event.type)).length
    )
    expect(subscriberCounts.some((count) => count > 1)).toBe(true)
    expect(CAEP_SUBSCRIBERS.some((s) => s.subscribedEventTypes.length < CAEP_EVENT_TYPES.length)).toBe(true)
  })
})
