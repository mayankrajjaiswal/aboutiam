import { ListFilter } from 'lucide-react'
import { TASK_TAGS, TASK_TAG_LABELS, type TaskTag } from '../data/taskTags'

interface TaskFilterRowProps {
  selected: TaskTag | null
  onSelect: (tag: TaskTag | null) => void
}

/**
 * "I want to…" task-oriented filter row — a second, orthogonal axis alongside
 * a catalog's existing category/difficulty filtering. Composes with those
 * filters (AND, not OR); the caller owns the actual filtering logic.
 */
export default function TaskFilterRow({ selected, onSelect }: TaskFilterRowProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[10px] font-black text-text-muted uppercase tracking-wider flex items-center gap-1 shrink-0">
        <ListFilter className="w-3.5 h-3.5" /> I want to…
      </span>
      <button
        type="button"
        onClick={() => onSelect(null)}
        aria-pressed={selected === null}
        className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
          selected === null ? 'bg-accent-primary border-accent-primary text-white' : 'bg-bg-card border-border-subtle text-text-secondary hover:bg-bg-nested'
        }`}
      >
        All
      </button>
      {TASK_TAGS.map((tag) => (
        <button
          key={tag}
          type="button"
          onClick={() => onSelect(selected === tag ? null : tag)}
          aria-pressed={selected === tag}
          className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
            selected === tag ? 'bg-accent-primary border-accent-primary text-white' : 'bg-bg-card border-border-subtle text-text-secondary hover:bg-bg-nested'
          }`}
        >
          {TASK_TAG_LABELS[tag]}
        </button>
      ))}
    </div>
  )
}
