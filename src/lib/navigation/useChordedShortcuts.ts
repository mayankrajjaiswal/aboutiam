import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CHORDED_SHORTCUTS, type ChordShortcut } from '../../data/chordedShortcuts'

const CHORD_TIMEOUT_MS = 800

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable
}

/**
 * Gmail/GitHub-style `g`-then-letter chorded navigation, plus `?` to toggle
 * the ShortcutsOverlay cheat sheet. Mounted once at Header.tsx alongside
 * CommandPalette/GuidedTour (§4M's "mount once, available everywhere"
 * pattern) so it's live on every route.
 */
export function useChordedShortcuts(chords: ChordShortcut[] = CHORDED_SHORTCUTS) {
  const navigate = useNavigate()
  const [isOverlayOpen, setIsOverlayOpen] = useState(false)
  const pendingKeyRef = useRef<string | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const clearPending = () => {
      pendingKeyRef.current = null
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Critical: never hijack normal typing anywhere on the site, including
      // every tool's paste/textarea inputs.
      if (isTypingTarget(e.target)) return

      if (e.key === '?' && !pendingKeyRef.current) {
        e.preventDefault()
        setIsOverlayOpen((prev) => !prev)
        return
      }

      if (pendingKeyRef.current) {
        const chordString = `${pendingKeyRef.current} ${e.key.toLowerCase()}`
        clearPending()
        const match = chords.find((c) => c.chord === chordString)
        if (match) {
          e.preventDefault()
          navigate(match.path)
        }
        return
      }

      if (e.key.toLowerCase() === 'g') {
        pendingKeyRef.current = 'g'
        timeoutRef.current = setTimeout(clearPending, CHORD_TIMEOUT_MS)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      clearPending()
    }
  }, [chords, navigate])

  return { isOverlayOpen, closeOverlay: () => setIsOverlayOpen(false) }
}
