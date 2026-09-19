import { useEffect, useState } from 'react'

/**
 * Next-Gen hub pages are deep-linked from the global search index with BOTH a
 * tab and a specific item id -- e.g.
 * `/next-gen/ai-security-fabric?tab=threats&threat=memory-poisoning`
 * (see the registry loops in `src/lib/search/searchService.ts`).
 *
 * Every hub already honoured `?tab=`, but the item id was silently dropped, so
 * a searcher landed on the right tab with no indication which of a dozen cards
 * they had actually searched for. This hook reads that second param, scrolls
 * the matching card into view, and returns its id so the card can render a
 * temporary highlight ring.
 *
 * Usage: give the card `id={itemDomId(<param>, item.id)}` and compare
 * `highlightedId === item.id` for the ring.
 */
export function itemDomId(param: string, id: string): string {
  return `nextgen-${param}-${id}`
}

/**
 * @param param  the query-string key carrying the item id (e.g. 'threat')
 * @param validIds  ids that exist in the backing registry -- an unknown or
 *                  hand-edited id is ignored rather than scrolling nowhere
 */
export function useDeepLinkedItem(param: string, validIds: readonly string[]): string | null {
  const [highlightedId, setHighlightedId] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const id = new URLSearchParams(window.location.search).get(param)
    if (!id || !validIds.includes(id)) return

    // Per GEMINI.md §3D, defer the state write so the purity / set-state-in-effect
    // lint rules do not flag a synchronous effect-driven update. The extra delay
    // also lets the tab switch (a sibling mount effect) paint its content first,
    // so the element we want to scroll to actually exists in the DOM.
    const timer = setTimeout(() => {
      setHighlightedId(id)
      document.getElementById(itemDomId(param, id))?.scrollIntoView({ block: 'center' })
    }, 50)
    return () => clearTimeout(timer)
    // Mount-only: the deep link is read once from the entry URL, exactly like
    // every other `?param=` reader in this repo (GEMINI.md §4I).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return highlightedId
}
