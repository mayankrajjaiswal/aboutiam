import { Bookmark } from 'lucide-react'
import { useBookmarksStore, type BookmarkedItem } from '../store/bookmarksStore'

interface BookmarkButtonProps {
  item: BookmarkedItem
  className?: string
}

export default function BookmarkButton({ item, className = '' }: BookmarkButtonProps) {
  const isBookmarked = useBookmarksStore((s) => s.isBookmarked(item.id))
  const toggleBookmark = useBookmarksStore((s) => s.toggleBookmark)

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleBookmark(item)
      }}
      aria-pressed={isBookmarked}
      aria-label={isBookmarked ? `Remove ${item.title} from bookmarks` : `Save ${item.title} for later`}
      title={isBookmarked ? 'Remove bookmark' : 'Save for later'}
      className={`inline-flex items-center justify-center rounded-lg transition-colors cursor-pointer shrink-0 ${
        isBookmarked ? 'text-accent-primary' : 'text-text-muted hover:text-accent-primary'
      } ${className}`}
    >
      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
    </button>
  )
}
