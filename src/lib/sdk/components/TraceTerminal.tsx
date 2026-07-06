import { useEffect, useRef } from 'react'
import { Terminal, ShieldAlert } from 'lucide-react'
import type { TraceLog } from '../usePlayground'

export interface TraceTerminalProps {
  logs: TraceLog[];
  height?: string;
  title?: string;
}

export function TraceTerminal({ 
  logs, 
  height = 'h-64', 
  title = 'SecOps Log Terminal' 
}: TraceTerminalProps) {
  const terminalEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  return (
    <div className={`rounded-2xl border border-border-subtle bg-bg-sidebar font-mono text-xs text-text-primary p-4 ${height} flex flex-col shadow-inner relative overflow-hidden`}>
      <div className="flex items-center justify-between border-b border-border-subtle/30 pb-2 mb-3 text-[10px] uppercase font-bold text-text-secondary shrink-0 select-none">
        <span className="flex items-center gap-1.5">
          <Terminal className="w-3.5 h-3.5 text-accent-primary animate-pulse" /> 
          {title}
        </span>
        <span className="text-accent-primary flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-status-success inline-block animate-pulse"></span>
          Secure Connection
        </span>
      </div>
      <div className="flex-grow overflow-y-auto space-y-2 pr-2 scrollbar-thin">
        {logs.length === 0 ? (
          <div className="text-text-muted flex items-center gap-2 h-full justify-center text-center">
            <ShieldAlert className="w-4 h-4 text-accent-primary" /> 
            <span>Listening for protocol activities... Interact with the controls above.</span>
          </div>
        ) : (
          logs.map((l, i) => (
            <div key={i} className="flex gap-2.5 items-start leading-relaxed animate-in fade-in slide-in-from-bottom-1 duration-150">
              <span className="text-text-muted font-light shrink-0">[{l.timestamp}]</span>
              <span className={`font-semibold ${
                l.type === 'success' ? 'text-status-success' :
                l.type === 'error' ? 'text-status-error' :
                l.type === 'warning' ? 'text-status-warning' : 'text-text-secondary'
              }`}>
                {l.message}
              </span>
            </div>
          ))
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  )
}
