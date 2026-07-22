import { useRef, useEffect } from 'react'
import { Lightbulb, ShieldCheck, Layers, Briefcase } from 'lucide-react'
import { usePreferenceStore, type DepthMode, type RoleTrackId } from '../store/preferenceStore'

interface PersonalizationSelectorProps {
  isOpen: boolean
  onClose: () => void
}

const DEPTH_OPTIONS: { id: DepthMode; label: string; icon: typeof Lightbulb }[] = [
  { id: 'beginner', label: 'Beginner Only', icon: Lightbulb },
  { id: 'expert', label: 'Expert Only', icon: ShieldCheck },
  { id: 'both', label: 'Both (Default)', icon: Layers },
]

const ROLE_OPTIONS: { id: RoleTrackId; label: string }[] = [
  { id: 'fresher', label: 'Fresher / Entry-Level' },
  { id: 'developer', label: 'Developer' },
  { id: 'security_engineer', label: 'Security Engineer' },
  { id: 'iam_engineer', label: 'IAM Engineer' },
  { id: 'architect', label: 'Enterprise Architect' },
  { id: 'principal', label: 'Principal / Director' },
]

export default function PersonalizationSelector({ isOpen, onClose }: PersonalizationSelectorProps) {
  const depthMode = usePreferenceStore((s) => s.depthMode)
  const setDepthMode = usePreferenceStore((s) => s.setDepthMode)
  const roleTrack = usePreferenceStore((s) => s.roleTrack)
  const setRoleTrack = usePreferenceStore((s) => s.setRoleTrack)

  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2.5 w-80 bg-bg-card border border-border-subtle rounded-2xl p-5 shadow-2xl z-50 animate-fadeIn space-y-4"
    >
      <div className="flex items-center justify-between border-b border-border-subtle pb-2.5">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-accent-primary" />
          <span className="text-xs font-black uppercase tracking-wider">Personalize</span>
        </div>
      </div>

      <div className="space-y-1.5">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">Content Depth</span>
        <div className="grid grid-cols-3 gap-1.5">
          {DEPTH_OPTIONS.map((opt) => {
            const Icon = opt.icon
            const active = depthMode === opt.id
            return (
              <button
                key={opt.id}
                onClick={() => setDepthMode(opt.id)}
                className={`p-2 rounded-lg border text-[9px] font-bold flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                  active ? 'bg-accent-primary text-white border-accent-primary' : 'bg-bg-nested/30 text-text-secondary border-border-subtle hover:text-text-primary'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {opt.label}
              </button>
            )
          })}
        </div>
        <p className="text-[9px] text-text-muted leading-normal pt-1">
          Collapses the analogy or spec block you don't want on tool and glossary pages.
        </p>
      </div>

      <div className="space-y-1.5 pt-3 border-t border-border-subtle">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5" /> Career Track
        </span>
        <select
          value={roleTrack ?? ''}
          onChange={(e) => setRoleTrack(e.target.value ? (e.target.value as RoleTrackId) : null)}
          className="w-full p-2 rounded-lg bg-bg-nested border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-accent-primary cursor-pointer"
        >
          <option value="">Not set</option>
          {ROLE_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>{opt.label}</option>
          ))}
        </select>
        <p className="text-[9px] text-text-muted leading-normal pt-1">
          Surfaces a "Recommended for you" shortcut on the Academy and Career Center.
        </p>
      </div>
    </div>
  )
}
