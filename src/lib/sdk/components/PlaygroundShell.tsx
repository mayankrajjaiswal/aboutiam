import React from 'react'
import { Award, Lightbulb, RotateCcw, Shield, HelpCircle } from 'lucide-react'

export interface PlaygroundShellProps {
  title: string;
  description: string;
  score: number;
  hintsRevealed: number;
  maxHints?: number;
  currentStep: number;
  totalSteps?: number;
  isCompleted?: boolean;
  onRevealHint: () => void;
  onReset: () => void;
  children: React.ReactNode;
  sidebarContent?: React.ReactNode;
}

export function PlaygroundShell({
  title,
  description,
  score,
  hintsRevealed,
  maxHints = 3,
  currentStep,
  totalSteps = 3,
  isCompleted = false,
  onRevealHint,
  onReset,
  children,
  sidebarContent
}: PlaygroundShellProps) {
  return (
    <div className="space-y-6">
      
      {/* Module Title / Status Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm">
        <div className="space-y-1 flex-grow">
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Shield className="w-6 h-6 text-accent-primary shrink-0" />
            {title}
          </h1>
          <p className="text-sm text-text-secondary max-w-3xl leading-relaxed">{description}</p>
        </div>

        {/* Dynamic Interactive Stats */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          
          {/* Active Score Tracker */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-bg-sidebar border border-border-subtle shadow-sm">
            <Award className="w-4 h-4 text-yellow-500" />
            <div>
              <span className="text-[10px] uppercase font-bold text-text-secondary block leading-none">Security Score</span>
              <span className="text-sm font-extrabold text-text-primary">{score} / 100</span>
            </div>
          </div>

          {/* Verification Progress Checkpoints */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-bg-sidebar border border-border-subtle shadow-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-accent-primary animate-pulse" />
            <div>
              <span className="text-[10px] uppercase font-bold text-text-secondary block leading-none">Checkpoints</span>
              <span className="text-sm font-extrabold text-text-primary">{currentStep} / {totalSteps}</span>
            </div>
          </div>

          {/* Reset Action */}
          <button 
            onClick={onReset}
            className="p-2.5 rounded-xl bg-bg-sidebar border border-border-subtle hover:bg-bg-nested hover:border-accent-primary/40 text-text-secondary hover:text-text-primary transition-all shadow-sm"
            title="Reset Simulator"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid Wrapper */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Interactive Playground Canvas */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-bg-card border border-border-subtle shadow-sm">
            {children}
          </div>
        </div>

        {/* Right Sandbox Action Controls Drawer */}
        <div className="space-y-6">
          
          {/* Help Drawer (Hints Panel) */}
          <div className="p-5 rounded-2xl bg-bg-card border border-border-subtle shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-accent-primary" />
              Developer Assist & Guidance
            </h3>
            
            <p className="text-xs text-text-secondary leading-relaxed">
              Stuck on a protocol flow or experiencing validation bypass issues? Leverage active developer hints below. Note that utilizing hints decreases your overall GRC security score.
            </p>

            <button 
              onClick={onRevealHint}
              disabled={hintsRevealed >= maxHints || isCompleted}
              className={`w-full py-2.5 px-4 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                hintsRevealed >= maxHints 
                  ? 'bg-bg-sidebar border-border-subtle text-text-muted cursor-not-allowed' 
                  : 'bg-accent-glow border-accent-primary/20 hover:border-accent-primary/40 text-accent-primary hover:bg-accent-glow/70 shadow-sm'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              {hintsRevealed >= maxHints 
                ? 'All Hints Utilized' 
                : `Reveal Next Hint (${hintsRevealed} / ${maxHints} used)`
              }
            </button>
          </div>

          {/* Dynamic Sidebar Slot (e.g. controls, logs, or secondary configurations) */}
          {sidebarContent && (
            <div className="space-y-6">
              {sidebarContent}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
