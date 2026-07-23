import { Link, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { getRouteMeta } from '../../routeMeta'
import { getBreadcrumbTrail } from '../../lib/seo/breadcrumbs'

export default function BreadcrumbNav() {
  const location = useLocation()
  const pageMeta = getRouteMeta(location.pathname)
  const trail = getBreadcrumbTrail(location.pathname, pageMeta.title)

  if (trail.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm">
      <ol className="flex flex-wrap items-center gap-1.5 text-text-secondary">
        {trail.map((segment, i) => {
          const isLast = i === trail.length - 1
          return (
            <li key={segment.path} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />}
              {isLast ? (
                <span className="text-text-primary font-medium" aria-current="page">{segment.name}</span>
              ) : (
                <Link to={segment.path} className="hover:text-accent-primary transition-colors">
                  {segment.name}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
