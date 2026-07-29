import { useEffect, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { Terminal as TerminalIcon } from 'lucide-react'
import { runShellCommand } from '../../tools/mockShell'

interface HistoryEntry {
  command: string
  output: string[]
  isError?: boolean
}

export interface IamTerminalProps {
  /** Shown once above the first prompt, e.g. a task-specific instruction. */
  welcomeLines?: string[]
  height?: string
  prompt?: string
}

/**
 * A scripted (not a real shell) terminal for muscle-memory CLI practice —
 * accepts a small curated command grammar (see src/lib/tools/mockShell.ts:
 * openssl, curl, kinit, jwt-cli) against fabricated IAM infrastructure.
 * Deliberately NOT built on xterm.js: this codebase avoids heavy UI
 * dependencies in favor of small custom primitives (same reasoning as the
 * dependency-free force-graph in src/lib/graph/), and a real shell isn't
 * needed — we just need a scrollback + prompt line.
 */
export function IamTerminal({ welcomeLines, height = 'h-72', prompt = '$' }: IamTerminalProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [input, setInput] = useState('')
  const [commandLog, setCommandLog] = useState<string[]>([])
  const [historyCursor, setHistoryCursor] = useState<number | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const command = input.trim()
    if (!command || isRunning) return

    if (command === 'clear') {
      setHistory([])
      setCommandLog((prev) => [...prev, command])
      setInput('')
      setHistoryCursor(null)
      return
    }

    setInput('')
    setHistoryCursor(null)
    setIsRunning(true)
    const result = await runShellCommand(command)
    setHistory((prev) => [...prev, { command, output: result.output, isError: result.isError }])
    setCommandLog((prev) => [...prev, command])
    setIsRunning(false)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (commandLog.length === 0) return
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      const nextIndex = historyCursor === null ? commandLog.length - 1 : Math.max(0, historyCursor - 1)
      setHistoryCursor(nextIndex)
      setInput(commandLog[nextIndex])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyCursor === null) return
      const nextIndex = historyCursor + 1
      if (nextIndex >= commandLog.length) {
        setHistoryCursor(null)
        setInput('')
      } else {
        setHistoryCursor(nextIndex)
        setInput(commandLog[nextIndex])
      }
    }
  }

  return (
    <div className={`rounded-2xl border border-border-subtle bg-bg-sidebar font-mono text-[11px] text-text-primary p-4 ${height} flex flex-col shadow-inner relative overflow-hidden`}>
      <div className="flex items-center gap-1.5 border-b border-border-subtle/30 pb-2 mb-2 text-[10px] uppercase font-bold text-text-secondary shrink-0 select-none">
        <TerminalIcon className="w-3.5 h-3.5 text-accent-primary" /> IAM Mock Terminal
      </div>
      <div className="flex-grow overflow-y-auto space-y-2 pr-1">
        {welcomeLines?.map((line, i) => (
          <div key={`welcome-${i}`} className="text-text-muted">{line}</div>
        ))}
        {history.map((entry, i) => (
          <div key={i}>
            <div className="flex gap-1.5">
              <span className="text-accent-primary shrink-0">{prompt}</span>
              <span className="text-text-primary break-all">{entry.command}</span>
            </div>
            {entry.output.map((line, j) => (
              <div key={j} className={`whitespace-pre-wrap break-all ${entry.isError ? 'text-status-danger' : 'text-text-secondary'}`}>{line}</div>
            ))}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex items-center gap-1.5 border-t border-border-subtle/40 pt-2 mt-2 shrink-0">
        <span className="text-accent-primary shrink-0">{prompt}</span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isRunning}
          className="flex-grow bg-transparent outline-none text-text-primary min-w-0"
          placeholder="try: help"
          aria-label="Terminal command input"
          autoComplete="off"
          spellCheck={false}
        />
      </form>
    </div>
  )
}
