import { useCallback, useState } from 'react'

// Extracted from the copyToClipboard/isCopied pattern hand-rolled in JWTStudio.tsx.
// Falls back to execCommand for older/non-secure-context browsers where
// navigator.clipboard is unavailable.
export function useClipboardCopy() {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const markCopied = useCallback((id: string) => {
    setCopiedId(id)
    setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 1500)
  }, [])

  const copy = useCallback((text: string, id: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(
        () => markCopied(id),
        () => fallbackCopy(text, () => markCopied(id))
      )
    } else {
      fallbackCopy(text, () => markCopied(id))
    }
  }, [markCopied])

  return { copy, copiedId }
}

function fallbackCopy(text: string, onDone: () => void) {
  if (typeof document === 'undefined') return
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.focus()
  textarea.select()
  try {
    document.execCommand('copy')
  } finally {
    document.body.removeChild(textarea)
  }
  onDone()
}
