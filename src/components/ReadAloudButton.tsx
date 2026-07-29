import { useEffect, useState } from 'react'
import { Volume2, Square } from 'lucide-react'

export interface ReadAloudButtonProps {
  text: string
  label?: string
  className?: string
}

function isSpeechSynthesisAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export default function ReadAloudButton({ text, label = 'Listen', className = '' }: ReadAloudButtonProps) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const available = isSpeechSynthesisAvailable()

  useEffect(() => {
    if (!available) return
    return () => {
      window.speechSynthesis.cancel()
    }
  }, [available])

  const handleClick = () => {
    if (!available) return

    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      return
    }

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    window.speechSynthesis.speak(utterance)
    setIsSpeaking(true)
  }

  if (!available) return null

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all ${
        isSpeaking
          ? 'bg-accent-glow border-accent-primary/40 text-accent-primary'
          : 'bg-bg-sidebar border-border-subtle text-text-secondary hover:text-text-primary hover:border-accent-primary/30'
      } ${className}`}
      title={isSpeaking ? 'Stop reading' : 'Read aloud'}
    >
      {isSpeaking ? <Square className="w-3 h-3" /> : <Volume2 className="w-3.5 h-3.5" />}
      {isSpeaking ? 'Stop' : label}
    </button>
  )
}
