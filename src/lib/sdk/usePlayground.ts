import { useState, useCallback } from 'react'

export interface TraceLog {
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

export interface UsePlaygroundOptions {
  moduleId: string;
  initialScore?: number;
  maxHints?: number;
  hintDeduction?: number;
}

export function usePlayground({ 
  moduleId, 
  initialScore = 100, 
  maxHints = 3,
  hintDeduction = 15 
}: UsePlaygroundOptions) {
  const [score, setScore] = useState(initialScore)
  const [hintsRevealed, setHintsRevealed] = useState<number>(0)
  const [logs, setLogs] = useState<TraceLog[]>([])
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [isCompleted, setIsCompleted] = useState<boolean>(false)

  const log = useCallback((type: TraceLog['type'], message: string) => {
    const newLog: TraceLog = {
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type,
      message
    }
    setLogs(prev => [...prev, newLog])
  }, [])

  const revealHint = useCallback((hintMessage?: string) => {
    if (hintsRevealed < maxHints) {
      setHintsRevealed(prev => prev + 1)
      setScore(prev => Math.max(50, prev - hintDeduction))
      log('warning', `Hint #${hintsRevealed + 1} revealed${hintMessage ? `: "${hintMessage}"` : ''}. Score penalized.`)
    }
  }, [hintsRevealed, maxHints, hintDeduction, log])

  const completeStep = useCallback((stepIndex: number, successMsg?: string) => {
    setCurrentStep(stepIndex + 1)
    log('success', successMsg || `Checkpoint ${stepIndex + 1} successfully verified!`)

    // Save state natively inside localStorage safely for SSR
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = localStorage.getItem('aboutiam-academy-progress')
        const progress = saved ? JSON.parse(saved) : {}
        progress[`${moduleId}_step_${stepIndex}`] = true
        localStorage.setItem('aboutiam-academy-progress', JSON.stringify(progress))
      } catch (e) {
        console.error('Failed to sync playground step with localStorage:', e)
      }
    }
  }, [moduleId, log])

  const finishPlayground = useCallback((successMsg?: string) => {
    setIsCompleted(true)
    log('success', successMsg || `Module ${moduleId} completely solved with score ${score}!`)
    
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = localStorage.getItem('aboutiam_labs_completed')
        const completedLabs = saved ? JSON.parse(saved) : []
        if (!completedLabs.includes(moduleId)) {
          completedLabs.push(moduleId)
          localStorage.setItem('aboutiam_labs_completed', JSON.stringify(completedLabs))
        }
      } catch (e) {
        console.error('Failed to save completed lab inside localStorage:', e)
      }
    }
  }, [moduleId, score, log])

  const resetPlayground = useCallback(() => {
    setScore(initialScore)
    setHintsRevealed(0)
    setLogs([])
    setCurrentStep(0)
    setIsCompleted(false)
    log('info', `Session reset. Good luck!`)
  }, [initialScore, log])

  return {
    score,
    hintsRevealed,
    logs,
    currentStep,
    isCompleted,
    log,
    revealHint,
    completeStep,
    finishPlayground,
    resetPlayground
  }
}
