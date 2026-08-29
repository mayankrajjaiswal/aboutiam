import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { History, GraduationCap, Cpu, Star, ArrowRight } from 'lucide-react'
import { rankContinueLearningItems, type ContinueItemKind } from '../lib/home/continueLearning'
import { getAcademyTouchedMap, getLabsTouchedMap } from '../lib/home/lastTouched'
import { useBookmarksStore } from '../store/bookmarksStore'

const KIND_ICON: Record<ContinueItemKind, typeof GraduationCap> = {
  academy: GraduationCap,
  playground: Cpu,
  bookmark: Star,
}

const KIND_LABEL: Record<ContinueItemKind, string> = {
  academy: 'Academy',
  playground: 'Playground',
  bookmark: 'Bookmark',
}

export default function ContinueLearningCard() {
  // Bookmarks live in a Zustand store (not raw localStorage), so subscribe to it
  // directly to re-derive the list when a bookmark is added/removed elsewhere on the site.
  const bookmarks = useBookmarksStore((s) => s.bookmarks)
  const items = useMemo(
    () => rankContinueLearningItems({ 
      academyTouched: getAcademyTouchedMap(), 
      labsTouched: getLabsTouchedMap(), 
      bookmarks: bookmarks.map(b => ({ id: b.id, title: b.title, link: b.link, addedAt: b.addedAt })) 
    }, 3),
    [bookmarks]
  )

  if (items.length === 0) return null

  return (
    <section className="space-y-4 pt-6 max-w-3xl mx-auto w-full">
      <div className="flex items-center gap-2">
        <History className="w-5 h-5 text-accent-primary" />
        <h3 className="text-xl font-extrabold text-text-primary">Continue Where You Left Off</h3>
      </div>
      <div className="grid gap-3">
        {items.map((item) => {
          const Icon = KIND_ICON[item.kind]
          return (
            <Link
              key={item.id}
              to={item.link}
              className="group flex items-center gap-3 p-4 rounded-xl bg-bg-card border border-border-subtle hover:border-accent-primary/30 shadow-sm hover:shadow-md transition-all"
            >
              <div className="w-9 h-9 rounded-lg bg-accent-glow text-accent-primary flex items-center justify-center border border-accent-primary/10 shrink-0">
                <Icon className="w-4.5 h-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[9px] font-black text-text-muted uppercase tracking-wider">{KIND_LABEL[item.kind]}</span>
                <p className="text-sm font-bold text-text-primary truncate">{item.title}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-accent-primary transition-transform group-hover:translate-x-1 shrink-0" />
            </Link>
          )
        })}
      </div>
    </section>
  )
}
