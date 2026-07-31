import { HOME_TRIVIA_FACTS, type HomeTriviaFact } from '../../data/homeTriviaFacts'
import { ENCYCLOPEDIA_TERMS } from '../../data/encyclopediaData'
import { dateSeededIndex } from '../dateSeed'

export interface FactOfTheDay {
  id: string
  label: string
  text: string
  /** Deep link to learn more — the source Encyclopedia term, or undefined for a pure trivia fact. */
  link?: string
}

function encyclopediaFacts(): FactOfTheDay[] {
  return ENCYCLOPEDIA_TERMS.map((t) => ({
    id: `encyclopedia-${t.id}`,
    label: t.term,
    text: t.analogy,
    link: `/encyclopedia?term=${t.id}`,
  }))
}

function triviaFacts(): FactOfTheDay[] {
  return HOME_TRIVIA_FACTS.map((f: HomeTriviaFact) => ({ id: f.id, label: f.label, text: f.text }))
}

/**
 * Combined, deterministic content pool: the site's original curated trivia facts
 * plus every Encyclopedia term's beginner analogy. No new authoring — pure reuse
 * of existing data, per NEXT_FEATURES.md F4.
 */
export function buildFactPool(): FactOfTheDay[] {
  return [...triviaFacts(), ...encyclopediaFacts()]
}

/**
 * Deterministic date-seeded fact selection — every visitor on the same UTC calendar
 * date sees the same fact. `dateString` must be passed in rather than read internally,
 * keeping this pure/testable (same discipline as `getDailyPuzzle`).
 */
export function getFactOfTheDay(dateString: string, pool: FactOfTheDay[] = buildFactPool()): FactOfTheDay {
  return pool[dateSeededIndex(dateString, pool.length)]
}
