import { useCoachMarkStore } from '../store/coachMarkStore'

/** Shows a coach mark for `featureId` exactly once — never again after `dismiss()`. */
export function useCoachMark(featureId: string) {
  const isVisible = useCoachMarkStore((s) => !s.isSeen(featureId))
  const markSeen = useCoachMarkStore((s) => s.markSeen)
  return { isVisible, dismiss: () => markSeen(featureId) }
}
